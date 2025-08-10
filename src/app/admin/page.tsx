'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { MainLayout } from '@/components/MainLayout';
import { UserManagementTable } from '@/components/UserManagementTable';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

const ADMIN_EMAIL = 'bhagyeshdedmuthe256@gmail.com';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  access: boolean;
  avatar: string;
};

async function getUsers(): Promise<User[]> {
  try {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, orderBy('name'));
    const usersSnapshot = await getDocs(q);
    const usersList = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      const nameParts = data.name.split(' ');
      const avatar =
        nameParts.length > 1
          ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
          : nameParts.length === 1
          ? `${nameParts[0][0]}`
          : 'U';

      return {
        id: doc.id,
        name: data.name || '',
        email: data.email || '',
        role: data.role || 'N/A',
        status: data.status || 'Inactive',
        access: data.access || false,
        avatar: avatar.toUpperCase(),
      } as User;
    });
    return usersList;
  } catch (error) {
    console.error('Error fetching users: ', error);
    return [];
  }
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.email !== ADMIN_EMAIL) {
        // If user is not logged in or not an admin, wait a bit and then redirect
        setTimeout(() => router.push('/'), 1000);
      } else {
        setIsAuthorized(true);
        getUsers()
          .then(setUsers)
          .finally(() => setLoading(false));
      }
    }
  }, [user, authLoading, router]);

  if (authLoading || (!isAuthorized && !authLoading)) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-full">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <ShieldAlert className="w-16 h-16 mx-auto text-destructive" />
                </CardHeader>
                <CardContent className="text-center">
                    <h2 className="text-xl font-bold">Access Denied</h2>
                    <p className="text-muted-foreground">
                        You are not authorized to view this page. Redirecting...
                    </p>
                </CardContent>
            </Card>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
        <MainLayout>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div className="flex items-center space-x-4" key={i}>
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </MainLayout>
    );
  }

  return (
    <MainLayout>
      <UserManagementTable initialUsers={users} />
    </MainLayout>
  );
}
