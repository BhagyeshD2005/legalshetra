
'use client';
import { motion, useInView } from 'framer-motion';
import { useRef, memo } from 'react';

interface FeatureCardProps { 
  title: string;
  description: string;
  delay: number;
  index: number;
  icon: React.ElementType;
}

const FeatureCardComponent = ({ title, description, delay, icon: Icon }: FeatureCardProps) => {
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

export const FeatureCard = memo(FeatureCardComponent);
