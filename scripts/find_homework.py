from pathlib import Path
import urllib.request, json, re, html as html_module
root = Path(__file__).resolve().parents[1]
records = []
for i in range(9):
    url=f'https://games-cn.org/forums/topic/graphics-intro-hw{i}/'
    try:
        html=urllib.request.urlopen(url, timeout=60).read()
        decoded=html.decode('utf-8')
        replies=re.findall(r'<div class="bbp-reply-content">(.*?)</div>',decoded,re.S)
        article='\n'.join(replies) if replies else decoded
        links=[dict(text=re.sub('<[^>]+>','',text),url=html_module.unescape(href)) for href,text in re.findall(r'<a[^>]+href=[\"\x27]([^\"\x27]+)[\"\x27][^>]*>(.*?)</a>',article,re.S)]
        rec=dict(id=i,url=url,text=html_module.unescape(re.sub('<[^>]+>','',article)),links=links)
        records.append(rec)
        print(json.dumps(rec,ensure_ascii=False),flush=True)
    except Exception as e:
        print(i,str(e),flush=True)
(root/'research'/'homework-links.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
