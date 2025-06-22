
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { User, Star, MapPin, Edit, Plus, Award, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  bio: string;
  rating: number;
  total_ratings: number;
  profile_image_url: string;
}

interface UserAd {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

interface Certification {
  id: string;
  title: string;
  institution: string;
  description: string;
  issue_date: string;
  expiry_date: string;
  certificate_image_url: string;
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userAds, setUserAds] = useState<UserAd[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ads');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfile(profileData);
      }

      // Fetch user ads
      const { data: adsData, error: adsError } = await supabase
        .from('ads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (adsError) {
        console.error('Error fetching ads:', adsError);
      } else {
        setUserAds(adsData || []);
      }

      // Fetch certifications
      const { data: certsData, error: certsError } = await supabase
        .from('certifications')
        .select('*')
        .eq('user_id', user.id)
        .order('issue_date', { ascending: false });

      if (certsError) {
        console.error('Error fetching certifications:', certsError);
      } else {
        setCertifications(certsData || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative">
              {profile?.profile_image_url ? (
                <img
                  src={profile.profile_image_url}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-orange-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-orange-100 flex items-center justify-center border-4 border-orange-200">
                  <User size={48} className="text-orange-500" />
                </div>
              )}
              <button className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors">
                <Edit size={16} />
              </button>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {profile?.full_name || 'User Name'}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                {profile?.rating && profile.rating > 0 ? (
                  <div className="flex items-center gap-1">
                    <Star size={20} className="text-yellow-500 fill-current" />
                    <span className="font-medium">{profile.rating.toFixed(1)}</span>
                    <span className="text-gray-500">({profile.total_ratings} reviews)</span>
                  </div>
                ) : (
                  <span className="text-gray-500">No ratings yet</span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} />
                  <span>{profile?.email}</span>
                </div>
                {profile?.phone_number && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} />
                    <span>{profile.phone_number}</span>
                  </div>
                )}
              </div>

              {profile?.bio && (
                <p className="text-gray-700">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('ads')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'ads'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                My Ads ({userAds.length})
              </button>
              <button
                onClick={() => setActiveTab('certifications')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'certifications'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Certifications ({certifications.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'ads' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">My Ads</h2>
                  <button
                    onClick={() => navigate('/')}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Post New Ad
                  </button>
                </div>

                {userAds.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No ads posted yet</h3>
                    <p className="text-gray-600">Start by posting your first ad!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userAds.map((ad) => (
                      <div key={ad.id} className="bg-gray-50 rounded-lg p-4 border">
                        {ad.image_url && (
                          <img
                            src={ad.image_url}
                            alt={ad.title}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                        )}
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800">{ad.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            ad.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {ad.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{ad.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-orange-600">ETB {ad.price}</span>
                          <span className="text-xs text-gray-500">{ad.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'certifications' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Certifications</h2>
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                    <Plus size={16} />
                    Add Certification
                  </button>
                </div>

                {certifications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No certifications yet</h3>
                    <p className="text-gray-600">Add your certificates and qualifications to build trust!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="bg-gray-50 rounded-lg p-6 border">
                        <div className="flex items-start gap-4">
                          <div className="bg-orange-100 p-3 rounded-lg">
                            <Award size={24} className="text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-1">{cert.title}</h3>
                            {cert.institution && (
                              <p className="text-gray-600 mb-2">{cert.institution}</p>
                            )}
                            {cert.description && (
                              <p className="text-sm text-gray-600 mb-3">{cert.description}</p>
                            )}
                            <div className="text-xs text-gray-500">
                              {cert.issue_date && (
                                <span>Issued: {new Date(cert.issue_date).toLocaleDateString()}</span>
                              )}
                              {cert.expiry_date && (
                                <span className="ml-4">Expires: {new Date(cert.expiry_date).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
