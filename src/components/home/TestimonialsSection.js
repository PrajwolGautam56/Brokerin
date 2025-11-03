import { useState } from 'react';
import { UserCircleIcon, StarIcon } from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'Homeowner',
    rating: 5,
    text: 'Found my dream apartment through Brokerin. The service was exceptional, and the team helped me negotiate the best price. The entire process was smooth and transparent.'
  },
  {
    id: 2,
    name: 'Rahul Verma',
    role: 'Property Investor',
    rating: 5,
    text: 'As a property investor, I appreciate how Brokerin streamlines the entire process. Their property listings are detailed, and the team is highly professional. Have completed multiple deals through them.'
  },
  {
    id: 3,
    name: 'Anjali Patel',
    role: 'Tenant',
    rating: 4,
    text: 'The home maintenance services are fantastic! Got my AC and plumbing issues fixed quickly. The service providers were professional and the pricing was very reasonable.'
  },
  {
    id: 4,
    name: 'Karthik Reddy',
    role: 'Property Owner',
    rating: 5,
    text: 'Listed my property on Brokerin and got great responses. Their team handled everything from showing the property to documentation. Highly recommend their services!'
  },
  {
    id: 5,
    name: 'Meera Iyer',
    role: 'Recent Buyer',
    rating: 4,
    text: 'The property search filters made it easy to find exactly what I was looking for. The virtual tours saved me a lot of time. Very satisfied with my purchase through Brokerin.'
  }
];

function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 3 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 3 : prevIndex - 1
    );
  };

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600">
            Don't just take our word for it - hear from our satisfied customers
          </p>
        </div>

        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 -ml-4"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 -mr-4"
          >
            <ChevronRightIcon className="h-6 w-6 text-gray-600" />
          </button>

          {/* Testimonials Slider */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 33.33}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="w-1/3 flex-shrink-0 px-4"
                >
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow h-full">
                    <div className="flex items-center mb-4">
                      <UserCircleIcon className="h-12 w-12 text-violet-500" />
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {testimonial.name}
                        </h3>
                        <p className="text-gray-600">{testimonial.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, index) => (
                        <StarIcon
                          key={index}
                          className={`h-5 w-5 ${
                            index < testimonial.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-gray-600 italic">"{testimonial.text}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center mt-8 gap-2">
            {[...Array(testimonials.length - 2)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentIndex === index ? 'w-6 bg-violet-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestimonialsSection; 