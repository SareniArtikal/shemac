import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Ship, Menu } from 'lucide-react';

function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-ocean-medium hover:text-ocean-dark transition-colors">
          <Ship size={28} className="text-ocean-medium" />
          <span className="font-semibold text-xl hidden sm:inline">Serious Company</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/tours"
            className={`font-medium transition-colors ${
              location.pathname === '/tours'
                ? 'text-ocean-dark'
                : 'text-gray-600 hover:text-ocean-medium'
            }`}
          >
            Explore Tours
          </Link>
          <Link
            to="/build"
            className={`font-medium transition-colors ${
              location.pathname === '/build'
                ? 'text-ocean-dark'
                : 'text-gray-600 hover:text-ocean-medium'
            }`}
          >
            Build Your Own
          </Link>
          <Link
            to="/admin"
            className="px-4 py-2 bg-ocean-medium text-white rounded-md font-medium hover:bg-ocean-dark transition-colors"
          >
            Admin Access
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden text-gray-600 hover:text-ocean-medium focus:outline-none"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 shadow-md animate-fade-in">
          <nav className="flex flex-col space-y-4">
            <Link
              to="/tours"
              className={`px-4 py-2 font-medium transition-colors ${
                location.pathname === '/tours'
                  ? 'text-ocean-dark bg-blue-50 rounded-md'
                  : 'text-gray-600 hover:text-ocean-medium hover:bg-gray-50 rounded-md'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Explore Tours
            </Link>
            <Link
              to="/build"
              className={`px-4 py-2 font-medium transition-colors ${
                location.pathname === '/build'
                  ? 'text-ocean-dark bg-blue-50 rounded-md'
                  : 'text-gray-600 hover:text-ocean-medium hover:bg-gray-50 rounded-md'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Build Your Own
            </Link>
            <Link
              to="/admin"
              className="px-4 py-2 bg-ocean-medium text-white rounded-md font-medium hover:bg-ocean-dark transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Admin Access
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;