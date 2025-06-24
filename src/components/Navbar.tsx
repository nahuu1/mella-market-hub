
import React, { useState } from 'react';
import { Search, Menu, X, User, MessageCircle, Plus, Home } from 'lucide-react';
import { LoginModal } from './LoginModal';
import { WorkerForm } from './WorkerForm';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      setShowLoginModal(true);
    }
  };

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleMessagesClick = () => {
    if (user) {
      navigate('/messages');
    } else {
      setShowLoginModal(true);
    }
  };

  const handlePostServiceClick = () => {
    if (user) {
      setShowWorkerForm(true);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleServiceAdded = () => {
    setShowWorkerForm(false);
    // Refresh the page to show the new service
    window.location.reload();
  };

  // Default location for Addis Ababa
  const userLocation = { lat: 9.0320, lng: 38.7469 };

  return (
    <>
      <nav className="bg-white shadow-lg border-b-4 border-green-600 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="bg-green-600 text-white p-2 rounded-lg">
                <Search size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-800">Mella</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center space-x-1 text-gray-600 hover:text-green-700 transition-colors"
              >
                <Home size={20} />
                <span>Home</span>
              </button>
              
              <button 
                onClick={handleMessagesClick}
                className="flex items-center space-x-1 text-gray-600 hover:text-green-700 transition-colors"
              >
                <MessageCircle size={20} />
                <span>Messages</span>
              </button>

              <button 
                onClick={handlePostServiceClick}
                className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={20} />
                <span>Post Service</span>
              </button>
              
              <button 
                onClick={handleProfileClick}
                className="flex items-center space-x-1 text-gray-600 hover:text-green-700 transition-colors"
              >
                <User size={20} />
                <span>{user ? 'Profile' : 'Login'}</span>
              </button>
              
              {user && (
                <button 
                  onClick={handleAuthAction}
                  className="text-gray-600 hover:text-green-700 transition-colors"
                >
                  Logout
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4">
                <button 
                  onClick={() => {
                    navigate('/');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-gray-600 hover:text-green-700 transition-colors"
                >
                  <Home size={20} />
                  <span>Home</span>
                </button>
                
                <button 
                  onClick={() => {
                    handleMessagesClick();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-gray-600 hover:text-green-700 transition-colors"
                >
                  <MessageCircle size={20} />
                  <span>Messages</span>
                </button>

                <button 
                  onClick={() => {
                    handlePostServiceClick();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors w-fit"
                >
                  <Plus size={20} />
                  <span>Post Service</span>
                </button>
                
                <button 
                  onClick={() => {
                    handleProfileClick();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-gray-600 hover:text-green-700 transition-colors"
                >
                  <User size={20} />
                  <span>{user ? 'Profile' : 'Login'}</span>
                </button>
                
                {user && (
                  <button 
                    onClick={() => {
                      handleAuthAction();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-gray-600 hover:text-green-700 transition-colors"
                  >
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

      {showWorkerForm && (
        <WorkerForm 
          onClose={() => setShowWorkerForm(false)}
          userLocation={userLocation}
          onServiceAdded={handleServiceAdded}
        />
      )}
    </>
  );
};
