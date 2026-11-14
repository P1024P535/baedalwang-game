# 배달왕 클로드 최종본 · Android AdMob 연결

원본 기준: `배달왕(3).zip`, SHA-256 `c09fecbcafd90d7fb85f0af8c08eab14181d2b5004339d0172eb797ed8badef7`.
`index.html`과 `assets/`의 495개 원본 게임 파일을 변경하지 않습니다. 그래픽·경제·스테이지·강화·환생·저장 보상량은 원본을 유지합니다.

## 보존과 작업 브랜치

- main 및 기존 정상 APK, 기존 서명 Secrets 보존.
- 원본 Android 검수 완료 브랜치: `release/claude495-android-20261114` (1.0.1).
- 광고 연결 작업 브랜치: `integration/admob-20261115` (versionCode 3 / 1.0.2).
- 이전 ChatGPT main의 저장 키는 별도 보존하며 임의 변환하지 않습니다. 서명이 다른 debug APK를 자동 삭제하지 않습니다.

## 네이티브 광고

Android 래퍼에서 Google Mobile Ads SDK와 UMP를 연결합니다. 원본 게임을 로드한 뒤 별도의 네이티브 어댑터가 `PLATFORM.showRewardedAd`를 연결합니다. 원본 `adThen`과 실제 게임 보상 규칙은 그대로 사용합니다.

완료 보상은 SDK의 earned 이벤트에서만 한 번 전달합니다. 광고 로드/표시 실패, 중도 종료, 중복 이벤트 및 이전 페이지 콜백은 보상을 지급하지 않습니다. 연결 전 WebView는 숨겨 원본 테스트 광고 타이머가 사용되지 않게 합니다.

- 기본 검수 APK: Google 공식 테스트 광고 ID. 실제 광고 수익 없음.
- `-PliveAds` AAB: 배달왕 AdMob 앱·보상형 광고 ID. UMP 개인정보 동의 상태를 확인하고 필요한 동의 전에는 광고를 요청하지 않습니다.
- 별도 검수 패키지: `com.ssokcompany.baedalwang.review`. 기존 정식 앱과 별도 데이터 사용.
- 제출용 패키지: `com.ssokcompany.baedalwang`, minSdk 24 / targetSdk 36. 기존 서명키 재사용.

구체적인 ID와 검증 범위는 [ADMob-INTEGRATION.md](ADMob-INTEGRATION.md)를 참고하세요.

## 검증

- `node scripts/test-reward-bridge.mjs`: 원본 보상 함수와 새 어댑터의 완료·실패·취소·중복·이전 페이지 콜백 검사.
- `python3 scripts/prepare-original.py`: 원본 495개 경로·크기·SHA-256 검사 및 Android 자산 준비.
- CI: 서명된 테스트 APK / 실광고 설정 AAB / 별도 검수 APK 생성, APK·AAB 원본 파일 및 인증서 검사.
- Android 에뮬레이터: 기존 ver2 저장 업데이트·게임 기능·오프라인 실행·광고 실패 시 보상 미지급 검사. 최종 실행 결과는 Actions 근거를 확인하세요.

## 출시 전 남은 확인

실기기에서 테스트 광고 표시·완료·취소·재시도·소리를 확인해야 합니다. AdMob 스토어 연결/검토 및 개인정보 메시지 설정과 실광고 동작은 별도 확인 대상입니다. Play Billing·Firebase 로그인/클라우드/랭킹은 미연동입니다. 개인정보 문서·데이터 보안·연령 등급·Play 최대 versionCode도 제출 전 확인해야 합니다.

공개 출시 및 Play 업로드는 하지 않습니다. 게임 저장은 기존 `baedal_king_v1`, ver2, WebView file URL을 유지합니다.
