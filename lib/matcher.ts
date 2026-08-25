import type {
  MatchStatus,
  PolicyCategory,
  PolicyResult,
  SearchProfile,
  SearchResponse,
} from "@policy-search/contracts";

export interface PolicyDefinition {
  id: string;
  title: string;
  category: PolicyCategory;
  agency: string;
  topic: string;
  minAge: number | null;
  maxAge: number | null;
  allowedEmployment: string[];
  maxIncome: number | null;
  region: string;
  allowedIndustries?: string[];
  benefits: string[];
  deadline: string;
  url: string;
}

export const SAMPLE_POLICIES: PolicyDefinition[] = [
  // 🎓 [20대] 대학생 · 취준생 특화 정책
  {
    id: "101",
    title: "서울시 청년 대중교통비 지원사업",
    category: "individual",
    agency: "서울특별시 · 청년몽땅정보통",
    topic: "생활·교통",
    minAge: 19,
    maxAge: 24,
    allowedEmployment: ["대학생", "미취업", "대학원생", "재직중"],
    maxIncome: null,
    region: "서울특별시",
    benefits: ["연 최대 10만 원 교통마일리지 지급"],
    deadline: "2026-11-30",
    url: "https://youth.seoul.go.kr",
  },
  {
    id: "102",
    title: "대학생·대학원생 학자금 대출 이자 전액지원",
    category: "individual",
    agency: "한국장학재단 · 교육부",
    topic: "금융·학자금",
    minAge: 19,
    maxAge: 29,
    allowedEmployment: ["대학생", "대학원생"],
    maxIncome: 7000,
    region: "전국",
    benefits: ["한국장학재단 대출 발생이자 연간 전액 면제"],
    deadline: "2026-10-31",
    url: "https://www.kosaf.go.kr",
  },
  {
    id: "103",
    title: "청년 월세 특별지원 (보증금 및 월세 보조)",
    category: "individual",
    agency: "국토교통부 · 온통청년",
    topic: "주거",
    minAge: 19,
    maxAge: 34,
    allowedEmployment: ["대학생", "미취업", "대학원생", "재직중"],
    maxIncome: 3500,
    region: "전국",
    benefits: ["월 최대 20만 원씩 12개월(최대 240만 원) 현금 지급"],
    deadline: "2026-12-31",
    url: "https://www.youthcenter.go.kr",
  },
  {
    id: "104",
    title: "K-디지털 청년 AI·SW 역량 강화 부트캠프",
    category: "individual",
    agency: "과학기술정보통신부 · 고용노동부",
    topic: "교육·취업",
    minAge: 18,
    maxAge: 34,
    allowedEmployment: ["대학생", "미취업", "대학원생"],
    maxIncome: null,
    region: "전국",
    benefits: ["교육비 전액 국비지원 및 월 30만 원 훈련수당 지급"],
    deadline: "2026-12-15",
    url: "https://www.work.go.kr",
  },

  // 💼 [20~30대] 사회초년생 직장인 특화 정책
  {
    id: "201",
    title: "청년도약계좌 (정부 매칭지원금 & 비과세 혜택)",
    category: "individual",
    agency: "금융위원회 · 서민금융진흥원",
    topic: "금융·자산형성",
    minAge: 19,
    maxAge: 34,
    allowedEmployment: ["재직중"],
    maxIncome: 7500,
    region: "전국",
    benefits: ["매월 최대 70만 원 납입 시 5년 만기 최대 5,000만 원 목돈 형성"],
    deadline: "2026-12-31",
    url: "https://www.kinfa.or.kr",
  },
  {
    id: "202",
    title: "경기도 청년 복지포인트 및 근로장려 지원",
    category: "individual",
    agency: "경기도 · 경기청년포털",
    topic: "복지·근로지원",
    minAge: 19,
    maxAge: 39,
    allowedEmployment: ["재직중"],
    maxIncome: 5000,
    region: "경기도",
    benefits: ["연 120만 원 상당 경기청년몰 복지포인트 지급"],
    deadline: "2026-10-31",
    url: "https://youth.gg.go.kr",
  },
  {
    id: "203",
    title: "중소기업 취업청년 전월세보증금 대출",
    category: "individual",
    agency: "국토교통부 · 주택도시보증공사",
    topic: "주거·금융",
    minAge: 19,
    maxAge: 34,
    allowedEmployment: ["재직중"],
    maxIncome: 5000,
    region: "전국",
    benefits: ["연 1.5% 초저금리로 최대 1억 원 전세보증금 대출"],
    deadline: "2026-11-30",
    url: "https://nhuf.molit.go.kr",
  },
  {
    id: "204",
    title: "청년 재직자 직무능력개발 내일배움바우처",
    category: "individual",
    agency: "고용노동부 · 직업능력심사평가원",
    topic: "역량강화",
    minAge: 19,
    maxAge: 39,
    allowedEmployment: ["재직중"],
    maxIncome: null,
    region: "전국",
    benefits: ["5년간 최대 500만 원 직무훈련 및 자격증 취득비 지원"],
    deadline: "2026-12-31",
    url: "https://www.hrd.go.kr",
  },

  // 🏢 [30대] 청년 소상공인 · 대표 특화 정책
  {
    id: "301",
    title: "청년 소상공인 특별경영안정자금 (초저금리 정책자금)",
    category: "business",
    agency: "중소벤처기업부 · 소상공인시장진흥공단",
    topic: "금융·융자",
    minAge: 19,
    maxAge: 39,
    allowedEmployment: ["자영업"],
    maxIncome: null,
    region: "전국",
    allowedIndustries: ["음식점업", "소매업", "서비스업", "제조업", "IT 소프트웨어 개발"],
    benefits: ["최대 7,000만 원 한도 연 2%대 저금리 정책 운전자금"],
    deadline: "2026-11-30",
    url: "https://www.sbiz24.kr",
  },
  {
    id: "302",
    title: "소상공인 스마트상점 기술보급사업 (테이블오더·키오스크 지원)",
    category: "business",
    agency: "중소벤처기업부 · 소진공",
    topic: "스마트기술·설비",
    minAge: 19,
    maxAge: 39,
    allowedEmployment: ["자영업"],
    maxIncome: null,
    region: "전국",
    allowedIndustries: ["음식점업", "소매업", "서비스업"],
    benefits: ["키오스크, 테이블오더, 스마트오더 도입 비용 최대 70%(500만 원) 국비 지원"],
    deadline: "2026-09-30",
    url: "https://www.sbiz.or.kr/smst/index.do",
  },
  {
    id: "303",
    title: "서울시 골목상권 청년 소상공인 환경개선 바우처",
    category: "business",
    agency: "서울특별시 · 서울신용보증재단",
    topic: "매장개선·마케팅",
    minAge: 19,
    maxAge: 39,
    allowedEmployment: ["자영업"],
    maxIncome: null,
    region: "서울특별시",
    allowedIndustries: ["음식점업", "소매업", "서비스업"],
    benefits: ["매장 리모델링 및 온라인 바이럴 마케팅비 최대 300만 원 무상 지원"],
    deadline: "2026-10-15",
    url: "https://www.seoulshinbo.co.kr",
  },
  {
    id: "304",
    title: "청년 소상공인 노란우산공제 희망장려금 지원사업",
    category: "business",
    agency: "중소기업중앙회 · 지자체연계",
    topic: "복지·퇴직금",
    minAge: 19,
    maxAge: 39,
    allowedEmployment: ["자영업"],
    maxIncome: null,
    region: "전국",
    benefits: ["매월 공제부금 납입 시 월 2만 원(연 24만 원) 희망장려금 추가 적립"],
    deadline: "2026-12-31",
    url: "https://www.8899.or.kr",
  },

  // 🚀 [20~30대] 초기 창업 준비자 특화 정책
  {
    id: "401",
    title: "2026년 청년 예비창업패키지 (혁신분야 창업사업화 지원)",
    category: "business",
    agency: "중소벤처기업부 · 창업진흥원",
    topic: "창업·사업화",
    minAge: 19,
    maxAge: 39,
    allowedEmployment: ["미취업", "대학생", "대학원생", "자영업"],
    maxIncome: null,
    region: "전국",
    allowedIndustries: ["IT 소프트웨어 개발", "AI 딥테크", "바이오", "제조업", "서비스업"],
    benefits: ["시제품 제작 및 마케팅 사업화 자금 최대 1억 원 무상 지원"],
    deadline: "2026-09-30",
    url: "https://www.k-startup.go.kr",
  },
  {
    id: "402",
    title: "청년창업사관학교 (사업화 자금 + 전용 창업공간)",
    category: "business",
    agency: "중소벤처기업진흥공단 · 기업마당",
    topic: "창업육성",
    minAge: 19,
    maxAge: 39,
    allowedEmployment: ["미취업", "대학생", "대학원생", "자영업"],
    maxIncome: null,
    region: "전국",
    benefits: ["최대 1억 원 창업자금 + 1:1 전담 코칭 + 개별 입주공간 무료 제공"],
    deadline: "2026-10-31",
    url: "https://www.bizinfo.go.kr",
  },
  {
    id: "403",
    title: "대전시 청년 창업희망카드 및 초기 스타트업 바우처",
    category: "business",
    agency: "대전광역시 · 대전창조경제혁신센터",
    topic: "창업지원",
    minAge: 19,
    maxAge: 39,
    allowedEmployment: ["미취업", "대학생", "대학원생", "자영업"],
    maxIncome: null,
    region: "대전광역시",
    allowedIndustries: ["IT 소프트웨어 개발", "과학기술", "서비스업"],
    benefits: ["월 50만 원씩 6개월(최대 300만 원) 창업활동비 및 액셀러레이팅 지원"],
    deadline: "2026-11-15",
    url: "https://www.dci.or.kr",
  },
  {
    id: "404",
    title: "청년 딥테크·SW 스타트업 클라우드 및 R&D 바우처",
    category: "business",
    agency: "정보통신산업진흥원 (NIPA)",
    topic: "기술·인프라",
    minAge: 19,
    maxAge: 39,
    allowedEmployment: ["미취업", "대학생", "자영업"],
    maxIncome: null,
    region: "전국",
    allowedIndustries: ["IT 소프트웨어 개발"],
    benefits: ["연간 최대 2,000만 원 클라우드 크레딧 및 SaaS 개발 인프라 지원"],
    deadline: "2026-12-10",
    url: "https://www.nipa.kr",
  },

  // 👔 [40대] 직장인 · 경력전환자 특화 정책
  {
    id: "501",
    title: "중장년 경력나침반 및 이직·전직 생애경력설계 패키지",
    category: "individual",
    agency: "고용노동부 · 노사발전재단",
    topic: "경력전환·재취업",
    minAge: 40,
    maxAge: 64,
    allowedEmployment: ["재직중", "미취업"],
    maxIncome: null,
    region: "전국",
    benefits: ["1:1 전문 경력 진단 및 전직·이직 컨설팅, 이력서 코칭 전액 무료"],
    deadline: "2026-12-31",
    url: "https://www.nosa.or.kr",
  },
  {
    id: "502",
    title: "중장년 디지털 직무전환 K-디지털 트레이닝",
    category: "individual",
    agency: "고용노동부 · 직업능력개발원",
    topic: "직무교육",
    minAge: 40,
    maxAge: 64,
    allowedEmployment: ["재직중", "미취업"],
    maxIncome: null,
    region: "전국",
    benefits: ["데이터·디지털 융합 직무 교육비 전액 국비지원 (최대 500만 원)"],
    deadline: "2026-11-30",
    url: "https://www.hrd.go.kr",
  },
  {
    id: "503",
    title: "중장년 주택도시기금 버팀목 전세자금 대출 (세대주 전용)",
    category: "individual",
    agency: "국토교통부 · 주택도시기금",
    topic: "주거·금융",
    minAge: 40,
    maxAge: 64,
    allowedEmployment: ["재직중", "자영업", "미취업"],
    maxIncome: 6000,
    region: "전국",
    benefits: ["연 2.1%~2.9% 저금리로 최대 1억 2,000만 원 전세자금 대출"],
    deadline: "2026-12-31",
    url: "https://nhuf.molit.go.kr",
  },
  {
    id: "504",
    title: "서울시 중장년 넥스트레벨 인턴십 프로그램",
    category: "individual",
    agency: "서울특별시 · 50플러스재단",
    topic: "일자리·인턴십",
    minAge: 40,
    maxAge: 59,
    allowedEmployment: ["재직중", "미취업"],
    maxIncome: null,
    region: "서울특별시",
    benefits: ["월 최대 239만 원(서울형 생활임금) 인턴십 참여수당 지원"],
    deadline: "2026-10-31",
    url: "https://50plus.or.kr",
  },

  // 🏪 [40~50대] 중장년 소상공인 · 골목상권 대표 특화 정책
  {
    id: "601",
    title: "중장년 소상공인 대환대출 및 경영안정 특별자금",
    category: "business",
    agency: "중소벤처기업부 · 소상공인시장진흥공단",
    topic: "금융·부채경감",
    minAge: 40,
    maxAge: 64,
    allowedEmployment: ["자영업"],
    maxIncome: null,
    region: "전국",
    allowedIndustries: ["소매업", "음식점업", "서비스업", "제조업", "도소매업"],
    benefits: ["연 7% 이상 고금리 대출을 연 4.5% 저금리 장기분할상환 대출로 전환 (최대 5,000만 원)"],
    deadline: "2026-12-31",
    url: "https://www.sbiz24.kr",
  },
  {
    id: "602",
    title: "중장년 소상공인 온라인 판로개척 및 라이브커머스 패키지",
    category: "business",
    agency: "중소벤처기업유통센터 · 판판대로",
    topic: "판로·마케팅",
    minAge: 40,
    maxAge: 64,
    allowedEmployment: ["자영업"],
    maxIncome: null,
    region: "전국",
    allowedIndustries: ["소매업", "음식점업", "제조업", "도소매업"],
    benefits: ["쿠팡, 네이버 스마트스토어 상세페이지 제작 및 라이브커머스 100% 무상 지원"],
    deadline: "2026-11-15",
    url: "https://fanfandaero.kr",
  },
  {
    id: "603",
    title: "경기도 중장년 소상공인 스마트상점 및 시설개선 지원사업",
    category: "business",
    agency: "경기도 · 경기도시장상권진흥원",
    topic: "시설개선·스마트",
    minAge: 40,
    maxAge: 64,
    allowedEmployment: ["자영업"],
    maxIncome: null,
    region: "경기도",
    allowedIndustries: ["소매업", "음식점업", "서비스업", "도소매업"],
    benefits: ["점포 간판 교체, 인테리어 및 키오스크 도입 비용 최대 500만 원 지원"],
    deadline: "2026-10-20",
    url: "https://www.gmr.or.kr",
  },
  {
    id: "604",
    title: "중장년 소상공인 희망리턴패키지 (사업정리 및 재창업)",
    category: "business",
    agency: "중소벤처기업부 · 소진공",
    topic: "재도약·재창업",
    minAge: 40,
    maxAge: 64,
    allowedEmployment: ["자영업"],
    maxIncome: null,
    region: "전국",
    benefits: ["점포 철거비 최대 300만 원 지원 및 재취업 전직장려수당 최대 100만 원 지급"],
    deadline: "2026-12-31",
    url: "https://hope.sbiz.or.kr",
  },

  // 🔄 [50대] 신중년 재취업 · 시니어 인생 2막 특화 정책
  {
    id: "701",
    title: "신중년 경력형 일자리 지원사업 (전문경력 퇴직인력 채용)",
    category: "individual",
    agency: "고용노동부 · 지자체 합동",
    topic: "일자리·재취업",
    minAge: 50,
    maxAge: 69,
    allowedEmployment: ["미취업", "퇴직자"],
    maxIncome: null,
    region: "전국",
    benefits: ["지역사회 연계 전문직무 일자리 참여 및 월 최대 220만 원 급여 지급"],
    deadline: "2026-12-15",
    url: "https://www.work.go.kr",
  },
  {
    id: "702",
    title: "국민취업지원제도 2유형 (중장년 맞춤 취업촉진수당)",
    category: "individual",
    agency: "고용노동부 · 고용센터",
    topic: "구직수당·취업",
    minAge: 50,
    maxAge: 69,
    allowedEmployment: ["미취업"],
    maxIncome: 5000,
    region: "전국",
    benefits: ["월 최대 28만 4천 원 훈련참여수당 및 취업성공수당 최대 150만 원 지급"],
    deadline: "2026-12-31",
    url: "https://www.kua.go.kr",
  },
  {
    id: "703",
    title: "부산시 신중년 Re-Start 일자리 인턴십 지원",
    category: "individual",
    agency: "부산광역시 · 부산경영자총협회",
    topic: "인턴십·재취업",
    minAge: 50,
    maxAge: 64,
    allowedEmployment: ["미취업"],
    maxIncome: null,
    region: "부산광역시",
    benefits: ["3개월간 월 200만 원 인턴 활동비 및 정규직 전환 축하금 100만 원"],
    deadline: "2026-11-30",
    url: "https://www.busan.go.kr",
  },
  {
    id: "704",
    title: "신중년 맞춤형 평생교육 및 국가자격 취득 바우처",
    category: "individual",
    agency: "국가평생교육진흥원 · 교육부",
    topic: "평생교육·자격증",
    minAge: 50,
    maxAge: 69,
    allowedEmployment: ["미취업", "재직중"],
    maxIncome: 5000,
    region: "전국",
    benefits: ["연간 35만 원 평생교육이용권 바우처 카드 발급"],
    deadline: "2026-10-31",
    url: "https://www.lllcard.kr",
  },

  // 💡 [50대] 시니어 기술창업 · 인생 2막 창업 특화 정책
  {
    id: "801",
    title: "시니어 기술창업센터 입주 및 사업화 지원사업",
    category: "business",
    agency: "중소벤처기업부 · 창업진흥원",
    topic: "시니어창업",
    minAge: 40,
    maxAge: 64,
    allowedEmployment: ["자영업", "미취업", "재직중"],
    maxIncome: null,
    region: "전국",
    allowedIndustries: ["제조업", "IT 소프트웨어 개발", "과학기술", "서비스업"],
    benefits: ["무료 전용 사무공간 입주 + 시제품 제작 및 특허 출원비 최대 5,000만 원 지원"],
    deadline: "2026-10-31",
    url: "https://www.k-startup.go.kr",
  },
  {
    id: "802",
    title: "시니어 재도전 성공패키지 (재창업 및 인생 2막 창업 지원)",
    category: "business",
    agency: "중소벤처기업부 · 창진원",
    topic: "재창업·사업화",
    minAge: 40,
    maxAge: 64,
    allowedEmployment: ["자영업", "미취업"],
    maxIncome: null,
    region: "전국",
    benefits: ["재창업 사업화 자금 최대 1억 원 및 전담 멘토링·IR 투자유치 연계"],
    deadline: "2026-09-30",
    url: "https://www.k-startup.go.kr",
  },
  {
    id: "803",
    title: "인천시 중장년 시니어 로컬 창업도약 지원사업",
    category: "business",
    agency: "인천광역시 · 인천창조경제혁신센터",
    topic: "로컬창업",
    minAge: 40,
    maxAge: 64,
    allowedEmployment: ["자영업", "미취업"],
    maxIncome: null,
    region: "인천광역시",
    allowedIndustries: ["제조업", "소매업", "서비스업", "IT 소프트웨어 개발"],
    benefits: ["최대 3,000만 원 사업화 자금 및 인천 로컬 비즈니스 팝업스토어 입점"],
    deadline: "2026-11-15",
    url: "https://ccei.creativekorea.or.kr/incheon",
  },
  {
    id: "804",
    title: "중소벤처기업진흥공단 제조혁신 정책자금 (설비도입 융자)",
    category: "business",
    agency: "중소벤처기업진흥공단 · 기업마당",
    topic: "설비도입·제조",
    minAge: 40,
    maxAge: 64,
    allowedEmployment: ["자영업"],
    maxIncome: null,
    region: "전국",
    allowedIndustries: ["제조업"],
    benefits: ["최대 10억 원 한도 연 2%대 시설자금 및 스마트공장 구축 융자"],
    deadline: "2026-12-31",
    url: "https://www.kosmes.or.kr",
  },
];

export function evaluatePolicies(profile: SearchProfile): SearchResponse {
  let userAge: number | null = null;
  if (profile.birth_date) {
    const birthYear = parseInt(profile.birth_date.slice(0, 4), 10);
    const currentYear = new Date().getFullYear();
    if (!Number.isNaN(birthYear)) {
      userAge = currentYear - birthYear;
    }
  }

  // Parse user income threshold
  let userIncomeNum = 0;
  if (profile.income_bracket) {
    if (profile.income_bracket.includes("3000")) userIncomeNum = 3000;
    else if (profile.income_bracket.includes("5000")) userIncomeNum = 5000;
    else if (profile.income_bracket.includes("7000")) userIncomeNum = 7000;
    else if (profile.income_bracket.includes("8000")) userIncomeNum = 8000;
  }

  const results: PolicyResult[] = [];

  for (const item of SAMPLE_POLICIES) {
    // 1. Business Category Exclusion:
    // If policy is strictly business, only evaluate if user indicated business ownership
    if (item.category === "business" && !profile.is_business_owner) {
      continue;
    }

    const reasons: string[] = [];
    const missing: string[] = [];
    let isHardFail = false;

    // 2. Strict Age Check:
    // Filter out policies outside the user's age category (e.g. 중장년 policies for 20s, 청년 policies for 50s)
    if (item.minAge != null || item.maxAge != null) {
      if (userAge != null) {
        if (item.minAge != null && userAge < item.minAge) {
          isHardFail = true;
          reasons.push(`나이 기준 미달 (만 ${item.minAge}세 이상 대상)`);
        } else if (item.maxAge != null && userAge > item.maxAge) {
          isHardFail = true;
          reasons.push(`나이 기준 초과 (만 ${item.maxAge}세 이하 대상)`);
        } else {
          reasons.push(`나이 만 ${item.minAge ?? 0}~${item.maxAge ?? 99}세 충족`);
        }
      } else {
        missing.push(`나이 (만 ${item.minAge ?? 0}~${item.maxAge ?? 99}세 확인)`);
      }
    }

    // 3. Strict Employment Status Check:
    if (item.allowedEmployment.length > 0) {
      if (profile.employment_status) {
        const isMatch = item.allowedEmployment.some(
          (emp) => profile.employment_status?.includes(emp) || emp.includes(profile.employment_status || "")
        );
        if (isMatch) {
          reasons.push(`고용 상태 충족 (${profile.employment_status})`);
        } else {
          isHardFail = true;
          reasons.push(`대상 고용상태 불일치 (${item.allowedEmployment.join(", ")} 대상)`);
        }
      } else {
        missing.push(`고용 상태 (${item.allowedEmployment.join(", ")})`);
      }
    }

    // 4. Strict Region Check:
    if (item.region !== "전국") {
      if (profile.region) {
        if (profile.region.includes(item.region) || item.region.includes(profile.region)) {
          reasons.push(`지역 조건 충족 (${item.region})`);
        } else {
          isHardFail = true;
          reasons.push(`지역 불일치 (${item.region} 거주자 전용)`);
        }
      } else {
        missing.push(`거주 지역 (${item.region} 확인)`);
      }
    } else if (profile.region) {
      reasons.push(`전국 공통 정책 (${profile.region} 지원 가능)`);
    }

    // 5. Industry Check:
    if (item.allowedIndustries && item.allowedIndustries.length > 0) {
      if (profile.industry) {
        const matchesIndustry = item.allowedIndustries.some(
          (ind) => profile.industry?.includes(ind) || ind.includes(profile.industry || "")
        );
        if (matchesIndustry) {
          reasons.push(`업종 기준 충족 (${profile.industry})`);
        } else {
          isHardFail = true;
          reasons.push(`업종 불일치 (${item.allowedIndustries.join(", ")} 대상)`);
        }
      }
    }

    // 6. Income Check:
    if (item.maxIncome != null && userIncomeNum > 0) {
      if (userIncomeNum > item.maxIncome) {
        isHardFail = true;
        reasons.push(`소득 기준 초과 (연 ${item.maxIncome}만 원 이하 대상)`);
      } else {
        reasons.push(`소득 기준 충족 (연 ${item.maxIncome}만 원 이하)`);
      }
    }

    // CRITICAL: Filter out hard fails so users do NOT see completely inapplicable policies from other age groups!
    if (isHardFail) {
      continue;
    }

    let status: MatchStatus = "possible";
    if (missing.length === 0 && reasons.length > 0) {
      status = "eligible";
    } else {
      status = "possible";
    }

    results.push({
      result_id: `r-${item.id}`,
      policy_version_id: parseInt(item.id, 10),
      policy_title: item.title,
      category: item.category,
      status,
      agency: item.agency,
      topic: item.topic,
      reasons: reasons.length > 0 ? reasons : ["조건 확인 필요"],
      missing_info: missing,
      benefits: item.benefits,
      application_deadline: item.deadline,
      announcement_url: item.url,
      evidence: [
        {
          evidence_id: `src-${item.id}`,
          chunk_id: null,
          section: "공고문 요약",
          location: "본문",
          text_snippet: `소관기관: ${item.agency}`,
        },
      ],
      rag_explanation: null,
    });
  }

  // Sort logic:
  // Eligible first, then possible
  const order: Record<MatchStatus, number> = { eligible: 0, possible: 1, ineligible: 2 };
  results.sort((a, b) => {
    const diff = order[a.status] - order[b.status];
    if (diff !== 0) return diff;
    return 0;
  });

  return {
    data_version: "live-policy-database-v4",
    results,
    total: results.length,
    page: 1,
    page_size: 20,
    rag_enabled: false,
  };
}
