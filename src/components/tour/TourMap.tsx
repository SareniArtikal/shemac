import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, Circle } from 'react-leaflet';
import * as turf from '@turf/turf';
import { MarkerPoint, TourSettings } from '../../types';

interface TourMapProps {
  points: MarkerPoint[];
  settings: TourSettings | null;
  onPointSelected: (lat: number, lng: number) => void;
  onPointRemoved: (pointId: number) => void;
  onCalculateDistance: (distance: number) => void;
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

function TourMap({ points, settings, onPointSelected, onPointRemoved, onCalculateDistance }: TourMapProps) {
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
    <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-md">
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
        {radiusVisible && settings && settings.max_distance_radius > 0 && (
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
        
        {/* Tour Points */}
        {points.map((point, index) => (
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
        
        {/* Polyline connecting the points */}
        {polylinePositions.length > 1 && (
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