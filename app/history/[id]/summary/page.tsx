"use client";

import { useEffect, useState, useRef } from "react";
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

  const cardRef = useRef<HTMLDivElement>(null);

  // 🔥 FETCH
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

    if (entry) {
      setCommissionPercent(entry.commission || 10);
    }
  };

  const total = items.reduce((sum, i) => sum + i.amount, 0);
  const commission = total * (commissionPercent / 100);
  const final = total - commission;

  // 📸 SHARE IMAGE
  const downloadImage = async () => {
    if (!cardRef.current) return;

    const dataUrl = await htmlToImage.toPng(cardRef.current);

    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], "payout.png", { type: "image/png" });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Flower Payout",
          text: "Check my payout 🌸",
        });
        return;
      } catch {}
    }

    const link = document.createElement("a");
    link.download = "payout.png";
    link.href = dataUrl;
    link.click();
  };

  // SAVE COMMISSION
  useEffect(() => {
    if (!items.length) return;

    const timeout = setTimeout(async () => {
      await supabase
        .from("entries")
        .update({ commission: commissionPercent })
        .eq("id", id);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [commissionPercent]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black text-white">
      <div className="w-full max-w-sm">

        <h1 className="text-2xl font-bold text-center mb-6">
          💰 Payout Summary
        </h1>

        <div className="mb-4">
          <label className="text-sm text-gray-400">
            Commission %
          </label>

          <input
            type="number"
            value={commissionPercent}
            onChange={(e) =>
              setCommissionPercent(parseFloat(e.target.value) || 0)
            }
            className="w-full mt-1 bg-gray-800 border border-gray-600 rounded px-2 py-2"
          />
        </div>

        <div
          ref={cardRef}
          className="rounded-3xl p-6 border border-gray-700 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
        >
          <div className="text-center mb-4">
            <div className="text-xl font-bold">🌸 Flower Calculator</div>
            <div className="text-xs text-gray-400">
              Payout Summary
            </div>
          </div>

          <div className="text-center my-5">
            <div className="text-gray-400 text-sm">Final</div>
            <div className="text-3xl font-bold text-green-400">
              ₹{Math.round(final).toLocaleString()}
            </div>
          </div>

          <div className="border-t border-gray-700 my-4"></div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total</span>
              <span>₹{Math.round(total).toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-red-400">
              <span>Commission ({commissionPercent}%)</span>
              <span>-₹{Math.round(commission).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <button
          onClick={downloadImage}
          className="mt-5 w-full bg-green-500 py-3 rounded-xl"
        >
          📸 Download & Share
        </button>

      </div>
    </div>
  );
}