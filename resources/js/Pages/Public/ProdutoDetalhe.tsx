import React, { useEffect, useState } from "react";
import { Link } from "@inertiajs/react";
import {
  ChevronLeft, Truck, Package, Sparkles, ShoppingBag, ExternalLink
} from "lucide-react";
import MainLayout from "../../Layouts/MainLayout";
import { Product } from "../../types";
import { fetchSettings } from "../../lib/api";

interface ProdutoDetalheProps {
  produto: Product;
}

export default function ProdutoDetalhe({ produto }: ProdutoDetalheProps) {
  const [whatsapp, setWhatsapp] = useState<string>("");
  const produtoAtual = (produto as any)?.data ?? produto;

  useEffect(() => {
    fetchSettings()
      .then((data) => setWhatsapp(data.whatsappLoja || data.whatsappFlutuante || ""))
      .catch(() => {});
  }, []);

  // Sanitiza o número do WhatsApp (somente dígitos, com 55 do Brasil)
  const numeroLimpo = (() => {
    let limpo = (whatsapp || "").replace(/\D/g, "");
    if (limpo.length === 10 || limpo.length === 11) limpo = "55" + limpo;
    return limpo;
  })();

  const mensagem = encodeURIComponent(
    `Olá! Tenho interesse no produto "${produtoAtual.name}" (${window.location.href}).`
  );

  const imagens: string[] = [
    produtoAtual.imageUrl,
    ...(produtoAtual.galleryImages || []),
  ].filter(Boolean);

  return (
    <MainLayout>
      <div className="py-12 bg-[#080b13] min-h-[70vh]">
        <div className="max-w-5xl mx-auto px-4">
          <Link
            href="/loja"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors mb-6"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Voltar para a loja
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* GALERIA */}
            <div>
              {imagens.length > 0 ? (
                <div className="space-y-3">
                  <img
                    src={imagens[0]}
                    alt={produtoAtual.name}
                    className="w-full rounded-2xl border border-slate-800 object-cover max-h-[28rem]"
                  />
                  {imagens.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {imagens.slice(1, 5).map((img: string, i: number) => (
                        <img
                          key={i}
                          src={img}
                          alt={`${produtoAtual.name} ${i + 2}`}
                          loading="lazy"
                          className="w-full aspect-square object-cover rounded-lg border border-slate-800"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full aspect-square rounded-2xl border border-slate-800 bg-slate-900/40 flex items-center justify-center">
                  <Package className="w-12 h-12 text-slate-700" />
                </div>
              )}
            </div>

            {/* INFORMACOES */}
            <div>
              {produtoAtual.categoryName && (
                <div className="text-xs font-mono uppercase tracking-wider text-amber-500 mb-2">
                  {produtoAtual.categoryName}
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 mb-4">
                {produtoAtual.name}
              </h1>

              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-2xl font-black text-amber-500">
                  R$ {Number(produtoAtual.discountPrice || produtoAtual.price).toFixed(2).replace(".", ",")}
                </span>
                {produtoAtual.discountPrice && (
                  <span className="text-sm text-slate-500 line-through">
                    R$ {Number(produtoAtual.price).toFixed(2).replace(".", ",")}
                  </span>
                )}
              </div>

              {produtoAtual.description && (
                <p className="text-sm text-slate-300 leading-relaxed mb-5 whitespace-pre-line">
                  {produtoAtual.description}
                </p>
              )}

              {produtoAtual.details && (
                <div className="text-sm text-slate-300 leading-relaxed mb-5 whitespace-pre-line border-t border-slate-800 pt-5">
                  {produtoAtual.details}
                </div>
              )}

              <div className="space-y-2 text-xs text-slate-400 mb-6">
                <p className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-amber-500" />
                  {produtoAtual.shippingInfo || "Envio para todo o Brasil"}
                </p>
                <p className="flex items-center gap-2">
                  {produtoAtual.inStock ? (
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Package className="w-3.5 h-3.5 text-red-400" />
                  )}
                  {produtoAtual.inStock ? "Disponível em estoque" : "Produto esgotado"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {produtoAtual.purchaseUrl && (
                  <a
                    href={produtoAtual.purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 rounded-xl text-slate-950 text-sm font-black transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" /> Comprar agora
                  </a>
                )}

                {numeroLimpo && (
                  <a
                    href={`https://wa.me/${numeroLimpo}?text=${mensagem}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white text-sm font-bold transition-colors"
                  >
                    Falar no WhatsApp
                  </a>
                )}
              </div>

              {!produtoAtual.purchaseUrl && !numeroLimpo && (
                <p className="text-xs text-slate-500">
                  Para comprar este item, fale com a igreja pelos canais oficiais de contato.
                </p>
              )}
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800 flex items-center gap-2">
            <Link href="/loja" className="text-xs text-amber-500 hover:underline">
              ← Voltar para a loja
            </Link>
            <span className="text-slate-700">|</span>
            <a
              href="/sitemap.xml"
              className="text-xs text-slate-500 hover:text-amber-400 inline-flex items-center gap-1"
            >
              Mapa do site <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
