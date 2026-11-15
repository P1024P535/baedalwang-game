from pathlib import Path
import hashlib,json,zipfile,subprocess,re
root=Path(__file__).resolve().parents[1];out=root/'out'
m=json.loads((root/'original-manifest.json').read_text())
apk=out/'baedalwang-claude-final-1.0.3.apk';aab=out/'baedalwang-claude-final-1.0.3.aab'
expected={f['path'] for f in m['files']};result={}
for p,prefix in [(apk,'assets/'),(aab,'base/assets/')]:
 with zipfile.ZipFile(p) as z:
  assert z.testzip() is None,p
  actual={n[len(prefix):] for n in z.namelist() if n.startswith(prefix) and not n.endswith('/')}
  generated=actual-expected
  assert generated <= {'dexopt/baseline.prof','dexopt/baseline.profm'},(p,generated)
  assert expected<=actual,(p,expected-actual)
  for f in m['files']:assert hashlib.sha256(z.read(prefix+f['path'])).hexdigest()==f['sha256'],f['path']
 result[p.suffix]={'filesVerified':len(expected),'androidGeneratedAssets':sorted(generated),'changedFiles':0,'size':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
def cert(p):
 text=subprocess.check_output(['keytool','-J-Duser.language=en','-printcert','-jarfile',str(p)],text=True)
 match=re.search(r'SHA256:\s*([A-Fa-f0-9:]+)',text);assert match, text
 return match.group(1).replace(':','').lower()
current=cert(aab)
previous=list((out/'previous-aab').rglob('*.aab'));assert previous,'Prior signed AAB is required to compare certificates'
assert cert(previous[0])==current,'Upload signing certificate changed'
result['signingCertificateSha256']=current;result['sameSignerAsPriorClaudeAab']=True
(out/'artifact-verification.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result,indent=2))
