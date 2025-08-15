import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLogo } from '@/components/AuthLogo'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <AuthLogo />
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>
            Authentication has been removed. You can now access the app directly.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-center text-sm text-muted-foreground">
            Please navigate to the research page.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
