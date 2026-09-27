import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, Plus, Edit, Trash2, Tag, Upload, Truck, 
  Sparkles, X, Check, Percent, Layers, DollarSign, Image as ImageIcon,
  Images, Star
} from "lucide-react";
import { 
  fetchProducts, fetchProductCategories, createProductCategory, 
  deleteProductCategory, createProduct, updateProduct, deleteProduct, 
  uploadImage, uploadMultipleFiles 
} from "../../lib/api";
import { Product, ProductCategory } from "../../types";

interface AdminLojaTabProps {
  triggerSuccess: (msg: string) => void;
}

export default function AdminLojaTab({ triggerSuccess }: AdminLojaTabProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Category Modal / Form
  const [showCatModal, setShowCatModal] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>("");
  const [newCatDesc, setNewCatDesc] = useState<string>("");

  // Product Form
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [uploadingImg, setUploadingImg] = useState<boolean>(false);
  const [uploadingBatch, setUploadingBatch] = useState<boolean>(false);
  const [extraImgUrl, setExtraImgUrl] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [discountPrice, setDiscountPrice] = useState<string>("");
  const [shippingInfo, setShippingInfo] = useState<string>("Envio para todo o Brasil");
  const [purchaseUrl, setPurchaseUrl] = useState<string>("");
  const [inStock, setInStock] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodsData, catsData] = await Promise.all([
        fetchProducts(),
        fetchProductCategories(),
      ]);
      setProducts(prodsData);
      setCategories(catsData);
      if (catsData.length > 0 && !categoryId) {
        setCategoryId(String(catsData[0].id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetProductForm = () => {
    setEditingProdId(null);
    setName("");
    setDescription("");
    setDetails("");
    setImageUrl("");
    setGalleryImages([]);
    setExtraImgUrl("");
    setPrice("");
    setDiscountPrice("");
    setShippingInfo("Envio para todo o Brasil");
    setPurchaseUrl("");
    setInStock(true);
    setIsFeatured(false);
  };

  const handleEditClick = (p: Product) => {
    setEditingProdId(p.id);
    setName(p.name);
    setCategoryId(p.categoryId || "");
    setDescription(p.description || "");
    setDetails(p.details || "");
    setImageUrl(p.imageUrl || "");
    setGalleryImages(Array.isArray(p.galleryImages) ? p.galleryImages : []);
    setExtraImgUrl("");
    setPrice(String(p.price));
    setDiscountPrice(p.discountPrice ? String(p.discountPrice) : "");
    setShippingInfo(p.shippingInfo || "Envio para todo o Brasil");
    setPurchaseUrl(p.purchaseUrl || "");
    setInStock(Boolean(p.inStock));
    setIsFeatured(Boolean(p.isFeatured));
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Deseja realmente remover este produto da loja?")) {
      try {
        await deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        triggerSuccess("Produto removido com sucesso!");
        if (editingProdId === id) resetProductForm();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    try {
      const created = await createProductCategory({
        nome: newCatName,
        descricao: newCatDesc,
      });
      setCategories((prev) => [...prev, created]);
      setCategoryId(String(created.id));
      setNewCatName("");
      setNewCatDesc("");
      setShowCatModal(false);
      triggerSuccess("Categoria criada com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar categoria.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Excluir esta categoria? Os produtos vinculados a ela ficarão sem categoria.")) {
      try {
        await deleteProductCategory(id);
        setCategories((prev) => prev.filter((c) => String(c.id) !== String(id)));
        triggerSuccess("Categoria excluída com sucesso.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImg(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const url = await uploadImage(base64, file.name);
        if (!imageUrl) {
          setImageUrl(url);
        } else {
          setGalleryImages((prev) => [...prev, url]);
        }
        triggerSuccess("Foto carregada com sucesso!");
      } catch (uploadErr) {
        console.error(uploadErr);
        alert("Erro ao fazer upload da imagem.");
      } finally {
        setUploadingImg(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBatchImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingBatch(true);
    try {
      const urls = await uploadMultipleFiles(Array.from(files));
      if (!imageUrl && urls.length > 0) {
        setImageUrl(urls[0]);
        setGalleryImages((prev) => [...prev, ...urls.slice(1)]);
      } else {
        setGalleryImages((prev) => [...prev, ...urls]);
      }
      triggerSuccess(`${urls.length} foto(s) adicionada(s) ao produto em lote!`);
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar fotos em lote.");
    } finally {
      setUploadingBatch(false);
      e.target.value = "";
    }
  };

  const handleSetPrimaryImage = (img: string) => {
    if (imageUrl === img) return;
    const oldPrimary = imageUrl;
    setImageUrl(img);
    setGalleryImages((prev) => {
      const filtered = prev.filter((i) => i !== img);
      if (oldPrimary && !filtered.includes(oldPrimary)) {
        return [oldPrimary, ...filtered];
      }
      return filtered;
    });
    triggerSuccess("Foto principal atualizada!");
  };

  const handleRemoveGalleryImage = (imgToRemove: string) => {
    setGalleryImages((prev) => prev.filter((i) => i !== imgToRemove));
    triggerSuccess("Foto removida da galeria do produto.");
  };

  const handleAddExtraUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraImgUrl.trim()) return;
    const url = extraImgUrl.trim();
    if (!imageUrl) {
      setImageUrl(url);
    } else if (!galleryImages.includes(url)) {
      setGalleryImages((prev) => [...prev, url]);
    }
    setExtraImgUrl("");
    triggerSuccess("Foto adicionada com sucesso!");
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    const numPrice = parseFloat(price.replace(",", "."));
    const numDiscount = discountPrice ? parseFloat(discountPrice.replace(",", ".")) : null;

    try {
      const payload: Partial<Product> = {
        name,
        categoryId: categoryId || null,
        description,
        details,
        imageUrl: imageUrl || (galleryImages[0] || ""),
        galleryImages,
        price: numPrice,
        discountPrice: numDiscount,
        shippingInfo,
        purchaseUrl: purchaseUrl.trim() || null,
        inStock,
        isFeatured,
      };

      if (editingProdId) {
        const updated = await updateProduct(editingProdId, payload);
        setProducts((prev) => prev.map((p) => (p.id === editingProdId ? updated : p)));
        triggerSuccess("Produto atualizado com sucesso!");
      } else {
        const created = await createProduct(payload);
        setProducts((prev) => [created, ...prev]);
        triggerSuccess("Produto cadastrado com sucesso!");
      }
      resetProductForm();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar produto.");
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-serif font-bold text-slate-200 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            <span>Gerenciar Loja Online & Produtos</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Cadastre livros, bíblias, roupas, acessórios, gerencie preços, promoções e informações de envio.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            type="button"
            onClick={() => setShowCatModal(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5 text-amber-500" />
            <span>Categorias ({categories.length})</span>
          </button>

          {editingProdId && (
            <button
              type="button"
              onClick={resetProductForm}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono flex items-center gap-1.5 hover:bg-slate-750 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancelar Edição</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Form + List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Product Form (5 Cols) */}
        <form onSubmit={handleProductSubmit} className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl space-y-4">
          <h4 className="text-xs font-mono font-bold uppercase text-amber-500 border-b border-slate-800 pb-2 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>{editingProdId ? "Editar Produto" : "Novo Produto na Loja"}</span>
          </h4>

          {/* Nome */}
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Nome do Produto *</label>
            <input
              type="text"
              required
              placeholder="Ex: Bíblia de Estudo Missão Resgatar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Categoria do Produto</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
            >
              <option value="">Sem categoria (Diversos)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Preços: Normal & Desconto */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Preço Normal (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="Ex: 89.90"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Preço c/ Desconto (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 69.90 (opcional)"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Fotos do Produto: Principal + Galeria em Lote */}
          <div className="space-y-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono text-slate-300 uppercase font-bold flex items-center gap-1.5">
                <Images className="w-3.5 h-3.5 text-amber-500" />
                <span>Fotos do Produto (Principal & Galeria)</span>
              </label>
              <span className="text-[9px] font-mono text-slate-500">
                {(imageUrl ? 1 : 0) + galleryImages.length} foto(s)
              </span>
            </div>

            {/* Ações de Upload: Individual e Em Lote */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Upload Foto Única */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="prod-single-upload"
                  className="hidden"
                  onChange={handleImageFileChange}
                />
                <label
                  htmlFor="prod-single-upload"
                  className="w-full py-2 px-3 bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded-lg text-slate-300 text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>{uploadingImg ? "Enviando..." : "Foto Individual"}</span>
                </label>
              </div>

              {/* Upload Em Lote (Várias Imagens de uma vez) */}
              <div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  id="prod-batch-upload"
                  className="hidden"
                  onChange={handleBatchImagesUpload}
                />
                <label
                  htmlFor="prod-batch-upload"
                  className="w-full py-2 px-3 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 rounded-lg text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                >
                  <Images className="w-3.5 h-3.5 text-amber-400" />
                  <span>{uploadingBatch ? "Enviando Lote..." : "Upload em Lote (+)"}</span>
                </label>
              </div>
            </div>

            {/* Adicionar Foto por Link URL */}
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Ou cole a URL da imagem aqui..."
                value={extraImgUrl}
                onChange={(e) => setExtraImgUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddExtraUrl(e as any);
                  }
                }}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
              />
              <button
                type="button"
                onClick={handleAddExtraUrl}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-mono rounded-lg border border-slate-700 cursor-pointer"
              >
                + Adicionar
              </button>
            </div>

            {/* Grid de Miniaturas com indicação de Foto Principal */}
            {((imageUrl && imageUrl.trim()) || galleryImages.length > 0) && (
              <div className="space-y-2 pt-2 border-t border-slate-850">
                <span className="text-[9px] font-mono uppercase text-slate-500 block">
                  Galeria do Produto (Clique para definir como Principal):
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {/* Foto Principal */}
                  {imageUrl && (
                    <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-amber-400 bg-slate-900 shadow-md group">
                      <img src={imageUrl} alt="Principal" className="w-full h-full object-cover" />
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-bold text-[8px] font-mono flex items-center gap-0.5 shadow">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span>Principal</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="absolute bottom-1 right-1 p-1 rounded-md bg-red-600/90 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                        title="Remover foto"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Fotos Adicionais da Galeria */}
                  {galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-900 group hover:border-slate-600 transition-all"
                    >
                      <img src={img} alt={`Galeria ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(img)}
                          className="px-1.5 py-0.5 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 text-[8px] font-mono font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <Star className="w-2.5 h-2.5" />
                          <span>Principal</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(img)}
                          className="p-1 rounded bg-red-600 hover:bg-red-500 text-white cursor-pointer"
                          title="Remover foto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Frete & Envio */}
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Informações de Frete / Envio</label>
            <input
              type="text"
              placeholder="Ex: Envio para todo o Brasil (PAC/SEDEX) ou Retirada Local"
              value={shippingInfo}
              onChange={(e) => setShippingInfo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
            />
          </div>

          {/* Link Específico de Compra / Checkout Direto */}
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 flex items-center justify-between">
              <span>Link Específico de Compra / Checkout (Opcional)</span>
              <span className="text-[9px] text-amber-500 font-normal">Hotmart, Kiwify, Mercado Livre, Stripe, Loja Externa</span>
            </label>
            <input
              type="url"
              placeholder="https://exemplo.com/checkout/produto-123 (Se vazio, usará checkout WhatsApp)"
              value={purchaseUrl}
              onChange={(e) => setPurchaseUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Caso preenchido, os botões de compra deste produto levarão diretamente a este link de pagamento/checkout. Se deixar vazio, o cliente conclui o pedido via WhatsApp ou atendimento da Missão.
            </p>
          </div>

          {/* Flags: Estoque e Destaque */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2.5 bg-slate-950/60 border border-slate-850 rounded-lg">
              <input
                type="checkbox"
                id="prod-stock"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="accent-amber-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="prod-stock" className="text-xs text-slate-300 cursor-pointer">
                Disponível em Estoque
              </label>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-slate-950/60 border border-slate-850 rounded-lg">
              <input
                type="checkbox"
                id="prod-featured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="accent-amber-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="prod-featured" className="text-xs text-slate-300 cursor-pointer flex items-center gap-1 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Destaque</span>
              </label>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Descrição Comercial</label>
            <textarea
              rows={2}
              placeholder="Breve resumo atraente do produto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 resize-none font-sans"
            />
          </div>

          {/* Detalhes Técnicos */}
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Detalhes & Especificações</label>
            <textarea
              rows={2}
              placeholder="Ex: Tamanho: M, G, GG | Material: 100% Algodão | Páginas: 1400"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 resize-none font-mono text-[11px]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{editingProdId ? "Atualizar Produto" : "Salvar Produto na Loja"}</span>
          </button>
        </form>

        {/* Product List (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Produtos Cadastrados ({products.length})
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs animate-pulse">Carregando produtos...</div>
          ) : products.length === 0 ? (
            <div className="p-10 text-center bg-slate-900/30 border border-slate-800 rounded-2xl space-y-2">
              <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">Nenhum produto cadastrado na loja ainda.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1 custom-scrollbar">
              {products.map((prod) => {
                const hasDiscount = Boolean(prod.discountPrice && prod.discountPrice < prod.price);

                return (
                  <div
                    key={prod.id}
                    className="p-3 bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                        <img
                          src={prod.imageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80"}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-amber-500 uppercase px-1.5 py-0.2 bg-amber-500/10 rounded">
                            {prod.categoryName || "Geral"}
                          </span>
                          {prod.isFeatured && (
                            <span className="text-[9px] font-mono text-amber-400 font-bold uppercase">
                              ★ Destaque
                            </span>
                          )}
                          {!prod.inStock && (
                            <span className="text-[9px] font-mono text-red-400 font-bold uppercase">
                              Esgotado
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-semibold text-slate-200 truncate mt-0.5">
                          {prod.name}
                        </h4>

                        <div className="flex items-center gap-2 mt-1">
                          {hasDiscount && (
                            <span className="text-[10px] text-slate-500 line-through">
                              R$ {prod.price.toFixed(2).replace(".", ",")}
                            </span>
                          )}
                          <span className="text-xs font-bold text-amber-400 font-mono">
                            R$ {(prod.discountPrice || prod.price).toFixed(2).replace(".", ",")}
                          </span>
                          {hasDiscount && (
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1 rounded">
                              -{prod.discountPercent}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditClick(prod)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-amber-400 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Category Manager Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-serif font-bold text-slate-100 flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-500" />
                <span>Gerenciar Categorias da Loja</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCatModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form to add category */}
            <form onSubmit={handleCreateCategory} className="space-y-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-amber-500 font-bold block">
                Nova Categoria (ex: Bíblias, Livros, Roupas)
              </span>
              <input
                type="text"
                required
                placeholder="Nome da Categoria..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="Descrição (opcional)..."
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Categoria</span>
              </button>
            </form>

            {/* List of current categories */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Categorias Atuais:
              </span>
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs"
                >
                  <div>
                    <h5 className="font-semibold text-slate-200">{c.nome}</h5>
                    <span className="text-[10px] font-mono text-slate-500">
                      {c.produtos_count || 0} produtos
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(String(c.id))}
                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-900 cursor-pointer"
                    title="Excluir Categoria"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
