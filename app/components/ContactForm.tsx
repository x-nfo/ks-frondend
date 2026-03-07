import React, { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { useFetcher } from "react-router";

type FormStatus = "idle" | "submitting" | "success";

export default function ContactForm() {
  const fetcher = useFetcher();
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus("submitting");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    // Send the data to the server for Brevo Email Backup
    fetcher.submit(formData, { method: "post" });

    // Ganti dengan nomor WhatsApp tujuan Anda (gunakan format kode negara, misal 62)
    const phoneNumber = "6287885611594";

    const waText = `Halo Karima,\n\nSaya ingin bertanya mengenai:\n*Nama:* ${name}\n*Email:* ${email}\n*Subjek:* ${subject}\n\n*Pesan:*\n${message}`;
    const encodedText = encodeURIComponent(waText);
    const waUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`;

    // Membuka tab WhatsApp
    window.open(waUrl, "_blank");

    setFormStatus("success");
  };

  return (
    <div className="bg-white p-8 md:p-12 shadow-sm border border-karima-brand/5 self-start mt-8 lg:mt-24">
      {formStatus === "success" ? (
        <div className="h-full min-h-100 flex flex-col items-center justify-center text-center animate-fade-in">
          <div className="w-16 h-16 bg-karima-gold/10 rounded-full flex items-center justify-center mb-6 text-karima-gold">
            <Mail size={24} />
          </div>
          <h3 className="text-3xl font-serif italic text-karima-brand mb-4">
            Message Sent
          </h3>
          <p className="text-karima-ink/60 font-light max-w-xs">
            Thank you for reaching out. Our team will get back to you shortly
            along with a confirmation email.
          </p>
          <button
            onClick={() => setFormStatus("idle")}
            className="mt-8 text-xs uppercase tracking-widest text-karima-brand border-b border-karima-brand pb-1 hover:text-karima-gold hover:border-karima-gold transition-colors"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
          <div>
            <label
              htmlFor="name"
              className="block text-xs uppercase tracking-widest text-karima-ink/40 mb-3"
            >
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="Full Name"
              className="w-full bg-transparent border-b border-karima-brand/20 py-3 text-karima-brand font-serif italic text-xl focus:outline-hidden focus:border-karima-brand transition-colors placeholder:text-karima-brand/10"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-xs uppercase tracking-widest text-karima-ink/40 mb-3"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="email@example.com"
              className="w-full bg-transparent border-b border-karima-brand/20 py-3 text-karima-brand font-serif italic text-xl focus:outline-hidden focus:border-karima-brand transition-colors placeholder:text-karima-brand/10"
            />
          </div>
          <div>
            <label
              htmlFor="subject"
              className="block text-xs uppercase tracking-widest text-karima-ink/40 mb-3"
            >
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              className="w-full bg-transparent border-b border-karima-brand/20 py-3 text-karima-brand font-serif text-lg focus:outline-hidden focus:border-karima-brand transition-colors"
            >
              <option value="General Inquiry">General Inquiry</option>
              <option value="Order Assistance">Order Assistance</option>
              <option value="Wholesale">Wholesale</option>
              <option value="Press & Media">Press & Media</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="message"
              className="block text-xs uppercase tracking-widest text-karima-ink/40 mb-3"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              placeholder="How can we help you?"
              className="w-full bg-transparent border-b border-karima-brand/20 py-3 text-karima-brand font-light resize-none focus:outline-hidden focus:border-karima-brand transition-colors placeholder:text-karima-brand/10"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={formStatus === "submitting"}
            className="w-full bg-karima-brand text-white py-4 px-8 uppercase tracking-[0.2em] text-xs hover:bg-karima-brand/90 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {formStatus === "submitting" ? "Sending..." : "Send Message"}
            {(!formStatus || formStatus === "idle") && (
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            )}
          </button>
        </form>
      )}
    </div>
  );
}
