import { Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  variant?: 'navbar' | 'standalone';
  scrolled?: boolean;
}

const ThemeToggle = ({ className, variant = 'navbar', scrolled = true }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const baseClasses =
    variant === 'navbar'
      ? cn(
          'inline-flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-stride-accent',
          scrolled
            ? 'bg-stride-bg hover:bg-stride-accent-soft text-stride-text-strong'
            : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm'
        )
      : 'inline-flex items-center justify-center w-10 h-10 rounded-full bg-stride-bg hover:bg-stride-accent-soft text-stride-text-strong transition-all';

  return (
    <button
      onClick={toggleTheme}
      className={cn(baseClasses, className)}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: 0.25 }}
          className="flex items-center justify-center"
        >
          {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;
