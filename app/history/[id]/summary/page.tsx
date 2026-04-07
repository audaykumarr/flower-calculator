"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [itemsRes, entryRes] = await Promise.all([
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/entries/${id}`),
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/entries`)
    ]);

    setItems(itemsRes.data);

    const entry = entryRes.data.find((e: any) => e.id == id);
    if (entry) {
      setCommissionPercent(entry.commission || 10);
    }
  };

  const total = items.reduce((sum, i) => sum + i.amount, 0);
  const commission = total * (commissionPercent / 100);
  const final = total - commission;

  // ✅ IMAGE SHARE
  const downloadImage = async () => {
    if (!cardRef.current) return;

    const dataUrl = await htmlToImage.toPng(cardRef.current);

    const link = document.createElement("a");
    link.download = "payout.png";
    link.href = dataUrl;
    link.click();
  };

  useEffect(() => {
    if (!items.length) return;

    const timeout = setTimeout(async () => {
      try {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/entries/${id}`, {
          items,
          commission: commissionPercent,
        });
      } catch (err) {
        console.error("Commission save failed", err);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [commissionPercent]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black text-white">
      <div className="w-full max-w-sm">

        {/* HEADER */}
        <h1 className="text-2xl font-bold text-center mb-6">
          💰 Payout Summary
        </h1>

        {/* COMMISSION INPUT */}
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
            className="w-full mt-1 bg-gray-800 border border-gray-600 rounded px-2 py-2 text-white"
          />
        </div>

        {/* 🔥 PREMIUM SHARE CARD */}
        <div
          ref={cardRef}
          className="rounded-3xl p-6 shadow-2xl border border-gray-700
                     bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
        >
          {/* BRAND */}
          <div className="text-center mb-4">
            <div className="text-xl font-bold">🌸 Flower Calculator</div>
            <div className="text-xs text-gray-400">
              Payout Summary
            </div>
          </div>

          {/* FINAL BIG */}
          <div className="text-center my-5">
            <div className="text-gray-400 text-sm">Final Payout</div>
            <div className="text-3xl font-bold text-green-400 mt-1">
              ₹{Math.round(final).toLocaleString()}
            </div>
          </div>

          {/* DIVIDER */}
          <div className="border-t border-gray-700 my-4"></div>

          {/* DETAILS */}
          <div className="space-y-3 text-sm">

            <div className="flex justify-between">
              <span className="text-gray-400">Total</span>
              <span className="font-medium">
                ₹{Math.round(total).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">
                Commission ({commissionPercent}%)
              </span>
              <span className="text-red-400">
                -₹{Math.round(commission).toLocaleString()}
              </span>
            </div>

          </div>

          {/* FOOTER */}
          <div className="text-center text-xs text-gray-500 mt-5">
            Generated via Flower Calculator 🌸
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={downloadImage}
          className="mt-5 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium"
        >
          📸 Download & Share
        </button>

      </div>
    </div>
  );
}