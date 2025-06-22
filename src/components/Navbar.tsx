
import React from 'react';
import { User, Briefcase, Plus, LogIn, LogOut, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';

interface NavbarProps {
  isWorkerMode: boolean;
  onToggleMode: () => void;
  onShowAdForm: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isWorkerMode,
  onToggleMode,
  onShowAdForm
}) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b-4 border-orange-400">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/')}
              className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              Mella
            </button>
            <span className="text-sm text-gray-600 hidden sm:block">
              Ethiopian Marketplace
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Mode Toggle - only show if user is authenticated */}
            {user && (
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
            )}

            {/* Worker Mode Actions - only show if user is authenticated */}
            {user && isWorkerMode && (
              <button
                onClick={onShowAdForm}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Post Ad</span>
              </button>
            )}

            {/* Notifications - only show if user is authenticated */}
            {user && (
              <button
                onClick={() => navigate('/notifications')}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Profile button - only show if user is authenticated */}
            {user && (
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
              >
                <User size={16} />
                <span className="hidden sm:inline">Profile</span>
              </button>
            )}

            {/* User info and Auth Button */}
            {user && (
              <span className="text-sm text-gray-600 hidden md:block">
                Welcome, {user.email}
              </span>
            )}
            
            <button
              onClick={handleAuthAction}
              className="flex items-center gap-2 border border-orange-500 text-orange-500 px-4 py-2 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
            >
              {user ? <LogOut size={16} /> : <LogIn size={16} />}
              <span className="hidden sm:inline">{user ? 'Logout' : 'Login'}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
