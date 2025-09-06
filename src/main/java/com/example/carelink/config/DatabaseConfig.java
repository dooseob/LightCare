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
    public DataSource productionDataSource() {
        // 직접 HikariDataSource 구성
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl("jdbc:postgresql://dpg-crr4d6pu0jms73a5rp80-a.oregon-postgres.render.com:5432/lightcare_db?sslmode=require&sslrootcert=disable");
        dataSource.setUsername("lightcare_user");
        dataSource.setPassword("CqBmAY8J9rGY7xLsFzY7zNOuYg7sE6KY");
        dataSource.setDriverClassName("org.postgresql.Driver");
        
        // Connection pool 설정
        dataSource.setMaximumPoolSize(3);
        dataSource.setMinimumIdle(1);
        dataSource.setConnectionTimeout(30000);
        dataSource.setIdleTimeout(300000);
        dataSource.setMaxLifetime(1200000);
        
        return dataSource;
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