'use client';

import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AuthLogo } from '@/components/AuthLogo';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Bot, FileText, Scale, Gavel } from 'lucide-react';
import { AutomatedDemo } from '@/components/AutomatedDemo';

const FeatureCard = ({ title, description, delay, index, icon: Icon }: { 
  title: string, 
  description: string, 
  delay: number,
  index: number,
  icon: React.ElementType
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, rotateX: -15 }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        rotateX: 0,
        transition: {
          duration: 0.8,
          delay: delay,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      } : {}}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className="bg-card p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-border/20 group cursor-pointer backdrop-blur-sm"
      style={{
        background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)/0.8) 100%)'
      }}
    >
      <motion.div 
        className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors duration-300"
        whileHover={{ rotate: 360, scale: 1.1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: delay + 0.3, duration: 0.4, type: "spring", stiffness: 200 }}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
      </motion.div>
      <motion.h3 
        className="text-xl font-headline font-semibold mb-2 group-hover:text-primary transition-colors duration-300"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: delay + 0.4 }}
      >
        {title}
      </motion.h3>
      <motion.p 
        className="text-muted-foreground group-hover:text-foreground transition-colors duration-300"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: delay + 0.5 }}
      >
        {description}
      </motion.p>
    </motion.div>
  );
};

const AnimatedBackground = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0.3, 0]);

  return (
    <motion.div
      style={{ y, opacity }}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-2xl" />
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute top-1/2 left-1/2 w-32 h-32 bg-primary/3 rounded-full blur-xl transform -translate-x-1/2 -translate-y-1/2"
      />
    </motion.div>
  );
};

export default function HomePage() {
  const router = useRouter();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });
  const isFeaturesInView = useInView(featuresRef, { once: true, amount: 0.2 });

  const headerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.6, 
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const heroVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const heroChildVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />
      
      <motion.header 
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container flex h-16 items-center justify-between">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
             <span className="font-bold font-headline text-lg">IndiLaw AI Research</span>
          </motion.div>
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ThemeToggle />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Link href="/research">
                  Get Started
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <main className="flex-1 relative z-10">
        <section className="py-20 sm:py-32 relative">
          <div className="container text-center">
            <motion.div
              ref={heroRef}
              variants={heroVariants}
              initial="hidden"
              animate={isHeroInView ? "visible" : "hidden"}
            >
              <motion.div variants={heroChildVariants}>
                <AuthLogo />
              </motion.div>
              
              <motion.p 
                variants={heroChildVariants}
                className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground"
              >
                Revolutionizing legal research with the power of Artificial Intelligence. Get faster, more accurate insights into Indian case law.
              </motion.p>
              
              <motion.div 
                variants={heroChildVariants}
                className="mt-8"
              >
                <motion.div
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button size="lg" asChild className="shadow-lg hover:shadow-2xl transition-all duration-500 group">
                    <Link href="/research" className="relative overflow-hidden">
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                      />
                      Start Your Free Research
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="py-20 sm:py-32 bg-background/50">
          <div className="container">
             <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.h2 
                className="text-3xl font-headline font-bold sm:text-4xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                See the AI in Action
              </motion.h2>
              <motion.p 
                className="mt-4 max-w-3xl mx-auto text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Explore the powerful modes of our AI Legal Assistant. The carousel below demonstrates real-world use cases, automatically rotating to show you the full scope of our platform's capabilities.
              </motion.p>
            </motion.div>
            <AutomatedDemo />
          </div>
        </section>

        <motion.section 
          className="py-20 sm:py-32 bg-muted/40 relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="container">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.h2 
                className="text-3xl font-headline font-bold sm:text-4xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                Why IndiLaw AI Research?
              </motion.h2>
              <motion.p 
                className="mt-4 max-w-2xl mx-auto text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Our platform is meticulously designed to empower legal professionals with cutting-edge tools and unparalleled efficiency.
              </motion.p>
            </motion.div>
            
            <motion.div 
              ref={featuresRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              initial={{ opacity: 0 }}
              animate={isFeaturesInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
            >
              <FeatureCard
                title="AI-Powered Summaries"
                description="Instantly get concise, AI-generated summaries of complex legal documents and case laws, saving you hours of reading."
                delay={0.1}
                index={0}
                icon={FileText}
              />
              <FeatureCard
                title="Enhanced Query Understanding"
                description="Our AI understands legal jargon. It refines your queries to fetch the most relevant results from vast legal databases."
                delay={0.2}
                index={1}
                icon={Bot}
              />
              <FeatureCard
                title="Comprehensive Case Analysis"
                description="Go beyond summaries. Get detailed analysis, including cited cases, key legal principles, and judicial precedents."
                delay={0.3}
                index={2}
                icon={Gavel}
              />
              <FeatureCard
                title="Focused on Indian Law"
                description="Specialized models trained specifically on the Indian legal system and data from sources like IndianKanoon."
                delay={0.4}
                index={3}
                icon={Scale}
              />
            </motion.div>
          </div>
        </motion.section>

        <motion.section 
          className="py-20 relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="container relative z-10">
            <motion.div
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <motion.h2 
                className="text-3xl font-headline font-bold sm:text-4xl mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                Ready to Transform Your Legal Research?
              </motion.h2>
              
              <motion.p 
                className="text-lg text-muted-foreground mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                Join thousands of legal professionals who trust IndiLaw AI Research for their research needs.
              </motion.p>
              
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button size="lg" asChild className="shadow-lg hover:shadow-xl transition-all duration-300">
                    <Link href="/research">Start Free Trial</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
          
          <motion.div
            className="absolute top-1/2 left-10 w-20 h-20 bg-primary/5 rounded-full blur-xl"
            animate={{ 
              y: [-20, 20, -20],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          <motion.div
            className="absolute top-1/4 right-10 w-16 h-16 bg-accent/10 rounded-full blur-lg"
            animate={{ 
              y: [20, -20, 20],
              x: [-10, 10, -10]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        </motion.section>
      </main>

      <motion.footer 
        className="py-8 border-t border-border/40 bg-background/95 backdrop-blur-sm relative z-10"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="container text-center text-muted-foreground text-sm">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            &copy; {new Date().getFullYear()} IndiLaw AI Research. All Rights Reserved.
          </motion.p>
        </div>
      </motion.footer>

      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
        style={{ scaleX: useScroll().scrollYProgress }}
      />
    </div>
  );
}
