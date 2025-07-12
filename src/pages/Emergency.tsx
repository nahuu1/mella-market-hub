import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { Phone, Navigation, Clock, MapPin, Hospital, Shield, Pill, Stethoscope, ArrowLeft } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface EmergencyService {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'pharmacy' | 'police';
  address: string;
  phone: string;
  distance: number;
  isOpen: boolean;
  openHours: string;
  location: {
    lat: number;
    lng: number;
  };
}

const Emergency = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({ lat: 9.0320, lng: 38.7469 });
  const [selectedType, setSelectedType] = useState<string>('all');
  const [emergencyServices, setEmergencyServices] = useState<EmergencyService[]>([]);

  // Mock emergency services data for Addis Ababa
  const mockEmergencyServices: EmergencyService[] = [
    {
      id: '1',
      name: 'Black Lion Hospital',
      type: 'hospital',
      address: 'Churchill Ave, Addis Ababa',
      phone: '+251-11-551-7611',
      distance: 2.3,
      isOpen: true,
      openHours: '24/7',
      location: { lat: 9.0420, lng: 38.7469 }
    },
    {
      id: '2',
      name: 'St. Paul\'s Hospital',
      type: 'hospital',
      address: 'Gulele, Addis Ababa',
      phone: '+251-11-551-0231',
      distance: 4.1,
      isOpen: true,
      openHours: '24/7',
      location: { lat: 9.0620, lng: 38.7569 }
    },
    {
      id: '3',
      name: 'Ras Desta Clinic',
      type: 'clinic',
      address: 'Piazza, Addis Ababa',
      phone: '+251-11-551-2345',
      distance: 1.8,
      isOpen: true,
      openHours: '8:00 AM - 8:00 PM',
      location: { lat: 9.0370, lng: 38.7420 }
    },
    {
      id: '4',
      name: 'Alpha Pharmacy',
      type: 'pharmacy',
      address: 'Bole Road, Addis Ababa',
      phone: '+251-11-661-2890',
      distance: 3.2,
      isOpen: true,
      openHours: '6:00 AM - 10:00 PM',
      location: { lat: 9.0180, lng: 38.7889 }
    },
    {
      id: '5',
      name: 'Central Police Station',
      type: 'police',
      address: 'Churchill Ave, Addis Ababa',
      phone: '991',
      distance: 2.1,
      isOpen: true,
      openHours: '24/7',
      location: { lat: 9.0390, lng: 38.7449 }
    },
    {
      id: '6',
      name: 'Kirkos Police Station',
      type: 'police',
      address: 'Kirkos, Addis Ababa',
      phone: '991',
      distance: 3.5,
      isOpen: true,
      openHours: '24/7',
      location: { lat: 9.0120, lng: 38.7369 }
    },
    {
      id: '7',
      name: 'Bethzatha Hospital',
      type: 'hospital',
      address: 'CMC, Addis Ababa',
      phone: '+251-11-372-5050',
      distance: 5.2,
      isOpen: true,
      openHours: '24/7',
      location: { lat: 9.0020, lng: 38.7669 }
    },
    {
      id: '8',
      name: 'Unity Pharmacy',
      type: 'pharmacy',
      address: 'Mercato, Addis Ababa',
      phone: '+251-11-551-9876',
      distance: 2.7,
      isOpen: false,
      openHours: '8:00 AM - 6:00 PM',
      location: { lat: 9.0320, lng: 38.7369 }
    }
  ];

  useEffect(() => {
    // Get user's real-time location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Keep default location if geolocation fails
        }
      );
    }
    setEmergencyServices(mockEmergencyServices);
  }, []);

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return <Hospital size={20} className="text-red-500" />;
      case 'clinic':
        return <Stethoscope size={20} className="text-blue-500" />;
      case 'pharmacy':
        return <Pill size={20} className="text-green-500" />;
      case 'police':
        return <Shield size={20} className="text-gray-700" />;
      default:
        return <MapPin size={20} />;
    }
  };

  const getMarkerIcon = (type: string) => {
    const colors = {
      hospital: '#ef4444',
      clinic: '#3b82f6',
      pharmacy: '#22c55e',
      police: '#374151'
    };
    
    return L.divIcon({
      html: `<div style="background-color: ${colors[type as keyof typeof colors]}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      className: 'custom-marker'
    });
  };

  const filteredServices = selectedType === 'all' 
    ? emergencyServices 
    : emergencyServices.filter(service => service.type === selectedType);

  const sortedServices = filteredServices.sort((a, b) => a.distance - b.distance);

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleDirection = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lat},${lng}`, '_blank');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-red-50 to-orange-50 pb-4">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:bg-red-700 px-3 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-xl font-bold">🚨 Emergency Services</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Emergency Alert */}
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">!</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-red-800 font-medium">Emergency Hotlines</p>
              <p className="text-red-700 text-sm mt-1">
                Police: <a href="tel:991" className="font-bold underline">991</a> | 
                Ambulance: <a href="tel:907" className="font-bold underline">907</a> | 
                Fire: <a href="tel:939" className="font-bold underline">939</a>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Navigation size={20} className="text-red-500" />
                Nearby Emergency Services
              </h2>
            </div>
            <div className="h-80">
              <MapContainer
                center={[userLocation.lat, userLocation.lng] as LatLngExpression}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* User location marker */}
                <Marker position={[userLocation.lat, userLocation.lng] as LatLngExpression}>
                  <Popup>Your Location</Popup>
                </Marker>

                {/* Emergency service markers */}
                {filteredServices.map((service) => (
                  <Marker
                    key={service.id}
                    position={[service.location.lat, service.location.lng] as LatLngExpression}
                    icon={getMarkerIcon(service.type)}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold text-sm">{service.name}</h3>
                        <p className="text-xs text-gray-600 mb-2">{service.address}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCall(service.phone)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                          >
                            <Phone size={12} />
                            Call
                          </button>
                          <button
                            onClick={() => handleDirection(service.location.lat, service.location.lng)}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                          >
                            <Navigation size={12} />
                            Directions
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Services List */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Filter Services</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedType === 'all'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Services
                </button>
                <button
                  onClick={() => setSelectedType('hospital')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    selectedType === 'hospital'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Hospital size={16} />
                  Hospitals
                </button>
                <button
                  onClick={() => setSelectedType('clinic')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    selectedType === 'clinic'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Stethoscope size={16} />
                  Clinics
                </button>
                <button
                  onClick={() => setSelectedType('pharmacy')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    selectedType === 'pharmacy'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Pill size={16} />
                  Pharmacies
                </button>
                <button
                  onClick={() => setSelectedType('police')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    selectedType === 'police'
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Shield size={16} />
                  Police
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {sortedServices.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <MapPin size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>No emergency services found in this category</p>
                </div>
              ) : (
                sortedServices.map((service) => (
                  <div key={service.id} className="p-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        {getServiceIcon(service.type)}
                        <div>
                          <h3 className="font-semibold text-gray-800">{service.name}</h3>
                          <p className="text-sm text-gray-600">{service.address}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {service.distance} km away
                            </span>
                            <span className={`flex items-center gap-1 ${
                              service.isOpen ? 'text-green-600' : 'text-red-600'
                            }`}>
                              <Clock size={12} />
                              {service.isOpen ? 'Open' : 'Closed'} - {service.openHours}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleCall(service.phone)}
                        className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center gap-1"
                      >
                        <Phone size={14} />
                        Call
                      </button>
                      <button
                        onClick={() => handleDirection(service.location.lat, service.location.lng)}
                        className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-1"
                      >
                        <Navigation size={14} />
                        Get Directions
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emergency;
