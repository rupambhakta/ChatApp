import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
      <div className="text-center space-y-8">
        {/* Icon Display */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-2xl bg-gray-700 flex items-center
             justify-center animate-bounce shadow-lg"
            >
              <MessageSquare className="w-12 h-12 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-4xl font-bold text-gray-100">Welcome to NexTalk!</h2>
        <p className="text-xl text-gray-400">
          Select a conversation to start chatting
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
