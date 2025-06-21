
import React from 'react';
import { ServiceCard } from './ServiceCard';

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

interface ServiceGridProps {
  services: Service[];
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({ services }) => {
  if (services.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No services found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or distance filter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
};
