"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileImage,
  AlertCircle,
  Clock,
  CreditCard,
} from "lucide-react";
import { Transaction } from "@/types/transaction";

interface PaymentUploadProps {
  transaction: Transaction;
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
}

export function PaymentUpload({ transaction, onUpload, isUploading = false }: PaymentUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate time remaining (prefer expiredAt)
  const calculateTimeRemaining = () => {
    const expiryTime = transaction.expiredAt
      ? new Date(transaction.expiredAt)
      : new Date(new Date(transaction.createdAt).getTime() + 60 * 60 * 1000);
    const now = new Date();
    const diff = expiryTime.getTime() - now.getTime();

    if (diff <= 0) return { expired: true, time: "Expired" };
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return { expired: false, time: `${hours}h ${remainingMinutes}m` };
  };

  const timeRemaining = calculateTimeRemaining();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleFile = (file: File) => {
    const isValidType = file.type === 'image/jpeg' || file.type === 'image/png';
    const name = file.name.toLowerCase();
    const hasValidExt = name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png');
    if (!isValidType || !hasValidExt) {
      alert("Only .jpg or .png files are allowed");
      return;
    }
    if (file.size > 1024 * 1024) {
      alert("File size must be 1MB or less");
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (selectedFile) await onUpload(selectedFile);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Upload Bukti Pembayaran
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Transaction ID</span>
            <span className="font-mono text-sm">{transaction.uuid}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Total Amount</span>
            <span className="font-bold">{formatCurrency(transaction.total)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Time Remaining</span>
            <Badge variant={timeRemaining.expired ? "destructive" : "secondary"}>
              {timeRemaining.time}
            </Badge>
          </div>
        </div>

        {timeRemaining.expired ? (
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-800">Payment Expired</h4>
                <p className="text-sm text-red-700">
                  The payment time for this transaction has expired. Please create a new booking.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/jpeg,image/png"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <FileImage className="h-10 w-10 text-green-500 mb-2" />
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="font-medium">Drag & drop your payment proof</p>
                  <p className="text-sm text-gray-500 mb-2">or click to browse</p>
                  <p className="text-xs text-gray-500">Supported formats: JPEG, PNG (Max 1MB)</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Payment must be completed within 1 hour of booking</span>
            </div>

            <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full">
              {isUploading ? "Uploading..." : "Upload Payment Proof"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
