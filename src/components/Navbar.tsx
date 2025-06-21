
import React from 'react';
import { User, Briefcase, Plus, LogIn } from 'lucide-react';

interface NavbarProps {
  isWorkerMode: boolean;
  onToggleMode: () => void;
  onShowLogin: () => void;
  onShowWorkerForm: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isWorkerMode,
  onToggleMode,
  onShowLogin,
  onShowWorkerForm
}) => {
  return (
    <nav className="bg-white shadow-lg border-b-4 border-orange-400">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Mella
            </h1>
            <span className="text-sm text-gray-600 hidden sm:block">
              Ethiopian Marketplace
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={onToggleMode}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  !isWorkerMode
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <User size={16} />
                <span className="hidden sm:inline">Customer</span>
              </button>
              <button
                onClick={onToggleMode}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isWorkerMode
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Briefcase size={16} />
                <span className="hidden sm:inline">Worker</span>
              </button>
            </div>

            {/* Worker Mode Actions */}
            {isWorkerMode && (
              <button
                onClick={onShowWorkerForm}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Post Service</span>
              </button>
            )}

            {/* Login Button */}
            <button
              onClick={onShowLogin}
              className="flex items-center gap-2 border border-orange-500 text-orange-500 px-4 py-2 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">Login</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
