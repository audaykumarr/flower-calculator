"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

type Item = {
  day: number;
  kgs: number;
  price: number;
  amount: number;
};

export default function Details() {
  const { id } = useParams();
  const [items, setItems] = useState<Item[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const completedDays = items.filter(i => i.price > 0).length;
  const router = useRouter();
  const [commissionPercent, setCommissionPercent] = useState(10);

  // Load data
  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    const [itemsRes, entryRes] = await Promise.all([
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/entries/${id}`),
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/entries`) // get all
    ]);

    setItems(itemsRes.data);

    const entry = entryRes.data.find((e: any) => e.id == id);
    if (entry) {
      setCommissionPercent(entry.commission || 10);
    }
  };

  // Handle change
  const handleChange = (
    index: number,
    field: "kgs" | "price",
    value: string
  ) => {
    const updated = [...items];
    const num = parseFloat(value) || 0;
    updated[index][field] = num;

    const kgs = updated[index].kgs;
    const price = updated[index].price;

    updated[index].amount =
      kgs > 0 && price > 0 ? kgs * price : 0;

    setItems(updated);
  };

  useEffect(() => {
    if (!items.length) return;

    const timeout = setTimeout(async () => {
      try {
        setIsSaving(true);

        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/entries/${id}`, {
          items,
          commission: commissionPercent,
        });

        setIsSaving(false);
      } catch (err) {
        console.error("Auto-save failed", err);
        setIsSaving(false);
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [items, commissionPercent]);

  const total = items.reduce((sum, i) => sum + i.amount, 0);
  const commissionValue = total * (commissionPercent / 100);
  const final = total - commissionValue;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4 text-center">
        📊 Entry Details
      </h1>

      {isSaving && (
        <div className="text-yellow-400 text-sm mb-2 text-center">
          Saving...
        </div>
      )}

      <div className="text-center mb-3 text-sm text-gray-400">
        {completedDays} / 15 days completed
      </div>

      <button
        onClick={() => router.push(`/history/${id}/summary`)}
        className="mt-3 bg-green-500 text-white px-4 py-2 rounded w-full"
      >
        View Payout Summary
      </button>

      <div className="bg-gray-900 text-white rounded p-3 border border-gray-700">
        {items.map((item, index) => (
          <div
            key={item.day}
            className="grid grid-cols-4 gap-2 py-2 border-b border-gray-700 text-sm"
          >
            <span>Day {item.day}</span>

            {/* KGS EDIT */}
            <input
              type="number"
              value={item.kgs || ""}
              onChange={(e) =>
                handleChange(index, "kgs", e.target.value)
              }
              className="bg-gray-800 border border-gray-600 rounded px-1 text-white"
              placeholder="Kgs"
            />

            {/* PRICE EDIT */}
            <input
              type="number"
              value={item.price || ""}
              onChange={(e) =>
                handleChange(index, "price", e.target.value)
              }
              className="bg-gray-800 border border-gray-600 rounded px-1 text-white"
              placeholder="Price"
            />

            {/* AMOUNT */}
            <span className="text-right font-semibold">
              {item.price > 0
                ? `₹${item.amount.toLocaleString()}`
                : "Pending"}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <label className="text-sm text-gray-400">
          Commission %
        </label>

        <input
          type="number"
          value={commissionPercent}
          onChange={(e) =>
            setCommissionPercent(
              Math.min(100, Math.max(0, parseFloat(e.target.value) || 0))
            )
          }
          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-full mt-1 text-white"
        />
      </div>

      {/* TOTAL */}
      <div className="mt-4 bg-gray-800 text-white p-3 rounded border border-gray-700">
        <div className="flex justify-between">
          <span>Total</span>
          <span>₹{total.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-green-400 font-bold mt-2">
          <span>Final ({commissionPercent}%)</span>
          <span>₹{Math.round(final).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}