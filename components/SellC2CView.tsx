'use client';

import React, { useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import { Product, ProductCondition } from '@/lib/types';
import {
  PlusCircle,
  Tag,
  Package,
  CheckCircle2,
  FileText,
  Trash2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export default function SellC2CView() {
  const {
    products,
    createProduct,
    deleteProduct,
    user,
    setActiveView,
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
        product_type: 'c2c',
        images: imageGallery.length > 0 ? imageGallery : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
        seller_id: user?.id || 'user-c2c',
        seller_name: user?.name || 'Atleta CoreMotiom',
        seller_avatar: user?.avatar_url,
        stock: 1,
        location,
        shipping_available: shippingAvailable,
        status: 'active',
        tags: [sport, category, 'Venda Direta C2C'],
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E232F]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
            <Tag className="w-3.5 h-3.5" />
            <span>Venda Direta entre Atletas</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Central de Vendas C2C
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Anuncie seus equipamentos seminovos com custódia segura e certificação técnica SmartScan.
          </p>
        </div>

        <button
          onClick={() => setActiveView('smartscan')}
          className="px-3.5 py-2 rounded-lg bg-[#12151C] hover:bg-[#1A1F2B] text-red-400 border border-red-500/30 text-xs font-semibold transition-all flex items-center gap-2 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-red-400" />
          <span>Avaliar com SmartScan AI</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1E232F] pb-2 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'create'
              ? 'bg-red-600 text-white font-semibold shadow-sm'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#12151C]'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Criar Anúncio</span>
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'active'
              ? 'bg-red-600 text-white font-semibold shadow-sm'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#12151C]'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Meus Anúncios ({myListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'sales'
              ? 'bg-red-600 text-white font-semibold shadow-sm'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#12151C]'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Vendas em Custódia</span>
        </button>

        <button
          onClick={() => setActiveTab('drafts')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'drafts'
              ? 'bg-red-600 text-white font-semibold shadow-sm'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#12151C]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Rascunhos (0)</span>
        </button>
      </div>

      {/* Tab: Criar Anúncio */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form */}
          <form onSubmit={handlePublishListing} className="lg:col-span-2 bg-[#12151C] p-6 rounded-xl border border-[#232836] space-y-4 text-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white pb-2 border-b border-[#1E232F]">
              Especificações do Equipamento
            </h3>

            <div>
              <label className="block text-[11px] text-[#94A3B8] mb-1">
                Título do Anúncio *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Tênis Vaporfly Next% 3 Tam 42 (Apenas 40km rodados)"
                className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-[#94A3B8] mb-1">
                  Categoria *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
                >
                  <option value="Calçados">Calçados</option>
                  <option value="Roupas">Roupas</option>
                  <option value="Equipamentos">Equipamentos</option>
                  <option value="Tecnologia & Wearables">Tecnologia & Wearables</option>
                  <option value="Acessórios">Acessórios</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#94A3B8] mb-1">
                  Modalidade *
                </label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
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
                <label className="block text-[11px] text-[#94A3B8] mb-1">
                  Condição de Uso *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ProductCondition)}
                  className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
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
                <label className="block text-[11px] text-[#94A3B8] mb-1">
                  Preço de Venda (R$) *
                </label>
                <input
                  type="text"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="850.00"
                  className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#94A3B8] mb-1">
                  Preço Original Pago (R$)
                </label>
                <input
                  type="text"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="1999.00 (opcional)"
                  className="w-full px-3 py-2 bg-[#0E1017] text-xs text-[#94A3B8] rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#94A3B8] mb-1">
                Descrição Detalhada do Equipamento *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva detalhes como quilometragem rodada, tamanho, presença de caixa original, motivo da venda, etc."
                className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Photos */}
            <div className="space-y-2">
              <label className="block text-[11px] text-[#94A3B8]">
                Fotos do Produto (URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Cole a URL da foto do seu produto"
                  className="flex-1 px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836]"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-3.5 py-2 bg-[#1E232F] hover:bg-[#283040] text-white text-xs font-semibold rounded-lg border border-[#232836]"
                >
                  + Foto
                </button>
              </div>

              {/* Photos Gallery preview */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-1">
                {imageGallery.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-[#232836] group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded bg-[#090A0D]/80 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Location */}
            <div className="pt-3 border-t border-[#1E232F] space-y-3">
              <div>
                <label className="block text-[11px] text-[#94A3B8] mb-1">
                  Localização do Vendedor (Cidade / UF)
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Campinas, SP"
                  className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836]"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#94A3B8] select-none">
                <input
                  type="checkbox"
                  checked={shippingAvailable}
                  onChange={(e) => setShippingAvailable(e.target.checked)}
                  className="rounded border-[#232836] text-red-600 focus:ring-red-500 bg-[#0E1017]"
                />
                <span>Aceito envio com frete calculado</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 mt-4 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Publicando...' : 'Publicar Anúncio no Marketplace'}</span>
            </button>
          </form>

          {/* Right Tips Panel */}
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[#12151C] border border-[#232836] space-y-3">
              <h4 className="font-semibold text-white flex items-center gap-2 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <span>Dicas para Venda Rápida</span>
              </h4>
              <ul className="space-y-2.5 text-[#94A3B8] leading-relaxed text-xs">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-semibold">1.</span>
                  <span>Fotografe com boa iluminação o desgaste da sola e palmilha.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-semibold">2.</span>
                  <span>Informe a quilometragem real para maior confiabilidade.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-semibold">3.</span>
                  <span>Utilize o SmartScan para precificar de acordo com o mercado.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-red-600/10 border border-red-500/20 space-y-1.5">
              <h4 className="font-semibold text-red-400 text-xs">Protocolo de Custódia Segura</h4>
              <p className="text-[#CBD5E1] leading-relaxed text-xs">
                O valor pago pelo comprador fica retido em custódia segura e só é liberado para você após a confirmação de recebimento.
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
                <div key={p.id} className="bg-[#12151C] rounded-xl border border-[#232836] p-4 flex flex-col justify-between space-y-3">
                  <div className="flex gap-3">
                    <img src={p.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover bg-[#0E1017] border border-[#232836]" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-white line-clamp-1">{p.title}</h4>
                      <p className="text-xs font-bold text-red-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}
                      </p>
                      <span className="inline-block px-1.5 py-0.5 rounded bg-[#0E1017] text-[#94A3B8] text-[9px] border border-[#232836]">
                        Ativo
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#1E232F] text-xs">
                    <span className="text-[#64748B] text-[11px]">{p.views} visualizações</span>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors"
                      title="Excluir Anúncio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#12151C] border border-[#232836] rounded-xl p-12 text-center space-y-3">
              <Package className="w-8 h-8 text-[#64748B] mx-auto" />
              <h3 className="text-sm font-bold text-white">Nenhum anúncio ativo</h3>
              <p className="text-xs text-[#94A3B8]">
                Você ainda não possui produtos anunciados no marketplace.
              </p>
              <button
                onClick={() => setActiveTab('create')}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg"
              >
                + Criar Meu Primeiro Anúncio
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Minhas Vendas */}
      {activeTab === 'sales' && (
        <div className="bg-[#12151C] border border-[#232836] rounded-xl p-8 text-center text-xs text-[#94A3B8] space-y-2">
          <TrendingUp className="w-8 h-8 text-red-400 mx-auto" />
          <h4 className="font-bold text-white text-sm">Histórico de Custódia & Vendas</h4>
          <p>Quando outros atletas adquirirem seus produtos, os dados de envio e liberação de saldo aparecerão aqui.</p>
        </div>
      )}

      {/* Tab: Rascunhos */}
      {activeTab === 'drafts' && (
        <div className="bg-[#12151C] border border-[#232836] rounded-xl p-8 text-center text-xs text-[#94A3B8]">
          Nenhum rascunho salvo no momento.
        </div>
      )}
    </div>
  );
}

