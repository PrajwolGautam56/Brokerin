import Hero from '../components/home/Hero';
import FeaturedProperties from '../components/home/FeaturedProperties';
import PropertyList from '../components/home/PropertyList';
import AboutSection from '../components/home/AboutSection';
import TestimonialsSection from '../components/home/TestimonialsSection';

function Home() {
  return (
    <div>
      {/* Hero Section - White */}
      <Hero />

      <FeaturedProperties />

      {/* Featured Properties - Light Gray */}
       

      {/* About Section - White */}
      <div className="bg-white">
        <AboutSection />
      </div>

      {/* Testimonials - Light Gray */}
      <div className="bg-gray-50">
        <TestimonialsSection />
      </div>
    </div>
  );
}

export default Home; 