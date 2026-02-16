import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
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
                    /> Back to Home
                </Link>
            </div>
            <div className="container mx-auto max-w-3xl px-6">
                <div className="text-center mb-16">
                    <span
                        className="text-xxs text-karima-accent uppercase tracking-[0.3em] font-medium block mb-4"
                    >Legal</span>
                    <h1
                        className="text-4xl md:text-5xl font-serif text-karima-brand italic mb-6"
                    >
                        Terms of Service
                    </h1>
                    <p
                        className="text-karima-ink/60 font-light text-sm uppercase tracking-widest"
                    >
                        Last updated: October 2025
                    </p>
                </div>

                <div className="prose prose-stone max-w-none text-karima-ink/70 font-light leading-relaxed">
                    <p>
                        By accessing this website we assume you accept these terms and conditions. Do not continue to use Karima if you do not agree to take all of the terms and conditions stated on this page.
                    </p>

                    <h3>1. Intellectual Property Rights</h3>
                    <p>
                        Other than the content you own, under these Terms, Karima and/or its licensors own all the intellectual property rights and materials contained in this Website. You are granted limited license only for purposes of viewing the material contained on this Website.
                    </p>

                    <h3>2. Restrictions</h3>
                    <p>
                        You are specifically restricted from all of the following:
                    </p>
                    <ul>
                        <li>Publishing any Website material in any other media;</li>
                        <li>Selling, sublicensing and/or otherwise commercializing any Website material;</li>
                        <li>Publicly performing and/or showing any Website material;</li>
                        <li>Using this Website in any way that is or may be damaging to this Website;</li>
                        <li>Using this Website in any way that impacts user access to this Website;</li>
                    </ul>

                    <h3>3. Your Content</h3>
                    <p>
                        In these Website Standard Terms and Conditions, "Your Content" shall mean any audio, video text, images or other material you choose to display on this Website. By displaying Your Content, you grant Karima a non-exclusive, worldwide irrevocable, sub licensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media.
                    </p>

                    <h3>4. No Warranties</h3>
                    <p>
                        This Website is provided "as is," with all faults, and Karima express no representations or warranties, of any kind related to this Website or the materials contained on this Website.
                    </p>

                    <h3>5. Limitation of Liability</h3>
                    <p>
                        In no event shall Karima, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract.  Karima, including its officers, directors and employees shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Website.
                    </p>

                    <h3>6. Governing Law & Jurisdiction</h3>
                    <p>
                        These Terms will be governed by and interpreted in accordance with the laws of the State of Indonesia, and you submit to the non-exclusive jurisdiction of the state and federal courts located in Indonesia for the resolution of any disputes.
                    </p>
                </div>
            </div>
        </div>
    );
}
