import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <PageLayout showContact={false}>
      <div className="min-h-[70vh] flex items-center justify-center bg-stride-bg pt-24">
        <div className="text-center max-w-md px-4">
          <p className="text-stride-accent font-mono text-sm tracking-widest mb-4">404</p>
          <h1 className="font-display text-4xl md:text-5xl text-stride-text-strong mb-4 tracking-tight">
            That page doesn't exist
          </h1>
          <p className="text-stride-text-muted mb-8">
            The page you were looking for has moved, or never existed in the first place.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-stride-navy text-white rounded-lg hover:bg-stride-navy-dark transition-all"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to home
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFound;
