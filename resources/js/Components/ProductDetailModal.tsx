import React, { useState, useEffect } from "react";
import { 
  X, ChevronLeft, ChevronRight, ShoppingBag, Truck, CheckCircle2, 
  MessageCircle, CreditCard, ArrowUpRight, Sparkles, Image as ImageIcon,
  ShieldCheck, Share2, Check
} from "lucide-react";
import { Product } from "../types";
import { registerStoreOrderClick } from "../lib/api";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Combina a foto principal e as fotos da galeria, removendo duplicadas ou vazias
  const allImages = React.useMemo(() => {
    if (!product) return [];
    const list: string[] = [];
    if (product.imageUrl && product.imageUrl.trim()) {
      list.push(product.imageUrl.trim());
    }
    if (Array.isArray(product.galleryImages)) {
      product.galleryImages.forEach((img) => {
        if (img && typeof img === "string" && img.trim() && !list.includes(img.trim())) {
          list.push(img.trim());
        }
      });
    }
    if (list.length === 0) {
      list.push("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80");
    }
    return list;
  }, [product]);

  // Reseta índice ao trocar de produto
  useEffect(() => {
    setActiveImageIndex(0);
    setCopiedLink(false);
  }, [product]);

  // Teclado: Setas para trocar slide, ESC para fechar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!product) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        setActiveImageIndex((prev) => (prev + 1) % allImages.length);
      }
      if (e.key === "ArrowLeft") {
        setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [product, allImages, onClose]);

  if (!product) return null;

  const finalPrice = product.discountPrice || product.price;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handleWhatsappOrder = () => {
    registerStoreOrderClick({
      produto_id: Number(product.id),
      origem_checkout: "whatsapp",
    });

    const msg = `Olá! Tenho interesse no produto da Loja Oficial Missão Resgatar:%0A%0A*${product.name}*%0AValor: R$ ${finalPrice.toFixed(2).replace(".", ",")}%0ACódigo/ID: #${product.id}%0A%0AGostaria de saber sobre disponibilidade e envio.`;
    window.open(`https://wa.me/5511999999999?text=${msg}`, "_blank");
  };

  const handleLinkClick = () => {
    registerStoreOrderClick({
      produto_id: Number(product.id),
      origem_checkout: "link_externo",
    });
  };

  const handleShareProduct = () => {
    const url = window.location.origin + "/loja";
    navigator.clipboard.writeText(`${product.name} - Loja Oficial Missão Resgatar\n${url}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-7 relative shadow-2xl space-y-6 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Actions */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-mono uppercase text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 font-bold">
              {product.categoryName || "Artigos & Livros"}
            </span>
            {product.inStock ? (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Em Estoque
              </span>
            ) : (
              <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                Esgotado
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareProduct}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Compartilhar produto"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Fechar (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* SLIDE DE FOTOS DO PRODUTO (7 cols on desktop) */}
          <div className="md:col-span-6 lg:col-span-7 space-y-3">
            <div className="relative aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner group">
              <img
                key={allImages[activeImageIndex]}
                src={allImages[activeImageIndex]}
                alt={product.name}
                className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
              />

              {/* Controles de Próximo e Anterior (quando houver mais de 1 foto) */}
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/80 hover:bg-amber-500 hover:text-slate-950 text-white backdrop-blur-md border border-slate-700/80 transition-all cursor-pointer shadow-lg z-10"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/80 hover:bg-amber-500 hover:text-slate-950 text-white backdrop-blur-md border border-slate-700/80 transition-all cursor-pointer shadow-lg z-10"
                    aria-label="Próxima foto"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Contador de Imagens */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-slate-300">
                    {activeImageIndex + 1} / {allImages.length} fotos
                  </div>
                </>
              )}

              {hasDiscount && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-mono font-bold uppercase shadow-lg">
                  -{product.discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Carrossel / Miniaturas de Fotos em Lote */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer bg-slate-950 ${
                      activeImageIndex === idx
                        ? "border-amber-400 shadow-md shadow-amber-500/20 scale-105"
                        : "border-slate-800/80 opacity-60 hover:opacity-100 hover:border-slate-700"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Miniatura ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFORMAÇÕES & AÇÕES DE COMPRA (5 cols on desktop) */}
          <div className="md:col-span-6 lg:col-span-5 space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 leading-snug">
                {product.name}
              </h2>
              {product.slug && (
                <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                  Ref: {product.slug}
                </span>
              )}
            </div>

            {/* Bloco de Preço */}
            <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800/80">
              {hasDiscount && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-500 line-through">
                    R$ {product.price.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    Economize R$ {(product.price - (product.discountPrice || 0)).toFixed(2).replace(".", ",")}
                  </span>
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-amber-400">
                  R$ {finalPrice.toFixed(2).replace(".", ",")}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">à vista</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-850 flex items-center gap-2 text-xs text-slate-400">
                <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[11px]">{product.shippingInfo || "Envio para todo o Brasil com rastreio"}</span>
              </div>
            </div>

            {/* Descrição do Produto */}
            {product.description && (
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block font-semibold">
                  Descrição
                </span>
                <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed whitespace-pre-line bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                  {product.description}
                </p>
              </div>
            )}

            {/* Detalhes & Especificações */}
            {product.details && (
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block font-semibold">
                  Especificações / Detalhes
                </span>
                <div className="text-xs text-slate-400 font-mono whitespace-pre-line leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                  {product.details}
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="space-y-2 pt-2">
              {product.purchaseUrl ? (
                <>
                  <a
                    href={product.purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer text-sm"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Comprar no Link Oficial / Checkout</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={handleWhatsappOrder}
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80 font-medium rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Fazer Pedido ou Tirar Dúvidas pelo WhatsApp</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleWhatsappOrder}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer text-sm"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Comprar / Fazer Pedido no WhatsApp</span>
                </button>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
