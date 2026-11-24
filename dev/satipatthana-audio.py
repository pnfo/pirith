"""
The recording of the Maha Satipatthana Sutta (67) with shorter pauses between the paragraphs.

    dev/align/.venv/bin/python dev/satipatthana-audio.py

The recording of tipitaka.lk (bjt-audio label dn-2-9) has about 3.2 s of added silence after every chanted
paragraph. This cuts each pause to GAP seconds from the lossless master, raises the level to that of the other
chants, and writes public/audio/metthananda/67-maha-satipatthana-suttam.m4a and the labels of the new timeline
(dev/data/timing/metthananda/67-labels.txt, one line per paragraph). Run dev/align afterwards for the word times.
"""
import json, subprocess
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
MASTER = '/Volumes/2TB/audio/silence-added/dn-2-9.flac'
LABELS = '/Volumes/2TB/node/misc-ai/bjt-audio/labels/dn-2-9.json'
OUT = ROOT / 'public/audio/metthananda/67-maha-satipatthana-suttam.m4a'
SR, GAP, LEAD = 44100, 1.0, 0.4          # GAP: pause kept between two paragraphs; LEAD: of it, the part before the next one
GAIN_DB = 3.2                            # -17.7 LUFS -> about -14.5 like the other chants

entries = json.loads(Path(LABELS).read_text())['entries']
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', MASTER, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
audio = np.frombuffer(raw, dtype=np.int16)
parts, labels, t = [], [], 0.0
for i, e in enumerate(entries):
    s, end = e['s'] / 100, e['e'] / 100
    before = LEAD if i else min(LEAD, s)
    nxt = entries[i + 1]['s'] / 100 if i + 1 < len(entries) else len(audio) / SR
    after = min(GAP - LEAD, max(0.0, nxt - end - LEAD)) if i + 1 < len(entries) else min(1.0, nxt - end)
    a, b = int((s - before) * SR), int((end + after) * SR)
    parts.append(audio[a:b])
    labels.append(f'{t + before:.3f}\t{t + before + (end - s):.3f}\t{i + 1}')
    t += (b - a) / SR
tmp = ROOT / 'dev/align/report/67-tmp'
tmp.parent.mkdir(parents=True, exist_ok=True)
np.concatenate(parts).tofile(f'{tmp}.raw')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', f'{tmp}.raw',
                '-af', f'volume={GAIN_DB}dB,alimiter=limit=0.89:level=disabled', f'{tmp}.wav'], check=True)
subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aach', '-b', '24000', '-c', '1', f'{tmp}.wav', str(OUT)], check=True)
for ext in ('.raw', '.wav'): Path(f'{tmp}{ext}').unlink()
(ROOT / 'dev/data/timing/metthananda/67-labels.txt').write_text('\n'.join(labels) + '\n')
m, sec = divmod(round(t), 60)
print(f'{len(labels)} paragraphs, {m // 60}:{m % 60:02d}:{sec:02d}')
