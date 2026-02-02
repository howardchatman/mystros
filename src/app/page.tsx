import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Phone, Clock } from "lucide-react";
import { HeroSectionV2 } from "@/components/marketing/hero-section-v2";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/layout/footer";
import { TextureBackground, GlassCard, GradientText } from "@/components/marketing/texture-background";

// Import content data
import campusesData from "@content/campuses.json";
import programsData from "@content/programs.json";
import testimonialsData from "@content/testimonials.json";
import videosData from "@content/videos.json";

export default function HomePage() {
  const { campuses } = campusesData;
  const { programs } = programsData;
  const { testimonials, stats } = testimonialsData;
  const featuredVideo = videosData.videos.find((v) => v.isFeatured);

  return (
    <>
      {/* Sticky Header */}
      <Header />

      <main id="main-content">
        {/* Hero Section V2 - Video Background */}
        <HeroSectionV2 />

      {/* Programs Section */}
      <TextureBackground
        variant="default"
        withNoise
        className="py-20 md:py-28"
      >
        <div className="container-wide">
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-eyebrow">Our Programs</p>
            <h2 className="section-heading">
              Master the <GradientText>Craft</GradientText>
            </h2>
            <p className="mt-4 section-subheading mx-auto">
              Choose from our state-approved programs designed to prepare you for a successful career in barbering.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {programs.map((program) => (
              <GlassCard key={program.id} withGlow className="p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-brand-text">
                      {program.name}
                    </h3>
                    <p className="mt-1 text-brand-muted">
                      {program.hours.total} Clock Hours
                    </p>
                  </div>
                  {program.isFeatured && (
                    <span className="badge-gold">Featured</span>
                  )}
                </div>

                <p className="mt-4 text-brand-muted">
                  {program.description}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-brand-muted">Duration</p>
                    <p className="font-semibold text-brand-text">
                      {program.schedules[0]?.expectedMonths}-{program.schedules[1]?.expectedMonths} Months
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-muted">Total Cost</p>
                    <p className="font-semibold text-brand-text">
                      ${program.tuition.total.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {program.schedules.map((schedule) => (
                    <span key={schedule.id} className="badge-default">
                      {schedule.name}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex gap-4">
                  <Link
                    href={`/programs/${program.slug}`}
                    className="btn-secondary flex-1"
                  >
                    Learn More
                  </Link>
                  <Link href="/apply" className="btn-primary flex-1">
                    Apply Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Financial Aid Callout */}
          <div className="mt-12 text-center">
            <GlassCard className="mx-auto inline-flex items-center gap-4 px-8 py-4">
              <div className="text-left">
                <p className="font-semibold text-brand-text">
                  Financial Aid Available
                </p>
                <p className="text-sm text-brand-muted">
                  FAFSA School Code: 042609
                </p>
              </div>
              <Link href="/financial-aid" className="btn-outline">
                Learn More
              </Link>
            </GlassCard>
          </div>
        </div>
      </TextureBackground>

      {/* Campuses Section */}
      <TextureBackground
        variant="section"
        withNoise
        withGradientSpot
        gradientSpotPosition="bottom-left"
        className="py-20 md:py-28"
      >
        <div className="container-wide">
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-eyebrow">Our Locations</p>
            <h2 className="section-heading">
              Two <GradientText>Convenient</GradientText> Campuses
            </h2>
            <p className="mt-4 section-subheading mx-auto">
              Serving the greater Houston area with modern facilities and experienced instructors.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {campuses.map((campus) => (
              <GlassCard key={campus.id} className="overflow-hidden">
                {/* Campus header */}
                <div className="border-b border-brand-primary/20 bg-brand-primary/20 px-6 py-4">
                  <h3 className="text-xl font-bold text-brand-text">
                    {campus.name}
                  </h3>
                </div>

                {/* Campus details */}
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-brand-accent" />
                      <div>
                        <p className="text-brand-text">{campus.address.line1}</p>
                        <p className="text-brand-muted">
                          {campus.address.city}, {campus.address.state} {campus.address.zip}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 flex-shrink-0 text-brand-accent" />
                      <a
                        href={`tel:${campus.phone.replace(/-/g, "")}`}
                        className="text-brand-text hover:text-brand-accent transition-colors"
                      >
                        {campus.phoneFormatted}
                      </a>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="mt-1 h-5 w-5 flex-shrink-0 text-brand-accent" />
                      <div className="text-sm text-brand-muted">
                        <p>Mon-Fri: {campus.hours.weekday}</p>
                        <p>Sat: {campus.hours.saturday}</p>
                        <p>Sun: {campus.hours.sunday}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-4">
                    <a
                      href={campus.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary flex-1"
                    >
                      Get Directions
                    </a>
                    <a
                      href={`tel:${campus.phone.replace(/-/g, "")}`}
                      className="btn-primary flex-1"
                    >
                      <Phone className="h-4 w-4" />
                      Call Now
                    </a>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </TextureBackground>

      {/* Stats Section */}
      <section className="border-y border-brand-primary/20 bg-brand-elevated/50 py-16">
        <div className="container-wide">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-brand-accent md:text-5xl">
                {stats.graduationRate}%
              </p>
              <p className="mt-2 text-sm text-brand-muted">Graduation Rate</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-brand-accent md:text-5xl">
                {stats.jobPlacementRate}%
              </p>
              <p className="mt-2 text-sm text-brand-muted">Job Placement</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-brand-accent md:text-5xl">
                {stats.totalGraduates}+
              </p>
              <p className="mt-2 text-sm text-brand-muted">Graduates</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-brand-accent md:text-5xl">
                {stats.yearsInOperation}+
              </p>
              <p className="mt-2 text-sm text-brand-muted">Years of Excellence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TextureBackground
        variant="default"
        withNoise
        className="py-20 md:py-28"
      >
        <div className="container-wide">
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-eyebrow">Student Success</p>
            <h2 className="section-heading">
              What Our <GradientText>Students</GradientText> Say
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(0, 3).map((testimonial) => (
              <GlassCard key={testimonial.id} className="p-6">
                <div className="flex items-center gap-1 text-brand-gold">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-4 w-4 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="mt-4">
                  <p className="text-brand-text italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                </blockquote>

                <div className="mt-6 border-t border-brand-primary/20 pt-4">
                  <p className="font-semibold text-brand-text">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-brand-muted">
                    {testimonial.role}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </TextureBackground>

      {/* Featured Video Section */}
      {featuredVideo && (
        <TextureBackground
          variant="section"
          withNoise
          withBlueprint
          className="py-20 md:py-28"
        >
          <div className="container-wide">
            <div className="mx-auto max-w-3xl text-center">
              <p className="section-eyebrow">See Us in Action</p>
              <h2 className="section-heading">
                Community <GradientText>Impact</GradientText>
              </h2>
              <p className="mt-4 section-subheading mx-auto">
                Learn about our reentry program and how Mystros is making a difference.
              </p>
            </div>

            <div className="mx-auto mt-12 max-w-4xl">
              <div className="video-container">
                <iframe
                  src={`${featuredVideo.embedUrl}?rel=0&modestbranding=1`}
                  title={featuredVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <p className="mt-4 text-center text-sm text-brand-muted">
                {featuredVideo.title}
              </p>
            </div>

            <div className="mt-8 text-center">
              <Link href="/community" className="btn-secondary">
                View More Videos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </TextureBackground>
      )}

      {/* CTA Banner */}
      <TextureBackground
        variant="hero"
        withNoise
        withGradientSpot
        gradientSpotPosition="center"
        className="py-20 md:py-28"
      >
        <div className="container-wide">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="section-heading">
              Ready to Start Your <GradientText>Journey</GradientText>?
            </h2>
            <p className="mt-4 section-subheading mx-auto">
              Take the first step toward your new career. Apply today or schedule a campus tour.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/apply" className="btn-cta w-full sm:w-auto">
                Apply Now - It&apos;s Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/admissions#schedule-tour" className="btn-secondary w-full sm:w-auto">
                Schedule a Campus Tour
              </Link>
            </div>

            <p className="mt-6 text-sm text-brand-muted">
              Questions? Call us at{" "}
              <a
                href="tel:8322864248"
                className="text-brand-accent hover:underline"
              >
                (832) 286-4248
              </a>{" "}
              or email{" "}
              <a
                href="mailto:INFOMYSTROSBARBERACADEMY@GMAIL.COM"
                className="text-brand-accent hover:underline"
              >
                INFOMYSTROSBARBERACADEMY@GMAIL.COM
              </a>
            </p>
          </div>
        </div>
      </TextureBackground>

      <Footer />
      </main>
    </>
  );
}
