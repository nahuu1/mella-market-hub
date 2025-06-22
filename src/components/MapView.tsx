
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

  // Emergency locations in Addis Ababa with actual phone numbers
  const emergencyLocations = [
    { 
      type: 'Hospital', 
      name: 'Tikur Anbessa Hospital', 
      lat: 9.0366, 
      lng: 38.7639, 
      icon: '🏥',
      phone: '+251-11-551-7211'
    },
    { 
      type: 'Hospital', 
      name: 'Black Lion Hospital', 
      lat: 9.0415, 
      lng: 38.7614, 
      icon: '🏥',
      phone: '+251-11-553-5370'
    },
    { 
      type: 'Hospital', 
      name: 'Bethzatha General Hospital', 
      lat: 9.0200, 
      lng: 38.7800, 
      icon: '🏥',
      phone: '+251-11-661-5544'
    },
    { 
      type: 'Police', 
      name: 'Federal Police HQ', 
      lat: 9.0300, 
      lng: 38.7400, 
      icon: '🚔',
      phone: '+251-11-551-8877'
    },
    { 
      type: 'Police', 
      name: 'Addis Ababa Police', 
      lat: 9.0250, 
      lng: 38.7550, 
      icon: '🚔',
      phone: '+251-11-551-2400'
    },
    { 
      type: 'Fire Station', 
      name: 'Addis Fire & Emergency Service', 
      lat: 9.0250, 
      lng: 38.7500, 
      icon: '🚒',
      phone: '+251-11-551-1311'
    },
    { 
      type: 'Fire Station', 
      name: 'Bole Fire Station', 
      lat: 8.9950, 
      lng: 38.8100, 
      icon: '🚒',
      phone: '+251-11-661-5544'
    },
    { 
      type: 'Emergency', 
      name: 'Ethiopian Red Cross', 
      lat: 9.0100, 
      lng: 38.7650, 
      icon: '🆘',
      phone: '+251-11-551-5393'
    }
  ];

  const handleEmergencyCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

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

      const marker = L.marker([location.lat, location.lng], { icon: emergencyIcon })
        .addTo(markersGroup.current!);

      // Create popup content with call button
      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div style="text-align: center; max-width: 200px;">
          <strong>${location.name}</strong><br>
          <small>${location.type}</small><br>
          <button id="call-${location.name.replace(/\s+/g, '-')}" 
                  style="background: #16a34a; color: white; border: none; padding: 8px 16px; border-radius: 6px; margin-top: 8px; cursor: pointer; font-size: 12px;">
            📞 Call ${location.phone}
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Add click event to call button after popup opens
      marker.on('popupopen', () => {
        const callButton = document.getElementById(`call-${location.name.replace(/\s+/g, '-')}`);
        if (callButton) {
          callButton.addEventListener('click', () => {
            handleEmergencyCall(location.phone);
          });
        }
      });
    });

  }, [services, userLocation, distanceFilter]);

  return (
    <div className="relative">
      <div className="h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
        <div ref={mapContainer} className="h-full w-full" />
      </div>
      
      {/* Emergency Stations List */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          🆘 Emergency Contacts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {emergencyLocations.map((location, index) => (
            <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{location.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-800">{location.name}</h4>
                  <p className="text-sm text-gray-600">{location.type}</p>
                </div>
              </div>
              <button
                onClick={() => handleEmergencyCall(location.phone)}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                📞 {location.phone}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
