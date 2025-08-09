import { MainLayout } from '@/components/MainLayout';
import { UserManagementTable } from '@/components/UserManagementTable';

export default function AdminPage() {
  const users = [
    { id: '1', name: 'Ananya Sharma', email: 'ananya.sharma@lawfirm.com', role: 'Senior Advocate', status: 'Active', access: true, avatar: 'AS' },
    { id: '2', name: 'Vikram Singh', email: 'vikram.singh@legal.co.in', role: 'Associate', status: 'Active', access: true, avatar: 'VS' },
    { id: '3', name: 'Priya Patel', email: 'priya.p@corporatecounsels.com', role: 'Paralegal', status: 'Inactive', access: false, avatar: 'PP' },
    { id: '4', name: 'Rohan Mehta', email: 'rohan.mehta@justice.org', role: 'Junior Advocate', status: 'Active', access: true, avatar: 'RM' },
    { id: '5', name: 'Sneha Gupta', email: 's.gupta@guptalegal.net', role: 'Legal Intern', status: 'Active', access: false, avatar: 'SG' },
  ];

  return (
    <MainLayout>
      <UserManagementTable initialUsers={users} />
    </MainLayout>
  );
}
