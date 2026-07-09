import { useState, useEffect } from 'react';
import api from '../../api';
import { Plus, Edit, Trash2, X, Save, GripVertical, ChevronDown, ChevronRight, Link as LinkIcon } from 'lucide-react';

export default function CmsMenus() {
  const [menus, setMenus] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [menuForm, setMenuForm] = useState({ name: '', location: '', is_active: true });
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({ label: '', type: 'page', url: '', page_id: '', target: '_self', icon: '', sort_order: 0, is_active: true, parent_id: '' });

  useEffect(() => {
    Promise.all([api.get('/cms-menus'), api.get('/cms-pages')]).then(([menuRes, pageRes]) => {
      setMenus(menuRes.data);
      setPages(pageRes.data);
      if (menuRes.data.length > 0) setSelectedMenu(menuRes.data[0]);
      setLoading(false);
    });
  }, []);

  const fetchMenus = () => {
    api.get('/cms-menus').then((res) => {
      setMenus(res.data);
      if (selectedMenu) {
        const updated = res.data.find((m) => m.id === selectedMenu.id);
        if (updated) setSelectedMenu(updated);
      }
    });
  };

  const resetMenuForm = () => {
    setMenuForm({ name: '', location: '', is_active: true });
    setEditingMenu(null);
    setShowMenuForm(false);
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    if (editingMenu) {
      await api.put(`/cms-menus/${editingMenu}`, menuForm);
    } else {
      await api.post('/cms-menus', menuForm);
    }
    resetMenuForm();
    fetchMenus();
  };

  const handleDeleteMenu = async (id) => {
    if (!window.confirm('Delete this menu and all its items?')) return;
    await api.delete(`/cms-menus/${id}`);
    if (selectedMenu?.id === id) setSelectedMenu(null);
    fetchMenus();
  };

  const resetItemForm = () => {
    setItemForm({ label: '', type: 'page', url: '', page_id: '', target: '_self', icon: '', sort_order: 0, is_active: true, parent_id: '' });
    setEditingItem(null);
    setShowItemForm(false);
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...itemForm, page_id: itemForm.page_id || null, parent_id: itemForm.parent_id || null };
    if (editingItem) {
      await api.put(`/cms-menus/${selectedMenu.id}/items/${editingItem}`, payload);
    } else {
      await api.post(`/cms-menus/${selectedMenu.id}/items`, payload);
    }
    resetItemForm();
    fetchMenus();
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this menu item?')) return;
    await api.delete(`/cms-menus/${selectedMenu.id}/items/${itemId}`);
    fetchMenus();
  };

  const handleEditItem = (item) => {
    setItemForm({
      label: item.label, type: item.type, url: item.url || '', page_id: item.page_id || '',
      target: item.target || '_self', icon: item.icon || '', sort_order: item.sort_order,
      is_active: item.is_active, parent_id: item.parent_id || '',
    });
    setEditingItem(item.id);
    setShowItemForm(true);
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none';

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" /></div>;
  }

  const renderItems = (items, depth = 0) => {
    if (!items || items.length === 0) return null;
    return items.map((item) => (
      <div key={item.id}>
        <div className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 ${depth > 0 ? 'ml-6 border-l-2 border-orange-200' : ''}`}>
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-300" />
            <LinkIcon className="w-3.5 h-3.5 text-gray-400" />
            <div>
              <span className="font-medium text-gray-800 text-sm">{item.label}</span>
              <span className="text-xs text-gray-400 ml-2">
                {item.type === 'page' ? (item.page?.title ? `Page: ${item.page.title}` : 'Page (unlinked)') : item.url}
              </span>
            </div>
            {!item.is_active && <span className="px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded text-[10px]">Hidden</span>}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => handleEditItem(item)} className="p-1 text-gray-400 hover:text-orange-600 rounded"><Edit className="w-3.5 h-3.5" /></button>
            <button onClick={() => handleDeleteItem(item.id)} className="p-1 text-gray-400 hover:text-red-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        {item.children && renderItems(item.children, depth + 1)}
      </div>
    ));
  };

  // Collect all items flat for parent_id dropdown
  const allItems = selectedMenu?.items ? selectedMenu.items.flatMap((i) => [i, ...(i.children || [])]) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-orange-500" /> Menu Manager
        </h2>
        <button onClick={() => { resetMenuForm(); setShowMenuForm(true); }} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Menu
        </button>
      </div>

      {/* Menu Form */}
      {showMenuForm && (
        <form onSubmit={handleMenuSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">{editingMenu ? 'Edit Menu' : 'New Menu'}</h3>
            <button type="button" onClick={resetMenuForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" value={menuForm.name} onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })} className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select value={menuForm.location} onChange={(e) => setMenuForm({ ...menuForm, location: e.target.value })} className={inputClass}>
                <option value="">None</option>
                <option value="header">Header</option>
                <option value="footer">Footer</option>
                <option value="sidebar">Sidebar</option>
              </select>
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2"><input type="checkbox" checked={menuForm.is_active} onChange={(e) => setMenuForm({ ...menuForm, is_active: e.target.checked })} className="accent-orange-600" /><span className="text-sm">Active</span></label>
              <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Menu List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-2">
          <h3 className="font-semibold text-gray-700 text-sm mb-3">Menus</h3>
          {menus.map((menu) => (
            <div
              key={menu.id}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                selectedMenu?.id === menu.id ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedMenu(menu)}
            >
              <div>
                <p className="font-medium text-sm text-gray-800">{menu.name}</p>
                <p className="text-xs text-gray-400">{menu.location || 'No location'} &bull; {menu.all_items?.length || menu.items?.length || 0} items</p>
              </div>
              <div className="flex gap-1">
                <button onClick={(e) => { e.stopPropagation(); setMenuForm({ name: menu.name, location: menu.location || '', is_active: menu.is_active }); setEditingMenu(menu.id); setShowMenuForm(true); }} className="p-1 text-gray-400 hover:text-orange-600"><Edit className="w-3.5 h-3.5" /></button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteMenu(menu.id); }} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Menu Items */}
        <div className="lg:col-span-3 space-y-4">
          {selectedMenu ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">{selectedMenu.name} &mdash; Items</h3>
                <button onClick={() => { resetItemForm(); setShowItemForm(true); }} className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>

              {showItemForm && (
                <form onSubmit={handleItemSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800 text-sm">{editingItem ? 'Edit Item' : 'New Menu Item'}</h4>
                    <button type="button" onClick={resetItemForm} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Label *</label>
                      <input type="text" value={itemForm.label} onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })} className={inputClass} required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                      <select value={itemForm.type} onChange={(e) => setItemForm({ ...itemForm, type: e.target.value })} className={inputClass}>
                        <option value="page">Link to Page</option>
                        <option value="url">Custom URL</option>
                      </select>
                    </div>
                    {itemForm.type === 'page' ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Page</label>
                        <select value={itemForm.page_id} onChange={(e) => setItemForm({ ...itemForm, page_id: e.target.value })} className={inputClass}>
                          <option value="">Select page</option>
                          {pages.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
                        <input type="text" value={itemForm.url} onChange={(e) => setItemForm({ ...itemForm, url: e.target.value })} className={inputClass} placeholder="https://..." />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Target</label>
                      <select value={itemForm.target} onChange={(e) => setItemForm({ ...itemForm, target: e.target.value })} className={inputClass}>
                        <option value="_self">Same Window</option>
                        <option value="_blank">New Window</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Parent</label>
                      <select value={itemForm.parent_id} onChange={(e) => setItemForm({ ...itemForm, parent_id: e.target.value })} className={inputClass}>
                        <option value="">Top Level</option>
                        {allItems.filter((i) => i.id !== editingItem).map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Sort Order</label>
                      <input type="number" value={itemForm.sort_order} onChange={(e) => setItemForm({ ...itemForm, sort_order: parseInt(e.target.value) || 0 })} className={inputClass} />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2"><input type="checkbox" checked={itemForm.is_active} onChange={(e) => setItemForm({ ...itemForm, is_active: e.target.checked })} className="accent-orange-600" /><span className="text-sm">Active</span></label>
                    </div>
                  </div>
                  <div className="flex justify-end mt-3">
                    <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Save className="w-4 h-4" /> {editingItem ? 'Update' : 'Add'} Item</button>
                  </div>
                </form>
              )}

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-2">
                {selectedMenu.items?.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">No menu items yet. Add one above.</p>
                ) : (
                  renderItems(selectedMenu.items)
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
              Select a menu from the left or create a new one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
