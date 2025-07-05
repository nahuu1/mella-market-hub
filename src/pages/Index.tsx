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
import { List, MapPin, Plus, Search, Star, Users, Calendar, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { ads, loading, searchAds } = useRealTimeAds();
  const [selectedCategory, setSelectedCategory] = useLocalStorage('selectedCategory', 'all');
  const [distanceFilter, setDistanceFilter] = useLocalStorage('distanceFilter', 5);
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
  const [userLocation, setUserLocation] = useState({ lat: 9.0320, lng: 38.7469 });

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
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    }
  }, []);

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
    }).filter(service => service.distance <= distanceFilter);
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
  };

  const handleCloseAdForm = () => {
    setShowAdForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onPostAd={handlePostAd} />
      
      {!selectedMessageUser && (
        <>
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl p-6 text-white relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Discover</h2>
                  <Search className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-purple-100 mb-6">Your next adventure awaits</p>
                
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Where do you want to go?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <Search className="absolute right-3 top-3 w-5 h-5 text-white/70" />
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Featured Destinations</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                      <img src="/placeholder.svg" alt="Bali" className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium">Bali, Indonesia</p>
                        <p className="text-sm text-purple-100">Tropical paradise with stunning beaches</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">4.8 (9.5k reviews)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl p-6 text-white relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Plan Your Trip</h2>
                  <Calendar className="w-8 h-8 opacity-80" />
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
                  <h3 className="font-semibold mb-2">Bali Adventure</h3>
                  <p className="text-sm text-blue-100 mb-2">March 15 - March 29, 2024</p>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">7 days</span>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-xl h-32 mb-4 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-white/60" />
                </div>

                <button
                  onClick={handlePostAd}
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white py-3 px-4 rounded-xl font-medium hover:bg-white/30 transition-colors"
                >
                  Add Activity
                </button>
              </div>

              <div className="bg-gradient-to-br from-pink-400 to-orange-400 rounded-3xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">My Trips</h2>
                  <Briefcase className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-pink-100 mb-6">Your travel memories & plans</p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">12</div>
                    <div className="text-sm text-pink-100">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">28</div>
                    <div className="text-sm text-pink-100">Cities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">156</div>
                    <div className="text-sm text-pink-100">Days</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                    <h4 className="font-medium mb-1">Current Trip</h4>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-3">
                      <p className="font-semibold">Bali Adventure</p>
                      <p className="text-xs text-blue-100">March 15 - March 22, 2024</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs">Trip Progress</span>
                        <span className="text-xs">Day 3 of 7</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-1 mt-1">
                        <div className="bg-white h-1 rounded-full" style={{ width: '43%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <SearchBar 
                onSearch={handleSearch}
                userLocation={userLocation}
              />
              
              {isSearching && (
                <div className="mt-4">
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <CategoryFilter
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                  />
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <DistanceFilter
                    distanceFilter={distanceFilter}
                    onDistanceChange={setDistanceFilter}
                  />
                </div>
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
                    <button
                      onClick={handlePostAd}
                      className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-6 py-3 rounded-xl hover:from-orange-500 hover:to-pink-500 transition-all duration-200 flex items-center gap-2 font-medium shadow-lg"
                    >
                      <Plus size={16} />
                      <span className="hidden sm:inline">Share Post</span>
                    </button>

                    <div className="flex bg-white rounded-xl shadow-lg overflow-hidden border">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                          viewMode === 'list'
                            ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <List size={20} />
                        <span className="hidden sm:inline">List View</span>
                      </button>
                      <button
                        onClick={() => setViewMode('map')}
                        className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                          viewMode === 'map'
                            ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <MapPin size={20} />
                        <span className="hidden sm:inline">Map View</span>
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
                      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <MapView
                          services={filteredServices}
                          userLocation={userLocation}
                          distanceFilter={distanceFilter}
                        />
                      </div>
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
