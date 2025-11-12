/**
 * 청소년 활동 정보 API 클라이언트
 * 공공데이터포털 API를 호출하는 모듈
 */

import axios, { AxiosInstance } from "axios";
import { parseStringPromise } from "xml2js";

const BASE_URL = "https://apis.data.go.kr/1383000/YouthActivInfoSrvc";

export interface YouthApiConfig {
  serviceKey: string;
}

export interface SidoItem {
  ctpvNm?: string; // 시도명
  ctpvCode?: string; // 시도코드
}

export interface ActivityItem {
  actTitle?: string; // 활동명
  organNm?: string; // 기관명
  actBeginDt?: string; // 시작일
  actEndDt?: string; // 종료일
  actPlace?: string; // 활동장소
  youthPolicyShortIntro?: string; // 간단 소개
  actTarget?: string; // 대상
  actPart?: string; // 분야
}

export class YouthApiClient {
  private client: AxiosInstance;
  private serviceKey: string;

  constructor(config: YouthApiConfig) {
    this.serviceKey = config.serviceKey;
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
    });
  }

  /**
   * XML 응답을 JSON으로 파싱
   */
  private async parseXmlResponse(xmlData: string): Promise<any> {
    try {
      // 디버깅: 응답 데이터 로깅
      console.error("API 응답 타입:", typeof xmlData);
      console.error("API 응답 앞 100자:", xmlData.substring(0, 100));

      const result = await parseStringPromise(xmlData, {
        explicitArray: false,
        ignoreAttrs: true,
        trim: true,
      });
      return result;
    } catch (error) {
      console.error("XML 파싱 에러. 전체 응답:", xmlData);
      throw new Error(`XML 파싱 실패: ${error}`);
    }
  }

  /**
   * 시도 목록 조회
   * @param pageNo 페이지 번호 (기본값: 1)
   * @param numOfRows 한 페이지 결과 수 (기본값: 100)
   */
  async getSidoList(
    pageNo: number = 1,
    numOfRows: number = 100
  ): Promise<any> {
    try {
      const response = await this.client.get("/getSidoList", {
        params: {
          serviceKey: this.serviceKey,
          pageNo,
          numOfRows,
        },
      });

      // XML 응답 파싱
      const parsedData = await this.parseXmlResponse(response.data);

      // 응답 구조 확인
      if (parsedData.response) {
        const header = parsedData.response.header;
        const body = parsedData.response.body;

        // 에러 체크
        if (header?.resultCode !== "00") {
          throw new Error(
            `API 오류: ${header?.resultMsg || "알 수 없는 오류"}`
          );
        }

        return {
          totalCount: parseInt(body?.totalCount || "0"),
          items: body?.items?.item || [],
          pageNo,
          numOfRows,
        };
      }

      throw new Error("예상치 못한 응답 형식");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `API 호출 실패: ${error.message}${
            error.response?.data ? ` - ${error.response.data}` : ""
          }`
        );
      }
      throw error;
    }
  }

  /**
   * 청소년 활동 프로그램 목록 조회
   * @param params 검색 파라미터
   */
  async searchActivities(params: {
    pageNo?: number;
    numOfRows?: number;
    atName?: string; // 프로그램명
    orgName?: string; // 주최자(기관명)
    sido?: string; // 시도
    startDate?: string; // 일활동기간시작일 (YYYYMMDD)
    endDate?: string; // 일활동기간종료일 (YYYYMMDD)
  }): Promise<any> {
    try {
      const response = await this.client.get("/getJtvtsProgrmList", {
        params: {
          serviceKey: this.serviceKey,
          pageNo: params.pageNo || 1,
          numOfRows: params.numOfRows || 10,
          atName: params.atName,
          orgName: params.orgName,
          sido: params.sido,
          startDate: params.startDate,
          endDate: params.endDate,
        },
      });

      const parsedData = await this.parseXmlResponse(response.data);

      if (parsedData.response) {
        const header = parsedData.response.header;
        const body = parsedData.response.body;

        if (header?.resultCode !== "00") {
          throw new Error(
            `API 오류: ${header?.resultMsg || "알 수 없는 오류"}`
          );
        }

        return {
          totalCount: parseInt(body?.totalCount || "0"),
          items: body?.items?.item || [],
          pageNo: params.pageNo || 1,
          numOfRows: params.numOfRows || 10,
        };
      }

      throw new Error("예상치 못한 응답 형식");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `API 호출 실패: ${error.message}${
            error.response?.data ? ` - ${error.response.data}` : ""
          }`
        );
      }
      throw error;
    }
  }

  /**
   * 청소년 시설 그룹 목록 조회
   * @param params 검색 파라미터
   */
  async getFacilityGroupList(params: {
    pageNo?: number;
    numOfRows?: number;
    sido?: string; // 시도
    stName?: string; // 기관명
    gName?: string; // 기관유형명
  }): Promise<any> {
    try {
      const response = await this.client.get("/getJltlsGrpList", {
        params: {
          serviceKey: this.serviceKey,
          pageNo: params.pageNo || 1,
          numOfRows: params.numOfRows || 10,
          sido: params.sido,
          stName: params.stName,
          gName: params.gName,
        },
      });

      const parsedData = await this.parseXmlResponse(response.data);

      if (parsedData.response) {
        const header = parsedData.response.header;
        const body = parsedData.response.body;

        if (header?.resultCode !== "00") {
          throw new Error(
            `API 오류: ${header?.resultMsg || "알 수 없는 오류"}`
          );
        }

        return {
          totalCount: parseInt(body?.totalCount || "0"),
          items: body?.items?.item || [],
          pageNo: params.pageNo || 1,
          numOfRows: params.numOfRows || 10,
        };
      }

      throw new Error("예상치 못한 응답 형식");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `API 호출 실패: ${error.message}${
            error.response?.data ? ` - ${error.response.data}` : ""
          }`
        );
      }
      throw error;
    }
  }

  /**
   * 시군구 목록 조회
   * @param sido 시도명 (예: 서울, 부산광역시)
   * @param pageNo 페이지 번호
   * @param numOfRows 한 페이지 결과 수
   */
  async getSigunguList(
    sido: string,
    pageNo: number = 1,
    numOfRows: number = 100
  ): Promise<any> {
    try {
      const response = await this.client.get("/getSigunguList", {
        params: {
          serviceKey: this.serviceKey,
          sido,
          pageNo,
          numOfRows,
        },
      });

      const parsedData = await this.parseXmlResponse(response.data);

      if (parsedData.response) {
        const header = parsedData.response.header;
        const body = parsedData.response.body;

        if (header?.resultCode !== "00") {
          throw new Error(
            `API 오류: ${header?.resultMsg || "알 수 없는 오류"}`
          );
        }

        return {
          totalCount: parseInt(body?.totalCount || "0"),
          items: body?.items?.item || [],
          pageNo,
          numOfRows,
        };
      }

      throw new Error("예상치 못한 응답 형식");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `API 호출 실패: ${error.message}${
            error.response?.data ? ` - ${error.response.data}` : ""
          }`
        );
      }
      throw error;
    }
  }
}
