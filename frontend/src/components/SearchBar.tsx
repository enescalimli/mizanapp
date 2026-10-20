"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, X } from "lucide-react";
import { SAMPLE_COMPANIES_SUMMARY } from "@/lib/data/sampleCompanies";
import { ComplianceBadge } from "./ComplianceBadge";

interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Hisse kodu veya şirket adı arayın (Örn: BIMAS, THYAO, ASELS...)",
  autoFocus = false,
}) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? SAMPLE_COMPANIES_SUMMARY.filter(
        (c) =>
          c.ticker.toLowerCase().includes(query.toLowerCase()) ||
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.sector.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (ticker: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/companies/${ticker}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && filtered.length > 0) {
      handleSelect(filtered[0].ticker);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 transition-all focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500">
        <Search
          size={18}
          className="absolute left-4 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent border-0 rounded-2xl pl-12 pr-16 py-3.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all font-medium"
        />
        <div className="absolute right-3.5 flex items-center gap-1.5">
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-slate-600 transition"
            >
              <X size={16} />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-slate-100 text-xs text-slate-400 font-mono border border-slate-200">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-100 max-h-96 overflow-y-auto backdrop-blur-xl animate-in fade-in duration-150">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <button
                key={item.ticker}
                onClick={() => handleSelect(item.ticker)}
                className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs font-mono group-hover:border-emerald-500 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                    {item.ticker}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors text-sm">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono tabular-nums">
                      {item.sector} &bull; ₺{item.priceTRY} ({item.change24h})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ComplianceBadge status={item.bistStatus} size="sm" />
                  <ArrowRight
                    size={15}
                    className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all"
                  />
                </div>
              </button>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">
              &quot;{query}&quot; ile eşleşen şirket bulunamadı.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
