// src/components/tenant/transaction-list.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { 
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Mail,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { Transaction, TransactionStatus } from '@/types/transaction';
import { updateTransaction, cancelTransaction, sendReminderEmail } from '@/lib/transaction-service';

interface TransactionListProps {
  transactionsData: any;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: TransactionStatus | "ALL";
  setStatusFilter: (status: TransactionStatus | "ALL") => void;
}

export function TransactionList({
  transactionsData,
  loading,
  error,
  refetch,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter
}: TransactionListProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"ACCEPT" | "REJECT" | "CANCEL">("ACCEPT");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
  
  // Open details dialog
  const openDetailsDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsDialogOpen(true);
  };

  // Filter transactions based on search term
  const filteredTransactions = transactionsData?.data?.filter((transaction: Transaction) => 
    searchTerm === "" ||
    transaction.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.uuid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.room.property?.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`p-4 rounded-md ${toastMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {toastMessage.message}
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
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
      
      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transaction List</CardTitle>
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
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
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction: Transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.uuid}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={transaction.user.pictureProfile || undefined} />
                          <AvatarFallback>
                            {transaction.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{transaction.user.name}</div>
                          <div className="text-sm text-muted-foreground">{transaction.user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.room.property?.title}</div>
                        <div className="text-sm text-muted-foreground">{transaction.room.name}</div>
                      </div>
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
                          <DropdownMenuItem onClick={() => openDetailsDialog(transaction)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          
                          {transaction.status === "WAITING_FOR_CONFIRMATION" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => openActionDialog(transaction, "ACCEPT")}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Accept Payment
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
      
      {/* Confirmation Dialog for ACCEPT/Reject */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "ACCEPT" ? "Accept Payment" : "Reject Payment"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "ACCEPT"
                ? "Are you sure you want to accept this payment? The system will automatically send a confirmation email to the user with booking details and property rules."
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
                <span>{selectedTransaction.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{selectedTransaction.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Property:</span>
                <span>{selectedTransaction.room.property?.title}</span>
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
              <div className="flex justify-between">
                <span className="font-medium">Dates:</span>
                <span>
                  {formatDate(selectedTransaction.startDate)} - {formatDate(selectedTransaction.endDate)}
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
              {isActionLoading ? "Processing..." : actionType === "ACCEPT" ? "Accept" : "Reject"}
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
                <AlertCircle className="h-4 w-4" />
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
                <span>{selectedTransaction.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{selectedTransaction.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Property:</span>
                <span>{selectedTransaction.room.property?.title}</span>
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
                <span>{selectedTransaction.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{selectedTransaction.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Check-in Date:</span>
                <span>{formatDate(selectedTransaction.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Property:</span>
                <span>{selectedTransaction.room.property?.title}</span>
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
      
      {/* Transaction Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Transaction ID</h3>
                  <p className="font-medium">{selectedTransaction.uuid}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(selectedTransaction.status)}
                    {getStatusBadge(selectedTransaction.status)}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Customer</h3>
                  <p className="font-medium">{selectedTransaction.user.name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
                  <p className="font-medium">{selectedTransaction.user.email}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Property</h3>
                  <p className="font-medium">{selectedTransaction.room.property?.title}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Room</h3>
                  <p className="font-medium">{selectedTransaction.room.name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Check-in</h3>
                  <p className="font-medium">{formatDate(selectedTransaction.startDate)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Check-out</h3>
                  <p className="font-medium">{formatDate(selectedTransaction.endDate)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Total Amount</h3>
                  <p className="font-medium">
                    {selectedTransaction.total.toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Payment Method</h3>
                  <p className="font-medium">{selectedTransaction.paymentMethod.replace('_', ' ')}</p>
                </div>
              </div>
              
              {selectedTransaction.paymentProof && (
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">Payment Proof</h3>
                  <div className="border rounded-md p-2 bg-gray-50">
                    <a 
                      href={selectedTransaction.paymentProof} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Payment Proof
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}