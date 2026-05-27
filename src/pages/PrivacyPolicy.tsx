import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';

const PrivacyPolicy = () => {
  return (
    <PageLayout showContact={false}>
      <SEO title="Privacy Policy · StrideShift" description="How StrideShift handles your data." />
      <section className="pt-28 md:pt-36 pb-16 px-4 sm:px-6 lg:px-8 bg-stride-bg min-h-screen">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center text-stride-text-muted hover:text-stride-text-strong mb-6 transition-colors text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>

          <h1 className="font-display text-4xl md:text-5xl text-stride-text-strong mb-8 tracking-tight">
            Privacy Policy
          </h1>

          <div className="prose prose-lg max-w-none text-stride-text-muted">
            <p className="text-sm text-stride-text-muted/70 mb-6">Last updated: May 21, 2026</p>

            <h2 className="font-display text-2xl text-stride-text-strong mt-8 mb-3 tracking-tight">
              1. Who we are
            </h2>
            <p className="leading-relaxed">
              StrideShift Global ("we", "us", "our") is an AI-powered think tank for leadership
              teams. This policy explains what data we collect, how we use it, and the choices you
              have.
            </p>

            <h2 className="font-display text-2xl text-stride-text-strong mt-8 mb-3 tracking-tight">
              2. What we collect
            </h2>
            <p className="leading-relaxed">
              We collect only what you give us via the contact form (name, email, company, message)
              and standard server access logs (IP, browser, timestamps). We do not sell personal
              data.
            </p>

            <h2 className="font-display text-2xl text-stride-text-strong mt-8 mb-3 tracking-tight">
              3. How we use it
            </h2>
            <p className="leading-relaxed">
              To respond to your enquiry, send the dispatch (if you opted in), and improve the site.
              Newsletter consent can be withdrawn at any time by replying to any newsletter email.
            </p>

            <h2 className="font-display text-2xl text-stride-text-strong mt-8 mb-3 tracking-tight">
              4. Your rights
            </h2>
            <p className="leading-relaxed">
              You can ask us what we hold on you, correct it, or delete it. Email{' '}
              <a href="mailto:hello@strideshift.ai" className="text-stride-accent underline">
                hello@strideshift.ai
              </a>{' '}
              and we'll respond within 30 days.
            </p>

            <h2 className="font-display text-2xl text-stride-text-strong mt-8 mb-3 tracking-tight">
              5. Contact
            </h2>
            <p className="leading-relaxed">
              Questions about this policy? Reach us at{' '}
              <a href="mailto:hello@strideshift.ai" className="text-stride-accent underline">
                hello@strideshift.ai
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default PrivacyPolicy;
