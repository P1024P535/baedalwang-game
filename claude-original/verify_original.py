from pathlib import Path
import hashlib, json, sys
root=Path(__file__).parent
expected=json.loads((root/'original-checksums.json').read_text(encoding='utf-8'))
for name, sha in expected.items():
    p=root/'app/src/main/assets'/name
    if not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=sha:
        sys.exit('Original game mismatch: '+name)
print('Verified original files:',len(expected))
