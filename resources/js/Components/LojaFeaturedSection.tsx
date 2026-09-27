import React, { useState, useEffect } from "react";
import { ShoppingBag, ArrowRight, Truck, Sparkles } from "lucide-react";
import { Link } from "@inertiajs/react";
import { fetchProducts } from "../lib/api";
import { Product } from "../types";
import ProductDetailModal from "./ProductDetailModal";

export default function LojaFeaturedSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts({ featured: true })
      .then((data) => {
        if (data.length === 0) {
          return fetchProducts().then((all) => setProducts(all.slice(0, 4)));
        }
        setProducts(data.slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-slate-950 border-t border-slate-900/60 relative overflow-hidden" id="secao-loja">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div className="text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono uppercase tracking-wider mb-3">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Artigos & Publicações</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-100 tracking-tight">
              Loja <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">Oficial</span>
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-400 font-light">
              Bíblias de estudo, literatura edificante, vestuário e produtos oficiais da missão.
            </p>
          </div>

          <Link
            href="/loja"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 text-xs font-mono font-semibold transition-all shrink-0 hover:border-amber-500/40"
          >
            <span>Ver Toda a Loja</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {products.map((prod) => {
            const finalPrice = prod.discountPrice || prod.price;
            const hasDiscount = Boolean(prod.discountPrice && prod.discountPrice < prod.price);

            return (
              <div
                key={prod.id}
                onClick={() => setSelectedProduct(prod)}
                className="group bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col shadow-lg hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-1 cursor-pointer"
              >
                <div className="relative aspect-square bg-slate-950 overflow-hidden">
                  <img
                    src={prod.imageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
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
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono uppercase backdrop-blur-md">
                        Checkout
                      </span>
                    )}
                  </div>
                </div>

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

        {/* Modal de Detalhes e Slide de Fotos */}
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      </div>
    </section>
  );
}
