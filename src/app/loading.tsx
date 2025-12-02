import { SkeletonCard } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-10 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse" />
        <div className="h-6 bg-gray-200 rounded-lg w-96 mx-auto animate-pulse" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
