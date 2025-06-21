요양원 구인구직 사이트 팀 프로젝트 가이드 (비전공 입문자 4인 팀)
3주간의 긴 회의 끝에 프로젝트 방향성을 잡지 못해 답답하셨을 팀원분들의 마음에 공감하며, 현재 상황에 최적화된 기술 스택과 프로젝트 기초 뼈대를 제시해 드립니다. 비전공자 입문자라는 점, 스프링 프레임워크를 막 끝내고 스프링 부트로 넘어가는 학습 단계, 그리고 기능 단위 협업 방식을 선호하는 팀의 특성을 모두 고려했습니다.
1. 기술 스택 추천: "쉽고, 빠르고, 학습에 도움이 되는" 조합
현재 여러분의 상황에서는 복잡하고 어려운 최신 기술보다는, 배우기 쉽고 참고 자료가 많으며, 현재 학습 진도와 잘 맞는 기술을 선택하는 것이 중요합니다.
구분	기술	추천 이유
백엔드 (Backend)	Spring Boot	스프링 프레임워크를 이미 학습했기 때문에 개념을 확장하여 쉽게 적용할 수 있습니다. 내장 서버(Tomcat)를 포함하고 있어 별도의 서버 설정 없이 빠르게 개발을 시작할 수 있으며, 방대한 커뮤니티와 자료를 통해 문제 해결이 용이합니다.
프론트엔드 (Frontend)	Thymeleaf, JavaScript, HTML/CSS	Thymeleaf는 스프링 부트와 공식적으로 통합되어 있어 함께 사용하기 매우 편리한 템플릿 엔진입니다. JSP보다 문법이 간결하고 직관적이며, 서버에서 렌더링된 데이터를 화면에 보여주는 데 효과적입니다. 여기에 JavaScript를 더해 동적인 기능을 구현하고, HTML/CSS로 기본적인 웹 페이지 구조와 디자인을 완성합니다.
데이터베이스 (Database)	MySQL	부트캠프에서 이미 학습한 데이터베이스이며, 웹 애플리케이션에서 가장 널리 사용되는 관계형 데이터베이스 중 하나입니다. 무료로 사용할 수 있고, 참고할 수 있는 자료가 풍부하여 초보자가 다루기에 적합합니다.
데이터베이스 연동	MyBatis	JPA와 MyBatis는 둘 다 훌륭한 기술이지만, 현재 팀의 상황에서는 MyBatis를 추천합니다. MyBatis는 SQL 쿼리를 XML 파일에 직접 작성하는 방식이라, 학습한 SQL 지식을 그대로 활용할 수 있어 직관적이고 배우기 쉽습니다. 복잡한 쿼리 작성도 상대적으로 자유로워, 초보자가 데이터베이스와 애플리케이션을 연결하는 원리를 이해하는 데 큰 도움이 됩니다.
빌드 도구	Gradle	Maven과 함께 가장 많이 사용되는 빌드 도구입니다. Groovy 스크립트를 사용하여 Maven보다 간결하고 유연하게 빌드 설정을 할 수 있습니다.
지도 API	카카오맵 API / Naver Maps API	국내 지도 서비스에 강점이 있고, 공식 문서와 예제가 잘 되어 있어 초보자도 쉽게 따라 하며 지도 기능을 구현할 수 있습니다.
2. 프로젝트 기초 뼈대 (Project Structure)
프로젝트를 시작하기 위해 가장 먼저 해야 할 일은 기본적인 구조를 잡는 것입니다. 아래는 추천하는 패키지 구조 예시이며, 이 구조를 기준으로 각자 맡은 기능 개발을 시작하면 됩니다.
가. Gradle 의존성 설정 (build.gradle)
프로젝트에 필요한 라이브러리들을 설정합니다.
Generated groovy
plugins {
    id 'org.springframework.boot' version '2.7.18' // 현재 안정적인 버전 사용 권장
    id 'io.spring.dependency-management' version '1.0.15.RELEASE'
    id 'java'
}

group = 'com.example'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '11' // 사용하는 JDK 버전에 맞게 설정

repositories {
    mavenCentral()
}

dependencies {
    // Spring Boot 기본
    implementation 'org.springframework.boot:spring-boot-starter-web'
    developmentOnly 'org.springframework.boot:spring-boot-devtools'

    // Thymeleaf (프론트엔드 템플릿 엔진)
    implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'

    // MySQL 데이터베이스 연결
    runtimeOnly 'com.mysql:mysql-connector-j'

    // MyBatis 연동
    implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:2.3.1'

    // Lombok (코드 자동 생성으로 가독성 향상)
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'

    // 테스트
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

tasks.named('test') {
    useJUnitPlatform()
}
Use code with caution.
Groovy
나. 패키지 구조 (Package Structure)
기능별로 패키지를 나누면 코드를 관리하기 용이하며, 여러 명이 동시에 작업할 때 충돌을 최소화할 수 있습니다.
Generated code
src
└── main
    ├── java
    │   └── com
    │       └── example
    │           └── carelink  // 프로젝트명
    │               ├── controller // 웹 요청 처리
    │               │   ├── MemberController.java
    │               │   ├── FacilityController.java
    │               │   └── BoardController.java
    │               ├── service    // 비즈니스 로직
    │               │   ├── MemberService.java
    │               │   └── ...
    │               ├── dao        // 데이터베이스 접근 (MyBatis Mapper 인터페이스)
    │               │   ├── MemberMapper.java
    │               │   └── ...
    │               ├── dto        // 데이터 전송 객체 (Data Transfer Object)
    │               │   ├── MemberDTO.java
    │               │   └── ...
    │               └── config     // 설정 관련 클래스
    │                   └── MybatisConfig.java
    └── resources
        ├── static // CSS, JavaScript, 이미지 등 정적 파일
        │   ├── css
        │   └── js
        ├── templates // Thymeleaf 템플릿 파일 (HTML)
        │   ├── member
        │   │   ├── login.html
        │   │   └── join.html
        │   ├── facility
        │   │   └── search.html
        │   └── board
        └── mapper // MyBatis SQL 쿼리 XML 파일
            ├── memberMapper.xml
            └── facilityMapper.xml
Use code with caution.
3. 기능 단위 협업 방식 및 구현 예시
팀원들이 각자 기능을 맡아 협업하는 방식을 원하셨으니, 아래와 같이 역할을 분담하고 서로의 코드를 리뷰하며 진행하는 것을 추천합니다.
팀원 A: 회원 관리 (로그인, 회원가입) 기능
팀원 B: 시설 검색 및 지도 표시 기능
팀원 C: 구인구직 게시판 기능
팀원 D: 시설 리뷰 및 정보 게시판 기능
핵심은 한 사람이 Controller, Service, Mapper, HTML을 모두 경험해보는 것입니다. 막히는 부분이 생기면 서로에게 물어보고, 페어 프로그래밍을 통해 함께 해결해나가세요.
[예시] 회원가입 기능 구현 맛보기 코드
아래 코드는 실제 동작하는 전체 코드는 아니지만, 어떤 흐름으로 각 파일이 구성되는지 이해를 돕기 위한 조각 코드입니다.
1. MemberController.java (요청 처리)
Generated java
@Controller
@RequestMapping("/member")
public class MemberController {

    private final MemberService memberService;

    // 생성자 주입
    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping("/join")
    public String joinForm() {
        return "member/join"; // join.html 뷰를 보여줌
    }

    @PostMapping("/join")
    public String join(MemberDTO memberDTO) {
        memberService.join(memberDTO); // 서비스에 회원가입 로직 요청
        return "redirect:/"; // 회원가입 후 메인 페이지로 이동
    }
}
Use code with caution.
Java
2. MemberService.java (비즈니스 로직)
Generated java
@Service
public class MemberService {

    private final MemberMapper memberMapper;

    public MemberService(MemberMapper memberMapper) {
        this.memberMapper = memberMapper;
    }

    public void join(MemberDTO memberDTO) {
        // 실제로는 비밀번호 암호화 등 추가 로직 필요
        memberMapper.insertMember(memberDTO);
    }
}
Use code with caution.
Java
3. MemberMapper.java (MyBatis 인터페이스)
Generated java
@Mapper
public interface MemberMapper {
    void insertMember(MemberDTO memberDTO);
}
Use code with caution.
Java
4. memberMapper.xml (SQL 쿼리)
Generated xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.carelink.dao.MemberMapper">

    <insert id="insertMember" parameterType="com.example.carelink.dto.MemberDTO">
        INSERT INTO member (member_id, password, name, email)
        VALUES (#{memberId}, #{password}, #{name}, #{email})
    </insert>

</mapper>
Use code with caution.
Xml
5. join.html (Thymeleaf 템플릿)
Generated html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>회원가입</title>
</head>
<body>
    <h1>회원가입</h1>
    <form action="/member/join" method="post">
        <input type="text" name="memberId" placeholder="아이디">
        <input type="password" name="password" placeholder="비밀번호">
        <input type="text" name="name" placeholder="이름">
        <input type="email" name="email" placeholder="이메일">
        <button type="submit">가입하기</button>
    </form>
</body>
</html>
Use code with caution.
Html
4. 앞으로의 진행 방향
Git/GitHub Repository 생성: 지금 바로 GitHub에 가서 Private Repository를 만들고 팀원들을 초대하세요. 그리고 위에서 제시한 기초 뼈대(디렉토리 구조)를 먼저 만들어서 commit & push 하세요. 이것이 프로젝트의 진짜 시작입니다.
데이터베이스 테이블 설계 (ERD): 필요한 테이블(회원, 시설, 게시글, 댓글, 리뷰 등)과 컬럼을 간단하게라도 그려보세요. 이 설계도를 바탕으로 SQL DDL(CREATE TABLE...)을 작성합니다.
기능 단위 개발 시작: 위에서 예시로 든 것처럼 각자 맡은 기능의 Controller, Service, Mapper, DTO, HTML 파일들을 만들어가며 개발을 시작합니다. 처음에는 완벽하지 않아도 괜찮습니다. '일단 돌아가게 만들고, 점차 개선한다'는 생각으로 접근하세요.
지도 기능: 시설 검색 기능에 지도를 연동할 때는 카카오맵 API 문서를 참고하여 JavaScript로 구현합니다. 백엔드에서는 데이터베이스에 저장된 시설의 주소 또는 위경도 정보를 API로 프론트엔드에 전달해주는 역할을 맡게 됩니다.
AI 챗봇: 이 기능은 프로젝트의 핵심 기능 개발이 모두 끝난 후, 시간이 남는다면 도전해볼 '선택 사항'으로 남겨두는 것이 좋습니다. OpenAI API 등을 활용해볼 수 있지만, 지금 단계에서는 우선순위가 낮습니다.
가장 중요한 것은 **"지금 당장 시작하는 것"**입니다. 완벽한 계획을 세우려다 시작조차 못 하는 실수를 반복해서는 안 됩니다. 위 가이드를 바탕으로 프로젝트의 첫 삽을 뜨고, 부딪히는 문제들을 하나씩 해결해가며 팀원들과 함께 성장하는 경험을 쌓으시길 바랍니다. 응원하겠습니다