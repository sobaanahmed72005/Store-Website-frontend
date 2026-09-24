import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import CategoryMenu from '../components/CategoryMenu';
import Footer from '../components/Footer';
import { api } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { useSeo } from '../hooks/useSeo';
import { useSiteSettings } from '../store/siteSettingsStore';
import { useCartStore } from '../store/cartStore';

export default function BlogPost() {
  const { slug } = useParams();
  const { siteName } = useSiteSettings();
  const addToCart = useCartStore((state) => state.addToCart);

  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [addedProductId, setAddedProductId] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get(ENDPOINTS.BLOG.BY_SLUG(slug))
      .then((data) => {
        if (data && data.post) {
          setPostData(data);
        }
      })
      .catch((err) => console.error('Failed to load blog post:', err))
      .finally(() => setLoading(false));
  }, [slug]);

  const post = postData?.post;
  const featuredProducts = postData?.featuredProducts || [];
  const relatedPosts = postData?.relatedPosts || [];

  useSeo({
    title: post ? `${post.title} | ${siteName || 'IT Solutions'} Blog` : 'Loading Blog Post...',
    description: post?.excerpt || post?.title || 'Tech buying guide and recommendations.',
    canonical: `${window.location.origin}/blog/${slug}`,
    keywords: `${post?.category || 'tech'}, buying guide Pakistan, ${post?.title || ''}`,
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.is_on_sale && product.discount_price ? Number(product.discount_price) : Number(product.price),
      image: product.image,
      stock: product.stock,
      quantity: 1,
    });
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
        <Header />
        <CategoryMenu />
        <main className="max-w-[900px] w-full mx-auto px-4 py-12 flex-1 animate-pulse">
          <div className="h-8 bg-slate-200 rounded-lg w-3/4 mb-4" />
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-8" />
          <div className="h-72 bg-slate-200 rounded-2xl mb-8" />
          <div className="space-y-4">
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-5/6" />
            <div className="h-4 bg-slate-200 rounded w-4/6" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
        <Header />
        <CategoryMenu />
        <main className="max-w-[900px] w-full mx-auto px-4 py-16 text-center flex-1">
          <div className="text-5xl mb-4">📖</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Article Not Found</h1>
          <p className="text-slate-500 mb-6">The blog post you are looking for does not exist or has been removed.</p>
          <Link
            to="/blog"
            className="px-6 py-2.5 bg-[#0c4a6e] text-white rounded-xl text-sm font-semibold hover:bg-[#0369a1] transition-colors shadow"
          >
            ← Back to Blog &amp; Guides
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Header />
      <CategoryMenu />

      <main className="max-w-[920px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-[#0891b2] transition-colors">Home</Link>
          <span>›</span>
          <Link to="/blog" className="hover:text-[#0891b2] transition-colors">Blog</Link>
          <span>›</span>
          <span className="text-slate-800 font-semibold truncate max-w-[240px] sm:max-w-xs">{post.title}</span>
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#0891b2] mb-3">
            <span className="bg-sky-50 px-3 py-1 rounded-lg border border-sky-100 uppercase tracking-wide">
              {post.category || 'Tech Guide'}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">{post.read_time || '5 min read'}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">
              Published {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-heading leading-tight tracking-tight mb-4">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal mb-6">
            {post.excerpt}
          </p>

          {/* Author & Share Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0c4a6e] to-[#0891b2] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {(post.author || 'IT')[0]}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{post.author || 'IT Solutions Tech Team'}</h4>
                <p className="text-[11px] text-slate-500">Verified Hardware &amp; Security Specialist</p>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${post.title} — Read here: ${window.location.href}`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center text-xs font-bold hover:scale-105 transition-transform"
                title="Share on WhatsApp"
              >
                💬
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-[#1877F2] text-white flex items-center justify-center text-xs font-bold hover:scale-105 transition-transform"
                title="Share on Facebook"
              >
                f
              </a>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>{copied ? '✓ Copied' : '🔗 Copy Link'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Cover Image Banner */}
        {post.cover_image && (
          <div className="mb-10 rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-100 max-h-[420px]">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Featured Products Callout Carousel (Direct Buying Box) */}
        {featuredProducts.length > 0 && (
          <div className="mb-10 bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] border border-sky-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0891b2]">Official Store Recommendations</span>
                <h3 className="text-base font-bold text-[#0c4a6e]">Featured Products Mentioned in Article</h3>
              </div>
              <span className="text-xs bg-white text-[#0891b2] font-semibold px-2.5 py-1 rounded-full border border-sky-200">
                {featuredProducts.length} Items Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {featuredProducts.map((prod) => {
                const effectivePrice = prod.is_on_sale && prod.discount_price ? Number(prod.discount_price) : Number(prod.price);
                return (
                  <div key={prod.id} className="bg-white rounded-xl p-3 border border-sky-100 shadow-xs flex flex-col justify-between group">
                    <div>
                      <Link to={`/product/${prod.slug}`} className="block relative h-28 mb-2 overflow-hidden rounded-lg bg-slate-50">
                        <img
                          src={prod.image || '/icon.png'}
                          alt={prod.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </Link>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight mb-1 group-hover:text-[#0891b2]">
                        <Link to={`/product/${prod.slug}`}>{prod.name}</Link>
                      </h4>
                      <p className="text-xs font-extrabold text-[#0c4a6e] mb-2">
                        PKR {effectivePrice.toLocaleString('en-PK')}
                      </p>
                    </div>

                    <button
                      onClick={() => handleQuickAddToCart(prod)}
                      className="w-full py-1.5 px-2 bg-[#0891b2] hover:bg-[#0e7490] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1"
                    >
                      {addedProductId === prod.id ? '✓ Added to Cart!' : '🛒 Add to Cart'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Article Content Body */}
        <article className="prose prose-slate max-w-none prose-headings:font-heading prose-headings:text-[#0c4a6e] prose-headings:font-bold prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-xs mb-10">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        {/* Bottom Banner Callout */}
        <div className="mb-12 bg-gradient-to-r from-[#0c4a6e] to-[#0369a1] text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Need Advice on Your IT &amp; Security Setup?</h3>
            <p className="text-xs sm:text-sm text-sky-100 max-w-lg">
              Our technical experts in Lahore provide free consultations, custom CCTV estimates, and nationwide Cash on Delivery support.
            </p>
          </div>
          <Link
            to="/contact"
            className="px-6 py-3 bg-white text-[#0c4a6e] hover:bg-sky-50 rounded-xl text-xs font-bold shadow-md hover:scale-105 transition-all shrink-0"
          >
            Contact Tech Support
          </Link>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 font-heading mb-4">Related Buying Guides</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedPosts.map((r) => (
                <Link
                  key={r.id}
                  to={`/blog/${r.slug}`}
                  className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#0891b2] bg-sky-50 px-2 py-0.5 rounded border border-sky-100 mb-2 inline-block">
                      {r.category || 'Guide'}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#0891b2] leading-snug line-clamp-2 mb-2">
                      {r.title}
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-[#0891b2] group-hover:translate-x-1 transition-transform mt-3 inline-block">
                    Read Guide →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
