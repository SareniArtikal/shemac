import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Compass } from 'lucide-react';

function LandingPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Discover the Adriatic Sea with
            <span className="text-ocean-medium block mt-2">Serious Company Boat Tours</span>
          </h1>
          <p className="text-xl text-gray-700 mb-10 leading-relaxed">
            Experience the breathtaking Croatian coastline and islands with our premium boat tours.
            Choose from our curated experiences or create your custom adventure.
          </p>
          
          {/* Choice Cards */}
          <div className="mt-12 grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Explore Tours Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="h-48 bg-ocean-light flex items-center justify-center">
                <Compass className="text-white w-20 h-20" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">Explore Our Tours</h3>
                <p className="text-gray-600 mb-5">
                  Browse our selection of carefully crafted tours with fantastic destinations
                </p>
                <Link
                  to="/tours"
                  className="block w-full py-3 px-4 bg-ocean-medium text-white rounded-lg text-center font-medium hover:bg-ocean-dark transition-colors"
                >
                  EXPLORE OUR TOURS
                </Link>
              </div>
            </div>
            
            {/* Build Your Own Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="h-48 bg-accent-500 flex items-center justify-center">
                <MapPin className="text-white w-20 h-20" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">Build Your Own</h3>
                <p className="text-gray-600 mb-5">
                  Create a personalized tour by choosing your own destinations and route
                </p>
                <Link
                  to="/build"
                  className="block w-full py-3 px-4 bg-accent-500 text-white rounded-lg text-center font-medium hover:bg-accent-600 transition-colors"
                >
                  BUILD YOUR OWN
                </Link>
              </div>
            </div>
          </div>

          {/* Promotional Section */}
          <div className="mt-20 p-8 bg-white bg-opacity-70 backdrop-blur-sm rounded-xl shadow-md">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              Why Choose Serious Company?
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="p-4">
                <h3 className="text-xl font-semibold text-ocean-medium mb-2">Experienced Captains</h3>
                <p className="text-gray-600">Our team knows every hidden gem along the Croatian coast</p>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-ocean-medium mb-2">Premium Boats</h3>
                <p className="text-gray-600">Comfortable, safe, and well-maintained vessels for your journey</p>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-ocean-medium mb-2">Personalized Experience</h3>
                <p className="text-gray-600">Custom itineraries tailored to your preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;