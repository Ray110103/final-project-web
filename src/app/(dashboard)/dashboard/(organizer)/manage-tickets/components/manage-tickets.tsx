"use client";
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
  Plus,
  MoreHorizontal,
  FileText,
  Check,
  X,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { toast } from "sonner";

interface PaymentProof {
  id: string;
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  amount: number;
  status: "Pending" | "Accepted" | "Rejected";
  proofImage: string;
  submittedAt: string;
}

//this is example generate with real data
const paymentProofs: PaymentProof[] = [
  {
    id: "4a851427-7437-4430-9b9d-b0c2cdda211c",
    user: {
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "/avatar.png",
    },
    amount: 100,
    status: "Pending",
    proofImage: "/payment-proof.jpg",
    submittedAt: "2 hours ago",
  },
  {
    id: "5b962427-7437-4430-9b9d-b0c2cdda211d",
    user: {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      avatar: "/avatar.png",
    },
    amount: 150,
    status: "Pending",
    proofImage: "/payment-proof.jpg",
    submittedAt: "1 day ago",
  },
  {
    id: "6c173527-7437-4430-9b9d-b0c2cdda211e",
    user: {
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      avatar: "/avatar.png",
    },
    amount: 200,
    status: "Accepted",
    proofImage: "/payment-proof.jpg",
    submittedAt: "1 week ago",
  },
];

export default function ManageTicketsPage() {
  const [proofs, setProofs] = useState<PaymentProof[]>(paymentProofs);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const handleStatusChange = async (id: string, type: "ACCEPT" | "REJECT") => {
    setIsLoading(prev => ({ ...prev, [id]: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setProofs(prev => prev.map(proof => 
        proof.id === id 
          ? { 
              ...proof, 
              status: type === "ACCEPT" ? "Accepted" : "Rejected" 
            } 
          : proof
      ));

      toast.success(
        type === "ACCEPT" 
          ? "Payment accepted successfully" 
          : "Payment rejected successfully"
      );
    } catch (error) {
      toast.error("Failed to update payment status");
    } finally {
      setIsLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const viewProof = (imageUrl: string) => {
    window.open(imageUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payment Proofs</h2>
          <p className="text-muted-foreground">
            Manage user payment submissions.
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input placeholder="Search payments..." className="pl-8" />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Proofs Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Payment Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proofs.map((proof) => (
                <TableRow key={proof.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={proof.user.avatar} alt={proof.user.name} />
                        <AvatarFallback>
                          {proof.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{proof.user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {proof.user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>${proof.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        proof.status === "Accepted"
                          ? "default"
                          : proof.status === "Rejected"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {proof.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {proof.submittedAt}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="flex items-center gap-2"
                          onClick={() => viewProof(proof.proofImage)}
                        >
                          <FileText className="h-4 w-4" />
                          View Proof
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center gap-2 text-green-600"
                          onClick={() => handleStatusChange(proof.id, "ACCEPT")}
                          disabled={proof.status !== "Pending" || isLoading[proof.id]}
                        >
                          <Check className="h-4 w-4" />
                          Accept
                          {isLoading[proof.id] && "..."}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center gap-2 text-red-600"
                          onClick={() => handleStatusChange(proof.id, "REJECT")}
                          disabled={proof.status !== "Pending" || isLoading[proof.id]}
                        >
                          <X className="h-4 w-4" />
                          Reject
                          {isLoading[proof.id] && "..."}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}