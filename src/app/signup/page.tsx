import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLogo } from '@/components/AuthLogo'
import { Auth } from '@/components/Auth'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <AuthLogo />
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>
            Sign up with your Google account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Auth />
        </CardContent>
      </Card>
    </div>
  )
}
