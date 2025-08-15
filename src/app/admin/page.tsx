'use client';

import { useEffect, useState, useCallback } from 'react';
import { UserManagementTable } from '@/components/UserManagementTable';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
}

const LoadingSkeleton = () => (
    <Card>
        <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage user access to LegalshetraAI. Data is live from Firestore.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div className="flex items-center space-x-4 p-4 border-b" key={i}>
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/5" />
                            <Skeleton className="h-3 w-4/5" />
                        </div>
                        <div className="w-24">
                           <Skeleton className="h-6 w-full rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
        setLoading(true);
        setError(null);
        const userList = await getUsers();
        setUsers(userList);
    } catch (error) {
        console.error('Error fetching users: ', error);
        setError("Failed to load user data. Please try refreshing the page.");
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-destructive">{error}</p>
        </div>
    );
  }

  return (
    <UserManagementTable initialUsers={users} />
  );
}
