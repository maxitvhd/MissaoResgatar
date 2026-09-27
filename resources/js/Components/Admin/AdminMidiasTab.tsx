import React, { useState, useEffect, useCallback } from 'react';
import {
  Images, Search, RefreshCw, Trash2, Edit, Copy, ExternalLink,
  FileText, Film, X, Check, AlertTriangle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { MediaFile, MediaList, MediaUsage } from '../../types';
import { fetchMedias, renameMedia, deleteMedia } from '../../lib/api';

interface AdminMidiasTabProps {
  triggerSuccess: (msg: string) => void;
}

// Rotulos amigaveis das pastas de midia
const ROTULOS_PASTA: Record<string, string> = {
  todas: 'Todas as Mídias',
  galeria: 'Galeria de Fotos',
  produtos: 'Produtos da Loja',
  noticias: 'Notícias & Blog',
  eventos: 'Agenda de Eventos',
  atracoes: 'Atrações & Preletores',
  patrocinadores: 'Patrocinadores',
  site: 'Logo & Backgrounds',
  aulas: 'Materiais de Aulas',
  financeiro: 'Comprovantes',
  membros: 'Fotos de Membros',
  uploads: 'Uploads Antigos',
};

// Converte bytes em texto legivel
function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Descobre o icone conforme o tipo do arquivo
function iconeDoArquivo(mime: string, nome: string) {
  const m = (mime || '').toLowerCase();
  if (m.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(nome)) return <Film className="w-8 h-8 text-amber-400" />;
  if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i.test(nome)) return <FileText className="w-8 h-8 text-sky-400" />;
  return null;
}

export default function AdminMidiasTab({ triggerSuccess }: AdminMidiasTabProps) {
  const [dados, setDados] = useState<MediaList | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pasta, setPasta] = useState<string>('');
  const [busca, setBusca] = useState<string>('');       // texto digitado
  const [buscaAplicada, setBuscaAplicada] = useState<string>(''); // texto pesquisado
  const [pagina, setPagina] = useState<number>(1);

  // Modal renomear
  const [editando, setEditando] = useState<MediaFile | null>(null);
  const [novoNome, setNovoNome] = useState<string>('');
  const [salvando, setSalvando] = useState<boolean>(false);

  // Modal apagar
  const [excluindo, setExcluindo] = useState<MediaFile | null>(null);
  const [usos, setUsos] = useState<MediaUsage[]>([]);
  const [confirmarUso, setConfirmarUso] = useState<boolean>(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const resposta = await fetchMedias(pasta || undefined, buscaAplicada || undefined, pagina);
      setDados(resposta);
    } catch (err) {
      console.error(err);
      triggerSuccess('Erro ao carregar as mídias.');
    } finally {
      setLoading(false);
    }
  }, [pasta, buscaAplicada, pagina, triggerSuccess]);

  useEffect(() => { carregar(); }, [carregar]);

  // Espera o usuario parar de digitar para pesquisar
  useEffect(() => {
    const timer = setTimeout(() => {
      setBuscaAplicada(busca.trim());
      setPagina(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [busca]);

  // Trocar de pasta volta para a primeira pagina
  const trocarPasta = (nova: string) => {
    setPasta(nova);
    setPagina(1);
  };

  const copiarUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      triggerSuccess('URL da mídia copiada!');
    } catch {
      alert('Não foi possível copiar. Copie manualmente: ' + url);
    }
  };

  // Renomear: o backend corrige as URLs que ja apontam para a midia
  const salvarRenomeacao = async () => {
    if (!editando || !novoNome.trim()) return;
    setSalvando(true);
    try {
      const resposta = await renameMedia(editando.caminho, novoNome.trim());
      triggerSuccess(
        resposta.referencias_atualizadas > 0
          ? `Mídia renomeada! ${resposta.referencias_atualizadas} referência(s) atualizada(s).`
          : 'Mídia renomeada com sucesso!'
      );
      setEditando(null);
      setNovoNome('');
      carregar();
    } catch (err: any) {
      alert(err.message || 'Erro ao renomear a mídia.');
    } finally {
      setSalvando(false);
    }
  };

  // Apagar: se estiver em uso, o backend bloqueia ate confirmar
  const confirmarExclusao = async () => {
    if (!excluindo) return;
    setSalvando(true);
    try {
      const resposta = await deleteMedia(excluindo.caminho, confirmarUso);
      triggerSuccess(resposta.message);

      // Registros com coluna obrigatoria ficam sem imagem e precisam de atencao
      if (resposta.sem_imagem && resposta.sem_imagem.length > 0) {
        alert(
          'Atenção: estes registros ficaram sem imagem e precisam ser atualizados manualmente:\n\n' +
          resposta.sem_imagem.join('\n')
        );
      }

      fecharModalExclusao();
      carregar();
    } catch (err: any) {
      // 409: midia em uso, mostra onde ela esta sendo usada
      if (err.emUso && err.emUso.length > 0) {
        setUsos(err.emUso);
        setConfirmarUso(false);
      } else {
        alert(err.message || 'Erro ao excluir a mídia.');
      }
    } finally {
      setSalvando(false);
    }
  };

  const abrirModalExclusao = (arquivo: MediaFile) => {
    setExcluindo(arquivo);
    setUsos(arquivo.em_uso || []);
    setConfirmarUso(false);
  };

  const fecharModalExclusao = () => {
    setExcluindo(null);
    setUsos([]);
    setConfirmarUso(false);
  };

  const arquivos = dados?.arquivos || [];
  const total = dados?.total || 0;

  return (
    <div className="space-y-6 text-left">
      {/* CABECALHO */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-white font-black text-xl flex items-center gap-2">
            <Images className="w-5 h-5 text-amber-500" />
            Gerenciador de Mídias
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            {total} arquivo(s) em {dados?.pastas?.length || 0} pastas — organize, renomeie e exclua as mídias do site.
          </p>
        </div>
        <button
          onClick={carregar}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 text-xs font-bold disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
        {/* MENU DE PASTAS */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 h-fit">
          <p className="text-[10px] font-mono text-slate-500 uppercase mb-2 px-1">Pastas</p>
          <button
            onClick={() => trocarPasta('')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between mb-1 ${
              pasta === '' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>{ROTULOS_PASTA.todas}</span>
          </button>
          {(dados?.pastas || []).map((p) => (
            <button
              key={p}
              onClick={() => trocarPasta(p)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between mb-1 ${
                pasta === p ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="truncate">{ROTULOS_PASTA[p] || p}</span>
              <span className="text-[10px] font-mono text-slate-500">{dados?.contagem?.[p] ?? 0}</span>
            </button>
          ))}
        </div>

        {/* LISTA DE ARQUIVOS */}
        <div className="space-y-4">
          {/* BUSCA */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar mídia pelo nome do arquivo..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
            />
          </div>

          {loading ? (
            <div className="text-center py-16 text-slate-500 text-xs">Carregando mídias...</div>
          ) : arquivos.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-xl">
              <Images className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 text-xs">Nenhuma mídia encontrada nesta pasta.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {arquivos.map((arquivo) => {
                const icone = iconeDoArquivo(arquivo.mime, arquivo.nome);
                return (
                  <div key={arquivo.caminho} className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                    {/* PREVIA */}
                    <div className="relative h-28 bg-slate-950 flex items-center justify-center overflow-hidden">
                      {icone || (
                        <img src={arquivo.url} alt={arquivo.nome} loading="lazy" className="w-full h-full object-cover" />
                      )}
                      {arquivo.em_uso.length > 0 && (
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-emerald-500/90 text-black text-[9px] font-black rounded">
                          EM USO
                        </span>
                      )}
                    </div>

                    {/* DADOS */}
                    <div className="p-2.5 flex-1">
                      <p className="text-[11px] text-slate-200 font-bold truncate" title={arquivo.nome}>{arquivo.nome}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {formatarTamanho(arquivo.tamanho)} · {arquivo.pasta}
                      </p>
                      {arquivo.em_uso.length > 0 && (
                        <p className="text-[10px] text-emerald-400 mt-1 truncate">
                          {arquivo.em_uso.length} registro(s) usando
                        </p>
                      )}
                    </div>

                    {/* ACOES */}
                    <div className="flex border-t border-slate-800">
                      <button
                        onClick={() => copiarUrl(arquivo.url)}
                        title="Copiar URL"
                        className="flex-1 py-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/50 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5 mx-auto" />
                      </button>
                      <button
                        onClick={() => window.open(arquivo.url, '_blank')}
                        title="Abrir arquivo"
                        className="flex-1 py-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/50 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mx-auto" />
                      </button>
                      <button
                        onClick={() => { setEditando(arquivo); setNovoNome(arquivo.nome); }}
                        title="Renomear"
                        className="flex-1 py-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800/50 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5 mx-auto" />
                      </button>
                      <button
                        onClick={() => abrirModalExclusao(arquivo)}
                        title="Excluir"
                        className="flex-1 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 mx-auto" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PAGINACAO */}
          {(dados?.paginas || 1) > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina <= 1}
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-400 font-mono">
                Página {dados?.pagina} de {dados?.paginas} ({total} arquivos)
              </span>
              <button
                onClick={() => setPagina((p) => Math.min(dados?.paginas || 1, p + 1))}
                disabled={pagina >= (dados?.paginas || 1)}
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL RENOMEAR */}
      {editando && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-black text-sm flex items-center gap-2">
                <Edit className="w-4 h-4 text-sky-400" /> Renomear Mídia
              </h4>
              <button onClick={() => setEditando(null)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Nome do arquivo</label>
            <input
              type="text"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-sky-500 mb-2"
            />
            <p className="text-[10px] text-slate-500 mb-4">
              A pasta ({editando.pasta}) e a extensão são mantidas. As URLs já publicadas no site são corrigidas automaticamente.
            </p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditando(null)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={salvarRenomeacao}
                disabled={salvando || !novoNome.trim()}
                className="px-3 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EXCLUIR */}
      {excluindo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-black text-sm flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500" /> Excluir Mídia
              </h4>
              <button onClick={fecharModalExclusao} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-3 break-all">
              Tem certeza que deseja apagar <span className="text-white font-bold">{excluindo.nome}</span>?
            </p>

            {/* AVISO DE USO */}
            {usos.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/40 rounded-lg p-3 mb-3">
                <p className="text-[11px] text-amber-400 font-bold flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Esta mídia está sendo usada em {usos.length} lugar(es):
                </p>
                <ul className="space-y-1 max-h-32 overflow-y-auto">
                  {usos.map((uso, i) => (
                    <li key={i} className="text-[10px] text-slate-300 font-mono">
                      • {uso.rotulo}: <span className="text-white">{uso.titulo}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-amber-300/80 mt-2">
                  Se apagar mesmo assim, essas referências serão limpas e ficará sem imagem.
                </p>
              </div>
            )}

            {usos.length > 0 && (
              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmarUso}
                  onChange={(e) => setConfirmarUso(e.target.checked)}
                  className="w-3.5 h-3.5 accent-red-500"
                />
                <span className="text-xs text-slate-300">Apagar mesmo assim</span>
              </label>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={fecharModalExclusao}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExclusao}
                disabled={salvando || (usos.length > 0 && !confirmarUso)}
                className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {salvando ? 'Apagando...' : 'Apagar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
