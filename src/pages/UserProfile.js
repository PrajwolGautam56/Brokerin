import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { UserIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    nationality: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching user profile...');
      const response = await userService.getMyProfile();
      console.log('Profile response:', response);
      const profileData = response.data || response;
      setProfile(profileData);
      setFormData({
        fullName: profileData.fullName || '',
        phoneNumber: profileData.phoneNumber || '',
        nationality: profileData.nationality || ''
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      console.log('Updating profile with:', formData);
      const response = await userService.updateMyProfile(formData);
      console.log('Update response:', response);
      setProfile(response.data || response);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      // Update the profile data
      fetchProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your profile information</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Profile Card */}
        {profile && (
          <div className="bg-white rounded-lg shadow p-6">
            {!isEditing ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-20 w-20">
                      {profile.profilePicture ? (
                        <img className="h-20 w-20 rounded-full" src={profile.profilePicture} alt={profile.fullName} />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-violet-100 flex items-center justify-center">
                          <UserIcon className="h-12 w-12 text-violet-600" />
                        </div>
                      )}
                    </div>
                    <div className="ml-6">
                      <h2 className="text-2xl font-bold text-gray-900">{profile.fullName}</h2>
                      <p className="text-gray-600">@{profile.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600"
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900 mt-1">{profile.email}</p>
                  </div>
                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-gray-900 mt-1">{profile.phoneNumber || '-'}</p>
                  </div>
                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-sm text-gray-500">Nationality</p>
                    <p className="text-gray-900 mt-1">{profile.nationality || '-'}</p>
                  </div>
                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-sm text-gray-500">Role</p>
                    <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      profile.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {profile.role}
                    </span>
                  </div>
                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-sm text-gray-500">Verified</p>
                    <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      profile.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {profile.isVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-sm text-gray-500">Joined</p>
                    <p className="text-gray-900 mt-1">
                      {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Edit Profile</h3>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;

