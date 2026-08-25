import { NextRequest, NextResponse } from "next/server";
import type { PolicyDetail } from "@policy-search/contracts";
import { SAMPLE_POLICIES } from "@/lib/matcher";

const API_URL = process.env.API_URL || "http://localhost:8000";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${API_URL}/v1/policies/${id}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }
  } catch {
    // Backend API is offline — fallback to sample detail
  }

  const policy = SAMPLE_POLICIES.find((p) => p.id === id);

  const detail: PolicyDetail = {
    policy_version_id: parseInt(id, 10) || 1,
    policy_title: policy?.title || `정책 #${id}`,
    agency: policy?.agency || "공공기관",
    announcement_url: policy?.url || null,
    apply_start: "2026-01-01",
    apply_end: policy?.deadline || "2026-12-31",
    age_min: policy?.minAge ?? null,
    age_max: policy?.maxAge ?? null,
    income_max: policy?.maxIncome ? String(policy.maxIncome) : null,
    employment: policy?.allowedEmployment || ["제한 없음"],
    region: policy?.region || "전국",
    education: "학력 무관",
  };

  return NextResponse.json(detail);
}
