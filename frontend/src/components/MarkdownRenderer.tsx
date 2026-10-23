"use client";

import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Mizan AI Markdown Renderer
 * 
 * Harici ağır kütüphanelere bağımlı kalmadan; raw markdown sembollerini
 * (**, ###, ---, | tablo |, bulletler) temiz, şık ve okunabilir
 * HTML elemanlarına dönüştürür.
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
}) => {
  if (!content) return null;

  // Satır bazlı ayrıştırma
  const lines = content.split("\n");
  const renderedElements: React.ReactNode[] = [];

  let inList = false;
  let listItems: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={key} className="my-2.5 space-y-1.5 pl-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D8B52] dark:bg-emerald-400 mt-2 shrink-0" />
              <span className="flex-1 leading-relaxed">{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = (key: string) => {
    if (tableRows.length > 0) {
      const header = tableRows[0];
      const body = tableRows.slice(1).filter((row) => !row.every((cell) => cell.includes("---") || cell.includes("===")));
      renderedElements.push(
        <div key={key} className="my-3 overflow-x-auto rounded-xl border border-slate-200/80 dark:border-white/10 shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-white/10 border-b border-slate-200 dark:border-white/10">
                {header.map((col, cIdx) => (
                  <th key={cIdx} className="p-2.5 font-bold text-slate-900 dark:text-white">
                    {renderInline(col.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {body.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2.5 text-slate-700 dark:text-slate-300">
                      {renderInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  /**
   * Satır içi kalın (**bold**), yatık (*italic*), kod (`code`) ayrıştırıcı
   */
  const renderInline = (text: string): React.ReactNode => {
    if (!text) return null;

    // 1. Önce kod bloklarını koru
    const parts: React.ReactNode[] = [];
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={match.index} className="font-bold text-slate-900 dark:text-white">
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Boş satır
    if (!trimmed) {
      flushList(`list-${i}`);
      flushTable(`table-${i}`);
      continue;
    }

    // Tablo Satırı: | Sütun | Sütun |
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushList(`list-${i}`);
      const cells = trimmed
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      // Ayırıcı çizgi kontrolü (|---|---|)
      const isDivider = cells.every((c) => /^[-:]+$/.test(c.replace(/\s+/g, "")));
      if (!isDivider) {
        tableRows.push(cells);
      }
      inTable = true;
      continue;
    } else if (inTable) {
      flushTable(`table-${i}`);
    }

    // Yatay Çizgi: --- veya ***
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      flushList(`list-${i}`);
      flushTable(`table-${i}`);
      renderedElements.push(
        <hr key={`hr-${i}`} className="my-3 border-t border-slate-200/60 dark:border-white/10" />
      );
      continue;
    }

    // Başlıklar: ###, ##, #
    if (trimmed.startsWith("### ")) {
      flushList(`list-${i}`);
      flushTable(`table-${i}`);
      renderedElements.push(
        <h4 key={`h3-${i}`} className="text-sm font-black text-slate-900 dark:text-white mt-3.5 mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-3.5 rounded-full bg-[#0D8B52] dark:bg-emerald-400 inline-block" />
          <span>{renderInline(trimmed.replace(/^###\s+/, ""))}</span>
        </h4>
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushList(`list-${i}`);
      flushTable(`table-${i}`);
      renderedElements.push(
        <h3 key={`h2-${i}`} className="text-base font-black text-slate-900 dark:text-white mt-4 mb-2 flex items-center gap-2">
          <span className="w-2 h-4 rounded-full bg-[#0D8B52] dark:bg-emerald-400 inline-block" />
          <span>{renderInline(trimmed.replace(/^##\s+/, ""))}</span>
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushList(`list-${i}`);
      flushTable(`table-${i}`);
      renderedElements.push(
        <h2 key={`h1-${i}`} className="text-lg font-black text-slate-900 dark:text-white mt-4 mb-2">
          {renderInline(trimmed.replace(/^#\s+/, ""))}
        </h2>
      );
      continue;
    }

    // Alıntı / Vurgu Kutusu: >
    if (trimmed.startsWith("> ")) {
      flushList(`list-${i}`);
      flushTable(`table-${i}`);
      renderedElements.push(
        <div
          key={`quote-${i}`}
          className="my-2.5 p-3 rounded-xl bg-emerald-500/10 border-l-3 border-[#0D8B52] dark:border-emerald-400 text-slate-800 dark:text-emerald-100 text-xs leading-relaxed"
        >
          {renderInline(trimmed.replace(/^>\s+/, ""))}
        </div>
      );
      continue;
    }

    // Madde İşareti (Bullet): * , - , + veya 1. 2.
    const bulletMatch = trimmed.match(/^([*\-+]\s+|\d+\.\s+)(.*)$/);
    if (bulletMatch) {
      flushTable(`table-${i}`);
      listItems.push(bulletMatch[2]);
      inList = true;
      continue;
    } else if (inList) {
      flushList(`list-${i}`);
    }

    // Standart Paragraf Metni
    renderedElements.push(
      <p key={`p-${i}`} className="leading-relaxed text-slate-800 dark:text-slate-200 my-1">
        {renderInline(trimmed)}
      </p>
    );
  }

  flushList("list-final");
  flushTable("table-final");

  return <div className={`space-y-1 ${className}`}>{renderedElements}</div>;
};
