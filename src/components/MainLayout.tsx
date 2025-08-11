'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { ThemeToggle } from './ThemeToggle'
import { Home, PanelLeft, Settings, User, LogOut, FileSearch, ShieldCheck, Menu } from 'lucide-react'

const ADMIN_EMAIL = 'bhagyeshdedmuthe256@gmail.com';

export function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    const isAdmin = user?.email === ADMIN_EMAIL;

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const navItems = [
        { href: '/research', label: 'Research', icon: FileSearch, adminOnly: false },
        { href: '/admin', label: 'Admin Panel', icon: ShieldCheck, adminOnly: true },
    ];
    
    const getInitials = (name?: string | null) => {
        if (!name) return 'U';
        const nameParts = name.split(' ');
        if (nameParts.length > 1) {
          return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
        }
        return name[0].toUpperCase();
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-16 flex-col border-r bg-card sm:flex">
                <nav className="flex flex-col items-center gap-4 px-2 py-4">
                    <Link href="/research" className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base">
                        <Home className="h-4 w-4 transition-all group-hover:scale-110" />
                        <span className="sr-only">LegalshetraAI</span>
                    </Link>
                    <TooltipProvider>
                        {navItems.map((item) => (
                            (!item.adminOnly || isAdmin) && (
                                <Tooltip key={item.label}>
                                    <TooltipTrigger asChild>
                                        <Link href={item.href} className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${pathname === item.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}>
                                            <item.icon className="h-5 w-5" />
                                            <span className="sr-only">{item.label}</span>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">{item.label}</TooltipContent>
                                </Tooltip>
                            )
                        ))}
                    </TooltipProvider>
                </nav>
                <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={handleLogout} variant="ghost" size="icon" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                                    <LogOut className="h-5 w-5" />
                                    <span className="sr-only">Logout</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Logout</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </nav>
            </aside>
            <div className="flex flex-col sm:pl-16">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-card px-4 sm:px-6">
                    <div className="flex items-center gap-4">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button size="icon" variant="outline" className="sm:hidden">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="sm:max-w-xs">
                                <nav className="grid gap-6 text-lg font-medium">
                                    <Link href="/research" className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base">
                                        <Home className="h-5 w-5 transition-all group-hover:scale-110" />
                                        <span className="sr-only">LegalshetraAI</span>
                                    </Link>
                                    {navItems.map((item) => (
                                        (!item.adminOnly || isAdmin) && (
                                            <Link key={item.label} href={item.href} className={`flex items-center gap-4 px-2.5 ${pathname === item.href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                                                <item.icon className="h-5 w-5" />
                                                {item.label}
                                            </Link>
                                        )
                                    ))}
                                    <Button onClick={handleLogout} variant="ghost" className="mt-auto flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                                        <LogOut className="h-5 w-5" />
                                        Logout
                                    </Button>
                                </nav>
                            </SheetContent>
                        </Sheet>
                         <h1 className="font-headline text-xl font-bold text-primary">
                           {pathname === '/admin' ? 'Admin Panel' : 'LegalshetraAI'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.photoURL || undefined} data-ai-hint="person" />
                                        <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                                    </Avatar>
                                    <span className="sr-only">Toggle user menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{user?.displayName || 'My Account'}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <main className="flex-1 p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
