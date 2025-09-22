"use client";

import { TransactionStatus } from "@/types/transaction";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Mail, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TransactionTableProps {
  transactions: any[];
  onAction: (transaction: any, action: "ACCEPT" | "REJECT" | "CANCEL") => void;
  onReminder: (transaction: any) => void;
  loading: boolean;
}

export function TransactionTable({
  transactions,
  onAction,
  onReminder,
  loading,
}: TransactionTableProps) {
  // Get status badge variant based on transaction status
  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case "WAITING_FOR_PAYMENT":
        return <Badge variant="destructive">Menunggu Pembayaran</Badge>;
      case "WAITING_FOR_CONFIRMATION":
        return <Badge variant="secondary">Menunggu Konfirmasi</Badge>;
      case "PAID":
        return <Badge className="bg-green-600">Dibayar</Badge>;
      case "CANCELLED":
        return <Badge variant="outline">Dibatalkan</Badge>;
      case "EXPIRED":
        return <Badge variant="outline">Kedaluwarsa</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get status icon based on transaction status
  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case "WAITING_FOR_PAYMENT":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "WAITING_FOR_CONFIRMATION":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "PAID":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "EXPIRED":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPp", { locale: id });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Tidak ada transaksi yang ditemukan
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID Transaksi
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kamar
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Penyewa
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tanggal
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {transaction.uuid}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="font-medium">{transaction.room?.name}</div>
                <div className="text-xs text-gray-500">
                  {transaction.room?.property?.title}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="font-medium">{transaction.user?.name}</div>
                <div className="text-xs text-gray-500">
                  {transaction.user?.email}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(transaction.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatCurrency(transaction.total)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {getStatusIcon(transaction.status)}
                  <span className="ml-2">{getStatusBadge(transaction.status)}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {transaction.status === "WAITING_FOR_CONFIRMATION" && (
                      <>
                        <DropdownMenuItem
                          onClick={() => onAction(transaction, "ACCEPT")}
                          className="text-green-600"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Terima Pembayaran
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onAction(transaction, "REJECT")}
                          className="text-red-600"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Tolak Pembayaran
                        </DropdownMenuItem>
                      </>
                    )}
                    {transaction.status === "PAID" && (
                      <DropdownMenuItem
                        onClick={() => onReminder(transaction)}
                        className="text-blue-600"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Kirim Pengingat
                      </DropdownMenuItem>
                    )}
                    {transaction.status === "WAITING_FOR_PAYMENT" && !transaction.paymentProof && (
                      <DropdownMenuItem
                        onClick={() => onAction(transaction, "CANCEL")}
                        className="text-red-600"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Batalkan Pesanan
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
