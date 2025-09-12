import { Room } from "@/types/room";

export interface Property {
  id: number;
  title: string;
  slug: string;
  description: string
  location: string;
  city: string;
  address: string;
  latitude: number;
  longtitude: number;
  thumbnail: string;
  category: string;
  createdAt: string; // usually ISO date string
  updatedAt: string;
  tenantId: string;
  rooms?: Room[]
}


export interface PropertyAvailability {
  date: string;
  available: boolean;
  stock: number;
  booked: boolean;
}
