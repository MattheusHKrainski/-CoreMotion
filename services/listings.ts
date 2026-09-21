import { Product, ProductCondition } from '@/lib/types';
import { INITIAL_PRODUCTS } from '@/lib/initial-data';

export interface ListingFilters {
  category?: string;
  sport?: string;
  condition?: ProductCondition;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  seller_id?: string;
}

/**
 * Modular service for athlete-to-athlete (C2C) listings.
 */
export class ListingsService {
  /**
   * Fetches C2C listings from database via /api/listings.
   */
  static async getListings(filters?: ListingFilters): Promise<Product[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.set('category', filters.category);
      if (filters?.sport) params.set('sport', filters.sport);
      if (filters?.condition) params.set('condition', filters.condition);
      if (filters?.seller_id) params.set('seller_id', filters.seller_id);
      if (filters?.search) params.set('search', filters.search);
      if (filters?.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
      if (filters?.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));

      const res = await fetch(`/api/listings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.listings) && data.listings.length > 0) {
          return data.listings as Product[];
        }
      }
    } catch (err) {
      console.warn('[ListingsService] Fetch /api/listings failed, using local cache:', err);
    }

    // Fallback: filter local C2C products
    const c2cItems = INITIAL_PRODUCTS.filter((p) => p.product_type === 'c2c');
    return this.applyLocalFilters(c2cItems, filters);
  }

  /**
   * Creates a C2C listing.
   */
  static async createListing(
    listing: Omit<Product, 'id' | 'created_at' | 'views' | 'likes_count' | 'product_type'>,
    sellerId?: string
  ): Promise<Product> {
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...listing,
          product_type: 'c2c',
          seller_id: sellerId || listing.seller_id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.listing) {
          return data.listing as Product;
        }
      }
    } catch (err) {
      console.warn('[ListingsService] Create listing error:', err);
    }

    return {
      ...listing,
      id: `list_${Date.now()}`,
      product_type: 'c2c',
      created_at: new Date().toISOString(),
      views: 0,
      likes_count: 0,
      seller_id: sellerId || listing.seller_id || 'athlete_user',
    };
  }

  /**
   * Deletes a C2C listing.
   */
  static async deleteListing(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/listings?id=${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }

  private static applyLocalFilters(items: Product[], filters?: ListingFilters): Product[] {
    if (!filters) return items;

    return items.filter((p) => {
      if (filters.category && filters.category !== 'all' && filters.category !== 'Todos' && p.category !== filters.category) return false;
      if (filters.sport && filters.sport !== 'all' && filters.sport !== 'Todos' && p.sport !== filters.sport) return false;
      if (filters.condition && p.condition !== filters.condition) return false;
      if (filters.seller_id && p.seller_id !== filters.seller_id) return false;
      if (filters.minPrice !== undefined && p.price < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && p.price > filters.maxPrice) return false;
      if (filters.search) {
        const term = filters.search.toLowerCase();
        return (
          p.title.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          p.sport.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }
}

export const getListings = ListingsService.getListings.bind(ListingsService);
export const createListing = ListingsService.createListing.bind(ListingsService);
export const deleteListing = ListingsService.deleteListing.bind(ListingsService);
