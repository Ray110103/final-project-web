// src/app/(user)/reviews/page.tsx
"use client";

import { useState, useEffect } from 'react';
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
  ThumbsUp,
  MapPin,
  Calendar,
  Clock,
  Send,
  AlertCircle
} from "lucide-react";
import { Review } from '@/types/review';
import { Property } from '@/types/property';
import { useGetReviews } from './_hooks/use-reviews';
import { createReview } from '@/lib/review-service';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const { data: reviewsData, loading: reviewsLoading, refetch } = useGetReviews();
  
  useEffect(() => {
    if (reviewsData?.data) {
      setReviews(reviewsData.data);
    }
  }, [reviewsData]);
  
  // Handle review submission
  const handleSubmitReview = async () => {
    if (!selectedProperty || !comment) {
      setToastMessage({ message: "Please complete all required fields", type: "error" });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const reviewData = {
        propertyId: selectedProperty.id,
        rating,
        comment
      };
      
      await createReview(reviewData);
      
      setToastMessage({ 
        message: "Review submitted successfully!", 
        type: "success" 
      });
      
      // Reset form
      setComment("");
      setRating(5);
      setIsCreateDialogOpen(false);
      
      // Refetch reviews
      refetch();
    } catch (error) {
      console.error("Error submitting review:", error);
      setToastMessage({ 
        message: "Failed to submit review. Please try again.", 
        type: "error" 
      });
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground">
          Share your experience and read reviews from other guests.
        </p>
      </div>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`p-4 rounded-md ${toastMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {toastMessage.message}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Reviews</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Write a Review
        </Button>
      </div>
      
      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No reviews yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't written any reviews yet.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Write Your First Review
            </Button>
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
              <label className="text-sm font-medium mb-2 block">Property</label>
              <div className="p-3 border rounded-md bg-gray-50">
                {selectedProperty ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium">{selectedProperty.title}</div>
                      <div className="text-sm text-muted-foreground">{selectedProperty.city}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2 text-muted-foreground">
                    Select a property to review
                  </div>
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
              disabled={isLoading || !comment}
            >
              {isLoading ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
