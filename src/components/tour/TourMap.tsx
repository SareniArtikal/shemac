import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, Circle } from 'react-leaflet';
import * as turf from '@turf/turf';
import { MarkerPoint, TourSettings, PredefinedTour } from '../../types';

interface TourMapProps {
  points: MarkerPoint[];
  settings: TourSettings | null;
  onPointSelected: (lat: number, lng: number) => void;
  onPointRemoved: (pointId: number) => void;
  onCalculateDistance: (distance: number) => void;
  predefinedTours?: PredefinedTour[];
  mode?: 'choosing' | 'explore' | 'build';
}

// Custom marker icon with number
const createNumberedIcon = (number: number) => {
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `<div class="w-8 h-8 rounded-full bg-ocean-medium text-white font-bold flex items-center justify-center border-2 border-white shadow-md">${number}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Starting point icon
const startIcon = L.divIcon({
  className: 'start-marker-icon',
  html: `<div class="w-8 h-8 rounded-full bg-white text-ocean-dark font-bold flex items-center justify-center border-2 border-ocean-medium shadow-md">S</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Predefined tour icon
const tourIcon = L.divIcon({
  className: 'tour-marker-icon',
  html: `<div class="w-8 h-8 rounded-full bg-accent-500 text-white font-bold flex items-center justify-center border-2 border-white shadow-md">T</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Custom component to handle map center
function SetViewAndEvents({ center, zoom, onMapClick }: { center: L.LatLngExpression, zoom: number, onMapClick: (e: L.LeafletMouseEvent) => void }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
    map.on('click', onMapClick);
    
    return () => {
      map.off('click', onMapClick);
    };
  }, [map, center, zoom, onMapClick]);
  
  return null;
}

function TourMap({ points, settings, onPointSelected, onPointRemoved, onCalculateDistance, predefinedTours = [], mode = 'build' }: TourMapProps) {
  // Split, Croatia coordinates
  const splitCoordinates: [number, number] = [43.5081, 16.4402];
  const [radiusVisible, setRadiusVisible] = useState(true);
  
  // Calculate the distance when points change
  useEffect(() => {
    if (points.length >= 1) {
      // Always include Split as the starting point
      const allPoints = [[43.5081, 16.4402], ...points.map(p => p.position)];
      const line = turf.lineString(allPoints);
      const options = { units: settings?.distance_unit === 'miles' ? 'miles' : 'kilometers' };
      const length = turf.length(line, options);
      onCalculateDistance(length);
    } else {
      onCalculateDistance(0);
    }
  }, [points, settings?.distance_unit, onCalculateDistance]);

  // Handle map click to add points
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (mode !== 'build') return;
    
    const { lat, lng } = e.latlng;
    
    // Check if we have settings and a max distance radius
    if (settings && settings.max_distance_radius > 0) {
      // Calculate distance from Split
      const from = turf.point(splitCoordinates);
      const to = turf.point([lat, lng]);
      const options = { units: settings.distance_radius_unit === 'miles' ? 'miles' : 'kilometers' };
      const distance = turf.distance(from, to, options);
      
      // If the distance exceeds the max radius, don't add the point
      if (distance > settings.max_distance_radius) {
        alert(`This point is outside the allowed radius (${settings.max_distance_radius} ${settings.distance_radius_unit} from Split)`);
        return;
      }
    }
    
    // Check if we're at the max number of points
    if (settings && points.length >= settings.max_points) {
      alert(`Maximum number of points (${settings.max_points}) reached`);
      return;
    }
    
    onPointSelected(lat, lng);
  };

  // Create the polyline coordinates from points, always starting from Split
  const polylinePositions = points.length > 0 
    ? [splitCoordinates, ...points.map(p => p.position)]
    : [];
  
  return (
    <div className="h-full w-full">
      <MapContainer
        center={splitCoordinates}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Handle map click and center */}
        <SetViewAndEvents 
          center={splitCoordinates} 
          zoom={10} 
          onMapClick={handleMapClick}
        />
        
        {/* Starting point in Split */}
        <Marker position={splitCoordinates} icon={startIcon}>
          <Popup>
            <div className="text-center">
              <strong>Starting Point</strong>
              <p>Split, Croatia</p>
            </div>
          </Popup>
        </Marker>
        
        {/* Maximum distance radius */}
        {radiusVisible && settings && settings.max_distance_radius > 0 && mode === 'build' && (
          <Circle 
            center={splitCoordinates}
            radius={settings.distance_radius_unit === 'miles' 
              ? settings.max_distance_radius * 1609.34 // miles to meters
              : settings.max_distance_radius * 1000 // km to meters
            }
            pathOptions={{ 
              color: '#0EA5E9', 
              fillColor: '#0EA5E9', 
              fillOpacity: 0.1,
              weight: 1,
              dashArray: '5, 5'
            }}
          />
        )}
        
        {/* Predefined Tours */}
        {(mode === 'explore' || mode === 'choosing') && predefinedTours.map((tour) => (
          <React.Fragment key={tour.id}>
            <Marker 
              position={tour.route_coordinates[0]} 
              icon={tourIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg mb-2">{tour.name}</h3>
                  <p className="text-gray-600 mb-2">{tour.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {tour.display_price && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {tour.display_price}€
                      </span>
                    )}
                    {tour.display_duration && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tour.display_duration}
                      </span>
                    )}
                  </div>
                  <button className="mt-3 w-full px-4 py-2 bg-ocean-medium text-white rounded-md hover:bg-ocean-dark transition-colors">
                    Book Now
                  </button>
                </div>
              </Popup>
            </Marker>
            <Polyline 
              positions={tour.route_coordinates}
              color="#14B8A6"
              weight={3}
              opacity={0.6}
            />
          </React.Fragment>
        ))}
        
        {/* Custom Tour Points */}
        {mode === 'build' && points.map((point, index) => (
          <Marker 
            key={point.id} 
            position={point.position} 
            icon={createNumberedIcon(index + 1)}
            eventHandlers={{
              click: () => onPointRemoved(point.id)
            }}
          >
            <Popup>
              <div className="text-center">
                <strong>Point {index + 1}</strong>
                <p>Click to remove</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Custom Tour Polyline */}
        {mode === 'build' && polylinePositions.length > 1 && (
          <Polyline 
            positions={polylinePositions} 
            color="#0EA5E9"
            weight={3}
            opacity={0.8}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default TourMap;