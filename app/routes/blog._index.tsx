import { Link, useLoaderData } from "react-router";
import { ArrowLeft, Clock, ArrowUpRight } from "lucide-react";
import { blogPosts, type BlogPost } from "../data/blog-posts";

export async function loader() {
    // Exclude 'content' to make data serializable
    const articles = blogPosts.map(({ content, ...rest }) => rest).sort(
        (a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf()
    );
    return { articles };
}

export default function BlogIndex() {
    const { articles } = useLoaderData<typeof loader>();
    const featured = articles[0];
    const remainingArticles = articles.slice(1);

    return (
        <div className="min-h-screen pt-40 md:pt-52 pb-24 bg-white relative">
            {/* Back Link */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-karima-ink/40 hover:text-karima-brand transition-colors text-xs uppercase tracking-widest group mb-12"
                >
                    <ArrowLeft
                        size={16}
                        className="group-hover:-translate-x-1 transition-transform"
                    /> Back to Home
                </Link>

                {/* Hero Text */}
                <div className="text-center mb-24 md:mb-32">
                    <span
                        className="text-[10px] text-karima-accent uppercase tracking-[0.3em] font-medium block mb-6"
                    >The Edit</span>
                    <h1
                        className="text-5xl md:text-7xl lg:text-8xl font-serif text-karima-brand italic mb-8 leading-tight"
                    >
                        Lifestyle <span
                            className="font-light not-italic text-karima-ink/80"
                        >& Leisure.</span>
                    </h1>
                    <div className="w-24 h-[1px] bg-karima-brand/10 mx-auto mb-8"></div>
                    <p
                        className="text-karima-ink/70 font-light text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
                    >
                        Curated musings on fashion, faith, and the art of living
                        well.
                    </p>
                </div>

                {/* Featured Article */}
                {featured && (
                    <Link
                        to={`/blog/${featured.slug}`}
                        className="mb-32 group cursor-pointer block"
                    >
                        <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden mb-8">
                            <img
                                src={featured.image}
                                alt="Featured Article"
                                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700"></div>
                        </div>
                        <div className="max-w-4xl">
                            <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-karima-gold mb-4">
                                <span>Featured</span>
                                <span className="w-px h-3 bg-karima-gold/50" />
                                <span>{featured.category}</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-serif text-karima-brand italic mb-4 group-hover:underline decoration-1 underline-offset-8">
                                {featured.title}
                            </h2>
                            <p className="text-karima-ink/70 font-light leading-relaxed max-w-2xl mb-6">
                                {featured.excerpt}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-karima-ink/40">
                                <span>{featured.date}</span>
                                <span>•</span>
                                <span>{featured.readTime}</span>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Articles Grid */}
                {remainingArticles.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-20">
                        {remainingArticles.map((article) => (
                            <Link
                                key={article.slug}
                                to={`/blog/${article.slug}`}
                                className="group cursor-pointer flex flex-col h-full"
                            >
                                <div className="aspect-[4/3] overflow-hidden mb-8 relative">
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1">
                                        <ArrowUpRight
                                            size={16}
                                            className="text-karima-brand"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <span className="text-xs uppercase tracking-widest text-karima-gold mb-3 block">
                                        {article.category}
                                    </span>
                                    <h3 className="text-2xl md:text-3xl font-serif text-karima-brand mb-4 leading-tight group-hover:text-karima-gold transition-colors">
                                        {article.title}
                                    </h3>
                                    <p className="text-karima-ink/60 font-light text-sm leading-relaxed mb-6 flex-1">
                                        {article.excerpt}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-karima-ink/30 mt-auto">
                                        <span>{article.date}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={10} />{" "}
                                            {article.readTime}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Load More */}
                <div className="mt-24 text-center">
                    <button
                        className="border border-karima-brand/20 text-karima-brand px-12 py-4 text-xs uppercase tracking-[0.2em] hover:bg-karima-brand hover:text-white transition-all duration-300"
                    >
                        View Archives
                    </button>
                </div>
            </div>
        </div>
    );
}
