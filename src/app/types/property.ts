export interface Property {
  id: string;
  title: string;
  slug: string;
  description: string
  location: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  thumbnail: string;
  category: string;
  createdAt: string; // usually ISO date string
  updatedAt: string;
  tenantId: string;
}
