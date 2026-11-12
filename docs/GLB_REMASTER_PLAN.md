# 배달왕 3D — GLB 리마스터 제작 명세 v1
상태: 제작 준비 / 정식 배포 금지
기준: 사용자가 제공한 라이더·자전거·스쿠터·도로·음식점·주거지·날씨·조경·NPC 콘셉트 시트
목표: 기존 웹게임과 저장 데이터를 유지하면서 고품질 세미리얼/스타일라이즈드 3D로 일괄 교체

## 절대 보존
- 저장 키: `baedalwang-3d-simulation-only` 변경 금지
- 저장 객체의 기존 필드 및 차량·지역·업종 인덱스 변경 금지
- 게임 경제, 업적, 지역, 상점, 자동 수익, 진행 로직 변경 금지
- 기존 `index.html` 및 `assets/asset-pack.js`는 최종 검증 전 main에서 수정 금지
- 롤백: 배포 이전 커밋과 구형 프로시저럴 에셋 로더 보존

## 에셋 제작 원칙
- GLB/glTF 2.0, Blender 제작, 텍스처 PBR, UV, 노멀, AO, 금속도·거칠기
- 각 에셋의 기준 축: Y 위쪽, 차량 전방 +X (현행 rider.rotation.y 기준과 검증)
- 단위: 도로 폭, 라이더 키, 차량 크기를 기준 샘플 장면에서 실측 후 확정
- 피벗: 차량 바퀴 지면, 건물 지면 중심, 사람 발 중앙
- 독립 애니메이션: idle/walk/run/ride/pickup/deliver/celebrate; 필요 시 각 차량 바퀴 회전
- 텍스처 색 공간 sRGB(베이스컬러), 나머지 데이터 텍스처 linear
- 재질·텍스처 재사용, LOD, instancing, 그림자 최소화, KTX2/Draco는 지원 로더와 함께 도입
- GLB 및 원본 .blend 파일을 구분 관리, 외부 라이선스 확인

## 제작 배치
P0 플레이어: rider_main, helmet, delivery_bag, kickboard, bicycle, scooter
P1 도시 기본: road_straight, road_intersection, sidewalk, traffic_light, streetlamp, restaurant_chicken, restaurant_pizza, restaurant_snack, home_small, villa, apartment
P2 배경: trees_spring/summer/autumn/winter, bench, planter, bus_stop, car, taxi, bus, npc_customer, npc_pedestrian, npc_staff, cloud_edge
P3 확장: 나머지 차량 등급·지역별 건물·계절·기상 변형·특수 NPC

## 검수 게이트
G1 3D 뷰어: 전후좌우, 스케일, 피벗, 노멀, 텍스처 확인
G2 게임 샘플 씬: 라이더+현재 차량+음식점+주택+도로의 조합을 콘셉트 시트와 육안 비교
G3 모바일: 실제 안드로이드 기기에서 프레임, 메모리, 발열, WebGL 오류 측정; 목표 30 FPS 이상(기기별 검증)
G4 기능: 기존 저장 백업/복원, 차량 전환, 지역 전환, 구매, 수익, 오프라인 보상, 화면 회전 검증
G5 경계: sc.fog=null; 화면 전체 haze/overlay 제거; 구름은 월드 외곽에만 배치, 카메라와 라이더를 가리지 않음
G6 배포: 기존 코드/데이터 백업 후 main에 일괄 병합, 캐시 버전 갱신, 오류 시 롤백

## 현재 확인된 구조
- 단일 index.html / Three.js 렌더링
- assets/asset-pack.js 는 프로시저럴 모델 함수 설치 방식
- 차량 S.v, 지역 S.r, 저장 KEY를 사용
- 새 로더는 GLTFLoader 기반 비동기 로딩과 에셋 로딩 실패 시 구형 모델 폴백 필요
- 기존 asset-pack API와 연결하는 adapter 권장
- 콘셉트 시트는 모델 제작 레퍼런스이며 GLB 파일 자체가 아님

## 다음 제작 작업
1. 콘셉트 시트별 정확한 치수/재질/부품 정의, 라이더와 킥보드 고품질 모델 제작
2. Blender 파일, GLB, 텍스처, 썸네일, 검수 기록 생성
3. 샘플 씬으로 콘셉트 유사도 검수 후 동일 스타일로 나머지 에셋 제작
4. staging에서 GLB 로더/캐시/폴백 연결 및 기능 회귀 테스트
5. 사용자 승인 후 일괄 배포
