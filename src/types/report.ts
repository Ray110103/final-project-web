import { Property} from "@/types/property";
import { Room } from "@/types/room";
import { Transaction} from "@/types/transaction";

export interface SalesReport {
  data: PropertySalesData[];
  meta: {
    page: number;
    take: number;
    total: number;
    totalSales: number;
  };
}

export interface PropertySalesData {
  property: Property;
  totalSales: number;
  transactions: Transaction[];
}

export interface PropertyReport {
  data: PropertyReportData[];
}

export interface PropertyReportData {
  property: Property;
  rooms: RoomReportData[];
}

export interface RoomReportData {
  room: Room;
  calendar: PropertyAvailability[];
}

export interface PropertyAvailability {
  date: string;
  available: boolean;
  stock: number;
  booked: boolean;
  bookedUnits?: number;
  availableUnits?: number;
}