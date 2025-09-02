# Railway 배포 설정 가이드

## 📝 순서

### 1. Railway MySQL 생성
1. [Railway Dashboard](https://railway.app) 로그인
2. 프로젝트 선택
3. **New** → **Database** → **MySQL** 클릭
4. 생성 완료 후 **Connect** 탭에서 정보 확인

### 2. 데이터 마이그레이션
```bash
# 방법 1: 배치 파일 사용 (Windows)
migrate-to-railway.bat

# 방법 2: 수동 명령어
# 로컬 백업
mysqldump -u root -pmysql carelink > carelink_backup.sql

# Railway로 전송 (Railway 정보로 대체)
mysql -h [host] -P [port] -u root -p[password] railway < carelink_backup.sql
```

### 3. Railway 환경변수 설정
프로젝트 → Variables 탭에서 추가:

```env
DB_URL=mysql://root:[password]@[host]:[port]/railway
DB_USERNAME=root
DB_PASSWORD=[railway_password]
RAILWAY_ENVIRONMENT=true
UPLOAD_DIR=/app/uploads/
```

### 4. 확인
배포 완료 후:
- `https://[your-app].railway.app` 접속
- 로그인 테스트 (admin/admin123)
- 이미지 업로드 테스트

## ⚠️ 주의사항
- Railway MySQL은 무료 플랜에서 500MB 제한
- 자동 슬립 모드 있음 (유료 플랜에서 해제)
- 환경변수는 반드시 Railway 대시보드에서 설정

## 🔍 문제 해결
로그인 안 될 때:
1. `/debug/railway` 접속해서 DB 연결 확인
2. Railway 로그 확인
3. 환경변수 재확인

## 📊 데이터베이스 구조 (자동 생성됨)
- member (회원)
- facility (시설) 
- job_posting (구인구직)
- review (리뷰)
- board (게시판)