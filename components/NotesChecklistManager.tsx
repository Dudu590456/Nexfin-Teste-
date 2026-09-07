"use client";

import React, { useState, useEffect } from "react";
import { 
  Bookmark, CheckSquare, Plus, Trash2, Pin, Search, Filter, 
  Calendar, Check, Sparkles, Database, CloudCheck, RefreshCw, 
  FolderPlus, Edit3, X, AlertCircle, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Note, Checklist, ChecklistItem, NexFinDatabase } from "@/lib/database";

interface NotesChecklistManagerProps {
  userId: string;
  onSyncNeeded?: () => void;
}

const NOTE_COLORS: { id: string; label: string; bg: string; border: string; text: string }[] = [
  { id: "blue", label: "Azul NexFin", bg: "bg-[#00C8FF]/10", border: "border-[#00C8FF]/30", text: "text-[#00C8FF]" },
  { id: "emerald", label: "Verde Lucro", bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
  { id: "amber", label: "Âmbar Alerta", bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
  { id: "rose", label: "Rosa Despesa", bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400" },
  { id: "purple", label: "Roxo Estratégia", bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400" },
];

export default function NotesChecklistManager({ userId, onSyncNeeded }: NotesChecklistManagerProps) {
  const [activeSection, setActiveSection] = useState<"notes" | "checklists">("notes");
  const [notes, setNotes] = useState<Note[]>(() => (userId ? NexFinDatabase.getNotes(userId) : []));
  const [checklists, setChecklists] = useState<Checklist[]>(() => (userId ? NexFinDatabase.getChecklists(userId) : []));
  const [prevUserId, setPrevUserId] = useState(userId);

  if (prevUserId !== userId) {
    setPrevUserId(userId);
    setNotes(userId ? NexFinDatabase.getNotes(userId) : []);
    setChecklists(userId ? NexFinDatabase.getChecklists(userId) : []);
  }

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Note modal state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState("Geral");
  const [noteColor, setNoteColor] = useState("blue");
  
  // Checklist modal state
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [checklistTitle, setChecklistTitle] = useState("");
  const [checklistCategory, setChecklistCategory] = useState("Rotina");
  const [newChecklistItems, setNewChecklistItems] = useState<string[]>([""]);

  // Quick item input state inside checklist card
  const [quickItemText, setQuickItemText] = useState<{ [key: string]: string }>({});

  // Supabase sync status
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "offline">("synced");
  const [dbConfigured, setDbConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/sync?check=status")
      .then((res) => res.json())
      .then((json) => {
        if (isMounted) {
          setDbConfigured(Boolean(json.configured));
        }
      })
      .catch(() => {
        if (isMounted) {
          setDbConfigured(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const loadData = React.useCallback(() => {
    if (!userId) return;
    const userNotes = NexFinDatabase.getNotes(userId);
    const userChecklists = NexFinDatabase.getChecklists(userId);
    setNotes(userNotes);
    setChecklists(userChecklists);
  }, [userId]);

  const handleManualSync = async () => {
    if (!userId) return;
    setIsSyncing(true);
    setSyncStatus("syncing");
    try {
      await NexFinDatabase.pushSync(userId);
      await NexFinDatabase.pullSync(userId);
      loadData();
      setSyncStatus("synced");
      if (onSyncNeeded) onSyncNeeded();
    } catch {
      setSyncStatus("offline");
    } finally {
      setIsSyncing(false);
    }
  };

  // Note actions
  const openNewNoteModal = () => {
    setEditingNoteId(null);
    setNoteTitle("");
    setNoteContent("");
    setNoteCategory("Geral");
    setNoteColor("blue");
    setIsNoteModalOpen(true);
  };

  const openEditNoteModal = (note: Note) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteCategory(note.category);
    setNoteColor(note.color);
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    if (editingNoteId) {
      NexFinDatabase.updateNote(editingNoteId, {
        title: noteTitle.trim(),
        content: noteContent.trim(),
        category: noteCategory,
        color: noteColor,
      });
    } else {
      NexFinDatabase.addNote(userId, {
        title: noteTitle.trim(),
        content: noteContent.trim(),
        category: noteCategory,
        color: noteColor,
        isPinned: false,
      });
    }

    setIsNoteModalOpen(false);
    loadData();
    if (onSyncNeeded) onSyncNeeded();
  };

  const handleDeleteNote = (id: string) => {
    NexFinDatabase.deleteNote(id);
    loadData();
    if (onSyncNeeded) onSyncNeeded();
  };

  const handleTogglePinNote = (id: string) => {
    NexFinDatabase.togglePinNote(id);
    loadData();
    if (onSyncNeeded) onSyncNeeded();
  };

  // Checklist actions
  const openNewChecklistModal = () => {
    setChecklistTitle("");
    setChecklistCategory("Rotina");
    setNewChecklistItems(["", ""]);
    setIsChecklistModalOpen(true);
  };

  const handleSaveChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checklistTitle.trim()) return;

    const filteredItems = newChecklistItems.map(i => i.trim()).filter(Boolean);
    NexFinDatabase.addChecklist(userId, checklistTitle.trim(), checklistCategory, filteredItems);
    setIsChecklistModalOpen(false);
    loadData();
    if (onSyncNeeded) onSyncNeeded();
  };

  const handleDeleteChecklist = (id: string) => {
    NexFinDatabase.deleteChecklist(id);
    loadData();
    if (onSyncNeeded) onSyncNeeded();
  };

  const handleToggleItem = (checklistId: string, itemId: string) => {
    NexFinDatabase.toggleChecklistItem(checklistId, itemId);
    loadData();
    if (onSyncNeeded) onSyncNeeded();
  };

  const handleAddQuickItem = (checklistId: string) => {
    const text = quickItemText[checklistId];
    if (!text || !text.trim()) return;
    NexFinDatabase.addChecklistItem(checklistId, text.trim());
    setQuickItemText(prev => ({ ...prev, [checklistId]: "" }));
    loadData();
    if (onSyncNeeded) onSyncNeeded();
  };

  const handleDeleteItem = (checklistId: string, itemId: string) => {
    NexFinDatabase.deleteChecklistItem(checklistId, itemId);
    loadData();
    if (onSyncNeeded) onSyncNeeded();
  };

  // Pre-configured checklist templates
  const applyTemplate = (title: string, category: string, items: string[]) => {
    setChecklistTitle(title);
    setChecklistCategory(category);
    setNewChecklistItems(items);
  };

  // Filtered Notes
  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || n.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  // Filtered Checklists
  const filteredChecklists = checklists.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.items.some(i => i.text.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set([
    ...notes.map(n => n.category),
    ...checklists.map(c => c.category)
  ]));

  return (
    <div id="notes-checklist-section" className="space-y-6">
      {/* Top Header & Supabase Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#00C8FF] font-mono tracking-widest uppercase font-semibold">
              Produtividade & Organização
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-2.5 h-2.5" />
              {dbConfigured ? "Supabase PostgreSQL Ativo" : "Persistência em Nuvem"}
            </span>
          </div>
          <h3 className="text-lg font-display font-black text-white mt-0.5">
            NOTAS & CHECKLISTS PATRIMONIAIS
          </h3>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="sync-supabase-btn"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3 py-1.5 bg-[#111827] hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono text-gray-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Sincronizar com banco de dados Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#00C8FF]" : "text-gray-400"}`} />
            <span>{isSyncing ? "Sincronizando..." : "Sincronizar"}</span>
          </button>

          {activeSection === "notes" ? (
            <button
              id="new-note-btn"
              onClick={openNewNoteModal}
              className="px-3.5 py-1.5 bg-gradient-to-r from-[#00C8FF] to-[#00BFFF] hover:opacity-95 text-black font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(0,200,255,0.25)] flex items-center gap-1.5 cursor-pointer transition"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Nova Anotação</span>
            </button>
          ) : (
            <button
              id="new-checklist-btn"
              onClick={openNewChecklistModal}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:opacity-95 text-black font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(52,211,153,0.25)] flex items-center gap-1.5 cursor-pointer transition"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Novo Checklist</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Subtabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 glass-card p-3 rounded-2xl border border-white/5">
        {/* Section Tabs */}
        <div className="flex items-center gap-1 bg-[#070B13] p-1 rounded-xl border border-white/5 self-start">
          <button
            id="tab-notes-btn"
            onClick={() => setActiveSection("notes")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSection === "notes"
                ? "bg-[#00C8FF]/15 text-[#00C8FF] border border-[#00C8FF]/30 shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Anotações</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 font-mono">
              {notes.length}
            </span>
          </button>

          <button
            id="tab-checklists-btn"
            onClick={() => setActiveSection("checklists")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSection === "checklists"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Checklists</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 font-mono">
              {checklists.length}
            </span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-2 flex-1 md:max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder={`Pesquisar ${activeSection === "notes" ? "anotações..." : "tarefas & listas..."}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#070B13] border border-white/5 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00C8FF]/50 transition"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#070B13] border border-white/5 rounded-xl px-2.5 py-2 text-xs text-gray-300 focus:outline-none focus:border-[#00C8FF]/50 transition cursor-pointer"
          >
            <option value="all">Todas Categorias</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* SECTION 1: ANOTAÇÕES */}
      {activeSection === "notes" && (
        <div>
          {filteredNotes.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 border border-white/5 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
                <Bookmark className="w-6 h-6 text-amber-400" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Nenhuma anotação encontrada</h4>
              <p className="text-xs text-gray-400 max-w-sm mb-4">
                Crie notas para planejar metas, registrar insights de compras ou orientações tributárias que nunca serão perdidas.
              </p>
              <button
                onClick={openNewNoteModal}
                className="px-4 py-2 bg-[#00C8FF]/15 hover:bg-[#00C8FF]/25 border border-[#00C8FF]/30 text-[#00C8FF] text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Primeira Anotação</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredNotes.map((note) => {
                  const colorConfig = NOTE_COLORS.find(c => c.id === note.color) || NOTE_COLORS[0];
                  return (
                    <motion.div
                      key={note.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`glass-card rounded-2xl p-5 border ${colorConfig.border} flex flex-col justify-between relative group transition duration-200 hover:border-white/20`}
                    >
                      <div>
                        {/* Note Header */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold ${colorConfig.bg} ${colorConfig.text} border ${colorConfig.border}`}>
                              {note.category}
                            </span>
                            {note.isPinned && (
                              <span className="flex items-center gap-0.5 text-[10px] text-amber-400 font-mono">
                                <Pin className="w-3 h-3 fill-amber-400" /> Fixada
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={() => handleTogglePinNote(note.id)}
                              className={`p-1.5 rounded-lg transition ${note.isPinned ? "text-amber-400 bg-amber-500/10" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                              title={note.isPinned ? "Desafixar nota" : "Fixar no topo"}
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEditNoteModal(note)}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition"
                              title="Editar anotação"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                              title="Excluir anotação"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Content */}
                        <h4 className="text-sm font-bold text-white mb-2 leading-snug">
                          {note.title}
                        </h4>
                        <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap line-clamp-6">
                          {note.content}
                        </p>
                      </div>

                      {/* Footer info */}
                      <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(note.updatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                        </span>
                        <span className="text-emerald-400/80 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Salvo
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: CHECKLISTS */}
      {activeSection === "checklists" && (
        <div>
          {filteredChecklists.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 border border-white/5 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                <CheckSquare className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Nenhum checklist criado</h4>
              <p className="text-xs text-gray-400 max-w-sm mb-4">
                Organize fechamentos mensais, auditorias de faturas e auditoria de compras para nunca esquecer um pagamento.
              </p>
              <button
                onClick={openNewChecklistModal}
                className="px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Primeiro Checklist</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <AnimatePresence>
                {filteredChecklists.map((checklist) => {
                  const total = checklist.items.length;
                  const completed = checklist.items.filter(i => i.completed).length;
                  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                  const isDone = total > 0 && completed === total;

                  return (
                    <motion.div
                      key={checklist.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className={`glass-card rounded-2xl p-6 border ${isDone ? "border-emerald-500/30 bg-emerald-950/10" : "border-white/10"} flex flex-col justify-between`}
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-white/5 text-gray-300 border border-white/10">
                              {checklist.category}
                            </span>
                            <h4 className="text-sm font-display font-extrabold text-white mt-1.5">
                              {checklist.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-mono font-bold ${isDone ? "text-emerald-400" : "text-[#00C8FF]"}`}>
                              {completed}/{total} ({percentage}%)
                            </span>
                            <button
                              onClick={() => handleDeleteChecklist(checklist.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                              title="Excluir checklist"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-[#070B13] h-2 rounded-full overflow-hidden mb-4 border border-white/5">
                          <div
                            className={`h-full transition-all duration-500 ${isDone ? "bg-emerald-400" : "bg-gradient-to-r from-[#00C8FF] to-[#00BFFF]"}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        {/* Checklist Items list */}
                        <div className="space-y-2 mb-4">
                          {checklist.items.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleToggleItem(checklist.id, item.id)}
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer select-none transition ${
                                item.completed
                                  ? "bg-emerald-500/5 border-emerald-500/20 text-gray-400"
                                  : "bg-[#070B13]/70 border-white/5 hover:border-white/15 text-white"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition ${
                                  item.completed 
                                    ? "bg-emerald-500 text-black shadow-sm" 
                                    : "border border-gray-500 hover:border-[#00C8FF]"
                                }`}>
                                  {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <span className={`text-xs leading-snug break-words ${item.completed ? "line-through text-gray-500 font-normal" : "font-medium"}`}>
                                  {item.text}
                                </span>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteItem(checklist.id, item.id);
                                }}
                                className="text-gray-600 hover:text-rose-400 p-1 transition shrink-0"
                                title="Remover item"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Add quick item inline */}
                      <div className="pt-3 border-t border-white/5 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Adicionar nova tarefa..."
                          value={quickItemText[checklist.id] || ""}
                          onChange={(e) => setQuickItemText(prev => ({ ...prev, [checklist.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddQuickItem(checklist.id);
                            }
                          }}
                          className="flex-1 bg-[#070B13] border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00C8FF]/50 transition"
                        />
                        <button
                          onClick={() => handleAddQuickItem(checklist.id)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/5 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Item</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* MODAL: NOVA / EDITAR ANOTAÇÃO */}
      <AnimatePresence>
        {isNoteModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg glass-card rounded-2xl border border-white/10 p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Bookmark className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="text-md font-display font-black text-white">
                    {editingNoteId ? "Editar Anotação" : "Nova Anotação Financeira"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsNoteModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveNote} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1">Título</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Reserva para IPVA e IPTU 2027"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full bg-[#070B13] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:border-[#00C8FF] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-xs font-semibold mb-1">Categoria</label>
                    <input
                      type="text"
                      placeholder="Ex: Investimentos, Tributos..."
                      value={noteCategory}
                      onChange={(e) => setNoteCategory(e.target.value)}
                      className="w-full bg-[#070B13] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00C8FF] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-xs font-semibold mb-1">Destaque de Cor</label>
                    <div className="flex items-center gap-2 mt-1.5">
                      {NOTE_COLORS.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setNoteColor(c.id)}
                          className={`w-6 h-6 rounded-full ${c.bg} border-2 transition ${
                            noteColor === c.id ? "scale-110 border-white" : "border-transparent opacity-60"
                          }`}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1">Conteúdo da Anotação</label>
                  <textarea
                    rows={6}
                    placeholder="Descreva observações, planos de gastos, cálculos preliminares ou lembretes fiscais importantes..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full bg-[#070B13] border border-white/10 rounded-xl p-3.5 text-xs text-white leading-relaxed focus:border-[#00C8FF] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsNoteModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-[#00C8FF] to-[#00BFFF] text-black font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(0,200,255,0.25)] hover:opacity-90 transition cursor-pointer"
                  >
                    {editingNoteId ? "Salvar Alterações" : "Salvar no Supabase"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: NOVO CHECKLIST */}
      <AnimatePresence>
        {isChecklistModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg glass-card rounded-2xl border border-white/10 p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-md font-display font-black text-white">
                    Novo Checklist Financeiro
                  </h3>
                </div>
                <button
                  onClick={() => setIsChecklistModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Template Chips */}
              <div className="mb-4">
                <label className="block text-gray-400 text-[10px] font-mono uppercase tracking-wider mb-2">
                  Modelos Rápidos Sugeridos:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyTemplate(
                      "Fechamento Mensal das Contas",
                      "Rotina",
                      [
                        "Conferir lançamentos de extrato bancário",
                        "Validar limites e vencimentos dos cartões de crédito",
                        "Quitar boletos de energia, condomínio e água",
                        "Efetuar aporte mensal de investimentos (20%)",
                        "Calcular saldo remanescente para reserva"
                      ]
                    )}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-gray-300 transition cursor-pointer"
                  >
                    + Fechamento Mensal
                  </button>

                  <button
                    type="button"
                    onClick={() => applyTemplate(
                      "Auditoria de Assinaturas & Recorrências",
                      "Economia",
                      [
                        "Listar serviços de streaming ativos",
                        "Verificar assinaturas de apps no celular",
                        "Renegociar plano de internet ou telefone",
                        "Cancelar ferramentas que não uso há mais de 30 dias"
                      ]
                    )}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-gray-300 transition cursor-pointer"
                  >
                    + Auditoria de Custos
                  </button>

                  <button
                    type="button"
                    onClick={() => applyTemplate(
                      "Preparação Declaração IRPF",
                      "Tributos",
                      [
                        "Baixar informes de rendimentos bancários",
                        "Reunir comprovantes de despesas médicas e odontológicas",
                        "Recolher notas fiscais de reformas e melhorias",
                        "Exportar relatórios de proventos de fundos imobiliários"
                      ]
                    )}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-gray-300 transition cursor-pointer"
                  >
                    + Declaração IRPF
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveChecklist} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1">Nome da Lista</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Checklist de Fechamento de Junho"
                    value={checklistTitle}
                    onChange={(e) => setChecklistTitle(e.target.value)}
                    className="w-full bg-[#070B13] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:border-[#00C8FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1">Categoria</label>
                  <input
                    type="text"
                    placeholder="Ex: Rotina, Metas, Impostos..."
                    value={checklistCategory}
                    onChange={(e) => setChecklistCategory(e.target.value)}
                    className="w-full bg-[#070B13] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00C8FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1">Tarefas Iniciais</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
                    {newChecklistItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-5 text-center text-xs font-mono text-gray-500">{index + 1}.</span>
                        <input
                          type="text"
                          placeholder={`Item ${index + 1}`}
                          value={item}
                          onChange={(e) => {
                            const updated = [...newChecklistItems];
                            updated[index] = e.target.value;
                            setNewChecklistItems(updated);
                          }}
                          className="flex-1 bg-[#070B13] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-[#00C8FF] focus:outline-none"
                        />
                        {newChecklistItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewChecklistItems(newChecklistItems.filter((_, i) => i !== index));
                            }}
                            className="p-1 text-gray-500 hover:text-rose-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setNewChecklistItems([...newChecklistItems, ""])}
                    className="mt-2 text-xs text-[#00C8FF] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Adicionar mais um item
                  </button>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsChecklistModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(52,211,153,0.25)] hover:opacity-90 transition cursor-pointer"
                  >
                    Criar Checklist
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
