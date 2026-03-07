import { Link, useLoaderData, type ActionFunctionArgs } from "react-router";

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  // Retrieve API key from environment (Cloudflare Pages or Node.js process config)
  const env = (context as any)?.cloudflare?.env || process?.env || (import.meta as any).env;
  const apiKey = env?.BREVO_API_KEY || env?.BREVO_PASSWORD || env?.BREVO_LOGIN; // Fallback to other password config if key isn't explicitly set 

  if (!apiKey) {
    console.warn("No BREVO configuration found. Email backup skipped.");
    return { success: false, error: "Configuration missing" };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: "Karima Syari Contact", email: "info@karimasyari.com" },
        replyTo: { name, email },
        to: [{ email: "info@karimasyari.com", name: "Karima Admin" }],
        subject: `[Contact Form Website] ${subject} - ${name}`,
        htmlContent: `
          <h3>New Message from Website</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <br />
          <blockquote>${message.replace(/\n/g, '<br>')}</blockquote>
        `
      })
    });

    if (!response.ok) {
      console.error("Brevo API error:", await response.text());
      return { success: false, error: "Failed to send email" };
    }

    return { success: true };
  } catch (error) {
    console.error("Internal Server Error sending email:", error);
    return { success: false, error: "Internal server error" };
  }
}

import ContactForm from "../components/ContactForm";
import { Mail, MapPin, Instagram, Clock, ArrowLeft } from "lucide-react";
import { gql, GraphQLClient } from "graphql-request";
import { getApiUrl } from "../constants";

const GET_PAGE = gql`
  query getPage($slug: String!) {
    page(slug: $slug) {
      id
      title
      body
    }
  }
`;

export async function loader() {
  const client = new GraphQLClient(getApiUrl());
  try {
    const data = await client.request<{ page: { title: string; body: string } }>(GET_PAGE, { slug: "contact" });
    return { page: data.page };
  } catch (e) {
    console.error("Failed to fetch contact page", e);
    return { page: null };
  }
}

export default function Contact() {
  const { page } = useLoaderData<typeof loader>();

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
      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32">
          {/* Contact Info */}
          <div>
            <span className="text-xxs text-karima-accent uppercase tracking-[0.3em] font-medium block mb-4">
              Contact Us
            </span>
            <h1 className="text-5xl md:text-7xl font-serif text-karima-brand italic mb-8">
              {page?.title || "Get in Touch"}
            </h1>

            {page?.body ? (
              <div
                className="prose prose-lg max-w-none text-karima-ink/60 font-light leading-relaxed mb-12"
                dangerouslySetInnerHTML={{ __html: page.body }}
              />
            ) : (
              <p className="text-karima-ink/60 font-light leading-relaxed mb-12 max-w-md">
                We are at your disposal to answer any questions about our
                creations or to assist you with your order.
              </p>
            )}

            <div className="space-y-10">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-karima-brand mb-4 flex items-center gap-2">
                  <Mail size={14} /> Email
                </h3>
                <a
                  href="mailto:info@karima.com"
                  className="text-xl font-serif italic text-karima-ink hover:text-karima-gold transition-colors"
                >
                  info@karima.com
                </a>
                <div className="mt-1 text-sm text-karima-ink/40 font-light">
                  Response within 24 hours
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-widest text-karima-brand mb-4 flex items-center gap-2">
                  <Instagram size={14} /> Social
                </h3>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-serif italic text-karima-ink hover:text-karima-gold transition-colors"
                >
                  @karima.syari
                </a>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-widest text-karima-brand mb-4 flex items-center gap-2">
                  <Clock size={14} /> Hours
                </h3>
                <div className="text-lg font-light text-karima-ink/80 leading-relaxed">
                  Monday - Saturday
                  <br />
                  09:00 AM - 09:00 PM WIB
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
