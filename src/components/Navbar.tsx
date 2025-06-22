
import React, { useState } from 'react';
import { User, Briefcase, Plus, LogIn, LogOut, Bell, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleAdForm = () => {
    onShowAdForm();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b-4 border-orange-400 sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={() => navigate('/')}
              className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              Mella
            </button>
            <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">
              Ethiopian Marketplace
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
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
                  Customer
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
                  Worker
                </button>
              </div>
            )}

            {/* Worker Mode Actions */}
            {user && isWorkerMode && (
              <button
                onClick={onShowAdForm}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Plus size={16} />
                Post Ad
              </button>
            )}

            {/* Notifications */}
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

            {/* Profile button */}
            {user && (
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
              >
                <User size={16} />
                Profile
              </button>
            )}

            {/* User info and Auth Button */}
            {user && (
              <span className="text-sm text-gray-600 hidden lg:block max-w-32 truncate">
                {user.email}
              </span>
            )}
            
            <button
              onClick={handleAuthAction}
              className="flex items-center gap-2 border border-orange-500 text-orange-500 px-4 py-2 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
            >
              {user ? <LogOut size={16} /> : <LogIn size={16} />}
              {user ? 'Logout' : 'Login'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-3">
              {/* Mode Toggle for Mobile */}
              {user && (
                <div className="flex items-center bg-gray-100 rounded-lg p-1 mx-2">
                  <button
                    onClick={() => { onToggleMode(); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all flex-1 justify-center ${
                      !isWorkerMode
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-gray-600'
                    }`}
                  >
                    <User size={16} />
                    Customer
                  </button>
                  <button
                    onClick={() => { onToggleMode(); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all flex-1 justify-center ${
                      isWorkerMode
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-gray-600'
                    }`}
                  >
                    <Briefcase size={16} />
                    Worker
                  </button>
                </div>
              )}

              {/* Worker Actions */}
              {user && isWorkerMode && (
                <button
                  onClick={handleAdForm}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors mx-2 w-auto btn-touch"
                >
                  <Plus size={16} />
                  Post Ad
                </button>
              )}

              {/* Navigation Links */}
              {user && (
                <>
                  <button
                    onClick={() => handleNavigation('/profile')}
                    className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors mx-2 w-auto btn-touch"
                  >
                    <User size={16} />
                    Profile
                  </button>
                  
                  <button
                    onClick={() => handleNavigation('/notifications')}
                    className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors mx-2 w-auto relative btn-touch"
                  >
                    <Bell size={16} />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-auto">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                </>
              )}

              {/* Auth Button */}
              <button
                onClick={handleAuthAction}
                className="flex items-center gap-2 border border-orange-500 text-orange-500 px-4 py-3 rounded-lg hover:bg-orange-500 hover:text-white transition-colors mx-2 w-auto justify-center btn-touch"
              >
                {user ? <LogOut size={16} /> : <LogIn size={16} />}
                {user ? 'Logout' : 'Login'}
              </button>

              {/* User Email */}
              {user && (
                <div className="px-4 py-2 text-sm text-gray-600 border-t border-gray-200 mt-3 pt-3">
                  Signed in as: {user.email}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
