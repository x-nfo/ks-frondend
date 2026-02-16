import React from 'react';

export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    author: string;
    readTime: string;
    image: string;
    excerpt: string;
    category: string;
    content: React.ReactNode;
}

export const blogPosts: BlogPost[] = [
    {
        slug: "art-of-layering",
        title: "The Art of Layering: Transitioning Through Seasons",
        date: "2025-10-12",
        author: "Sarah Jenkins, Fashion Editor",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1522219406764-db207f1f7640?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        excerpt: "How to maintain modesty and elegance as the temperature shifts, utilizing natural fabrics and strategic silhouettes.",
        category: "Style",
        content: (
            <>
                <p className="drop-cap first-letter:text-5xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:mt-[-10px] first-letter:text-karima-brand">
                    As the crisp autumn air begins to settle in, the challenge of maintaining both elegance and warmth becomes a daily consideration for the modest dresser. Layering is not merely a practical necessity; it is an art form that adds depth, texture, and dimension to your silhouette. At Karima, we believe that the changing seasons offer a renewed opportunity to experiment with fabrics that breathe and drape with sophistication.
                </p>

                <h3 className="text-2xl font-serif text-karima-brand italic mt-8 mb-4">Understanding Fabrics</h3>

                <p className="mb-4">
                    The foundation of any successful layered outfit lies in the choice of materials. Start with a lightweight base, such as our signature Medina Silk or a fine cotton blend. These breathable fabrics ensure comfort against the skin while providing a canvas for heavier textures.
                </p>

                <p className="mb-4">
                    For the mid-layer, consider structured pieces like a tailored vest or a lightweight open abaya. This adds visual interest without overwhelming the frame. Finally, your outer layer—be it a wool trench or a heavy crepe kimono—should act as the statement piece that ties the entire look together.
                </p>

                <blockquote className="border-l-2 border-karima-gold pl-6 py-2 my-8 text-xl font-serif italic text-karima-brand">
                    "Modesty in fashion is about the intentional concealment that reveals a woman’s dignity."
                </blockquote>

                <h3 className="text-2xl font-serif text-karima-brand italic mt-8 mb-4">The Palette of the Season</h3>

                <p className="mb-4">
                    While autumn often calls for deep, earthy tones—think burnt siennas, olive greens, and rich chocolates—don’t be afraid to introduce unexpected pops of color. A soft lilac scarf or a dusty rose inner dress can bring a surprising freshness to a look dominated by neutrals.
                </p>

                <p className="mb-4">
                    When curating your seasonal wardrobe, focus on versatility. Pieces that can be worn open or closed, belted or loose, offer the flexibility needed for fluctuating temperatures. Remember, the goal is not to hide the body under bulk, but to create a harmonious composition of lengths and textures that honors your personal style.
                </p>
            </>
        )
    }
];
