import { User } from "@/types/user";
import { Room } from "@/types/room";

export type TransactionStatus =
  | "WAITING_FOR_PAYMENT"
  | "WAITING_FOR_CONFIRMATION"
  | "PAID"
  | "CANCELLED"
  | "EXPIRED";
export type PaymentMethod = "MANUAL_TRANSFER" | "PAYMENT_GATEWAY";

export interface Transaction {
  id: number;
  uuid: string;
  userId: number;
  username: string;
  roomId: number;
  qty: number;
  status: TransactionStatus;
  total: number;
  startDate: string;
  endDate: string;
  paymentProof: string | null;
  invoice_url: string | null;
  expiredAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
  paymentMethod: PaymentMethod;
  room: Room;
}

export interface GetTransactionsParams {
  page?: number;
  take?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  orderNumber?: string;
  date?: string;
}

export interface TransactionsResponse {
  data: Transaction[];
  meta: {
    page: number;
    take: number;
    total: number;
  };
}
