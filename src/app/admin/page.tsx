import { MainLayout } from '@/components/MainLayout';
import { UserManagementTable } from '@/components/UserManagementTable';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// Define the User type according to your data structure
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  access: boolean;
  avatar: string; // This can be a URL or initials
};

async function getUsers() {
    try {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, orderBy('name'));
        const usersSnapshot = await getDocs(q);
        const usersList = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            // Construct the avatar from the first letter of the first and last name
            const nameParts = data.name.split(' ');
            const avatar = nameParts.length > 1 
              ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
              : nameParts.length === 1 ? `${nameParts[0][0]}`: 'U';
              
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
        console.error("Error fetching users: ", error);
        return [];
    }
}

export default async function AdminPage() {
  const users = await getUsers();

  return (
    <MainLayout>
      <UserManagementTable initialUsers={users} />
    </MainLayout>
  );
}
