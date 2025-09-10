// types/room.ts
import { Property } from "./property";

export interface Room {
  id: number;
  name: string;
  stock: number;
  capacity: string;
  price: number; // Prisma Decimal comes back as string in JSON
  description: string;
  propertyId: number;
  property?: Property;
}
