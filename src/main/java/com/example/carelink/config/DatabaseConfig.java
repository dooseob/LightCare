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
        
        // 환경 변수에서 DATABASE_URL 가져오기 (Render에서 자동 제공)
        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl != null && !databaseUrl.isEmpty()) {
            try {
                // Render DATABASE_URL 파싱: postgres://user:pass@host:port/database
                java.net.URI uri = new java.net.URI(databaseUrl);
                String host = uri.getHost();
                int port = uri.getPort();
                String database = uri.getPath().substring(1); // '/' 제거
                String userInfo = uri.getUserInfo();
                
                if (userInfo != null) {
                    String[] parts = userInfo.split(":");
                    String username = parts[0];
                    String password = parts.length > 1 ? parts[1] : "";
                    
                    config.setUsername(username);
                    config.setPassword(password);
                }
                
                // JDBC URL 구성 (SSL 관련 설정 완화)
                databaseUrl = String.format("jdbc:postgresql://%s:%d/%s?sslmode=prefer&sslrootcert=disable", 
                    host, port, database);
            } catch (Exception e) {
                // 파싱 실패시 폴백
                System.err.println("DATABASE_URL 파싱 실패: " + e.getMessage());
                databaseUrl = "jdbc:postgresql://dpg-crr4d6pu0jms73a5rp80-a.oregon-postgres.render.com:5432/lightcare_db?sslmode=require";
                config.setUsername("lightcare_user");
                config.setPassword("CqBmAY8J9rGY7xLsFzY7zNOuYg7sE6KY");
            }
        } else {
            // 환경 변수가 없으면 외부 URL 사용
            databaseUrl = "jdbc:postgresql://dpg-crr4d6pu0jms73a5rp80-a.oregon-postgres.render.com:5432/lightcare_db?sslmode=require";
            config.setUsername("lightcare_user");
            config.setPassword("CqBmAY8J9rGY7xLsFzY7zNOuYg7sE6KY");
        }
        
        config.setJdbcUrl(databaseUrl);
        
        // Connection pool settings
        config.setMaximumPoolSize(3);
        config.setMinimumIdle(1);
        config.setConnectionTimeout(30000);  // 30초로 증가
        config.setIdleTimeout(300000);
        config.setMaxLifetime(1200000);
        
        // PostgreSQL 특정 설정 (SSL 설정 완화)
        config.addDataSourceProperty("ssl", "true");
        config.addDataSourceProperty("sslmode", "prefer");
        config.addDataSourceProperty("sslfactory", "org.postgresql.ssl.NonValidatingFactory");
        
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