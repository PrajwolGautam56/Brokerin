import Hero from '../components/home/Hero';
import FeaturedProperties from '../components/home/FeaturedProperties';
import PropertyList from '../components/home/PropertyList';
import AboutSection from '../components/home/AboutSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import ServicesSection from '../components/home/ServicesSection';
import FurnitureSection from '../components/home/FurnitureSection';
import StatsBanner from '../components/home/StatsBanner';
import FeaturesSection from '../components/home/FeaturesSection';
import CTABanner from '../components/home/CTABanner';

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <Hero />

      {/* Stats Banner */}
      <StatsBanner />

      {/* Featured Properties */}
      <FeaturedProperties />

      {/* Services Section */}
      <ServicesSection />

      {/* Furniture Section */}
      <FurnitureSection />

      {/* Features/Why Choose Us Section */}
      <FeaturesSection />

      {/* About Section */}
      <div className="bg-white">
        <AboutSection />
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-50">
        <TestimonialsSection />
      </div>

      {/* CTA Banner */}
      <CTABanner />
    </div>
  );
}

export default Home; 