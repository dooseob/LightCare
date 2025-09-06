package com.example.carelink.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    @Bean
    @Profile("production")
    public DataSource productionDataSource() {
        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.postgresql.Driver");
        
        // Spring Boot의 자동 구성을 사용하지 않고 환경변수에서 직접 가져오기
        String jdbcUrl = System.getenv("JDBC_DATABASE_URL");
        String username = System.getenv("DB_USER");  
        String password = System.getenv("DB_PASSWORD");
        
        // Render가 제공하는 기본 DATABASE_URL 파싱 시도
        if (jdbcUrl == null) {
            String databaseUrl = System.getenv("DATABASE_URL");
            System.out.println("Raw DATABASE_URL: " + (databaseUrl != null ? databaseUrl.replaceAll(":[^:@]+@", ":***@") : "null"));
            
            if (databaseUrl != null && !databaseUrl.isEmpty()) {
                try {
                    java.net.URI uri = new java.net.URI(databaseUrl);
                    String host = uri.getHost();
                    int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                    String database = uri.getPath().substring(1);
                    String userInfo = uri.getUserInfo();
                    
                    if (userInfo != null) {
                        String[] parts = userInfo.split(":");
                        username = parts[0];
                        password = parts.length > 1 ? parts[1] : "";
                    }
                    
                    // SSL을 완전히 비활성화한 URL 시도
                    jdbcUrl = String.format("jdbc:postgresql://%s:%d/%s?sslmode=disable", 
                        host, port, database);
                    System.out.println("Constructed JDBC URL: " + jdbcUrl.replaceAll("@[^/]+", "@***"));
                } catch (Exception e) {
                    System.err.println("DATABASE_URL 파싱 실패: " + e.getMessage());
                    e.printStackTrace();
                }
            }
        }
        
        // 폴백 설정
        if (jdbcUrl == null) {
            jdbcUrl = "jdbc:postgresql://dpg-crr4d6pu0jms73a5rp80-a.oregon-postgres.render.com:5432/lightcare_db?sslmode=disable";
            username = "lightcare_user";
            password = "CqBmAY8J9rGY7xLsFzY7zNOuYg7sE6KY";
            System.out.println("Using fallback configuration");
        }
        
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);
        
        // Connection pool settings
        config.setMaximumPoolSize(3);
        config.setMinimumIdle(1);
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(300000);
        config.setMaxLifetime(1200000);
        
        System.out.println("Final JDBC URL: " + jdbcUrl.replaceAll("@[^/]+", "@***"));
        System.out.println("Username: " + username);
        
        return new HikariDataSource(config);
    }
    
    @Bean
    @Profile("!production")
    public DataSource localDataSource() {
        HikariConfig config = new HikariConfig();
        config.setDriverClassName("com.mysql.cj.jdbc.Driver");
        config.setJdbcUrl("jdbc:mysql://localhost:3306/carelink?useSSL=false&serverTimezone=Asia/Seoul&allowPublicKeyRetrieval=true&useUnicode=true&characterEncoding=UTF-8");
        config.setUsername("root");
        config.setPassword("mysql");
        
        return new HikariDataSource(config);
    }
}