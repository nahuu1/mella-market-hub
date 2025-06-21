
import React from 'react';
import { Star, MapPin, Clock, Heart } from 'lucide-react';
import { useState } from 'react';

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

interface ServiceCardProps {
  service: Service;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleBookService = () => {
    alert(`Booking request sent for "${service.title}" by ${service.provider}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-105">
      <div className="relative h-48 overflow-hidden">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          <Heart 
            size={16} 
            className={`transition-colors ${isLiked ? 'text-red-500 fill-current' : 'text-gray-600'}`} 
          />
        </button>
        <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          {service.category}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{service.title}</h3>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star size={16} className="fill-current" />
            <span className="text-sm font-medium text-gray-700">{service.rating}</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>
        
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>{service.distance.toFixed(1)}km away</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>Available now</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-gray-900">
            ETB {service.price.toLocaleString()}
            <span className="text-sm font-normal text-gray-500 ml-1">/service</span>
          </div>
          <button
            onClick={handleBookService}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Book Now
          </button>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600">by {service.provider}</p>
        </div>
      </div>
    </div>
  );
};
