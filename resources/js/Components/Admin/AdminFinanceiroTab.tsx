import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Wallet, ShoppingBag, 
  CheckCircle, XCircle, Clock, Calendar, Filter, Plus, 
  ArrowUpRight, ArrowDownRight, Users, Heart, Package,
  Search, FileText, Check, AlertCircle, RefreshCw, ChevronRight, X
} from 'lucide-react';
import { 
  FinancialDashboardData, FinancialTransaction, StoreOrder, Member 
} from '../../types';
import { 
  fetchFinancialDashboard, fetchFinancialTransactions, createFinancialTransaction,
  deleteFinancialTransaction, fetchStoreOrders, updateStoreOrderStatus, fetchMembers 
} from '../../lib/api';

export const AdminFinanceiroTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'dizimos' | 'pedidos' | 'saidas' | 'extrato'>('dashboard');
  
  // Dashboard Data
  const [dashboardData, setDashboardData] = useState<FinancialDashboardData | null>(null);
  const [periodo, setPeriodo] = useState<'mes_atual' | 'ano_atual' | 'tudo'>('ano_atual');
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // Transações
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transFilterTipo, setTransFilterTipo] = useState<string>('');
  const [transFilterCat, setTransFilterCat] = useState<string>('');
  const [transSearch, setTransSearch] = useState<string>('');

  // Pedidos Loja
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('');

  // Membros para vinculação
  const [members, setMembers] = useState<Member[]>([]);

  // Modal Nova Transação (Entrada / Saída)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTipo, setModalTipo] = useState<'entrada' | 'saida'>('entrada');
  const [modalFormData, setModalFormData] = useState({
    categoria: 'dizimo',
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    data_culto_evento: '',
    metodo_pagamento: 'pix',
    membro_id: '' as string,
    status: 'confirmado' as 'confirmado' | 'pendente',
    observacoes: '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDashboard();
    loadMembersList();
  }, [periodo]);

  useEffect(() => {
    if (activeSubTab === 'extrato' || activeSubTab === 'dizimos' || activeSubTab === 'saidas') {
      loadTransactions();
    } else if (activeSubTab === 'pedidos') {
      loadOrders();
    }
  }, [activeSubTab, transFilterTipo, transFilterCat, orderFilterStatus]);

  const loadDashboard = async () => {
    setLoadingDashboard(true);
    try {
      const data = await fetchFinancialDashboard(periodo);
      setDashboardData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const loadMembersList = async () => {
    try {
      const data = await fetchMembers({ status: 'ativo' });
      setMembers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTransactions = async () => {
    setLoadingTransactions(true);
    try {
      let tipo = transFilterTipo;
      let cat = transFilterCat;

      if (activeSubTab === 'dizimos') {
        tipo = 'entrada';
      } else if (activeSubTab === 'saidas') {
        tipo = 'saida';
      }

      const res = await fetchFinancialTransactions({
        tipo: tipo || undefined,
        categoria: cat || undefined,
        busca: transSearch || undefined,
      });
      setTransactions(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetchStoreOrders({
        status: orderFilterStatus || undefined,
      });
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Aprovação com 1 clique do pedido da loja
  const handleApproveOrder = async (order: StoreOrder) => {
    if (!confirm(`Aprovar pedido #${order.id} de R$ ${order.valor_total}? Isto contabilizará automaticamente nas entradas da igreja.`)) {
      return;
    }

    try {
      await updateStoreOrderStatus(order.id, {
        status: 'concluido',
        observacoes: 'Aprovado pelo administrador e contabilizado nas receitas da Missão Resgatar',
      });
      alert('Venda aprovada com sucesso e lançada no financeiro!');
      loadOrders();
      loadDashboard();
    } catch (err) {
      alert('Erro ao aprovar pedido.');
    }
  };

  const handleCancelOrder = async (order: StoreOrder) => {
    if (!confirm(`Cancelar o pedido #${order.id}?`)) return;

    try {
      await updateStoreOrderStatus(order.id, { status: 'cancelado' });
      loadOrders();
      loadDashboard();
    } catch (err) {
      alert('Erro ao cancelar pedido.');
    }
  };

  const handleOpenModal = (tipo: 'entrada' | 'saida', defaultCategory?: string) => {
    setModalTipo(tipo);
    setModalFormData({
      categoria: defaultCategory || (tipo === 'entrada' ? 'dizimo' : 'manutencao_templo'),
      descricao: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      data_culto_evento: tipo === 'entrada' ? 'Culto de Celebração' : '',
      metodo_pagamento: 'pix',
      membro_id: '',
      status: 'confirmado',
      observacoes: '',
    });
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalFormData.valor || Number(modalFormData.valor) <= 0) {
      return alert('Informe um valor válido.');
    }

    let desc = modalFormData.descricao.trim();
    if (!desc) {
      if (modalFormData.categoria === 'dizimo') {
        const mem = members.find((m) => String(m.id) === String(modalFormData.membro_id));
        desc = `Dízimo - ${mem ? mem.nome : 'Membro da Missão'}`;
      } else if (modalFormData.categoria === 'oferta') {
        desc = `Oferta Voluntária - ${modalFormData.data_culto_evento || 'Culto'}`;
      } else {
        desc = `Lançamento ${modalTipo === 'entrada' ? 'Entrada' : 'Saída'} (${modalFormData.categoria})`;
      }
    }

    setSaving(true);
    try {
      await createFinancialTransaction({
        tipo: modalTipo,
        categoria: modalFormData.categoria,
        descricao: desc,
        valor: Number(modalFormData.valor),
        data: modalFormData.data,
        data_culto_evento: modalFormData.data_culto_evento || null,
        metodo_pagamento: modalFormData.metodo_pagamento,
        membro_id: modalFormData.membro_id ? Number(modalFormData.membro_id) : null,
        status: modalFormData.status,
        observacoes: modalFormData.observacoes || null,
      });

      setIsModalOpen(false);
      loadDashboard();
      if (activeSubTab !== 'dashboard') {
        loadTransactions();
      }
      alert('Transação registrada com sucesso!');
    } catch (err) {
      alert('Erro ao salvar transação financeira.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;
    try {
      await deleteFinancialTransaction(id);
      loadDashboard();
      loadTransactions();
    } catch (err) {
      alert('Erro ao excluir transação.');
    }
  };

  const getCategoryName = (cat: string) => {
    const names: Record<string, string> = {
      dizimo: 'Dízimo',
      oferta: 'Oferta',
      venda_loja: 'Venda Loja Online',
      evento_servico: 'Eventos & Inscrições',
      doacao: 'Doação Especial',
      outra_entrada: 'Outra Entrada',
      acao_social: 'Ação Social & Alimentos',
      manutencao_templo: 'Manutenção do Templo',
      equipamentos_som: 'Equipamentos Som & Mídia',
      contas_consumo: 'Contas de Consumo (Luz/Água)',
      ajuda_custo: 'Ajuda de Custo & Missões',
      evangelismo: 'Evangelismo & Eventos',
      outra_saida: 'Outra Saída',
    };
    return names[cat] || cat;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Abas de Navegação */}
      <div className="bg-zinc-900/70 p-6 rounded-2xl border border-zinc-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Wallet className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white">
                Gestão Financeira & Prestação de Contas
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              Cruzamento inteligente de receitas (Dízimos, Ofertas, Vendas da Loja Oficial e Eventos) com saídas e investimentos da igreja.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenModal('entrada', 'dizimo')}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold rounded-xl text-xs shadow-md transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Lançar Dízimo / Oferta
            </button>

            <button
              onClick={() => handleOpenModal('saida')}
              className="flex items-center gap-2 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-red-400 border border-red-500/20 hover:border-red-500/40 font-semibold rounded-xl text-xs transition-all"
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              Registrar Saída / Despesa
            </button>
          </div>
        </div>

        {/* Sub-navegação com badges */}
        <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-zinc-800/80">
          {[
            { id: 'dashboard', label: 'Dashboard & Cruzamento', icon: TrendingUp },
            { id: 'dizimos', label: 'Dízimos & Ofertas', icon: Heart },
            { 
              id: 'pedidos', 
              label: 'Vendas da Loja', 
              icon: ShoppingBag, 
              badge: dashboardData?.totais.pedidos_pendentes_count 
            },
            { id: 'saidas', label: 'Saídas & Aplicações', icon: ArrowDownRight },
            { id: 'extrato', label: 'Extrato Geral', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10'
                    : 'bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge ? (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-black text-amber-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {tab.badge} pendente{tab.badge > 1 ? 's' : ''}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTEÚDO DA SUB-ABA DASHBOARD */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Seletor de Período */}
          <div className="flex items-center justify-between bg-zinc-900/40 p-3 rounded-xl border border-zinc-800">
            <span className="text-xs text-zinc-400 font-medium">Período de Análise:</span>
            <div className="flex items-center gap-1.5">
              {(['mes_atual', 'ano_atual', 'tudo'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriodo(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    periodo === p
                      ? 'bg-zinc-700 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {p === 'mes_atual' ? 'Mês Atual' : p === 'ano_atual' ? 'Ano Atual' : 'Todo o Período'}
                </button>
              ))}
            </div>
          </div>

          {loadingDashboard ? (
            <div className="p-12 text-center text-zinc-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mb-2"></div>
              <p>Compilando dados financeiros...</p>
            </div>
          ) : dashboardData ? (
            <>
              {/* Cards de Resumo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-950/40 to-zinc-900 border border-emerald-500/30 p-5 rounded-2xl">
                  <div className="flex items-center justify-between text-emerald-400 mb-2">
                    <span className="text-xs uppercase tracking-wider font-semibold">Total Entradas</span>
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    R$ {dashboardData.totais.entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-emerald-400/80 mt-1">Dízimos, ofertas, loja e eventos</p>
                </div>

                <div className="bg-gradient-to-br from-red-950/40 to-zinc-900 border border-red-500/30 p-5 rounded-2xl">
                  <div className="flex items-center justify-between text-red-400 mb-2">
                    <span className="text-xs uppercase tracking-wider font-semibold">Total Saídas</span>
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    R$ {dashboardData.totais.saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-red-400/80 mt-1">Ação social, manutenção e custos</p>
                </div>

                <div className="bg-gradient-to-br from-amber-950/40 to-zinc-900 border border-amber-500/30 p-5 rounded-2xl">
                  <div className="flex items-center justify-between text-amber-400 mb-2">
                    <span className="text-xs uppercase tracking-wider font-semibold">Saldo em Caixa</span>
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    R$ {dashboardData.totais.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-amber-400/80 mt-1">Saldo líquido disponível</p>
                </div>

                <div 
                  onClick={() => setActiveSubTab('pedidos')}
                  className="bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 p-5 rounded-2xl cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between text-zinc-400 group-hover:text-amber-400 mb-2">
                    <span className="text-xs uppercase tracking-wider font-semibold">Vendas Loja Pendentes</span>
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    {dashboardData.totais.pedidos_pendentes_count} <span className="text-xs font-normal text-zinc-400">pedidos</span>
                  </div>
                  <p className="text-[11px] text-amber-400/90 mt-1">
                    R$ {dashboardData.totais.pedidos_pendentes_valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} a aprovar &rarr;
                  </p>
                </div>
              </div>

              {/* Cruzamento de Dados: Origem das Entradas vs Destinação das Saídas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Entradas por Categoria */}
                <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      Cruzamento de Entradas (Origem)
                    </span>
                    <span className="text-xs font-normal text-zinc-400 font-mono">
                      Total: R$ {dashboardData.totais.entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </h3>

                  {dashboardData.entradas_por_categoria.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-6 text-center">Nenhuma entrada confirmada neste período.</p>
                  ) : (
                    <div className="space-y-3.5">
                      {dashboardData.entradas_por_categoria.map((item) => (
                        <div key={item.categoria} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-zinc-300 font-medium">{getCategoryName(item.categoria)}</span>
                            <span className="text-zinc-400 font-mono">
                              R$ {Number(item.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({item.porcentagem}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(item.porcentagem, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Saídas por Categoria */}
                <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                      Destinação das Saídas (Aplicações)
                    </span>
                    <span className="text-xs font-normal text-zinc-400 font-mono">
                      Total: R$ {dashboardData.totais.saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </h3>

                  {dashboardData.saidas_por_categoria.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-6 text-center">Nenhuma saída registrada neste período.</p>
                  ) : (
                    <div className="space-y-3.5">
                      {dashboardData.saidas_por_categoria.map((item) => (
                        <div key={item.categoria} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-zinc-300 font-medium">{getCategoryName(item.categoria)}</span>
                            <span className="text-zinc-400 font-mono">
                              R$ {Number(item.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({item.porcentagem}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(item.porcentagem, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Evolução Mensal Últimos 6 Meses */}
              <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  Evolução Mensal (Últimos 6 Meses)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {dashboardData.evolucao_mensal.map((m, idx) => (
                    <div key={idx} className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/50 text-center">
                      <span className="text-xs font-bold text-zinc-400 block mb-1">{m.mes}</span>
                      <div className="text-[11px] text-emerald-400">
                        + R$ {m.entradas.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                      </div>
                      <div className="text-[11px] text-red-400">
                        - R$ {m.saidas.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                      </div>
                      <div className="text-xs font-bold text-white mt-1 pt-1 border-t border-zinc-700 font-mono">
                        R$ {m.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* CONTEÚDO DA SUB-ABA VENDAS DA LOJA */}
      {activeSubTab === 'pedidos' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
            <div>
              <h3 className="font-bold text-white text-base">Intenções e Vendas da Loja Oficial</h3>
              <p className="text-xs text-zinc-400">
                Quando os visitantes clicam em comprar na loja, o pedido fica "Pendente". Ao clicar em "Aprovar (OK)", o valor entra automaticamente no caixa da Missão!
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={orderFilterStatus}
                onChange={(e) => setOrderFilterStatus(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white"
              >
                <option value="">Status: Todos</option>
                <option value="pendente">Pendentes</option>
                <option value="concluido">Concluídos (OK)</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
          </div>

          {loadingOrders ? (
            <div className="p-12 text-center text-zinc-400">Carregando pedidos da loja...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800">
              <ShoppingBag className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
              <p className="text-zinc-400">Nenhum pedido registrado com os filtros selecionados.</p>
            </div>
          ) : (
            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/60">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-800/80 text-zinc-400 uppercase font-medium">
                  <tr>
                    <th className="p-3">#ID</th>
                    <th className="p-3">Produto</th>
                    <th className="p-3">Cliente / Contato</th>
                    <th className="p-3">Origem</th>
                    <th className="p-3">Valor</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {orders.map((pedido) => (
                    <tr key={pedido.id} className="hover:bg-zinc-800/40">
                      <td className="p-3 font-mono text-zinc-500">#{pedido.id}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {pedido.produto?.imagem_url && (
                            <img src={pedido.produto.imagem_url} alt="" className="w-8 h-8 rounded object-cover border border-zinc-700" />
                          )}
                          <span className="font-semibold text-white">
                            {pedido.produto?.nome || 'Produto da Loja'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-white font-medium">{pedido.nome_cliente}</div>
                        {pedido.telefone_cliente && <div className="text-[11px] text-zinc-400">{pedido.telefone_cliente}</div>}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 uppercase">
                          {pedido.origem_checkout}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-amber-400">
                        R$ {Number(pedido.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          pedido.status === 'concluido'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : pedido.status === 'pendente'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {pedido.status === 'concluido' ? 'Concluído (OK)' : pedido.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        {pedido.status === 'pendente' && (
                          <>
                            <button
                              onClick={() => handleApproveOrder(pedido)}
                              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg text-xs shadow-sm inline-flex items-center gap-1"
                              title="Aprovar e lançar nas receitas da igreja"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Aprovar (OK)
                            </button>
                            <button
                              onClick={() => handleCancelOrder(pedido)}
                              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-red-400 rounded-lg text-xs"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                        {pedido.status === 'concluido' && (
                          <span className="text-[11px] text-emerald-400 font-semibold inline-flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Contabilizado no Caixa
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DAS SUB-ABAS (DÍZIMOS & OFERTAS, SAÍDAS, EXTRATO) */}
      {(activeSubTab === 'dizimos' || activeSubTab === 'saidas' || activeSubTab === 'extrato') && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar descrição, culto ou membro..."
                value={transSearch}
                onChange={(e) => setTransSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadTransactions()}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white"
              />
            </div>

            {activeSubTab === 'extrato' && (
              <div>
                <select
                  value={transFilterTipo}
                  onChange={(e) => setTransFilterTipo(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="">Tipo: Todos</option>
                  <option value="entrada">Apenas Entradas</option>
                  <option value="saida">Apenas Saídas</option>
                </select>
              </div>
            )}

            <div>
              <button
                onClick={loadTransactions}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Atualizar Resultados
              </button>
            </div>
          </div>

          {/* Tabela de Transações */}
          {loadingTransactions ? (
            <div className="p-12 text-center text-zinc-400">Carregando transações...</div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800 text-zinc-500">
              Nenhuma transação encontrada com os filtros selecionados.
            </div>
          ) : (
            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/60">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-800/80 text-zinc-400 uppercase font-medium">
                  <tr>
                    <th className="p-3">Data</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">Descrição / Culto</th>
                    <th className="p-3">Membro Relacionado</th>
                    <th className="p-3">Método</th>
                    <th className="p-3 text-right">Valor</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {transactions.map((tr) => (
                    <tr key={tr.id} className="hover:bg-zinc-800/40">
                      <td className="p-3 whitespace-nowrap text-zinc-400">
                        {new Date(tr.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tr.tipo === 'entrada' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {getCategoryName(tr.categoria)}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-white">{tr.descricao}</div>
                        {tr.data_culto_evento && (
                          <div className="text-[11px] text-zinc-400">{tr.data_culto_evento}</div>
                        )}
                      </td>
                      <td className="p-3 text-zinc-300">
                        {tr.membro ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                            <Users className="w-3 h-3" /> {tr.membro.nome}
                          </span>
                        ) : (
                          <span className="text-zinc-500">-</span>
                        )}
                      </td>
                      <td className="p-3 uppercase text-zinc-400">{tr.metodo_pagamento || 'PIX'}</td>
                      <td className={`p-3 text-right font-mono font-bold whitespace-nowrap ${
                        tr.tipo === 'entrada' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {tr.tipo === 'entrada' ? '+' : '-'} R$ {Number(tr.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteTransaction(tr.id)}
                          className="p-1 text-zinc-500 hover:text-red-400"
                          title="Excluir"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Nova Transação Manual */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <DollarSign className={`w-5 h-5 ${modalTipo === 'entrada' ? 'text-emerald-400' : 'text-red-400'}`} />
                Registrar {modalTipo === 'entrada' ? 'Entrada (Dízimo/Oferta)' : 'Saída / Despesa'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalTipo('entrada');
                    setModalFormData({ ...modalFormData, categoria: 'dizimo' });
                  }}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    modalTipo === 'entrada'
                      ? 'bg-emerald-500 text-black border-emerald-500'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  Entrada (Receita)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalTipo('saida');
                    setModalFormData({ ...modalFormData, categoria: 'manutencao_templo' });
                  }}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    modalTipo === 'saida'
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  Saída (Despesa)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Categoria *</label>
                <select
                  value={modalFormData.categoria}
                  onChange={(e) => setModalFormData({ ...modalFormData, categoria: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {modalTipo === 'entrada' ? (
                    <>
                      <option value="dizimo">Dízimo de Membro</option>
                      <option value="oferta">Oferta Voluntária de Culto</option>
                      <option value="evento_servico">Inscrição de Evento / Serviço</option>
                      <option value="doacao">Doação Especial</option>
                      <option value="venda_loja">Venda da Loja Oficial</option>
                      <option value="outra_entrada">Outra Entrada</option>
                    </>
                  ) : (
                    <>
                      <option value="acao_social">Ação Social & Cestas Básicas</option>
                      <option value="manutencao_templo">Manutenção do Templo & Estrutura</option>
                      <option value="equipamentos_som">Equipamentos de Som & Mídia</option>
                      <option value="contas_consumo">Contas de Consumo (Luz, Água, Net)</option>
                      <option value="ajuda_custo">Ajuda de Custo & Missões</option>
                      <option value="evangelismo">Evangelismo & Eventos</option>
                      <option value="outra_saida">Outra Despesa</option>
                    </>
                  )}
                </select>
              </div>

              {/* Se for Dízimo ou Entrada, permite selecionar o membro */}
              {modalTipo === 'entrada' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Vincular a Membro (Opcional)</label>
                  <select
                    value={modalFormData.membro_id}
                    onChange={(e) => setModalFormData({ ...modalFormData, membro_id: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="">Nenhum (Anônimo / Geral da Congregação)</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome} ({m.cargo_ministerio || 'Membro'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={modalFormData.valor}
                  onChange={(e) => setModalFormData({ ...modalFormData, valor: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white font-bold text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={modalFormData.data}
                    onChange={(e) => setModalFormData({ ...modalFormData, data: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Forma de Pagamento</label>
                  <select
                    value={modalFormData.metodo_pagamento}
                    onChange={(e) => setModalFormData({ ...modalFormData, metodo_pagamento: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="pix">PIX</option>
                    <option value="dinheiro">Dinheiro em Espécie</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="transferencia">Transferência Bancária</option>
                    <option value="boleto">Boleto</option>
                  </select>
                </div>
              </div>

              {modalTipo === 'entrada' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Culto / Evento (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Culto de Santa Ceia, Culto da Família"
                    value={modalFormData.data_culto_evento}
                    onChange={(e) => setModalFormData({ ...modalFormData, data_culto_evento: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Descrição / Finalidade</label>
                <input
                  type="text"
                  placeholder={modalTipo === 'entrada' ? 'Ex: Dízimo do mês de Outubro' : 'Ex: Compra de 10 Cestas Básicas para famílias'}
                  value={modalFormData.descricao}
                  onChange={(e) => setModalFormData({ ...modalFormData, descricao: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-lg shadow-lg disabled:opacity-50"
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
