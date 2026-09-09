import { Counter } from '@/components/counter';

export default function Page() {
  return (
    <main className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Meoru Next</h1>
        <Counter />
      </div>
    </main>
  );
}
