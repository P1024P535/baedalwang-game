# 배달왕 클로드 최종본 Android 검수 빌드

최우선 기준: `배달왕(3).zip`, SHA-256 `c09fecbcafd90d7fb85f0af8c08eab14181d2b5004339d0172eb797ed8badef7`.
`index.html` + `assets/`의 495개 파일을 한 바이트도 바꾸지 않고 반영합니다. 별도 오디오 파일 없이 Web Audio로 효과음/BGM을 생성합니다. 전체 경로·크기·SHA-256은 `original-manifest.json`을 참고하세요.

- 기존 main: `e5f52736f7b3c7833a163650c6345979b7c7d0e3`. 백업 `backup/main-before-claude495-20261114`.
- 기존 클로드 201개 파일 빌드: `aa35d8eddf7ad3490e74838b626fb12c677661dc`. 백업 `backup/claude201-before-claude495-20261114`.
- 현재 작업 브랜치: `release/claude495-android-20261114`. main/기존 APK/Secrets를 교체하거나 삭제하지 않습니다.
- 패키지 `com.ssokcompany.baedalwang`, versionCode 2, versionName 1.0.1, minSdk 24, targetSdk 36.
- 기존 네 개 BAEDALWANG 서명 Secrets를 CI에서만 사용합니다. 새 키를 생성하지 않습니다. APK와 AAB 서명이 이전 서명 AAB와 같은지 검증합니다.
- 원본 `app_icon.png`를 Android 앱 아이콘으로 재사용합니다. 원본 시작 화면/게임 그래픽/경제/스테이지/강화/환생/저장 코드는 수정하지 않습니다.
- 기존 클로드 저장은 `baedal_king_v1`, ver 2, 같은 WebView file URL을 사용합니다. 이전 ChatGPT 게임의 `baedalwang-3d-simulation-only` 데이터는 별도 구조로 보존하며 임의 변환하지 않습니다.
- 이전 debug APK는 서명키가 다를 수 있습니다. 서명이 다르면 덮어설치가 되지 않습니다. 사용자 앱을 자동 삭제하지 않습니다.

## 출시 차단 / 미확인

실서비스용 AdMob ID/네이티브 SDK 연동, Play Billing 상품·구매 검증, Firebase Google 로그인·클라우드·랭킹은 원본에서 준비/테스트 상태입니다. 테스트 결제는 실제 청구가 없습니다. 배포물은 검수용이며 공개 출시 승인과 서비스 연동 확인 전 Play 공개 출시를 진행하지 않습니다.
실제 휴대폰 터치·장시간 플레이·들리는 소리·광고 지급/구매/개인정보 문서·스토어 등록 상태는 별도 검수가 필요합니다. 에뮬레이터 성공을 실기기 완료로 표시하지 않습니다.

검증 보고서와 스크린샷은 Actions 아티팩트 `baedalwang-final-verification`에 보관합니다. Play Console 업로드/출시 자동화는 없습니다.

참고: https://support.google.com/googleplay/android-developer/answer/11926878 / https://developer.android.com/build/releases/agp-8-10-0-release-notes
