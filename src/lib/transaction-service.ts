import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Update Transaction Hook
export const useUpdateTransaction = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useSession();

  return useMutation({
    mutationFn: async ({
      uuid,
      type,
    }: {
      uuid: string;
      type: "ACCEPT" | "REJECT";
    }) => {
      const response = await axiosInstance.patch(
        "/transactions/confirm",
        { uuid, type },
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: async () => {
      alert("Transaction updated successfully");
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error: AxiosError<{ message: string; code: number }>) => {
      alert(error.response?.data.message ?? "Failed to update transaction");
    },
  });
};

// Cancel Transaction Hook
export const useCancelTransaction = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useSession();

  return useMutation({
    mutationFn: async ({
      uuid,
      type,
    }: {
      uuid: string;
      type: "CANCELLED";
    }) => {
      const response = await axiosInstance.patch(
        "/transactions/cancel-tenant",
        { uuid,type},
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: async () => {
      alert("Transaction canceled successfully");
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error: AxiosError<{ message: string; code: number }>) => {
      alert(error.response?.data.message ?? "Failed to cancel transaction");
    },
  });
};

// Send Reminder Email Hook
export const useSendReminderEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await axiosInstance.post("/transactions/reminder", {
        uuid,
      });
      return response.data;
    },
    onSuccess: async () => {
      alert("Reminder email sent successfully");
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error: AxiosError<{ message: string; code: number }>) => {
      alert(error.response?.data.message ?? "Failed to send reminder");
    },
  });
};

// Create Transaction Hook
interface CreateTransactionPayload {
  roomId: number;
  qty: number;
  startDate: string;
  endDate: string;
  paymentMethod: "MANUAL_TRANSFER" | "PAYMENT_GATEWAY";
}

export const useCreateTransaction = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTransactionPayload) => {
      const response = await axiosInstance.post("/transactions/create", data);
      return response.data;
    },
    onSuccess: async () => {
      alert("Transaction created successfully");
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error: AxiosError<{ message: string; code: number }>) => {
      alert(error.response?.data.message ?? "Failed to create transaction");
    },
  });
};

// Upload Payment Proof Hook
export const useUploadPaymentProof = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uuid, file }: { uuid: string; file: File }) => {
      const formData = new FormData();
      formData.append("paymentProof", file);
      formData.append("uuid", uuid);

      const response = await axiosInstance.patch(
        "/transactions/upload-proof",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data;
    },
    onSuccess: async () => {
      alert("Payment proof uploaded successfully");
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error: AxiosError<{ message: string; code: number }>) => {
      alert(error.response?.data.message ?? "Failed to upload payment proof");
    },
  });
};
