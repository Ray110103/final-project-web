'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import axiosInstance from '@/lib/axios';

interface Props {
  propertyId: number;
  className?: string;
}

export function PropertyRating({ propertyId, className }: Props) {
  const [avg, setAvg] = useState<number | null>(null);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await axiosInstance.get(`/reviews/property/${propertyId}`, {
          params: { take: 1, page: 1 },
        });
        const payload = res.data;
        const average = Number(payload?.averageRating ?? 0);
        const total = Number(payload?.meta?.total ?? payload?.total ?? 0);
        if (mounted) {
          setAvg(average);
          setCount(total);
        }
      } catch (e) {
        if (mounted) {
          setAvg(0);
          setCount(0);
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [propertyId]);

  if (avg === null) return null;

  return (
    <div className={`inline-flex items-center text-sm text-muted-foreground ${className ?? ''}`}>
      <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
      <span className="font-medium text-foreground">{avg.toFixed(1)}</span>
      <span className="ml-1">({count} ulasan)</span>
    </div>
  );
}
