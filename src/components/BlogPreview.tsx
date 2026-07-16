import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SectionEyebrow from '@/components/SectionEyebrow';
import { Button } from '@/components/ui/button';
import BlogPostCard from '@/components/BlogPostCard';
import { ideasPage } from '@/data/stride';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSiteContent } from '@/hooks/useSiteContent';

const BlogPreview = () => {
  const { content } = useSiteContent();
  const recentPosts = [...content.posts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <section id="ideas" className="py-16 md:py-24 px-4 md:px-12 bg-stride-bg">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-14 gap-4 reveal-on-scroll">
          <div>
            <SectionEyebrow align="left">{ideasPage.eyebrow}</SectionEyebrow>
            <h2 className="mt-3 font-display text-3xl md:text-4xl lg:text-5xl text-stride-text-strong mb-3 tracking-tight">
              {ideasPage.title}
            </h2>
            <p className="text-stride-text-muted max-w-xl">{ideasPage.sub}</p>
          </div>
          <Link to="/blog">
            <Button
              variant="outline"
              className="group rounded-full border-stride-text-strong/30 text-stride-text-strong hover:bg-stride-text-strong hover:text-stride-bg hover:border-stride-text-strong transition-colors bg-transparent"
              onClick={() => window.scrollTo(0, 0)}
            >
              All ideas
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="relative">
          <ScrollArea className="w-full">
            <div className="flex gap-6 pb-4 md:hidden overflow-x-auto snap-x snap-mandatory pl-1">
              {recentPosts.map((post) => (
                <div key={post.slug} className="flex-none w-[85%] snap-center">
                  <BlogPostCard
                    title={post.title}
                    excerpt={post.excerpt}
                    imageUrl={post.image || '/placeholder.svg'}
                    date={post.displayDate}
                    slug={post.slug}
                    category={`${post.readingMinutes} min read`}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post, i) => (
              <div
                key={post.slug}
                className={`reveal-on-scroll scale-up delay-${i + 1}`}
              >
                <BlogPostCard
                  title={post.title}
                  excerpt={post.excerpt}
                  imageUrl={post.image || '/placeholder.svg'}
                  date={post.displayDate}
                  slug={post.slug}
                  category={`${post.readingMinutes} min read`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;
