import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BlogPostCardProps {
  title: string;
  excerpt: string;
  imageUrl: string;
  date: string;
  slug: string;
  category: string;
}

const BlogPostCard = ({ title, excerpt, imageUrl, date, slug, category }: BlogPostCardProps) => {
  return (
    <Link to={`/blog/${slug}`} onClick={() => window.scrollTo(0, 0)}>
      <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full border border-stride-border bg-stride-bg-elev">
        <div className="grid grid-rows-[220px,1fr] h-full">
          <div
            className="bg-cover bg-center relative"
            style={{ backgroundImage: `url('${imageUrl}')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-stride-navy/70 via-stride-navy/20 to-transparent" />
            <div className="absolute bottom-3 left-3">
              <span className="px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-[10px] font-semibold uppercase tracking-wider text-stride-navy inline-block">
                {category}
              </span>
            </div>
          </div>
          <CardContent className="p-6 flex flex-col">
            <p className="text-stride-text-muted text-xs uppercase tracking-wider mb-2">{date}</p>
            <h3 className="font-display text-lg lg:text-xl text-stride-text-strong mb-3 line-clamp-3 leading-snug tracking-tight">
              {title}
            </h3>
            <p className="text-stride-text-muted text-sm mb-5 line-clamp-3 flex-grow leading-relaxed">
              {excerpt}
            </p>
            <Button
              variant="outline"
              className="group mt-auto border-stride-accent text-stride-accent hover:bg-stride-accent hover:text-white w-fit"
            >
              Read
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
};

export default BlogPostCard;
