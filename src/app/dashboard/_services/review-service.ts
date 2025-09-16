// src/lib/review-service.ts
import { axiosInstance } from '@/lib/axios';

export const createReview = async (data: {
  propertyId: number;
  rating: number;
  comment: string;
}) => {
  const response = await axiosInstance.post('/reviews/create', data);
  return response.data;
};

export const getReviewsByProperty = async (propertyId: number) => {
  const response = await axiosInstance.get(`/reviews/property/${propertyId}`);
  return response.data;
};

export const createReply = async (data: {
  reviewId: number;
  comment: string;
}) => {
  const response = await axiosInstance.post('/reviews/reply', data);
  return response.data;
};