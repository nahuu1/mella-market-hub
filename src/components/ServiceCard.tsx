
import React from 'react';
import { Star, MapPin, MessageCircle, User, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

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
  };
}

interface ServiceCardProps {
  service: Service;
  onBook?: (service: Service) => void;
  onMessage?: (userId: string, userName: string) => void;
  onUserProfileClick?: (userId: string) => void;
  onPostClick?: (service: Service) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  onBook, 
  onMessage, 
  onUserProfileClick,
  onPostClick
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleMessage = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    const userName = service.profiles?.full_name || service.provider || 'User';
    onMessage?.(service.user_id, userName);
  };

  const handleBook = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    onBook?.(service);
  };

  const handleUserProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('User profile clicked for user:', service.user_id);
    if (onUserProfileClick) {
      onUserProfileClick(service.user_id);
    }
  };

  const handlePostClick = () => {
    onPostClick?.(service);
  };

  const isOwnAd = user?.id === service.user_id;

  return (
    <div 
      className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100"
      onClick={handlePostClick}
    >
      <div className="relative">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-56 object-cover"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors">
            <Heart size={16} className="text-gray-600 hover:text-red-500 transition-colors" />
          </button>
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg">
            <span className="text-orange-600 font-bold text-sm">ETB {service.price.toLocaleString()}</span>
          </div>
        </div>
        <div className="absolute top-4 left-4">
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-medium">
            {service.category}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{service.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">{service.description}</p>
        
        {/* Provider Info */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl">
          {service.profiles?.profile_image_url ? (
            <img
              src={service.profiles.profile_image_url}
              alt={service.profiles.full_name}
              className="w-12 h-12 rounded-full object-cover cursor-pointer hover:ring-4 hover:ring-blue-200 transition-all border-2 border-white shadow-md"
              onClick={handleUserProfileClick}
            />
          ) : (
            <div 
              className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-md"
              onClick={handleUserProfileClick}
            >
              <User size={20} className="text-white" />
            </div>
          )}
          
          <div className="flex-1">
            <p 
              className="font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={handleUserProfileClick}
            >
              {service.profiles?.full_name || service.provider}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium text-gray-700">
                  {service.profiles?.rating?.toFixed(1) || service.rating.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin size={12} className="text-orange-500" />
                <span>{service.distance.toFixed(1)} km</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          {!isOwnAd && (
            <>
              <button
                onClick={handleMessage}
                className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3 px-4 rounded-2xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm"
              >
                <MessageCircle size={16} />
                Message
              </button>
              <button
                onClick={handleBook}
                className="flex-1 bg-gradient-to-r from-orange-400 to-pink-400 text-white py-3 px-4 rounded-2xl hover:from-orange-500 hover:to-pink-500 transition-all duration-200 font-medium shadow-lg"
              >
                Book Now
              </button>
            </>
          )}
          
          {isOwnAd && (
            <div className="w-full text-center py-3 px-4 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-2xl font-medium border border-green-200">
              Your Ad
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
