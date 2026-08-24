"use client";

import {
  useState,
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
  onSubmit: (profile: SearchProfile) => void;
  loading?: boolean;
}

export function SearchProfileForm({ onSubmit, loading = false }: SearchProfileFormProps) {
  const [birthDate, setBirthDate] = useState("");
  const [region, setRegion] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [incomeBracket, setIncomeBracket] = useState("");

  const [isBusinessOwner, setIsBusinessOwner] = useState(false);
  const [businessRegion, setBusinessRegion] = useState("");
  const [industry, setIndustry] = useState("");
  const [annualRevenue, setAnnualRevenue] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      birth_date: birthDate || undefined,
      region: region || undefined,
      employment_status: employmentStatus || undefined,
      income_bracket: incomeBracket || undefined,
      is_business_owner: isBusinessOwner,
      business_region: businessRegion || undefined,
      industry: industry || undefined,
      annual_revenue: annualRevenue ? Number(annualRevenue) : undefined,
      employee_count: employeeCount ? Number(employeeCount) : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
        <legend className="px-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
          개인 정보
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="생년월일">
            <input
              type="date"
              value={birthDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setBirthDate(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="거주 지역">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={inputClass}
            >
              <option value="">전국</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
          <Field label="취업 상태">
            <select
              value={employmentStatus}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setEmploymentStatus(e.target.value)}
              className={inputClass}
            >
              <option value="">선택 안함</option>
              <option value="미취업">미취업</option>
              <option value="재직중">재직중</option>
              <option value="자영업">자영업</option>
            </select>
          </Field>
          <Field label="소득 구간">
            <select
              value={incomeBracket}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setIncomeBracket(e.target.value)}
              className={inputClass}
            >
              <option value="">선택 안함</option>
              <option value="전액">전액</option>
              <option value="3000만원 이하">3000만원 이하</option>
              <option value="5000만원 이하">5000만원 이하</option>
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
        <legend className="px-2">
          <label className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
            <input
              type="checkbox"
              checked={isBusinessOwner}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setIsBusinessOwner(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
            />
            사업체 정보
          </label>
        </legend>
        {isBusinessOwner && (
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="사업장 소재지">
              <input
                type="text"
                value={businessRegion}
                onChange={(e) => setBusinessRegion(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="업종">
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="연 매출 (만원)">
              <input
                type="number"
                min={0}
                value={annualRevenue}
                onChange={(e) => setAnnualRevenue(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="상시근로자 수">
              <input
                type="number"
                min={0}
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        )}
        {!isBusinessOwner && (
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            사업자라면 체크하여 사업체 지원도 함께 검색하세요.
          </p>
        )}
      </fieldset>

      <Button type="submit" size="lg" loading={loading}>
        {loading ? "검색 중..." : "검색"}
      </Button>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition-colors placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </span>
      {children}
    </label>
  );
}
