// components/PropertyCardSkeleton.tsx
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PropertyCardSkeletonProps {
  viewMode: 'grid' | 'list';
}

const PropertyCardSkeleton = ({ viewMode }: PropertyCardSkeletonProps) => {
  const cardClasses = viewMode === 'grid' 
    ? "overflow-hidden" 
    : "overflow-hidden flex flex-row";

  const imageClasses = viewMode === 'grid'
    ? "w-full h-48"
    : "w-80 h-48";

  return (
    <Card className={cardClasses}>
      <Skeleton className={imageClasses} />
      <div className="p-4 flex-1">
        <div className="flex justify-between items-start mb-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-3" />
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-14" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </Card>
  );
};

export default PropertyCardSkeleton;