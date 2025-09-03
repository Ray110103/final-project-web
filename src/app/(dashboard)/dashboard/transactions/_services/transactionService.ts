// services/transactionService.ts
import { axiosInstance } from '@/lib/axios';
import axios from 'axios';

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