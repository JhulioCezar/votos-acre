"""Reproduce a TSE proportional totalization; never change the official dashboard result."""
import json,datetime
from fractions import Fraction
def age_key(c):
    return datetime.datetime.strptime(c['dt'],'%d/%m/%Y').date().toordinal()
def calculate(data,validate_numbers=()):
    office=data['carg'][0];groups={};awards=[]
    for agr in office['agr']:
        for p in agr['par']:
            key=p['nfed'] or p['n'];g=groups.setdefault(key,{'id':key,'name':next((f['sg'] for f in office['fed'] if f['n']==key),p['sg']),'votes':0,'nominal':0,'legend':0,'cs':[],'seats':0,'initialSeats':0})
            g['votes']+=int(p['tval']);g['legend']+=int(p['tval'])
            for c in p['cand']:
                if c['dvt']=='Válido' or c['n'] in validate_numbers:
                    g['votes']+=int(c['vap']);g['nominal']+=int(c['vap']);g['cs'].append(dict(c,party=p['sg']))
    for g in groups.values():g['cs'].sort(key=lambda c:(-int(c['vap']),age_key(c)))
    valid=sum(g['votes'] for g in groups.values());n=int(office['nv']);qe=valid//n+int(valid%n>n/2);winners=[];rounds=[]
    for g in groups.values():
        g['qp']=g['votes']//qe
        elected=[c for c in g['cs'] if int(c['vap'])*10>=qe][:g['qp']]
        g['seats']=g['initialSeats']=len(elected)
        for c in elected:
            winners.append(c['n']);awards.append({'number':c['n'],'name':c['nmu'],'party':c['party'],'group':g['name'],'votes':int(c['vap']),'phase':'Quociente partidário','minimum':qe*.1,'round':None,'average':None})
    while len(winners)<n:
        eligible=[g for g in groups.values() if g['votes']*10>=qe*8 and len(g['cs'])>g['seats'] and int(g['cs'][g['seats']]['vap'])*5>=qe]
        phase='Sobras 80/20'
        if not eligible:eligible=[g for g in groups.values() if len(g['cs'])>g['seats']];phase='Sobras remanescentes'
        if not eligible:raise ValueError('Não há candidatos suficientes')
        def denominator(g):return max(g['qp'],g['initialSeats'])+(g['seats']-g['initialSeats'])+1
        order=sorted(eligible,key=lambda g:(Fraction(g['votes'],denominator(g)),g['votes'],int(g['cs'][g['seats']]['vap']),-age_key(g['cs'][g['seats']])),reverse=True)
        g=order[0];c=g['cs'][g['seats']];den=denominator(g);average=Fraction(g['votes'],den)
        rounds.append({'phase':phase,'candidate':c['n'],'name':c['nmu'],'group':g['name'],'average':float(average),'denominator':den,'votes':g['votes'],'competitors':[{'group':x['name'],'votes':x['votes'],'denominator':denominator(x),'average':float(Fraction(x['votes'],denominator(x)))} for x in order]})
        winners.append(c['n']);awards.append({'number':c['n'],'name':c['nmu'],'party':c['party'],'group':g['name'],'votes':int(c['vap']),'phase':phase,'minimum':qe*.2 if phase=='Sobras 80/20' else 0,'round':len(rounds),'average':float(average)})
        g['seats']+=1
    return {'valid':valid,'qe':qe,'vacancies':n,'groups':[{k:v for k,v in g.items() if k!='cs'} for g in groups.values()],'winners':winners,'awards':awards,'rounds':rounds}
def verified_base(data):
    r=calculate(data);official=[c['n'] for a in data['carg'][0]['agr'] for p in a['par'] for c in p['cand'] if c['e']=='s']
    assert set(r['winners'])==set(official),'A reprodução não coincide com os eleitos oficiais'
    assert r['qe']==int(data['carg'][0]['qe']),'QE divergente'
    assert r['valid']==int(data['v']['vv']),'Votos válidos divergentes'
    return r
