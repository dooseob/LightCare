#!/bin/bash

# 서버 종료 스크립트
echo "🛑 LightCare 서버 종료 중..."

# PID 파일 확인
PID_FILE="/home/carelink/carelink.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat $PID_FILE)
    if ps -p $PID > /dev/null; then
        echo "프로세스 종료: PID $PID"
        kill $PID
        sleep 3
        
        # 강제 종료 필요시
        if ps -p $PID > /dev/null; then
            echo "강제 종료 실행..."
            kill -9 $PID
        fi
        
        rm -f $PID_FILE
        echo "✅ 서버가 종료되었습니다."
    else
        echo "⚠️ PID $PID 프로세스가 실행중이지 않습니다."
        rm -f $PID_FILE
    fi
else
    echo "⚠️ PID 파일이 없습니다. 프로세스 검색 중..."
    
    # JAR 파일로 실행중인 프로세스 찾기
    PID=$(pgrep -f "carelink.jar")
    
    if [ ! -z "$PID" ]; then
        echo "프로세스 발견: PID $PID"
        kill $PID
        sleep 3
        
        if pgrep -f "carelink.jar" > /dev/null; then
            echo "강제 종료 실행..."
            pkill -9 -f "carelink.jar"
        fi
        echo "✅ 서버가 종료되었습니다."
    else
        echo "ℹ️ 실행중인 서버가 없습니다."
    fi
fi