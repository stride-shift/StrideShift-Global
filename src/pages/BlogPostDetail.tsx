import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { useSiteContent } from '@/hooks/useSiteContent';

const BlogPostDetail = () => {
  const { slug } = useParams();
  const { content } = useSiteContent();
  // Normalise both sides — URLs arrive percent-encoded and stored slugs can
  // carry stray whitespace/case from admin edits, which made links open the
  // wrong post (the 404 fallback or a first-match collision).
  const wanted = slug ? decodeURIComponent(slug).trim().toLowerCase() : '';
  const post = wanted
    ? content.posts.find((p) => p.slug.trim().toLowerCase() === wanted)
    : undefined;

  if (!post) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="font-display text-4xl mb-4 text-stride-text-strong">Post not found</h1>
          <p className="text-stride-text-muted mb-8">
            The idea you're looking for doesn't exist yet.
          </p>
          <Link to="/blog">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Ideas
            </Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  // "Next idea" = the post after this one in newest-first order (wrapping),
  // not just the first non-current post.
  const sorted = [...content.posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const idx = sorted.findIndex((p) => p.slug === post.slug);
  const next = sorted.length > 1 ? sorted[(idx + 1) % sorted.length] : undefined;

  return (
    <PageLayout>
      <SEO
        title={`${post.title} · StrideShift`}
        description={post.excerpt}
        imageUrl={post.image}
        isBlogPost
        publishDate={new Date(post.date).toISOString()}
        type="article"
      />

      <article className="w-full pb-16">
        {/* Hero */}
        <div className="relative h-[420px] md:h-[520px] overflow-hidden bg-stride-navy">
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-stride-navy via-stride-navy/80 to-stride-navy/40" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
              <Link
                to="/blog"
                className="inline-flex items-center text-stride-accent-soft text-sm mb-4 hover:text-white transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Ideas
              </Link>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="font-display text-3xl md:text-4xl lg:text-5xl text-white tracking-tight mb-3"
              >
                {post.title}
              </motion.h1>
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span>{post.displayDate}</span>
                <span className="opacity-50">·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readingMinutes} min read
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16">
          <p className="text-xl md:text-2xl text-stride-text-strong font-display leading-relaxed mb-10 border-l-2 border-stride-accent pl-5">
            {post.excerpt}
          </p>

          <div className="prose prose-lg max-w-none">
            {post.body.map((block, i) => {
              if (block.type === 'h2') {
                return (
                  <h2
                    key={i}
                    className="font-display text-2xl md:text-3xl text-stride-text-strong mt-10 mb-4 tracking-tight"
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.type === 'h3') {
                return (
                  <h3
                    key={i}
                    className="font-display text-xl text-stride-text-strong mt-8 mb-3 tracking-tight"
                  >
                    {block.text}
                  </h3>
                );
              }
              if (block.type === 'quote') {
                return (
                  <blockquote
                    key={i}
                    className="my-8 border-l-4 border-stride-accent pl-6 italic font-display text-xl md:text-2xl text-stride-text-strong leading-snug"
                  >
                    "{block.text}"
                  </blockquote>
                );
              }
              return (
                <p
                  key={i}
                  className="text-base md:text-lg text-stride-text-muted leading-relaxed mb-5"
                >
                  {block.text}
                </p>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="bg-stride-navy rounded-2xl p-8 md:p-10 text-center text-white">
            <h3 className="font-display text-2xl md:text-3xl mb-3 tracking-tight">
              Want to talk through a problem like this?
            </h3>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              We listen first. Tell us what you're facing and we'll show you whether and how we can help.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center px-7 py-3 bg-white text-stride-navy rounded-lg hover:bg-stride-accent-soft transition-all group font-semibold"
            >
              Start a conversation
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Next post */}
        {next && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
            <Link
              to={`/blog/${next.slug}`}
              onClick={() => window.scrollTo(0, 0)}
              className="block bg-stride-bg-elev border border-stride-border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <span className="text-xs uppercase tracking-[0.22em] text-stride-text-muted font-semibold mb-2 block">
                Next idea
              </span>
              <h4 className="font-display text-xl text-stride-text-strong mb-1 tracking-tight">
                {next.title}
              </h4>
              <span className="text-stride-accent text-sm font-medium inline-flex items-center">
                Read
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </span>
            </Link>
          </div>
        )}
      </article>
    </PageLayout>
  );
};

export default BlogPostDetail;
