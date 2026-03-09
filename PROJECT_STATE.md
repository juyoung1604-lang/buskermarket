# 송도 버스킹 & 플리마켓 관리 시스템 기술 명세 (v3.0)

본 문서는 프로젝트의 현재 상태와 핵심 로직을 기록하여 코드 수정 시 데이터 확인 및 백업 용도로 사용합니다.

## 1. 데이터 모델 (Data Schema)

### 1.1 버스커 (Buskers)
- `id`: 고유 식별자 (UUID)
- `name`: 성함/팀명
- `genre`: 공연 장르
- `event_date`: 행사 참여 희망일 (YYYY-MM-DD)
- `status`: 심사 상태 (`pending`, `approved`, `rejected`)
- `pay_status`: 참가보증금 결제 상태 (`paid`, `unpaid`)
- `urls`: 활동 자료 링크 (최대 5개 배열)

### 1.2 셀러 (Sellers)
- `id`: 고유 식별자 (UUID)
- `category`: 판매 카테고리
- `booths`: 사용 부스 개수
- `status`: 심사 상태 (`pending`, `approved`, `rejected`)
- `pay_status`: 부스비 결제 상태 (`paid`, `unpaid`)

### 1.3 매출 & 정산 (Revenue)
- `applicant_id`: 신청자 ID 연동
- `type`: 구분 (버스커/셀러)
- `amount`: 금액 (보증금/부스비)
- `status`: 입금 확인 상태 (`paid`, `unpaid`)
- **로직**: 정산에서 '확인' 클릭 시 해당 신청자의 `pay_status`가 실시간 연동됨.

## 2. 권한 체계 (RBAC Matrix)

| 권한 레벨 | 가시성 범위 | 주요 권한 |
| :--- | :--- | :--- |
| **슈퍼관리자** | 전체 계정 노출 | 모든 메뉴 접근, 권한 매트릭스 수정, 시스템 설정 |
| **관리자** | 운영자 이하 노출 | 대시보드, 신청관리, 캘린더, 정산 (슈퍼관리자 설정에 따름) |
| **운영자** | 본인 정보만 노출 | 캘린더, 대시보드 등 조회 위주 권한 |

## 3. 데이터베이스 (Supabase)
- **URL**: `https://rulhtfolpgrwruicetuk.supabase.co`
- **핵심 테이블**: `buskers`, `sellers`, `events`, `revenue`, `admin_profiles`

## 4. 백업 가이드
- **코드 백업**: Git을 통한 커밋 및 GitHub 푸시
- **DB 백업**: Supabase SQL Editor를 통한 테이블 구조 및 데이터 Export
- **환경 변수**: `.env` 파일의 URL 및 Key 정보 보안 유지
