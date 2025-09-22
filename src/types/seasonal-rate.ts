// types/seasonal-rate.ts - FINAL VERSION
import { PaginationQueries } from "./pagination";

export interface SeasonalRate {
  id: number;
  roomId: number;
  startDate: string;
  endDate: string;
  adjustmentType: "PERCENTAGE" | "NOMINAL"; // Match Prisma schema
  adjustmentValue: number; // Response sudah number
  reason?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  room?: {
    id: number;
    name: string;
    price: number;
    property: {
      id: number;
      title: string;
    };
  };
}

export interface CreateSeasonalRatePayload {
  roomId: string;
  startDate: string;
  endDate: string;
  adjustmentType: "PERCENTAGE" | "NOMINAL"; // Match Prisma schema
  adjustmentValue: string; // Backend DTO expects string
  reason?: string;
}

export interface UpdateSeasonalRatePayload {
  startDate?: string;
  endDate?: string;
  adjustmentType?: "PERCENTAGE" | "NOMINAL"; // Match Prisma schema
  adjustmentValue?: string; // Backend DTO expects string
  reason?: string;
}

export interface SeasonalRateSearchParams extends PaginationQueries {
  roomId?: string;
  startDate?: string;
  endDate?: string;
}

export interface SeasonalRateError {
  type: 'auth' | 'network' | 'server' | 'forbidden' | 'unknown';
  message: string;
  statusCode?: number;
}