#!/bin/bash

# ================================================
# 업로드된 파일들 정리 스크립트
# ================================================

echo "🧹 파일 시스템 정리 시작..."

# 시설 이미지 파일들 삭제
if [ -d "C:/carelink-uploads/facility" ]; then
    echo "📁 시설 이미지 폴더 정리 중..."
    rm -rf C:/carelink-uploads/facility/*
    echo "✅ 시설 이미지 파일들 삭제 완료"
else
    echo "⚠️ 시설 이미지 폴더가 없습니다: C:/carelink-uploads/facility"
fi

# 프로필 이미지 파일들 삭제 (선택사항)
if [ -d "C:/carelink-uploads/member" ]; then
    echo "📁 프로필 이미지 폴더 정리 중..."
    rm -rf C:/carelink-uploads/member/*
    echo "✅ 프로필 이미지 파일들 삭제 완료"
else
    echo "⚠️ 프로필 이미지 폴더가 없습니다: C:/carelink-uploads/member"
fi

# Gradle 빌드 캐시 정리
echo "🔄 Gradle 캐시 정리 중..."
./gradlew clean

echo "✨ 파일 시스템 정리 완료!"
echo ""
echo "🔄 다음 단계:"
echo "1. 데이터베이스 초기화 실행"
echo "2. 애플리케이션 재시작"
echo "3. 새로운 이미지로 테스트"