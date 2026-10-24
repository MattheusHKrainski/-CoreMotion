'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Check,
  CopyPlus,
  ExternalLink,
  Eye,
  EyeOff,
  ImagePlus,
  Link2,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Store,
  Tag,
  Ticket,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useCoreMotiom } from '@/lib/store';
import { isStaffRole } from '@/lib/permissions';
import type { ExternalOffer } from '@/lib/types';

const STORE_SUGGESTIONS = [
  'AliExpress',
  'Mercado Livre',
  'Amazon Brasil',
  'Shopee',
  'Netshoes',
  'Centauro',
  'Decathlon',
  'Olympikus Oficial',
];

const SPORT_OPTIONS = [
  'Corrida',
  'Ciclismo',
  'Musculação',
  'Futebol',
  'Basquete',
  'Tênis',
  'Vôlei',
  'Jiu-Jitsu',
  'Karatê',
  'Natação',
  'Triathlon',
];

const CATEGORY_OPTIONS = [
  'Calçados',
  'Equipamentos',
  'Tecnologia & Wearables',
  'Vestuário',
  'Acessórios',
  'Artes Marciais',
  'Suplementos & Nutrição',
];

interface OfferFormState {
  source_url: string;
  store_name: string;
  title: string;
  price: string;
  original_price: string;
  coupon_code: string;
  sport: string;
  category: string;
  image_url: string;
  description: string;
  is_active: boolean;
}

const EMPTY_FORM: OfferFormState = {
  source_url: '',
  store_name: 'AliExpress',
  title: '',
  price: '',
  original_price: '',
  coupon_code: '',
  sport: 'Corrida',
  category: 'Equipamentos',
  image_url: '',
  description: '',
  is_active: true,
};

function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const maxSide = 840;
        let width = img.width;
        let height = img.height;
        if (width > maxSide || height > maxSide) {
          if (width >= height) {
            height = Math.round((height * maxSide) / width);
            width = maxSide;
          } else {
            width = Math.round((width * maxSide) / height);
            height = maxSide;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Falha ao processar imagem.'));
          return;
        }
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => reject(new Error('Arquivo de imagem inválido.'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Falha ao ler arquivo.'));
    reader.readAsDataURL(file);
  });
}

export default function AdminOffersManager() {
  const {
    user,
    offers,
    editingOfferId,
    setEditingOfferId,
    addOffer,
    updateOffer,
    deleteOffer,
    toggleOfferActive,
    resetDefaultOffers,
    fetchOfferMetadata,
    addToast,
  } = useCoreMotiom();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);
  const [form, setForm] = useState<OfferFormState>(EMPTY_FORM);
  const [searchTerm, setSearchTerm] = useState('');
  const [storeFilter, setStoreFilter] = useState<string>('ALL');
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const populateFormFromOffer = (offer: ExternalOffer, asCopy = false) => {
    setForm({
      source_url: offer.source_url,
      store_name: offer.store_name,
      title: asCopy ? `${offer.title} (Cópia)` : offer.title,
      price: String(offer.price),
      original_price: offer.original_price ? String(offer.original_price) : '',
      coupon_code: offer.coupon_code || '',
      sport: offer.sport,
      category: offer.category,
      image_url: offer.image_url,
      description: offer.description,
      is_active: offer.is_active !== false,
    });
    setCurrentEditId(asCopy ? null : offer.id);
    setFormError(null);
    setIsFormOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
  };

  useEffect(() => {
    if (!editingOfferId) return;
    const found = offers.find((o) => o.id === editingOfferId);
    if (found) {
      populateFormFromOffer(found, false);
    }
    setEditingOfferId(null);
  }, [editingOfferId, offers, setEditingOfferId]);

  if (!isStaffRole(user?.role)) return null;

  const activeCount = offers.filter((o) => o.is_active !== false).length;
  const pausedCount = offers.length - activeCount;

  const uniqueStores = Array.from(new Set(offers.map((o) => o.store_name)));

  const filteredOffers = offers.filter((offer) => {
    const matchesStore = storeFilter === 'ALL' || offer.store_name === storeFilter;
    const q = searchTerm.trim().toLowerCase();
    const matchesQuery =
      !q ||
      offer.title.toLowerCase().includes(q) ||
      offer.store_name.toLowerCase().includes(q) ||
      offer.sport.toLowerCase().includes(q) ||
      offer.category.toLowerCase().includes(q) ||
      (offer.coupon_code && offer.coupon_code.toLowerCase().includes(q));
    return matchesStore && matchesQuery;
  });

  const handleOpenCreate = () => {
    setCurrentEditId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsFormOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
  };

  const handleAutoFillFromLink = async () => {
    const rawUrl = form.source_url.trim();
    if (!rawUrl) {
      setFormError('Cole primeiro o link da promoção ou seu link de afiliado (https://...).');
      return;
    }
    setFormError(null);
    setIsFetchingMeta(true);
    try {
      const meta = await fetchOfferMetadata(rawUrl);
      if (meta) {
        setForm((prev) => ({
          ...prev,
          store_name: meta.store_name || prev.store_name,
          title: meta.title || prev.title,
          image_url: meta.image_url || prev.image_url,
          description: meta.description || prev.description,
          price: meta.price ? String(meta.price) : prev.price,
        }));
        if (meta.title || meta.image_url) {
          addToast(
            'Dados importados do link',
            'Confira o preço promocional e clique em Salvar oferta.',
            'success'
          );
        } else {
          addToast(
            `Loja identificada: ${meta.store_name || 'Externa'}`,
            'Preencha ou cole a imagem do produto e o valor em oferta.',
            'info'
          );
        }
      }
    } finally {
      setIsFetchingMeta(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError('Selecione um arquivo de imagem válido (JPG, PNG ou WebP).');
      return;
    }
    try {
      const dataUrl = await compressImageFile(file);
      setForm((prev) => ({ ...prev, image_url: dataUrl }));
      setFormError(null);
      addToast('Imagem carregada', 'Foto otimizada e pronta para publicação.', 'success');
    } catch {
      setFormError('Não foi possível processar esta foto. Tente outra imagem ou cole a URL.');
    } finally {
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedPrice = Number(String(form.price).replace(',', '.'));
    const parsedOriginal = form.original_price.trim()
      ? Number(String(form.original_price).replace(',', '.'))
      : undefined;

    if (!form.source_url.trim().startsWith('https://')) {
      setFormError('O link da promoção / afiliado precisa começar com https://');
      return;
    }
    if (form.title.trim().length < 3) {
      setFormError('Informe o nome do produto em oferta (mínimo 3 caracteres).');
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setFormError('Informe um preço promocional válido maior que zero (ex: 169.90).');
      return;
    }
    if (!form.image_url.trim()) {
      setFormError('Adicione a imagem do produto (pelo botão do link, URL da foto ou upload do dispositivo).');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        source_url: form.source_url.trim(),
        store_name: form.store_name.trim() || 'Loja Oficial',
        title: form.title.trim(),
        price: parsedPrice,
        original_price: parsedOriginal && parsedOriginal > 0 ? parsedOriginal : null,
        coupon_code: form.coupon_code.trim() || null,
        sport: form.sport,
        category: form.category,
        image_url: form.image_url.trim(),
        description:
          form.description.trim() ||
          `Oferta selecionada em ${form.store_name.trim() || 'loja parceira'} para ${form.sport.toLowerCase()}.`,
        is_active: form.is_active,
      };

      if (currentEditId) {
        const ok = await updateOffer(currentEditId, payload);
        if (ok) {
          setIsFormOpen(false);
          setCurrentEditId(null);
          setForm(EMPTY_FORM);
        }
      } else {
        const created = await addOffer(payload);
        if (created) {
          setIsFormOpen(false);
          setForm(EMPTY_FORM);
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-red-500 focus:outline-none text-sm text-white placeholder-zinc-500';

  return (
    <section
      id="admin-offers-section"
      className="rounded-3xl border border-zinc-800 bg-zinc-900/75 p-5 sm:p-6 space-y-5 shadow-xl"
    >
      {/* Cabeçalho Principal */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-600/20 text-red-400 border border-red-500/30">
              <Tag className="w-3 h-3" />
              Gestão de Ofertas & Afiliados
            </span>
            <span className="text-xs text-zinc-400">
              <strong className="text-white">{activeCount}</strong> ativas
              {pausedCount > 0 ? ` • ${pausedCount} pausadas` : ''}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Central de Ofertas e Links de Promoção
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Cadastre promoções diretas ou seus próprios links de afiliado (AliExpress, Mercado Livre, Amazon, Shopee, Netshoes, Centauro, Decathlon), altere fotos, cupons, preços ou exclua itens a qualquer momento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-950/50 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nova oferta</span>
          </button>

          {confirmReset ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950 border border-amber-500/40 text-xs">
              <span className="text-amber-300 font-semibold">Restaurar iniciais?</span>
              <button
                type="button"
                onClick={async () => {
                  await resetDefaultOffers();
                  setConfirmReset(false);
                }}
                className="px-2 py-0.5 rounded-lg bg-amber-500 text-zinc-950 font-bold"
              >
                Sim
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-300"
              >
                Não
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              title="Restaurar as 12 ofertas reais iniciais"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
              <span>Restaurar padrão</span>
            </button>
          )}
        </div>
      </div>

      {/* Formulário Completo de Adição / Edição */}
      {isFormOpen && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="rounded-2xl bg-zinc-950/90 border border-red-500/35 p-4 sm:p-6 space-y-5 shadow-2xl"
        >
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-white">
                {currentEditId ? 'Editar oferta existente' : 'Cadastrar nova oferta / link de afiliado'}
              </h3>
              <p className="text-xs text-zinc-400">
                Cole o link da promoção, puxe os dados automaticamente ou envie a foto real do produto.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setCurrentEditId(null);
              }}
              className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              aria-label="Fechar formulário de oferta"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna de Campos (2/3) */}
            <div className="lg:col-span-2 space-y-4">
              {/* 1. Link de Destino / Afiliado + Botão Mágico */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  1. Link da promoção ou Link de Afiliado (https://) *
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Link2 className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      required
                      placeholder="https://s.click.aliexpress.com/... ou https://amzn.to/... ou link da loja"
                      value={form.source_url}
                      onChange={(e) => setForm((f) => ({ ...f, source_url: e.target.value }))}
                      className={`${inputCls} pl-10`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillFromLink}
                    disabled={isFetchingMeta}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-xs font-bold whitespace-nowrap transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isFetchingMeta ? 'Buscando...' : 'Puxar foto e título pelo link'}</span>
                  </button>
                </div>
              </div>

              {/* 2. Loja + Seletor Rápido */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-300">
                  2. Loja de destino *
                </label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  placeholder="Ex: AliExpress, Mercado Livre, Amazon Brasil, Shopee..."
                  value={form.store_name}
                  onChange={(e) => setForm((f) => ({ ...f, store_name: e.target.value }))}
                  className={inputCls}
                />
                <div className="flex flex-wrap gap-1.5">
                  {STORE_SUGGESTIONS.map((store) => (
                    <button
                      key={store}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, store_name: store }))}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                        form.store_name === store
                          ? 'bg-red-600 text-white'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {store}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Título do Produto */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  3. Nome do produto em promoção *
                </label>
                <input
                  type="text"
                  required
                  maxLength={180}
                  placeholder="Ex: Ciclocomputador GPS XOSS G+ Bluetooth/ANT+ à Prova D'Água"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className={inputCls}
                />
              </div>

              {/* 4. Preço Promocional, Preço Original e Cupom */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Preço em oferta (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="169.90"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Preço original s/ desconto (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="289.90 (opcional)"
                    value={form.original_price}
                    onChange={(e) => setForm((f) => ({ ...f, original_price: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Cupom de desconto (opcional)
                  </label>
                  <input
                    type="text"
                    maxLength={40}
                    placeholder="Ex: BRASIL15"
                    value={form.coupon_code}
                    onChange={(e) => setForm((f) => ({ ...f, coupon_code: e.target.value.toUpperCase() }))}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* 5. Esporte e Categoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Modalidade esportiva
                  </label>
                  <select
                    value={form.sport}
                    onChange={(e) => setForm((f) => ({ ...f, sport: e.target.value }))}
                    className={inputCls}
                  >
                    {SPORT_OPTIONS.map((sp) => (
                      <option key={sp} value={sp}>
                        {sp}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Categoria
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className={inputCls}
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 6. Imagem Real do Produto (URL ou Upload Direto) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-300">
                  4. Foto real do produto (URL https:// ou enviar arquivo) *
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    placeholder="https://... (endereço da foto do produto) ou envie do computador/celular"
                    value={form.image_url}
                    onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                    className={`${inputCls} flex-1`}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 text-xs font-semibold whitespace-nowrap"
                  >
                    <Upload className="w-3.5 h-3.5 text-red-400" />
                    <span>Enviar foto</span>
                  </button>
                </div>
              </div>

              {/* 7. Descrição curta */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Descrição curta da oferta
                </label>
                <textarea
                  rows={2}
                  maxLength={800}
                  placeholder="Destaque os diferenciais da promoção (ex: frete grátis, envio do Brasil, parcelamento sem juros)..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Coluna de Pré-Visualização em Tempo Real (1/3) */}
            <div className="space-y-3">
              <span className="block text-xs font-semibold text-zinc-400">
                Pré-visualização na vitrine
              </span>
              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-lg">
                <div className="relative aspect-[4/3] w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
                  {form.image_url.trim() ? (
                    <Image
                      src={form.image_url.trim()}
                      alt={form.title || 'Pré-visualização'}
                      fill
                      unoptimized={!form.image_url.trim().startsWith('/')}
                      sizes="320px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-center p-4 text-zinc-500 space-y-1.5">
                      <ImagePlus className="w-8 h-8 mx-auto text-zinc-600" />
                      <p className="text-xs">A foto do produto aparecerá aqui</p>
                    </div>
                  )}
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-950/90 text-white border border-zinc-700 flex items-center gap-1">
                    <Store className="w-3 h-3 text-red-400" />
                    {form.store_name || 'Loja'}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="text-[11px] text-zinc-400 flex justify-between">
                    <span className="text-red-400 font-semibold">{form.sport}</span>
                    <span>{form.category}</span>
                  </div>
                  <p className="text-sm font-bold text-white line-clamp-2">
                    {form.title || 'Título da sua oferta em destaque'}
                  </p>
                  <div className="pt-2 border-t border-zinc-800 flex items-baseline justify-between">
                    <div>
                      {Number(form.original_price) > Number(form.price) && (
                        <span className="text-xs text-zinc-500 line-through block">
                          {formatBRL(Number(form.original_price))}
                        </span>
                      )}
                      <span className="text-lg font-black text-white">
                        {Number(form.price) > 0 ? formatBRL(Number(form.price)) : 'R$ 0,00'}
                      </span>
                    </div>
                    <span className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold">
                      Ver oferta
                    </span>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-red-500"
                />
                <span>Exibir imediatamente na Home e na aba Ofertas</span>
              </label>
            </div>
          </div>

          {formError && (
            <p role="alert" className="text-xs sm:text-sm font-semibold text-red-400 bg-red-950/40 border border-red-500/30 rounded-xl px-4 py-2.5">
              {formError}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setCurrentEditId(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-950/50 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSaving
                  ? 'Salvando...'
                  : currentEditId
                  ? 'Salvar alterações da oferta'
                  : 'Publicar oferta agora'}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* Barra de Busca e Filtro por Loja */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar ofertas por produto, loja (AliExpress, Amazon...), cupom ou esporte..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStoreFilter('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
              storeFilter === 'ALL'
                ? 'bg-red-600 text-white'
                : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Todas ({offers.length})
          </button>
          {uniqueStores.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStoreFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                storeFilter === st
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Lista Gerenciável de Ofertas */}
      {filteredOffers.length === 0 ? (
        <div className="text-center py-10 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
          <p className="text-sm font-semibold text-zinc-300">Nenhuma oferta encontrada para este filtro.</p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar nova oferta
          </button>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/80 rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950/50">
          {filteredOffers.map((offer) => {
            const isPaused = offer.is_active === false;
            const isConfirmingDelete = confirmDeleteId === offer.id;
            return (
              <div
                key={offer.id}
                className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-colors hover:bg-zinc-900/60 ${
                  isPaused ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                    <Image
                      src={offer.image_url}
                      alt={offer.title}
                      fill
                      unoptimized={!offer.image_url.startsWith('/')}
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
                        {offer.store_name}
                      </span>
                      <span className="text-[11px] text-red-400 font-semibold">{offer.sport}</span>
                      {offer.coupon_code && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                          <Ticket className="w-2.5 h-2.5" />
                          {offer.coupon_code}
                        </span>
                      )}
                      {isPaused && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/30">
                          Pausada
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-bold text-white truncate">{offer.title}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="font-extrabold text-white">{formatBRL(offer.price)}</span>
                      {offer.original_price && offer.original_price > offer.price && (
                        <span className="text-zinc-500 line-through">{formatBRL(offer.original_price)}</span>
                      )}
                      <a
                        href={offer.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-zinc-400 hover:text-red-400 truncate max-w-[240px]"
                        title={offer.source_url}
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">Testar link</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação: Editar, Pausar/Ativar, Duplicar, Excluir */}
                <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => populateFormFromOffer(offer, false)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold transition-colors"
                    title="Editar link, foto, preço ou descrição"
                  >
                    <Pencil className="w-3.5 h-3.5 text-amber-400" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleOfferActive(offer.id, isPaused)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
                    title={isPaused ? 'Reativar oferta na vitrine' : 'Pausar oferta temporariamente'}
                  >
                    {isPaused ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Ativar</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Pausar</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => populateFormFromOffer(offer, true)}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
                    title="Duplicar oferta como base"
                    aria-label="Duplicar oferta"
                  >
                    <CopyPlus className="w-3.5 h-3.5" />
                  </button>

                  {isConfirmingDelete ? (
                    <div className="inline-flex items-center gap-1 bg-red-950/80 border border-red-500/40 rounded-lg px-2 py-1">
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteOffer(offer.id);
                          setConfirmDeleteId(null);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-600 text-white text-xs font-bold"
                      >
                        <Check className="w-3 h-3" />
                        Confirmar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-1.5 py-0.5 text-xs text-zinc-300 hover:text-white"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(offer.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/25 text-xs font-semibold transition-colors"
                      title="Excluir oferta permanentemente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
