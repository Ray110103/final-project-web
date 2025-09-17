// src/lib/transaction-service.ts
import { axiosInstance } from '@/lib/axios';

export const updateTransaction = async (uuid: string, type: 'ACCEPT' | 'REJECT') => {
  const response = await axiosInstance.patch('/transactions/update', {
    uuid,
    type
  });
  return response.data;
};

export const cancelTransaction = async (uuid: string) => {
  const response = await axiosInstance.patch('/transactions/cancel', {
    uuid
  });
  return response.data;
};

export const sendReminderEmail = async (uuid: string) => {
  const response = await axiosInstance.post('/transactions/reminder', {
    uuid
  });
  return response.data;
};

export const createTransaction = async (data: {
  roomId: number;
  qty: number;
  startDate: string;
  endDate: string;
  paymentMethod: 'MANUAL_TRANSFER' | 'PAYMENT_GATEWAY';
}) => {
  const response = await axiosInstance.post('/transactions/create', data);
  return response.data;
};

export const uploadPaymentProof = async (uuid: string, file: File) => {
  const formData = new FormData();
  formData.append('paymentProof', file);
  formData.append('uuid', uuid);
  
  const response = await axiosInstance.patch('/transactions/upload-proof', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};