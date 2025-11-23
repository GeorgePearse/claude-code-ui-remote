import { Chat } from "@/components/Chat";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-12 bg-gray-50 dark:bg-gray-900">
      <div className="z-10 w-full max-w-6xl items-center justify-between font-mono text-sm lg:flex flex-col gap-6">
        <h1 className="text-4xl font-bold mb-4 text-center w-full bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400 p-2">
          Claude Code x E2B Graph Generator
        </h1>
        <Chat />
      </div>
    </main>
  );
}
