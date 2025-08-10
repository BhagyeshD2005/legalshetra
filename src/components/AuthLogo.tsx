import { Gavel } from 'lucide-react';

export function AuthLogo() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-primary">
      <div className="border-4 border-accent p-4 rounded-full bg-primary-foreground shadow-inner">
        <Gavel className="h-10 w-10 text-primary" />
      </div>
      <h1 className="text-3xl font-bold font-headline mt-4">
        LegalshetraAI
      </h1>
    </div>
  );
}
