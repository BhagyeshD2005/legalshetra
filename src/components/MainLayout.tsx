'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'
import { Home, FileSearch, Menu } from 'lucide-react'

export function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/research', label: 'Research', icon: FileSearch },
    ];
    
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-16 flex-col border-r bg-card sm:flex">
                <nav className="flex flex-col items-center gap-4 px-2 py-4">
                    <Link href="/" className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base">
                        <FileSearch className="h-4 w-4 transition-all group-hover:scale-110" />
                        <span className="sr-only">IndiLaw AI Research</span>
                    </Link>
                    <TooltipProvider>
                        {navItems.map((item) => (
                            <Tooltip key={item.label}>
                                <TooltipTrigger asChild>
                                    <Link href={item.href} className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${pathname === item.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}>
                                        <item.icon className="h-5 w-5" />
                                        <span className="sr-only">{item.label}</span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right">{item.label}</TooltipContent>
                            </Tooltip>
                        ))}
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
                                    <Link href="/" className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base">
                                        <FileSearch className="h-5 w-5 transition-all group-hover:scale-110" />
                                        <span className="sr-only">IndiLaw AI Research</span>
                                    </Link>
                                    {navItems.map((item) => (
                                        <Link key={item.label} href={item.href} className={`flex items-center gap-4 px-2.5 ${pathname === item.href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                                            <item.icon className="h-5 w-5" />
                                            {item.label}
                                        </Link>
                                    ))}
                                </nav>
                            </SheetContent>
                        </Sheet>
                         <h1 className="font-headline text-xl font-bold text-primary">
                           IndiLaw AI Research
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                    </div>
                </header>
                <main className="flex-1 p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
