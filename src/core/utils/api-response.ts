import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export function apiSuccess<T>(data: T, message?: string, status = 200, pagination?: ApiResponse["pagination"]) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      pagination,
    },
    { status }
  );
}

export function apiError(error: string, status = 400, message?: string) {
  return NextResponse.json(
    {
      success: false,
      message: message || error,
      error,
    },
    { status }
  );
}
