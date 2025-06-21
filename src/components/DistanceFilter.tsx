
import React from 'react';
import { MapPin } from 'lucide-react';

interface DistanceFilterProps {
  distanceFilter: number;
  onDistanceChange: (distance: number) => void;
}

export const DistanceFilter: React.FC<DistanceFilterProps> = ({
  distanceFilter,
  onDistanceChange
}) => {
  return (
    <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-3">
      <MapPin size={20} className="text-orange-500" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Within</span>
        <select
          value={distanceFilter}
          onChange={(e) => onDistanceChange(Number(e.target.value))}
          className="border-0 bg-transparent focus:ring-0 font-medium text-orange-600"
        >
          <option value={5}>5km</option>
          <option value={10}>10km</option>
          <option value={15}>15km</option>
          <option value={20}>20km</option>
        </select>
      </div>
    </div>
  );
};
