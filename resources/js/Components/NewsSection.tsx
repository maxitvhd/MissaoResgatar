import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { MessageSquare, Heart, Share2, User, Clock, ArrowRight, BookOpen, Send, Sparkles, Check, ChevronLeft, ChevronRight, ExternalLink, Loader2 } from "lucide-react";
import { fetchNewsWithPagination, fetchNewsDetail, likeNews, addNewsComment } from "../lib/api";
import { NewsPost, Comment } from "../types";
import { useTranslation } from "react-i18next";

interface NewsSectionProps {
  initialPosts?: NewsPost[];
  meta?: { total: number; pagina: number; ultima_pagina: number };
  initialCategories?: any[];
}

export default function NewsSection({ initialPosts, meta: initialMeta, initialCategories }: NewsSectionProps) {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<NewsPost[]>(initialPosts && initialPosts.length > 0 ? initialPosts : []);
  const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  
  const [commentAuthor, setCommentAuthor] = useState<string>("");
  const [commentContent, setCommentContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Search & Pagination states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [currentPage, setCurrentPage] = useState<number>(initialMeta?.pagina || 1);
  const [totalPages, setTotalPages] = useState<number>(initialMeta?.ultima_pagina || 1);
  const [totalItems, setTotalItems] = useState<number>(initialMeta?.total || posts.length);

  const categories = React.useMemo(() => {
    if (initialCategories && Array.isArray(initialCategories) && initialCategories.length > 0) {
      const names = initialCategories.map(c => typeof c === 'string' ? c : (c.nome || c.name));
      return ["Todos", ...names];
    }
    const catSet = new Set<string>();
    posts.forEach(p => { if (p.category) catSet.add(p.category); });
    return ["Todos", ...Array.from(catSet)];
  }, [initialCategories, posts]);

  // Load news from server when search, category, or page changes
  const loadNewsData = async (page: number, search: string, category: string) => {
    setLoading(true);
    try {
      const res = await fetchNewsWithPagination({ 
        page, 
        search, 
        category: category === "Todos" ? "" : category 
      });
      setPosts(res.posts);
      setCurrentPage(res.meta.pagina);
      setTotalPages(res.meta.ultima_pagina);
      setTotalItems(res.meta.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect + category/page effect
  useEffect(() => {
    const timer = setTimeout(() => {
      loadNewsData(currentPage, searchQuery, selectedCategory);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, currentPage]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const elem = document.getElementById("noticias-section");
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newLikes = await likeNews(id);
      setPosts(posts.map(p => p.id === id ? { ...p, likes: newLikes } : p));
      if (selectedPost && selectedPost.id === id) {
        setSelectedPost({ ...selectedPost, likes: newLikes });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShareWhatsApp = (post: NewsPost, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/noticias/${post.slug || post.id}`;
    const text = `${post.title}\n\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareFacebook = (post: NewsPost, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/noticias/${post.slug || post.id}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const handleCopyLink = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/noticias/${id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !commentAuthor.trim() || !commentContent.trim()) return;

    setSubmittingComment(true);
    try {
      const newComment = await addNewsComment(selectedPost.id, {
        author: commentAuthor,
        content: commentContent
      });

      const updatedComments = [...(selectedPost.comments || []), newComment];
      const updatedPost = { ...selectedPost, comments: updatedComments };
      
      setSelectedPost(updatedPost);
      setPosts(posts.map(p => p.id === selectedPost.id ? updatedPost : p));
      setCommentContent("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div id="noticias-section" className="py-16 bg-slate-950">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-mono mb-4 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> {t("news.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100 tracking-tight">
            {t("news.title")}
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            {t("news.subtitle")}
          </p>
        </div>

        {/* Normal List View with Search & Pagination */}
        <div className="space-y-8">
          
          {/* Filter and Search controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
            
            {/* Category switches */}
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-amber-400 text-slate-950 shadow"
                      : "text-slate-400 hover:text-amber-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Text search */}
            <div className="relative w-full sm:w-72">
              <input 
                type="text"
                placeholder={t("news.search")}
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 w-full pr-8"
              />
              {loading && (
                <Loader2 className="w-4 h-4 animate-spin text-amber-400 absolute right-3 top-2.5" />
              )}
            </div>
          </div>

          {/* List grid */}
          {loading && posts.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/20 border border-slate-800/50 rounded-2xl flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              <p className="text-slate-400 text-sm font-mono">Buscando notícias...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/20 border border-slate-800/50 rounded-2xl">
              <p className="text-slate-400 text-sm">{t("news.noResults")}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Link 
                    key={post.id}
                    href={`/noticias/${post.slug || post.id}`}
                    className="group bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between cursor-pointer backdrop-blur-sm"
                  >
                    {/* Art banner */}
                    <div className="relative h-48 bg-slate-900 overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-mono font-bold uppercase tracking-wide">
                          {post.category}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-blue-300 text-[9px] font-mono font-semibold flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-blue-400" /> Notícia Verificada
                        </span>
                      </div>
                    </div>

                    {/* Content brief */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-500 mb-2">
                          <span className="flex items-center"><User className="w-3 h-3 mr-0.5" /> Missão Resgatar</span>
                          <span>•</span>
                          <span>{post.date}</span>
                        </div>
                        <h4 className="text-base font-serif font-bold text-slate-200 line-clamp-2 group-hover:text-amber-400 transition-colors">
                          {post.title}
                        </h4>
                        <p 
                          className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: (post.content || '').replace(/<[^>]*>?/gm, '') }}
                        />
                      </div>

                      {/* Footer Actions on card */}
                      <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
                          <span className="flex items-center"><Heart className="w-3.5 h-3.5 mr-1 text-amber-500/80" /> {post.likes}</span>
                          <button 
                            onClick={(e) => handleShareWhatsApp(post, e)} 
                            className="px-2 py-0.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded text-[10px] font-mono transition-colors"
                          >
                            WhatsApp
                          </button>
                        </div>
                        <span className="text-xs font-mono font-semibold text-amber-400 group-hover:translate-x-1.5 transition-transform duration-300 flex items-center">
                          {t("news.readMore")} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </span>
                      </div>
                    </div>

                  </Link>
                ))}
              </div>

              {/* Server-Side Pagination Bar */}
              <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
                <div>
                  Exibindo página <span className="text-amber-400 font-bold">{currentPage}</span> de <span className="text-slate-200 font-bold">{totalPages}</span> ({totalItems} notícias no total)
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || loading}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  {/* Compact page button list */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = currentPage;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs transition-all ${
                          currentPage === pageNum
                            ? "bg-amber-400 border-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || loading}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 transition-all"
                  >
                    <span>Próximo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
