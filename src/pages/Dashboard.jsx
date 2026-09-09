import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Users, UserCheck, AlertTriangle, Clock, ScanLine, Building2 } from 'lucide-react';
import { formatDisplayDate } from '../utils/dateFormat';
import SubscriberNewTabLink from '../components/SubscriberNewTabLink';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then((res) => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Subscribers', value: data.total_subscribers, icon: Users, color: 'bg-blue-500' },
    { label: 'Active Members', value: data.active_subscribers, icon: UserCheck, color: 'bg-green-500' },
    { label: 'Expired', value: data.expired_subscribers, icon: AlertTriangle, color: 'bg-red-500', to: '/admin/subscribers?subscription_status=expired' },
    { label: 'Expiring Soon (7d)', value: data.expiring_soon, icon: Clock, color: 'bg-yellow-500', to: '/admin/subscribers?subscription_status=expiring_soon' },
    { label: "Today's Check-ins", value: data.todays_checkins, icon: ScanLine, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat}>
            <div className="flex items-center gap-3">
              <div className={`${stat.color} p-2.5 rounded-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </StatCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-500" />
            Branch Overview
          </h3>
          <div className="space-y-3">
            {data.branches.map((branch) => (
              <div key={branch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{branch.name}</span>
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                  {branch.subscribers_count} members
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent checkins */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-orange-500" />
            Recent Check-ins
          </h3>
          {data.recent_checkins.length === 0 ? (
            <p className="text-gray-500 text-sm">No check-ins today</p>
          ) : (
            <div className="space-y-2">
              {data.recent_checkins.map((checkin) => (
                <div key={checkin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <SubscriberNewTabLink subscriber={checkin.subscriber} className="font-medium text-gray-700 text-sm" />
                    <p className="text-xs text-gray-400">{checkin.branch?.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full capitalize">
                      {checkin.method}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(checkin.checked_in_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent subscribers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Subscribers</h3>
          <Link to="/admin/subscribers" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-500">Member ID</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Name</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Branch</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Session</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Expires</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_subscribers.map((sub) => (
                <tr key={sub.id} className="border-b border-gray-100">
                  <td className="py-2 px-3 font-mono text-xs">{sub.member_id}</td>
                  <td className="py-2 px-3"><SubscriberNewTabLink subscriber={sub} className="font-medium text-gray-700" /></td>
                  <td className="py-2 px-3 text-gray-500">{sub.branch?.name}</td>
                  <td className="py-2 px-3 capitalize text-gray-500">{sub.session}</td>
                  <td className="py-2 px-3 text-gray-500">{formatDisplayDate(sub.subscription_end)}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        sub.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : sub.status === 'expired'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ stat, children }) {
  const className = 'bg-white rounded-xl shadow-sm border border-gray-200 p-5 transition-all';

  if (stat.to) {
    return (
      <Link to={stat.to} className={`${className} block hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md`}>
        {children}
      </Link>
    );
  }

  return <div className={className}>{children}</div>;
}
