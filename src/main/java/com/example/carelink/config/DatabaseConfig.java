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
        config.setJdbcUrl("jdbc:postgresql://dpg-crr4d6pu0jms73a5rp80-a.oregon-postgres.render.com:5432/lightcare_db");
        config.setUsername("lightcare_user");
        config.setPassword("CqBmAY8J9rGY7xLsFzY7zNOuYg7sE6KY");
        
        // Connection pool settings
        config.setMaximumPoolSize(3);
        config.setMinimumIdle(1);
        config.setConnectionTimeout(20000);
        config.setIdleTimeout(300000);
        config.setMaxLifetime(1200000);
        
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