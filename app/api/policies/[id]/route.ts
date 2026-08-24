import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:8000";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const response = await fetch(`${API_URL}/v1/policies/${id}`);
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
