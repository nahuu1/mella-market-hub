
import React, { useState } from 'react';
import { X, Upload, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WorkerFormProps {
  onClose: () => void;
  userLocation: { lat: number; lng: number };
  onServiceAdded: (service: any) => void;
}

const categories = [
  'Cleaning', 'Delivery', 'Tech Support', 'Home Repair', 'Tutoring',
  'Photography', 'Catering', 'Transportation', 'Beauty', 'Fitness'
];

export const WorkerForm: React.FC<WorkerFormProps> = ({ onClose, userLocation, onServiceAdded }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: categories[0],
    price: '',
    image: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to post a service.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrl = formData.image;

      // Upload image to Supabase storage if provided
      if (formData.image && formData.image.startsWith('data:')) {
        const fileName = `ad-${Date.now()}.jpg`;
        const base64Data = formData.image.split(',')[1];
        const blob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], { type: 'image/jpeg' });
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`ads/${fileName}`, blob);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(`ads/${fileName}`);
          imageUrl = publicUrl;
        }
      }

      // Insert ad into database
      const { data, error } = await supabase
        .from('ads')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          price: parseFloat(formData.price),
          image_url: imageUrl,
          location_lat: userLocation.lat + (Math.random() - 0.5) * 0.02,
          location_lng: userLocation.lng + (Math.random() - 0.5) * 0.02,
          user_id: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating ad:', error);
        toast({
          title: "Error",
          description: "Failed to post service. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Your service has been posted successfully!",
      });

      onServiceAdded(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to post service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, image: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Post a Service</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="e.g., Professional House Cleaning"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Describe your service in detail..."
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                disabled={loading}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (ETB)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="0.00"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={loading}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">Click to upload an image</p>
                <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
              </label>
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="mt-4 h-32 w-full object-cover rounded-lg"
                />
              )}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
            <MapPin size={20} className="text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Location Information</h4>
              <p className="text-sm text-blue-700">
                Your service will be visible to customers within 10km of your current location.
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Post Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
