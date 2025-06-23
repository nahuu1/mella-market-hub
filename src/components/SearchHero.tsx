
import React from 'react';
import { Search, MapPin, Star } from 'lucide-react';

interface SearchHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isWorkerMode: boolean;
}

export const SearchHero: React.FC<SearchHeroProps> = ({
  searchQuery,
  onSearchChange,
  isWorkerMode
}) => {
  return (
    <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {isWorkerMode ? (
            <>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                Offer Your Services
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Connect with customers in your area and grow your business
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                  <MapPin size={16} />
                  <span>Local Customers</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Star size={16} />
                  <span>Build Reputation</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                Find Services Near You
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Discover local services and products in your neighborhood
              </p>
              
              <div className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search for services, products, or providers..."
                    className="w-full px-6 py-4 pr-14 text-gray-900 rounded-2xl shadow-xl border-0 focus:ring-4 focus:ring-white/30 focus:outline-none text-lg"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 p-3 rounded-xl hover:bg-green-700 transition-colors">
                    <Search size={20} className="text-white" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                  <MapPin size={16} />
                  <span>5-10km Radius</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Star size={16} />
                  <span>Verified Providers</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
