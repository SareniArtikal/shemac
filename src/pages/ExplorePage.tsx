import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PredefinedTour } from '../types';
import { MapPin, Clock, Euro, Users, Ship } from 'lucide-react';

function ExplorePage() {
  const [tours, setTours] = useState<PredefinedTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeople, setSelectedPeople] = useState<number>(3);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('predefined_tours')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTours(data || []);
    } catch (err: any) {
      console.error('Error fetching tours:', err);
      setError('Failed to load tours. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ocean-medium"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex justify-center items-center p-4">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Tours</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTours}
            className="px-4 py-2 bg-ocean-medium text-white rounded-md font-medium hover:bg-ocean-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Explore Our <span className="text-ocean-medium">Curated Tours</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our selection of carefully crafted tour experiences around the beautiful Croatian coast
          </p>
        </div>

        {/* Number of People Selector */}
        <div className="max-w-4xl mx-auto mb-10 p-4 md:p-6 bg-white rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Number of people:</h3>
              <p className="text-sm text-gray-600">Select how many people will join the tour</p>
            </div>
            <div className="w-full md:w-auto">
              <div className="relative">
                <select
                  value={selectedPeople}
                  onChange={(e) => setSelectedPeople(parseInt(e.target.value))}
                  className="block w-full md:w-40 appearance-none rounded-md border border-gray-300 px-4 py-3 pr-8 focus:border-ocean-medium focus:outline-none focus:ring-ocean-medium text-gray-900 font-medium text-lg"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'person' : 'people'}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <Users size={18} className="text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tours List */}
        {tours.length === 0 ? (
          <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md text-center">
            <Ship size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Tours Available</h2>
            <p className="text-gray-600 mb-6">There are currently no pre-defined tours available.</p>
            <a
              href="/build"
              className="px-6 py-3 bg-accent-500 text-white rounded-md font-medium hover:bg-accent-600 transition-colors inline-block"
            >
              Build Your Custom Tour Instead
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <div key={tour.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:transform hover:scale-[1.02] hover:shadow-lg">
                {/* Tour Map Preview (placeholder) */}
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {/* We'd use actual map image here, but for now use a placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-ocean-light to-ocean-dark opacity-70"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Ship size={32} className="text-white" />
                  </div>
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 className="text-xl font-bold text-white">{tour.name}</h3>
                  </div>
                </div>
                
                {/* Tour Details */}
                <div className="p-4">
                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {tour.description || 'Experience a wonderful journey through the beautiful Croatian coast.'}
                  </p>
                  
                  {/* Info Pills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tour.display_price && (
                      <div className="flex items-center gap-1 text-sm px-3 py-1 bg-secondary-100 text-secondary-800 rounded-full">
                        <Euro size={14} />
                        <span>{tour.display_price}€</span>
                      </div>
                    )}
                    {tour.display_duration && (
                      <div className="flex items-center gap-1 text-sm px-3 py-1 bg-primary-100 text-primary-800 rounded-full">
                        <Clock size={14} />
                        <span>{tour.display_duration}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-sm px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
                      <MapPin size={14} />
                      <span>{tour.route_coordinates.length} stops</span>
                    </div>
                  </div>

                  {/* Price and Book Button */}
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <p className="text-sm text-gray-500">Total price:</p>
                      <p className="text-xl font-bold text-gray-900">
                        {tour.display_price ? `${(tour.display_price * selectedPeople).toFixed(2)}€` : '999€'}
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-ocean-medium text-white rounded-md font-medium hover:bg-ocean-dark transition-colors">
                      BOOK NOW
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExplorePage;