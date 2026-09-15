import Link from "next/link";

import { ProviderCard } from "@/components/provider-card";
import { featuredProviders } from "@/lib/seed-data";

const quickSearches = [
  { label: "Vet", value: "veterinary_clinic" },
  { label: "Emergency vet", value: "emergency_vet" },
  { label: "Ambulance", value: "animal_ambulance" },
  { label: "NGO", value: "ngo" },
  { label: "Rescuer", value: "rescuer" },
  { label: "Boarding", value: "boarding" },
];

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="hero-copy">
            <p className="hero-kicker">AnimalCare <span>for every paw</span></p>
            <h1>Your pet&apos;s health, our <em>priority.</em></h1>
            <p className="hero-intro">Find trusted veterinary care, emergency help, and animal services near you, all in one gentle place.</p>

            <form action="/providers" method="get" className="hero-search">
              <input name="city" defaultValue="Delhi" placeholder="Search your city" aria-label="Search your city" />
              <button type="submit">Find care <span aria-hidden="true">-&gt;</span></button>
            </form>

            <div className="quick-links">
              {quickSearches.slice(0, 4).map((quick) => (
                <Link key={quick.value} href={`/providers?service=${quick.value}&city=Delhi`}>{quick.label}</Link>
              ))}
            </div>
          </div>

          <div className="hero-pet-wrap" aria-label="A happy dog receiving care">
            <div className="hero-sun" />
            <div className="hero-paw hero-paw-one" aria-hidden="true">+</div>
            <div className="hero-paw hero-paw-two" aria-hidden="true">+</div>
            <div className="hero-pet-image" />
            <div className="hero-note">Loved ones<br /><strong>deserve the best.</strong></div>
          </div>
        </div>
        <div className="hero-wave" aria-hidden="true" />
      </section>

      <section className="story-section">
        <div className="story-image" aria-label="A veterinarian examining a puppy" />
        <div className="story-copy">
          <p className="section-kicker">Why AnimalCare</p>
          <h2>Care that feels <em>closer</em> to home.</h2>
          <p>From the first worried search to the next check-up, we help pet parents move from uncertainty to the right support.</p>
          <div className="story-points">
            <div><strong>01</strong><span>Trusted local providers, clearly listed.</span></div>
            <div><strong>02</strong><span>Medical records that stay easy to follow.</span></div>
          </div>
          <Link href="/providers" className="text-link">Explore care <span aria-hidden="true">-&gt;</span></Link>
        </div>
      </section>

      <section className="services-section">
        <div className="section-heading">
          <div><p className="section-kicker">Start here</p><h2>Support for every <em>moment.</em></h2></div>
          <Link href="/providers" className="text-link">View all providers <span aria-hidden="true">-&gt;</span></Link>
        </div>
        <div className="service-grid">
          {featuredProviders.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}
        </div>
      </section>

      <section className="tools-section">
        <div><p className="section-kicker">A calmer way forward</p><h2>Everything your animal needs, in one place.</h2></div>
        <div className="tools-grid">
          <Link href="/ai"><span className="tool-number">01</span><strong>AI care navigator</strong><span>Make sense of symptoms without the guesswork.</span></Link>
          <Link href="/animals"><span className="tool-number">02</span><strong>Animal profile</strong><span>Keep every vaccination and record close.</span></Link>
          <Link href="/medical"><span className="tool-number">03</span><strong>Medical summaries</strong><span>Turn complicated documents into clear next steps.</span></Link>
        </div>
      </section>
    </div>
  );
}
