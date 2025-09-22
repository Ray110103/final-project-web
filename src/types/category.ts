// types/category.ts - NEW interface for PropertyCategory
export interface PropertyCategory {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  tenantId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  _count?: {
    properties: number;
  };
}