import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#070B13] text-white p-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-6xl font-black font-mono text-[#00C8FF]">404</h1>
        <h2 className="text-xl font-bold">Página não encontrada</h2>
        <p className="text-sm text-gray-400">
          A página ou recurso que você está procurando não existe ou foi movido para um cofre seguro.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00C8FF] text-black font-bold text-xs hover:bg-[#00B0E0] transition"
        >
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}
