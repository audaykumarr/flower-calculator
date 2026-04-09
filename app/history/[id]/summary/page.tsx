"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import * as htmlToImage from "html-to-image";

type Item = {
  day: number;
  kgs: number;
  price: number;
  amount: number;
};

export default function Summary() {
  const { id } = useParams();

  const [items, setItems] = useState<Item[]>([]);
  const [commissionPercent, setCommissionPercent] = useState(10);
  const [toast, setToast] = useState("");

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: itemsData } = await supabase
      .from("items")
      .select("*")
      .eq("entry_id", id);

    const { data: entry } = await supabase
      .from("entries")
      .select("*")
      .eq("id", id)
      .single();

    setItems(itemsData || []);
    if (entry) setCommissionPercent(entry.commission || 10);
  };

  const { total, commission, final } = useMemo(() => {
    const total = items.reduce((s, i) => s + i.amount, 0);
    const commission = total * (commissionPercent / 100);
    const final = total - commission;

    return { total, commission, final };
  }, [items, commissionPercent]);

  const downloadImage = async () => {
    if (!cardRef.current) return;

    const dataUrl = await htmlToImage.toPng(cardRef.current, {
      cacheBust: true,
    });

    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], "flower-payout.png", {
      type: "image/png",
    });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "🌸 Flower Calculator",
          text: `My payout is ₹${Math.round(final).toLocaleString()} 💰`,
        });
        return;
      } catch {}
    }

    const link = document.createElement("a");
    link.download = "flower-payout.png";
    link.href = dataUrl;
    link.click();

    setToast("Downloaded 📸");
    setTimeout(() => setToast(""), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black text-white pb-20">
      <div className="w-full max-w-sm">

        <h1 className="text-2xl font-bold text-center mb-6">
          💰 Payout Summary
        </h1>

        <div className="mb-4">
          <input
            type="number"
            value={commissionPercent}
            onChange={(e) =>
              setCommissionPercent(parseFloat(e.target.value) || 0)
            }
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2"
          />
        </div>

        <div
          ref={cardRef}
          className="rounded-3xl p-6 border border-gray-700 
          bg-gradient-to-br from-green-900/30 via-gray-900 to-black
          shadow-2xl"
        >

          <div className="flex flex-col items-center mb-4">
            <img
              src="/icon-192.png"
              className="w-14 h-14 rounded-xl mb-2 shadow-lg"
            />
            <div className="text-lg font-semibold">
              Flower Calculator
            </div>
            <div className="text-xs text-gray-400">
              Payout Summary
            </div>
          </div>

          <div className="text-center my-6">
            <div className="text-gray-400 text-sm">
              Final Amount
            </div>
            <div className="text-4xl font-bold text-green-400 mt-1">
              ₹{Math.round(final).toLocaleString()}
            </div>
          </div>

          <div className="space-y-3 text-sm mt-4">
            <div className="flex justify-between">
              <span>Total</span>
              <span>₹{Math.round(total).toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-red-400">
              <span>Commission ({commissionPercent}%)</span>
              <span>-₹{Math.round(commission).toLocaleString()}</span>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 mt-6">
            🌸 Generated via Flower Calculator
          </div>
        </div>

        <button
          onClick={downloadImage}
          className="mt-5 w-full bg-green-500 hover:bg-green-600 py-3 rounded-xl font-semibold"
        >
          📸 Share to WhatsApp
        </button>

      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 px-4 py-2 rounded shadow text-sm">
          {toast}
        </div>
      )}
    </div>
  );
}