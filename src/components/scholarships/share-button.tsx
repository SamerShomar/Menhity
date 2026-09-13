"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    const url = window.location.href;

    // نستخدم مشاركة النظام إن توفّرت، وإلا ننسخ الرابط
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // ألغى المستخدم المشاركة — ننتقل للنسخ
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // تعذّر النسخ (سياق غير آمن) — نتجاهل بصمت
    }
  }

  return (
    <button
      type="button"
      onClick={onShare}
      aria-label="مشاركة المنحة"
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-ink-300 bg-white px-3 text-[13px] font-semibold text-ink-600 transition-colors hover:border-navy-300 hover:text-navy-700"
    >
      {copied ? (
        <>
          <Check className="size-4 text-[color:var(--color-success)]" />
          تم نسخ الرابط
        </>
      ) : (
        <Share2 className="size-4" />
      )}
    </button>
  );
}
