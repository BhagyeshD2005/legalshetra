'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/research');
  }, [router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background relative">
      <p>Redirecting to the research tool...</p>
      <div className="fixed bottom-4 left-4">
        <ThemeToggle />
      </div>
    </div>
  );
}
