import { User } from "@/types/user";
import { Property } from "./property";

export interface Review {
  id: number;
  comment: string;
  rating: number;
  userId: number;
  user: User;
  propertyId: number;
  property: Property;
  transactionId: number;
  createdAt: string;
  replies: Reply[];
}

export interface Reply {
  id: number;
  comment: string;
  reviewId: number;
  tenantId: number;
  tenant: Tenant;
  createdAt: string;
}



export interface Tenant {
  id: number;
  name: string;
  email: string;
  pictureProfile: string | null;
}