"""Vendor the pinned, Apache-2.0 browser compiler and record provenance."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import urllib.request, hashlib, json
root = Path(__file__).resolve().parents[1]
target = root / 'public' / 'compiler'
target.mkdir(parents=True, exist_ok=True)
revision = '648c4a89997a351eef75cdaec3ef5b89d4937dec'
def fetch(name):
    url = f'https://raw.githubusercontent.com/binji/wasm-clang/{revision}/{name}'
    path = target / name
    if not path.exists():
        with urllib.request.urlopen(url, timeout=180) as response:
            data = response.read()
        path.write_bytes(data)
    data = path.read_bytes()
    print(f'{name}: {len(data)} bytes', flush=True)
    return dict(file=name, url=url, sha256=hashlib.sha256(data).hexdigest(), bytes=len(data))
with ThreadPoolExecutor(max_workers=3) as pool:
    records = list(pool.map(fetch, ['clang', 'lld', 'memfs', 'sysroot.tar', 'LICENSE', 'LICENSE.llvm']))
(target / 'provenance.json').write_text(json.dumps(dict(revision=revision, files=records), indent=2), encoding='utf-8')
