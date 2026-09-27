import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
  ShieldCheck, TrendingUp, TrendingDown, Wallet, Heart, 
  Package, Building, Sparkles, CheckCircle2, FileText, ArrowRight,
  HelpCircle, Compass, Users
} from 'lucide-react';
import MainLayout from '../../Layouts/MainLayout';
import { PublicTransparencyData, SiteSettings } from '../../types';

interface TransparenciaProps {
  transparencia: PublicTransparencyData;
  configuracoes?: SiteSettings;
}

export default function Transparencia({ transparencia }: TransparenciaProps) {
  const { ano, total_arrecadado, total_investido, saldo_reserva, destinacoes, fontes, investimentos_recentes } = transparencia;

  return (
    <MainLayout>
      <Head title="Transparência & Prestação de Contas - Missão Resgatar" />

      <div className="min-h-screen bg-slate-950 text-slate-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">

          {/* Hero Section */}
          <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 text-center border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Prestação de Contas Pública • Exercício {ano}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-100 tracking-tight">
                Transparência no <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">Reino de Deus</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
                "Pois zelamos pelo que é honesto, não só diante do Senhor, mas também diante de todos os homens." (2 Coríntios 8:21).
                Acompanhe com clareza e fidelidade como as contribuições são investidas na obra missionária e social da Missão Resgatar.
              </p>
            </div>
          </div>

          {/* Cards de Resumo Consolidado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/70 border border-emerald-500/25 p-6 rounded-2xl relative overflow-hidden backdrop-blur-sm">
              <div className="flex items-center justify-between text-emerald-400 mb-2">
                <span className="text-xs font-mono uppercase tracking-wider">Arrecadação Total</span>
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-white font-mono tracking-tight">
                R$ {total_arrecadado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Fruto dos dízimos de fidelidade, ofertas voluntárias dos cultos e vendas da loja oficial.
              </p>
            </div>

            <div className="bg-slate-900/70 border border-red-500/25 p-6 rounded-2xl relative overflow-hidden backdrop-blur-sm">
              <div className="flex items-center justify-between text-red-400 mb-2">
                <span className="text-xs font-mono uppercase tracking-wider">Total Investido na Obra</span>
                <TrendingDown className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-white font-mono tracking-tight">
                R$ {total_investido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Destinado à ação social com cestas básicas, manutenção do templo, evangelismo e som.
              </p>
            </div>

            <div className="bg-slate-900/70 border border-amber-500/25 p-6 rounded-2xl relative overflow-hidden backdrop-blur-sm">
              <div className="flex items-center justify-between text-amber-400 mb-2">
                <span className="text-xs font-mono uppercase tracking-wider">Fundo de Reserva / Caixa</span>
                <Wallet className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-white font-mono tracking-tight">
                R$ {saldo_reserva.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Reserva estratégica para emergências ministeriais, reformas e projetos futuros.
              </p>
            </div>
          </div>

          {/* Gráficos de Destinação e Fontes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Onde Foi Investido */}
            <div className="bg-slate-900/60 border border-slate-800 p-7 rounded-3xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Para onde vão os recursos?</h3>
                  <p className="text-xs text-slate-400">Distribuição percentual das destinações realizadas</p>
                </div>
              </div>

              {destinacoes.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">Nenhum investimento registrado neste ano.</p>
              ) : (
                <div className="space-y-4 pt-2">
                  {destinacoes.map((item) => (
                    <div key={item.categoria} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-200 font-medium">{item.titulo}</span>
                        <span className="text-amber-400 font-mono font-bold">
                          R$ {Number(item.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({item.porcentagem}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(item.porcentagem, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Origem das Receitas */}
            <div className="bg-slate-900/60 border border-slate-800 p-7 rounded-3xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Origem da Arrecadação</h3>
                  <p className="text-xs text-slate-400">Como o povo de Deus participa financeiramente</p>
                </div>
              </div>

              {fontes.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">Nenhuma receita registrada neste ano.</p>
              ) : (
                <div className="space-y-4 pt-2">
                  {fontes.map((item) => (
                    <div key={item.categoria} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-200 font-medium">{item.titulo}</span>
                        <span className="text-emerald-400 font-mono font-bold">
                          R$ {Number(item.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({item.porcentagem}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(item.porcentagem, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Investimentos Recentes Abertos */}
          {investimentos_recentes && investimentos_recentes.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 p-7 rounded-3xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Últimos Investimentos na Obra</h3>
                    <p className="text-xs text-slate-400">Transparência em tempo real de compras e destinações</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {investimentos_recentes.map((inv) => (
                  <div 
                    key={inv.id} 
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-white text-xs">{inv.descricao}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(inv.data).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-red-400 text-sm whitespace-nowrap">
                      R$ {Number(inv.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manifesto de Integridade e Contato */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-4">
            <h3 className="text-xl font-bold text-white font-serif">
              Compromisso Ministerial de Integridade
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
              A Missão Resgatar adota padrões de governança, conformidade e prestação de contas periódica aos seus membros e à sociedade. Qualquer dúvida sobre a destinação ou relatórios contábeis detalhados pode ser solicitada à nossa secretaria ou conselho fiscal.
            </p>
            <div className="pt-2">
              <Link
                href="/loja"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-xl transition-all shadow-md"
              >
                <Package className="w-4 h-4" />
                Apoiar a Missão através da Loja Oficial
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
