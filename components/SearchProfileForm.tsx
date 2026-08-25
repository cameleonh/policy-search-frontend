"use client";

import {
  useState,
  useEffect,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import type { SearchProfile } from "@policy-search/contracts";
import { Button } from "./Button";

const REGIONS = [
  "서울특별시",
  "부산광역시",
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "세종특별자치시",
  "경기도",
  "강원특별자치도",
  "충청북도",
  "충청남도",
  "전라북도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주특별자치도",
] as const;

interface SearchProfileFormProps {
  initialProfile?: SearchProfile | null;
  onSubmit: (profile: SearchProfile) => void;
  loading?: boolean;
}

export function SearchProfileForm({
  initialProfile,
  onSubmit,
  loading = false,
}: SearchProfileFormProps) {
  const [birthDate, setBirthDate] = useState(initialProfile?.birth_date || "");
  const [region, setRegion] = useState(initialProfile?.region || "");
  const [employmentStatus, setEmploymentStatus] = useState(
    initialProfile?.employment_status || ""
  );
  const [incomeBracket, setIncomeBracket] = useState(
    initialProfile?.income_bracket || ""
  );

  const [isBusinessOwner, setIsBusinessOwner] = useState(
    initialProfile?.is_business_owner || false
  );
  const [businessRegion, setBusinessRegion] = useState(
    initialProfile?.business_region || ""
  );
  const [industry, setIndustry] = useState(initialProfile?.industry || "");
  const [annualRevenue, setAnnualRevenue] = useState(
    initialProfile?.annual_revenue != null ? String(initialProfile.annual_revenue) : ""
  );
  const [employeeCount, setEmployeeCount] = useState(
    initialProfile?.employee_count != null ? String(initialProfile.employee_count) : ""
  );

  // Sync state whenever initialProfile changes (e.g. preset click)
  useEffect(() => {
    if (initialProfile) {
      setBirthDate(initialProfile.birth_date || "");
      setRegion(initialProfile.region || "");
      setEmploymentStatus(initialProfile.employment_status || "");
      setIncomeBracket(initialProfile.income_bracket || "");
      setIsBusinessOwner(Boolean(initialProfile.is_business_owner));
      setBusinessRegion(initialProfile.business_region || "");
      setIndustry(initialProfile.industry || "");
      setAnnualRevenue(
        initialProfile.annual_revenue != null ? String(initialProfile.annual_revenue) : ""
      );
      setEmployeeCount(
        initialProfile.employee_count != null ? String(initialProfile.employee_count) : ""
      );
    }
  }, [initialProfile]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const studentLevel =
      employmentStatus === "대학생" ? "undergrad" : employmentStatus === "대학원생" ? "grad" : null;
    const employment = employmentStatus === "" ? undefined : employmentStatus;
    onSubmit({
      birth_date: birthDate || undefined,
      region: region || undefined,
      employment_status: employment,
      income_bracket: incomeBracket || undefined,
      student_level: studentLevel,
      is_business_owner: isBusinessOwner,
      business_region: businessRegion || undefined,
      industry: industry || undefined,
      annual_revenue: annualRevenue ? Number(annualRevenue) : undefined,
      employee_count: employeeCount ? Number(employeeCount) : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* 개인 정보 섹션 */}
      <div className="rounded-2xl border border-neutral-200/90 bg-gradient-to-b from-white to-neutral-50/40 p-5 shadow-sm dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900/60 sm:p-6">
        {/* 헤더 한 줄 정렬 */}
        <div className="mb-5 flex items-center justify-between border-b border-neutral-100 pb-3.5 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">👤</span>
            <h2 className="text-lg font-extrabold text-neutral-900 dark:text-neutral-50 whitespace-nowrap">
              개인 조건 입력
            </h2>
          </div>
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 whitespace-nowrap shrink-0">
            자유 입력
          </span>
        </div>

        {/* 필드 목록 - 세로 1열 정렬로 여유롭고 완벽한 줄바꿈 보장 */}
        <div className="space-y-4.5">
          <Field
            id="birth-date"
            label="생년월일"
            badge="연령 판정"
            helper="예: 1999-01-01 (만 나이를 자동 계산합니다)"
          >
            <input
              id="birth-date"
              type="date"
              value={birthDate}
              aria-describedby="birth-date-help"
              onChange={(e: ChangeEvent<HTMLInputElement>) => setBirthDate(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field
            id="user-region"
            label="거주 지역"
            badge="지자체 혜택"
            helper="주민등록상 주소지 (기본값: 전국 공통 지원)"
          >
            <div className="relative">
              <select
                id="user-region"
                value={region}
                aria-describedby="user-region-help"
                onChange={(e) => setRegion(e.target.value)}
                className={`${inputClass} appearance-none pr-10`}
              >
                <option value="">전국 (전체 지역)</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                ▼
              </div>
            </div>
          </Field>

          <Field
            id="employment-status"
            label="취업 / 학적 상태"
            badge="자격 매칭"
            helper="현재의 고용 상황 또는 대학·대학원 재학 여부"
          >
            <div className="relative">
              <select
                id="employment-status"
                value={employmentStatus}
                aria-describedby="employment-status-help"
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setEmploymentStatus(e.target.value)}
                className={`${inputClass} appearance-none pr-10`}
              >
                <option value="">선택 안함 (전체 정책 탐색)</option>
                <option value="미취업">미취업 (구직자 · 취준생)</option>
                <option value="재직중">재직중 (근로자 · 직장인)</option>
                <option value="자영업">자영업 (개인사업자)</option>
                <option value="대학생">대학생 (학부 재학 · 휴학생)</option>
                <option value="대학원생">대학원생 (석·박사 과정)</option>
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                ▼
              </div>
            </div>
          </Field>

          <Field
            id="income-bracket"
            label="연간 소득 구간"
            badge="소득 기준"
            helper="세전 연간 총소득 기준 (상한선 확인용)"
          >
            <div className="relative">
              <select
                id="income-bracket"
                value={incomeBracket}
                aria-describedby="income-bracket-help"
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setIncomeBracket(e.target.value)}
                className={`${inputClass} appearance-none pr-10`}
              >
                <option value="">선택 안함 (소득 제한 없음)</option>
                <option value="3000만원 이하">3,000만 원 이하</option>
                <option value="5000만원 이하">5,000만 원 이하</option>
                <option value="7000만원 이하">7,000만 원 이하</option>
                <option value="8000만원 이상">8,000만 원 이상</option>
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                ▼
              </div>
            </div>
          </Field>
        </div>
      </div>

      {/* 사업체 정보 섹션 (토글 카드) */}
      <div
        className={[
          "rounded-2xl border transition-all duration-200",
          isBusinessOwner
            ? "border-brand-300 bg-brand-50/20 p-5 shadow-sm dark:border-brand-800 dark:bg-brand-950/20 sm:p-6"
            : "border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/40",
        ].join(" ")}
      >
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-3 w-full">
            <input
              type="checkbox"
              checked={isBusinessOwner}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setIsBusinessOwner(e.target.checked)}
              className="h-5 w-5 shrink-0 rounded-md border-neutral-300 text-brand-600 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-base font-bold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                  🏢 소상공인 · 사업체 조건
                </span>
                {isBusinessOwner ? (
                  <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-bold text-white whitespace-nowrap shrink-0">
                    활성화됨
                  </span>
                ) : (
                  <span className="rounded-full bg-neutral-200/80 px-2.5 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 whitespace-nowrap shrink-0">
                    선택 사항
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                사업자등록증 보유 시 전용 지원금 추가 검색
              </p>
            </div>
          </label>
        </div>

        {isBusinessOwner && (
          <div className="mt-5 border-t border-brand-100 pt-5 dark:border-brand-900/50 space-y-4">
            <Field id="biz-region" label="사업장 소재지" helper="예: 서울특별시 마포구">
              <input
                id="biz-region"
                type="text"
                placeholder="예: 서울특별시 마포구"
                value={businessRegion}
                aria-describedby="biz-region-help"
                onChange={(e) => setBusinessRegion(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field id="biz-industry" label="주요 업종" helper="예: 음식점업, 통신판매업, IT 서비스">
              <input
                id="biz-industry"
                type="text"
                placeholder="예: 음식점업, 소매업"
                value={industry}
                aria-describedby="biz-industry-help"
                onChange={(e) => setIndustry(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field id="biz-revenue" label="연간 매출액 (만 원)" helper="예: 5000 (연 5천만 원일 경우)">
              <input
                id="biz-revenue"
                type="number"
                min={0}
                placeholder="예: 5000"
                value={annualRevenue}
                aria-describedby="biz-revenue-help"
                onChange={(e) => setAnnualRevenue(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field id="biz-employees" label="상시근로자 수 (명)" helper="대표자 제외 상시 근무 직원 수">
              <input
                id="biz-employees"
                type="number"
                min={0}
                placeholder="예: 2"
                value={employeeCount}
                aria-describedby="biz-employees-help"
                onChange={(e) => setEmployeeCount(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        )}
      </div>

      {/* 제출 버튼 */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          size="lg"
          loading={loading}
          className="w-full h-12 text-base font-extrabold shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/35 transition-all"
        >
          {loading ? (
            "맞춤 정책 탐색 및 판정 중..."
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span className="text-lg">🔍</span>
              <span>나에게 맞는 정책 찾기</span>
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full h-12 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-base font-medium text-neutral-900 shadow-sm transition-all placeholder:text-neutral-400 hover:border-neutral-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/15 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-brand-400 dark:focus:ring-brand-400/20";

function Field({
  id,
  label,
  badge,
  helper,
  children,
}: {
  id: string;
  label: string;
  badge?: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <div className="block">
      <div className="mb-2 flex items-center justify-between whitespace-nowrap">
        <label htmlFor={id} className="text-base font-bold text-neutral-800 dark:text-neutral-200">
          {label}
        </label>
        {badge && (
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/80 px-2 py-0.5 rounded-md">
            {badge}
          </span>
        )}
      </div>
      {children}
      {helper && (
        <span id={`${id}-help`} className="mt-1.5 block text-xs sm:text-sm leading-normal text-neutral-500 dark:text-neutral-400">
          {helper}
        </span>
      )}
    </div>
  );
}
