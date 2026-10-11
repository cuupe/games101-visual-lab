from pathlib import Path, PurePosixPath
from concurrent.futures import ThreadPoolExecutor
import urllib.request, zipfile, io, json, hashlib
root=Path(__file__).resolve().parents[1]
records=json.loads((root/'research'/'homework-links.json').read_text(encoding='utf-8'))
def fetch(rec):
    urls=[a['url'].replace('http://','https://',1) for a in rec['links'] if 'games-cn.org/wp-content/uploads' in a['url'] and a['url'].lower().endswith('.zip')]
    if not urls: return None
    url=urls[0]
    path=root/'research'/f'hw{rec["id"]}.zip'
    if not path.exists():
        path.write_bytes(urllib.request.urlopen(url,timeout=120).read())
    data=path.read_bytes()
    files=[]
    archive=zipfile.ZipFile(io.BytesIO(data))
    for name in archive.namelist():
        p=PurePosixPath(name)
        if '__MACOSX' in p.parts or '..' in p.parts or p.is_absolute() or '/build/' in '/'+name.lower(): continue
        if p.suffix.lower() in ['.cpp','.cc','.c','.h','.hpp','.txt','.md','.obj','.mtl'] or p.name in ['CMakeLists.txt','LICENSE']:
            blob=archive.read(name)
            if len(blob)>8_000_000: continue
            try: content=blob.decode('utf-8')
            except UnicodeDecodeError: content=blob.decode('gb18030',errors='replace')
            files.append(dict(path=name,content=content,sha256=hashlib.sha256(blob).hexdigest()))
    out=dict(id=rec['id'],post=rec['url'],archive=url,sha256=hashlib.sha256(data).hexdigest(),files=files)
    target=root/'public'/'homework'
    target.mkdir(parents=True,exist_ok=True)
    (target/f'official-{rec["id"]}.json').write_text(json.dumps(out,ensure_ascii=False),encoding='utf-8')
    print(rec['id'],len(data),'bytes',len(files),'files',flush=True)
    return {k:v for k,v in out.items() if k!='files'}
with ThreadPoolExecutor(max_workers=3) as pool:
    results=list(pool.map(fetch,records))
(root/'public'/'homework'/'manifest.json').write_text(json.dumps([r for r in results if r],indent=2),encoding='utf-8')
