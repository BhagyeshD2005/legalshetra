'use client';
import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  access: boolean;
  avatar: string;
};

interface UserManagementTableProps {
  initialUsers: User[];
}

export function UserManagementTable({ initialUsers }: UserManagementTableProps) {
  const [users, setUsers] = React.useState(initialUsers);
  const { toast } = useToast();

  React.useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleAccessChange = async (userId: string, newAccess: boolean) => {
    const originalUsers = users;
    // Optimistically update the UI
    const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, access: newAccess } : user
      );
    setUsers(updatedUsers);

    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            access: newAccess
        });
        
        const updatedUser = users.find(user => user.id === userId);
        if(updatedUser){
            toast({
                title: `Access ${newAccess ? 'granted' : 'revoked'}`,
                description: `${updatedUser.name}'s access has been updated.`,
            })
        }
    } catch (error) {
        console.error("Error updating user access: ", error);
        // Revert the UI change if the update fails
        setUsers(originalUsers);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update the user's access. Please try again.",
        })
    }
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">User Management</CardTitle>
        <CardDescription>Manage user access to IndiLaw AI Research. Data is live from Firestore.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="hidden md:table-cell">Role</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead>Product Access</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="person" alt={user.name} />
                      <AvatarFallback>{user.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{user.role}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant={user.status === 'Active' ? 'secondary' : 'outline'}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <Switch
                            id={`access-switch-${user.id}`}
                            checked={user.access}
                            onCheckedChange={(checked) => handleAccessChange(user.id, checked)}
                            aria-label={`Access for ${user.name}`}
                        />
                        <Label htmlFor={`access-switch-${user.id}`} className="hidden md:block">{user.access ? 'Allowed' : 'Restricted'}</Label>
                    </div>
                </TableCell>
                <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Edit User</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">Delete User</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
