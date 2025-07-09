# API 문서화 계획

## ⚠️ 현재 상태: 임시 비활성화

**비활성화 이유:**
- 현재 핵심 기능 구현에 집중하기 위해 API 문서화 관련 빌드 오류 방지
- SpringDoc OpenAPI 의존성 문제로 인한 빌드 실패 해결

**활성화 예정 시점:**
- 모든 핵심 기능 (시설 이미지 관리, 구인구직, 리뷰 시스템 등) 구현 완료 후
- API 문서화가 필요한 시점에 주석 해제 및 의존성 활성화

## 1. 개요

이 문서는 라이트케어 프로젝트의 API 문서화 계획을 설명합니다. SpringDoc OpenAPI 3를 사용하여 API 문서화를 진행할 예정입니다.

## 2. 기술 스택

- SpringDoc OpenAPI 3 (버전: 1.7.0)
- Swagger UI
- Spring Boot 2.7.18

## 3. 단계별 구현 계획

### Phase 1: 기본 설정 및 환경 구축 (1일)

1. 의존성 추가 (`build.gradle`)
```gradle
implementation 'org.springdoc:springdoc-openapi-ui:1.7.0'
implementation 'org.springdoc:springdoc-openapi-security:1.7.0'
```

2. 기본 설정 추가 (`application.yml`)
```yaml
springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
    tags-sorter: alpha
    operations-sorter: method
  show-actuator: true
```

3. OpenAPI 기본 정보 설정 클래스 생성
```java
@Configuration
public class OpenAPIConfig {
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("LightCare API")
                .description("요양원 구인구직 서비스 API 문서")
                .version("1.0.0")
                .contact(new Contact()
                    .name("LightCare Team")
                    .email("contact@lightcare.com")))
            .externalDocs(new ExternalDocumentation()
                .description("프로젝트 GitHub")
                .url("https://github.com/dooseob/LightCare"));
    }
}
```

### Phase 2: 컨트롤러 문서화 (3일)

1. 회원 관리 API (`MemberController`)
   - 로그인/회원가입 API
   - 회원 정보 관리 API
   - 권한 관련 API

2. 시설 관리 API (`FacilityController`)
   - 시설 등록/수정/삭제 API
   - 시설 검색 API
   - 이미지 업로드 API

3. 구인구직 API (`JobController`)
   - 구인공고 CRUD API
   - 지원 관리 API
   - 검색 및 필터링 API

4. 리뷰/게시판 API (`ReviewController`, `BoardController`)
   - 리뷰 CRUD API
   - 게시판 CRUD API
   - 댓글 관리 API

### Phase 3: 모델 문서화 (2일)

1. DTO 클래스 문서화
```java
@Schema(description = "회원 정보 DTO")
public class MemberDTO {
    @Schema(description = "회원 ID", example = "1")
    private Long memberId;
    
    @Schema(description = "회원 이름", example = "홍길동")
    private String name;
    // ...
}
```

2. 공통 응답 모델 문서화
```java
@Schema(description = "API 응답 모델")
public class ApiResponse<T> {
    @Schema(description = "성공 여부")
    private boolean success;
    
    @Schema(description = "응답 데이터")
    private T data;
    // ...
}
```

### Phase 4: 보안 및 인증 문서화 (1일)

1. Security 스키마 설정
```java
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT"
)
```

2. API 보안 요구사항 문서화
```java
@Operation(security = { @SecurityRequirement(name = "bearerAuth") })
@GetMapping("/api/members/me")
public ResponseEntity<MemberDTO> getMyInfo() {
    // ...
}
```

### Phase 5: 테스트 및 검증 (2일)

1. 모든 API 엔드포인트 테스트
   - 요청/응답 스키마 검증
   - 예제 값 검증
   - 보안 설정 검증

2. API 응답 예제 추가
```java
@ApiResponse(
    responseCode = "200",
    description = "성공",
    content = @Content(
        mediaType = "application/json",
        examples = @ExampleObject(
            value = "{\"success\":true,\"data\":{\"memberId\":1,\"name\":\"홍길동\"}}"
        )
    )
)
```

3. 오류 응답 문서화
```java
@ApiResponse(
    responseCode = "400",
    description = "잘못된 요청",
    content = @Content(
        mediaType = "application/json",
        schema = @Schema(implementation = ErrorResponse.class)
    )
)
```

## 4. 문서화 규칙

1. API 그룹화
   - 회원 관리 API
   - 시설 관리 API
   - 구인구직 API
   - 리뷰/게시판 API

2. 명명 규칙
   - URI: 복수형 명사 사용 (/api/members, /api/facilities)
   - 메서드: HTTP 메서드 의미에 맞게 사용
   - 파라미터: camelCase 사용

3. 응답 형식
   - 성공: HTTP 200 (GET), 201 (POST), 204 (DELETE)
   - 실패: HTTP 400 (잘못된 요청), 401 (인증 필요), 403 (권한 없음), 404 (찾을 수 없음)

4. 예제 데이터
   - 실제와 유사한 데이터 사용
   - 한글 데이터 포함
   - 날짜/시간은 ISO 8601 형식 사용

## 5. 유지보수 계획

1. 버전 관리
   - API 버전은 URI에 포함 (/api/v1/...)
   - 변경 이력은 CHANGELOG.md 관리

2. 문서 업데이트
   - API 변경 시 즉시 문서 업데이트
   - 주기적인 문서 리뷰 (월 1회)

3. 모니터링
   - API 사용량 모니터링
   - 오류 발생 모니터링
   - 성능 모니터링

## 6. 접근 방법

- 개발 환경: `http://localhost:8080/swagger-ui.html`
- 운영 환경: `https://[domain]/swagger-ui.html`
- API 문서 JSON: `http://localhost:8080/api-docs`

## 7. 일정

총 소요 기간: 9일
- Phase 1 (기본 설정): 1일
- Phase 2 (컨트롤러 문서화): 3일
- Phase 3 (모델 문서화): 2일
- Phase 4 (보안 문서화): 1일
- Phase 5 (테스트 및 검증): 2일 

● ✅ API 문서화 관련 빌드 오류 해결 완료

성공적으로 API 문서화 관련 빌드 오류를
해결했습니다!

🔧 수행한 작업

1. SpringDoc OpenAPI 의존성 비활성화
   - build.gradle에서 관련 의존성을 주석 처리      
   - 기능 구현에 집중할 수 있도록 임시
   비활성화
2. OpenAPIConfig 클래스 비활성화
   - 전체 클래스를 블록 주석으로 처리
   - 비활성화 이유와 활성화 시점을 명시
3. API 문서화 예시 파일들 제거
   - /com/lightcare/ 패키지의 예시 파일들 완전     
   제거
   - 빌드 충돌 원인이었던 Swagger 어노테이션       
   제거
4. 문서화 계획 업데이트
   - API_DOCUMENTATION_PLAN.md에 현재 상태
   반영
   - 비활성화 이유와 활성화 예정 시점 명시

✅ 결과

BUILD SUCCESSFUL in 34s
6 actionable tasks: 6 executed

이제 빌드가 성공적으로 완료됩니다!

📋 현재 상태

- ✅ 빌드 오류 해결: API 문서화 관련 의존성       
  문제 해결
- ✅ 기능 구현 집중: 핵심 기능 개발에 집중할      
  수 있는 환경 구성
- ✅ 향후 계획 보존: API 문서화 계획은 그대로     
  유지되어 추후 활성화 가능

🔄 향후 API 문서화 재활성화 방법

필요할 때는 다음과 같이 다시 활성화할 수
있습니다:

1. build.gradle에서 SpringDoc OpenAPI 의존성      
   주석 해제
2. OpenAPIConfig.java에서 블록 주석 해제
3. 컨트롤러와 DTO에 Swagger 어노테이션 추가
4. http://localhost:8080/swagger-ui.html에서      
   API 문서 확인

이제 시설 이미지 관리 시스템과 다른 핵심
기능들의 구현에 집중할 수 있습니다!
