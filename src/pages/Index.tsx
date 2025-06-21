
import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { SearchHero } from '@/components/SearchHero';
import { ServiceGrid } from '@/components/ServiceGrid';
import { MapView } from '@/components/MapView';
import { WorkerForm } from '@/components/WorkerForm';
import { LoginModal } from '@/components/LoginModal';
import { CategoryFilter } from '@/components/CategoryFilter';
import { DistanceFilter } from '@/components/DistanceFilter';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { MapPin, List } from 'lucide-react';

const Index = () => {
  const [isWorkerMode, setIsWorkerMode] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [distanceFilter, setDistanceFilter] = useState(10);
  const [services, setServices] = useLocalStorage('mella-services', []);
  const [userLocation, setUserLocation] = useState({ lat: 9.0245, lng: 38.7469 }); // Addis Ababa default

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied, using Addis Ababa as default');
        }
      );
    }
  }, []);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const withinDistance = service.distance <= distanceFilter;
    
    return matchesSearch && matchesCategory && withinDistance;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <Navbar 
        isWorkerMode={isWorkerMode}
        onToggleMode={() => setIsWorkerMode(!isWorkerMode)}
        onShowLogin={() => setShowLoginModal(true)}
        onShowWorkerForm={() => setShowWorkerForm(true)}
      />
      
      <SearchHero 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isWorkerMode={isWorkerMode}
      />

      <div className="container mx-auto px-4 py-8">
        {!isWorkerMode && (
          <>
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <CategoryFilter 
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
                <DistanceFilter 
                  distanceFilter={distanceFilter}
                  onDistanceChange={setDistanceFilter}
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMap(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    !showMap 
                      ? 'bg-orange-500 text-white shadow-lg' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <List size={20} />
                  List View
                </button>
                <button
                  onClick={() => setShowMap(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    showMap 
                      ? 'bg-orange-500 text-white shadow-lg' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <MapPin size={20} />
                  Map View
                </button>
              </div>
            </div>

            {showMap ? (
              <MapView 
                services={filteredServices}
                userLocation={userLocation}
                distanceFilter={distanceFilter}
              />
            ) : (
              <ServiceGrid services={filteredServices} />
            )}
          </>
        )}
      </div>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

      {showWorkerForm && (
        <WorkerForm 
          onClose={() => setShowWorkerForm(false)}
          userLocation={userLocation}
          onServiceAdded={(newService) => {
            setServices([...services, newService]);
            setShowWorkerForm(false);
          }}
        />
      )}
    </div>
  );
};

export default Index;
