import { Users } from "lucide-react";

const SidebarSkeleton = () => {
  const skeletonContacts = Array(8).fill(null);

  return (
    <div className="flex-1 overflow-y-auto">
      {skeletonContacts.map((_, idx) => (
        <div 
          key={idx} 
          className="flex items-center gap-4 p-3 hover:bg-gray-800 transition-colors cursor-pointer border-b border-gray-800"
        >
          {/* Avatar skeleton */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gray-700 animate-pulse" />
          </div>

          {/* User info skeleton */}
          <div className="flex flex-col flex-1">
            <div className="h-4 w-32 bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-3 w-24 bg-gray-700/50 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SidebarSkeleton;
