import ChessBoard from "@/features/chess/components/ChessBoard";
import SocketTest from "@/features/chess/components/SocketTest";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-2xl">
        <h1 className="mb-6 text-center text-3xl font-bold text-white">
          Online Chess
        </h1>
        <SocketTest />
        <ChessBoard />
      </div>
    </main>
  );
}