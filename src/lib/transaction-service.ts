// src/lib/transaction-service.ts
import { axiosInstance } from '@/lib/axios';

type AcceptReject = 'ACCEPT' | 'REJECT';
type PaymentMethod = 'MANUAL_TRANSFER' | 'PAYMENT_GATEWAY';

const authHeaders = (accessToken?: string) =>
  accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;

export const updateTransaction = async (
  uuid: string,
  type: AcceptReject,
  accessToken?: string
) => {
  const response = await axiosInstance.patch(
    '/transactions/update',
    { uuid, type },
    { headers: authHeaders(accessToken) }
  );
  return response.data;
};

export const cancelTransaction = async (uuid: string, accessToken?: string) => {
  const response = await axiosInstance.patch(
    '/transactions/cancel',
    { uuid, type: 'CANCELLED' },
    { headers: authHeaders(accessToken) }
  );
  return response.data;
};

export const sendReminderEmail = async (uuid: string, accessToken?: string) => {
  const response = await axiosInstance.post(
    '/transactions/reminder',
    { uuid },
    { headers: authHeaders(accessToken) }
  );
  return response.data;
};

export const createTransaction = async (
  data: {
    roomId: number;
    qty: number;
    startDate: string;
    endDate: string;
    paymentMethod: PaymentMethod;
  },
  accessToken?: string
) => {
  const response = await axiosInstance.post('/transactions/create', data, {
    headers: authHeaders(accessToken),
  });
  return response.data;
};

export const uploadPaymentProof = async (
  uuid: string,
  file: File,
  accessToken?: string
) => {
  const formData = new FormData();
  formData.append('paymentProof', file);
  formData.append('uuid', uuid);
  
  const response = await axiosInstance.patch(
    '/transactions/upload-proof',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...authHeaders(accessToken),
      },
    }
  );
  return response.data;
};

export const getTransactionByUuid = async (uuid: string, accessToken?: string) => {
  const response = await axiosInstance.get(`/transactions/${uuid}`, {
    headers: authHeaders(accessToken),
  });
  return response.data;
};

// Request Midtrans Snap Token from backend for a given transaction UUID
// The backend should create/retrieve the snap token and return: { token: string }
export const getSnapToken = async (uuid: string, accessToken?: string) => {
  const response = await axiosInstance.post(
    '/transactions/snap-token',
    { uuid },
    { headers: authHeaders(accessToken) }
  );
  return response.data;
};