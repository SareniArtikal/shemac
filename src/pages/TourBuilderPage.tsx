import React, { useState, useEffect } from 'react';
import { Info, Users, DollarSign, MapPin } from 'lucide-react';
import TourMap from '../components/tour/TourMap';
import { useSupabase } from '../contexts/SupabaseContext';
import { MarkerPoint, TourSettings } from '../types';

function TourBuilderPage() {
  const { supabase } = useSupabase();
  const [settings, setSettings] = useState<TourSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Tour building state
  const [points, setPoints] = useState<MarkerPoint[]>([]);
  const [people, setPeople] = useState(1);
  const [totalDistance, setTotalDistance] = useState(0);
  
  // Fetch settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tour_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) throw error;
      
      if (data) {
        setSettings(data);
        // Initialize people to 1 or the max, whichever is smaller
        setPeople(Math.min(1, data.max_people));
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError('Failed to load tour settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle point selection
  const handlePointSelected = (lat: number, lng: number) => {
    const newPoint: MarkerPoint = {
      id: Date.now(), // Use timestamp as temporary id
      position: [lat, lng]
    };
    setPoints((prevPoints) => [...prevPoints, newPoint]);
  };

  // Handle point removal
  const handlePointRemoved = (pointId: number) => {
    setPoints((prevPoints) => prevPoints.filter(p => p.id !== pointId));
  };

  // Handle distance calculation
  const handleDistanceCalculation = (distance: number) => {
    setTotalDistance(distance);
  };

  // Calculate tour price
  const calculatePrice = () => {
    if (!settings) return 0;
    
    const baseFee = settings.start_fee;
    const distanceFee = totalDistance * settings.per_distance_rate;
    
    return baseFee + distanceFee;
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
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Tour Builder</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSettings}
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
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Build Your <span className="text-ocean-medium">Custom Tour</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create your personalized boat tour by selecting points on the map
          </p>
        </div>

        {/* Instructions */}
        {showInstructions && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-blue-50 border-l-4 border-ocean-medium rounded-r-md animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-ocean-medium" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-ocean-dark">How to build your tour</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ol className="list-decimal list-inside space-y-1 pl-1">
                    <li>Click on the map to select destinations for your tour (max {settings?.max_points})</li>
                    <li>Select how many people will join the tour (max {settings?.max_people})</li>
                    <li>Review the calculated price based on your selections</li>
                    <li>Click "Book Now" when you're ready</li>
                  </ol>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setShowInstructions(false)}
                    className="text-sm font-medium text-ocean-dark hover:text-ocean-medium"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto">
          {/* Map for Point Selection */}
          <TourMap 
            points={points}
            settings={settings}
            onPointSelected={handlePointSelected}
            onPointRemoved={handlePointRemoved}
            onCalculateDistance={handleDistanceCalculation}
          />

          {/* Tour Information Panel */}
          <div className="mt-6 bg-white rounded-xl shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                {/* Selected Points Counter */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <MapPin size={18} className="text-ocean-medium" />
                    <span>Selected points: {points.length}/{settings?.max_points}</span>
                  </div>
                  <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-ocean-medium h-full rounded-full"
                      style={{ width: `${(points.length / (settings?.max_points || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Distance */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Total distance:</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {totalDistance.toFixed(1)} {settings?.distance_unit}
                  </p>
                </div>

                {/* Number of People */}
                <div>
                  <label htmlFor="people" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of people:
                  </label>
                  <div className="relative">
                    <select
                      id="people"
                      value={people}
                      onChange={(e) => setPeople(parseInt(e.target.value))}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-4 py-3 pr-8 focus:border-ocean-medium focus:outline-none focus:ring-ocean-medium text-gray-900 font-medium"
                    >
                      {Array.from({ length: settings?.max_people || 12 }, (_, i) => i + 1).map((num) => (
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

              {/* Right Column - Price Calculation */}
              <div className="md:border-l md:pl-6">
                <div className="flex items-center mb-4">
                  <DollarSign size={20} className="text-ocean-medium mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">Price Breakdown</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Starting Fee:</span>
                    <span className="font-medium">{settings?.start_fee.toFixed(2)} {settings?.currency_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distance Fee:</span>
                    <span className="font-medium">
                      {(totalDistance * (settings?.per_distance_rate || 0)).toFixed(2)} {settings?.currency_code}
                    </span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold text-gray-800">Total Price:</span>
                    <span className="font-bold text-xl text-ocean-dark">
                      {calculatePrice().toFixed(2)} {settings?.currency_code}
                    </span>
                  </div>
                </div>

                {/* Book Button */}
                <button
                  className={`mt-6 w-full py-3 rounded-md font-medium text-center transition-colors ${
                    points.length >= 2
                      ? 'bg-ocean-medium text-white hover:bg-ocean-dark'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={points.length < 2}
                >
                  BOOK NOW
                </button>
                {points.length < 2 && (
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Select at least 2 points to book your tour
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TourBuilderPage;