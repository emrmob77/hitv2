import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import {
  Mail,
  MessageSquare,
  MapPin,
  Phone,
  Send,
  Sparkles,
  Clock,
  Users,
  HelpCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us - HitTags',
  description: 'Get in touch with the HitTags team. We\'re here to help with any questions or feedback.',
};

export default function ContactPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24">
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-200 opacity-20 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-purple-200 opacity-20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 text-sm font-medium text-blue-900">
              <MessageSquare className="mr-2 h-4 w-4 text-blue-600" />
              Contact Us
            </div>
            <h1 className="mb-6 text-5xl font-bold text-slate-900 md:text-6xl">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Get in Touch
              </span>
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-slate-600">
              Have a question, feedback, or just want to say hello? We'd love to hear from you. Our team typically responds within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border-2 border-slate-100 bg-white p-8 text-center shadow-sm transition-all hover:shadow-lg">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Mail className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">Email</h3>
              <p className="mb-4 text-sm text-slate-600">General inquiries</p>
              <a href="mailto:hello@hittags.com" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                hello@hittags.com
              </a>
            </div>

            <div className="rounded-2xl border-2 border-slate-100 bg-white p-8 text-center shadow-sm transition-all hover:shadow-lg">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">Support</h3>
              <p className="mb-4 text-sm text-slate-600">Technical help</p>
              <a href="mailto:support@hittags.com" className="text-sm font-semibold text-purple-600 hover:text-purple-700">
                support@hittags.com
              </a>
            </div>

            <div className="rounded-2xl border-2 border-slate-100 bg-white p-8 text-center shadow-sm transition-all hover:shadow-lg">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg">
                <HelpCircle className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">Help Center</h3>
              <p className="mb-4 text-sm text-slate-600">Documentation</p>
              <a href="/help" className="text-sm font-semibold text-pink-600 hover:text-pink-700">
                Browse Help
              </a>
            </div>

            <div className="rounded-2xl border-2 border-slate-100 bg-white p-8 text-center shadow-sm transition-all hover:shadow-lg">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">Response Time</h3>
              <p className="mb-4 text-sm text-slate-600">Average response</p>
              <span className="text-sm font-semibold text-green-600">
                Within 24 hours
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900">Send us a message</h2>
            <p className="text-lg text-slate-600">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="rounded-3xl border-2 border-slate-200 bg-white p-8 shadow-xl md:p-12">
            <form className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full rounded-lg border-2 border-slate-200 px-4 py-3 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full rounded-lg border-2 border-slate-200 px-4 py-3 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="mb-2 block text-sm font-semibold text-slate-700">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  className="w-full rounded-lg border-2 border-slate-200 px-4 py-3 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-semibold text-slate-700">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  className="w-full rounded-lg border-2 border-slate-200 px-4 py-3 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-lg font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700"
              >
                <Send className="mr-2 h-5 w-5" />
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Office Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
              <MapPin className="mr-2 h-4 w-4" />
              Our Location
            </div>
            <h2 className="mb-4 text-3xl font-bold text-slate-900">Visit us</h2>
            <p className="mb-12 text-lg text-slate-600">
              We're headquartered in San Francisco, with a remote-first team across the globe.
            </p>

            <div className="mx-auto max-w-xl rounded-2xl border-2 border-slate-100 bg-white p-8 shadow-sm">
              <div className="mb-4 text-xl font-bold text-slate-900">HitTags HQ</div>
              <div className="space-y-2 text-slate-600">
                <p>123 Market Street, Suite 400</p>
                <p>San Francisco, CA 94103</p>
                <p>United States</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
