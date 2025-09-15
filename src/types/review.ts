export interface CreateReviewDTO {
  transactionUuid: string;
  comment: string;
  rating: number;
}

export interface CreateReplyDTO {
  reviewId: number;
  comment: string;
}

export interface Review {
  id: number;
  comment: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  propertyId: number;
  transactionId: number;
  user: {
    id: number;
    name: string;
    email: string;
    pictureProfile?: string;
  };
  property: {
    id: number;
    title: string;
    city: string;
    tenantId: number;
  };
  replies: Reply[];
}

export interface Reply {
  id: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  reviewId: number;
  tenantId: number;
  tenant: {
    id: number;
    name: string;
    email: string;
  };
}