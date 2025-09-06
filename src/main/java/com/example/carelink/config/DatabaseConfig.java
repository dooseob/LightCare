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
            // postgres:// -> jdbc:postgresql:// 변환
            if (databaseUrl.startsWith("postgres://")) {
                databaseUrl = databaseUrl.replace("postgres://", "jdbc:postgresql://");
            }
            // SSL 모드 추가
            if (!databaseUrl.contains("sslmode=")) {
                databaseUrl += (databaseUrl.contains("?") ? "&" : "?") + "sslmode=require";
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
        
        // PostgreSQL 특정 설정
        config.addDataSourceProperty("ssl", "true");
        config.addDataSourceProperty("sslmode", "require");
        
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