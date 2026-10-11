from pathlib import Path
from urllib.request import urlopen
from urllib.parse import quote
import re,json,zipfile,io,hashlib
root=Path(__file__).resolve().parents[1]
# Eigen's official repository, pinned to the released 3.3.7 tag.
url='https://gitlab.com/libeigen/eigen/-/archive/3.3.7/eigen-3.3.7.zip'
path=root/'research'/'eigen-3.3.7.zip'
if not path.exists(): path.write_bytes(urlopen(url,timeout=120).read())
files=[]
z=zipfile.ZipFile(path)
for name in z.namelist():
    rel='/'.join(name.split('/')[1:])
    if name.endswith('/') or not (rel.startswith('Eigen/') or rel.startswith('COPYING')): continue
    files.append(dict(path='eigen3/'+rel,content=z.read(name).decode('utf-8')))
(root/'public'/'compiler'/'eigen.json').write_text(json.dumps(dict(version='3.3.7',source=url,sha256=hashlib.sha256(path.read_bytes()).hexdigest(),files=files)),encoding='utf-8')
print('Eigen',len(files),'files',flush=True)
post='https://games-cn.org/forums/topic/'+quote('作业3更正公告')+'/'
html=urlopen(post,timeout=60).read().decode('utf-8')
links=re.findall(r'href=[\"\x27]([^\"\x27]+)',html)
candidates=[u.replace('&amp;','&').replace('http://','https://',1) for u in links if 'Hw3.zip' in u or '324634252f4a47578062' in u]
try:
    index=urlopen('https://games-cn.org/wp-content/uploads/2020/03/',timeout=60).read().decode('utf-8')
    extra=[u for u in re.findall(r'href="([^"]+)"',index) if re.search(r'(hw3|assignment3|pa3)',u,re.I)]
    print('Official index candidates:',extra,flush=True)
    candidates += ['https://games-cn.org/wp-content/uploads/2020/03/'+quote(u) for u in extra if u.endswith('.zip')]
except Exception as e: print(str(e),flush=True)
for url in candidates:
    try:
        blob=urlopen(url,timeout=60).read()
        archive=zipfile.ZipFile(io.BytesIO(blob))
        (root/'research'/'hw3.zip').write_bytes(blob)
        out=[]
        for name in archive.namelist():
            if '__MACOSX' in name or '/build/' in name or not name.endswith(('.cpp','.hpp','.h','.obj','.mtl','.txt')):continue
            data=archive.read(name)
            out.append(dict(path=name,content=data.decode('utf-8',errors='replace'),sha256=hashlib.sha256(data).hexdigest()))
        (root/'public'/'homework'/'official-3.json').write_text(json.dumps(dict(id=3,post=post,archive=url,sha256=hashlib.sha256(blob).hexdigest(),files=out),ensure_ascii=False),encoding='utf-8')
        print('HW3',len(blob),len(out),'files',flush=True)
        break
    except Exception as e: print('HW3 source failed:',url[:90],str(e),flush=True)
