import { Counter } from '@/components/counter';

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Meoru Next</h1>
        <Counter />
      </div>
    </div>
  );
}
