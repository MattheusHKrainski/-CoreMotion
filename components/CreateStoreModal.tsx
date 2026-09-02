'use client';

import React, { useState } from 'react';
import { useCoreMotiom } from '@/lib/store';
import {
  X,
  Store,
  ShieldCheck,
} from 'lucide-react';

export default function CreateStoreModal() {
  const {
    isCreateStoreModalOpen,
    setCreateStoreModalOpen,
    createStore,
    user,
    setSelectedStore,
  } = useCoreMotiom();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Alta Performance');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('São Paulo, SP');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80');
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1200&q=80');
  const [loading, setLoading] = useState(false);

  if (!isCreateStoreModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const newStore = await createStore({
        owner_id: user?.id || 'seller-new',
        name,
        slug,
        description,
        category,
        logo_url: logoUrl,
        banner_url: bannerUrl,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        location,
      });

      setSelectedStore(newStore);
      setCreateStoreModalOpen(false);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#12151C] text-white rounded-2xl border border-[#232836] shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-[#232836] flex items-center justify-between bg-[#0E1017]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-400 border border-red-500/20 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Cadastrar Loja Oficial
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Crie a vitrine da sua marca esportiva no CoreMotiom.
              </p>
            </div>
          </div>

          <button
            onClick={() => setCreateStoreModalOpen(false)}
            className="p-2 text-[#94A3B8] hover:text-white hover:bg-[#181D26] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#D1D5DB] mb-1">
              Nome Comercial da Loja / Marca
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Velocity Running Lab"
              className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1">
                Categoria Principal
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
              >
                <option value="Alta Performance">Alta Performance</option>
                <option value="Corrida de Rua">Corrida de Rua</option>
                <option value="Ciclismo & Triatlo">Ciclismo & Triatlo</option>
                <option value="Trail & Outdoor">Trail & Outdoor</option>
                <option value="Tecnologia & Wearables">Tecnologia & Wearables</option>
                <option value="Crossfit & Funcional">Crossfit & Funcional</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1">
                Cidade / Estado
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Curitiba, PR"
                className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#D1D5DB] mb-1">
              Descrição da Marca & Proposta de Valor
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a especialidade da sua loja e diferenciais técnicos..."
              className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1">
                E-mail Comercial
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="comercial@sualoja.com.br"
                className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1">
                Telefone / WhatsApp Comercial
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+55 (11) 99999-9999"
                className="w-full px-3 py-2 bg-[#0E1017] text-xs text-white rounded-lg border border-[#232836] focus:border-red-500/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Banner & Logo Preset URLs */}
          <div className="p-3 bg-[#0E1017] rounded-lg border border-[#232836] space-y-2">
            <span className="text-[11px] font-semibold text-[#D1D5DB]">Identidade Visual da Loja (URLs de Imagem)</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="URL do Logotipo"
                className="px-2.5 py-1.5 bg-[#181D26] text-[11px] text-[#94A3B8] rounded border border-[#232836]"
              />
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="URL do Banner"
                className="px-2.5 py-1.5 bg-[#181D26] text-[11px] text-[#94A3B8] rounded border border-[#232836]"
              />
            </div>
          </div>

          {/* Verification Notice */}
          <div className="p-3 rounded-lg bg-red-600/10 border border-red-500/20 text-[#D1D5DB] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Após a criação da loja, você poderá solicitar o selo oficial <strong className="text-white">✓ Verificado</strong> enviando o CNPJ e documentação cadastral.
            </p>
          </div>

          {/* Submit */}
          <div className="pt-3 flex justify-end gap-2 border-t border-[#232836]">
            <button
              type="button"
              onClick={() => setCreateStoreModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-[#181D26] text-white text-xs font-semibold hover:bg-[#232836]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Store className="w-4 h-4" />
              <span>{loading ? 'Criando Loja...' : 'Criar Loja Oficial'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

