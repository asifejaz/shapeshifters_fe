import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import { Plus, Edit, Trash2, Eye, Globe, FileText } from 'lucide-react';

export default function CmsPages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPages = () => {
    api.get('/cms-pages').then((res) => { setPages(res.data); setLoading(false); });
  };

  useEffect(() => { fetchPages(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this page?')) return;
    await api.delete(`/cms-pages/${id}`);
    fetchPages();
  };

  const statusColor = (s) =>
    s === 'published' ? 'bg-green-100 text-green-700' :
    s === 'draft' ? 'bg-yellow-100 text-yellow-700' :
    'bg-gray-100 text-gray-500';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-orange-500" /> Website Pages
        </h2>
        <Link to="/cms/pages/new" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Page
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Title</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Slug</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Flags</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Order</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : pages.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-500">No pages yet</td></tr>
            ) : pages.map((page) => (
              <tr key={page.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{page.title}</span>
                    {page.is_homepage && (
                      <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-bold uppercase">Home</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-500 font-mono text-xs">/{page.slug}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor(page.status)}`}>
                    {page.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    {page.show_in_header && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px] font-medium">Header</span>}
                    {page.show_in_footer && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded text-[10px] font-medium">Footer</span>}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-500">{page.sort_order}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <a href={`/page/${page.slug}`} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Preview">
                      <Globe className="w-4 h-4" />
                    </a>
                    <button onClick={() => navigate(`/cms/pages/${page.id}/edit`)} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(page.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
