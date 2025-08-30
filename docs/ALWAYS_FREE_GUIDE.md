# Oracle Cloud Always Free 완전 가이드

## ⚠️ 헷갈리지 마세요!

Oracle Cloud는 두 가지 무료가 있습니다:
1. **Free Trial**: 30일 $300 크레딧 (임시)
2. **Always Free**: 영구 무료 (이것을 사용!)

## 🎯 Always Free 리소스 (영구 무료)

### Compute (서버)
- **AMD 기반**: VM.Standard.E2.1.Micro x 2개
  - 각 1/8 OCPU (0.125 vCPU)
  - 각 1GB RAM
  - 각 0.48 Gbps 네트워크
  
- **ARM 기반**: VM.Standard.A1.Flex
  - 총 4 OCPU + 24GB RAM (분할 가능)
  - 최대 4개 인스턴스

### Storage (저장소)
- **Block Volume**: 총 200GB
- **Object Storage**: 10GB
- **Archive Storage**: 10GB

### Database
- **Autonomous Database**: 2개
  - 각 20GB 스토리지
  - 각 1 OCPU

### Network
- **Load Balancer**: 1개 (10Mbps)
- **Outbound Data Transfer**: 월 10TB
- **VPN**: Site-to-Site VPN

## 📋 Always Free 생성 체크리스트

### ✅ VM 인스턴스 생성 시
1. Shape 선택에서 **"Always Free Eligible"** 표시 확인
2. **VM.Standard.E2.1.Micro** 선택
3. Boot Volume은 **50GB까지 무료**

### ✅ 주의사항
- Always Free 리소스는 **녹색 "Always Free"** 태그 표시
- 태그 없는 리소스는 유료 전환 가능
- Region 제한: 모든 리전에서 사용 가능

## 🚫 피해야 할 것들

1. **Free Trial 크레딧으로만 사용 가능한 서비스**
   - GPU 인스턴스
   - 대용량 컴퓨트
   - 프리미엄 서비스

2. **유료 전환되는 것들**
   - Always Free 한도 초과
   - 명시되지 않은 서비스

## ✅ 영구 무료 확인 방법

### Console에서 확인
1. Oracle Cloud Console 로그인
2. Billing & Cost Management
3. Cost Analysis에서 "Always Free" 필터

### 인스턴스 생성 시
```
Shape: VM.Standard.E2.1.Micro
→ 녹색 "Always Free Eligible" 배지 확인
```

## 💡 Spring Boot 프로젝트용 추천 구성

### Option 1: 단일 서버 (추천)
- 1x VM.Standard.E2.1.Micro
- Ubuntu 20.04
- Spring Boot + MySQL 같이 설치
- 50GB Boot Volume

### Option 2: 분리 구성
- VM 1: Spring Boot 애플리케이션
- VM 2: MySQL 데이터베이스
- 각 1GB RAM으로 빠듯할 수 있음

## 🔒 영구 무료 유지 조건

1. **계정 활성 유지**
   - 365일 이상 미사용 시 정지 가능
   - 주기적으로 로그인

2. **Always Free 한도 준수**
   - 지정된 리소스만 사용
   - 한도 초과 시 인스턴스 생성 불가

3. **Idle 정책**
   - 7일 연속 CPU 10% 미만: 경고
   - 대응 없으면 정지 (재시작 가능)

## 📝 요약

**Oracle Cloud Always Free는:**
- ✅ 30일 후에도 영구 무료
- ✅ 신용카드 과금 없음  
- ✅ Spring Boot 운영 충분
- ✅ 상업적 이용 가능

**단, 반드시:**
- "Always Free Eligible" 리소스만 생성
- 정기적으로 사용하여 계정 활성 유지