import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import FocusSection from '@/components/FocusSection';
import SoundFamiliar from '@/components/SoundFamiliar';
import Features from '@/components/Features';
import Projects from '@/components/Projects';
import Testimonials from '@/components/Testimonials';
import ClientsMarquee from '@/components/ClientsMarquee';
import BlogPreview from '@/components/BlogPreview';
import SEO from '@/components/SEO';
import PageSections from '@/components/editor/PageSections';
import { RevealOnScrollRoot } from '@/hooks/useScrollReveal';

const Index = () => {
  return (
    <PageLayout>
      <SEO
        title="StrideShift — From messy problem to clear action"
        description="StrideShift is an AI-powered think tank for teams facing complex, open-ended challenges. From messy problem to clear action — in days, not months."
        keywords={[
          'AI strategy',
          'AI advisory',
          'AI consulting',
          'decision intelligence',
          'AI reasoning',
          'AI for leadership',
        ]}
      />
      <RevealOnScrollRoot />
      <PageSections
        page="home"
        sections={{
          hero: <Hero />,
          focus: <FocusSection />,
          'sound-familiar': <SoundFamiliar />,
          capabilities: <Features />,
          solutions: <Projects />,
          testimonials: <Testimonials />,
          clients: <ClientsMarquee />,
          ideas: <BlogPreview />,
        }}
      />
    </PageLayout>
  );
};

export default Index;
