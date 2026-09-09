import { Counter } from '@/components/counter';

export default function App() {
  return (
    <main className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Meoru React</h1>
        <Counter />
      </div>
    </main>
  );
}
