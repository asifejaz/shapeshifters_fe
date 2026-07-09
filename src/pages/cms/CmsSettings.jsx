import { useState, useEffect } from 'react';
import api from '../../api';
import { Save, Plus, Trash2, X, Settings } from 'lucide-react';

export default function CmsSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newSetting, setNewSetting] = useState({ key: '', value: '', group: 'general', type: 'text', label: '' });

  const fetchSettings = () => {
    api.get('/cms-settings').then((res) => { setSettings(res.data); setLoading(false); });
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async () => {
    setSaving(true);
    await api.post('/cms-settings/bulk', {
      settings: settings.map((s) => ({ key: s.key, value: s.value, group: s.group, type: s.type, label: s.label })),
    });
    setSaving(false);
  };

  const handleNewSetting = async (e) => {
    e.preventDefault();
    await api.post('/cms-settings', newSetting);
    setNewSetting({ key: '', value: '', group: 'general', type: 'text', label: '' });
    setShowNew(false);
    fetchSettings();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this setting?')) return;
    await api.delete(`/cms-settings/${id}`);
    fetchSettings();
  };

  const updateSetting = (index, field, value) => {
    setSettings((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const groups = [...new Set(settings.map((s) => s.group))];

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none';

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-orange-500" /> Site Settings
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setShowNew(true)} className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Setting
          </button>
          <button onClick={handleSave} disabled={saving} className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      {showNew && (
        <form onSubmit={handleNewSetting} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">New Setting</h3>
            <button type="button" onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key *</label>
              <input type="text" value={newSetting.key} onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })} className={inputClass} placeholder="setting_key" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input type="text" value={newSetting.label} onChange={(e) => setNewSetting({ ...newSetting, label: e.target.value })} className={inputClass} placeholder="Display label" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
              <input type="text" value={newSetting.group} onChange={(e) => setNewSetting({ ...newSetting, group: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={newSetting.type} onChange={(e) => setNewSetting({ ...newSetting, type: e.target.value })} className={inputClass}>
                <option value="text">Text</option>
                <option value="textarea">Textarea</option>
                <option value="image">Image URL</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input type="text" value={newSetting.value} onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Add Setting</button>
          </div>
        </form>
      )}

      {groups.map((group) => (
        <div key={group} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 capitalize">{group}</h3>
          <div className="space-y-4">
            {settings.filter((s) => s.group === group).map((setting) => {
              const index = settings.indexOf(setting);
              return (
                <div key={setting.id} className="flex items-start gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{setting.label || setting.key}</label>
                    <p className="text-xs text-gray-400 mb-1 font-mono">{setting.key}</p>
                    {setting.type === 'textarea' ? (
                      <textarea value={setting.value || ''} onChange={(e) => updateSetting(index, 'value', e.target.value)} className={inputClass} rows="3" />
                    ) : (
                      <input type="text" value={setting.value || ''} onChange={(e) => updateSetting(index, 'value', e.target.value)} className={inputClass} />
                    )}
                  </div>
                  <button onClick={() => handleDelete(setting.id)} className="mt-7 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
