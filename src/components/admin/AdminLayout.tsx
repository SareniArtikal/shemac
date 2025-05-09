import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Ship, Settings, MapPin, LogOut } from 'lucide-react';
import { useSupabase } from '../../contexts/SupabaseContext';

function AdminLayout() {
  const { signOut, user } = useSupabase();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="bg-white shadow-md md:w-64 md:fixed md:h-full z-10">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <Ship size={28} className="text-ocean-medium" />
            <span className="font-bold text-xl text-gray-800">Admin Panel</span>
          </div>
          
          <nav className="space-y-1">
            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive
                    ? 'bg-ocean-light/10 text-ocean-dark'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Settings size={18} />
              <span>Tour Settings</span>
            </NavLink>
            
            <NavLink
              to="/admin/tours"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive
                    ? 'bg-ocean-light/10 text-ocean-dark'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <MapPin size={18} />
              <span>Pre-defined Tours</span>
            </NavLink>
          </nav>
        </div>
        
        {/* User info and logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 p-6">
        <div className="container mx-auto py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;