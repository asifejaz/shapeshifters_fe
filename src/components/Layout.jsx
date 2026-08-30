import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Dumbbell,
  CreditCard,
  ScanLine,
  Receipt,
  BarChart3,
  LogOut,
  Menu,
  X,
  FileText,
  Link as LinkIcon,
  Settings,
  Image,
  Globe,
  UserCog,
  Router,
  Fingerprint,
  ClipboardList,
  ShoppingBag,
  Package,
  ShoppingCart,
} from 'lucide-react';

const gymNav = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/subscribers', label: 'Subscribers', icon: Users },
  { path: '/admin/branches', label: 'Branches', icon: Building2 },
  { path: '/admin/services', label: 'Packages', icon: Dumbbell },
  { path: '/admin/fee-plans', label: 'Fee Plans', icon: CreditCard },
  { path: '/admin/checkins', label: 'Check-ins', icon: ScanLine },
  { path: '/admin/payments', label: 'Payments', icon: Receipt },
];

const reportsNav = [
  { path: '/admin/reports/orders', label: 'Orders Report', icon: BarChart3 },
  { path: '/admin/reports/subscribers', label: 'Subscribers Report', icon: BarChart3 },
  { path: '/admin/reports/monthly', label: 'Monthly Report', icon: BarChart3 },
];

const biometricNav = [
  { path: '/admin/biometric/devices', label: 'ZKTeco Devices', icon: Router },
  { path: '/admin/biometric/enrollments', label: 'Enrollments', icon: Fingerprint },
  { path: '/admin/biometric/attendance', label: 'Attendance Logs', icon: ClipboardList },
];

const adminNav = [
  { path: '/admin/users', label: 'Admin Users', icon: UserCog },
];

const cmsNav = [
  { path: '/cms/pages', label: 'Pages', icon: FileText },
  { path: '/cms/menus', label: 'Menus & Links', icon: LinkIcon },
  { path: '/cms/sliders', label: 'Hero Sliders', icon: Image },
  { path: '/cms/posters', label: 'Posters', icon: Image },
  { path: '/cms/gallery', label: 'Photo Gallery', icon: Image },
  { path: '/cms/settings', label: 'Site Settings', icon: Settings },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isSuperAdmin = user?.role === 'super_admin';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
  };

  const allNav = [...gymNav, ...reportsNav, ...biometricNav, ...adminNav, ...cmsNav];
  const currentLabel = allNav.find((item) => isActive(item))?.label || 'Shape Shifters Gym';

  const renderNavItem = (item) => (
    <Link
      key={item.path}
      to={item.path}
      onClick={() => setSidebarOpen(false)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive(item)
          ? 'bg-orange-600 text-white'
          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
      }`}
    >
      <item.icon className="w-5 h-5 shrink-0" />
      {item.label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-7 h-7 text-orange-500" />
            <span className="text-lg font-bold tracking-tight">Shape Shifters</span>
          </div>
          <button className="lg:hidden text-gray-400" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto mt-4 px-2 space-y-1 pb-4">
          <p className="px-3 text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Gym Management</p>
          {gymNav.map(renderNavItem)}

          <div className="pt-4 mt-4 border-t border-gray-700">
            <p className="px-3 text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Reports</p>
            {reportsNav.map(renderNavItem)}
          </div>

          <div className="pt-4 mt-4 border-t border-gray-700">
            <p className="px-3 text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Biometric / ZKTeco</p>
            {biometricNav.map(renderNavItem)}
          </div>

          {(isSuperAdmin || user?.role === 'admin') && (
            <div className="pt-4 mt-4 border-t border-gray-700">
              <p className="px-3 text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Administration</p>
              {adminNav.map(renderNavItem)}
            </div>
          )}

          {isSuperAdmin && (
            <div className="pt-4 mt-4 border-t border-gray-700">
              <p className="px-3 text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Website CMS</p>
              {cmsNav.map(renderNavItem)}
            </div>
          )}

          {isSuperAdmin && (
            <div className="pt-4 mt-4 border-t border-gray-700">
              <p className="px-3 text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Shop</p>
              <Link to="/shop/categories" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                <Package className="w-5 h-5 shrink-0" /> Categories
              </Link>
              <Link to="/shop/products" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                <ShoppingBag className="w-5 h-5 shrink-0" /> Products
              </Link>
              <Link to="/shop/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                <ShoppingCart className="w-5 h-5 shrink-0" /> Orders
              </Link>
            </div>
          )}

          <div className="pt-4 mt-4 border-t border-gray-700">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <Globe className="w-5 h-5 shrink-0" />
              View Website
            </a>
          </div>
        </nav>

      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between gap-3 px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center min-w-0">
            <button
              className="lg:hidden mr-3 text-gray-600"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800 truncate">{currentLabel}</h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:block text-right leading-tight">
              <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
              <p className="mt-1 text-[10px] text-gray-500">
                <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${isSuperAdmin ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                  {user?.role?.replace('_', ' ') || 'admin'}
                </span>
                {user?.branch && <span className="ml-1.5">{user.branch.name}</span>}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white" title={user?.name || 'User'}>
              <UserCog className="h-4 w-4" />
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
