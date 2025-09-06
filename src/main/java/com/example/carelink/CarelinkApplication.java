package com.example.carelink;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 요양원 구인구직 사이트 메인 애플리케이션
 * 팀 프로젝트 - 4인 협업 개발
 */
@SpringBootApplication
@MapperScan(basePackages = {"com.example.carelink.dao"})
public class CarelinkApplication {

    public static void main(String[] args) {
        SpringApplication.run(CarelinkApplication.class, args);
        System.out.println("========================================");
        System.out.println("    요양원 구인구직 사이트 시작됨!        ");
        System.out.println("    포트: http://localhost:8080         ");
        System.out.println("========================================");
    }
}