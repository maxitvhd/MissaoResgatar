import React, { useState, useEffect } from "react";
import { BookOpen, Sparkles, Plus, Save, Trash2, Cloud, CloudLightning, RefreshCw, LogIn, Lock, Check } from "lucide-react";
import { fetchNotes, saveNote, deleteNote } from "../lib/api";
import { PersonalNote, User } from "../types";

interface PersonalNotesProps {
  currentUser: User | null;
  onLoginClick: () => void;
}

export default function PersonalNotes({ currentUser, onLoginClick }: PersonalNotesProps) {
  const [notes, setNotes] = useState<PersonalNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<PersonalNote | null>(null);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "error">("synced");
  const [loading, setLoading] = useState<boolean>(false);

  const loadUserNotes = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await fetchNotes(currentUser.id);
      setNotes(data);
      if (data.length > 0) {
        handleSelectNote(data[0]);
      } else {
        setSelectedNote(null);
        setTitle("");
        setContent("");
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

  const handleSelectNote = (note: PersonalNote) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleCreateNewNote = () => {
    const tempNote: PersonalNote = {
      id: "",
      userId: currentUser?.id || "",
      title: "Nova Anotação Espiritual",
      content: "",
      lastUpdated: new Date().toISOString()
    };
    setSelectedNote(tempNote);
    setTitle(tempNote.title);
    setContent(tempNote.content);
  };

  const handleSaveNote = async () => {
    if (!currentUser) return;
    setSyncStatus("syncing");
    
    try {
      const saved = await saveNote({
        id: selectedNote?.id || undefined,
        userId: currentUser.id,
        title: title || "Sem Título",
        content
      });

      // Update local state list
      const index = notes.findIndex(n => n.id === saved.id);
      if (index > -1) {
        const updated = [...notes];
        updated[index] = saved;
        setNotes(updated);
      } else {
        setNotes([...notes, saved]);
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
    
    if (confirm("Deseja realmente apagar esta anotação permanente de fé?")) {
      try {
        await deleteNote(currentUser.id, id);
        const filtered = notes.filter(n => n.id !== id);
        setNotes(filtered);
        if (selectedNote?.id === id) {
          if (filtered.length > 0) {
            handleSelectNote(filtered[0]);
          } else {
            setSelectedNote(null);
            setTitle("");
            setContent("");
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // If not logged in, prompt Auth card
  if (!currentUser) {
    return (
      <div className="py-16 bg-slate-950 flex items-center justify-center min-h-[500px]">
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative backdrop-blur-sm">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow shadow-amber-500/20">
            <Lock className="w-5 h-5 text-slate-900" />
          </div>
          
          <h3 className="text-xl font-serif font-bold text-slate-200 mt-4">Nuvem de Anotações Segura</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Para registrar suas revelações diárias, intercessões de oração, e manter seus pensamentos salvos com sincronização em nuvem segura, faça login no portal da Marcha para Jesus.
          </p>

          <button
            onClick={onLoginClick}
            id="btn-pn-login"
            className="w-full mt-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow glow-accent"
          >
            <LogIn className="w-4 h-4" />
            <span>Fazer Login Agora</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-950">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Title block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-4 border-b border-slate-800">
          <div className="text-left">
            <h2 className="text-2xl font-serif font-bold text-slate-100 flex items-center">
              <Cloud className="w-6 h-6 mr-2 text-amber-500 animate-pulse" />
              Diário Espiritual & Anotações
            </h2>
            <p className="text-xs text-slate-400 mt-1">Sua jornada bíblica e anotações pessoais sincronizadas em nuvem em tempo real.</p>
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {/* Sync Status Badge */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono">
              {syncStatus === "syncing" && (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span className="text-amber-400 font-semibold">Sincronizando Nuvem...</span>
                </>
              )}
              {syncStatus === "synced" && (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-400">Dados Sincronizados</span>
                </>
              )}
              {syncStatus === "error" && (
                <>
                  <CloudLightning className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-red-400 font-semibold">Erro ao Sincronizar</span>
                </>
              )}
            </div>

            <button
              onClick={handleCreateNewNote}
              id="btn-pn-new"
              className="flex items-center px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold transition-all cursor-pointer shadow"
            >
              <Plus className="w-4 h-4 mr-1" /> Novo Registro
            </button>
          </div>
        </div>

        {/* Notebook layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: List of existing notes */}
          <div className="lg:col-span-4 bg-slate-900/50 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between max-h-[500px] backdrop-blur-sm">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-4">Meus Registros</span>
              
              <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
                {loading ? (
                  <p className="text-xs text-slate-500 text-center py-8 font-mono animate-pulse">Carregando Diário...</p>
                ) : notes.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8 italic">Seu diário está vazio. Crie sua primeira anotação!</p>
                ) : (
                  notes.map((note) => {
                    const isSelected = selectedNote?.id === note.id;
                    return (
                      <div
                        key={note.id}
                        onClick={() => handleSelectNote(note)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex justify-between items-center ${
                          isSelected
                            ? "bg-amber-400/5 border-amber-500/30"
                            : "bg-slate-950/40 border-slate-900 hover:border-slate-800"
                        }`}
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className={`text-xs font-semibold truncate ${isSelected ? 'text-amber-400' : 'text-slate-300'}`}>
                            {note.title}
                          </h4>
                          <span className="text-[9px] font-mono text-slate-500 mt-1 block">
                            {new Date(note.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-900 cursor-pointer"
                          title="Apagar anotação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-center">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                Proteção Espiritual de Dados
              </span>
            </div>
          </div>

          {/* Right Column: Text editor interface */}
          <div className="lg:col-span-8 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-sm">
            {selectedNote || title ? (
              <div className="flex-1 flex flex-col justify-between space-y-4">
                {/* Title Input */}
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Título do Estudo ou Reflexão</label>
                  <input
                    type="text"
                    placeholder="Sem Título"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setSyncStatus("syncing");
                    }}
                    onBlur={handleSaveNote}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col">
                  <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">Anotações Bíblicas & Revelações</label>
                  <textarea
                    placeholder="Inicie o registro de sua oração, estudo bíblico ou anotações..."
                    rows={12}
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      setSyncStatus("syncing");
                    }}
                    onBlur={handleSaveNote}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs sm:text-sm text-slate-300 outline-none focus:border-amber-500 resize-none flex-1 font-sans leading-relaxed"
                  />
                </div>

                {/* Trigger save button */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500">
                    Última sincronização: {selectedNote?.lastUpdated ? new Date(selectedNote.lastUpdated).toLocaleTimeString() : "Agora"}
                  </span>

                  <button
                    onClick={handleSaveNote}
                    className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-500" />
                    <span>Salvar Agora</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16 space-y-3">
                <BookOpen className="w-12 h-12 text-slate-600" />
                <p className="text-slate-400 text-xs max-w-sm">
                  Selecione uma anotação existente à esquerda para ler e editar, ou crie uma nova anotação de fé instantaneamente.
                </p>
                <button
                  onClick={handleCreateNewNote}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-amber-400 hover:bg-slate-800"
                >
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
