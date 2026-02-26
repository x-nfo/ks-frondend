import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export default function Shipping() {
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
            Information
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-karima-brand italic mb-6">
            Shipping & Delivery
          </h1>
        </div>

        <div className="prose prose-stone max-w-none text-karima-ink/70 font-light leading-loose">
          <p className="mb-12 text-lg text-center">
            We are pleased to offer complimentary standard shipping on all
            domestic orders over Rp 3.000.000.
          </p>

          <div className="space-y-12">
            <section>
              <h3 className="font-serif text-2xl text-karima-brand italic mb-4">
                Domestic Shipping
              </h3>
              <p className="mb-4">
                Most orders are processed and shipped within 1-2 business days.
                Delivery times vary according to your selected shipping method:
              </p>
              <ul className="list-disc pl-5 space-y-2 marker:text-karima-gold">
                <li>
                  <strong>Standard Shipping (JNE Regular):</strong> 2-5 business
                  days.
                </li>
                <li>
                  <strong>Express Shipping (JNE YES):</strong> 1-2 business
                  days.
                </li>
                <li>
                  <strong>Same Day Delivery (GoSend/GrabExpress):</strong>{" "}
                  Available for Jakarta area only, orders must be placed before
                  12:00 PM WIB.
                </li>
              </ul>
            </section>

            <div className="w-full h-[1px] bg-karima-brand/10"></div>

            <section>
              <h3 className="font-serif text-2xl text-karima-brand italic mb-4">
                International Shipping
              </h3>
              <p className="mb-4">
                KARIMA ships worldwide via DHL Express. International shipping
                rates are calculated at checkout based on your destination and
                package weight.
              </p>
              <ul className="list-disc pl-5 space-y-2 marker:text-karima-gold">
                <li>
                  <strong>DHL Express:</strong> 3-7 business days worldwide.
                </li>
              </ul>
              <p className="mt-4 text-sm bg-karima-brand/5 p-4 border border-karima-brand/10">
                <strong>Note:</strong> International orders may be subject to
                import duties and taxes which are the responsibility of the
                customer. We unable to estimate these fees as they vary by
                country.
              </p>
            </section>

            <div className="w-full h-[1px] bg-karima-brand/10"></div>

            <section>
              <h3 className="font-serif text-2xl text-karima-brand italic mb-4">
                Order Tracking
              </h3>
              <p>
                Once your order has been shipped, you will receive a shipping
                confirmation email containing your tracking number. You can
                track your package directly on the courier's website.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
