// types/room.ts
import { Property } from "./property";

export interface Room {
  id: number;
  name: string;
  stock: number;
  price: string; // Prisma Decimal comes back as string in JSON
  propertyId: number;
  property?: Property;
}

