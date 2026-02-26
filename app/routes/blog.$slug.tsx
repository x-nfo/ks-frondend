import { Link, useLoaderData } from "react-router";
import { ArrowLeft } from "lucide-react";
import { blogPosts, type BlogPost } from "../data/blog-posts";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ params }: LoaderFunctionArgs) {
  const slug = params.slug;
  const entry = blogPosts.find((p) => p.slug === slug);

  if (!entry) {
    throw new Response("Not Found", { status: 404 });
  }

  return { slug };
}

export default function BlogPostDetail() {
  const { slug } = useLoaderData<typeof loader>();
  const entry = blogPosts.find((p) => p.slug === slug);

  if (!entry) return null; // Should be handled by loader 404

  return (
    <article className="min-h-screen pt-40 md:pt-52 pb-24 bg-white relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-karima-ink/40 hover:text-karima-brand transition-colors text-xs uppercase tracking-widest group mb-12"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />{" "}
          Back to Journal
        </Link>

        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center gap-4 text-xs uppercase tracking-widest text-karima-gold mb-6">
            <span>{entry.category}</span>
            <span className="w-px h-3 bg-karima-gold/50"></span>
            <span>{entry.readTime}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif text-karima-brand italic mb-8 leading-tight">
            {entry.title}
          </h1>
          <div className="flex items-center justify-center gap-2 text-xxs uppercase tracking-widest text-karima-ink/40">
            <span>{entry.date}</span>
            <span>•</span>
            <span>By {entry.author}</span>
          </div>
        </div>

        {/* Featured Image */}
        <div className="aspect-[21/9] overflow-hidden mb-16">
          <img
            src={entry.image}
            alt={entry.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="prose prose-lg prose-headings:font-serif prose-headings:text-karima-brand prose-p:font-light prose-p:text-karima-ink/80 prose-a:text-karima-gold max-w-none mx-auto">
          {entry.content}
        </div>
      </div>
    </article>
  );
}
