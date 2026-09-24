import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import CategoryMenu from '../components/CategoryMenu';
import Footer from '../components/Footer';
import { api } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { useSeo } from '../hooks/useSeo';
import { useSiteSettings } from '../store/siteSettingsStore';

export default function Blog() {
  const { siteName } = useSiteSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const activeCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';

  useSeo({
    title: `Tech Blog & Buying Guides | ${siteName || 'IT Solutions'} Pakistan`,
    description: `Expert tech buying guides, 4K CCTV camera reviews, Wi-Fi 6 router comparisons, and solar energy solutions for home & office in Pakistan.`,
    canonical: `${window.location.origin}/blog`,
    keywords: 'cctv camera buying guide pakistan, best wifi router pakistan, tech blog lahore, IT Solutions blog',
  });

  useEffect(() => {
    setLoading(true);
    const qsParams = new URLSearchParams();
    if (activeCategory) qsParams.set('category', activeCategory);
    if (searchQuery) qsParams.set('search', searchQuery);
    const page = searchParams.get('page') || '1';
    qsParams.set('page', page);

    api
      .get(ENDPOINTS.BLOG.LIST(`?${qsParams.toString()}`))
      .then((data) => {
        if (data && Array.isArray(data.posts)) {
          setPosts(data.posts);
          setCategories(data.categories || []);
          if (data.pagination) {
            setPagination(data.pagination);
          }
        }
      })
      .catch((err) => console.error('Failed to load blog posts:', err))
      .finally(() => setLoading(false));
  }, [activeCategory, searchQuery, searchParams]);

  const handleCategorySelect = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (cat === activeCategory || !cat) {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    params.delete('page');
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const query = formData.get('search')?.toString().trim();
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    params.delete('page');
    setSearchParams(params);
  };

  const heroPost = posts[0];
  const gridPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Header />
      <CategoryMenu />

      <main className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1">
        {/* Header Hero Section */}
        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-[#0c4a6e] to-[#0369a1] text-white p-6 sm:p-8 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block bg-[#0891b2]/30 text-sky-200 border border-sky-400/30 text-xs px-3 py-1 rounded-full font-semibold mb-3">
              📖 Knowledge &amp; Tech Hub
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-heading tracking-tight leading-tight text-white mb-2">
              Tech Guides &amp; Buying Advice
            </h1>
            <p className="text-sm sm:text-base text-sky-100 leading-relaxed">
              Expert advice, product comparisons, and step-by-step security &amp; networking guides tailored for homes and businesses in Pakistan.
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative z-10 w-full sm:w-auto min-w-[280px]">
            <div className="relative">
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search tech articles..."
                className="w-full bg-white/10 backdrop-blur-md text-white placeholder-sky-200/70 border border-white/20 rounded-xl py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 transition-all shadow-inner"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-200 hover:text-white transition-colors">
                🔍
              </button>
            </div>
          </form>

          {/* Abstract Glow circles */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Category Filter Pills */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
            <button
              onClick={() => handleCategorySelect('')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                !activeCategory
                  ? 'bg-[#0c4a6e] text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Articles
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-[#0c4a6e] text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-72 border border-slate-100 shadow-sm" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-lg mx-auto shadow-sm my-10">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No articles found</h3>
            <p className="text-sm text-slate-500 mb-4">Try clearing your search or picking a different category filter.</p>
            <button
              onClick={() => handleCategorySelect('')}
              className="px-5 py-2.5 bg-[#0891b2] text-white rounded-xl text-xs font-semibold hover:bg-[#0e7490] transition-colors shadow"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Featured First Post Card (Large) */}
            {heroPost && !searchQuery && !activeCategory && (
              <div className="mb-10 group">
                <Link
                  to={`/blog/${heroPost.slug}`}
                  className="grid grid-cols-1 lg:grid-cols-12 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="lg:col-span-7 relative min-h-[260px] sm:min-h-[340px] bg-slate-100 overflow-hidden">
                    <img
                      src={heroPost.cover_image || 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=1200&q=80'}
                      alt={heroPost.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-[#0891b2] text-white text-xs font-bold px-3 py-1 rounded-lg shadow-sm">
                      FEATURED GUIDE
                    </div>
                  </div>
                  <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mb-3">
                        <span className="bg-sky-50 text-[#0c4a6e] font-bold px-2.5 py-0.5 rounded-md border border-sky-100">
                          {heroPost.category || 'Tech Guide'}
                        </span>
                        <span>•</span>
                        <span>{heroPost.read_time || '5 min read'}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-[#0891b2] transition-colors leading-snug mb-3 font-heading">
                        {heroPost.title}
                      </h2>
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-6">
                        {heroPost.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="text-xs text-slate-500 font-medium">By {heroPost.author || 'IT Solutions Team'}</span>
                      <span className="text-xs font-bold text-[#0891b2] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Read Full Article →
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(searchQuery || activeCategory ? posts : gridPosts).map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  <Link to={`/blog/${post.slug}`} className="relative block h-48 overflow-hidden bg-slate-100">
                    <img
                      src={post.cover_image || 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80'}
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-xs">
                      {post.category || 'Tech Guide'}
                    </div>
                  </Link>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mb-2">
                        <span>{post.read_time || '5 min read'}</span>
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0891b2] transition-colors leading-snug mb-2 font-heading line-clamp-2">
                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">By {post.author || 'IT Solutions'}</span>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="text-xs font-bold text-[#0891b2] hover:text-[#0e7490] flex items-center gap-0.5"
                      >
                        Read →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set('page', String(p));
                      setSearchParams(params);
                    }}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      pagination.page === p
                        ? 'bg-[#0c4a6e] text-white shadow'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
