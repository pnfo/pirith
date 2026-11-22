"""
Word-level alignment of the chanted Pali with the audio.

    dev/align/.venv/bin/python dev/align/align.py 58 21            # some piriths (number prefix of the id)
    dev/align/.venv/bin/python dev/align/align.py all              # every pirith that has labels
    dev/align/.venv/bin/python dev/align/align.py 58 --speaker ariyadhamma
    dev/align/.venv/bin/python dev/align/align.py 28 --full           # no labels yet: make them from the audio

Needs `npm run data-gen` to have been run (it reads the roman Pali from public/data/text) and ffmpeg.
Setup once:  cd dev/align && uv venv .venv --python 3.13 && uv pip install --python .venv/bin/python torch torchaudio numpy

HOW IT WORKS
  The hand-made labels (dev/data/timing/<speaker>/N-labels.txt) give the start and end of every
  group. Inside each group window the words are aligned to the audio with the multilingual MMS
  forced-alignment model (wav2vec2 + CTC, works on romanised text of any language). Because every
  group is aligned on its own, a mistake can never spread beyond one group.

  --full is for a recording that has text but no labels. The whole text is walked through the audio
  in two-minute steps, which gives the word times AND writes the N-labels.txt file (group start/end).
  Passages where the chanted words differ from the text show up as low confidence in the report.

OUTPUT
  dev/data/timing/<speaker>/N-words.json   [[ [[start, end] per word] per row ] per group ]  seconds
  dev/align/report/<id>.txt                confidence per group; low ones are worth a listen
  Then run `npm run data-gen` to publish the word times.
"""
import argparse, json, re, subprocess, sys, unicodedata
from pathlib import Path

import numpy as np
import torch
import torchaudio
import torchaudio.functional as F

ROOT = Path(__file__).resolve().parents[2]
SR = 16000
PAD = 0.25          # seconds of audio added on both sides of a group window
LOW = 0.30          # mean word confidence under this -> group is flagged in the report

bundle = torchaudio.pipelines.MMS_FA
_model = None
DICT = bundle.get_dict(star=None)


def model():
    global _model
    if _model is None:
        _model = bundle.get_model(with_star=False).eval()
    return _model


def romanize(word):
    """roman Pali with diacritics -> the a-z alphabet of the model ('saññā' -> 'sanna'). '' for numbers/punctuation"""
    w = unicodedata.normalize('NFD', word.lower())
    w = ''.join(c for c in w if not unicodedata.combining(c))
    return re.sub(r'[^a-z]', '', w)


def load_audio(path):
    raw = subprocess.run(
        ['ffmpeg', '-v', 'error', '-i', str(path), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'],
        check=True, capture_output=True).stdout
    return torch.from_numpy(np.frombuffer(raw, dtype=np.float32).copy())


def align_window(wave, words):
    """wave: 1d tensor. words: list of a-z strings (non-empty). -> [(start_s, end_s, score)] relative to wave"""
    with torch.inference_mode():
        emission, _ = model()(wave.unsqueeze(0))
    tokens = [DICT[c] for w in words for c in w]
    frames = emission.shape[1]
    if frames < len(tokens) + 2:
        return None
    aligned, scores = F.forced_align(emission, torch.tensor([tokens], dtype=torch.int32), blank=0)
    spans = F.merge_tokens(aligned[0], scores[0].exp())
    sec = wave.shape[0] / frames / SR
    out, i = [], 0
    for w in words:
        ws = spans[i:i + len(w)]
        i += len(w)
        length = sum(s.end - s.start for s in ws)
        score = sum(s.score * (s.end - s.start) for s in ws) / max(length, 1)
        out.append((ws[0].start * sec, ws[-1].end * sec, float(score)))
    return out


_star_model = None


def emissions_full(wave):
    """log-probabilities for the whole recording (with the extra 'anything' star column) + seconds per frame"""
    global _star_model
    if _star_model is None:
        _star_model = bundle.get_model(with_star=True).eval()
    chunk = 30 * SR
    parts = []
    with torch.inference_mode():
        for a in range(0, wave.shape[0], chunk):
            piece = wave[a:a + chunk]
            if piece.shape[0] < 400:
                break
            em, _ = _star_model(piece.unsqueeze(0))
            parts.append(em[0])
    em = torch.cat(parts)
    return em, wave.shape[0] / SR / em.shape[0]


def align_full(pid, speaker, window=120.0, check=False):
    """text without labels: walk the words through the audio window by window"""
    n = int(pid.split('-')[0])
    tdir = ROOT / 'dev/data/timing' / speaker
    audio_file = ROOT / 'public/audio' / speaker / f'{pid}.m4a'
    text_file = ROOT / 'public/data/text' / f'{pid}.en.json'
    if not text_file.exists():
        print(f'{pid}: no text (run npm run data-gen after adding dev/data/{n}-combi.txt) - skipped')
        return
    groups = json.loads(text_file.read_text())['groups']
    wave = load_audio(audio_file)
    total = wave.shape[0] / SR
    em, sec = emissions_full(wave)
    star = em.shape[1] - 1

    # every word with its place in the text
    words = []  # [g, r, w, letters]
    for g, rows in enumerate(groups):
        for r, row in enumerate(rows):
            for w, word in enumerate(row[0].split()):
                words.append([g, r, w, romanize(word)])
    speak = [i for i, x in enumerate(words) if x[3]]
    times = {}  # word index -> (start, end, score)

    rate = len(speak) / total          # words per second, refined as we go
    pos, k = 0.0, 0                    # audio position (s), next word (index into speak)
    while k < len(speak) and pos < total - 1:
        f0, f1 = int(pos / sec), min(int((pos + window) / sec), em.shape[0])
        last_window = f1 >= em.shape[0]
        # fewer words than the window can hold; the star at the end soaks up the rest of the audio
        take = len(speak) - k if last_window else max(8, int(rate * (f1 - f0) * sec * 0.6))
        batch = speak[k:k + take]
        tokens = ([star] if k == 0 else []) + [DICT[c] for i in batch for c in words[i][3]] + [star]
        if f1 - f0 < len(tokens) + 2:
            break
        aligned, scores = F.forced_align(em[f0:f1].unsqueeze(0), torch.tensor([tokens], dtype=torch.int32), blank=0)
        spans = [s for s in F.merge_tokens(aligned[0], scores[0].exp()) if s.token != star]
        j, got = 0, []
        for i in batch:
            ws = spans[j:j + len(words[i][3])]
            j += len(words[i][3])
            length = sum(s.end - s.start for s in ws)
            score = sum(s.score * (s.end - s.start) for s in ws) / max(length, 1)
            got.append((i, (f0 + ws[0].start) * sec, (f0 + ws[-1].end) * sec, float(score)))
        # the last few words sit next to the star and can be dragged: redo them in the next window
        keep = got if (last_window or k + take >= len(speak)) else got[:max(1, len(got) - 4)]
        for i, s, e, sc in keep:
            times[i] = (s, e, sc)
        k += len(keep)
        new_pos = keep[-1][2]
        if k > 20:
            rate = k / max(new_pos, 1.0)
        pos = new_pos if new_pos > pos else pos + window / 2

    # words that could not be placed (text beyond the end of the audio) and unpronounced tokens take the neighbour's time
    result = [[[None] * len(row[0].split()) for row in rows] for rows in groups]
    prev = 0.0
    for i, (g, r, w, _) in enumerate(words):
        if i in times:
            s, e, _sc = times[i]
            result[g][r][w] = [round(max(s, prev), 3), round(max(e, prev), 3)]
        else:
            result[g][r][w] = [round(prev, 3), round(prev, 3)]
        prev = result[g][r][w][1]

    # group labels: from its first word to the first word of the next group
    starts = [rows[0][0][0] for rows in result]
    labels, report, low = [], [], 0
    conf = {}
    for i, (s, e, sc) in times.items():
        conf.setdefault(words[i][0], []).append(sc)
    for g, rows in enumerate(result):
        gs = starts[g] if g else 0.0
        ge = starts[g + 1] if g + 1 < len(result) else min(total, rows[-1][-1][1] + 1.0)
        ge = max(ge, gs + 0.01)
        labels.append((gs, ge))
        c = float(np.mean(conf[g])) if g in conf else 0.0
        flag = c < LOW
        low += flag
        report.append(f'{"LOW " if flag else "    "}group {g + 1:3d}  {gs:8.2f}-{ge:8.2f}  conf {c:.2f}  {groups[g][0][0][:50]}')

    if check:  # compare with the hand-made labels instead of writing anything
        hand = [[float(x) for x in line.split('\t')[:2]] for line in (tdir / f'{n}-labels.txt').read_text().splitlines() if line.strip()]
        diffs = [abs(a[0] - b[0]) for a, b in zip(labels[1:], hand[1:])]
        print(f'{pid}: CHECK against hand labels - group starts differ by median {np.median(diffs):.2f}s, 90% under {np.percentile(diffs, 90):.2f}s, max {max(diffs):.2f}s; words placed {len(times) / max(len(speak), 1):.0%}')
        return
    tdir.mkdir(parents=True, exist_ok=True)
    (tdir / f'{n}-labels.txt').write_text(''.join(f'{s:.3f}\t{e:.3f}\t{g + 1}\n' for g, (s, e) in enumerate(labels)))
    (tdir / f'{n}-words.json').write_text(json.dumps(result, separators=(',', ':')))
    rdir = ROOT / 'dev/align/report'
    rdir.mkdir(exist_ok=True)
    placed = len(times) / max(len(speak), 1)
    mean = float(np.mean([t[2] for t in times.values()])) if times else 0.0
    head = (f'{pid} ({speaker})  FULL alignment (labels made from the audio)\n'
            f'audio {total:.0f}s, text ends at {prev:.0f}s, words placed {placed:.0%}, mean confidence {mean:.2f}, low groups {low}/{len(groups)}\n')
    (rdir / f'{pid}.txt').write_text(head + '\n'.join(report) + '\n')
    print(head.strip())


def align_pirith(pid, speaker):
    n = int(pid.split('-')[0])
    tdir = ROOT / 'dev/data/timing' / speaker
    labels_file = tdir / f'{n}-labels.txt'
    audio_file = ROOT / 'public/audio' / speaker / f'{pid}.m4a'
    timing_json = ROOT / 'public/data/timing' / speaker / f'{pid}.json'
    if not labels_file.exists() or not timing_json.exists():
        print(f'{pid}: no labels for {speaker} - skipped')
        return None
    text_name = json.loads(timing_json.read_text())['text']
    groups = json.loads((ROOT / 'public/data/text' / f'{text_name}.en.json').read_text())['groups']
    labels = [[float(x) for x in line.split('\t')[:2]] for line in labels_file.read_text().splitlines() if line.strip()]
    if len(labels) != len(groups):
        print(f'{pid}: {len(labels)} labels but {len(groups)} groups - fix the labels first, skipped')
        return None

    wave = load_audio(audio_file)
    total = wave.shape[0] / SR
    result, report, scores_all, low = [], [], [], 0

    for g, (rows, (gs, ge)) in enumerate(zip(groups, labels)):
        row_words = [row[0].split() for row in rows]
        flat = [(r, w, romanize(word)) for r, ws in enumerate(row_words) for w, word in enumerate(ws)]
        speakable = [x for x in flat if x[2]]
        a, b = max(0.0, gs - PAD), min(total, ge + PAD)
        times = align_window(wave[int(a * SR):int(b * SR)], [x[2] for x in speakable]) if speakable else None

        out = [[None] * len(ws) for ws in row_words]
        if times:
            for (r, w, _), (s, e, sc) in zip(speakable, times):
                out[r][w] = [round(min(max(a + s, gs), ge), 3), round(min(max(a + e, gs), ge), 3)]
            gscore = float(np.mean([t[2] for t in times]))
        else:
            gscore = 0.0
        # words with nothing to pronounce (numbers, brackets) and failed groups: spread evenly / take the neighbour
        if not times:
            count = max(len(flat), 1)
            for i, (r, w, _) in enumerate(flat):
                out[r][w] = [round(gs + (ge - gs) * i / count, 3), round(gs + (ge - gs) * (i + 1) / count, 3)]
        else:
            prev = gs
            for r, w, _ in flat:
                if out[r][w] is None:
                    out[r][w] = [prev, prev]
                prev = out[r][w][1]
        result.append(out)
        scores_all.append(gscore)
        flag = gscore < LOW
        low += flag
        first = ' '.join(row_words[0])[:50] if row_words else ''
        report.append(f'{"LOW " if flag else "    "}group {g + 1:3d}  {gs:8.2f}-{ge:8.2f}  conf {gscore:.2f}  {first}')

    (tdir / f'{n}-words.json').write_text(json.dumps(result, separators=(',', ':')))
    rdir = ROOT / 'dev/align/report'
    rdir.mkdir(exist_ok=True)
    mean = float(np.mean(scores_all))
    (rdir / f'{pid}.txt').write_text(f'{pid} ({speaker})  mean confidence {mean:.2f}  low groups {low}/{len(groups)}\n' + '\n'.join(report) + '\n')
    print(f'{pid}: {len(groups)} groups, mean confidence {mean:.2f}, low {low}')
    return mean, low, len(groups)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('piriths', nargs='+', help='number prefixes (58 21 ...) or "all"')
    ap.add_argument('--speaker', default='ariyadhamma')
    ap.add_argument('--check', action='store_true', help='with --full: write nothing, compare the result with the existing labels')
    ap.add_argument('--full', action='store_true', help='no labels yet: derive them (and the word times) from the audio')
    args = ap.parse_args()

    manifest = json.loads((ROOT / 'src/generated/manifest.json').read_text())
    ids = list(manifest.keys())
    if args.piriths != ['all']:
        want = {int(x) for x in args.piriths}
        ids = [i for i in ids if int(i.split('-')[0]) in want]
    if not ids:
        sys.exit('no matching pirith')
    torch.set_num_threads(max(1, torch.get_num_threads()))
    for pid in ids:
        if args.full:
            align_full(pid, args.speaker, check=args.check)
        else:
            align_pirith(pid, args.speaker)
    print('done. run `npm run data-gen` to publish the word times.')


if __name__ == '__main__':
    main()
