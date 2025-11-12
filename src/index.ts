#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import { YouthApiClient } from "./youthApiClient.js";

// 환경 변수 로드
dotenv.config();

/**
 * MCP 청소년 활동 정보 서버
 * 공공데이터포털 청소년 활동 정보 API를 활용한 MCP 서버
 */

// 환경 변수 검증
const serviceKey = process.env.YOUTH_API_SERVICE_KEY;
if (!serviceKey) {
  console.error("오류: YOUTH_API_SERVICE_KEY 환경 변수가 설정되지 않았습니다.");
  console.error(".env 파일을 생성하고 API 키를 설정해주세요.");
  process.exit(1);
}

// API 클라이언트 초기화
const youthApiClient = new YouthApiClient({ serviceKey });

// 서버 인스턴스 생성
const server = new Server(
  {
    name: "youth-activity-server",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

/**
 * Tools 핸들러 등록
 * 사용 가능한 도구 목록 반환
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // 청소년 활동 API 관련 도구
      {
        name: "get_sido_list",
        description: "청소년 활동 정보 시도(광역자치단체) 목록을 조회합니다",
        inputSchema: {
          type: "object",
          properties: {
            pageNo: {
              type: "number",
              description: "페이지 번호 (기본값: 1)",
            },
            numOfRows: {
              type: "number",
              description: "한 페이지 결과 수 (기본값: 100)",
            },
          },
        },
      },
      {
        name: "get_sigungu_list",
        description: "특정 시도의 시군구(기초자치단체) 목록을 조회합니다",
        inputSchema: {
          type: "object",
          properties: {
            sido: {
              type: "string",
              description: "시도명 (예: 서울, 부산광역시, 경기도)",
            },
            pageNo: {
              type: "number",
              description: "페이지 번호 (기본값: 1)",
            },
            numOfRows: {
              type: "number",
              description: "한 페이지 결과 수 (기본값: 100)",
            },
          },
          required: ["sido"],
        },
      },
      {
        name: "search_youth_activities",
        description: "청소년 활동 프로그램을 검색합니다. 프로그램명, 기관명, 지역, 기간 등으로 필터링 가능합니다",
        inputSchema: {
          type: "object",
          properties: {
            pageNo: {
              type: "number",
              description: "페이지 번호 (기본값: 1)",
            },
            numOfRows: {
              type: "number",
              description: "한 페이지 결과 수 (기본값: 10)",
            },
            atName: {
              type: "string",
              description: "프로그램명 (선택사항)",
            },
            orgName: {
              type: "string",
              description: "주최자(기관명) (선택사항)",
            },
            sido: {
              type: "string",
              description: "시도명 (선택사항, 예: 서울, 부산광역시)",
            },
            startDate: {
              type: "string",
              description: "일활동기간시작일 (선택사항, YYYYMMDD 형식)",
            },
            endDate: {
              type: "string",
              description: "일활동기간종료일 (선택사항, YYYYMMDD 형식)",
            },
          },
        },
      },
      {
        name: "get_facility_group_list",
        description: "청소년 시설 그룹 목록을 조회합니다. 시도, 기관명, 기관유형으로 필터링 가능합니다",
        inputSchema: {
          type: "object",
          properties: {
            pageNo: {
              type: "number",
              description: "페이지 번호 (기본값: 1)",
            },
            numOfRows: {
              type: "number",
              description: "한 페이지 결과 수 (기본값: 10)",
            },
            sido: {
              type: "string",
              description: "시도명 (선택사항)",
            },
            stName: {
              type: "string",
              description: "기관명 (선택사항)",
            },
            gName: {
              type: "string",
              description: "기관유형명 (선택사항)",
            },
          },
        },
      },
      // 기본 유틸리티 도구
      {
        name: "echo",
        description: "입력받은 메시지를 그대로 반환합니다",
        inputSchema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "반환할 메시지",
            },
          },
          required: ["message"],
        },
      },
      {
        name: "get_time",
        description: "현재 시간을 반환합니다",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

/**
 * Tool 실행 핸들러
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // 청소년 활동 API 도구들
      case "get_sido_list": {
        const pageNo = (args?.pageNo as number) || 1;
        const numOfRows = (args?.numOfRows as number) || 100;

        const result = await youthApiClient.getSidoList(pageNo, numOfRows);

        // 결과 포맷팅
        let resultText = `📍 시도 목록 (전체 ${result.totalCount}개)\n\n`;
        if (Array.isArray(result.items)) {
          result.items.forEach((item: any, index: number) => {
            resultText += `${index + 1}. ${item.ctpvNm || "N/A"} (코드: ${
              item.ctpvCode || "N/A"
            })\n`;
          });
        } else if (result.items) {
          // 단일 항목인 경우
          resultText += `1. ${result.items.ctpvNm || "N/A"} (코드: ${
            result.items.ctpvCode || "N/A"
          })\n`;
        } else {
          resultText += "조회된 항목이 없습니다.\n";
        }
        resultText += `\n페이지: ${pageNo}/${Math.ceil(
          result.totalCount / numOfRows
        )}`;

        return {
          content: [
            {
              type: "text",
              text: resultText,
            },
          ],
        };
      }

      case "get_sigungu_list": {
        const sido = args?.sido as string;
        const pageNo = (args?.pageNo as number) || 1;
        const numOfRows = (args?.numOfRows as number) || 100;

        const result = await youthApiClient.getSigunguList(
          sido,
          pageNo,
          numOfRows
        );

        let resultText = `📍 시군구 목록 (전체 ${result.totalCount}개)\n\n`;
        if (Array.isArray(result.items)) {
          result.items.forEach((item: any, index: number) => {
            resultText += `${index + 1}. ${item.sigunguNm || "N/A"} (코드: ${
              item.sigunguCode || "N/A"
            })\n`;
          });
        } else if (result.items) {
          resultText += `1. ${result.items.sigunguNm || "N/A"} (코드: ${
            result.items.sigunguCode || "N/A"
          })\n`;
        } else {
          resultText += "조회된 항목이 없습니다.\n";
        }
        resultText += `\n페이지: ${pageNo}/${Math.ceil(
          result.totalCount / numOfRows
        )}`;

        return {
          content: [
            {
              type: "text",
              text: resultText,
            },
          ],
        };
      }

      case "search_youth_activities": {
        const params = {
          pageNo: (args?.pageNo as number) || 1,
          numOfRows: (args?.numOfRows as number) || 10,
          atName: args?.atName as string | undefined,
          orgName: args?.orgName as string | undefined,
          sido: args?.sido as string | undefined,
          startDate: args?.startDate as string | undefined,
          endDate: args?.endDate as string | undefined,
        };

        const result = await youthApiClient.searchActivities(params);

        let resultText = `🎯 청소년 활동 검색 결과 (전체 ${result.totalCount}개)\n\n`;

        if (Array.isArray(result.items)) {
          result.items.forEach((item: any, index: number) => {
            const itemNum = (params.pageNo - 1) * params.numOfRows + index + 1;
            resultText += `${itemNum}. ${item.actTitle || "제목 없음"}\n`;
            if (item.organNm)
              resultText += `   기관: ${item.organNm}\n`;
            if (item.actBeginDt || item.actEndDt)
              resultText += `   기간: ${item.actBeginDt || "미정"} ~ ${
                item.actEndDt || "미정"
              }\n`;
            if (item.actPlace)
              resultText += `   장소: ${item.actPlace}\n`;
            if (item.actTarget)
              resultText += `   대상: ${item.actTarget}\n`;
            if (item.actPart)
              resultText += `   분야: ${item.actPart}\n`;
            if (item.youthPolicyShortIntro)
              resultText += `   소개: ${item.youthPolicyShortIntro}\n`;
            resultText += "\n";
          });
        } else if (result.items) {
          resultText += `1. ${result.items.actTitle || "제목 없음"}\n`;
          if (result.items.organNm)
            resultText += `   기관: ${result.items.organNm}\n`;
          if (result.items.actBeginDt || result.items.actEndDt)
            resultText += `   기간: ${result.items.actBeginDt || "미정"} ~ ${
              result.items.actEndDt || "미정"
            }\n`;
          if (result.items.actPlace)
            resultText += `   장소: ${result.items.actPlace}\n`;
          resultText += "\n";
        } else {
          resultText += "검색된 활동이 없습니다.\n\n";
        }

        resultText += `페이지: ${params.pageNo}/${Math.ceil(
          result.totalCount / params.numOfRows
        )}`;

        return {
          content: [
            {
              type: "text",
              text: resultText,
            },
          ],
        };
      }

      case "get_facility_group_list": {
        const params = {
          pageNo: (args?.pageNo as number) || 1,
          numOfRows: (args?.numOfRows as number) || 10,
          sido: args?.sido as string | undefined,
          stName: args?.stName as string | undefined,
          gName: args?.gName as string | undefined,
        };

        const result = await youthApiClient.getFacilityGroupList(params);

        let resultText = `🏢 청소년 시설 그룹 목록 (전체 ${result.totalCount}개)\n\n`;

        if (Array.isArray(result.items)) {
          result.items.forEach((item: any, index: number) => {
            const itemNum = (params.pageNo - 1) * params.numOfRows + index + 1;
            resultText += `${itemNum}. ${item.faciNm || "시설명 없음"}\n`;
            if (item.instlNm)
              resultText += `   기관명: ${item.instlNm}\n`;
            if (item.gNm)
              resultText += `   유형: ${item.gNm}\n`;
            if (item.rdnmadr)
              resultText += `   주소: ${item.rdnmadr}\n`;
            if (item.phoneNumber)
              resultText += `   전화: ${item.phoneNumber}\n`;
            resultText += "\n";
          });
        } else if (result.items) {
          resultText += `1. ${result.items.faciNm || "시설명 없음"}\n`;
          if (result.items.instlNm)
            resultText += `   기관명: ${result.items.instlNm}\n`;
          if (result.items.gNm)
            resultText += `   유형: ${result.items.gNm}\n`;
          resultText += "\n";
        } else {
          resultText += "검색된 시설이 없습니다.\n\n";
        }

        resultText += `페이지: ${params.pageNo}/${Math.ceil(
          result.totalCount / params.numOfRows
        )}`;

        return {
          content: [
            {
              type: "text",
              text: resultText,
            },
          ],
        };
      }

      // 기본 유틸리티 도구들
      case "echo": {
        const message = args?.message as string;
        return {
          content: [
            {
              type: "text",
              text: `Echo: ${message}`,
            },
          ],
        };
      }

      case "get_time": {
        const now = new Date();
        return {
          content: [
            {
              type: "text",
              text: `현재 시간: ${now.toISOString()}\n로컬 시간: ${now.toLocaleString(
                "ko-KR"
              )}`,
            },
          ],
        };
      }

      default:
        throw new Error(`알 수 없는 도구: ${name}`);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `오류 발생: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Resources 핸들러 등록
 * 사용 가능한 리소스 목록 반환
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "youth://info",
        mimeType: "text/plain",
        name: "서버 정보",
        description: "청소년 활동 정보 서버의 기본 정보",
      },
      {
        uri: "youth://api-guide",
        mimeType: "text/plain",
        name: "API 가이드",
        description: "공공데이터포털 청소년 활동 정보 API 사용 가이드",
      },
      {
        uri: "youth://sido-codes",
        mimeType: "text/plain",
        name: "시도 코드표",
        description: "주요 시도 코드 참조표",
      },
    ],
  };
});

/**
 * Resource 읽기 핸들러
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case "youth://info":
      return {
        contents: [
          {
            uri,
            mimeType: "text/plain",
            text: `청소년 활동 정보 MCP 서버 v2.0.0

이 서버는 공공데이터포털의 청소년 활동 정보 API를 활용한 MCP 서버입니다.

📋 제공 기능:

🔧 Tools (도구):
- get_sido_list: 시도 목록 조회
- get_sigungu_list: 시군구 목록 조회
- search_youth_activities: 청소년 활동 검색
- echo: 메시지 에코
- get_time: 현재 시간 조회

📦 Resources (리소스):
- youth://info: 서버 정보
- youth://api-guide: API 사용 가이드
- youth://sido-codes: 시도 코드표

💬 Prompts (프롬프트):
- search-guide: 활동 검색 가이드
- region-guide: 지역 코드 가이드

📊 데이터 출처:
공공데이터포털 - 여성가족부 청소년 활동 정보
https://www.data.go.kr/`,
          },
        ],
      };

    case "youth://api-guide":
      return {
        contents: [
          {
            uri,
            mimeType: "text/plain",
            text: `청소년 활동 정보 API 사용 가이드

📌 기본 사용법:

1. 시도 목록 조회:
   - Tool: get_sido_list
   - 전국의 시도(광역자치단체) 목록을 조회합니다
   - 시도 코드를 확인하여 다음 단계에서 사용

2. 시군구 목록 조회:
   - Tool: get_sigungu_list
   - 특정 시도의 시군구(기초자치단체) 목록을 조회합니다
   - 파라미터: ctpvCode (시도코드)

3. 청소년 활동 검색:
   - Tool: search_youth_activities
   - 다양한 조건으로 청소년 활동 정보를 검색합니다
   - 선택 파라미터:
     * keyword: 검색어
     * schCtpvCode: 시도코드
     * schSigunguCode: 시군구코드
     * pageNo: 페이지 번호
     * numOfRows: 페이지당 결과 수

🔑 환경 설정:
- .env 파일에 YOUTH_API_SERVICE_KEY 설정 필요
- 공공데이터포털(www.data.go.kr)에서 API 키 발급

💡 사용 예시:
1. 서울시의 모든 활동 검색
   schCtpvCode: "11"

2. 키워드로 활동 검색
   keyword: "봉사"

3. 특정 지역의 특정 활동 검색
   schCtpvCode: "11", keyword: "문화"`,
          },
        ],
      };

    case "youth://sido-codes":
      return {
        contents: [
          {
            uri,
            mimeType: "text/plain",
            text: `주요 시도 코드표

📍 광역자치단체 코드:

11 - 서울특별시
21 - 부산광역시
22 - 대구광역시
23 - 인천광역시
24 - 광주광역시
25 - 대전광역시
26 - 울산광역시
29 - 세종특별자치시
31 - 경기도
32 - 강원도
33 - 충청북도
34 - 충청남도
35 - 전라북도
36 - 전라남도
37 - 경상북도
38 - 경상남도
39 - 제주특별자치도

💡 사용법:
- get_sigungu_list에서 ctpvCode로 사용
- search_youth_activities에서 schCtpvCode로 사용

예: 서울시의 시군구 조회
get_sigungu_list(ctpvCode: "11")`,
          },
        ],
      };

    default:
      throw new Error(`알 수 없는 리소스: ${uri}`);
  }
});

/**
 * Prompts 핸들러 등록
 * 사용 가능한 프롬프트 목록 반환
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "search-guide",
        description: "청소년 활동 검색 방법을 안내하는 프롬프트",
        arguments: [
          {
            name: "region",
            description: "관심 지역 (선택사항)",
            required: false,
          },
        ],
      },
      {
        name: "region-guide",
        description: "지역 코드 조회 방법을 안내하는 프롬프트",
      },
    ],
  };
});

/**
 * Prompt 가져오기 핸들러
 */
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "search-guide": {
      const region = args?.region || "";
      const regionText = region ? `${region} 지역의 ` : "";

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `청소년 활동 정보 검색 가이드

${regionText}청소년 활동 정보를 검색하는 방법을 안내합니다.

📋 검색 순서:

1️⃣ 시도 목록 조회 (선택사항)
   - get_sido_list 도구 사용
   - 전국의 시도 목록과 코드를 확인합니다
   ${region ? `- "${region}"의 코드를 확인하세요` : ""}

2️⃣ 시군구 목록 조회 (선택사항)
   - get_sigungu_list 도구 사용
   - 특정 시도의 시군구 목록을 확인합니다
   - 파라미터: ctpvCode (시도코드)

3️⃣ 청소년 활동 검색
   - search_youth_activities 도구 사용
   - 다양한 조건으로 활동을 검색합니다

   검색 옵션:
   - keyword: 관심 키워드 (예: "봉사", "문화", "체험" 등)
   - schCtpvCode: 시도 코드 (예: "11" - 서울)
   - schSigunguCode: 시군구 코드
   - numOfRows: 한 번에 볼 결과 수 (기본 10개)

💡 검색 예시:
- 서울시의 봉사활동 찾기:
  schCtpvCode: "11", keyword: "봉사"

- 전국의 문화 활동 찾기:
  keyword: "문화"

- 더 많은 결과 보기:
  numOfRows: 20

시작해볼까요? 어떤 활동을 찾고 계신가요?`,
            },
          },
        ],
      };
    }

    case "region-guide": {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `청소년 활동 지역 코드 조회 가이드

지역별 청소년 활동을 찾기 위해 필요한 지역 코드를 조회하는 방법입니다.

🗺️ 시도(광역자치단체) 코드 확인:

방법 1: 직접 조회
   - get_sido_list 도구를 사용하여 전체 시도 목록과 코드를 확인

방법 2: 리소스 참조
   - youth://sido-codes 리소스에서 주요 시도 코드 참조

주요 시도 코드:
• 11 - 서울특별시
• 21 - 부산광역시
• 23 - 인천광역시
• 31 - 경기도
• 그 외 리소스에서 확인

🏘️ 시군구(기초자치단체) 코드 확인:

get_sigungu_list 도구 사용:
   - 파라미터: ctpvCode (시도코드)
   - 예: ctpvCode: "11" (서울시의 모든 구 조회)

📝 사용 흐름:

1. 관심 지역이 "서울 강남구"인 경우
   ① get_sido_list로 서울시 코드 확인 → "11"
   ② get_sigungu_list(ctpvCode: "11")로 강남구 코드 확인
   ③ search_youth_activities에서 두 코드 모두 사용

2. 관심 지역이 "경기도"인 경우
   ① get_sido_list로 경기도 코드 확인 → "31"
   ② search_youth_activities에서 schCtpvCode: "31" 사용

어떤 지역의 청소년 활동을 찾고 계신가요?`,
            },
          },
        ],
      };
    }

    default:
      throw new Error(`알 수 없는 프롬프트: ${name}`);
  }
});

/**
 * 서버 시작
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // stderr로 로그 출력 (stdout은 MCP 프로토콜용으로 사용)
  console.error("MCP 테스트 서버가 시작되었습니다");
}

main().catch((error) => {
  console.error("서버 오류:", error);
  process.exit(1);
});
