# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Korean team project (4 members) developing a nursing home job posting website called "LightCare" (라이트케어). The project serves as a platform connecting nursing facilities with job seekers in the eldercare industry.

## Technology Stack

- **Backend**: Spring Boot 2.7.18, MyBatis, MySQL
- **Frontend**: Thymeleaf templates, Bootstrap 5, JavaScript
- **Build Tool**: Gradle with Java 11
- **Database**: MySQL with utf8mb4 character set

## Common Development Commands

### Build and Run
```bash
# Build the project
./gradlew build

# Run the application
./gradlew bootRun

# Clean build artifacts
./gradlew clean

# Run tests
./gradlew test

# Check code quality
./gradlew check
```

### Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE carelink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Run schema initialization
# Execute src/main/resources/schema.sql in MySQL
```

### Development Server
- Application runs on `http://localhost:8080`
- Database connection: `jdbc:mysql://localhost:3306/carelink`
- Hot reload enabled with Spring Boot DevTools

## Architecture Overview

### Team Structure (4-Member Collaboration)
The project follows a feature-based team structure:

- **Team Member A**: Member management (login, registration, profile)
- **Team Member B**: Facility search and mapping (Kakao Maps integration)
- **Team Member C**: Job posting board (job listings, applications)
- **Team Member D**: Review system and information board

### Package Structure
```
com.example.carelink/
├── controller/          # Request handling layer
├── service/            # Business logic layer
├── dao/               # Data access layer (MyBatis mappers)
├── dto/               # Data transfer objects
└── common/            # Shared utilities and constants
```

### Database Design
The database uses a multi-table design with proper foreign key relationships:
- **member**: User accounts and authentication
- **facility**: Nursing facility information with geolocation
- **job_posting**: Job listings with detailed requirements
- **review**: Facility reviews with ratings
- **board**: Information board for general discussions

### MyBatis Configuration
- Config file: `src/main/resources/mybatis-config.xml`
- Mapper XMLs: `src/main/resources/mapper/*.xml`
- Automatic camelCase mapping enabled
- Type aliases configured for DTOs

### Frontend Architecture
- **Thymeleaf**: Server-side templating with Spring Boot integration
- **Layout system**: Header/footer fragments in `templates/layout/`
- **Static resources**: CSS/JS in `src/main/resources/static/`
- **Bootstrap 5**: Responsive UI framework

## Configuration Files

### application.yml
- Server port: 8080
- Database connection settings
- Thymeleaf configuration with cache disabled for development
- File upload settings (10MB max)
- MyBatis mapper locations

### Key Configuration Notes
- Korean language support with UTF-8 encoding
- Logging enabled for MyBatis and Spring Web
- Database timezone set to Asia/Seoul

## Development Patterns

### Controller Pattern
Controllers follow Spring MVC conventions with:
- `@Controller` annotation
- Model attributes for view data
- Proper HTTP method mappings
- Logging with Lombok `@Slf4j`

### Service Layer
Business logic separated from controllers:
- Transactional operations
- Data validation
- Cross-cutting concerns

### MyBatis Mappers
SQL operations defined in XML mappers:
- Parameterized queries with `#{}` syntax
- Result mapping to DTOs
- Complex queries with joins for reporting

## Testing

### Test Structure
- Unit tests with JUnit 5
- Spring Boot Test for integration testing
- Test configuration separate from production

### Test Commands
```bash
# Run all tests
./gradlew test

# Run specific test class
./gradlew test --tests "ClassName"
```

## Team Collaboration Guidelines

### Git Workflow
- Feature branches: `feature/member-기능명`
- Commit message format: `[feat] 기능 설명`
- Code review through Pull Requests

### Code Conventions
- Class names: PascalCase
- Method names: camelCase
- Constants: UPPER_SNAKE_CASE
- Package names: lowercase

## Special Considerations

### Korean Language Support
- All text content in Korean
- UTF-8 encoding throughout
- Korean naming conventions in comments and documentation

### Mapping Integration
- Kakao Maps API integration planned for facility location
- Latitude/longitude storage for geolocation features

### User Roles
The system supports multiple user roles:
- `USER`: General job seekers
- `FACILITY`: Nursing facility administrators
- `ADMIN`: System administrators

## Environment Variables

When setting up, configure:
- `spring.datasource.password`: MySQL password
- Database URL if different from localhost
- Any API keys for mapping services (when implemented)