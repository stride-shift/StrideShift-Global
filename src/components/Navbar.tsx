import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X, Shield, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { showcase } from '@/data/stride';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // In dark mode, treat nav as always "scrolled" so it uses elevated bg styling.
  const navIsScrolled = theme === 'dark' ? true : isScrolled;
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const goToContact = () => {
    if (location.pathname !== '/contact') navigate('/contact');
    else window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const linkClass = (active = false) =>
    cn(
      navigationMenuTriggerStyle(),
      navIsScrolled
        ? cn(
            'bg-transparent text-stride-text-strong hover:text-stride-accent hover:bg-stride-bg',
            active && 'text-stride-accent'
          )
        : 'text-white/90 hover:text-white bg-transparent hover:bg-white/10'
    );

  return (
    <motion.nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full',
        navIsScrolled
          ? 'bg-stride-bg-elev/90 backdrop-blur-md shadow-sm border-b border-stride-border/60'
          : 'bg-transparent'
      )}
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <Logo tone={navIsScrolled ? 'dark' : 'light'} />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/">
                    <NavigationMenuLink className={linkClass(location.pathname === '/')}>
                      Home
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/about">
                    <NavigationMenuLink className={linkClass(location.pathname === '/about')}>
                      About
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      navIsScrolled
                        ? 'text-stride-text-strong hover:text-stride-accent bg-transparent'
                        : 'text-white/90 hover:text-white bg-transparent hover:bg-white/10'
                    )}
                  >
                    Solutions
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-1 p-3 w-[520px] md:grid-cols-2 bg-stride-bg-elev">
                      <li className="md:col-span-2 mb-1">
                        <Link
                          to="/solutions"
                          className="block p-3 rounded-md bg-stride-navy text-white hover:bg-stride-navy-dark transition-colors"
                        >
                          <div className="font-medium">All 9 solutions →</div>
                          <p className="text-xs text-stride-accent-soft mt-1">
                            See the full lineup
                          </p>
                        </Link>
                      </li>
                      {showcase.items.map((item) => (
                        <li key={item.slug}>
                          <Link
                            to={`/solutions/${item.slug}`}
                            className="block p-2.5 space-y-0.5 rounded-md hover:bg-stride-bg transition-colors"
                          >
                            <div className="font-medium text-stride-text-strong text-sm">
                              {item.name}
                            </div>
                            <p className="text-[11px] text-stride-text-muted">{item.category}</p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/team">
                    <NavigationMenuLink className={linkClass(location.pathname === '/team')}>
                      Team
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/blog">
                    <NavigationMenuLink
                      className={linkClass(location.pathname.startsWith('/blog'))}
                    >
                      Ideas
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                {isAdmin && (
                  <NavigationMenuItem>
                    <Link to="/admin">
                      <NavigationMenuLink
                        className={cn(
                          linkClass(location.pathname.startsWith('/admin')),
                          'gap-1.5'
                        )}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        Admin
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center gap-2 ml-1">
              <ThemeToggle scrolled={navIsScrolled} />
              {!user && (
                <Link
                  to="/sign-in"
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    navIsScrolled
                      ? 'text-stride-text-strong hover:bg-stride-bg'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign in
                </Link>
              )}
              <button
                onClick={goToContact}
                className={cn(
                  'px-4 py-2 rounded-md transition-colors text-sm font-medium',
                  navIsScrolled
                    ? 'bg-stride-navy text-white hover:bg-stride-navy-dark'
                    : 'bg-white text-stride-navy hover:bg-stride-accent-soft'
                )}
              >
                Start a conversation
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle scrolled={navIsScrolled} />
            <button
              onClick={toggleMenu}
              className={cn('focus:outline-none p-2', navIsScrolled ? 'text-stride-text-strong' : 'text-white')}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={cn(
          'md:hidden transition-all duration-300 overflow-hidden w-full',
          isMenuOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div
          className={cn(
            'px-3 pt-2 pb-3 space-y-1 shadow-sm overflow-y-auto max-h-[420px] border-t border-stride-border/60',
            'bg-stride-bg-elev'
          )}
        >
          {[
            { to: '/', label: 'Home' },
            { to: '/about', label: 'About' },
            { to: '/solutions', label: 'Solutions' },
            { to: '/team', label: 'Team' },
            { to: '/blog', label: 'Ideas' },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block px-3 py-2 rounded-md text-sm text-stride-text-strong hover:bg-stride-bg"
              onClick={() => {
                setIsMenuOpen(false);
                window.scrollTo(0, 0);
              }}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="block px-3 py-2 rounded-md text-sm text-stride-text-strong hover:bg-stride-bg flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
          {!user && (
            <Link
              to="/sign-in"
              className="block px-3 py-2 rounded-md text-sm text-stride-text-strong hover:bg-stride-bg"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign in
            </Link>
          )}
          <button
            onClick={goToContact}
            className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-white bg-stride-navy hover:bg-stride-navy-dark"
          >
            Start a conversation
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
