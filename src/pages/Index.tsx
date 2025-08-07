import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { SearchHero } from '@/components/SearchHero';
import { CategoryFilter } from '@/components/CategoryFilter';
import { DistanceFilter } from '@/components/DistanceFilter';
import { ServiceGrid } from '@/components/ServiceGrid';
import { MapView } from '@/components/MapView';
import { SearchBar } from '@/components/SearchBar';
import { BookingModal } from '@/components/BookingModal';
import { MessageThread } from '@/components/MessageThread';
import { UserProfileModal } from '@/components/UserProfile';
import { AdForm } from '@/components/AdForm';
import { PostModal } from '@/components/PostModal';
import { Footer } from '@/components/Footer';
import { useRealTimeAds } from '@/hooks/useRealTimeAds';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { List, MapPin, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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
  user_id: string;
  profiles?: {
    full_name: string;
    rating: number;
    profile_image_url: string;
    is_verified?: boolean;
    badges?: string[];
  };
}

const Index = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { ads, loading, searchAds } = useRealTimeAds();
  const [selectedCategory, setSelectedCategory] = useLocalStorage('selectedCategory', 'all');
  const [distanceFilter, setDistanceFilter] = useLocalStorage('distanceFilter', 5); // Default to 5km max
  const [viewMode, setViewMode] = useLocalStorage('viewMode', 'list');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedPost, setSelectedPost] = useState<Service | null>(null);
  const [selectedMessageUser, setSelectedMessageUser] = useState<{
    id: string;
    name: string;
    image?: string;
  } | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdForm, setShowAdForm] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: 9.0320, lng: 38.7469 }); // Default to Addis Ababa

  // Check if we need to open ad form from navigation state
  useEffect(() => {
    if (location.state?.openAdForm) {
      setShowAdForm(true);
      // Clear the state to prevent reopening on refresh
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  // Get user's real-time location
  useEffect(() => {
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
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    }
  }, []);

  // Transform ads data to match Service interface
  const transformAdsToServices = (adsData: any[]): Service[] => {
    return adsData.map(ad => {
      const distance = ad.location_lat && ad.location_lng 
        ? calculateDistance(userLocation.lat, userLocation.lng, ad.location_lat, ad.location_lng)
        : 0;
      
      return {
        id: ad.id,
        title: ad.title,
        description: ad.description,
        price: Number(ad.price),
        category: ad.category,
        provider: ad.profiles?.full_name || 'Unknown Provider',
        rating: ad.profiles?.rating || 0,
        distance: distance,
        image: ad.image_url || '/placeholder.svg',
        location: {
          lat: ad.location_lat || userLocation.lat,
          lng: ad.location_lng || userLocation.lng
        },
        user_id: ad.user_id,
        profiles: ad.profiles
      };
    }).filter(service => service.distance <= distanceFilter); // Only show posts within distance filter
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const services = transformAdsToServices(isSearching ? searchResults : ads);

  const filteredServices = services.filter(service => {
    const categoryMatch = selectedCategory === 'all' || service.category === selectedCategory;
    return categoryMatch;
  });

  const handleSearch = async (query: string, location?: { lat: number; lng: number }, radius?: number) => {
    setIsSearching(true);
    const results = await searchAds(query, location, radius);
    setSearchResults(results);
  };

  const clearSearch = () => {
    setIsSearching(false);
    setSearchResults([]);
  };

  const handlePostClick = (service: Service) => {
    setSelectedPost(service);
  };

  const handleBookService = (service: Service) => {
    setSelectedService(service);
  };

  const handleMessageUser = (userId: string, userName: string, userImage?: string) => {
    setSelectedMessageUser({ id: userId, name: userName, image: userImage });
  };

  const handleUserProfileClick = (userId: string) => {
    console.log('Opening user profile for:', userId);
    setSelectedUserProfile(userId);
  };

  const handleClosePost = () => {
    setSelectedPost(null);
  };

  const handleCloseBooking = () => {
    setSelectedService(null);
  };

  const handleCloseMessage = () => {
    setSelectedMessageUser(null);
  };

  const handleCloseUserProfile = () => {
    setSelectedUserProfile(null);
  };

  const handlePostAd = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to share a post.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    setShowAdForm(true);
  };

  const handleAdAdded = (newAd: any) => {
    setShowAdForm(false);
    toast({
      title: "Success!",
      description: "Your post has been shared successfully.",
    });
    // The real-time subscription will automatically update the ads list
  };

  const handleCloseAdForm = () => {
    setShowAdForm(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-orange-50 to-red-50 pb-4">
      <Navbar onPostAd={handlePostAd} />
      
      {!selectedMessageUser && (
        <>
          <SearchHero 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isWorkerMode={false}
          />
          
          <div className="container mx-auto px-4 py-8">
            <SearchBar 
              onSearch={handleSearch}
              userLocation={userLocation}
            />
            
            {isSearching && (
              <div className="mb-6">
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <span className="text-blue-800">
                    Showing search results ({searchResults.length} found)
                  </span>
                  <button
                    onClick={clearSearch}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
                <DistanceFilter
                  distanceFilter={distanceFilter}
                  onDistanceChange={setDistanceFilter}
                />
              </div>

              <div className="lg:col-span-3">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {isSearching ? 'Search Results' : 'Community Posts'}
                    <span className="text-lg font-normal text-gray-600 ml-2">
                      ({filteredServices.length} posts within {distanceFilter}km)
                    </span>
                  </h2>
                  
                  <div className="flex items-center gap-4">
                    {/* Post Ad Button */}
                    <button
                      onClick={handlePostAd}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 font-medium"
                    >
                      <Plus size={16} />
                      <span className="hidden sm:inline">Share Post</span>
                    </button>

                    {/* View Mode Toggle */}
                    <div className="flex bg-white rounded-lg shadow-md overflow-hidden">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                          viewMode === 'list'
                            ? 'bg-orange-500 text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <List size={20} />
                        <span className="hidden sm:inline">List View</span>
                        <span className="sm:hidden">List</span>
                      </button>
                      <button
                        onClick={() => setViewMode('map')}
                        className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                          viewMode === 'map'
                            ? 'bg-orange-500 text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <MapPin size={20} />
                        <span className="hidden sm:inline">Map View</span>
                        <span className="sm:hidden">Map</span>
                      </button>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading community posts...</p>
                  </div>
                ) : (
                  <>
                    {viewMode === 'list' ? (
                      <ServiceGrid 
                        services={filteredServices} 
                        onBook={handleBookService}
                        onMessage={handleMessageUser}
                        onUserProfileClick={handleUserProfileClick}
                        onPostClick={handlePostClick}
                      />
                    ) : (
                      <MapView
                        services={filteredServices}
                        userLocation={userLocation}
                        distanceFilter={distanceFilter}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {selectedMessageUser && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <MessageThread
              otherUserId={selectedMessageUser.id}
              otherUserName={selectedMessageUser.name}
              otherUserImage={selectedMessageUser.image}
              onBack={handleCloseMessage}
            />
          </div>
        </div>
      )}

      {selectedPost && (
        <PostModal
          isOpen={!!selectedPost}
          onClose={handleClosePost}
          post={selectedPost}
          onBook={() => {
            handleClosePost();
            handleBookService(selectedPost);
          }}
          onMessage={() => {
            handleClosePost();
            handleMessageUser(selectedPost.user_id, selectedPost.provider, selectedPost.profiles?.profile_image_url);
          }}
        />
      )}

      {selectedService && (
        <BookingModal
          service={selectedService}
          workerId={selectedService.user_id}
          onClose={handleCloseBooking}
        />
      )}

      {selectedUserProfile && (
        <UserProfileModal
          userId={selectedUserProfile}
          onClose={handleCloseUserProfile}
          onMessage={handleMessageUser}
        />
      )}

      {showAdForm && (
        <AdForm
          onClose={handleCloseAdForm}
          userLocation={userLocation}
          onAdAdded={handleAdAdded}
        />
      )}

      <Footer />
    </div>
  );
};

export default Index;
