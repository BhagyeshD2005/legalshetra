'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const signupSchema = z.object({
  fullName: z.string().min(1, { message: 'Full name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type SignupFormValues = z.infer<typeof signupSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;
type FormValues = SignupFormValues | LoginFormValues;

interface AuthProps {
  mode: 'login' | 'signup';
}

export function Auth({ mode }: AuthProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const isSignup = mode === 'signup';
  const schema = isSignup ? signupSchema : loginSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    try {
      if (isSignup) {
        const { fullName, email, password } = data as SignupFormValues;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: fullName });

        // Create a new document in the 'users' collection
        await setDoc(doc(db, 'users', user.uid), {
          name: fullName,
          email: user.email,
          role: 'Lawyer', // Default role
          status: 'Active', // Default status
          access: true, // Default access
          createdAt: serverTimestamp(),
        });
        
        toast({ title: "Account created successfully!" });
        router.push('/');
      } else {
        const { email, password } = data as LoginFormValues;
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Logged in successfully!" });
        router.push('/');
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || 'An unexpected error occurred.';
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      {isSignup && (
        <div className="grid gap-2">
          <Label htmlFor="full-name">Full name</Label>
          <Input
            id="full-name"
            placeholder="Saul Goodman"
            {...register('fullName')}
            disabled={loading}
          />
          {errors.fullName && <p className="text-destructive text-sm">{errors.fullName.message}</p>}
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          {...register('email')}
          disabled={loading}
        />
        {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          disabled={loading}
        />
        {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
        {!isSignup && (
          <div className="flex items-center">
            <a href="#" className="ml-auto inline-block text-sm text-primary/80 hover:text-primary hover:underline">
              Forgot your password?
            </a>
          </div>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait...
            </>
          ) : (
            isSignup ? 'Create account' : 'Login'
        )}
      </Button>
    </form>
  );
}
