# 이미지 최적화 & SEO 강화 계획

## 🎯 목표
- WebP 이미지 변환으로 50% 용량 절약
- SEO 점수 90점 이상 달성  
- 페이지 로딩 속도 30% 개선
- 접근성(Accessibility) AA 등급 달성

## 📋 Phase 1: 이미지 최적화 시스템

### 1.1 WebP 변환 라이브러리 추가
```gradle
// build.gradle 추가
implementation 'org.sejda.imageio:imageio-webp:0.1.6'
implementation 'net.coobird:thumbnailator:0.4.19'
```

### 1.2 이미지 처리 서비스 확장
```java
@Service
public class ImageOptimizationService {
    
    // WebP 변환
    public String convertToWebP(MultipartFile originalFile);
    
    // 다중 사이즈 썸네일 생성
    public Map<String, String> generateThumbnails(String imagePath);
    
    // 메타데이터 추출
    public ImageMetadata extractMetadata(MultipartFile file);
    
    // 브라우저 호환성 체크
    public boolean supportsWebP(HttpServletRequest request);
}
```

### 1.3 데이터베이스 스키마 확장
```sql
-- 이미지 테이블 확장
ALTER TABLE facility_images ADD COLUMN alt_text VARCHAR(255);
ALTER TABLE facility_images ADD COLUMN webp_path VARCHAR(500);
ALTER TABLE facility_images ADD COLUMN file_size INT;
ALTER TABLE facility_images ADD COLUMN width INT;
ALTER TABLE facility_images ADD COLUMN height INT;

-- 새 테이블: 이미지 썸네일
CREATE TABLE image_thumbnails (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    original_image_id BIGINT,
    size_name VARCHAR(50), -- 'small', 'medium', 'large'
    file_path VARCHAR(500),
    webp_path VARCHAR(500),
    width INT,
    height INT,
    FOREIGN KEY (original_image_id) REFERENCES facility_images(id)
);
```

## 📋 Phase 2: SEO 최적화

### 2.1 메타태그 동적 생성 시스템
```java
@Component
public class SEOMetaService {
    
    public MetaTagDTO generateFacilityMeta(FacilityDTO facility) {
        return MetaTagDTO.builder()
            .title(facility.getName() + " | 라이트케어")
            .description(generateDescription(facility))
            .keywords(generateKeywords(facility))
            .ogImage(facility.getOptimizedImageUrl())
            .build();
    }
    
    private String generateDescription(FacilityDTO facility) {
        return String.format("%s 지역의 %s - %s", 
            facility.getAddress(), facility.getName(), 
            facility.getShortDescription());
    }
}
```

### 2.2 구조화 데이터 생성
```java
@Component
public class StructuredDataService {
    
    public String generateLocalBusinessSchema(FacilityDTO facility) {
        // JSON-LD 형태의 구조화 데이터 생성
        return JsonBuilder.create()
            .add("@context", "https://schema.org")
            .add("@type", "HealthAndBeautyBusiness")
            .add("name", facility.getName())
            .add("image", facility.getWebPImageUrl())
            .add("address", generateAddress(facility))
            .build();
    }
}
```

### 2.3 시멘틱 HTML 템플릿 개선
```html
<!-- 기존 div 구조를 시멘틱 태그로 변경 -->
<main role="main">
    <article itemscope itemtype="http://schema.org/LocalBusiness">
        <header>
            <h1 itemprop="name">[[${facility.name}]]</h1>
        </header>
        
        <section class="facility-images">
            <picture>
                <source media="(min-width: 800px)" 
                        srcset="[[${facility.largeWebPImage}]]" 
                        type="image/webp">
                <source media="(min-width: 400px)" 
                        srcset="[[${facility.mediumWebPImage}]]" 
                        type="image/webp">
                <img src="[[${facility.smallWebPImage}]]" 
                     alt="[[${facility.imageAlt}]]"
                     itemprop="image"
                     loading="lazy"
                     width="300" height="200">
            </picture>
        </section>
        
        <section class="facility-info">
            <p itemprop="description">[[${facility.description}]]</p>
            <address itemprop="address">[[${facility.fullAddress}]]</address>
        </section>
    </article>
</main>
```

## 📋 Phase 3: 성능 최적화

### 3.1 이미지 Lazy Loading 구현
```javascript
// 교차점 관찰자 API 활용
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
        }
    });
});

document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
});
```

### 3.2 이미지 압축 및 최적화
```java
public class ImageCompressionService {
    
    public CompressedImage compressImage(MultipartFile file) {
        return Thumbnails.of(file.getInputStream())
            .size(1200, 800)  // 최대 크기 제한
            .outputQuality(0.85)  // 85% 품질
            .outputFormat("webp")
            .asBufferedImage();
    }
    
    public String generateResponsiveImageSet(String originalPath) {
        // 여러 사이즈 생성: 400px, 800px, 1200px
        Map<String, String> sizes = new HashMap<>();
        sizes.put("small", generateThumbnail(originalPath, 400));
        sizes.put("medium", generateThumbnail(originalPath, 800));
        sizes.put("large", generateThumbnail(originalPath, 1200));
        return sizes;
    }
}
```

## 📋 Phase 4: 접근성 개선

### 4.1 이미지 Alt 텍스트 자동 생성
```java
@Service
public class AccessibilityService {
    
    public String generateAltText(FacilityDTO facility, String imageType) {
        switch(imageType) {
            case "exterior":
                return facility.getName() + " 외관 사진";
            case "interior":
                return facility.getName() + " 내부 시설 사진";
            case "room":
                return facility.getName() + " 객실 사진";
            default:
                return facility.getName() + " 시설 사진";
        }
    }
    
    public boolean validateAltText(String altText) {
        return altText != null && 
               altText.length() >= 10 && 
               altText.length() <= 125 &&
               !altText.toLowerCase().contains("image");
    }
}
```

## 📊 측정 지표

### 성능 지표
- [ ] 이미지 로딩 시간 50% 단축
- [ ] 전체 페이지 크기 30% 감소
- [ ] Lighthouse 성능 점수 90+ 달성

### SEO 지표  
- [ ] Google PageSpeed 점수 90+ 달성
- [ ] 구조화 데이터 오류 0개
- [ ] 메타태그 누락 0개

### 접근성 지표
- [ ] Alt 텍스트 누락 0개
- [ ] WCAG 2.1 AA 등급 달성
- [ ] 스크린 리더 호환성 100%

## 🚀 구현 순서

1. **Week 1**: WebP 변환 시스템 구축
2. **Week 2**: SEO 메타태그 시스템 완성  
3. **Week 3**: 시멘틱 HTML 적용
4. **Week 4**: 성능 최적화 및 테스트

## ⚠️ 주의사항

- 기존 이미지 마이그레이션 계획 필요
- WebP 미지원 브라우저 fallback 대응
- 서버 디스크 용량 증가 고려
- CDN 도입 검토 (추후 고려)