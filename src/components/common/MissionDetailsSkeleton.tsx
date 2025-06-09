
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const MissionDetailsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-44" />
        </div>
      </Card>

      {/* Provider Info */}
      <Card className="p-4">
        <Skeleton className="h-5 w-40 mb-3" />
        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
          <div className="flex gap-4">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </Card>

      {/* Financial Summary */}
      <Card className="p-4">
        <Skeleton className="h-5 w-32 mb-3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <Skeleton className="h-3 w-32 mb-2" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <Skeleton className="h-3 w-36 mb-2" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex space-x-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
};
