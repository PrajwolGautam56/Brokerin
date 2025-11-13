import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  ChatBubbleLeftIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  ShoppingBagIcon,
  KeyIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Properties', href: '/admin/properties', icon: BuildingOfficeIcon },
  { name: 'Furniture', href: '/admin/furniture', icon: ShoppingBagIcon },
  { name: 'Property Requests', href: '/admin/property-requests', icon: ClipboardDocumentListIcon },
  { name: 'Furniture Requests', href: '/admin/furniture-requests', icon: ClipboardDocumentListIcon },
  { name: 'Rental Management', href: '/admin/rentals', icon: KeyIcon },
  { name: 'Rental Dashboard', href: '/admin/rental-dashboard', icon: ChartBarIcon },
  { name: 'Transactions', href: '/admin/transactions', icon: CreditCardIcon },
  { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
  { name: 'Services', href: '/admin/services', icon: WrenchScrewdriverIcon },
  { name: 'Enquiries', href: '/admin/enquiries', icon: ChatBubbleLeftIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true }); // Go to home, don't redirect to login page
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-violet-700">
          <div className="flex items-center justify-between h-16 px-4 bg-violet-800">
            <Link to="/admin" className="text-white text-xl font-bold">
              Brokerin Admin
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  location.pathname === item.href
                    ? 'bg-violet-800 text-white'
                    : 'text-violet-100 hover:bg-violet-600'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-600 rounded-md"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-violet-700">
          <div className="flex items-center h-16 px-4 bg-violet-800">
            <Link to="/admin" className="text-white text-xl font-bold">
              Brokerin Admin
            </Link>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  location.pathname === item.href
                    ? 'bg-violet-800 text-white'
                    : 'text-violet-100 hover:bg-violet-600'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-600 rounded-md"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white shadow-sm lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 focus:outline-none"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <Link to="/admin" className="text-xl font-bold text-violet-700">
            Brokerin Admin
          </Link>
          <div className="w-6"></div>
        </div>
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout; 