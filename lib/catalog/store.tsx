"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

// Store de catálogo del comprador (demo): carrito de cotización, recién
// vistos, comparador y watchlist. Persistido en localStorage para funcionar
// sin sesión/DB. En producción se sincronizaría con cart_items / watchlist.

export interface CartLine {
  id: string;
  cantidad: number;
  reorden?: boolean;
}

interface CatalogState {
  cart: CartLine[];
  recent: string[];
  compare: string[];
  watchlist: string[];
}

interface CatalogStore extends CatalogState {
  addToCart: (id: string, cantidad?: number, reorden?: boolean) => void;
  setCartQty: (id: string, cantidad: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  trackView: (id: string) => void;
  toggleCompare: (id: string) => void;
  toggleWatch: (id: string) => void;
}

const KEY = "novak_catalog_store_v1";
const MAX_RECENT = 8;
const MAX_COMPARE = 4;

const empty: CatalogState = { cart: [], recent: [], compare: [], watchlist: [] };

const Ctx = createContext<CatalogStore | null>(null);

export function CatalogStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CatalogState>(empty);
  const [hydrated, setHydrated] = useState(false);

  // Cargar de localStorage al montar.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...empty, ...JSON.parse(raw) });
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, []);

  // Persistir en cada cambio (tras hidratar).
  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const addToCart = useCallback((id: string, cantidad = 1, reorden = false) => {
    setState((s) => {
      const exists = s.cart.find((l) => l.id === id);
      const cart = exists
        ? s.cart.map((l) => (l.id === id ? { ...l, cantidad: l.cantidad + cantidad, reorden } : l))
        : [...s.cart, { id, cantidad, reorden }];
      return { ...s, cart };
    });
  }, []);

  const setCartQty = useCallback((id: string, cantidad: number) => {
    setState((s) => ({
      ...s,
      cart: s.cart.map((l) => (l.id === id ? { ...l, cantidad: Math.max(1, cantidad) } : l)),
    }));
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setState((s) => ({ ...s, cart: s.cart.filter((l) => l.id !== id) }));
  }, []);

  const clearCart = useCallback(() => setState((s) => ({ ...s, cart: [] })), []);

  const trackView = useCallback((id: string) => {
    setState((s) => ({ ...s, recent: [id, ...s.recent.filter((x) => x !== id)].slice(0, MAX_RECENT) }));
  }, []);

  const toggleCompare = useCallback((id: string) => {
    setState((s) => {
      if (s.compare.includes(id)) return { ...s, compare: s.compare.filter((x) => x !== id) };
      if (s.compare.length >= MAX_COMPARE) return s; // máximo 4
      return { ...s, compare: [...s.compare, id] };
    });
  }, []);

  const toggleWatch = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      watchlist: s.watchlist.includes(id)
        ? s.watchlist.filter((x) => x !== id)
        : [...s.watchlist, id],
    }));
  }, []);

  return (
    <Ctx.Provider
      value={{ ...state, addToCart, setCartQty, removeFromCart, clearCart, trackView, toggleCompare, toggleWatch }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCatalogStore(): CatalogStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCatalogStore debe usarse dentro de CatalogStoreProvider");
  return ctx;
}
