# 🧹 Git 히스토리 정리 가이드 (고급)

## ⚠️ 주의사항
- **위험한 작업**: 잘못하면 프로젝트 히스토리 손상 가능
- **팀 협업 필요**: 모든 팀원이 새로 클론해야 함
- **백업 필수**: 작업 전 반드시 백업

## 🛠️ BFG Repo-Cleaner 사용법

### 1. BFG 다운로드
```bash
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
```

### 2. API 키 제거
```bash
# 민감 정보 파일 생성
echo "3c4987cb946a721903add5fc474941a3" > secrets.txt

# BFG로 히스토리에서 제거
java -jar bfg-1.14.0.jar --replace-text secrets.txt --no-blob-protection .

# Git 정리
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### 3. 강제 푸시 (위험)
```bash
git push --force-with-lease --all
git push --force-with-lease --tags
```

### 4. 팀원 작업
```bash
# 모든 팀원이 새로 클론
git clone <repository-url>
```

## 🚫 단점
- 모든 커밋 해시 변경됨
- 팀원들이 모두 새로 클론해야 함
- 기존 PR/이슈 링크 깨짐