"use client";
import {useMemo, useState} from "react";
import {Product} from "@/lib/api";
import {UUID} from "node:crypto";


export interface CartLine {
  product: Product;
  qty: number;
  unitPrice?: number;
}


export const usePOSCart = () => {
  const [lines, setLines] = useState<CartLine[]>([]);


  const add = (item: CartLine) => setLines(prev => {
    const idx = prev.findIndex(l => l.product.product_id === item.product.product_id);
    if (idx >= 0) {
      const copy = [...prev];
      copy[idx] = {...copy[idx], qty: copy[idx].qty + item.qty, unitPrice: item.unitPrice ?? copy[idx].unitPrice};
      return copy;
    }
    return [...prev, item];
  });

  const updateQty = (productId: UUID, qty: number) => setLines(prev => prev.map(l => l.product.product_id === productId ? {...l, qty} : l));

  const remove = (productId: UUID) => setLines(prev => prev.filter(l => l.product.product_id !== productId));

  const clear = () => setLines([]);

  const total = useMemo(() => lines.reduce((s, l) => s + (l.unitPrice ?? 0) * l.qty, 0), [lines]);

  return {lines, add, updateQty, remove, clear, total};
};
