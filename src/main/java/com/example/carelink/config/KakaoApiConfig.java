package com.example.carelink.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

/**
 * 카카오 API 키 설정을 위한 Configuration
 */
@Configuration
public class KakaoApiConfig implements WebMvcConfigurer {

    @Value("${api.kakao.app-key}")
    private String kakaoAppKey;
    
    // 환경변수를 직접 읽는 방법도 추가
    private String getKakaoAppKey() {
        String key = kakaoAppKey;
        if (key == null || key.isEmpty()) {
            key = System.getenv("KAKAO_APP_KEY");
            System.out.println("환경변수에서 직접 읽은 API 키: " + (key != null ? "존재함" : "없음"));
        }
        return key;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new KakaoApiInterceptor());
    }

    /**
     * 모든 페이지에 KAKAO_APP_KEY를 자동으로 추가하는 인터셉터
     */
    public class KakaoApiInterceptor implements HandlerInterceptor {

        @Override
        public void postHandle(HttpServletRequest request, HttpServletResponse response, 
                             Object handler, ModelAndView modelAndView) throws Exception {
            
            if (modelAndView != null && !modelAndView.getViewName().startsWith("redirect:")) {
                // 모든 뷰에 KAKAO_APP_KEY 추가
                String apiKey = getKakaoAppKey();
                System.out.println("뷰에 전달할 API 키: " + (apiKey != null && !apiKey.isEmpty() ? "존재함" : "없음"));
                modelAndView.addObject("KAKAO_APP_KEY", apiKey);
            }
        }
    }
}