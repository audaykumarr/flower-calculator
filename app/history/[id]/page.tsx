"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Item = {
  day: number;
  kgs: number;
  price: number;
  amount: number;
};

export default function Details() {
  const { id } = useParams();
  const router = useRouter();

  const [items, setItems] = useState<Item[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [commissionPercent, setCommissionPercent] = useState(10);

  const completedDays = items.filter((i) => i.price > 0).length;

  // FETCH DATA
  useEffect(() => {
      fetchDetails();
    }, []);

    const fetchDetails = async () => {
      const { data: itemsData } = await supabase
        .from("items")
        .select("*")
        .eq("entry_id", id)
        .order("day", { ascending: true });

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

    // HANDLE INPUT
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

    // AUTO SAVE
    useEffect(() => {
    if (!items.length) return;

    const timeout = setTimeout(async () => {
      try {
        setIsSaving(true);

        // BATCH UPSERT (single call)
        const itemsPayload = items.map((item) => ({
          entry_id: id,
          day: item.day,
          kgs: item.kgs,
          price: item.price,
          amount: item.amount,
        }));

        const { error: itemsError } = await supabase
          .from("items")
          .upsert(itemsPayload, {
            onConflict: "entry_id,day",
          });

        if (itemsError) throw itemsError;

        // calculate totals
        const total = items.reduce((s, i) => s + i.amount, 0);
        const commissionValue = total * (commissionPercent / 100);
        const final = total - commissionValue;

        // single update
        const { error: entryError } = await supabase
          .from("entries")
          .update({
            total,
            final,
            commission: commissionPercent,
          })
          .eq("id", id);

        if (entryError) throw entryError;

        setIsSaving(false);
      } catch (err) {
        console.error(err);
        setIsSaving(false);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [items, commissionPercent]);

  const total = items.reduce((sum, i) => sum + i.amount, 0);
  const final =
    total - total * (commissionPercent / 100);

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
        {completedDays} / {items.length} days completed
      </div>

      <button
        onClick={() => router.push(`/history/${id}/summary`)}
        className="mt-3 bg-green-500 text-white px-4 py-2 rounded w-full"
      >
        View Payout Summary
      </button>

      <div className="bg-gray-900 text-white rounded p-3 border border-gray-700 mt-3">
        {items.map((item, index) => (
          <div
            key={item.day}
            className="grid grid-cols-4 gap-2 py-2 border-b border-gray-700 text-sm"
          >
            <span>Day {item.day}</span>

            <input
              type="number"
              value={item.kgs || ""}
              onChange={(e) =>
                handleChange(index, "kgs", e.target.value)
              }
              className="bg-gray-800 border border-gray-600 rounded px-1"
              placeholder="Kgs"
            />

            <input
              type="number"
              value={item.price || ""}
              onChange={(e) =>
                handleChange(index, "price", e.target.value)
              }
              className="bg-gray-800 border border-gray-600 rounded px-1"
              placeholder="Price"
            />

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
          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-full mt-1"
        />
      </div>

      <div className="mt-4 bg-gray-800 p-3 rounded border border-gray-700">
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