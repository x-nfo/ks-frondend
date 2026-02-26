import { Link } from "react-router";
import FaqList from "../components/FaqList";
import { ArrowLeft } from "lucide-react";

export default function Faq() {
  return (
    <div className="min-h-screen pt-40 md:pt-52 pb-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-karima-ink/40 hover:text-karima-brand transition-colors text-xs uppercase tracking-widest group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />{" "}
          Back to Home
        </Link>
      </div>
      <div className="container mx-auto max-w-3xl px-6">
        <div className="text-center mb-16">
          <span className="text-xxs text-karima-accent uppercase tracking-[0.3em] font-medium block mb-4">
            Support
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-karima-brand italic mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-karima-ink/60 font-light max-w-lg mx-auto leading-relaxed">
            Answers to common questions about our products, shipping, and care
            instructions.
          </p>
        </div>

        <FaqList />
      </div>
    </div>
  );
}
