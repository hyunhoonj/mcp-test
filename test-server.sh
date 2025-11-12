#!/bin/bash

# MCP 서버 간단 테스트 스크립트

echo "청소년 활동 정보 MCP 서버 테스트"
echo "================================"
echo ""

# 환경 변수 확인
if [ ! -f .env ]; then
    echo "❌ .env 파일이 없습니다."
    echo "   .env.example을 복사하여 .env 파일을 만들고 API 키를 설정하세요."
    exit 1
fi

# API 키 확인
source .env
if [ -z "$YOUTH_API_SERVICE_KEY" ]; then
    echo "❌ YOUTH_API_SERVICE_KEY가 설정되지 않았습니다."
    echo "   .env 파일에 API 키를 입력하세요."
    exit 1
fi

echo "✅ 환경 변수 확인 완료"
echo ""

# 빌드 확인
if [ ! -d build ]; then
    echo "📦 빌드 파일이 없습니다. 빌드를 시작합니다..."
    npm run build
    echo ""
fi

echo "✅ 빌드 완료"
echo ""
echo "서버를 시작합니다..."
echo "Ctrl+C를 눌러 종료할 수 있습니다."
echo ""

npm start
