import React, { useState, useEffect } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { PredefinedTour } from '../../types';
import { PlusCircle, Pencil, Trash2, Ship, Check, X } from 'lucide-react';

function AdminToursPage() {
  const { supabase } = useSupabase();
  const [tours, setTours] = useState<PredefinedTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentTour, setCurrentTour] = useState<PredefinedTour | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    route_coordinates: '',
    display_price: '',
    display_duration: '',
  });

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

  const handleAddNewClick = () => {
    setFormValues({
      name: '',
      description: '',
      route_coordinates: '',
      display_price: '',
      display_duration: '',
    });
    setCurrentTour(null);
    setFormMode('create');
    setShowForm(true);
  };

  const handleEditClick = (tour: PredefinedTour) => {
    setFormValues({
      name: tour.name,
      description: tour.description || '',
      route_coordinates: JSON.stringify(tour.route_coordinates, null, 2),
      display_price: tour.display_price?.toString() || '',
      display_duration: tour.display_duration || '',
    });
    setCurrentTour(tour);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let route_coordinates;
      try {
        route_coordinates = JSON.parse(formValues.route_coordinates);
        // Validate if it's an array of [lat, lng] pairs
        if (!Array.isArray(route_coordinates)) {
          throw new Error('Route coordinates must be an array');
        }
      } catch (err) {
        setError('Invalid JSON format for route coordinates');
        setSaving(false);
        return;
      }

      const tourData = {
        name: formValues.name,
        description: formValues.description,
        route_coordinates,
        display_price: formValues.display_price ? parseFloat(formValues.display_price) : null,
        display_duration: formValues.display_duration || null,
        updated_at: new Date().toISOString(),
      };

      if (formMode === 'create') {
        const { error } = await supabase.from('predefined_tours').insert([tourData]);
        if (error) throw error;
        setSuccessMessage('Tour created successfully!');
      } else if (formMode === 'edit' && currentTour) {
        const { error } = await supabase
          .from('predefined_tours')
          .update(tourData)
          .eq('id', currentTour.id);
          
        if (error) throw error;
        setSuccessMessage('Tour updated successfully!');
      }

      // Refresh the tours list
      fetchTours();
      
      // Reset form and hide it
      setShowForm(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error saving tour:', err);
      setError('Failed to save tour. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tourId: string) => {
    if (!confirm('Are you sure you want to delete this tour?')) return;

    try {
      const { error } = await supabase
        .from('predefined_tours')
        .delete()
        .eq('id', tourId);
        
      if (error) throw error;
      
      // Refresh the tours list
      fetchTours();
      setSuccessMessage('Tour deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error deleting tour:', err);
      setError('Failed to delete tour. Please try again.');
    }
  };

  if (loading && tours.length === 0) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ocean-medium"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Pre-defined Tours</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage the tours that appear in the "Explore Tours" section
          </p>
        </div>
        <button
          onClick={handleAddNewClick}
          className="px-4 py-2 bg-ocean-medium text-white rounded-md font-medium hover:bg-ocean-dark transition-colors flex items-center gap-2"
        >
          <PlusCircle size={18} />
          <span>Add New Tour</span>
        </button>
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

      {showForm && (
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            {formMode === 'create' ? 'Add New Tour' : 'Edit Tour'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Tour Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Tour Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formValues.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ocean-light focus:border-ocean-light"
                />
              </div>

              {/* Display Price */}
              <div>
                <label htmlFor="display_price" className="block text-sm font-medium text-gray-700 mb-1">
                  Display Price
                </label>
                <input
                  type="number"
                  id="display_price"
                  name="display_price"
                  min="0"
                  step="0.01"
                  value={formValues.display_price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ocean-light focus:border-ocean-light"
                  placeholder="Optional"
                />
              </div>

              {/* Display Duration */}
              <div>
                <label htmlFor="display_duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Display Duration
                </label>
                <input
                  type="text"
                  id="display_duration"
                  name="display_duration"
                  value={formValues.display_duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ocean-light focus:border-ocean-light"
                  placeholder="e.g., 4 hours, Half-day"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Tour Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formValues.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ocean-light focus:border-ocean-light"
                  placeholder="Describe this tour..."
                ></textarea>
              </div>

              {/* Route Coordinates */}
              <div className="md:col-span-2">
                <label htmlFor="route_coordinates" className="block text-sm font-medium text-gray-700 mb-1">
                  Route Coordinates
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  Enter as a JSON array of [latitude, longitude] pairs. Example:
                  <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                    [
                      [43.5081, 16.4402],
                      [43.5138, 16.2522],
                      [43.3844, 16.3022]
                    ]
                  </pre>
                </div>
                <textarea
                  id="route_coordinates"
                  name="route_coordinates"
                  rows={5}
                  required
                  value={formValues.route_coordinates}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-ocean-light focus:border-ocean-light"
                ></textarea>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-ocean-medium text-white rounded-md font-medium hover:bg-ocean-dark transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light disabled:bg-gray-400 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    <span>{formMode === 'create' ? 'Create Tour' : 'Update Tour'}</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors focus:outline-none flex items-center gap-2"
              >
                <X size={18} />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tours List */}
      <div className="p-6">
        {tours.length === 0 ? (
          <div className="text-center py-8">
            <Ship size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No tours have been created yet.</p>
            <button
              onClick={handleAddNewClick}
              className="mt-4 px-6 py-2 bg-ocean-medium text-white rounded-md font-medium hover:bg-ocean-dark transition-colors inline-flex items-center gap-2"
            >
              <PlusCircle size={18} />
              <span>Create Your First Tour</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tours.map((tour) => (
              <div key={tour.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{tour.name}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {tour.description || 'No description provided'}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {tour.display_price && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                          {tour.display_price} {tour.display_price ? '€' : ''}
                        </span>
                      )}
                      {tour.display_duration && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {tour.display_duration}
                        </span>
                      )}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {tour.route_coordinates.length} points
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(tour)}
                      className="p-2 text-gray-500 hover:text-ocean-medium hover:bg-ocean-light/10 rounded transition-colors"
                      title="Edit tour"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(tour.id)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Delete tour"
                    >
                      <Trash2 size={18} />
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

export default AdminToursPage;