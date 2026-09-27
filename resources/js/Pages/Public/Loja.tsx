import React, { useState, useMemo } from "react";
import { Head } from "@inertiajs/react";
import { 
  ShoppingBag, Search, Tag, Truck, CheckCircle2, MessageCircle, 
  X, Sparkles, Filter, ChevronRight, BookOpen, Shirt, Package, Heart,
  CreditCard, ArrowUpRight, ExternalLink
} from "lucide-react";
import MainLayout from "../../Layouts/MainLayout";
import ProductDetailModal from "../../Components/ProductDetailModal";
import { Product, ProductCategory } from "../../types";
import { registerStoreOrderClick } from "../../lib/api";

interface LojaProps {
  categorias: ProductCategory[];
  produtos: Product[];
}

export default function Loja({ categorias = [], produtos = [] }: LojaProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    return produtos.filter((p) => {
      const matchCat =
        selectedCategory === "todas" ||
        p.categoryId === selectedCategory ||
        p.categoryName?.toLowerCase() === selectedCategory.toLowerCase();

      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchSearch;
    });
  }, [produtos, selectedCategory, searchQuery]);

  const handleWhatsappOrder = (prod: Product) => {
    registerStoreOrderClick({
      produto_id: Number(prod.id),
      origem_checkout: "whatsapp",
    });

    const finalPrice = prod.discountPrice || prod.price;
    const msg = `Olá! Tenho interesse no produto da Loja Oficial Missão Resgatar:%0A%0A*${prod.name}*%0AValor: R$ ${finalPrice.toFixed(2).replace(".", ",")}%0ACódigo/ID: #${prod.id}%0A%0AGostaria de saber sobre disponibilidade e envio.`;
    window.open(`https://wa.me/5511999999999?text=${msg}`, "_blank");
  };

  const handleLinkClick = (prod: Product) => {
    registerStoreOrderClick({
      produto_id: Number(prod.id),
      origem_checkout: "link_externo",
    });
  };

  return (
    <MainLayout>
      <Head title="Loja Oficial - Missão Resgatar" />

      <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Header Banner */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-12 text-center shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono uppercase tracking-wider">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Loja Oficial da Missão Resgatar</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-100 tracking-tight">
                Materiais, Bíblias & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">Vestuário</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
                Adquira bíblias de estudo, livros cristãos, camisetas oficiais da Missão Resgatar e produtos que abençoam a obra missionária.
              </p>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-md">
            {/* Categories Selector */}
            <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
              <button
                type="button"
                onClick={() => setSelectedCategory("todas")}
                className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  selectedCategory === "todas"
                    ? "bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                Todas ({produtos.length})
              </button>

              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(String(cat.id))}
                  className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    selectedCategory === String(cat.id)
                      ? "bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {cat.nome} {cat.produtos_count !== undefined ? `(${cat.produtos_count})` : ""}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-amber-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/20 border border-slate-800 rounded-2xl">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-300">Nenhum produto encontrado</h3>
              <p className="text-xs text-slate-500 mt-1">Tente mudar os filtros de categoria ou termo de busca.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((prod) => {
                const finalPrice = prod.discountPrice || prod.price;
                const hasDiscount = Boolean(prod.discountPrice && prod.discountPrice < prod.price);

                return (
                  <div
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className="group bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-1"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square bg-slate-950 overflow-hidden">
                      <img
                        src={prod.imageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      {/* Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                        <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-300 text-[10px] font-mono uppercase">
                          {prod.categoryName || "Geral"}
                        </span>
                        {hasDiscount && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[10px] font-bold font-mono uppercase shadow-md">
                            -{prod.discountPercent}% OFF
                          </span>
                        )}
                        {prod.purchaseUrl && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono uppercase flex items-center gap-1 backdrop-blur-md">
                            <CreditCard className="w-2.5 h-2.5" />
                            Checkout
                          </span>
                        )}
                      </div>

                      {prod.isFeatured && (
                        <div className="absolute top-2.5 right-2.5 z-10">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-bold font-mono uppercase flex items-center gap-1 shadow-md">
                            <Sparkles className="w-3 h-3 fill-current" />
                            Destaque
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                          {prod.name}
                        </h3>
                        {prod.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-light leading-relaxed">
                            {prod.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-800/60 flex items-end justify-between">
                        <div>
                          {hasDiscount && (
                            <span className="text-[10px] text-slate-500 line-through block">
                              R$ {prod.price.toFixed(2).replace(".", ",")}
                            </span>
                          )}
                          <span className="text-base font-bold text-amber-400 font-mono">
                            R$ {finalPrice.toFixed(2).replace(".", ",")}
                          </span>
                        </div>

                        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          Frete
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Product Detail Modal com Slide de Fotos */}
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />

        </div>
      </div>
    </MainLayout>
  );
}
