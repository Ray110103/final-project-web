"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, MoreHorizontal, Clock, CheckCircle, XCircle, ExternalLink, Loader2, Star } from "lucide-react";
import { useGetUserTransactions } from "@/app/dashboard/_hooks/use-transactions";
import type { Transaction, TransactionStatus } from "@/types/transaction";
import { cancelTransaction, uploadPaymentProof, getSnapToken } from "@/lib/transaction-service";
import { PaymentUpload } from "@/components/user/payment-upload";
import { toast } from "sonner";
import { loadSnap } from "@/lib/midtrans";
import axiosInstance from "@/lib/axios";

function OrdersContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchNumber, setSearchNumber] = useState("");
  const [searchDate, setSearchDate] = useState(""); // ISO yyyy-mm-dd
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "ALL">("ALL");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [payingUuid, setPayingUuid] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { data, loading, error, refetch } = useGetUserTransactions({
    orderNumber: searchNumber || undefined,
    date: searchDate || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" });
  const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case "WAITING_FOR_PAYMENT":
        return <Badge variant="destructive">Menunggu Pembayaran</Badge>;
      case "WAITING_FOR_CONFIRMATION":
        return <Badge variant="secondary">Menunggu Konfirmasi</Badge>;
      case "PAID":
        return <Badge variant="default">Lunas</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Dibatalkan</Badge>;
      case "EXPIRED":
        return <Badge variant="outline">Kedaluwarsa</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const openUpload = (t: Transaction) => {
    setSelectedTx(t);
    setIsUploadOpen(true);
  };

  const handleUpload = async (file: File) => {
    if (!selectedTx) return;
    try {
      setIsUploading(true);
      await uploadPaymentProof(selectedTx.uuid, file, session?.user?.accessToken);
      toast.success("Bukti pembayaran berhasil diupload");
      setIsUploadOpen(false);
      setSelectedTx(null);
      refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Gagal mengupload bukti pembayaran";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  // Auto-open upload modal when redirected with ?upload=<uuid>
  useEffect(() => {
    const uploadUuid = searchParams.get("upload");
    if (!uploadUuid) return;
    const list = data?.data || [];
    const tx = list.find((x) => x.uuid === uploadUuid);
    if (tx) {
      setSelectedTx(tx);
      setIsUploadOpen(true);
      // Clean the URL to avoid reopening on subsequent renders
      router.replace("/orders");
    }
  }, [searchParams, data?.data, router]);

  // Handle Midtrans redirect results from /payment/[result]
  useEffect(() => {
    const payment = searchParams.get("payment");
    if (!payment) return;
    const orderId = searchParams.get("order");
    if (payment === "success") {
      toast.success(orderId ? `Pembayaran berhasil untuk pesanan ${orderId}` : "Pembayaran berhasil");
    } else if (payment === "pending") {
      toast.message(orderId ? `Pembayaran belum selesai untuk pesanan ${orderId}` : "Pembayaran belum selesai");
    } else if (payment === "error") {
      toast.error(orderId ? `Kesalahan pembayaran untuk pesanan ${orderId}` : "Terjadi kesalahan pembayaran");
    }
    refetch();
    router.replace("/orders");
  }, [searchParams, refetch, router]);

  const canUploadProof = (t: Transaction) => t.paymentMethod === "MANUAL_TRANSFER" && t.status === "WAITING_FOR_PAYMENT";
  const canCancel = (t: Transaction) => t.status === "WAITING_FOR_PAYMENT" && !t.paymentProof;
  // Allow pay now for PAYMENT_GATEWAY transactions that are awaiting payment.
  // Token will be fetched from backend; invoice_url is optional as fallback.
  const canPayNow = (t: Transaction) => t.paymentMethod === "PAYMENT_GATEWAY" && t.status === "WAITING_FOR_PAYMENT";
  const canReview = (t: Transaction) => t.status === "PAID" && new Date(t.endDate) < new Date();

  // Helper to extract snap token from Midtrans invoice_url redirection link
  const extractSnapToken = (url: string | null | undefined): string | null => {
    if (!url) return null;
    try {
      const u = new URL(url);
      const parts = u.pathname.split("/").filter(Boolean);
      const last = parts[parts.length - 1];
      return last ? last.split("?")[0] : null;
    } catch {
      const last = url.split("/").filter(Boolean).pop();
      return last ? last.split("?")[0] : null;
    }
  };

  const handlePayNow = async (t: Transaction) => {
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY as string;
    const isProd = (process.env.NEXT_PUBLIC_MIDTRANS_PRODUCTION as string) === "true";
    try {
      if (!session?.user?.accessToken) {
        toast.error("Harap login untuk melanjutkan pembayaran");
        return;
      }
      setPayingUuid(t.uuid);
      await loadSnap(clientKey, isProd);
      const { token } = await getSnapToken(t.uuid, (session.user as any).accessToken);
      (window as any).snap?.pay?.(token, {
        onSuccess: (result: any) => {
          console.log("Payment success:", result);
          toast.success("Pembayaran berhasil");
          refetch();
        },
        onPending: (result: any) => {
          console.log("Payment pending:", result);
          toast.info("Menunggu konfirmasi pembayaran");
          refetch();
        },
        onError: (error: any) => {
          console.error("Payment error:", error);
          toast.error("Terjadi kesalahan saat memproses pembayaran");
        },
        onClose: () => {
          console.log("Payment popup closed");
          setPayingUuid(null);
        },
      });
    } catch (err: any) {
      console.error("Error getting snap token:", err);
      const msg = err?.response?.data?.message || err.message || "Gagal memproses pembayaran";
      toast.error(msg);
      setPayingUuid(null);
    }
  };

  const handleOpenReview = (t: Transaction) => {
    setSelectedTx(t);
    setIsReviewOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedTx || !reviewComment.trim()) return;
    setIsSubmittingReview(true);
    try {
      await axiosInstance.post(
        '/reviews/create',
        {
          transactionUuid: selectedTx.uuid,
          comment: reviewComment,
          rating: reviewRating,
        },
        {
          headers: session?.user?.accessToken
            ? { Authorization: `Bearer ${session.user.accessToken}` }
            : undefined,
        }
      );
      toast.success('Ulasan berhasil dikirim');
      setIsReviewOpen(false);
      setReviewComment('');
      setReviewRating(5);
      refetch();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      const msg = error?.response?.data?.message || (error instanceof Error ? error.message : 'Gagal mengirim ulasan');
      toast.error(msg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const filtered = useMemo(() => {
    if (!data?.data) return [] as Transaction[];
    return data.data;
  }, [data]);

  const onCancel = async (t: Transaction) => {
    try {
      await cancelTransaction(t.uuid, session?.user?.accessToken);
      toast.success("Pesanan berhasil dibatalkan");
      refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Gagal membatalkan pesanan";
      toast.error(msg);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pesanan Saya</h1>
          <p className="text-muted-foreground text-sm">Lihat dan kelola riwayat transaksi Anda.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={loading}>
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input placeholder="Cari No. Order (UUID)" className="pl-8" value={searchNumber} onChange={(e) => setSearchNumber(e.target.value)} />
            </div>
            <div>
              <Input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant={statusFilter === "ALL" ? "default" : "outline"} onClick={() => setStatusFilter("ALL")}>Semua</Button>
              <Button variant={statusFilter === "WAITING_FOR_PAYMENT" ? "default" : "outline"} onClick={() => setStatusFilter("WAITING_FOR_PAYMENT")}>Menunggu</Button>
              <Button variant={statusFilter === "PAID" ? "default" : "outline"} onClick={() => setStatusFilter("PAID")}>Lunas</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-24 animate-pulse rounded bg-muted" />
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">Tidak ada pesanan</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Order</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Properti / Kamar</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.uuid}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(t.startDate)} - {formatDate(t.endDate)}</div>
                        <div className="text-muted-foreground text-xs">Dibuat: {formatDate(t.createdAt)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{t.room.property?.title ?? "-"}</div>
                        <div className="text-muted-foreground">{t.room.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {t.status === "PAID" ? <CheckCircle className="h-4 w-4 text-green-500" /> : t.status === "WAITING_FOR_PAYMENT" ? <Clock className="h-4 w-4 text-yellow-500" /> : <XCircle className="h-4 w-4 text-gray-400" />}
                        {getStatusBadge(t.status)}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(t.total)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canUploadProof(t) && (
                            <DropdownMenuItem onClick={() => openUpload(t)}>
                              Upload Bukti Bayar
                            </DropdownMenuItem>
                          )}
                          {canPayNow(t) && (
                            <DropdownMenuItem
                              disabled={payingUuid === t.uuid}
                              onClick={() => handlePayNow(t)}
                            >
                              {payingUuid === t.uuid ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Memproses...
                                </>
                              ) : (
                                <>
                                  <ExternalLink className="h-4 w-4 mr-2" /> Bayar Sekarang
                                </>
                              )}
                            </DropdownMenuItem>
                          )}
                          {canCancel(t) && (
                            <DropdownMenuItem className="text-red-600" onClick={() => onCancel(t)}>
                              Batalkan Pesanan
                            </DropdownMenuItem>
                          )}
                          {canReview(t) && (
                            <DropdownMenuItem onClick={() => handleOpenReview(t)}>
                              <Star className="mr-2 h-4 w-4" />
                              Beri Ulasan
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Upload Payment Proof Modal */}
      <Dialog
        open={isUploadOpen}
        onOpenChange={(open) => {
          setIsUploadOpen(open);
          if (!open) setSelectedTx(null);
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Upload Bukti Pembayaran</DialogTitle>
          </DialogHeader>
          {selectedTx && (
            <PaymentUpload transaction={selectedTx} onUpload={handleUpload} isUploading={isUploading} />
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Beri Ulasan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Rating</h3>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none"
                    disabled={isSubmittingReview}
                  >
                    <Star
                      className={`w-6 h-6 ${star <= reviewRating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Ulasan</h3>
              <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Bagaimana pengalaman menginap Anda?"
                className="min-h-[120px]"
                disabled={isSubmittingReview}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsReviewOpen(false)}
                disabled={isSubmittingReview}
              >
                Batal
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={isSubmittingReview || !reviewComment.trim()}
              >
                {isSubmittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-6">Memuat pesanan...</div>}>
      <OrdersContent />
    </Suspense>
  );
}