package com.example.carelink.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 시설 이미지 DTO
 * 다중 이미지 지원을 위한 별도 DTO
 */
@Data
public class FacilityImageDTO {
    private Long imageId;
    private Long facilityId;
    private String imagePath;
    private String imageAltText;
    private Integer imageOrder;
    private Boolean isMainImage;
    private LocalDateTime uploadDate;
    private LocalDateTime updatedAt;
}