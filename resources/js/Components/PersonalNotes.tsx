import React, { useState, useEffect, useMemo } from "react";
import { 
  BookOpen, Sparkles, Plus, Save, Trash2, Cloud, CloudLightning, RefreshCw, 
  LogIn, Lock, Check, Pin, Search, Copy, Download, Tag, Palette, List, 
  Quote, Heading1, Heading2, Filter, Share2
} from "lucide-react";
import { fetchNotes, saveNote, deleteNote } from "../lib/api";
import { PersonalNote, User } from "../types";
import { useTranslation } from "react-i18next";

interface PersonalNotesProps {
  currentUser: User | null;
  onLoginClick: () => void;
}

const CATEGORIES = ["Geral", "Sermões", "Estudo Bíblico", "Orações", "Ideias & Projetos"];

const COLORS: { [key: string]: { bg: string; border: string; text: string; dot: string } } = {
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/40", text: "text-amber-400", dot: "bg-amber-400" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/40", text: "text-emerald-400", dot: "bg-emerald-400" },
  sky: { bg: "bg-sky-500/10", border: "border-sky-500/40", text: "text-sky-400", dot: "bg-sky-400" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/40", text: "text-purple-400", dot: "bg-purple-400" },
  rose: { bg: "bg-rose-500/10", border: "border-rose-500/40", text: "text-rose-400", dot: "bg-rose-400" },
};

export default function PersonalNotes({ currentUser, onLoginClick }: PersonalNotesProps) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<PersonalNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<PersonalNote | null>(null);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [category, setCategory] = useState<string>("Geral");
  const [color, setColor] = useState<string>("amber");
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>("Todas");
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "error">("synced");
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const loadUserNotes = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await fetchNotes(currentUser.id);
      setNotes(data);
      if (data.length > 0) {
        handleSelectNote(data[0]);
      } else {
        resetEditor();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserNotes();
  }, [currentUser]);

  const resetEditor = () => {
    setSelectedNote(null);
    setTitle("");
    setContent("");
    setCategory("Geral");
    setColor("amber");
    setIsPinned(false);
  };

  const handleSelectNote = (note: PersonalNote) => {
    setSelectedNote(note);
    setTitle(note.title || "");
    setContent(note.content || "");
    setCategory(note.category || "Geral");
    setColor(note.color || "amber");
    setIsPinned(Boolean(note.isPinned));
  };

  const handleCreateNewNote = () => {
    const tempNote: PersonalNote = {
      id: "",
      userId: currentUser?.id || "",
      title: "Nova Anotação",
      content: "",
      category: "Geral",
      color: "amber",
      isPinned: false,
      lastUpdated: new Date().toISOString()
    };
    setSelectedNote(tempNote);
    setTitle(tempNote.title);
    setContent("");
    setCategory("Geral");
    setColor("amber");
    setIsPinned(false);
  };

  const handleSaveNote = async () => {
    if (!currentUser) return;
    setSyncStatus("syncing");
    
    try {
      const saved = await saveNote({
        id: selectedNote?.id || undefined,
        userId: currentUser.id,
        title: title || t("notes.untitled"),
        content,
        category,
        color,
        isPinned,
      });

      const index = notes.findIndex(n => n.id === saved.id);
      if (index > -1) {
        const updated = [...notes];
        updated[index] = saved;
        setNotes(updated);
      } else {
        setNotes([saved, ...notes]);
      }
      
      setSelectedNote(saved);
      setSyncStatus("synced");
    } catch (err) {
      console.error(err);
      setSyncStatus("error");
    }
  };

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser || !id) return;
    
    if (confirm(t("notes.deleteConfirm"))) {
      try {
        await deleteNote(currentUser.id, id);
        const filtered = notes.filter(n => n.id !== id);
        setNotes(filtered);
        if (selectedNote?.id === id) {
          if (filtered.length > 0) {
            handleSelectNote(filtered[0]);
          } else {
            resetEditor();
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleTogglePin = async () => {
    const nextPin = !isPinned;
    setIsPinned(nextPin);
    if (selectedNote?.id) {
      try {
        const updated = await saveNote({
          id: selectedNote.id,
          userId: currentUser!.id,
          title,
          content,
          category,
          color,
          isPinned: nextPin
        });
        setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
        setSelectedNote(updated);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCopyContent = () => {
    const fullText = `${title}\n\n${content}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadNote = () => {
    const fullText = `# ${title || "Anotação"}\nCategoria: ${category}\nData: ${new Date().toLocaleDateString()}\n\n${content}`;
    const blob = new Blob([fullText], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(title || "anotacao").replace(/\s+/g, "_")}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Quick formatting insert
  const insertText = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("note-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${prefix}${selected || "texto"}${suffix}`;
    const updatedContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(updatedContent);
    setSyncStatus("syncing");

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 5));
    }, 50);
  };

  // Filtered notes by category and search
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchCat =
        selectedFilterCategory === "Todas" ||
        (n.category || "Geral") === selectedFilterCategory;
      const matchSearch =
        !searchQuery ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    }).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    });
  }, [notes, selectedFilterCategory, searchQuery]);

  // If not logged in, prompt Auth card
  if (!currentUser) {
    return (
      <div className="py-16 bg-slate-950 flex items-center justify-center min-h-[500px]">
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative backdrop-blur-sm">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow shadow-amber-500/20">
            <Lock className="w-5 h-5 text-slate-900" />
          </div>
          
          <h3 className="text-xl font-serif font-bold text-slate-200 mt-4">{t("notes.loginCardTitle")}</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {t("notes.loginCardDesc")}
          </p>

          <button
            onClick={onLoginClick}
            id="btn-pn-login"
            className="w-full mt-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow glow-accent"
          >
            <LogIn className="w-4 h-4" />
            <span>{t("notes.loginNow")}</span>
          </button>
        </div>
      </div>
    );
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="py-10 bg-slate-950 text-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-800/80 gap-4">
          <div className="text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono uppercase tracking-wider mb-2">
              <Cloud className="w-3.5 h-3.5" />
              <span>Nuvem Segura Pessoal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 flex items-center">
              Minhas Anotações & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500 ml-2">Estudos</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Guarde sermões, orações, ideias e devocionais pessoais em segurança.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sync Badge */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono">
              {syncStatus === "syncing" && (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span className="text-amber-400 font-semibold">{t("notes.syncing")}</span>
                </>
              )}
              {syncStatus === "synced" && (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-400">Salvo na nuvem</span>
                </>
              )}
              {syncStatus === "error" && (
                <>
                  <CloudLightning className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-red-400 font-semibold">{t("notes.error")}</span>
                </>
              )}
            </div>

            <button
              onClick={handleCreateNewNote}
              id="btn-pn-new"
              className="flex items-center px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold font-mono transition-all cursor-pointer shadow-md shadow-amber-500/10"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Nova Anotação
            </button>
          </div>
        </div>

        {/* Notebook Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Sidebar with Filter & Notes List (4 Cols) */}
          <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 sm:p-5 flex flex-col space-y-4 backdrop-blur-md">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Pesquisar anotações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-left">
              {["Todas", ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap transition-colors cursor-pointer ${
                    selectedFilterCategory === cat
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-850"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Notes List */}
            <div className="space-y-2 overflow-y-auto max-h-[520px] pr-1 custom-scrollbar text-left">
              {loading ? (
                <p className="text-xs text-slate-500 text-center py-8 font-mono animate-pulse">{t("notes.loading")}</p>
              ) : filteredNotes.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8 italic">Nenhuma anotação encontrada.</p>
              ) : (
                filteredNotes.map((note) => {
                  const isSelected = selectedNote?.id === note.id;
                  const colorScheme = COLORS[note.color || "amber"] || COLORS.amber;

                  return (
                    <div
                      key={note.id}
                      onClick={() => handleSelectNote(note)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex justify-between items-start gap-2 relative ${
                        isSelected
                          ? "bg-slate-850/90 border-amber-500/60 shadow-lg shadow-amber-500/5"
                          : "bg-slate-950/60 border-slate-850 hover:bg-slate-850/40 hover:border-slate-750"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          {note.isPinned && (
                            <Pin className="w-3 h-3 text-amber-400 fill-current shrink-0" />
                          )}
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${colorScheme.bg} ${colorScheme.text} border ${colorScheme.border}`}>
                            {note.category || "Geral"}
                          </span>
                        </div>

                        <h4 className={`text-xs font-semibold truncate ${isSelected ? 'text-amber-400' : 'text-slate-200'}`}>
                          {note.title || "Sem Título"}
                        </h4>

                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-light">
                          {note.content || "Sem conteúdo..."}
                        </p>

                        <span className="text-[9px] font-mono text-slate-600 mt-1.5 block">
                          {new Date(note.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleDeleteNote(note.id, e)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-slate-900 cursor-pointer shrink-0 transition-colors"
                        title={t("notes.deleteTitle")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-center">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                {notes.length} anotações salvas
              </span>
            </div>
          </div>

          {/* Right Column: Text Editor & Rich Options (8 Cols) */}
          <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 sm:p-7 flex flex-col backdrop-blur-md space-y-4 text-left shadow-2xl">
            {selectedNote || title ? (
              <div className="space-y-4">
                
                {/* Meta Controls (Category, Color, Pin, Actions) */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category select */}
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={category}
                        onChange={(e) => {
                          setCategory(e.target.value);
                          setSyncStatus("syncing");
                        }}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-mono outline-none focus:border-amber-500"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Color palette pick */}
                    <div className="flex items-center gap-1 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg">
                      {Object.keys(COLORS).map((cKey) => (
                        <button
                          key={cKey}
                          type="button"
                          onClick={() => {
                            setColor(cKey);
                            setSyncStatus("syncing");
                          }}
                          className={`w-3.5 h-3.5 rounded-full ${COLORS[cKey].dot} transition-transform ${color === cKey ? "scale-125 ring-2 ring-white/50" : "opacity-60 hover:opacity-100"}`}
                          title={`Cor ${cKey}`}
                        />
                      ))}
                    </div>

                    {/* Pin button */}
                    <button
                      type="button"
                      onClick={handleTogglePin}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer ${
                        isPinned 
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/40" 
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                      title="Fixar no topo"
                    >
                      <Pin className={`w-3 h-3 ${isPinned ? "fill-current" : ""}`} />
                      <span>{isPinned ? "Fixado" : "Fixar"}</span>
                    </button>
                  </div>

                  {/* Share & Download actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyContent}
                      className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                      title="Copiar texto"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadNote}
                      className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                      title="Baixar como arquivo (.md)"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title Input */}
                <div>
                  <input
                    type="text"
                    placeholder="Título da sua anotação..."
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setSyncStatus("syncing");
                    }}
                    onBlur={handleSaveNote}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-lg font-serif font-bold text-slate-100 outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                {/* Quick Markdown Formatting Toolbar */}
                <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-850 rounded-xl text-slate-400">
                  <button
                    type="button"
                    onClick={() => insertText("## ")}
                    className="px-2 py-1 hover:text-amber-400 hover:bg-slate-850 rounded text-xs font-mono flex items-center gap-1"
                    title="Título H2"
                  >
                    <Heading2 className="w-3.5 h-3.5" />
                    <span>Título</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertText("**", "**")}
                    className="px-2 py-1 hover:text-amber-400 hover:bg-slate-850 rounded text-xs font-mono font-bold"
                    title="Negrito"
                  >
                    B
                  </button>

                  <button
                    type="button"
                    onClick={() => insertText("> Versículo / Citação: ")}
                    className="px-2 py-1 hover:text-amber-400 hover:bg-slate-850 rounded text-xs font-mono flex items-center gap-1"
                    title="Versículo ou Citação"
                  >
                    <Quote className="w-3.5 h-3.5" />
                    <span>Versículo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertText("- ")}
                    className="px-2 py-1 hover:text-amber-400 hover:bg-slate-850 rounded text-xs font-mono flex items-center gap-1"
                    title="Lista com marcadores"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Item</span>
                  </button>
                </div>

                {/* Content Textarea */}
                <div>
                  <textarea
                    id="note-textarea"
                    placeholder="Escreva seus apontamentos do culto, reflexões bíblicas ou motivos de oração..."
                    rows={15}
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      setSyncStatus("syncing");
                    }}
                    onBlur={handleSaveNote}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 text-sm text-slate-200 outline-none focus:border-amber-500 resize-none font-sans leading-relaxed"
                  />
                </div>

                {/* Bottom Footer Info */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-slate-800/80 gap-3">
                  <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-500">
                    <span>{wordCount} palavras</span>
                    <span>•</span>
                    <span>{charCount} caracteres</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSaveNote}
                      className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/10 cursor-pointer transition-all"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Salvar Anotação</span>
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-20 space-y-4">
                <BookOpen className="w-14 h-14 text-slate-700" />
                <h3 className="text-base font-semibold text-slate-300">Nenhuma anotação selecionada</h3>
                <p className="text-slate-500 text-xs max-w-sm font-light">
                  Selecione uma anotação na lista lateral ou crie uma nova para começar a registrar seus estudos e sermões.
                </p>
                <button
                  type="button"
                  onClick={handleCreateNewNote}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-mono font-bold shadow-md cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4 inline-block mr-1.5" />
                  Criar Nova Anotação
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
