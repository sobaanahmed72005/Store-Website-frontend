import { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import { useSeo } from '../../hooks/useSeo';
import { useSiteSettings } from '../../store/siteSettingsStore';

export default function AdminBlog() {
  const { siteName } = useSiteSettings();
  useSeo({
    title: `Blog & Articles — Admin | ${siteName || 'IT Solutions'}`,
    noindex: true,
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Tech Guides',
    author: 'IT Solutions Tech Team',
    read_time: '5 min read',
    cover_image: '',
    excerpt: '',
    content: '',
    featured_product_ids: [],
    is_published: 1,
  });

  // Product selector helper state
  const [productSearch, setProductSearch] = useState('');
  const [foundProducts, setFoundProducts] = useState([]);
  const [searchingProducts, setSearchingProducts] = useState(false);

  const fetchPosts = useCallback(() => {
    setLoading(true);
    api
      .get(ENDPOINTS.BLOG.ADMIN_ALL, { auth: true })
      .then((data) => {
        if (data && Array.isArray(data.posts)) {
          setPosts(data.posts);
        }
      })
      .catch((err) => setError(err.message || 'Failed to load blog posts'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleOpenCreateModal = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      category: 'Security & Surveillance',
      author: 'IT Solutions Tech Team',
      read_time: '5 min read',
      cover_image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=1200&q=80',
      excerpt: '',
      content: '',
      featured_product_ids: [],
      is_published: 1,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = async (post) => {
    try {
      const fullPostData = await api.get(ENDPOINTS.BLOG.BY_SLUG(post.slug));
      if (fullPostData && fullPostData.post) {
        const p = fullPostData.post;
        let productIds = [];
        try {
          productIds = typeof p.featured_product_ids === 'string' ? JSON.parse(p.featured_product_ids) : p.featured_product_ids || [];
        } catch {
          productIds = [];
        }

        setEditingPost(p);
        setFormData({
          title: p.title || '',
          category: p.category || 'Tech Guides',
          author: p.author || 'IT Solutions Tech Team',
          read_time: p.read_time || '5 min read',
          cover_image: p.cover_image || '',
          excerpt: p.excerpt || '',
          content: p.content || '',
          featured_product_ids: Array.isArray(productIds) ? productIds : [],
          is_published: p.is_published ?? 1,
        });
        setShowModal(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch article details');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await api.del(ENDPOINTS.BLOG.ADMIN_DELETE(id), { auth: true });
      setSuccessMsg('Article deleted successfully');
      fetchPosts();
    } catch (err) {
      setError(err.message || 'Failed to delete article');
    }
  };

  const handleSearchProducts = async (e) => {
    e.preventDefault();
    if (!productSearch.trim()) return;
    setSearchingProducts(true);
    try {
      const res = await api.get(ENDPOINTS.PRODUCTS.SEARCH(productSearch.trim()));
      setFoundProducts(res.products || (Array.isArray(res) ? res : []));
    } catch (err) {
      console.error('Failed to search products:', err);
    } finally {
      setSearchingProducts(false);
    }
  };

  const handleAddProductToArticle = (productId) => {
    if (!formData.featured_product_ids.includes(productId)) {
      setFormData((prev) => ({
        ...prev,
        featured_product_ids: [...prev.featured_product_ids, productId],
      }));
    }
  };

  const handleRemoveProductFromArticle = (productId) => {
    setFormData((prev) => ({
      ...prev,
      featured_product_ids: prev.featured_product_ids.filter((id) => id !== productId),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in both Title and Content');
      return;
    }

    try {
      if (editingPost) {
        await api.put(ENDPOINTS.BLOG.ADMIN_UPDATE(editingPost.id), formData, { auth: true });
        setSuccessMsg('Article updated successfully!');
      } else {
        await api.post(ENDPOINTS.BLOG.ADMIN_CREATE, formData, { auth: true });
        setSuccessMsg('Article published successfully!');
      }
      setShowModal(false);
      fetchPosts();
    } catch (err) {
      setError(err.message || 'Failed to save article');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-heading">Blog &amp; Tech Buying Guides</h1>
          <p className="text-xs text-slate-500 mt-0.5">Publish articles, product comparisons, and SEO guides to drive organic search sales.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-[#0891b2] hover:bg-[#0e7490] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
        >
          <span>✏️ Create New Article</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex justify-between items-center">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} className="font-bold">✕</button>
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex justify-between items-center">
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="font-bold">✕</button>
        </div>
      )}

      {/* Posts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-xs text-slate-500">Loading articles...</div>
        ) : posts.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-3xl mb-2">📰</div>
            <h3 className="text-sm font-bold text-slate-700">No blog posts yet</h3>
            <p className="text-xs text-slate-500 mb-4">Click "Create New Article" to write your first tech buying guide.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Author</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Views</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 max-w-xs truncate">{p.title}</td>
                    <td className="p-3.5">
                      <span className="bg-sky-50 text-[#0c4a6e] px-2 py-0.5 rounded font-bold border border-sky-100 text-[11px]">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">{p.author}</td>
                    <td className="p-3.5">
                      {p.is_published ? (
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[11px] font-bold border border-emerald-200">
                          Published
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[11px] font-bold border border-amber-200">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-500">{p.views || 0}</td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <a
                        href={`/blog/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-[#0c4a6e] rounded text-[11px] font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-[11px] font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Post Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                {editingPost ? 'Edit Article' : 'Create New Tech Buying Guide'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Top 5 Best 4K CCTV Cameras in Pakistan (2026 Buying Guide)"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0891b2] outline-none font-semibold text-sm"
                />
              </div>

              {/* Grid 2 cols */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Security & Surveillance"
                    className="w-full p-2 rounded-lg border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Author Name</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="IT Solutions Tech Team"
                    className="w-full p-2 rounded-lg border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Read Time</label>
                  <input
                    type="text"
                    value={formData.read_time}
                    onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                    placeholder="5 min read"
                    className="w-full p-2 rounded-lg border border-slate-300 outline-none"
                  />
                </div>
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2 rounded-lg border border-slate-300 outline-none mb-1"
                />
                {formData.cover_image && (
                  <div className="h-24 w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={formData.cover_image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Excerpt (Summary for Google &amp; Cards)</label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief 2-line summary describing what readers will learn..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              {/* Attach Store Products Section */}
              <div className="bg-sky-50/70 p-3.5 rounded-xl border border-sky-200">
                <label className="block font-bold text-[#0c4a6e] mb-1">Featured Products Mentioned in Article (Product IDs)</label>
                <p className="text-[11px] text-slate-500 mb-2">Attached products will display buy cards directly inside the article page.</p>

                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Search product name..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="flex-1 p-2 rounded-lg border border-slate-300 outline-none bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleSearchProducts}
                    className="px-3 py-1.5 bg-[#0c4a6e] text-white rounded-lg font-bold hover:bg-[#0369a1]"
                  >
                    {searchingProducts ? 'Searching...' : 'Find Products'}
                  </button>
                </div>

                {foundProducts.length > 0 && (
                  <div className="bg-white p-2 rounded-lg border border-slate-200 max-h-36 overflow-y-auto mb-2 space-y-1">
                    {foundProducts.slice(0, 5).map((prod) => (
                      <div key={prod.id} className="flex items-center justify-between text-xs p-1 hover:bg-slate-50 rounded">
                        <span className="truncate font-semibold max-w-xs">{prod.name} (ID: {prod.id})</span>
                        <button
                          type="button"
                          onClick={() => handleAddProductToArticle(prod.id)}
                          className="px-2 py-0.5 bg-emerald-600 text-white rounded font-bold text-[10px]"
                        >
                          + Attach
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected IDs list */}
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {formData.featured_product_ids.map((id) => (
                    <span key={id} className="bg-white border border-sky-300 text-[#0c4a6e] font-bold px-2 py-0.5 rounded-md text-xs flex items-center gap-1">
                      Product #{id}
                      <button
                        type="button"
                        onClick={() => handleRemoveProductFromArticle(id)}
                        className="text-rose-500 hover:text-rose-700 font-bold"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Article Content HTML */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Article Content (Supports HTML Headings &amp; Paragraphs) *</label>
                <textarea
                  rows={10}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="<h2>Section Heading</h2><p>Article paragraph text...</p>"
                  className="w-full p-3 rounded-xl border border-slate-300 font-mono text-xs outline-none focus:ring-2 focus:ring-[#0891b2]"
                />
              </div>

              {/* Published toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={Boolean(formData.is_published)}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked ? 1 : 0 })}
                  className="w-4 h-4 text-[#0891b2] rounded focus:ring-[#0891b2]"
                />
                <label htmlFor="is_published" className="font-bold text-slate-800 cursor-pointer">
                  Publish article immediately on website
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0891b2] hover:bg-[#0e7490] text-white font-bold shadow"
                >
                  {editingPost ? 'Save Changes' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
