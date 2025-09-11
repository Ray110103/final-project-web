// pages/tenant/transactions.tsx
"use client";

import { useState, useEffect, JSX } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    MoreHorizontal,
    CheckCircle,
    XCircle,
    Clock,
    Mail,
    Calendar,
    Building,
    MapPin,
    RefreshCw,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetTransactions } from './_hooks/useGetTransactions';
import { updateTransaction, cancelTransaction, sendReminderEmail } from './_services/transactionService';


type TransactionStatus = "WAITING_FOR_PAYMENT" | "WAITING_FOR_CONFIRMATION" | "PAID" | "CANCELLED" | "EXPIRED";

interface Transaction {
    id: number;
    uuid: string;
    userid: number;
    username: string;
    roomid: string;
    room: {
        id: string;
        name: string;
        property: {
            id: number;
            name: string;
            city: string;
            address?: string;
        };
    };
    qty: number;
    status: TransactionStatus;
    total: number;
    startDate: string;
    endDate: string;
    paymentProof?: string;
    createdAt: string;
    updatedAt: string;
}

export default function TenantTransactionsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<TransactionStatus | "ALL">("ALL");
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<"ACCEPT" | "REJECT" | "CANCEL">("ACCEPT");
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const { data: transactionsData, loading, error, refetch } = useGetTransactions({
        status: statusFilter !== "ALL" ? statusFilter : undefined
    });

    // Format date to readable format
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Get status badge variant based on transaction status
    const getStatusBadge = (status: TransactionStatus) => {
        switch (status) {
            case "WAITING_FOR_PAYMENT":
                return <Badge variant="destructive">Waiting Payment</Badge>;
            case "WAITING_FOR_CONFIRMATION":
                return <Badge variant="secondary">Waiting Confirmation</Badge>;
            case "PAID":
                return <Badge variant="default">Paid</Badge>;
            case "CANCELLED":
                return <Badge variant="destructive">Cancelled</Badge>;
            case "EXPIRED":
                return <Badge variant="outline">Expired</Badge>;
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

    // Handle transaction action (accept, reject, cancel)
    const handleTransactionAction = async () => {
        if (!selectedTransaction) return;
        
        setIsActionLoading(true);
        
        try {
            if (actionType === "CANCEL") {
                await cancelTransaction(selectedTransaction.uuid);
                setToastMessage({ message: "Transaction cancelled successfully", type: "success" });
            } else {
                await updateTransaction(selectedTransaction.uuid, actionType);
                setToastMessage({ 
                    message: `Transaction ${actionType === "ACCEPT" ? "accepted" : "rejected"} successfully`, 
                    type: "success" 
                });
            }
            
            // Close dialogs
            setIsConfirmDialogOpen(false);
            setIsCancelDialogOpen(false);
            setSelectedTransaction(null);
            
            // Refetch data
            refetch();
        } catch (error) {
            console.error("Error updating transaction:", error);
            setToastMessage({ 
                message: `Failed to ${actionType === "ACCEPT" ? "accept" : actionType === "REJECT" ? "reject" : "cancel"} transaction`, 
                type: "error" 
            });
        } finally {
            setIsActionLoading(false);
        }
    };

    // Handle sending reminder email
    const handleSendReminder = async () => {
        if (!selectedTransaction) return;
        
        setIsActionLoading(true);
        
        try {
            await sendReminderEmail(selectedTransaction.uuid);
            setToastMessage({ message: "Reminder email sent successfully", type: "success" });
            
            // Close dialog
            setIsReminderDialogOpen(false);
            setSelectedTransaction(null);
        } catch (error) {
            console.error("Error sending reminder:", error);
            setToastMessage({ message: "Failed to send reminder email", type: "error" });
        } finally {
            setIsActionLoading(false);
        }
    };

    // Open confirmation dialog for action
    const openActionDialog = (transaction: Transaction, action: "ACCEPT" | "REJECT" | "CANCEL") => {
        setSelectedTransaction(transaction);
        setActionType(action);
        
        if (action === "CANCEL") {
            setIsCancelDialogOpen(true);
        } else {
            setIsConfirmDialogOpen(true);
        }
    };

    // Open reminder dialog
    const openReminderDialog = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsReminderDialogOpen(true);
    };

    // Filter transactions by status for tabs
    const getTransactionsByStatus = (status: TransactionStatus | "ALL") => {
        if (!transactionsData?.data) return [];
        if (status === "ALL") return transactionsData.data;
        return transactionsData.data.filter(t => t.status === status);
    };

    // Filter transactions based on search term
    const filteredTransactions = transactionsData?.data?.filter(transaction => 
        searchTerm === "" ||
        transaction.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.room.property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.uuid.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Transaction Management</h2>
                    <p className="text-muted-foreground">
                        Manage tenant transactions and payment confirmations for your properties.
                    </p>
                </div>
                <Button 
                    variant="outline" 
                    onClick={() => refetch()}
                    disabled={loading}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>
            
            {/* Toast Notification */}
            {toastMessage && (
                <div className={`p-4 rounded-md ${toastMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {toastMessage.message}
                </div>
            )}
            
            {/* Error State */}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>
                        Failed to load transactions: {error}
                    </AlertDescription>
                </Alert>
            )}
            
            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}
            
            {/* Filters and Search */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search transactions..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={statusFilter === "ALL" ? "default" : "outline"}
                                onClick={() => setStatusFilter("ALL")}
                            >
                                All
                            </Button>
                            <Button
                                variant={statusFilter === "WAITING_FOR_PAYMENT" ? "default" : "outline"}
                                onClick={() => setStatusFilter("WAITING_FOR_PAYMENT")}
                            >
                                Waiting Payment
                            </Button>
                            <Button
                                variant={statusFilter === "WAITING_FOR_CONFIRMATION" ? "default" : "outline"}
                                onClick={() => setStatusFilter("WAITING_FOR_CONFIRMATION")}
                            >
                                Waiting Confirmation
                            </Button>
                            <Button
                                variant={statusFilter === "PAID" ? "default" : "outline"}
                                onClick={() => setStatusFilter("PAID")}
                            >
                                Paid
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            {/* Tabs for transaction status */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="waiting_payment">Waiting Payment</TabsTrigger>
                    <TabsTrigger value="waiting_confirmation">Waiting Confirmation</TabsTrigger>
                    <TabsTrigger value="paid">Paid</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                    <TransactionTable 
                        transactions={filteredTransactions}
                        getStatusBadge={getStatusBadge}
                        getStatusIcon={getStatusIcon}
                        formatDate={formatDate}
                        openActionDialog={openActionDialog}
                        openReminderDialog={openReminderDialog}
                    />
                </TabsContent>
                
                <TabsContent value="waiting_payment" className="space-y-4">
                    <TransactionTable 
                        transactions={getTransactionsByStatus("WAITING_FOR_PAYMENT")}
                        getStatusBadge={getStatusBadge}
                        getStatusIcon={getStatusIcon}
                        formatDate={formatDate}
                        openActionDialog={openActionDialog}
                        openReminderDialog={openReminderDialog}
                    />
                </TabsContent>
                
                <TabsContent value="waiting_confirmation" className="space-y-4">
                    <TransactionTable 
                        transactions={getTransactionsByStatus("WAITING_FOR_CONFIRMATION")}
                        getStatusBadge={getStatusBadge}
                        getStatusIcon={getStatusIcon}
                        formatDate={formatDate}
                        openActionDialog={openActionDialog}
                        openReminderDialog={openReminderDialog}
                    />
                </TabsContent>
                
                <TabsContent value="paid" className="space-y-4">
                    <TransactionTable 
                        transactions={getTransactionsByStatus("PAID")}
                        getStatusBadge={getStatusBadge}
                        getStatusIcon={getStatusIcon}
                        formatDate={formatDate}
                        openActionDialog={openActionDialog}
                        openReminderDialog={openReminderDialog}
                    />
                </TabsContent>
                
                <TabsContent value="cancelled" className="space-y-4">
                    <TransactionTable 
                        transactions={getTransactionsByStatus("CANCELLED")}
                        getStatusBadge={getStatusBadge}
                        getStatusIcon={getStatusIcon}
                        formatDate={formatDate}
                        openActionDialog={openActionDialog}
                        openReminderDialog={openReminderDialog}
                    />
                </TabsContent>
            </Tabs>
            
            {/* Confirmation Dialog for ACCEPT/Reject */}
            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === "ACCEPT" ? "ACCEPT Payment" : "Reject Payment"}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === "ACCEPT"
                                ? "Are you sure you want to accept this payment? The system will automatically send a confirmation email to the user with room details and property information."
                                : "Are you sure you want to reject this payment? The order status will return to 'Waiting for Payment'."}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedTransaction && (
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium">Transaction ID:</span>
                                <span>{selectedTransaction.uuid}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Customer:</span>
                                <span>{selectedTransaction.username}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Property:</span>
                                <span>{selectedTransaction.room.property.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Room:</span>
                                <span>{selectedTransaction.room.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Amount:</span>
                                <span>
                                    {selectedTransaction.total.toLocaleString("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                    })}
                                </span>
                            </div>
                        </div>
                    )}
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleTransactionAction}
                            disabled={isActionLoading}
                            variant={actionType === "ACCEPT" ? "default" : "destructive"}
                        >
                            {isActionLoading ? "Processing..." : actionType === "ACCEPT" ? "ACCEPT" : "Reject"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Confirmation Dialog for Cancel */}
            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Order</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedTransaction && (
                        <div className="space-y-2">
                            <Alert>
                                <AlertDescription>
                                    You can only cancel orders where the payment proof has not been uploaded yet.
                                </AlertDescription>
                            </Alert>
                            
                            <div className="flex justify-between">
                                <span className="font-medium">Transaction ID:</span>
                                <span>{selectedTransaction.uuid}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Customer:</span>
                                <span>{selectedTransaction.username}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Property:</span>
                                <span>{selectedTransaction.room.property.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Room:</span>
                                <span>{selectedTransaction.room.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Amount:</span>
                                <span>
                                    {selectedTransaction.total.toLocaleString("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                    })}
                                </span>
                            </div>
                        </div>
                    )}
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                            No, Keep Order
                        </Button>
                        <Button
                            onClick={handleTransactionAction}
                            disabled={isActionLoading}
                            variant="destructive"
                        >
                            {isActionLoading ? "Processing..." : "Yes, Cancel Order"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Confirmation Dialog for Reminder */}
            <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send Reminder Email</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to send a reminder email to the customer? This will include booking details and property rules.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedTransaction && (
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium">Transaction ID:</span>
                                <span>{selectedTransaction.uuid}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Customer:</span>
                                <span>{selectedTransaction.username}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Property:</span>
                                <span>{selectedTransaction.room.property.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Check-in Date:</span>
                                <span>{formatDate(selectedTransaction.startDate)}</span>
                            </div>
                        </div>
                    )}
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReminderDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSendReminder}
                            disabled={isActionLoading}
                        >
                            {isActionLoading ? "Sending..." : "Send Reminder"}
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
    getStatusBadge: (status: TransactionStatus) => JSX.Element;
    getStatusIcon: (status: TransactionStatus) => JSX.Element;
    formatDate: (dateString: string) => string;
    openActionDialog: (transaction: Transaction, action: "ACCEPT" | "REJECT" | "CANCEL") => void;
    openReminderDialog: (transaction: Transaction) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
    transactions,
    getStatusBadge,
    getStatusIcon,
    formatDate,
    openActionDialog,
    openReminderDialog
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Transaction List</CardTitle>
            </CardHeader>
            <CardContent>
                {transactions.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">No transactions found</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Property</TableHead>
                                <TableHead>Room</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell className="font-medium">
                                        {transaction.uuid}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>
                                                    {transaction.username
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{transaction.username}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Building className="h-4 w-4 text-blue-500" />
                                            <span>{transaction.room.property.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {transaction.room.name}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div>{formatDate(transaction.startDate)}</div>
                                            <div className="text-muted-foreground">to {formatDate(transaction.endDate)}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {getStatusIcon(transaction.status)}
                                            {getStatusBadge(transaction.status)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {transaction.total.toLocaleString("id-ID", {
                                            style: "currency",
                                            currency: "IDR",
                                        })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                
                                                {transaction.status === "WAITING_FOR_CONFIRMATION" && (
                                                    <>
                                                        <DropdownMenuItem
                                                            onClick={() => openActionDialog(transaction, "ACCEPT")}
                                                            className="text-green-600"
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            ACCEPT Payment
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => openActionDialog(transaction, "REJECT")}
                                                            className="text-red-600"
                                                        >
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Reject Payment
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                
                                                {transaction.status === "WAITING_FOR_PAYMENT" && (
                                                    <DropdownMenuItem
                                                        onClick={() => openActionDialog(transaction, "CANCEL")}
                                                        className="text-red-600"
                                                    >
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Cancel Order
                                                    </DropdownMenuItem>
                                                )}
                                                
                                                {transaction.status === "PAID" && (
                                                    <>
                                                        <DropdownMenuItem
                                                            onClick={() => openReminderDialog(transaction)}
                                                        >
                                                            <Mail className="h-4 w-4 mr-2" />
                                                            Send Reminder
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Calendar className="h-4 w-4 mr-2" />
                                                            View Booking Details
                                                        </DropdownMenuItem>
                                                    </>
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
    );
};