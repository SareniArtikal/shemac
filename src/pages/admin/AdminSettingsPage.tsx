import React, { useState, useEffect } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { TourSettings } from '../../types';
import { Save, HelpCircle } from 'lucide-react';

// Default settings
const defaultSettings: TourSettings = {
  id: 1,
  max_points: 5,
  max_people: 12,
  start_fee: 50,
  per_distance_rate: 3,
  distance_unit: 'km',
  currency_code: 'EUR',
  max_distance_radius: 30,
  distance_radius_unit: 'km',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Common currencies
const currencies = [
  { code: 'EUR', name: 'Euro' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'HRK', name: 'Croatian Kuna' },
];

// Distance units
const distanceUnits = [
  { value: 'km', name: 'Kilometers' },
  { value: 'miles', name: 'Miles' },
];

function AdminSettingsPage() {
  const { supabase } = useSupabase();
  const [settings, setSettings] = useState<TourSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Convert number inputs to numbers
    const processedValue = type === 'number' ? parseFloat(value) : value;
    
    setSettings((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase
        .from('tour_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);

      if (error) throw error;
      
      setSuccessMessage('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ocean-medium"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h1 className="text-xl font-semibold text-gray-800">Tour Settings</h1>
        <p className="text-sm text-gray-600 mt-1">
          Configure global settings for the custom tour builder
        </p>
      </div>

      {error && (
        <div className="m-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="m-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 animate-fade-in">
          <p>{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Tour Points Limit */}
          <div>
            <label htmlFor="max_points" className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Tour Points
            </label>
            <input
              type="number"
              id="max_points"
              name="max_points"
              min="1"
              value={settings.max_points}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ocean-light focus:border-ocean-light"
            />
            <div className="mt-1 flex items-start gap-1 text-xs text-gray-500">
              <HelpCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>Maximum number of points a user can select on the map when building a custom tour</span>
            </div>
          </div>

          {/* Maximum People */}
          <div>
            <label htmlFor="max_people" className="block text-sm font-medium text-gray-700 mb-1">
              Maximum People
            </label>
            <input
              type="number"
              id="max_people"
              name="max_people"
              min="1"
              value={settings.max_people}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ocean-light focus:border-ocean-light"
            />
            <div className="mt-1 flex items-start gap-1 text-xs text-gray-500">
              <HelpCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>Maximum number of people allowed on a custom tour</span>
            </div>
          </div>

          {/* Starting Fee */}
          <div>
            <label htmlFor="start_fee" className="block text-sm font-medium text-gray-700 mb-1">
              Starting Fee
            </label>
            <input
              type="number"
              id="start_fee"
              name="start_fee"
              min="0"
              step="0.01"
              value={settings.start_fee}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ocean-light focus:border-ocean-light"
            />
            <div className="mt-1 flex items-start gap-1 text-xs text-gray-500">
              <HelpCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>Base price charged for all tours regardless of distance</span>
            </div>
          </div>

          {/* Rate Per Distance */}
          <div>
            <label htmlFor="per_distance_rate" className="block text-sm font-medium text-gray-700 mb-1">
              Rate Per Distance Unit
            </label>
            <input
              type="number"
              id="per_distance_rate"
              name="per_distance_rate"
              min="0"
              step="0.01"
              value={settings.per_distance_rate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ocean-light focus:border-ocean-light"
            />
            <div className="mt-1 flex items-start gap-1 text-xs text-gray-500">
              <HelpCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>Amount charged per kilometer/mile traveled</span>
            </div>
          </div>

          {/* Distance Unit */}
          <div>
            <label htmlFor="distance_unit" className="block text-sm font-medium text-gray-700 mb-1">
              Distance Unit
            </label>
            <select
              id="distance_unit"
              name="distance_unit"
              value={settings.distance_unit}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ocean-light focus:border-ocean-light"
            >
              {distanceUnits.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.name}
                </option>
              ))}
            </select>
            <div className="mt-1 flex items-start gap-1 text-xs text-gray-500">
              <HelpCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>Unit used for distance calculations and display</span>
            </div>
          </div>

          {/* Currency */}
          <div>
            <label htmlFor="currency_code" className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              id="currency_code"
              name="currency_code"
              value={settings.currency_code}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ocean-light focus:border-ocean-light"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.code})
                </option>
              ))}
            </select>
            <div className="mt-1 flex items-start gap-1 text-xs text-gray-500">
              <HelpCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>Currency used for pricing throughout the application</span>
            </div>
          </div>

          {/* Maximum Distance Radius */}
          <div>
            <label htmlFor="max_distance_radius" className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Distance Radius
            </label>
            <input
              type="number"
              id="max_distance_radius"
              name="max_distance_radius"
              min="0"
              step="0.1"
              value={settings.max_distance_radius}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ocean-light focus:border-ocean-light"
            />
            <div className="mt-1 flex items-start gap-1 text-xs text-gray-500">
              <HelpCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>Maximum allowed distance from starting point for any selected location</span>
            </div>
          </div>

          {/* Distance Radius Unit */}
          <div>
            <label htmlFor="distance_radius_unit" className="block text-sm font-medium text-gray-700 mb-1">
              Distance Radius Unit
            </label>
            <select
              id="distance_radius_unit"
              name="distance_radius_unit"
              value={settings.distance_radius_unit}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ocean-light focus:border-ocean-light"
            >
              {distanceUnits.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.name}
                </option>
              ))}
            </select>
            <div className="mt-1 flex items-start gap-1 text-xs text-gray-500">
              <HelpCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>Unit used for the maximum distance radius constraint</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-ocean-medium text-white rounded-md font-medium hover:bg-ocean-dark transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light disabled:bg-gray-400 flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminSettingsPage;