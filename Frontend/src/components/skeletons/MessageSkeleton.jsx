const MessageSkeleton = () => {
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-8">
      {skeletonMessages.map((_, idx) => (
        <div
          key={idx}
          className={`flex ${idx % 2 === 0 ? "justify-start" : "justify-end"} mb-4`}
        >
          <div
            className={`flex ${
              idx % 2 === 0 ? "flex-row" : "flex-row-reverse"
            } items-end gap-2 max-w-[80%]`}
          >
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
            </div>
            <div
              className={`flex flex-col ${
                idx % 2 === 0 ? "items-start" : "items-end"
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className={`p-3 rounded-lg ${
                  idx % 2 === 0
                    ? "bg-gray-700/50 rounded-bl-none"
                    : "bg-gray-700/50 rounded-br-none"
                }`}>
                  <div className="h-4 w-[200px] bg-gray-600 rounded animate-pulse" />
                </div>
                <div className="h-3 w-16 bg-gray-700 rounded animate-pulse self-start mt-1" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
