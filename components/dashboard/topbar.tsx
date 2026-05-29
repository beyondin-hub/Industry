"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Search, ShieldCheck, CreditCard, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { mxn } from "@/lib/utils";
import {
  CURRENT_BUYER,
  CURRENT_COMPANY,
  NOTIFICATIONS,
} from "@/lib/data/account";
import { logoutAction } from "@/app/(auth)/actions";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import type { Buyer, Company } from "@/types";

export function Topbar({
  buyer = CURRENT_BUYER,
  company = CURRENT_COMPANY,
}: {
  buyer?: Buyer;
  company?: Company;
}) {
  const [open, setOpen] = useState(false);
  const noLeidas = NOTIFICATIONS.filter((n) => !n.leida).length;

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card/90 px-4 backdrop-blur lg:px-6">
      <MobileNav />
      {/* Quick order / search */}
      <form action="/catalogo" className="hidden flex-1 items-center gap-2 sm:flex">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-steel-400" />
          <input
            name="q"
            placeholder="Quick order: pega número de parte o busca…"
            className="h-9 w-full rounded-md border border-input bg-steel-50 pl-9 pr-3 text-sm outline-none focus:bg-card focus:ring-2 focus:ring-ring"
          />
        </div>
      </form>

      <div className="ml-auto flex items-center gap-3">
        {company.credito_aprobado && (
          <div className="hidden items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 md:flex">
            <CreditCard className="size-3.5" />
            Crédito {mxn(company.limite_credito)} · {company.dias_credito}d
          </div>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="relative flex size-9 items-center justify-center rounded-md hover:bg-secondary"
            aria-label="Notificaciones"
          >
            <Bell className="size-5 text-steel-700" />
            {noLeidas > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-safety text-[10px] font-bold text-white">
                {noLeidas}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border bg-card shadow-lg">
              <div className="border-b px-4 py-3 text-sm font-semibold">Notificaciones</div>
              <div className="max-h-96 divide-y overflow-y-auto">
                {NOTIFICATIONS.map((n) => (
                  <div key={n.id} className="px-4 py-3 hover:bg-steel-50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-steel-900">{n.titulo}</p>
                      {!n.leida && <span className="size-2 rounded-full bg-safety" />}
                    </div>
                    <p className="mt-0.5 text-xs text-steel-500">{n.mensaje}</p>
                    <Badge variant="secondary" className="mt-1.5 text-[10px]">
                      {n.canal}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <Link href="/perfil" className="flex items-center gap-2.5">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-tight text-steel-900">
              {buyer.nombre}
            </p>
            <p className="flex items-center justify-end gap-1 text-xs text-steel-500">
              <ShieldCheck className="size-3 text-emerald-600" />
              {company.nombre}
            </p>
          </div>
          <div className="flex size-9 items-center justify-center rounded-full bg-steel-900 text-sm font-bold text-white">
            {buyer.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </div>
        </Link>

        {/* Logout */}
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex size-9 items-center justify-center rounded-md text-steel-500 hover:bg-secondary hover:text-steel-800"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut className="size-5" />
          </button>
        </form>
      </div>
    </header>
  );
}
