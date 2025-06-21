
import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { SearchHero } from '@/components/SearchHero';
import { ServiceGrid } from '@/components/ServiceGrid';
import { MapView } from '@/components/MapView';
import { AdForm } from '@/components/AdForm';
import { CategoryFilter } from '@/components/CategoryFilter';
import { DistanceFilter } from '@/components/DistanceFilter';
import { useAuth } from '@/contexts/AuthContext';
import { useAds } from '@/hooks/useAds';
import { MapPin, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isWorkerMode, setIsWorkerMode] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showAdForm, setShowAdForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [distanceFilter, setDistanceFilter] = useState(10);
  const [userLocation, setUserLocation] = useState({ lat: 9.0245, lng: 38.7469 }); // Addis Ababa default

  const { ads, loading: adsLoading, addAd } = useAds();

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

  // Convert ads to service format for existing components
  const services = ads.map(ad => ({
    id: ad.id,
    title: ad.title,
    description: ad.description,
    price: ad.price,
    category: ad.category,
    provider: 'Ad Poster', // We can enhance this later with profile data
    rating: 4.5 + Math.random() * 0.5,
    distance: ad.location_lat && ad.location_lng ? 
      Math.sqrt(
        Math.pow(ad.location_lat - userLocation.lat, 2) + 
        Math.pow(ad.location_lng - userLocation.lng, 2)
      ) * 111 : // Rough km conversion
      Math.random() * 8 + 1,
    image: ad.image_url || `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop`,
    location: { 
      lat: ad.location_lat || userLocation.lat, 
      lng: ad.location_lng || userLocation.lng 
    }
  }));

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const withinDistance = service.distance <= distanceFilter;
    
    return matchesSearch && matchesCategory && withinDistance;
  });

  const handleShowAdForm = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setShowAdForm(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <Navbar 
        isWorkerMode={isWorkerMode}
        onToggleMode={() => setIsWorkerMode(!isWorkerMode)}
        onShowAdForm={handleShowAdForm}
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

            {adsLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading ads...</p>
              </div>
            ) : (
              <>
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
          </>
        )}

        {isWorkerMode && user && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Worker Dashboard</h2>
            <p className="text-gray-600 mb-8">Manage your ads and services from here</p>
            <button
              onClick={() => setShowAdForm(true)}
              className="bg-orange-500 text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition-colors font-medium text-lg"
            >
              Post Your First Ad
            </button>
          </div>
        )}

        {isWorkerMode && !user && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign in Required</h2>
            <p className="text-gray-600 mb-8">Please sign in to access the worker dashboard</p>
            <button
              onClick={() => navigate('/auth')}
              className="bg-orange-500 text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition-colors font-medium text-lg"
            >
              Sign In
            </button>
          </div>
        )}
      </div>

      {showAdForm && (
        <AdForm 
          onClose={() => setShowAdForm(false)}
          userLocation={userLocation}
          onAdAdded={addAd}
        />
      )}
    </div>
  );
};

export default Index;
