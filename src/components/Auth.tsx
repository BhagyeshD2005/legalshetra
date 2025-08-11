'use client';

import { useState } from 'react';
import { signInWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { auth, db, googleProvider } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 22c-2.29 0-4.42-.77-6.12-2.06"/><path d="M21.56 10.97c-.08-1.15-.43-2.24-1-3.24M2.44 10.97c.08-1.15.43-2.24 1-3.24m4.44-3.08a9.96 9.96 0 0 0-4.14 4.14M16.24 4.65a9.96 9.96 0 0 0 4.14 4.14"/><path d="M12 12.01c-1.37 0-2.5-1.12-2.5-2.5s1.13-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/><path d="M12.01 12c-2.49 0-4.5 2.01-4.5 4.5s0 4.5 0 4.5c2.49 0 4.5-2.01 4.5-4.5s0-4.5 0-4.5z"/><path d="M12 12.01c2.49 0 4.5 2.01 4.5 4.5s0 4.5 0 4.5-2.01-4.5-4.5-4.5z"/>
    </svg>
);

export function Auth() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const additionalUserInfo = getAdditionalUserInfo(result);
      
      if (additionalUserInfo?.isNewUser) {
        // If it's a new user, create a document in the 'users' collection
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
             await setDoc(userRef, {
                name: user.displayName,
                email: user.email,
                role: 'Lawyer', // Default role
                status: 'Active', // Default status
                access: true, // Default access
                createdAt: serverTimestamp(),
                photoURL: user.photoURL,
            });
        }
      }
      
      toast({ title: "Logged in successfully!" });
      router.push('/research');

    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.log("Sign-in popup closed by user.");
      } else {
        console.error(error);
        const errorMessage = error.message || 'An unexpected error occurred.';
        toast({
            variant: 'destructive',
            title: 'Authentication Failed',
            description: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4">
      <Button 
        onClick={handleGoogleSignIn} 
        className="w-full flex items-center gap-2" 
        disabled={loading}
        variant="outline"
      >
        {loading ? (
          <>
            Please wait...
          </>
        ) : (
          <>
            <GoogleIcon className="h-4 w-4" />
            Sign in with Google
          </>
        )}
      </Button>
    </div>
  );
}
