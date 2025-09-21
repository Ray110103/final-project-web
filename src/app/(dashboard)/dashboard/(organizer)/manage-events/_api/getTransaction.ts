import { axiosInstance } from "@/lib/axios";
import { Transaction } from "@/types/transaction";
import { cache } from "react";

export const getBlog = cache(async (slug: string) => {
  const { data } = await axiosInstance.get<Transaction>(`/transactions`);
  return data;
});
