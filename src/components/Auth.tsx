'use client';

import { useState } from 'react';
import { signInWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { auth, db, googleProvider } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
        className="w-full" 
        disabled={loading}
        variant="outline"
      >
        {loading ? (
          <>
            Please wait...
          </>
        ) : (
          <>
            Sign in with Google
          </>
        )}
      </Button>
    </div>
  );
}
