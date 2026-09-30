import React, { useState, useEffect } from "react";
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

  // Open post and load full HTML article details
  const handleSelectPost = async (post: NewsPost) => {
    setSelectedPost(post);
    setLoadingDetail(true);
    try {
      const fullDetail = await fetchNewsDetail(post.slug || post.id);
      if (fullDetail && fullDetail.content) {
        setSelectedPost(fullDetail);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
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

  const handleShare = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/noticias/${id}`;
    navigator.clipboard.writeText(t("news.shareText", { title, url: shareUrl }));
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

        {/* Selected Post Modal / Expanded Detailed View */}
        {selectedPost ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl mb-12 animate-fadeIn max-w-4xl mx-auto backdrop-blur-sm">
            
            {/* Expanded Hero image */}
            <div className="relative h-64 sm:h-96 w-full bg-slate-900">
              <img 
                src={selectedPost.image} 
                alt={selectedPost.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
              
              {/* Floating Back button */}
              <button 
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 left-4 px-4 py-2 rounded-lg bg-slate-950/80 hover:bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-slate-300 transition-all cursor-pointer flex items-center gap-1"
              >
                ← {t("news.back")}
              </button>

              <div className="absolute bottom-6 left-6 right-6">
                <span className="px-2.5 py-1 rounded bg-amber-400 text-slate-950 text-[10px] font-bold font-mono uppercase tracking-wider">
                  {selectedPost.category}
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 mt-3 leading-tight">
                  {selectedPost.title}
                </h3>
              </div>
            </div>

            {/* Post Content & Comments Grid */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Full HTML Article Body */}
              <div className="lg:col-span-8 space-y-6">
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 border-b border-slate-800 pb-4">
                  <div className="flex items-center">
                    <User className="w-3.5 h-3.5 text-amber-500/80 mr-1" />
                    <span>{selectedPost.author || "Redação"}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3.5 h-3.5 text-amber-500/80 mr-1" />
                    <span>{selectedPost.date}</span>
                  </div>
                  {selectedPost.url_origem && (
                    <a
                      href={selectedPost.url_origem}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto inline-flex items-center text-amber-400 hover:text-amber-300 gap-1 text-[11px] underline"
                    >
                      <span>Fonte original</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {loadingDetail ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                    <p className="text-xs font-mono">Carregando notícia completa...</p>
                  </div>
                ) : (
                  <div 
                    className="news-body text-slate-300 text-sm sm:text-base leading-relaxed space-y-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-amber-400 [&_h2]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-amber-300 [&_h3]:mt-4 [&_p]:leading-relaxed [&_a]:text-amber-400 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-400 [&_img]:rounded-xl [&_img]:my-4 [&_img]:max-w-full"
                    dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                  />
                )}

                {/* Likes / Shares buttons bar */}
                <div className="flex items-center space-x-4 pt-6 border-t border-slate-800">
                  <button 
                    onClick={(e) => handleLike(selectedPost.id, e)}
                    className="flex items-center space-x-2 text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    <Heart className="w-5 h-5 text-amber-500" />
                    <span className="text-xs font-mono">{selectedPost.likes} {t("news.likes")}</span>
                  </button>

                  <button 
                    onClick={(e) => handleShare(selectedPost.id, selectedPost.title, e)}
                    className="flex items-center space-x-2 text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    {copiedId === selectedPost.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 text-slate-400" />}
                    <span className="text-xs font-mono">
                      {copiedId === selectedPost.id ? t("news.copied") : t("news.share")}
                    </span>
                  </button>
                </div>

              </div>

              {/* Comments Subsection */}
              <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-800 pt-6 lg:pt-0 lg:pl-6 space-y-6">
                <h4 className="text-base font-serif font-bold text-slate-200">
                  {t("news.comments", { count: (selectedPost.comments || []).length })}
                </h4>

                {/* Form to submit comment */}
                <form onSubmit={handleAddComment} className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">{t("news.leaveComment")}</span>
                  <div>
                    <input 
                      type="text"
                      placeholder={t("news.yourName")}
                      required
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <textarea 
                      placeholder={t("news.commentPlaceholder")}
                      required
                      rows={3}
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingComment}
                    className="w-full py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>{submittingComment ? t("news.sending") : t("news.comment")}</span>
                  </button>
                </form>

                {/* Comments List */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {(!selectedPost.comments || selectedPost.comments.length === 0) ? (
                    <p className="text-xs text-slate-500 italic text-center py-4">{t("news.firstComment")}</p>
                  ) : (
                    selectedPost.comments.map((comm) => (
                      <div key={comm.id} className="p-3 bg-slate-900/30 border border-slate-800/60 rounded-lg">
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                          <span className="font-semibold text-amber-500">{comm.author}</span>
                          <span>{comm.date ? new Date(comm.date).toLocaleDateString() : ""}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {comm.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>

              </div>

            </div>

          </div>
        ) : (
          /* Normal List View with Search & Pagination */
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
                    <article 
                      key={post.id}
                      onClick={() => handleSelectPost(post)}
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
                          {post.aiVerified && (
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-blue-300 text-[9px] font-mono font-semibold flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-blue-400" /> IA Verificada
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content brief */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-500 mb-2">
                            <span className="flex items-center"><User className="w-3 h-3 mr-0.5" /> {post.author || "Redação"}</span>
                            <span>•</span>
                            <span>{post.date}</span>
                          </div>
                          <h4 className="text-base font-serif font-bold text-slate-200 line-clamp-2 group-hover:text-amber-400 transition-colors">
                            {post.title}
                          </h4>
                          <p 
                            className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: post.content.replace(/<[^>]*>?/gm, '') }}
                          />
                        </div>

                        {/* Footer Actions on card */}
                        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
                            <span className="flex items-center"><Heart className="w-3.5 h-3.5 mr-1 text-amber-500/80" /> {post.likes}</span>
                            <span className="flex items-center"><MessageSquare className="w-3.5 h-3.5 mr-1 text-amber-500/80" /> {(post.comments || []).length}</span>
                          </div>
                          <span className="text-xs font-mono font-semibold text-amber-400 group-hover:translate-x-1.5 transition-transform duration-300 flex items-center">
                            {t("news.readMore")} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </span>
                        </div>
                      </div>

                    </article>
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
        )}

      </div>
    </div>
  );
}
