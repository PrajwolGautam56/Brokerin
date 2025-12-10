import { useState, useEffect } from 'react';
import logger from '../../utils/logger';
import { adminService } from '../../services/adminService';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'business', name: 'Business Settings' },
  { id: 'notifications', name: 'Notifications' },
  { id: 'userManagement', name: 'User Management' },
  { id: 'content', name: 'Content Management' },
  { id: 'analytics', name: 'Analytics & Tracking' },
];

function Settings() {
  const [activeTab, setActiveTab] = useState('business');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState(null);
  const [testEmailResult, setTestEmailResult] = useState(null);
  const [testPaymentResult, setTestPaymentResult] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getSettings();
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        throw new Error(response.message || 'Failed to load settings');
      }
    } catch (error) {
      logger.error('Error fetching settings:', error);
      
      // Provide more detailed error messages
      let errorMessage = 'Failed to fetch settings';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 404) {
          // Backend route doesn't exist yet - use default settings as fallback
          logger.warn('Settings endpoint not found, using default settings');
          setSettings(getDefaultSettings());
          setError(null); // Clear error since we're using fallback
          return; // Exit early with default settings
        } else if (status === 401) {
          errorMessage = 'Unauthorized (401). Please log in as an admin user.';
        } else if (status === 403) {
          errorMessage = 'Forbidden (403). You do not have admin privileges.';
        } else if (status === 500) {
          errorMessage = 'Server error (500). Please check backend logs.';
        } else if (data?.message) {
          errorMessage = data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please ensure:\n' +
          '1. Backend server is running\n' +
          '2. API endpoint /api/admin/settings exists';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Default settings fallback when backend route doesn't exist
  const getDefaultSettings = () => ({
    system: {
      emailProvider: 'smtp',
      paymentGateway: 'razorpay',
      cloudinaryEnabled: true,
      googleAuthEnabled: true
    },
    business: {
      companyName: 'BrokerIn',
      contactEmail: '',
      contactPhone: '',
      address: '',
      businessHours: '9 AM - 6 PM',
      timezone: 'Asia/Kolkata'
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      reminderSchedule: {
        paymentReminders: 'daily',
        serviceReminders: 'daily',
        time: '09:00'
      }
    },
    userManagement: {
      requireEmailVerification: true,
      requirePhoneVerification: false,
      passwordMinLength: 8,
      sessionTimeout: 24
    },
    content: {
      homepageBanners: [],
      featuredProperties: [],
      featuredFurniture: []
    },
    analytics: {
      googleAnalyticsId: '',
      facebookPixelId: ''
    }
  });

  const handleSettingChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedSettingChange = (section, nestedKey, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedKey]: {
          ...prev[section][nestedKey],
          [field]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const response = await adminService.updateSettings(settings);
      if (response.success) {
        toast.success('Settings saved successfully');
      } else {
        throw new Error(response.message || 'Failed to save settings');
      }
    } catch (error) {
      logger.error('Error saving settings:', error);
      setError(error.message || 'Failed to save settings');
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setTestEmailResult(null);
      const testData = {
        to: settings?.business?.contactEmail || 'test@example.com',
        subject: 'Test Email from BrokerIn',
        message: 'This is a test email to verify your email configuration.'
      };
      const response = await adminService.testEmail(testData);
      if (response.success) {
        setTestEmailResult({ success: true, message: 'Test email sent successfully!' });
        toast.success('Test email sent successfully');
      } else {
        throw new Error(response.message || 'Failed to send test email');
      }
    } catch (error) {
      logger.error('Error testing email:', error);
      setTestEmailResult({ success: false, message: error.message || 'Failed to send test email' });
      toast.error(error.message || 'Failed to send test email');
    }
  };

  const handleTestPayment = async () => {
    try {
      setTestPaymentResult(null);
      const testData = {
        amount: 100,
        currency: 'INR'
      };
      const response = await adminService.testPayment(testData);
      if (response.success) {
        setTestPaymentResult({ success: true, message: 'Payment gateway test successful!' });
        toast.success('Payment gateway test successful');
      } else {
        throw new Error(response.message || 'Failed to test payment gateway');
      }
    } catch (error) {
      logger.error('Error testing payment:', error);
      setTestPaymentResult({ success: false, message: error.message || 'Failed to test payment gateway' });
      toast.error(error.message || 'Failed to test payment gateway');
    }
  };

  const renderBusinessSettings = () => {
    if (!settings?.business) {
      return (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
          Business settings not available
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <input
                type="text"
                value={settings.business.companyName || ''}
                onChange={(e) => handleSettingChange('business', 'companyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <input
                type="email"
                value={settings.business.contactEmail || ''}
                onChange={(e) => handleSettingChange('business', 'contactEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
              <input
                type="tel"
                value={settings.business.contactPhone || ''}
                onChange={(e) => handleSettingChange('business', 'contactPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={settings.business.address || ''}
                onChange={(e) => handleSettingChange('business', 'address', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Hours</label>
              <input
                type="text"
                value={settings.business.businessHours || ''}
                onChange={(e) => handleSettingChange('business', 'businessHours', e.target.value)}
                placeholder="9 AM - 6 PM"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <input
                type="text"
                value={settings.business.timezone || ''}
                onChange={(e) => handleSettingChange('business', 'timezone', e.target.value)}
                placeholder="Asia/Kolkata"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNotificationSettings = () => {
    if (!settings?.notifications) {
      return (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
          Notification settings not available
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                <p className="text-xs text-gray-500">Enable email notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.emailEnabled || false}
                onChange={(e) => handleSettingChange('notifications', 'emailEnabled', e.target.checked)}
                className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                <p className="text-xs text-gray-500">Enable SMS notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.smsEnabled || false}
                onChange={(e) => handleSettingChange('notifications', 'smsEnabled', e.target.checked)}
                className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Reminder Schedule</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Reminders</label>
              <select
                value={settings.notifications.reminderSchedule?.paymentReminders || 'daily'}
                onChange={(e) => handleNestedSettingChange('notifications', 'reminderSchedule', 'paymentReminders', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Reminders</label>
              <select
                value={settings.notifications.reminderSchedule?.serviceReminders || 'daily'}
                onChange={(e) => handleNestedSettingChange('notifications', 'reminderSchedule', 'serviceReminders', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Time</label>
              <input
                type="time"
                value={settings.notifications.reminderSchedule?.time || '09:00'}
                onChange={(e) => handleNestedSettingChange('notifications', 'reminderSchedule', 'time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Test Email</h3>
          <button
            onClick={handleTestEmail}
            className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700"
          >
            Send Test Email
          </button>
          {testEmailResult && (
            <div className={`mt-4 flex items-center space-x-2 ${
              testEmailResult.success ? 'text-green-600' : 'text-red-600'
            }`}>
              {testEmailResult.success ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                <XCircleIcon className="h-5 w-5" />
              )}
              <span>{testEmailResult.message}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderUserManagementSettings = () => {
    if (!settings?.userManagement) {
      return (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
          User management settings not available
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Verification Requirements</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Require Email Verification</label>
                <p className="text-xs text-gray-500">Users must verify their email address</p>
              </div>
              <input
                type="checkbox"
                checked={settings.userManagement.requireEmailVerification || false}
                onChange={(e) => handleSettingChange('userManagement', 'requireEmailVerification', e.target.checked)}
                className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Require Phone Verification</label>
                <p className="text-xs text-gray-500">Users must verify their phone number</p>
              </div>
              <input
                type="checkbox"
                checked={settings.userManagement.requirePhoneVerification || false}
                onChange={(e) => handleSettingChange('userManagement', 'requirePhoneVerification', e.target.checked)}
                className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Password Policy</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Password Length</label>
              <input
                type="number"
                value={settings.userManagement.passwordMinLength || 8}
                onChange={(e) => handleSettingChange('userManagement', 'passwordMinLength', parseInt(e.target.value))}
                min="6"
                max="32"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (hours)</label>
              <input
                type="number"
                value={settings.userManagement.sessionTimeout || 24}
                onChange={(e) => handleSettingChange('userManagement', 'sessionTimeout', parseInt(e.target.value))}
                min="1"
                max="168"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContentSettings = () => {
    if (!settings?.content) {
      return (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
          Content settings not available
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Content Management</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Homepage Banners</label>
              <p className="text-xs text-gray-500 mb-2">Manage homepage banner images</p>
              <p className="text-sm text-gray-600">
                {settings.content.homepageBanners?.length || 0} banner(s) configured
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured Properties</label>
              <p className="text-xs text-gray-500 mb-2">Properties to feature on homepage</p>
              <p className="text-sm text-gray-600">
                {settings.content.featuredProperties?.length || 0} property(ies) featured
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured Furniture</label>
              <p className="text-xs text-gray-500 mb-2">Furniture items to feature on homepage</p>
              <p className="text-sm text-gray-600">
                {settings.content.featuredFurniture?.length || 0} item(s) featured
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalyticsSettings = () => {
    if (!settings?.analytics) {
      return (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
          Analytics settings not available
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tracking & Analytics</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
              <input
                type="text"
                value={settings.analytics.googleAnalyticsId || ''}
                onChange={(e) => handleSettingChange('analytics', 'googleAnalyticsId', e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Pixel ID</label>
              <input
                type="text"
                value={settings.analytics.facebookPixelId || ''}
                onChange={(e) => handleSettingChange('analytics', 'facebookPixelId', e.target.value)}
                placeholder="123456789012345"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'business':
        return renderBusinessSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'userManagement':
        return renderUserManagementSettings();
      case 'content':
        return renderContentSettings();
      case 'analytics':
        return renderAnalyticsSettings();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <h3 className="font-semibold mb-2">Error Loading Settings</h3>
          <p className="whitespace-pre-line text-sm">{error}</p>
          <div className="mt-4 pt-4 border-t border-red-200">
            <p className="text-xs font-medium mb-2">Troubleshooting Steps:</p>
            <ul className="text-xs list-disc list-inside space-y-1">
              <li>Ensure backend server is running</li>
              <li>Check that you're logged in as an admin user</li>
              <li>Verify the route /api/admin/settings exists</li>
              <li>Check browser console for detailed error logs</li>
            </ul>
            <button
              onClick={fetchSettings}
              className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage system configuration and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && settings && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="whitespace-pre-line text-sm">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? 'border-violet-500 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {settings ? renderContent() : (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
          No settings available
        </div>
      )}
    </div>
  );
}

export default Settings;

