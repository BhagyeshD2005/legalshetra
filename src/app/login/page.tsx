import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthLogo } from '@/components/AuthLogo';
import { Auth } from '@/components/Auth';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <AuthLogo />
          <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in with your Google account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Auth />
        </CardContent>
      </Card>
    </div>
  );
}
