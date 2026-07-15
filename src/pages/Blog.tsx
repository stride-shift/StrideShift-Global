import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import BlogPostCard from '@/components/BlogPostCard';
import { ideasPage } from '@/data/stride';
import { useSiteContent } from '@/hooks/useSiteContent';
import PageHeroBackground from '@/components/PageHeroBackground';
import SectionEyebrow from '@/components/SectionEyebrow';
import PageSections from '@/components/editor/PageSections';

const Blog = () => {
  const { content } = useSiteContent();
  const sorted = [...content.posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const featuredPost = sorted[0];
  const otherPosts = sorted.slice(1);

  return (
    <PageLayout>
      <SEO
        title="Ideas — Thinking out loud · StrideShift"
        description="Writing on AI, decisions, and the way organisations actually think — from the StrideShift team."
        imageUrl={featuredPost?.image}
      />

      <PageSections
        page="blog"
        sections={{
          hero: (
      <section className="relative pt-28 md:pt-36 pb-16 md:pb-20 text-white overflow-hidden">
        <PageHeroBackground />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <SectionEyebrow>{ideasPage.eyebrow}</SectionEyebrow>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl mb-5 tracking-tight"
          >
            {ideasPage.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-white/85 max-w-2xl mx-auto leading-relaxed"
          >
            {ideasPage.sub}
          </motion.p>
        </div>
      </section>

          ),
          posts: (
      <section className="py-16 md:py-20 bg-stride-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {featuredPost && (
            <Link to={`/blog/${featuredPost.slug}`} onClick={() => window.scrollTo(0, 0)}>
              <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-stride-border">
                <div className="grid md:grid-cols-2 h-full">
                  <div
                    className="bg-cover bg-center h-64 md:h-full p-8 flex items-end justify-start relative min-h-[260px]"
                    style={{ backgroundImage: `url('${featuredPost.image}')` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-stride-navy/90 via-stride-navy/40 to-transparent" />
                    <div className="relative text-white max-w-md">
                      <span className="px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-[10px] font-semibold uppercase tracking-wider inline-block mb-3">
                        Featured · {featuredPost.readingMinutes} min read
                      </span>
                      <h3 className="font-display text-2xl md:text-3xl leading-tight tracking-tight">
                        {featuredPost.title}
                      </h3>
                    </div>
                  </div>
                  <CardContent className="p-8 bg-stride-bg-elev flex flex-col justify-center">
                    <p className="text-stride-text-muted text-xs uppercase tracking-wider mb-3">
                      {featuredPost.displayDate}
                    </p>
                    <p className="text-stride-text-strong mb-6 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    <Button
                      variant="outline"
                      className="group w-fit border-stride-accent text-stride-accent hover:bg-stride-accent hover:text-white"
                    >
                      Read
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </div>
              </Card>
            </Link>
          )}

          {otherPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherPosts.map((post) => (
                <BlogPostCard
                  key={post.slug}
                  title={post.title}
                  excerpt={post.excerpt}
                  imageUrl={post.image || '/placeholder.svg'}
                  date={post.displayDate}
                  slug={post.slug}
                  category={`${post.readingMinutes} min read`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
          ),
        }}
      />
    </PageLayout>
  );
};

export default Blog;
