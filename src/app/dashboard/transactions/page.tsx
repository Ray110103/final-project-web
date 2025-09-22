"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transaction as TransactionType } from '@/types/transaction';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, RefreshCw, CheckCircle, XCircle, Clock, Mail, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from 'next-auth/react';
import { useGetTenantTransactions } from '../_hooks/use-transactions';
import { updateTransaction, cancelTransaction, sendReminderEmail } from '@/lib/transaction-service';
import { TransactionStatus } from '@/types/transaction';
import { toast } from 'sonner';

// Type for transaction actions
type TransactionAction = "ACCEPT" | "REJECT" | "CANCEL";

// Use the imported TransactionType from types
type Transaction = TransactionType;

export default function TenantTransactionsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<TransactionStatus | "ALL">("ALL");
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<TransactionAction>("ACCEPT");
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("all");

    const { data: session } = useSession();
    const accessToken = (session?.user as any)?.accessToken as string | undefined;
    
    const { data: transactionsData, loading, error, refetch } = useGetTenantTransactions({
        status: statusFilter !== "ALL" ? statusFilter : undefined
    });

    // Format date to readable format
    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      try {
        return new Date(dateString).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      } catch (e) {
        console.error('Error formatting date:', e);
        return dateString;
      }
    };

    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount);
    };

    // Get status text
    const getStatusText = (status: TransactionStatus) => {
      switch (status) {
        case "WAITING_FOR_PAYMENT":
          return "Menunggu Pembayaran";
        case "WAITING_FOR_CONFIRMATION":
          return "Menunggu Konfirmasi";
        case "PAID":
          return "Dibayar";
        case "CANCELLED":
          return "Dibatalkan";
        case "EXPIRED":
          return "Kedaluwarsa";
        default:
          return status;
      }
    };

    // Get status icon
    const getStatusIcon = (status: TransactionStatus) => {
      const className = "h-4 w-4 mr-2";
      switch (status) {
        case "WAITING_FOR_PAYMENT":
          return <Clock className={`${className} text-yellow-500`} />;
        case "WAITING_FOR_CONFIRMATION":
          return <Clock className={`${className} text-blue-500`} />;
        case "PAID":
          return <CheckCircle className={`${className} text-green-500`} />;
        case "CANCELLED":
          return <XCircle className={`${className} text-red-500`} />;
        case "EXPIRED":
          return <XCircle className={`${className} text-gray-500`} />;
        default:
          return <Clock className={`${className} text-gray-500`} />;
      }
    };

    // Handle transaction action (accept, reject, cancel)
    const handleTransactionAction = async (transaction: Transaction, action: TransactionAction) => {
        if (!transaction || !accessToken) return;
        
        setSelectedTransaction(transaction);
        setActionType(action);
        
        if (action === "CANCEL") {
            setIsCancelDialogOpen(true);
        } else {
            setIsConfirmDialogOpen(true);
        }
    };

    // Handle sending reminder email
    const handleReminder = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsReminderDialogOpen(true);
    };

    // Confirm and execute transaction action
    const confirmAction = async () => {
        if (!selectedTransaction || !accessToken) return;
        
        setIsActionLoading(true);
        
        try {
            if (actionType === "CANCEL") {
                await cancelTransaction(selectedTransaction.uuid, accessToken);
                toast.success("Transaksi berhasil dibatalkan");
            } else {
                // Use the new confirm endpoint for ACCEPT/REJECT actions
                const response = await fetch('http://localhost:8000/transactions/confirm', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        uuid: selectedTransaction.uuid,
                        action: actionType
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Gagal memproses transaksi');
                }

                toast.success(`Transaksi berhasil ${actionType === "ACCEPT" ? "diterima" : "ditolak"}`);
            }
            
            // Close dialogs
            setIsConfirmDialogOpen(false);
            setIsCancelDialogOpen(false);
            setSelectedTransaction(null);
            
            // Refetch data
            refetch();
        } catch (error) {
            console.error("Error updating transaction:", error);
            const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
            toast.error(`Gagal ${actionType === "ACCEPT" ? "menerima" : actionType === "REJECT" ? "menolak" : "membatalkan"} transaksi: ${errorMessage}`);
        } finally {
            setIsActionLoading(false);
        }
    };

    // Send reminder email
    const sendReminder = async () => {
        if (!selectedTransaction || !accessToken) return;
        
        setIsActionLoading(true);
        
        try {
            await sendReminderEmail(selectedTransaction.uuid, accessToken);
            toast.success("Email pengingat berhasil dikirim");
            
            // Close dialog
            setIsReminderDialogOpen(false);
            setSelectedTransaction(null);
        } catch (error) {
            console.error("Error sending reminder:", error);
            toast.error("Gagal mengirim email pengingat");
        } finally {
            setIsActionLoading(false);
        }
    };

    // Filter transactions by status for tabs
    const getTransactionsByStatus = (status: TransactionStatus | "ALL") => {
        if (!transactionsData?.data) return [];
        if (status === "ALL") return transactionsData.data;
        return transactionsData.data.filter((t: any) => t.status === status);
    };

    // Filter transactions based on search term
    const transactions = transactionsData?.data || [];
    const searchedTransactions = searchTerm 
        ? transactions.filter((transaction: any) => {
            if (!transaction) return false;
            const searchLower = searchTerm.toLowerCase();
            const userName = transaction.user?.name || '';
            const roomName = transaction.room?.name || '';
            const propertyName = transaction.room?.property?.title || '';
            const transactionId = transaction.uuid || '';
            
            return (
                userName.toLowerCase().includes(searchLower) ||
                roomName.toLowerCase().includes(searchLower) ||
                propertyName.toLowerCase().includes(searchLower) ||
                transactionId.toLowerCase().includes(searchLower)
            );
        })
        : transactions;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Manajemen Transaksi</h2>
                    <p className="text-muted-foreground">
                        Kelola transaksi dan konfirmasi pembayaran properti Anda.
                    </p>
                </div>
                <Button 
                    variant="outline" 
                    onClick={() => refetch()}
                    disabled={loading}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Muat Ulang
                </Button>
            </div>
            
            {/* Search and Filter */}
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                        placeholder="Cari transaksi..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center space-x-2">
                    <Tabs 
                        value={statusFilter} 
                        onValueChange={(value) => setStatusFilter(value as TransactionStatus | "ALL")}
                        className="w-full md:w-auto"
                    >
                        <TabsList className="bg-gray-100 p-1 rounded-lg">
                            <TabsTrigger 
                                value="ALL"
                                className="px-4 py-1.5 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-gray-200"
                            >
                                Semua
                            </TabsTrigger>
                            <TabsTrigger 
                                value="WAITING_FOR_PAYMENT"
                                className="px-4 py-1.5 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-yellow-200"
                            >
                                Menunggu Pembayaran
                            </TabsTrigger>
                            <TabsTrigger 
                                value="WAITING_FOR_CONFIRMATION"
                                className="px-4 py-1.5 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-blue-200"
                            >
                                Menunggu Konfirmasi
                            </TabsTrigger>
                            <TabsTrigger 
                                value="PAID"
                                className="px-4 py-1.5 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-green-200"
                            >
                                Dibayar
                            </TabsTrigger>
                            <TabsTrigger 
                                value="CANCELLED"
                                className="px-4 py-1.5 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-red-200"
                            >
                                Dibatalkan
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>
            
            {/* Transaction Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Transaksi</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <TransactionTable 
                        transactions={searchedTransactions}
                        onAction={handleTransactionAction}
                        onReminder={handleReminder}
                        loading={loading}
                        formatDate={formatDate}
                        formatCurrency={formatCurrency}
                        getStatusIcon={getStatusIcon}
                        getStatusText={getStatusText}
                    />
                </CardContent>
            </Card>
            
            {/* Confirmation Dialog */}
            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === "ACCEPT" ? "Terima Pembayaran" : "Tolak Pembayaran"}
                        </DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin {actionType === "ACCEPT" ? "menerima" : "menolak"} pembayaran ini?
                            {actionType === "REJECT" && " Status transaksi akan dikembalikan ke Menunggu Pembayaran."}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsConfirmDialogOpen(false)}
                            disabled={isActionLoading}
                        >
                            Batal
                        </Button>
                        <Button 
                            variant={actionType === "ACCEPT" ? "default" : "destructive"}
                            onClick={confirmAction}
                            disabled={isActionLoading}
                        >
                            {isActionLoading ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Memproses...
                                </>
                            ) : actionType === "ACCEPT" ? (
                                "Terima Pembayaran"
                            ) : (
                                "Tolak Pembayaran"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Cancel Dialog */}
            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Batalkan Pesanan</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin membatalkan pesanan ini? Aksi ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsCancelDialogOpen(false)}
                            disabled={isActionLoading}
                        >
                            Batal
                        </Button>
                        <Button 
                            variant="destructive"
                            onClick={confirmAction}
                            disabled={isActionLoading}
                        >
                            {isActionLoading ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                "Batalkan Pesanan"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Reminder Dialog */}
            <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Kirim Pengingat</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin mengirim email pengingat ke {selectedTransaction?.user?.name}?
                            Email akan berisi detail pemesanan dan instruksi check-in.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsReminderDialogOpen(false)}
                            disabled={isActionLoading}
                        >
                            Batal
                        </Button>
                        <Button 
                            onClick={sendReminder}
                            disabled={isActionLoading}
                        >
                            {isActionLoading ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Mengirim...
                                </>
                            ) : (
                                "Kirim Pengingat"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Transaction Table Component
interface TransactionTableProps {
    transactions: Transaction[];
    onAction: (transaction: Transaction, action: "ACCEPT" | "REJECT" | "CANCEL") => void;
    onReminder: (transaction: Transaction) => void;
    loading: boolean;
    formatDate: (dateString: string) => string;
    formatCurrency: (amount: number) => string;
    getStatusIcon: (status: TransactionStatus) => React.ReactElement;
    getStatusText: (status: TransactionStatus) => string;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
    transactions,
    onAction,
    onReminder,
    loading,
    formatDate,
    formatCurrency,
    getStatusIcon,
    getStatusText
}) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
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
                                <div className="flex items-center">
                                    <Avatar className="h-8 w-8 mr-2">
                                        <AvatarFallback>
                                            {transaction.user?.name?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{transaction.user?.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {transaction.user?.email}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(transaction.startDate)} - {formatDate(transaction.endDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(transaction.total)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    {getStatusIcon(transaction.status)}
                                    <span>{getStatusText(transaction.status)}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                    {transaction.status === "WAITING_FOR_CONFIRMATION" && (
                                        <>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="text-green-700 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-800 hover:border-green-300 transition-colors"
                                                onClick={() => onAction(transaction, "ACCEPT")}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1.5" />
                                                Terima
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="text-red-700 border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-800 hover:border-red-300 transition-colors"
                                                onClick={() => onAction(transaction, "REJECT")}
                                            >
                                                <XCircle className="h-4 w-4 mr-1.5" />
                                                Tolak
                                            </Button>
                                        </>
                                    )}
                                    {transaction.status === "PAID" && (
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-300 transition-colors"
                                            onClick={() => onReminder(transaction)}
                                        >
                                            <Mail className="h-4 w-4 mr-1.5" />
                                            Kirim Pengingat
                                        </Button>
                                    )}
                                    {transaction.status === "WAITING_FOR_PAYMENT" && !transaction.paymentProof && (
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:text-amber-800 hover:border-amber-300 transition-colors"
                                            onClick={() => onAction(transaction, "CANCEL")}
                                        >
                                            <XCircle className="h-4 w-4 mr-1.5" />
                                            Batalkan
                                        </Button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};