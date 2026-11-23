# 배달왕 Google Play 비공개 테스트 배포 준비 — 2026-11-23

## 제출 후보 빌드 (검증 완료)
- 앱 패키지: `com.ssokcompany.baedalwang`
- Android App Bundle: `baedalwang-1.0.14-internal.aab`
- `versionCode=16` / `versionName=1.0.14-ads-test` / `targetSdk=36`
- SHA-256: `ab9699abfeed1f2e93ad957b586a4cb03f2c3d971fde1c88e447dd9983224eb5`
- 기준 소스 커밋: `a4c8d737c66a36b3cb3fee6b3a9a7a47538d2f4c`
- 검증 작업: https://github.com/P1024P535/baedalwang-game/actions/runs/43767157023
- 빌드 ZIP 다운로드: https://github.com/P1024P535/baedalwang-game/actions/runs/43767157023/artifacts/14182841720
- 서명된 AAB 확인: GitHub Actions의 `jarsigner -verify` 통과 및 로컬 재검증(`jar verified`). 원본 빌드 보고서의 SHA-256과 일치.
- 자동검사: Android WebView 6개 테스트 통과, 화면 252개 검사 통과.
- 광고: Google 공식 테스트 광고 사용. 실제 광고 수익 발생하지 않음.
- 결제: 실제 Play 결제 플래그 꺼짐. 구매 기능이 활성화된 정식 릴리스가 아님.
- 저장: 기존 `baedal_king_v1` 로컬 저장·원본 파일 보호를 우선함.

## 구글 플레이 업로드는 아직 미확인/미완료
ChatGPT 연결에서 Play Console 계정의 비공개 테스트 화면을 직접 열거나 수정할 수 없어 **제출 완료를 의미하지 않음**.
Google Play Console에서 현재 활성 트랙의 `versionCode`가 16보다 작은지 먼저 확인. 이미 코드 16이 사용되었으면 versionCode를 올려 다시 빌드해야 함.

## 콘솔의 검증 대상
1. Play Console → 해당 앱 → 테스트 및 출시 → 테스트 → 비공개 테스트: 트랙 및 테스터 목록 설정.
2. 위 서명 AAB 업로드. 이 앱에 이미 등록한 업로드 키와 일치하는지 콘솔에서 검증.
3. 앱 콘텐츠: 데이터 보안, 타겟 연령층, 광고 여부, 콘텐츠 등급, 로그인/앱 액세스 정보 등 해당 앱에 필요한 선언 확인.
4. 공개 접근 가능한 **배달왕 전용 개인정보처리방침 URL** 등록. 앱 내부의 개인정보처리방침만으로는 스토어 URL 요건을 대신하지 못함.
5. 계정 생성/연결을 지원하므로 앱 내 탈퇴 기능과 외부 계정 삭제 요청 안내 URL 및 실제 처리 절차 검증.
6. 등록된 이용자 문의 이메일 `p0429p@gmail.com`은 게임 코드에서 확인됨. Play 스토어 고객지원 이메일도 별도 확인.
7. 내부 테스트에 올라간 기존 `versionCode=4`는 별도 트랙임. 비공개 테스트에 빌드 16을 올렸는지는 아직 확인되지 않음.
8. 실제 휴대폰 로그인/클라우드 복원/보상형 광고 지급/계정 삭제 검증 및 테스터 피드백 수집.
9. Firebase API 키는 제한된 클라이언트용 키 사용·Google Cloud API 제한 권장. 2026-11-18의 후속 보안 브랜치 CI는 `BAEDALWANG_FIREBASE_API_KEY` GitHub Actions secret이 없어 실패했으므로 그 브랜치에서 새 빌드할 때 별도 설정 필요. 이 문서와 저장소에 실제 키·서명 비밀번호를 기입하지 말 것.

## 출시 노트(비공개 테스트용 초안)
배달왕 1.0.14 테스트: 자동 배달·강화·게임 저장 기능, 모바일 화면 및 광고 표시 개선. Google 테스트 광고를 사용하며 정식 유료 결제는 비활성화되어 있습니다. 문제가 있다면 게임 설정의 고객지원 이메일로 문의해 주세요.

## 원칙
- 공개 출시/실광고/실결제는 별도 승인과 검증 전까지 하지 않음.
- 검증된 AAB를 테스트 후보로 보존하며, 기존 사용자 저장 데이터나 기존 Play 앱을 삭제하지 않음.
