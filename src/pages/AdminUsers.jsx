import { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Edit, Trash2, X, Save, Shield, UserCog, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const roleLabels = { super_admin: 'Super Admin', admin: 'Admin', manager: 'Manager', staff: 'Staff' };
const roleColors = {
  super_admin: 'bg-red-100 text-red-700',
  admin: 'bg-orange-100 text-orange-700',
  manager: 'bg-blue-100 text-blue-700',
  staff: 'bg-gray-100 text-gray-700',
};

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const canAssignBranches = ['super_admin', 'admin'].includes(currentUser?.role);
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin', phone: '', is_active: true, branch_id: '' });
  const [errors, setErrors] = useState({});

  const fetchUsers = () => {
    api.get('/admin-users').then((res) => { setUsers(res.data); setLoading(false); });
  };

  useEffect(() => {
    fetchUsers();
    api.get('/branches').then((res) => setBranches(res.data));
  }, []);

  const resetForm = () => {
    setForm({ name: '', email: '', password: '', role: 'admin', phone: '', is_active: true, branch_id: '' });
    setEditing(null);
    setShowForm(false);
    setErrors({});
  };

  const handleEdit = (user) => {
    setForm({ name: user.name, email: user.email, password: '', role: user.role || 'admin', phone: user.phone || '', is_active: user.is_active !== false, branch_id: user.branch_id || '' });
    setEditing(user.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const payload = { ...form, branch_id: form.branch_id || null };
      if (editing && !payload.password) delete payload.password;
      if (editing) {
        await api.put(`/admin-users/${editing}`, payload);
      } else {
        await api.post('/admin-users', payload);
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {});
      else if (err.response?.status === 403) alert(err.response.data.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this admin user?')) return;
    try {
      await api.delete(`/admin-users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <UserCog className="w-5 h-5 text-orange-500" /> Admin Users
        </h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">{editing ? 'Edit User' : 'New Admin User'}</h3>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} required />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{editing ? 'New Password (leave blank to keep)' : 'Password *'}</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} required={!editing} />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputClass}>
                {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch (Location)</label>
              <select value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })} className={inputClass} disabled={!canAssignBranches}>
                {isSuperAdmin && <option value="">All Branches (Super Admin)</option>}
                {!isSuperAdmin && canAssignBranches && <option value="">Select Branch</option>}
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">{isSuperAdmin ? 'Leave empty for global access' : canAssignBranches ? 'Choose the user branch' : 'Assigned to your branch'}</p>
              {errors.branch_id && <p className="text-xs text-red-500 mt-1">{errors.branch_id[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-orange-600" /><span className="text-sm">Active</span></label>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <Save className="w-4 h-4" /> {editing ? 'Update' : 'Create'} User
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Role</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Branch</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-500">No admin users</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-800">{u.name}</td>
                <td className="py-3 px-4 text-gray-500">{u.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[u.role] || roleColors.admin}`}>
                    <Shield className="w-3 h-3 inline mr-1" />{roleLabels[u.role] || u.role || 'Admin'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {u.branch ? (
                    <span className="flex items-center gap-1 text-xs text-gray-600">
                      <Building2 className="w-3 h-3" />{u.branch.name}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">All Branches</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {u.is_active !== false ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(u)} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                    {u.id !== currentUser?.id && (
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
