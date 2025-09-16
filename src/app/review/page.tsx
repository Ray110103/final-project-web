"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star,
  MessageSquare,
  MapPin,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { Review } from '@/types/review';
import { Transaction } from '@/types/transaction';
import { useGetUserReviews } from './_hooks/use-reviews';
import { useCreateReview } from './_hooks/use-create-review';
import { useCreateReply } from './_hooks/use-create-reply';
import { useUserTransactions } from './_hooks/use-user-transactions';

export default function ReviewsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [replyComment, setReplyComment] = useState("");
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Use hooks for data fetching and mutations
  const { data: reviewsData, loading: reviewsLoading, error: reviewsError, refetch } = useGetUserReviews();
  const { data: transactionsData, loading: transactionsLoading } = useUserTransactions();
  const { createReview, loading: createLoading, error: createError } = useCreateReview();
  const { createReply, loading: replyLoading, error: replyError } = useCreateReply();
  
  // Extract data from hooks
  const reviews = reviewsData?.data || [];
  const userTransactions = transactionsData || [];
  
  // Handle review submission
  const handleSubmitReview = async () => {
    if (!selectedTransaction || !comment) {
      setToastMessage({ message: "Please complete all required fields", type: "error" });
      return;
    }
    
    try {
      const reviewData = {
        transactionUuid: selectedTransaction.uuid,
        rating,
        comment
      };
      
      const result = await createReview(reviewData);
      
      setToastMessage({ 
        message: "Review submitted successfully!", 
        type: "success" 
      });
      
      // Reset form
      setComment("");
      setRating(5);
      setIsCreateDialogOpen(false);
      
      // Refetch reviews to update the list
      refetch();
    } catch (error) {
      setToastMessage({ 
        message: createError || "Failed to submit review. Please try again.", 
        type: "error" 
      });
    }
  };
  
  // Handle reply submission
  const handleSubmitReply = async () => {
    if (!selectedReview || !replyComment) {
      setToastMessage({ message: "Please enter your reply", type: "error" });
      return;
    }
    
    try {
      const replyData = {
        reviewId: selectedReview.id,
        comment: replyComment
      };
      
      await createReply(replyData);
      
      setToastMessage({ 
        message: "Reply submitted successfully!", 
        type: "success" 
      });
      
      // Reset form
      setReplyComment("");
      setIsReplyDialogOpen(false);
      
      // Refetch reviews to update the list
      refetch();
    } catch (error) {
      setToastMessage({ 
        message: replyError || "Failed to submit reply. Please try again.", 
        type: "error" 
      });
    }
  };
  
  // Open reply dialog
  const handleOpenReplyDialog = (review: Review) => {
    setSelectedReview(review);
    setReplyComment("");
    setIsReplyDialogOpen(true);
  };
  
  // Render star rating
  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300"
            } ${interactive ? "cursor-pointer" : ""}`}
            onClick={interactive ? () => setRating(star) : undefined}
          />
        ))}
      </div>
    );
  };
  
  // Get current user ID from session
  const getCurrentUserId = (): number => {
    // This would typically come from the session context
    // For now, we'll use localStorage as a fallback
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    return userId ? parseInt(userId, 10) : 0;
  };
  
  const currentUserId = getCurrentUserId();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Review (15 Point)</h1>
        <p className="text-muted-foreground">
          User bisa memberikan review ke properti yang telah dia sewa sebelumnya.
        </p>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">Review Information</h4>
            <p className="text-sm text-blue-700">
              Setelah tanggal check-out, user dapat memberikan review berupa komentar pada properti tersebut. 
              Review hanya bisa diberikan satu kali pada satu kali proses checkin-checkout.
              Tenant dapat membalas review yang telah disubmit oleh user.
            </p>
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`p-4 rounded-md ${toastMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {toastMessage.message}
        </div>
      )}
      
      {/* Error Messages */}
      {reviewsError && (
        <div className="p-4 rounded-md bg-red-50 text-red-800">
          Error loading reviews: {reviewsError}
        </div>
      )}
      
      {createError && (
        <div className="p-4 rounded-md bg-red-50 text-red-800">
          Error creating review: {createError}
        </div>
      )}
      
      {replyError && (
        <div className="p-4 rounded-md bg-red-50 text-red-800">
          Error creating reply: {replyError}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Reviews</h2>
        {!transactionsLoading && userTransactions.length > 0 && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Write a Review
          </Button>
        )}
      </div>
      
      {/* Loading States */}
      {reviewsLoading && (
        <div className="text-center py-8">Loading reviews...</div>
      )}
      
      {transactionsLoading && (
        <div className="text-center py-4">Loading transactions...</div>
      )}
      
      {/* Reviews List */}
      {!reviewsLoading && reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No reviews yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't written any reviews yet.
            </p>
            {!transactionsLoading && userTransactions.length > 0 && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Write Your First Review
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.user.pictureProfile || undefined} />
                      <AvatarFallback>
                        {review.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{review.user.name}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{review.property.title}</span>
                        <span>•</span>
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                    <span className="text-sm font-medium">{review.rating}.0</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{review.comment}</p>
                
                {review.replies && review.replies.length > 0 && (
                  <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200">
                    {review.replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{reply.tenant.name}</span>
                          <Badge variant="outline" className="text-xs">Property Owner</Badge>
                        </div>
                        <p className="text-sm text-gray-700">{reply.comment}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Reply button for property owners */}
                {review.property.tenantId === currentUserId && 
                 (!review.replies || review.replies.length === 0) && (
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenReplyDialog(review)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Reply to Review
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Create Review Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience with the property you stayed at.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Property</label>
              <div className="space-y-2">
                {userTransactions.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No eligible properties found for review.
                  </div>
                ) : (
                  userTransactions.map((transaction) => (
                    <div 
                      key={transaction.uuid}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedTransaction?.uuid === transaction.uuid 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">
                            {transaction.room?.property?.title || 'Property not available'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.room?.property?.city || 'Unknown city'} • 
                            {new Date(transaction.startDate).toLocaleDateString()} - {new Date(transaction.endDate).toLocaleDateString()}
                          </div>
                        </div>
                        {selectedTransaction?.uuid === transaction.uuid && (
                          <div className="text-blue-500">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <div className="flex items-center gap-2">
                {renderStars(rating, true)}
                <span className="text-sm font-medium">{rating}.0</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Your Review</label>
              <Textarea
                placeholder="Share your experience with this property..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Review Guidelines</h4>
                  <p className="text-sm text-blue-700">
                    Please be honest and respectful in your review. Your feedback helps other travelers make better decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReview}
              disabled={createLoading || !selectedTransaction || !comment}
            >
              {createLoading ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reply to Review Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
            <DialogDescription>
              Respond to the review left by a guest.
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedReview.user.pictureProfile || undefined} />
                    <AvatarFallback>
                      {selectedReview.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{selectedReview.user.name}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <span>{selectedReview.property.title}</span>
                      <span>•</span>
                      <span>{new Date(selectedReview.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(selectedReview.rating)}
                      <span className="text-sm font-medium">{selectedReview.rating}.0</span>
                    </div>
                    <p className="text-gray-700">{selectedReview.comment}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Your Reply</label>
                <Textarea
                  placeholder="Write your response to this review..."
                  value={replyComment}
                  onChange={(e) => setReplyComment(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReply}
              disabled={replyLoading || !replyComment}
            >
              {replyLoading ? "Submitting..." : "Submit Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}