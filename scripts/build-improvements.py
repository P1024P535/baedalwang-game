"""Build authorized improvements while retaining the original 495-file baseline."""
from pathlib import Path
import hashlib, json, shutil

ROOT = Path(__file__).resolve().parents[1]

def build(dest):
    source = (ROOT / 'index.html').read_text()
    replacements = [
        ("return S.noAds?cap:Math.max(0,cap-(adDay()[k]||0))", "return Math.max(0,cap-(adDay()[k]||0))"),
        ("if(!S.noAds)adDay()[k]=(adDay()[k]||0)+1", "adDay()[k]=(adDay()[k]||0)+1"),
        ("closeModal();adUse(ak);adThen(()=>{", "closeModal();limitedAd(ak,5,()=>{"),
        ("if(!adLeft('w',3))return;adUse('w');adThen(()=>{", "limitedAd('w',3,()=>{"),
        ("if(!adLeft('f',3))return;adUse('f');adThen(()=>{", "limitedAd('f',3,()=>{"),
        ("if(!adLeft('m',2))return;adUse('m');const fp=famePack();adThen(()=>{", "const fp=famePack();limitedAd('m',2,()=>{"),
        ("baseIps()*sec*offRate()*(Date.now()<S.boostUntil?2:1)", "offlineEarnings(Date.now())"),
        ("baseIps()*Math.min(el,offMaxH()*3600)*offRate()*(now<S.boostUntil?2:1)", "offlineEarnings(now)"),
        ("MI.forEach(m=>{const p=", "dailyMissions().forEach(m=>{const p="),
        ("if(a==='mis'){const k=b.dataset.k;S.mis.done.push(k);", "if(a==='mis'){const k=b.dataset.k,m=dailyMissions().find(x=>x[0]===k);checkDay();if(!m||S.mis.done.includes(k)||(S.mis.p[k]||0)<m[2])return;S.mis.done.push(k);"),
        ("if(a==='misall'){S.mis.all=true;", "if(a==='misall'){checkDay();if(S.mis.all||!dailyMissions().every(m=>S.mis.done.includes(m[0])))return;S.mis.all=true;"),
        ("const keep={fame:S.fame,", "const keep={chapter:S.chapter,fame:S.fame,"),
        ("v1.0</div>", "v1.0.6</div>"),
        ("Version: ${APP_VER}", "Version: 1.0.6 (save protocol ${APP_VER})"),
        ("${L('버전','Version')} ${APP_VER}", "${L('버전','Version')} 1.0.6"),
        ("R0[i]*Math.pow(3,i)*Math.pow(3,S.clears||0)", "R0[i]*([1,1,1,1,1,.5,.8,.9,1][i])*Math.pow(3,i)*Math.pow(3,S.clears||0)"),
        ("물가와 수익이 모두 x${fmt(Math.pow(3,S.region))}<br>지역 보너스 +${S.region*15}% · 명성으로 강화하세요!", "물가와 수익이 모두 x${fmt(Math.pow(3,S.region))}<br>지역 보너스 +${S.region*15}% · 명성으로 강화하세요!<br><br>${CHAPTERS[S.region][1]}<br>${CHAPTERS[S.region][2]}<br><small>이사 화면에서 이번 지역 이야기와 중간 배달 보상을 확인하세요.</small>"),
        ("영구 수익 x${1+S.clears} · 명성 +${gg}<br><br>", "영구 수익 x${1+S.clears} · 명성 +${gg}<br><br>단골 할머니: ‘네가 전한 소식이 여기까지 닿았구나.’<br>번개맨: ‘이번 배달은 네가 왕이다!’<br>첫 직원: ‘다음 길도 함께해요, 사장님.’<br><br>누적 수익 ${won(S.total)} · 배달 ${fmt(S.st.del)}건<br><br>"),
    ]
    for old,new in replacements:
        if old==new: continue
        assert source.count(old)==1, (old,source.count(old))
        source=source.replace(old,new,1)
    # Fair event clocks: update at the exact menu/visibility boundary, before any
    # state transition, and at every tick. Passive income continues in menus.
    for old,new in [
        ('function openSheet(t){','function openSheet(t){syncChallenges();'),
        ('function closeSheet(){','function closeSheet(){syncChallenges();'),
        ('function showModal(ic,t,p,btns){','function showModal(ic,t,p,btns){syncChallenges();'),
        ('function closeModal(){','function closeModal(){syncChallenges();'),
        ('function hud3(){','function hud3(){syncChallenges();'),
        ('function raceHud(dt){if(!race)return;', 'function raceHud(dt){syncChallenges();if(!race||challengePaused())return;'),
        ('function tickEvent(){','function tickEvent(){syncChallenges();if(challengePaused())return;'),
        ('T+=dt;DT=dt;raceHud(dt);','T+=dt;DT=dt;syncChallenges();raceHud(dt);'),
        ("if(boss&&!auto)bossTap();", "if(boss&&!auto&&!challengePaused())bossTap();"),
        ("if(!auto){troubleTap();raceTap();twAdd(1)}", "if(!auto){if(!challengePaused()){troubleTap();raceTap();}twAdd(1)}"),
    ]:
        assert source.count(old)==1, old
        source=source.replace(old,new,1)
    extra=(ROOT/'improvements/gameplay.js').read_text()
    source=source.replace('// ====== START ======',extra+'\n// ====== START ======',1)
    css=(ROOT/'android/app/src/main/res/raw/layout.css').read_text()+'\n'+(ROOT/'improvements/gameplay.css').read_text()
    source=source.replace('</head>','<style>'+css+'</style></head>',1)
    # Apply the established layout adapter to portable preview as well as Android.
    bridge=(ROOT/'android/app/src/main/res/raw/layout_bridge.js').read_text()
    source=source.replace('requestAnimationFrame(frame);\nrkInit();',bridge+'\nrequestAnimationFrame(frame);\nrkInit();',1)
    dest.mkdir(parents=True,exist_ok=True)
    (dest/'index.html').write_text(source)
    for p in (ROOT/'improvements/icons').glob('*.png'):
        shutil.copyfile(p,dest/'assets'/p.name)
    audit={'version':'1.0.6','saveKey':'baedal_king_v1','saveVersion':2,'baselineUnchanged':True,'generatedIndexSha256':hashlib.sha256(source.encode()).hexdigest(),'replacementIcons':[p.name for p in (ROOT/'improvements/icons').glob('*.png')]}
    (ROOT/'out/improvement-audit.json').write_text(json.dumps(audit,indent=2))
    return audit

if __name__=='__main__':
    print(json.dumps(build(ROOT/'android/app/src/main/assets')))
