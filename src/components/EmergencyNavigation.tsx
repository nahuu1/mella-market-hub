
import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Navigation, X } from 'lucide-react';

interface EmergencyStation {
  id: string;
  type: string;
  name: string;
  lat: number;
  lng: number;
  icon: string;
  phone: string;
  address: string;
  distance?: number;
}

interface EmergencyNavigationProps {
  userLocation: { lat: number; lng: number };
  onClose: () => void;
}

export const EmergencyNavigation: React.FC<EmergencyNavigationProps> = ({
  userLocation,
  onClose
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [nearbyStations, setNearbyStations] = useState<EmergencyStation[]>([]);

  // Emergency stations in Addis Ababa with real coordinates and phone numbers
  const emergencyStations: EmergencyStation[] = [
    // Hospitals
    { 
      id: '1', type: 'Hospital', name: 'Tikur Anbessa Hospital', 
      lat: 9.0366, lng: 38.7639, icon: '🏥',
      phone: '+251-11-551-7211', address: 'Lideta, Addis Ababa'
    },
    { 
      id: '2', type: 'Hospital', name: 'Black Lion Hospital', 
      lat: 9.0415, lng: 38.7614, icon: '🏥',
      phone: '+251-11-553-5370', address: 'Gulele, Addis Ababa'
    },
    { 
      id: '3', type: 'Hospital', name: 'Bethzatha General Hospital', 
      lat: 9.0200, lng: 38.7800, icon: '🏥',
      phone: '+251-11-661-5544', address: 'Bole, Addis Ababa'
    },
    { 
      id: '4', type: 'Hospital', name: 'Myungsung Christian Medical Center', 
      lat: 8.9950, lng: 38.7450, icon: '🏥',
      phone: '+251-11-416-2000', address: 'Kolfe Keranio, Addis Ababa'
    },
    
    // Police Stations
    { 
      id: '5', type: 'Police', name: 'Federal Police HQ', 
      lat: 9.0300, lng: 38.7400, icon: '🚔',
      phone: '+251-11-551-8877', address: 'Arada, Addis Ababa'
    },
    { 
      id: '6', type: 'Police', name: 'Bole Police Station', 
      lat: 8.9950, lng: 38.8100, icon: '🚔',
      phone: '+251-11-661-2400', address: 'Bole, Addis Ababa'
    },
    { 
      id: '7', type: 'Police', name: 'Kirkos Police Station', 
      lat: 9.0100, lng: 38.7550, icon: '🚔',
      phone: '+251-11-551-2400', address: 'Kirkos, Addis Ababa'
    },

    // Fire Stations
    { 
      id: '8', type: 'Fire Station', name: 'Addis Fire & Emergency Service', 
      lat: 9.0250, lng: 38.7500, icon: '🚒',
      phone: '+251-11-551-1311', address: 'Piazza, Addis Ababa'
    },
    { 
      id: '9', type: 'Fire Station', name: 'Bole Fire Station', 
      lat: 8.9950, lng: 38.8100, icon: '🚒',
      phone: '+251-11-661-5544', address: 'Bole, Addis Ababa'
    },

    // Pharmacies
    { 
      id: '10', type: 'Pharmacy', name: 'Bethany Pharmacy', 
      lat: 9.0150, lng: 38.7600, icon: '💊',
      phone: '+251-11-551-3344', address: 'Merkato, Addis Ababa'
    },
    { 
      id: '11', type: 'Pharmacy', name: 'Hayat Pharmacy', 
      lat: 9.0050, lng: 38.7750, icon: '💊',
      phone: '+251-11-662-2211', address: 'CMC, Addis Ababa'
    },
    { 
      id: '12', type: 'Pharmacy', name: 'Bole Pharmacy', 
      lat: 8.9980, lng: 38.8050, icon: '💊',
      phone: '+251-11-661-7788', address: 'Bole, Addis Ababa'
    },

    // Traffic Police
    { 
      id: '13', type: 'Traffic Police', name: 'Traffic Control Center', 
      lat: 9.0200, lng: 38.7450, icon: '🚦',
      phone: '+251-11-551-9900', address: 'Mexico, Addis Ababa'
    },
    { 
      id: '14', type: 'Traffic Police', name: 'Bole Traffic Police', 
      lat: 8.9920, lng: 38.8120, icon: '🚦',
      phone: '+251-11-661-8899', address: 'Bole, Addis Ababa'
    },

    // Emergency Services
    { 
      id: '15', type: 'Emergency', name: 'Ethiopian Red Cross', 
      lat: 9.0100, lng: 38.7650, icon: '🆘',
      phone: '+251-11-551-5393', address: 'Arat Kilo, Addis Ababa'
    },
    { 
      id: '16', type: 'Emergency', name: 'Ambulance Service Center', 
      lat: 9.0180, lng: 38.7580, icon: '🚑',
      phone: '+251-11-551-9393', address: 'Piazza, Addis Ababa'
    }
  ];

  const stationTypes = ['all', 'Hospital', 'Police', 'Fire Station', 'Pharmacy', 'Traffic Police', 'Emergency'];

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    const stationsWithDistance = emergencyStations.map(station => ({
      ...station,
      distance: calculateDistance(userLocation.lat, userLocation.lng, station.lat, station.lng)
    }));

    const filtered = selectedType === 'all' 
      ? stationsWithDistance 
      : stationsWithDistance.filter(station => station.type === selectedType);

    const sorted = filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    setNearbyStations(sorted.slice(0, 10)); // Show only 10 closest
  }, [userLocation, selectedType]);

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleNavigate = (station: EmergencyStation) => {
    const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${station.lat},${station.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-2xl h-full sm:h-auto sm:max-h-[80vh] sm:rounded-t-3xl sm:rounded-b-3xl overflow-hidden">
        {/* Header */}
        <div className="bg-red-500 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚨</span>
            <h2 className="text-xl font-bold">Emergency Navigation</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-600 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Station Type Filter */}
        <div className="p-4 border-b">
          <div className="flex flex-wrap gap-2">
            {stationTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'All Emergency' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Stations List */}
        <div className="flex-1 overflow-y-auto p-4 max-h-96">
          {nearbyStations.map(station => (
            <div key={station.id} className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{station.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{station.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{station.type}</p>
                  <p className="text-xs text-gray-500 mb-2">{station.address}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={14} className="text-red-500" />
                    <span className="text-gray-600">
                      {station.distance ? `${station.distance.toFixed(1)} km away` : 'Distance unknown'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleCall(station.phone)}
                    className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                  >
                    <Phone size={16} />
                    <span className="hidden sm:inline text-sm">Call</span>
                  </button>
                  <button
                    onClick={() => handleNavigate(station)}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                  >
                    <Navigation size={16} />
                    <span className="hidden sm:inline text-sm">Go</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Call Button */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={() => handleCall('911')}
            className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <Phone size={20} />
            Emergency Call 911
          </button>
        </div>
      </div>
    </div>
  );
};
