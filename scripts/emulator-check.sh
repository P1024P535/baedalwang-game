#!/usr/bin/env bash
set -euo pipefail
mkdir -p out/emulator
adb install -r out/previous-claude.apk
adb install -r android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk
run_test() {
 local method="$1"
 adb shell am instrument -w -r -e class "com.ssokcompany.baedalwang.GameSmokeTest#$method" com.ssokcompany.baedalwang.test/androidx.test.runner.AndroidJUnitRunner | tee "out/emulator/$method.txt"
 grep -q 'OK (1 test)' "out/emulator/$method.txt"
 ! grep -q 'FAILURES\|INSTRUMENTATION_FAILED' "out/emulator/$method.txt"
}
run_test testSeedCompatibleSave
adb shell am force-stop com.ssokcompany.baedalwang
adb logcat -c
adb install -r out/baedalwang-claude-final-1.0.1.apk
# Verify the upgrade and restart without network access.
adb shell svc wifi disable
adb shell svc data disable
run_test testCompatibleUpgrade
run_test testGameplayAndSave
adb shell am start -n com.ssokcompany.baedalwang/.MainActivity
sleep 12
adb exec-out screencap -p > out/emulator/portrait.png
adb logcat -d -s Baedalwang AndroidRuntime > out/emulator/runtime.log
if grep -q 'FATAL EXCEPTION\|JS_ERROR\|WEB_RESOURCE_ERROR' out/emulator/runtime.log; then exit 1; fi
printf 'Signed APK install, same-certificate upgrade, ver2 save, taps, upgrades, region/prestige, restart and portrait/landscape checks passed. Offline. API 35 emulator; physical device and audible sound remain unverified.\n' > out/emulator/result.txt
