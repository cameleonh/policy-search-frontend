import { NextRequest, NextResponse } from "next/server";
import type { SearchProfile } from "@policy-search/contracts";
import { evaluatePolicies } from "@/lib/matcher";

const API_URL = process.env.API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  const profile = (await request.json()) as SearchProfile;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${API_URL}/v1/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }
  } catch {
    // Backend API is offline — fallback to deterministic dynamic matching evaluation
  }

  const fallbackResponse = evaluatePolicies(profile);
  return NextResponse.json(fallbackResponse);
}
