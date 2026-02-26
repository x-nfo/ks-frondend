import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export default function Returns() {
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
            Returns & Exchanges
          </h1>
        </div>

        <div className="prose prose-stone max-w-none text-karima-ink/70 font-light leading-loose">
          <p className="mb-12 text-lg text-center">
            We want you to love your KARIMA piece. If for any reason you are not
            completely satisfied, we accept returns within 14 days of delivery.
          </p>

          <div className="space-y-12">
            <section>
              <h3 className="font-serif text-2xl text-karima-brand italic mb-4">
                Return Policy
              </h3>
              <ul className="list-disc pl-5 space-y-2 marker:text-karima-gold">
                <li>
                  Items must be returned within 14 days of receiving your order.
                </li>
                <li>
                  Items must be unworn, unwashed, and in their original
                  conditional with all tags attached.
                </li>
                <li>
                  Custom-made or altered items are not eligible for return.
                </li>
                <li>Sale items are final sale and cannot be returned.</li>
              </ul>
            </section>

            <div className="w-full h-[1px] bg-karima-brand/10"></div>

            <section>
              <h3 className="font-serif text-2xl text-karima-brand italic mb-4">
                How to Return
              </h3>
              <ol className="list-decimal pl-5 space-y-4 marker:text-karima-gold marker:font-serif marker:italic">
                <li>
                  <strong>Initiate Return:</strong> Email us at{" "}
                  <a
                    href="mailto:returns@karima.com"
                    className="text-karima-brand hover:text-karima-gold underline decoration-1 underline-offset-4"
                  >
                    returns@karima.com
                  </a>{" "}
                  with your order number and reason for return.
                </li>
                <li>
                  <strong>Receive Label:</strong> We will review your request
                  and send you a prepaid shipping label (for domestic orders)
                  and instructions.
                </li>
                <li>
                  <strong>Pack & Ship:</strong> distinctively pack your item in
                  its original box and attach the shipping label. Drop it off at
                  the nearest courier location.
                </li>
              </ol>
            </section>

            <div className="w-full h-[1px] bg-karima-brand/10"></div>

            <section>
              <h3 className="font-serif text-2xl text-karima-brand italic mb-4">
                Refunds
              </h3>
              <p className="mb-4">
                Once your return is received and inspected, we will notify you
                of the approval or rejection of your refund.
              </p>
              <p>
                If approved, your refund will be processed, and a credit will
                automatically be applied to your original method of payment
                within 5-10 business days. Please note that shipping costs are
                non-refundable.
              </p>
            </section>

            <section className="bg-karima-brand/5 p-8 border border-karima-brand/10 mt-12 text-center">
              <h4 className="font-serif text-xl text-karima-brand italic mb-2">
                Exchanges
              </h4>
              <p className="text-sm">
                We currently do not offer direct exchanges. The best way to
                ensure you get the item you want is to return the item you have,
                and once the return is accepted, make a separate purchase for
                the new item.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
