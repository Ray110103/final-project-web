// types/room.ts - UPDATED interface
import { Property } from "./property";

export interface RoomImage {
  id: number;
  url: string;
  roomId: number;
  createdAt: string;
  updatedAt: string;
}

// NEW: Room Facility interface
export interface RoomFacility {
  id: number;
  title: string;
  roomId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: number;
  name: string;
  stock: number;
  capacity: number; // 👈 REMOVE optional - now required in backend
  price: number; // Backend returns Decimal as string, parse in frontend
  description: string;
  propertyId: number;
  property?: Property;
  
  // 👈 STANDARDIZE image field names
  images?: RoomImage[]; // Use this as primary
  roomImages?: RoomImage[]; // Keep for backward compatibility
  
  // 👈 ADD facilities support
  facilities?: RoomFacility[];
  
  // 👈 ADD timestamps
  createdAt: string;
  updatedAt: string;
}

// NEW: Room creation payload interface (for forms)
export interface CreateRoomPayload {
  name: string;
  property: string; // property slug or ID
  price: string; // String because form input
  limit: string; // stock - String because form input
  capacity: string; // String because form input
  description: string;
  facilities?: { title: string }[]; // Simplified for forms
}

// NEW: Room update payload interface
export interface UpdateRoomPayload {
  name?: string;
  property?: string;
  price?: string;
  limit?: string;
  capacity?: string;
  description?: string;
  facilities?: { title: string }[];
}

// NEW: Room search/filter interface
export interface RoomSearchParams {
  destination?: string;
  checkInDate?: string;
  checkOutDate?: string;
  capacity?: number;
  page?: number;
  take?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  property?: string;
  name?: string;
}

// NEW: Room search result with meta
export interface RoomSearchResponse {
  data: Room[];
  meta: {
    page: number;
    take: number;
    total: number;
  };
}