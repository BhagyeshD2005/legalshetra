'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Gavel, Scale, FileText, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthLogo } from '@/components/AuthLogo';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-border/20"
  >
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-headline font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </motion.div>
);

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/research');
    }
  }, [user, loading, router]);


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
             <Gavel className="h-6 w-6 text-primary" />
             <span className="font-bold font-headline text-lg">LegalshetraAI</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 sm:py-32">
          <div className="container text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <AuthLogo />
              <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                Revolutionizing legal research with the power of Artificial Intelligence. Get faster, more accurate insights into Indian case law.
              </p>
              <div className="mt-8">
                <Button size="lg" asChild className="shadow-lg">
                  <Link href="/signup">
                    Start Your Free Research <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-20 sm:py-32 bg-muted/40">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-headline font-bold sm:text-4xl">Why LegalshetraAI?</h2>
              <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                Our platform is meticulously designed to empower legal professionals with cutting-edge tools and unparalleled efficiency.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Bot size={24} />}
                title="AI-Powered Summaries"
                description="Instantly get concise, AI-generated summaries of complex legal documents and case laws, saving you hours of reading."
                delay={0.1}
              />
              <FeatureCard
                icon={<Scale size={24} />}
                title="Enhanced Query Understanding"
                description="Our AI understands legal jargon. It refines your queries to fetch the most relevant results from vast legal databases."
                delay={0.2}
              />
              <FeatureCard
                icon={<FileText size={24} />}
                title="Comprehensive Case Analysis"
                description="Go beyond summaries. Get detailed analysis, including cited cases, key legal principles, and judicial precedents."
                delay={0.3}
              />
                <FeatureCard
                icon={<Gavel size={24} />}
                title="Focused on Indian Law"
                description="Specialized models trained specifically on the Indian legal system and data from sources like IndianKanoon."
                delay={0.4}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-border/40 bg-background">
        <div className="container text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} LegalshetraAI. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
