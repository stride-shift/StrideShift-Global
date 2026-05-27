import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X, Shield, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Always treat nav as "scrolled" so it has a visible backdrop on every page.
  // Without this, the nav is transparent at the top of long pages and looks
  // like it's disappeared into the hero.
  void isScrolled;
  void theme;
  const navIsScrolled = true;
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
                  <Link to="/solutions">
                    <NavigationMenuLink className={linkClass(location.pathname.startsWith('/solutions'))}>
                      Solutions
                    </NavigationMenuLink>
                  </Link>
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

                <NavigationMenuItem>
                  <Link to="/contact">
                    <NavigationMenuLink
                      className={linkClass(location.pathname === '/contact')}
                    >
                      Contact
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
            { to: '/contact', label: 'Contact' },
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
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
