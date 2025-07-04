package com.example.carelink.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 웹 설정 클래스
 * 정적 리소스 매핑 등을 담당
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir.profile}")
    private String profileUploadDir;

    /**
     * 정적 리소스 핸들러 추가
     * 프로필 이미지 폴더를 웹에서 접근 가능하도록 매핑
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 프로필 이미지 정적 리소스 매핑
        // URL: /profile_images/** → 실제 경로: C:/uploads/profile_images/
        registry.addResourceHandler("/profile_images/**")
                .addResourceLocations("file:" + profileUploadDir);
        
        // 시설 이미지 정적 리소스 매핑
        // URL: /uploads/facility/** → 실제 경로: src/main/resources/static/uploads/facility/
        String projectRoot = System.getProperty("user.dir");
        String facilityImagePath = "file:" + projectRoot + "/src/main/resources/static/uploads/facility/";
        registry.addResourceHandler("/uploads/facility/**")
                .addResourceLocations(facilityImagePath);
        
        // 프로필 이미지 (static 폴더 내)
        String profileImagePath = "file:" + projectRoot + "/src/main/resources/static/uploads/profile/";
        registry.addResourceHandler("/uploads/profile/**")
                .addResourceLocations(profileImagePath);
    }
}