import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router";

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "How do I find the right size?",
    answer:
      "We recommend referring to our Size Guide available on each product page. Our abayas are designed with a modest fit, so if you prefer a more tailored look, you might consider sizing down. For specific measurements, please contact our atelier.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship worldwide. Complimentary shipping is valid for orders above Rp 3.000.000. International delivery times vary between 3-7 business days depending on your location.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We accept returns within 14 days of delivery. Items must be unworn, unwashed, and in their original packaging with all tags attached. Please visit our Returns page to initiate a return request.",
  },
  {
    question: "Can I cancel or modify my order?",
    answer:
      "We process orders quickly to ensure fast delivery. If you need to make changes, please contact us within 1 hour of placing your order. After this window, we may not be able to modify the shipment.",
  },
  {
    question: "Where are your products made?",
    answer:
      "All KARIMA pieces are ethically crafted in our Jakarta atelier. We work with skilled artisans and source high-quality fabrics primarily from Indonesia and Turkey.",
  },
  {
    question: "How do I care for my silk abaya?",
    answer:
      "We recommend dry cleaning or gentle hand wash in cold water for all our silk pieces. Avoid wringing or twisting the fabric. Iron on low heat or steam to remove creases.",
  },
];

export default function FaqList() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div>
      <div className="mb-12 relative max-w-lg mx-auto">
        <input
          type="text"
          placeholder="Search for answers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-b border-karima-brand/20 py-3 text-karima-brand font-serif italic text-xl focus:outline-hidden focus:border-karima-brand transition-colors placeholder:text-karima-brand/30 text-center"
        />
      </div>

      <div className="space-y-4">
        {filteredFaqs.map((faq, idx) => (
          <div
            key={idx}
            className="border-b border-karima-brand/10 transition-colors hover:border-karima-brand/30"
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full text-left py-6 flex items-center justify-between group"
            >
              <span
                className={`font-serif italic text-lg text-karima-brand transition-colors ${openIndex === idx ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}
              >
                {faq.question}
              </span>
              <div
                className={`ml-4 text-karima-ink/40 transition-transform duration-500 ${openIndex === idx ? "rotate-180" : "rotate-0"}`}
              >
                <ChevronDown size={20} strokeWidth={1} />
              </div>
            </button>

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === idx ? "max-h-96 opacity-100 mb-8" : "max-h-0 opacity-0"}`}
            >
              <p className="text-karima-ink/70 font-light leading-loose text-sm pr-8">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12 opacity-50">
            <p className="font-serif italic text-karima-brand text-lg">
              No results found.
            </p>
          </div>
        )}
      </div>

      <div className="mt-24 text-center">
        <p className="text-karima-ink/50 text-xs uppercase tracking-widest mb-4">
          Still have questions?
        </p>
        <Link
          to="/contact"
          className="text-karima-brand font-serif italic text-xl border-b border-karima-brand/20 pb-1 hover:border-karima-brand transition-all hover:text-karima-gold"
        >
          Get in Touch
        </Link>
      </div>
    </div>
  );
}
