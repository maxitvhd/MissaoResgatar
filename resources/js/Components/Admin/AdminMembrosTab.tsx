import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Phone, Mail, Calendar, 
  MapPin, Edit3, Trash2, CheckCircle, XCircle, DollarSign,
  Award, Shield, FileText, ChevronRight, X, Heart
} from 'lucide-react';
import { Member, FinancialTransaction } from '../../types';
import { 
  fetchMembers, createMember, updateMember, deleteMember, 
  fetchMemberDetails, createFinancialTransaction 
} from '../../lib/api';

export const AdminMembrosTab: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedRole, setSelectedRole] = useState<string>('todos');

  // Modal Novo / Edição Membro
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    data_nascimento: '',
    data_membro: '',
    cargo_ministerio: 'Membro',
    status: 'ativo' as 'ativo' | 'inativo' | 'transferido',
    endereco: '',
    cidade: '',
    estado: 'SP',
    foto_url: '',
    observacoes: '',
  });

  // Modal Detalhes & Contribuições
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedMemberDetails, setSelectedMemberDetails] = useState<{
    membro: Member;
    totais: { dizimos: number; ofertas: number; geral: number };
  } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Modal Rápido de Dízimo/Oferta para o Membro
  const [contributionModalOpen, setContributionModalOpen] = useState(false);
  const [contribData, setContribData] = useState({
    tipo: 'entrada' as const,
    categoria: 'dizimo',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    data_culto_evento: 'Culto de Celebração',
    metodo_pagamento: 'pix',
    observacoes: '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await fetchMembers();
      setMembers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingMember(null);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      data_nascimento: '',
      data_membro: new Date().toISOString().split('T')[0],
      cargo_ministerio: 'Membro',
      status: 'ativo',
      endereco: '',
      cidade: '',
      estado: 'SP',
      foto_url: '',
      observacoes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (membro: Member) => {
    setEditingMember(membro);
    setFormData({
      nome: membro.nome,
      email: membro.email || '',
      telefone: membro.telefone || '',
      cpf: membro.cpf || '',
      data_nascimento: membro.data_nascimento ? String(membro.data_nascimento).split('T')[0] : '',
      data_membro: membro.data_membro ? String(membro.data_membro).split('T')[0] : '',
      cargo_ministerio: membro.cargo_ministerio || 'Membro',
      status: membro.status,
      endereco: membro.endereco || '',
      cidade: membro.cidade || '',
      estado: membro.estado || 'SP',
      foto_url: membro.foto_url || '',
      observacoes: membro.observacoes || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenDetails = async (membro: Member) => {
    setLoadingDetails(true);
    setDetailsModalOpen(true);
    try {
      const details = await fetchMemberDetails(membro.id);
      setSelectedMemberDetails(details);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return alert('O nome do membro é obrigatório.');

    setSaving(true);
    try {
      if (editingMember) {
        await updateMember(editingMember.id, formData);
      } else {
        await createMember(formData);
      }
      setIsModalOpen(false);
      await loadMembers();
    } catch (err) {
      alert('Erro ao salvar membro.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (id: number, nome: string) => {
    if (confirm(`Tem certeza que deseja remover o membro "${nome}"?`)) {
      try {
        await deleteMember(id);
        await loadMembers();
      } catch (err) {
        alert('Erro ao remover membro.');
      }
    }
  };

  const handleOpenQuickContribution = (membro: Member) => {
    setContribData({
      tipo: 'entrada',
      categoria: 'dizimo',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      data_culto_evento: 'Culto de Celebração',
      metodo_pagamento: 'pix',
      observacoes: `Lançado diretamente para o membro: ${membro.nome}`,
    });
    setContributionModalOpen(true);
  };

  const handleSaveContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberDetails?.membro) return;
    if (!contribData.valor || Number(contribData.valor) <= 0) {
      return alert('Informe um valor válido.');
    }

    setSaving(true);
    try {
      await createFinancialTransaction({
        tipo: 'entrada',
        categoria: contribData.categoria,
        descricao: `${contribData.categoria === 'dizimo' ? 'Dízimo' : 'Oferta'} - ${selectedMemberDetails.membro.nome}`,
        valor: Number(contribData.valor),
        data: contribData.data,
        data_culto_evento: contribData.data_culto_evento,
        metodo_pagamento: contribData.metodo_pagamento,
        membro_id: selectedMemberDetails.membro.id,
        status: 'confirmado',
        observacoes: contribData.observacoes,
      });

      alert('Contribuição registrada com sucesso no Financeiro!');
      setContributionModalOpen(false);
      // Recarregar os detalhes do membro
      const updatedDetails = await fetchMemberDetails(selectedMemberDetails.membro.id);
      setSelectedMemberDetails(updatedDetails);
      loadMembers();
    } catch (err) {
      alert('Erro ao registrar contribuição.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch = 
      m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.telefone && m.telefone.includes(searchTerm)) ||
      (m.cargo_ministerio && m.cargo_ministerio.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === 'todos' || m.status === selectedStatus;
    const matchesRole = selectedRole === 'todos' || m.cargo_ministerio === selectedRole;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const totalAtivos = members.filter((m) => m.status === 'ativo').length;
  const cargos = Array.from(new Set(members.map((m) => m.cargo_ministerio).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Top Banner & Ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            Gestão do Rol de Membros
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Cadastre os membros da igreja, acompanhe ministérios e relacione dízimos e ofertas com histórico completo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-zinc-800/80 px-4 py-2 rounded-xl border border-zinc-700/60 text-right">
            <span className="text-xs text-zinc-400 block">Total de Membros</span>
            <span className="text-lg font-bold text-white">{members.length} <span className="text-xs font-normal text-emerald-400">({totalAtivos} ativos)</span></span>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-xl shadow-lg shadow-amber-500/10 transition-all text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Novo Membro
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nome, email, telefone ou cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-800/70 border border-zinc-700/70 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-zinc-800/70 border border-zinc-700/70 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option value="todos">Status: Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
            <option value="transferido">Transferidos</option>
          </select>
        </div>

        <div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full bg-zinc-800/70 border border-zinc-700/70 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option value="todos">Cargo/Ministério: Todos</option>
            {cargos.map((cargo, idx) => (
              <option key={idx} value={cargo!}>{cargo}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Listagem de Membros */}
      {loading ? (
        <div className="p-12 text-center text-zinc-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mb-3"></div>
          <p>Carregando membros...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800/60">
          <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 font-medium">Nenhum membro encontrado.</p>
          <p className="text-zinc-600 text-sm mt-1">Cadastre o primeiro membro clicando em "Novo Membro".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((membro) => (
            <div 
              key={membro.id}
              className="bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all rounded-xl p-5 flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center font-bold text-amber-500 shrink-0 text-base">
                      {membro.foto_url ? (
                        <img src={membro.foto_url} alt={membro.nome} className="w-full h-full object-cover" />
                      ) : (
                        membro.nome.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                        {membro.nome}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-xs text-amber-500/90 font-medium">
                        <Award className="w-3 h-3" /> {membro.cargo_ministerio || 'Membro'}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    membro.status === 'ativo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    membro.status === 'inativo' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                    {membro.status}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-zinc-400">
                  {membro.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{membro.telefone}</span>
                    </div>
                  )}
                  {membro.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="truncate">{membro.email}</span>
                    </div>
                  )}
                  {membro.cidade && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{membro.cidade}{membro.estado ? ` - ${membro.estado}` : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ações do Card */}
              <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenDetails(membro)}
                  className="flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1.5 rounded-lg"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  Ver Dízimos & Histórico
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(membro)}
                    className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Editar membro"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(membro.id, membro.nome)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Excluir membro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar / Editar Membro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                {editingMember ? 'Editar Dados do Membro' : 'Novo Membro da Missão'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    placeholder="Ex: João da Silva Santos"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    placeholder="(11) 98765-4321"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    placeholder="membro@email.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">CPF (Opcional)</label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    placeholder="000.000.000-00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Cargo / Ministério</label>
                  <select
                    value={formData.cargo_ministerio}
                    onChange={(e) => setFormData({ ...formData, cargo_ministerio: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Membro">Membro</option>
                    <option value="Pastor">Pastor(a)</option>
                    <option value="Evangelista">Evangelista</option>
                    <option value="Presbítero">Presbítero</option>
                    <option value="Diácono">Diácono(isa)</option>
                    <option value="Líder de Louvor">Líder de Louvor</option>
                    <option value="Líder de Jovens">Líder de Jovens</option>
                    <option value="Líder de Crianças">Líder de Crianças</option>
                    <option value="Músico/Levita">Músico / Levita</option>
                    <option value="Obreiro">Obreiro(a)</option>
                    <option value="Visitante Frequente">Visitante Frequente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="transferido">Transferido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Membro Desde</label>
                  <input
                    type="date"
                    value={formData.data_membro}
                    onChange={(e) => setFormData({ ...formData, data_membro: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">URL da Foto</label>
                  <input
                    type="text"
                    value={formData.foto_url}
                    onChange={(e) => setFormData({ ...formData, foto_url: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    placeholder="https://..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Endereço Residencial</label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    placeholder="Rua, Número, Bairro"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    placeholder="Ex: São Paulo"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Estado</label>
                  <input
                    type="text"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    placeholder="SP"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Observações Internas</label>
                  <textarea
                    rows={2}
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    placeholder="Anotações pastorais ou de discipulado..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-black text-sm font-bold rounded-lg shadow-lg disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : editingMember ? 'Salvar Alterações' : 'Cadastrar Membro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes & Contribuições do Membro */}
      {detailsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                  {selectedMemberDetails?.membro.nome.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {selectedMemberDetails?.membro.nome}
                  </h3>
                  <span className="text-xs text-zinc-400">
                    {selectedMemberDetails?.membro.cargo_ministerio || 'Membro'} • Status: {selectedMemberDetails?.membro.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => selectedMemberDetails && handleOpenQuickContribution(selectedMemberDetails.membro)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-semibold text-xs rounded-lg transition-all"
                >
                  <DollarSign className="w-4 h-4" />
                  Lançar Dízimo / Oferta
                </button>
                <button 
                  onClick={() => setDetailsModalOpen(false)}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {loadingDetails ? (
                <div className="py-12 text-center text-zinc-400">Carregando histórico do membro...</div>
              ) : selectedMemberDetails ? (
                <>
                  {/* Resumo Financeiro do Membro */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-zinc-800/60 p-4 rounded-xl border border-zinc-700/60">
                      <span className="text-xs text-zinc-400 block">Total Dízimos</span>
                      <span className="text-xl font-bold text-amber-400">
                        R$ {selectedMemberDetails.totais.dizimos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="bg-zinc-800/60 p-4 rounded-xl border border-zinc-700/60">
                      <span className="text-xs text-zinc-400 block">Total Ofertas</span>
                      <span className="text-xl font-bold text-emerald-400">
                        R$ {selectedMemberDetails.totais.ofertas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="bg-zinc-800/60 p-4 rounded-xl border border-zinc-700/60">
                      <span className="text-xs text-zinc-400 block">Contribuição Acumulada</span>
                      <span className="text-xl font-bold text-white">
                        R$ {selectedMemberDetails.totais.geral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Histórico de Entradas deste Membro */}
                  <div>
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-500" />
                      Extrato de Contribuições Registradas
                    </h4>

                    {(!selectedMemberDetails.membro.transacoes || selectedMemberDetails.membro.transacoes.length === 0) ? (
                      <div className="p-8 text-center bg-zinc-800/30 rounded-xl text-zinc-500 text-sm">
                        Nenhum dízimo ou oferta registrado ainda para este membro.
                      </div>
                    ) : (
                      <div className="border border-zinc-800 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs text-zinc-300">
                          <thead className="bg-zinc-800/80 text-zinc-400 uppercase font-medium">
                            <tr>
                              <th className="p-3">Data</th>
                              <th className="p-3">Tipo / Descrição</th>
                              <th className="p-3">Culto / Evento</th>
                              <th className="p-3">Pagamento</th>
                              <th className="p-3 text-right">Valor</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800">
                            {selectedMemberDetails.membro.transacoes.map((item) => (
                              <tr key={item.id} className="hover:bg-zinc-800/40">
                                <td className="p-3 whitespace-nowrap text-zinc-400">
                                  {new Date(item.data).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="p-3">
                                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mr-2 ${
                                    item.categoria === 'dizimo' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                                  }`}>
                                    {item.categoria}
                                  </span>
                                  {item.descricao}
                                </td>
                                <td className="p-3 text-zinc-400">{item.data_culto_evento || '-'}</td>
                                <td className="p-3 uppercase text-zinc-400">{item.metodo_pagamento || 'PIX'}</td>
                                <td className="p-3 text-right font-bold text-white whitespace-nowrap">
                                  R$ {Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Modal Lançamento Rápido de Dízimo/Oferta */}
      {contributionModalOpen && selectedMemberDetails && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Lançar para {selectedMemberDetails.membro.nome}
              </h4>
              <button onClick={() => setContributionModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContribution} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Categoria</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setContribData({ ...contribData, categoria: 'dizimo' })}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      contribData.categoria === 'dizimo'
                        ? 'bg-amber-500 text-black border-amber-500'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    Dízimo
                  </button>
                  <button
                    type="button"
                    onClick={() => setContribData({ ...contribData, categoria: 'oferta' })}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      contribData.categoria === 'oferta'
                        ? 'bg-emerald-500 text-black border-emerald-500'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    Oferta Voluntária
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={contribData.valor}
                  onChange={(e) => setContribData({ ...contribData, valor: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white font-bold text-base focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Data</label>
                <input
                  type="date"
                  required
                  value={contribData.data}
                  onChange={(e) => setContribData({ ...contribData, data: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Culto / Evento (Opcional)</label>
                <input
                  type="text"
                  value={contribData.data_culto_evento}
                  onChange={(e) => setContribData({ ...contribData, data_culto_evento: e.target.value })}
                  placeholder="Ex: Culto de Domingo Noite, Ceia"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Forma de Pagamento</label>
                <select
                  value={contribData.metodo_pagamento}
                  onChange={(e) => setContribData({ ...contribData, metodo_pagamento: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="pix">PIX</option>
                  <option value="dinheiro">Dinheiro em Espécie</option>
                  <option value="cartao_credito">Cartão de Crédito</option>
                  <option value="cartao_debito">Cartão de Débito</option>
                  <option value="transferencia">Transferência Bancária</option>
                  <option value="boleto">Boleto</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setContributionModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-lg shadow-md disabled:opacity-50"
                >
                  {saving ? 'Registrando...' : 'Confirmar Lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
