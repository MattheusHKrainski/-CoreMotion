'use client';

import React, { useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import { ProductCondition } from '@/lib/types';
import {
  PlusCircle,
  Tag,
  Package,
  CheckCircle2,
  FileText,
  Trash2,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Camera,
  Layers,
} from 'lucide-react';

export default function SellC2CView() {
  const {
    products,
    stores,
    createProduct,
    deleteProduct,
    user,
    addToast,
  } = useCoreMotiom();

  const [activeTab, setActiveTab] = useState<'create' | 'active' | 'sales' | 'drafts'>('create');
  
  // Listing Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('Calçados');
  const [sport, setSport] = useState('Corrida');
  const [condition, setCondition] = useState<ProductCondition>('usado_excelente');
  const [location, setLocation] = useState(user?.city ? `${user.city}, ${user.state || 'SP'}` : 'São Paulo, SP');
  const [imageUrl, setImageUrl] = useState('');
  const [imageGallery, setImageGallery] = useState<string[]>([
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
  ]);
  const [shippingAvailable, setShippingAvailable] = useState(true);
  const [loading, setLoading] = useState(false);

  // My listings
  const myListings = products.filter(
    (p) => p.seller_id === user?.id || (user?.role === 'user' && p.product_type === 'c2c')
  );

  // Lojista (ou administrador com loja) pode anunciar pela própria loja (B2C).
  const myStore = user
    ? stores.find((s) => s.id === user.store_id) ?? stores.find((s) => s.owner_id === user.id)
    : undefined;
  const canSellB2C = Boolean(myStore) && (user?.role === 'seller' || user?.role === 'admin');
  const [saleType, setSaleType] = useState<'c2c' | 'b2c'>('c2c');
  const effectiveSaleType: 'c2c' | 'b2c' = canSellB2C && saleType === 'b2c' ? 'b2c' : 'c2c';

  const handleAddImage = () => {
    if (imageUrl.trim() && !imageGallery.includes(imageUrl.trim())) {
      setImageGallery([...imageGallery, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageGallery(imageGallery.filter((_, i) => i !== index));
  };

  const handlePublishListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) {
      addToast('Campos Obrigatórios', 'Preencha título e preço do anúncio.', 'error');
      return;
    }

    setLoading(true);
    try {
      await createProduct({
        title,
        description,
        price: parseFloat(price.replace(',', '.')),
        original_price: originalPrice ? parseFloat(originalPrice.replace(',', '.')) : undefined,
        category,
        sport,
        condition,
        product_type: effectiveSaleType,
        store_id: effectiveSaleType === 'b2c' ? myStore?.id : undefined,
        store_name: effectiveSaleType === 'b2c' ? myStore?.name : undefined,
        is_verified_store: effectiveSaleType === 'b2c' ? Boolean(myStore?.is_verified) : false,
        images: imageGallery.length > 0 ? imageGallery : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
        seller_id: user?.id || 'user-c2c',
        seller_name: user?.name || 'Atleta CoreMotiom',
        seller_avatar: user?.avatar_url,
        stock: 1,
        location,
        shipping_available: shippingAvailable,
        status: 'active',
        tags: effectiveSaleType === 'b2c' ? [sport, category, 'Loja Oficial'] : [sport, category, 'Venda Direta C2C'],
      });

      // Reset form & view active listings
      setTitle('');
      setDescription('');
      setPrice('');
      setOriginalPrice('');
      setActiveTab('active');
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wider mb-1.5">
            <Tag className="w-3.5 h-3.5" />
            <span>Intermediação Segura entre Atletas</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
            Central de Vendas C2C
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Anuncie seus equipamentos seminovos com proteção de pagamento retido em custódia e garantia de envio rastreado.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs in Capsule Dock Style */}
      <div className="flex items-center gap-2 bg-zinc-900/70 p-2 rounded-2xl border border-zinc-800/80 backdrop-blur-md text-xs overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
            activeTab === 'create'
              ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Criar Anúncio</span>
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
            activeTab === 'active'
              ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Meus Anúncios ({myListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
            activeTab === 'sales'
              ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Vendas em Custódia</span>
        </button>

        <button
          onClick={() => setActiveTab('drafts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
            activeTab === 'drafts'
              ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Rascunhos</span>
        </button>
      </div>

      {/* Tab: Criar Anúncio */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Form */}
          <form onSubmit={handlePublishListing} className="lg:col-span-2 bg-zinc-900/60 p-6 sm:p-8 rounded-3xl border border-zinc-800/80 shadow-xl space-y-5 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white pb-3 border-b border-zinc-800/80 flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-400" />
              <span>Especificações Técnicas do Equipamento</span>
            </h3>

            {canSellB2C && myStore && (
              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
                  Tipo de venda *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSaleType('c2c')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                      effectiveSaleType === 'c2c'
                        ? 'bg-red-600 border-red-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    Entre atletas (C2C)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaleType('b2c')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                      effectiveSaleType === 'b2c'
                        ? 'bg-red-600 border-red-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    Loja oficial: {myStore.name} (B2C)
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  {effectiveSaleType === 'b2c'
                    ? myStore.is_verified
                      ? 'Sua loja está verificada: o anúncio exibe o selo de loja verificada.'
                      : 'Sua loja ainda não está verificada: o anúncio não exibe o selo.'
                    : 'Venda direta entre atletas, com pagamento retido em custódia.'}
                </p>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
                Título do Anúncio *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Tênis Vaporfly Next% 3 Tam 42 (Apenas 40km rodados)"
                className="w-full px-4 py-2.5 bg-zinc-950 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
                  Categoria *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                >
                  <option value="Calçados">Calçados</option>
                  <option value="Roupas">Roupas</option>
                  <option value="Equipamentos">Equipamentos</option>
                  <option value="Tecnologia & Wearables">Tecnologia & Wearables</option>
                  <option value="Acessórios">Acessórios</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
                  Modalidade *
                </label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                >
                  <option value="Corrida">Corrida</option>
                  <option value="Triatlo">Triatlo</option>
                  <option value="Ciclismo">Ciclismo</option>
                  <option value="Trail Running">Trail Running</option>
                  <option value="Crossfit & Funcional">Crossfit & Funcional</option>
                  <option value="Natação">Natação</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
                  Condição de Uso *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ProductCondition)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                >
                  <option value="novo">Novo (Lacrado)</option>
                  <option value="como_novo">Como Novo (Sem marcas)</option>
                  <option value="usado_excelente">Usado (Excelente Estado)</option>
                  <option value="usado_bom">Usado (Bom Estado)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
                  Preço de Venda (R$) *
                </label>
                <input
                  type="text"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="850.00"
                  className="w-full px-4 py-2.5 bg-zinc-950 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
                  Preço Original Pago (R$)
                </label>
                <input
                  type="text"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="1999.00 (opcional)"
                  className="w-full px-4 py-2.5 bg-zinc-950 text-xs text-zinc-400 rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
                Descrição Detalhada do Equipamento *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva detalhes como quilometragem rodada, tamanho, presença de caixa original, motivo da venda, etc."
                className="w-full px-4 py-2.5 bg-zinc-950 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Photos */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold uppercase text-zinc-400">
                Galeria de Fotos (URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Cole a URL da foto do seu produto"
                  className="flex-1 px-4 py-2.5 bg-zinc-950 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl border border-zinc-700 transition-colors flex items-center gap-1.5"
                >
                  <Camera className="w-4 h-4 text-red-400" />
                  <span>Adicionar</span>
                </button>
              </div>

              {/* Photos Gallery preview */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 pt-2">
                {imageGallery.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-800 group bg-zinc-950">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-zinc-950/80 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Location */}
            <div className="pt-4 border-t border-zinc-800/80 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
                  Localização de Envio (Cidade / UF)
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Campinas, SP"
                  className="w-full px-4 py-2.5 bg-zinc-950 text-xs text-white rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-300 select-none">
                <input
                  type="checkbox"
                  checked={shippingAvailable}
                  onChange={(e) => setShippingAvailable(e.target.checked)}
                  className="rounded border-zinc-800 text-red-600 focus:ring-red-500 bg-zinc-950"
                />
                <span>Aceito envio com frete calculado e seguro nacional</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-xl shadow-red-950/50 transition-all flex items-center justify-center gap-2 mt-4 hover:scale-[1.01] active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Publicando...' : 'Publicar Anúncio no Marketplace'}</span>
            </button>
          </form>

          {/* Right Tips Panel */}
          <div className="space-y-4 text-xs">
            <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 shadow-xl space-y-3">
              <h4 className="font-bold text-white flex items-center gap-2 text-xs">
                <Sparkles className="w-4 h-4 text-red-400" />
                <span>Diretrizes de Venda Rápida</span>
              </h4>
              <ul className="space-y-3 text-zinc-400 leading-relaxed text-xs">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold">1.</span>
                  <span>Fotografe com boa iluminação o desgaste da sola, cabedal e palmilha.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold">2.</span>
                  <span>Informe a quilometragem real para conferir autoridade ao anúncio.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold">3.</span>
                  <span>Pesquise produtos similares no marketplace para precificar de acordo com o mercado.</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-3xl bg-red-600/10 border border-red-500/20 space-y-2">
              <h4 className="font-bold text-red-400 text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Protocolo de Custódia Segura</span>
              </h4>
              <p className="text-zinc-300 leading-relaxed text-xs">
                O valor pago pelo comprador fica retido em custódia segura e só é liberado para você após a confirmação e inspeção do produto.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Meus Anúncios */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {myListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myListings.map((p) => (
                <div key={p.id} className="bg-zinc-900/60 rounded-3xl border border-zinc-800/80 p-5 flex flex-col justify-between space-y-3 shadow-lg">
                  <div className="flex gap-3.5">
                    <img src={p.images[0]} alt="" className="w-16 h-16 rounded-2xl object-cover bg-zinc-950 border border-zinc-800" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-white line-clamp-1">{p.title}</h4>
                      <p className="text-sm font-extrabold text-red-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}
                      </p>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-semibold border border-zinc-700">
                        Ativo
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 text-xs">
                    <span className="text-zinc-500 text-[11px]">{p.views} visualizações</span>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-full transition-colors"
                      title="Excluir Anúncio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-12 text-center space-y-3">
              <Package className="w-8 h-8 text-zinc-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">Nenhum anúncio ativo</h3>
              <p className="text-xs text-zinc-400">
                Você ainda não possui equipamentos anunciados no marketplace.
              </p>
              <button
                onClick={() => setActiveTab('create')}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-full shadow-md shadow-red-950/40 transition-colors"
              >
                + Criar Meu Primeiro Anúncio
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Minhas Vendas */}
      {activeTab === 'sales' && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-10 text-center text-xs text-zinc-400 space-y-2">
          <TrendingUp className="w-8 h-8 text-red-400 mx-auto" />
          <h4 className="font-bold text-white text-sm">Histórico de Custódia & Vendas</h4>
          <p>Quando outros atletas adquirirem seus produtos, os dados de envio e liberação de saldo aparecerão aqui.</p>
        </div>
      )}

      {/* Tab: Rascunhos */}
      {activeTab === 'drafts' && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-10 text-center text-xs text-zinc-400">
          Nenhum rascunho salvo no momento.
        </div>
      )}
    </div>
  );
}
