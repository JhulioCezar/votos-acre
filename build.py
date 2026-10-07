"""Build the standalone dashboard with Python's standard library."""
from pathlib import Path
import json
ROOT=Path(__file__).parent
data=json.loads((ROOT/'data.json').read_text(encoding='utf-8'))
data['seatDistributions']=json.loads((ROOT/'distribuicao-vagas.json').read_text(encoding='utf-8'))
data['judicialCases']=json.loads((ROOT/'situacoes-judiciais.json').read_text(encoding='utf-8'))['cases']
for distribution in data['seatDistributions']:
    result=distribution['base']
    official={c['numero'] for c in data['candidates'] if c['cargo']==distribution['cargo'] and c['situacao'].startswith('Eleito')}
    assert set(result['winners'])==official and len(result['winners'])==result['vacancies']
    assert sum(g['seats'] for g in result['groups'])==result['vacancies']
    assert result['valid']==int(next(o for o in data['offices'] if o['codigo']==distribution['cargo'])['estatisticas']['vv'])
assert len(data['rows'])==2270 and len(data['candidates'])==323
for candidate in data['candidates']:
    assert sum(r['votacao'].get(candidate['id'],0) for r in data['rows'])==candidate['total']
html=(ROOT/'src/index.html').read_text(encoding='utf-8')
for marker,value in [('CSS',(ROOT/'src/styles.css').read_text(encoding='utf-8')),('DATA',json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</',r'<\/')),('APP',(ROOT/'src/app.js').read_text(encoding='utf-8'))]:
    html=html.replace('/* INLINE_'+marker+' */',value)
(ROOT/'index.html').write_text(html,encoding='utf-8')
(ROOT/'.nojekyll').touch()
print('Verified 323 candidates and 2270 sections; built index.html.')
