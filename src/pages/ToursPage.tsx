import React, { useState, useEffect } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import { PredefinedTour, MarkerPoint, TourSettings } from '../types';
import TourMap from '../components/tour/TourMap';
import { Ship, MapPin, Clock, Euro, Users, X } from 'lucide-react';

type Mode = 'choosing' | 'explore' | 'build';

function ToursPage() {
  const { supabase } = useSupabase();
  const [mode, setMode] = useState<Mode>('choosing');
  const [tours, setTours] = useState<PredefinedTour[]>([]);
  const [settings, setSettings] = useState<TourSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeople, setSelectedPeople] = useState<number>(1);
  const [points, setPoints] = useState<MarkerPoint[]>([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    Promise.all([fetchTours(), fetchSettings()]).finally(() => setLoading(false));
  }, []);

  const fetchTours = async () => {
    try {
      const { data, error } = await supabase
        .from('predefined_tours')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTours(data || []);
    } catch (err: any) {
      console.error('Error fetching tours:', err);
      setError('Failed to load tours. Please try again.');
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('tour_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) throw error;
      if (data) {
        setSettings(data);
        setSelectedPeople(Math.min(1, data.max_people));
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings. Please try again.');
    }
  };

  const handlePointSelected = (lat: number, lng: number) => {
    if (mode !== 'build') return;
    
    const newPoint: MarkerPoint = {
      id: Date.now(),
      position: [lat, lng]
    };
    setPoints((prevPoints) => [...prevPoints, newPoint]);
  };

  const handlePointRemoved = (pointId: number) => {
    if (mode !== 'build') return;
    setPoints((prevPoints) => prevPoints.filter(p => p.id !== pointId));
  };

  const handleDistanceCalculation = (distance: number) => {
    setTotalDistance(distance);
  };

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

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Map Container */}
      <div className="h-[calc(100vh-4rem)]">
        <TourMap 
          points={mode === 'build' ? points : []}
          settings={settings}
          onPointSelected={handlePointSelected}
          onPointRemoved={handlePointRemoved}
          onCalculateDistance={handleDistanceCalculation}
          predefinedTours={mode === 'explore' ? tours : []}
          mode={mode}
        />
      </div>

      {/* Mode Selection Modal */}
      {mode === 'choosing' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 m-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Welcome to Serious Company Boat Tours
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              Choose how you'd like to start your journey
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => setMode('explore')}
                className="p-6 bg-ocean-light bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all"
              >
                <Ship size={40} className="mx-auto mb-4 text-ocean-medium" />
                <h3 className="text-xl font-semibold text-ocean-dark mb-2">
                  Explore Our Tours
                </h3>
                <p className="text-gray-600 text-sm">
                  Browse our selection of carefully crafted tours
                </p>
              </button>

              <button
                onClick={() => setMode('build')}
                className="p-6 bg-accent-500 bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all"
              >
                <MapPin size={40} className="mx-auto mb-4 text-accent-500" />
                <h3 className="text-xl font-semibold text-accent-600 mb-2">
                  Build Your Own
                </h3>
                <p className="text-gray-600 text-sm">
                  Create a personalized tour by choosing your own destinations
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tour Builder Panel */}
      {mode === 'build' && (
        <div className="absolute bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-xl p-6 animate-slide-up">
          <div className="max-w-5xl mx-auto">
            {showInstructions && (
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-ocean-medium rounded-r-md">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-ocean-dark">How to build your tour</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ol className="list-decimal list-inside space-y-1 pl-1">
                        <li>Click on the map to select destinations (max {settings?.max_points})</li>
                        <li>Select how many people will join (max {settings?.max_people})</li>
                        <li>Review the calculated price</li>
                        <li>Click "Book Now" when ready</li>
                      </ol>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInstructions(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
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

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Total distance:</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {totalDistance.toFixed(1)} {settings?.distance_unit}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of people:
                  </label>
                  <div className="relative">
                    <select
                      value={selectedPeople}
                      onChange={(e) => setSelectedPeople(parseInt(e.target.value))}
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

              <div className="md:border-l md:pl-6">
                <div className="flex items-center mb-4">
                  <Euro size={20} className="text-ocean-medium mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">Price Breakdown</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Starting Fee:</span>
                    <span className="font-medium">
                      {settings?.start_fee.toFixed(2)} {settings?.currency_code}
                    </span>
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
      )}
    </div>
  );
}

export default ToursPage;