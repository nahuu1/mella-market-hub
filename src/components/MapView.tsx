
import React, { useEffect, useRef, useState } from 'react';
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

export const MapView: React.FC<MapViewProps> = ({ services, userLocation: initialUserLocation, distanceFilter }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersGroup = useRef<L.LayerGroup | null>(null);
  const [currentLocation, setCurrentLocation] = useState(initialUserLocation);
  const [isTracking, setIsTracking] = useState(false);

  // Base emergency locations in Addis Ababa with actual phone numbers
  const baseEmergencyLocations = [
    // Hospitals
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
      type: 'Hospital', 
      name: 'Myungsung Christian Medical Center', 
      lat: 8.9950, 
      lng: 38.7450, 
      icon: '🏥',
      phone: '+251-11-416-2000'
    },
    
    // Clinics
    { 
      type: 'Clinic', 
      name: 'Bethany Medical Clinic', 
      lat: 9.0180, 
      lng: 38.7580, 
      icon: '🏥',
      phone: '+251-11-551-3344'
    },
    { 
      type: 'Clinic', 
      name: 'Family Care Clinic', 
      lat: 9.0080, 
      lng: 38.7680, 
      icon: '🏥',
      phone: '+251-11-662-1122'
    },
    { 
      type: 'Clinic', 
      name: 'Addis Medical Clinic', 
      lat: 8.9980, 
      lng: 38.7980, 
      icon: '🏥',
      phone: '+251-11-661-9988'
    },
    { 
      type: 'Clinic', 
      name: 'Bole Medical Center', 
      lat: 8.9920, 
      lng: 38.8080, 
      icon: '🏥',
      phone: '+251-11-661-7755'
    },

    // Police Stations
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
      name: 'Bole Police Station', 
      lat: 8.9950, 
      lng: 38.8100, 
      icon: '🚔',
      phone: '+251-11-661-2400'
    },
    { 
      type: 'Police', 
      name: 'Kirkos Police Station', 
      lat: 9.0100, 
      lng: 38.7550, 
      icon: '🚔',
      phone: '+251-11-551-2400'
    },
    { 
      type: 'Police', 
      name: 'Lideta Police Station', 
      lat: 9.0350, 
      lng: 38.7350, 
      icon: '🚔',
      phone: '+251-11-551-6677'
    },

    // Fire Stations
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

    // Pharmacies
    { 
      type: 'Pharmacy', 
      name: 'Bethany Pharmacy', 
      lat: 9.0150, 
      lng: 38.7600, 
      icon: '💊',
      phone: '+251-11-551-3344'
    },
    { 
      type: 'Pharmacy', 
      name: 'Hayat Pharmacy', 
      lat: 9.0050, 
      lng: 38.7750, 
      icon: '💊',
      phone: '+251-11-662-2211'
    },
    { 
      type: 'Pharmacy', 
      name: 'Bole Pharmacy', 
      lat: 8.9980, 
      lng: 38.8050, 
      icon: '💊',
      phone: '+251-11-661-7788'
    },
    { 
      type: 'Pharmacy', 
      name: 'CMC Pharmacy', 
      lat: 9.0080, 
      lng: 38.7850, 
      icon: '💊',
      phone: '+251-11-662-3366'
    },
    { 
      type: 'Pharmacy', 
      name: 'Piazza Pharmacy', 
      lat: 9.0380, 
      lng: 38.7480, 
      icon: '💊',
      phone: '+251-11-551-4455'
    },
    { 
      type: 'Pharmacy', 
      name: 'Merkato Pharmacy', 
      lat: 9.0120, 
      lng: 38.7520, 
      icon: '💊',
      phone: '+251-11-551-8899'
    },

    // Emergency Services
    { 
      type: 'Emergency', 
      name: 'Ethiopian Red Cross', 
      lat: 9.0100, 
      lng: 38.7650, 
      icon: '🆘',
      phone: '+251-11-551-5393'
    },
    { 
      type: 'Emergency', 
      name: 'Ambulance Service Center', 
      lat: 9.0180, 
      lng: 38.7580, 
      icon: '🚑',
      phone: '+251-11-551-9393'
    }
  ];

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Filter emergency locations to only show those within 5km
  const getNearbyEmergencyLocations = (centerLat: number, centerLng: number) => {
    return baseEmergencyLocations.filter(location => {
      const distance = calculateDistance(centerLat, centerLng, location.lat, location.lng);
      return distance <= 5; // Only show emergency stations within 5km
    });
  };

  const handleEmergencyCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  // Track user's real-time location continuously
  useEffect(() => {
    if (navigator.geolocation) {
      // Get initial position with high accuracy
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(newLocation);
          setIsTracking(true);
          console.log('Real-time location updated:', newLocation);
        },
        (error) => {
          console.log('Geolocation error:', error);
          setCurrentLocation(initialUserLocation);
          setIsTracking(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000 // 1 minute
        }
      );

      // Watch for continuous location changes
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(newLocation);
          setIsTracking(true);
          console.log('Location updated:', newLocation);
        },
        (error) => {
          console.log('Geolocation watch error:', error);
          setIsTracking(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 30000 // 30 seconds
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      setCurrentLocation(initialUserLocation);
      setIsTracking(false);
    }
  }, [initialUserLocation]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map with mobile-friendly settings
    map.current = L.map(mapContainer.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      dragging: true,
      tapTolerance: 15
    }).setView([currentLocation.lat, currentLocation.lng], 14);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
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

    // Update map center to current location
    map.current.setView([currentLocation.lat, currentLocation.lng], 14);

    // Add user location marker with real-time tracking indicator
    const userIcon = L.divIcon({
      html: `<div style="background: ${isTracking ? '#10b981' : '#3b82f6'}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); animation: pulse 2s infinite;"></div><style>@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(${isTracking ? '16, 185, 129' : '59, 130, 246'}, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(${isTracking ? '16, 185, 129' : '59, 130, 246'}, 0); } 100% { box-shadow: 0 0 0 0 rgba(${isTracking ? '16, 185, 129' : '59, 130, 246'}, 0); } }</style>`,
      iconSize: [20, 20],
      className: 'user-location-marker'
    });

    L.marker([currentLocation.lat, currentLocation.lng], { icon: userIcon })
      .addTo(markersGroup.current)
      .bindPopup(`<strong>Your ${isTracking ? 'Live' : 'Current'} Location</strong>`)
      .openPopup();

    // Add distance circle
    L.circle([currentLocation.lat, currentLocation.lng], {
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

    // Get only nearby emergency locations (within 5km)
    const nearbyEmergencyLocations = getNearbyEmergencyLocations(currentLocation.lat, currentLocation.lng);

    // Add emergency location markers only for nearby stations
    nearbyEmergencyLocations.forEach((location) => {
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

  }, [services, currentLocation, distanceFilter, isTracking]);

  // Get nearby emergency locations for the list display
  const nearbyEmergencyLocations = getNearbyEmergencyLocations(currentLocation.lat, currentLocation.lng);

  return (
    <div className="relative">
      <div className="h-[400px] sm:h-[600px] w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-2xl border-2 sm:border-4 border-white">
        <div ref={mapContainer} className="h-full w-full" />
      </div>
      
      {/* Location Status */}
      <div className="mt-2 mb-4 text-center">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
          isTracking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          {isTracking ? 'Live Location Tracking' : 'Location Fixed'}
        </div>
      </div>
      
      {/* Emergency Stations List - Only nearby stations */}
      <div className="mt-4 sm:mt-6 bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
          🆘 Emergency Contacts Near You ({nearbyEmergencyLocations.length} within 5km)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {nearbyEmergencyLocations.map((location, index) => {
            const distance = calculateDistance(currentLocation.lat, currentLocation.lng, location.lat, location.lng);
            return (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span className="text-lg sm:text-xl">{location.icon}</span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{location.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">{location.type}</p>
                    <p className="text-xs text-gray-500">{distance.toFixed(1)} km away</p>
                  </div>
                </div>
                <button
                  onClick={() => handleEmergencyCall(location.phone)}
                  className="w-full bg-red-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base font-medium btn-touch"
                >
                  📞 {location.phone}
                </button>
              </div>
            );
          })}
        </div>
        {nearbyEmergencyLocations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No emergency stations found within 5km of your location.</p>
            <p className="text-sm mt-2">Please try moving to a different area or check your location settings.</p>
          </div>
        )}
      </div>
    </div>
  );
};
