'use client';

import { useState, useEffect } from 'react';
import { Star, User as UserIcon } from 'lucide-react';
import { Review } from '@/types/review';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';

interface ReviewSectionProps {
  propertyId: string;
}

export function ReviewSection({ propertyId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    if (!propertyId) return;
    fetchReviews();
  }, [propertyId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/reviews/property/${propertyId}`, {
        params: { take: 10, page: 1 },
      });
      const payload = res.data;
      const list: Review[] = payload?.data ?? payload?.reviews ?? [];
      setReviews(list);
      // Try to use backend-provided aggregates if any, otherwise compute
      const avg = payload?.averageRating ?? (list.length ? list.reduce((acc, r) => acc + (r.rating ?? 0), 0) / list.length : 0);
      const total = payload?.meta?.total ?? payload?.total ?? list.length;
      setAverageRating(Number(avg) || 0);
      setTotalReviews(Number(total) || list.length);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast.error(error?.response?.data?.message || 'Gagal memuat ulasan');
    } finally {
      setLoading(false);
    }
  };

  // Display-only: submission is handled from the Orders page after checkout

  if (loading) {
    return <div className="mt-8 text-center">Memuat ulasan...</div>;
  }

  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Ulasan</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="ml-1 font-semibold">{averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground ml-1">({totalReviews} ulasan)</span>
          </div>
        </div>
      </div>

      {/* Review submission is available from Orders page after checkout */}

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Belum ada ulasan untuk properti ini.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-6 last:border-0 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  {review.user.pictureProfile ? (
                    <img
                      src={review.user.pictureProfile}
                      alt={review.user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{review.user.name}</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`}
                            />
                          ))}
                        </div>
                        <span>•</span>
                        <time dateTime={review.createdAt}>
                          {format(new Date(review.createdAt), 'd MMMM yyyy', { locale: id })}
                        </time>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-foreground">{review.comment}</p>
                  
                  {/* Tenant Reply */}
                  {review.replies && review.replies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-muted">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="text-primary">{review.replies[0].tenant.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {format(new Date(review.replies[0].createdAt), 'd MMM yyyy', { locale: id })}
                        </span>
                      </div>
                      <p className="mt-1 text-foreground">{review.replies[0].comment}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
