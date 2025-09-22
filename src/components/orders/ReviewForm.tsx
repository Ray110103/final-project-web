'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';

interface ReviewFormProps {
  propertyId: string;
  transactionId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ propertyId, transactionId, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast.error('Komentar tidak boleh kosong');
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.post('/reviews/create', {
        transactionUuid: transactionId,
        comment,
        rating,
      });
      toast.success('Ulasan berhasil dikirim');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      const msg = error?.response?.data?.message || (error instanceof Error ? error.message : 'Gagal mengirim ulasan');
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Beri Nilai</h3>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
              disabled={isSubmitting}
            >
              <Star
                className={`w-6 h-6 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Ulasan Anda</h3>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Bagaimana pengalaman menginap Anda?"
          className="min-h-[120px]"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
        </Button>
      </div>
    </div>
  );
}
