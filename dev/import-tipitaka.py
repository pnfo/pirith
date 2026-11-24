"""
A sutta of tipitaka.lk with its chanting -> dev/data/N-combi.txt and dev/data/timing/<speaker>/N-labels.txt.

    python3 dev/import-tipitaka.py 67 dn-2-7 dn-2-9 metthananda

    67        number prefix of the pirith id
    dn-2-7    text file of tipitaka.lk that has the sutta (db/text.db, table entry)
    dn-2-9    label file of the recording (bjt-audio/labels/<label>.json; the audio is audio/<label>.m4a)

Every chanted paragraph becomes a group of one row: the Pali of the Buddha Jayanti text = its Sinhala translation.
The paragraphs are matched to the label entries by the hash of the Pali text (audio_ph), so a text that was edited
after the timing file was made is reported instead of going out of step.

NOTE for 67 (Maha Satipatthana): this was only the starting point. Its combi and trans files were then cut into
short phrases by hand (Sinhala after the text-apz translation), and its labels come from dev/satipatthana-audio.py.
Running this again for 67 would overwrite that work. Paragraph numbers, bold marks and
footnote marks are removed. Then: node dev/long-vowels.js on the combi file, dev/align for the word times.
"""
import json, re, sqlite3, sys
from pathlib import Path

num, text_file, label, speaker = sys.argv[1:5]
ROOT = Path(__file__).resolve().parents[1]
TIPITAKA = Path('/Volumes/2TB/node/tipitaka.lk/db/text.db')
LABELS = Path('/Volumes/2TB/node/misc-ai/bjt-audio/labels')

def clean(t):
    t = re.sub(r'\{\d+\}|\*\*|\*|__', '', t or '')
    t = re.sub(r'^\s*\d+\.\s*', '', t)                 # paragraph number
    return re.sub(r'\s+', ' ', t.replace('=', '-')).strip()

entries = json.loads((LABELS / f'{label}.json').read_text())['entries']
db = sqlite3.connect(TIPITAKA)
rows = db.execute('select audio_ph, p_text, s_text from entry e join file f on f.id = e.file_id where f.name = ? and audio_idx is not null order by audio_idx', (text_file,)).fetchall()
by_ph = {}
for ph, p, s in rows: by_ph.setdefault(ph, []).append((p, s))

groups, labels, missing = [], [], 0
for e in entries:
    if not by_ph.get(e['ph']): missing += 1; continue
    p, s = by_ph[e['ph']].pop(0) if len(by_ph[e['ph']]) > 1 else by_ph[e['ph']][0]
    pali = re.sub('්([රය])', '්\u200d\\1', clean(p))     # the text is typed without the joiner of rakaransaya / yansaya
    groups.append(f'{pali} = {clean(s)}')
    labels.append(f"{e['s'] / 100:.3f}\t{e['e'] / 100:.3f}\t{len(groups)}")
if missing: print(f'{missing} label entries have no text with the same hash - left out')

(ROOT / f'dev/data/{num}-combi.txt').write_text('\n\n'.join(groups) + '\n')
out = ROOT / f'dev/data/timing/{speaker}'
out.mkdir(parents=True, exist_ok=True)
(out / f'{num}-labels.txt').write_text('\n'.join(labels) + '\n')
print(f'{len(groups)} groups -> dev/data/{num}-combi.txt, dev/data/timing/{speaker}/{num}-labels.txt')
