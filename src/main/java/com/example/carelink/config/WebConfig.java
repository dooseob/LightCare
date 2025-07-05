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

    @Value("${file.upload-dir.facility}")
    private String facilityUploadDir;
    
    @Value("${file.upload-dir.profile}")
    private String profileUploadDir;

    /**
     * 정적 리소스 핸들러 추가
     * 로컬 업로드 디렉토리와 테스트 이미지 폴더 매핑
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 로컬 업로드 디렉토리 매핑 (실제 운영 이미지)
        registry.addResourceHandler("/uploads/facility/**")
                .addResourceLocations("file:" + facilityUploadDir);
        
        registry.addResourceHandler("/uploads/profile/**")
                .addResourceLocations("file:" + profileUploadDir);
        
        // 테스트 이미지 매핑 (Git 공유용)
        String projectRoot = System.getProperty("user.dir");
        registry.addResourceHandler("/test-images/facilities/**")
                .addResourceLocations("file:" + projectRoot + "/images/facilities/");
        
        registry.addResourceHandler("/test-images/profiles/**")
                .addResourceLocations("file:" + projectRoot + "/images/profiles/");
    }
}