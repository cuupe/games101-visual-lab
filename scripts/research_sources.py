from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.request import urlopen, Request
from pypdf import PdfReader
import json, re, hashlib

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'research'
OUT.mkdir(exist_ok=True)
BASE = 'https://sites.cs.ucsb.edu/~lingqi/teaching/'

def fetch(url, path):
    if not path.exists():
        with urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=90) as r:
            path.write_bytes(r.read())
    return path

def lecture(n):
    name = f'GAMES101_Lecture_{n:02d}.pdf'
    path = fetch(BASE + 'resources/' + name, OUT / name)
    pages = []
    for i, page in enumerate(PdfReader(path).pages):
        text = page.extract_text() or ''
        pages.append({'page': i+1, 'text': text})
    (OUT / f'lecture-{n:02d}.json').write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding='utf-8')
    outline = '\n'.join(f"{p['page']:03d} | " + ' / '.join([s.strip() for s in p['text'].splitlines() if s.strip()][:3]) for p in pages)
    (OUT / f'outline-{n:02d}.txt').write_text(outline, encoding='utf-8')
    return {'id': n, 'pages': len(pages), 'bytes': path.stat().st_size, 'url': BASE+'resources/'+name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}

if __name__ == '__main__':
    results=[]
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures={pool.submit(lecture, n):n for n in range(1,23)}
        for f in as_completed(futures):
            try:
                result=f.result();results.append(result);print(json.dumps(result),flush=True)
            except Exception as e:
                print(json.dumps({'id':futures[f], 'error':str(e)}),flush=True)
    (OUT / 'sources.json').write_text(json.dumps(sorted(results,key=lambda r:r['id']), indent=2), encoding='utf-8')
