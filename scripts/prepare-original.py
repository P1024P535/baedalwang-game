from pathlib import Path
import hashlib,json,shutil,re
root=Path(__file__).resolve().parents[1]
m=json.loads((root/'original-manifest.json').read_text())
expected={f['path'] for f in m['files']}
actual={'index.html'}|{p.relative_to(root).as_posix() for p in (root/'assets').rglob('*') if p.is_file()}
assert actual==expected, f'Unexpected/missing original paths: {actual^expected}'
assert len(expected)==495
out=root/'out';out.mkdir(exist_ok=True)
dest=root/'android/app/src/main/assets';shutil.rmtree(dest,ignore_errors=True)
for f in m['files']:
 p=root/f['path'];b=p.read_bytes();assert len(b)==f['size'];assert hashlib.sha256(b).hexdigest()==f['sha256'],f['path']
 q=dest/f['path'];q.parent.mkdir(parents=True,exist_ok=True);q.write_bytes(b)
icon=root/'android/app/src/main/res/drawable/ic_launcher.png';icon.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(root/'assets/app_icon.png',icon)
source=(root/'index.html').read_text()
missing=sorted(set(re.findall(r'assets/[A-Za-z0-9_.-]+\.(?:png|jpg|woff2)',source))-expected)
assert not missing,missing
report={'originalZip':m['name'],'originalZipSha256':m['sha256'],'filesVerified':len(expected),'changedFiles':0,'package':'com.ssokcompany.baedalwang','versionCode':2,'targetSdk':36,'saveKey':'baedal_king_v1','saveVersion':2,'gameFilesModified':False,'integrationBlockers':['Rewarded ads still test/mock; no production AdMob ID configured','Purchases still test/mock; no native billing plugin or verified products','Firebase web config empty; Google login/cloud/rankings not live'],'compatibility':['Prior Claude ver2 save uses same key/schema and file URL','Original ChatGPT main uses baedalwang-3d-simulation-only; retained, not converted','Prior debug APK may have a different signing certificate; never uninstall automatically']}
(out/'source-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
(out/'original-manifest.json').write_text(json.dumps(m,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False))
