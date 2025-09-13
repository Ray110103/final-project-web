// types/room.ts
import { Property } from "./property";

export interface RoomImage {
  id: number;
  url: string;
  roomId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: number;
  name: string;
  stock: number;
  capacity: number; // changed to number biar konsisten
  price: number; // Prisma Decimal comes back as string in JSON, tapi parse di frontend
  description: string;
  propertyId: number;
  property?: Property;
  roomImages?: RoomImage[]; // ✅ add relation
  images?: RoomImage[]; // ✅ tambahkan ini
}
