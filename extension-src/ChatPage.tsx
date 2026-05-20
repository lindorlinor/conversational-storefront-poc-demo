import { MessageThreadFull } from "@/components/tambo/message-thread-full";

export function ChatPage() {
  return (
    <div className="flex flex-col h-screen bg-white">
      <h1 className="px-5 py-3 border-b border-gray-200 font-semibold text-3xl">
        Chat
      </h1>
      <div className="flex-1 overflow-hidden">
        <MessageThreadFull />
      </div>
    </div>
  );
}
