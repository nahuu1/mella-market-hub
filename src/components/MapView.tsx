
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  provider: string;
  rating: number;
  distance: number;
  image: string;
  location: { lat: number; lng: number };
}

interface MapViewProps {
  services: Service[];
  userLocation: { lat: number; lng: number };
  distanceFilter: number;
}

export const MapView: React.FC<MapViewProps> = ({ services, userLocation, distanceFilter }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersGroup = useRef<L.LayerGroup | null>(null);

  // Emergency locations in Addis Ababa
  const emergencyLocations = [
    { type: 'Hospital', name: 'Tikur Anbessa Hospital', lat: 9.0366, lng: 38.7639, icon: '🏥' },
    { type: 'Hospital', name: 'Black Lion Hospital', lat: 9.0415, lng: 38.7614, icon: '🏥' },
    { type: 'Police', name: 'Federal Police HQ', lat: 9.0300, lng: 38.7400, icon: '🚔' },
    { type: 'Fire Station', name: 'Addis Fire Station', lat: 9.0250, lng: 38.7500, icon: '🚒' },
  ];

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current).setView([userLocation.lat, userLocation.lng], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    // Create markers group
    markersGroup.current = L.layerGroup().addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !markersGroup.current) return;

    // Clear existing markers
    markersGroup.current.clearLayers();

    // Add user location marker
    const userIcon = L.divIcon({
      html: '<div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      className: 'user-location-marker'
    });

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(markersGroup.current)
      .bindPopup('<strong>Your Location</strong>')
      .openPopup();

    // Add distance circle
    L.circle([userLocation.lat, userLocation.lng], {
      radius: distanceFilter * 1000,
      fillColor: '#f97316',
      fillOpacity: 0.1,
      color: '#f97316',
      weight: 2,
      dashArray: '10, 10'
    }).addTo(markersGroup.current);

    // Add service markers
    services.forEach((service) => {
      const serviceIcon = L.divIcon({
        html: `<div style="background: #f97316; color: white; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">S</div>`,
        iconSize: [30, 30],
        className: 'service-marker'
      });

      L.marker([service.location.lat, service.location.lng], { icon: serviceIcon })
        .addTo(markersGroup.current!)
        .bindPopup(`
          <div style="max-width: 200px;">
            <strong>${service.title}</strong><br>
            <small>${service.description}</small><br>
            <strong>ETB ${service.price.toLocaleString()}</strong><br>
            <small>by ${service.provider}</small><br>
            <small>${service.distance.toFixed(1)}km away</small>
          </div>
        `);
    });

    // Add emergency location markers
    emergencyLocations.forEach((location) => {
      const emergencyIcon = L.divIcon({
        html: `<div style="background: #dc2626; color: white; width: 25px; height: 25px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 14px;">${location.icon}</div>`,
        iconSize: [25, 25],
        className: 'emergency-marker'
      });

      L.marker([location.lat, location.lng], { icon: emergencyIcon })
        .addTo(markersGroup.current!)
        .bindPopup(`<strong>${location.name}</strong><br><small>${location.type}</small>`);
    });

  }, [services, userLocation, distanceFilter]);

  return (
    <div className="h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
};
