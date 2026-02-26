import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
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
            Legal
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-karima-brand italic mb-6">
            Privacy Policy
          </h1>
          <p className="text-karima-ink/60 font-light text-sm uppercase tracking-widest">
            Last updated: October 2025
          </p>
        </div>

        <div className="prose prose-stone max-w-none text-karima-ink/70 font-light leading-relaxed">
          <p>
            Your privacy is important to us. It is Karima's policy to respect
            your privacy regarding any information we may collect from you
            across our website, karimasyari.com, and other sites we own and
            operate.
          </p>

          <h3>1. Information We Collect</h3>
          <p>We may ask for personal information, such as your:</p>
          <ul>
            <li>Name</li>
            <li>Email</li>
            <li>Phone number</li>
            <li>Payment information</li>
          </ul>
          <p>
            This information is collected only when you voluntarily provide it
            to us, such as when you make a purchase, sign up for our newsletter,
            or contact our customer support.
          </p>

          <h3>2. How We Use Your Information</h3>
          <p>
            We use the information we collect in various ways, including to:
          </p>
          <ul>
            <li>Process and fulfill your orders</li>
            <li>Communications with you regarding inquiries or updates</li>
            <li>Improve, personalize, and expand our website</li>
            <li>Understand and analyze how you use our website</li>
            <li>
              Send you emails about new products, special offers, and other
              information
            </li>
          </ul>

          <h3>3. Security</h3>
          <p>
            We value your trust in providing us your Personal Information, thus
            we are striving to use commercially acceptable means of protecting
            it. But remember that no method of transmission over the internet,
            or method of electronic storage is 100% secure and reliable, and we
            cannot guarantee its absolute security.
          </p>

          <h3>4. Third-Party Services</h3>
          <p>
            We may employ third-party companies and individuals due to the
            following reasons:
          </p>
          <ul>
            <li>To facilitate our Service;</li>
            <li>To provide the Service on our behalf;</li>
            <li>To perform Service-related services; or</li>
            <li>To assist us in analyzing how our Service is used.</li>
          </ul>

          <h3>5. Changes to This Privacy Policy</h3>
          <p>
            We may update our Privacy Policy from time to time. Thus, we advise
            you to review this page periodically for any changes. We will notify
            you of any changes by posting the new Privacy Policy on this page.
            These changes are effective immediately, after they are posted on
            this page.
          </p>

          <h3>6. Contact Us</h3>
          <p>
            If you have any questions or suggestions about our Privacy Policy,
            do not hesitate to contact us at{" "}
            <a href="mailto:privacy@karima.com">privacy@karima.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
