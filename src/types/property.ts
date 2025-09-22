// types/property.ts - UPDATED interface
import { Room } from "@/types/room";
import { PropertyCategory } from "@/types/category";

export interface Property {
  id: number;
  title: string;
  slug: string;
  description: string;
  location: string;
  city: string;
  address: string;
  latitude: number;
  longtitude: number;
  thumbnail: string;
  
  // Updated category structure
  categoryId?: number | null;
  category?: PropertyCategory | null; // Changed from string to object
  
  createdAt: string;
  updatedAt: string;
  tenantId: string;
  rooms?: Room[];
  facilities?: { id?: number; title: string }[]; // Added id for facilities
  images: PropertyImage[];
  status: "ACTIVE" | "DRAFT" | "SOLD";
}

export interface PropertyAvailability {
  date: string;
  available: boolean;
  stock: number;
  booked: boolean;
}

export interface PropertyImage {
  id: number;
  url: string;
  propertyId: number;
  createdAt: string;
  updatedAt: string;
}