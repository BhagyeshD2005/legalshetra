'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/research');
  }, [router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <p>Redirecting to the research tool...</p>
    </div>
  );
}
