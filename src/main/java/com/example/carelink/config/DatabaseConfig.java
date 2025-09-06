package com.example.carelink.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    @Bean
    @Primary
    @Profile("production")
    @ConfigurationProperties("spring.datasource.hikari")
    public DataSource productionDataSource() {
        // Spring Boot 자동 구성 사용
        // 환경 변수 DATABASE_URL을 사용하도록 application.yml에서 설정
        return DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .build();
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