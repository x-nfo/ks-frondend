import React, { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';

type FormStatus = 'idle' | 'submitting' | 'success';

export default function ContactForm() {
    const [formStatus, setFormStatus] = useState<FormStatus>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('submitting');
        // Simulate sending
        setTimeout(() => {
            setFormStatus('success');
        }, 1500);
    };

    return (
        <div className="bg-white p-8 md:p-12 shadow-sm border border-karima-brand/5 self-start mt-8 lg:mt-24">
            {formStatus === 'success' ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center animate-fade-in">
                    <div className="w-16 h-16 bg-karima-gold/10 rounded-full flex items-center justify-center mb-6 text-karima-gold">
                        <Mail size={24} />
                    </div>
                    <h3 className="text-3xl font-serif italic text-karima-brand mb-4">Message Sent</h3>
                    <p className="text-karima-ink/60 font-light max-w-xs">
                        Thank you for reaching out. Our team will get back to you shortly along with a confirmation email.
                    </p>
                    <button
                        onClick={() => setFormStatus('idle')}
                        className="mt-8 text-xs uppercase tracking-widest text-karima-brand border-b border-karima-brand pb-1 hover:text-karima-gold hover:border-karima-gold transition-colors"
                    >
                        Send another message
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
                    <div>
                        <label htmlFor="name" className="block text-xs uppercase tracking-widest text-karima-ink/40 mb-3">Your Name</label>
                        <input
                            type="text"
                            id="name"
                            required
                            placeholder="Full Name"
                            className="w-full bg-transparent border-b border-karima-brand/20 py-3 text-karima-brand font-serif italic text-xl focus:outline-hidden focus:border-karima-brand transition-colors placeholder:text-karima-brand/10"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-xs uppercase tracking-widest text-karima-ink/40 mb-3">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            required
                            placeholder="email@example.com"
                            className="w-full bg-transparent border-b border-karima-brand/20 py-3 text-karima-brand font-serif italic text-xl focus:outline-hidden focus:border-karima-brand transition-colors placeholder:text-karima-brand/10"
                        />
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-xs uppercase tracking-widest text-karima-ink/40 mb-3">Subject</label>
                        <select
                            id="subject"
                            className="w-full bg-transparent border-b border-karima-brand/20 py-3 text-karima-brand font-serif text-lg focus:outline-hidden focus:border-karima-brand transition-colors"
                        >
                            <option value="general">General Inquiry</option>
                            <option value="order">Order Assistance</option>
                            <option value="wholesale">Wholesale</option>
                            <option value="press">Press & Media</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-xs uppercase tracking-widest text-karima-ink/40 mb-3">Message</label>
                        <textarea
                            id="message"
                            required
                            rows={4}
                            placeholder="How can we help you?"
                            className="w-full bg-transparent border-b border-karima-brand/20 py-3 text-karima-brand font-light resize-none focus:outline-hidden focus:border-karima-brand transition-colors placeholder:text-karima-brand/10"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={formStatus === 'submitting'}
                        className="w-full bg-karima-brand text-white py-4 px-8 uppercase tracking-[0.2em] text-xs hover:bg-karima-brand/90 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {formStatus === 'submitting' ? 'Sending...' : 'Send Message'}
                        {(!formStatus || formStatus === 'idle') && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>
            )}
        </div>
    );
}
