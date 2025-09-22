"use client";

import { useEffect, use } from "react"; // Import `use`
import { useRouter, useSearchParams } from "next/navigation";

interface PageProps {
  params: Promise<{ result: string }>;
}

export default function PaymentResultPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { result } = use(params); // Unwrap the promise

  useEffect(() => {
    const resultStr = (result || "").toLowerCase();
    const orderId = searchParams.get("order_id") || "";

    let paymentStatus = "";
    if (resultStr === "finish") paymentStatus = "success";
    else if (resultStr === "unfinish") paymentStatus = "pending";
    else if (resultStr === "error") paymentStatus = "error";

    const query = new URLSearchParams();
    if (paymentStatus) query.set("payment", paymentStatus);
    if (orderId) query.set("order", orderId);

    router.replace(`/orders${query.toString() ? `?${query.toString()}` : ""}`);
  }, [result, router, searchParams]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin mx-auto mb-4 h-8 w-8 rounded-full border-2 border-muted border-t-primary" />
        <p className="text-muted-foreground">Mengalihkan ke halaman pesanan...</p>
      </div>
    </div>
  );
}