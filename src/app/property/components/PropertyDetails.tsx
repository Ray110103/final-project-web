"use client";

import type { FC } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useGetPropertyBySlug from "../_hooks/useGetPropertyBySlug";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { createTransaction, getSnapToken } from "@/lib/transaction-service";
import {
  MapPin,
  Calendar,
  Building,
  User,
  Hash,
  Clock,
  Navigation,
} from "lucide-react";
import { loadSnap } from "@/lib/midtrans";
import { ReviewSection } from "@/components/property/ReviewSection";

interface PropertyDetailsProps {
  slug: string;
}

const PropertyDetails: FC<PropertyDetailsProps> = ({ slug }) => {
  const { data: property, isPending, isError } = useGetPropertyBySlug(slug);
  const router = useRouter();
  const { data: session } = useSession();

  // Booking form state
  const [roomId, setRoomId] = useState<number | null>(null);
  const [qty, setQty] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>(""
  );
  const [endDate, setEndDate] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"MANUAL_TRANSFER" | "PAYMENT_GATEWAY">("MANUAL_TRANSFER");
  const [submitting, setSubmitting] = useState(false);

  // Initialize defaults when property loads
  useEffect(() => {
    if (property?.rooms && property.rooms.length > 0) {
      setRoomId(property.rooms[0].id);
    }
    // Default date: today and tomorrow
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setStartDate(toIso(today));
    setEndDate(toIso(tomorrow));
  }, [property]);

  const canSubmit = useMemo(() => {
    return !!roomId && !!startDate && !!endDate && qty > 0;
  }, [roomId, startDate, endDate, qty]);

  const onCreateTransaction = async () => {
    if (!canSubmit) return;
    try {
      // Validate date order
      if (new Date(startDate) > new Date(endDate)) {
        toast.error("Tanggal check-in harus sebelum tanggal check-out");
        return;
      }
      setSubmitting(true);
      const res = await createTransaction(
        {
          roomId: roomId as number,
          qty,
          startDate,
          endDate,
          paymentMethod,
        },
        (session?.user as any)?.accessToken
      );

      // Assume API returns a transaction-like object
      const tx = res?.data;
      const uuid = tx?.uuid as string | undefined;
      const invoiceUrl = tx?.invoice_url as string | undefined;

      if (paymentMethod === "PAYMENT_GATEWAY") {
        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY as string;
        const isProd = (process.env.NEXT_PUBLIC_MIDTRANS_PRODUCTION as string) === "true";
        const fallback = () => {
          if (invoiceUrl) window.open(invoiceUrl, "_blank");
        };
        try {
          await loadSnap(clientKey, isProd);
          // Retrieve token from backend by uuid
          const resToken = await getSnapToken(uuid as string, (session?.user as any)?.accessToken);
          const token = resToken?.token as string | undefined;
          if (!token) {
            toast.error("Token pembayaran tidak tersedia");
            fallback();
            router.push("/orders");
            return;
          }
          const snap: any = (window as any).snap;
          if (!snap?.pay) {
            fallback();
            router.push("/orders");
            return;
          }
          snap.pay(token, {
            onSuccess: () => {
              toast.success("Pembayaran berhasil");
              router.push("/orders");
            },
            onPending: () => {
              toast.message("Menunggu pembayaran diselesaikan");
              router.push("/orders");
            },
            onError: () => {
              toast.error("Terjadi kesalahan saat proses pembayaran");
            },
            onClose: () => {
              toast("Popup pembayaran ditutup");
            },
          });
          return;
        } catch (e: any) {
          toast.error(e?.message || "Gagal memuat Midtrans");
          fallback();
          router.push("/orders");
          return;
        }
      }
      if (uuid) {
        // Open orders with upload modal preselected
        router.push(`/orders?upload=${uuid}`);
      } else {
        router.push("/orders");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Gagal membuat pesanan";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-64 md:h-96 w-full rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-12">
            <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Properti Tidak Ditemukan
            </h2>
            <p className="text-muted-foreground mb-6">
              Properti yang Anda cari tidak ada atau telah dihapus.
            </p>
            <Button onClick={() => router.push("/property")} className="w-full">
              Kembali ke Daftar Properti
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Image */}
        <div className="relative w-full h-64 md:h-96 mb-8 rounded-xl overflow-hidden shadow-lg">
          <Image
            src={
              property.thumbnail ||
              "/placeholder.svg?height=400&width=800&query=modern property exterior"
            }
            alt={property.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Category */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
                    {property.title}
                  </h1>
                </div>
                {property.category && (
                  <Badge variant="secondary" className="shrink-0">
                    <Building className="h-3 w-3 mr-1" />
                    {property.category}
                  </Badge>
                )}
              </div>

              {/* Location Details */}
              <div className="space-y-2">
                {property.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm">{property.location}</span>
                  </div>
                )}

                {property.city && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building className="h-4 w-4 text-primary" />
                    <span className="text-sm">Kota: {property.city}</span>
                  </div>
                )}

                {property.address && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Navigation className="h-4 w-4 text-primary" />
                    <span className="text-sm">{property.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Deskripsi Properti
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-pretty">
                    {property.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Coordinates (if available) */}
            {property.latitude && property.longtitude && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Lokasi Koordinat
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Latitude:</span>
                      <p className="font-mono text-foreground">
                        {property.latitude}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Longitude:</span>
                      <p className="font-mono text-foreground">
                        {property.longtitude}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section (below coordinates) */}
            <Card>
              <CardContent className="pt-6">
                <ReviewSection propertyId={property.id?.toString() || ''} />
              </CardContent>
            </Card>

            {/* Display Property Images */}
            {property.images && property.images.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Property Images
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {property.images.map((img) => (
                      <div
                        key={img.id}
                        className="relative w-24 h-24 rounded-md overflow-hidden"
                      >
                        <Image
                          src={img.url}
                          alt={`Image of ${property.title}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Display Facilities */}
            {property.facilities && property.facilities.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Facilities
                  </h3>
                  <ul className="list-disc pl-6">
                    {property.facilities.map((facility) => (
                      <li key={facility.title} className="text-muted-foreground">
                        {facility.title}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Property Info */}
          <div className="space-y-6">
            {/* Property Information Card */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Informasi Properti
                </h3>

                <div className="space-y-4">
                  {/* Created Date */}
                  {property.createdAt && (
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Dibuat
                        </span>
                      </div>
                      <span className="text-sm text-foreground">
                        {new Date(property.createdAt).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  )}

                  {/* Updated Date */}
                  {property.updatedAt && (
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Diperbarui
                        </span>
                      </div>
                      <span className="text-sm text-foreground">
                        {new Date(property.updatedAt).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Room Details (if available) */}
            {property.rooms && property.rooms.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Daftar Ruangan
                  </h3>
                  <div className="space-y-4">
                    {property.rooms.map((room) => (
                      <div
                        key={room.id}
                        className="p-4 border rounded-lg flex flex-col gap-3 hover:shadow-sm transition"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-semibold text-foreground">
                            {room.name}
                          </h4>
                          {room.capacity && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              Kapasitas: {room.capacity}
                            </span>
                          )}
                        </div>

                        {/* Room Images */}
                        {room.images && room.images.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {room.images.map((img) => (
                              <div
                                key={img.id}
                                className="relative w-24 h-24 rounded-md overflow-hidden"
                              >
                                <Image
                                  src={img.url}
                                  alt={room.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {room.description && (
                          <p className="text-sm text-muted-foreground">
                            {room.description}
                          </p>
                        )}
                        {room.price && (
                          <p className="text-sm text-foreground font-medium">
                            Harga: Rp {room.price.toLocaleString("id-ID")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Booking Form */}
            {property.rooms && property.rooms.length > 0 && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Reservasi Kamar</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {/* Room select */}
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">Pilih Kamar</label>
                      <select
                        className="w-full border rounded-md px-3 py-2 bg-background"
                        value={roomId ?? undefined}
                        onChange={(e) => setRoomId(Number(e.target.value))}
                      >
                        {property.rooms.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} {r.price ? `- Rp ${r.price.toLocaleString('id-ID')}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-sm text-muted-foreground">Check-in</label>
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm text-muted-foreground">Check-out</label>
                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">Jumlah</label>
                      <Input
                        type="number"
                        min={1}
                        value={qty}
                        onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                      />
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">Metode Pembayaran</label>
                      <select
                        className="w-full border rounded-md px-3 py-2 bg-background"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                      >
                        <option value="MANUAL_TRANSFER">Transfer Manual (upload bukti)</option>
                        <option value="PAYMENT_GATEWAY">Payment Gateway (otomatis)</option>
                      </select>
                    </div>

                    <Button onClick={onCreateTransaction} disabled={!canSubmit || submitting} className="w-full">
                      {submitting ? "Memproses..." : "Buat Pesanan"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    Hubungi Pemilik
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    size="lg"
                  >
                    Simpan Properti
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => router.push("/property")}
                  >
                    Kembali ke Daftar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PropertyDetails;
