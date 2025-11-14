import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Heart,
  Rocket,
  Sparkles,
  TrendingUp,
  Globe
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Careers - HitTags',
  description: 'Join the HitTags team. We\'re building the future of web bookmarking.',
};

const openPositions = [
  {
    title: 'Senior Full Stack Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    salary: '$120k - $180k',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$100k - $150k',
  },
  {
    title: 'Product Marketing Manager',
    department: 'Marketing',
    location: 'Remote',
    type: 'Full-time',
    salary: '$90k - $130k',
  },
];

const benefits = [
  {
    icon: DollarSign,
    title: 'Competitive Salary',
    description: 'Industry-leading compensation packages with equity options',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: Heart,
    title: 'Health & Wellness',
    description: 'Comprehensive health, dental, and vision insurance',
    color: 'from-red-500 to-red-600',
  },
  {
    icon: Clock,
    title: 'Flexible Hours',
    description: 'Work when you\'re most productive with flexible schedules',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Globe,
    title: 'Remote First',
    description: 'Work from anywhere in the world',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Rocket,
    title: 'Growth & Learning',
    description: 'Annual learning budget and conference attendance',
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: Users,
    title: 'Team Retreats',
    description: 'Quarterly team offsites to amazing destinations',
    color: 'from-pink-500 to-pink-600',
  },
];

export default function CareersPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24">
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-200 opacity-20 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-purple-200 opacity-20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 text-sm font-medium text-blue-900">
              <Briefcase className="mr-2 h-4 w-4 text-blue-600" />
              Careers at HitTags
            </div>
            <h1 className="mb-6 text-5xl font-bold text-slate-900 md:text-6xl">
              Build the future of
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                web bookmarking
              </span>
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-slate-600">
              Join our mission to help millions organize and discover the best content on the web.
              We're a remote-first team building something special.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center rounded-full bg-purple-100 px-4 py-1.5 text-sm font-semibold text-purple-700">
              <Sparkles className="mr-2 h-4 w-4" />
              Benefits & Perks
            </div>
            <h2 className="mb-4 text-4xl font-bold text-slate-900">Why join HitTags?</h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              We offer competitive benefits and a culture that values work-life balance.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border-2 border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-lg"
              >
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${benefit.color} shadow-lg`}>
                  <benefit.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">{benefit.title}</h3>
                <p className="text-slate-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
              <TrendingUp className="mr-2 h-4 w-4" />
              Open Positions
            </div>
            <h2 className="mb-4 text-4xl font-bold text-slate-900">Join our team</h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              We're actively hiring for the following positions. Don't see the right fit? Send us your resume anyway!
            </p>
          </div>

          <div className="space-y-4">
            {openPositions.map((position) => (
              <div
                key={position.title}
                className="flex flex-col gap-4 rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg md:flex-row md:items-center md:justify-between"
              >
                <div className="flex-1">
                  <h3 className="mb-2 text-2xl font-bold text-slate-900">{position.title}</h3>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                    <span className="flex items-center">
                      <Briefcase className="mr-1 h-4 w-4" />
                      {position.department}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      {position.location}
                    </span>
                    <span className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {position.type}
                    </span>
                    <span className="flex items-center font-semibold text-green-600">
                      <DollarSign className="mr-1 h-4 w-4" />
                      {position.salary}
                    </span>
                  </div>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-white transition-all hover:from-blue-700 hover:to-purple-700"
                >
                  <Link href="/contact">Apply Now</Link>
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="mb-6 text-slate-600">Don't see a position that fits?</p>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-slate-300 font-semibold hover:border-slate-400"
            >
              <Link href="/contact">Send General Application</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
