"use client";

import { useEffect, useState, useMemo } from "react";
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
  const [commissionPercent, setCommissionPercent] = useState(10);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [dirty, setDirty] = useState(false);

  // FETCH DATA
  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    setLoading(true);

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
    if (entry) setCommissionPercent(entry.commission || 10);

    setLoading(false);
  };

  // CALCULATE (MEMO)
  const { total, final } = useMemo(() => {
    let total = 0;

    items.forEach((i) => {
      total += i.amount;
    });

    const final = total - total * (commissionPercent / 100);

    return { total, final };
  }, [items, commissionPercent]);

  const completedDays = items.filter((i) => i.price > 0).length;

  // HANDLE INPUT
  const handleChange = (
    index: number,
    field: "kgs" | "price",
    value: string
  ) => {
    const updated = [...items];
    const num = parseFloat(value) || 0;

    if (updated[index][field] === num) return;

    updated[index][field] = num;

    const kgs = updated[index].kgs;
    const price = updated[index].price;

    updated[index].amount =
      kgs > 0 && price > 0 ? kgs * price : 0;

    setItems(updated);
    setDirty(true);
  };

  const saveData = async () => {
    try {
      const itemsPayload = items.map((item) => ({
        entry_id: id,
        day: item.day,
        kgs: item.kgs,
        price: item.price,
        amount: item.amount,
      }));

      await supabase
        .from("items")
        .upsert(itemsPayload, { onConflict: "entry_id,day" });

      await supabase
        .from("entries")
        .update({
          total,
          final,
          commission: commissionPercent,
        })
        .eq("id", id);

      setToast("Saved ✅");
      setDirty(false);
    } catch {
      setToast("Save failed ❌");
    }

    setTimeout(() => setToast(""), 2000);
  };

  return (
    <div className="p-4 pb-28 max-w-md mx-auto">

      <h1 className="text-xl font-bold mb-4 text-center">
        📊 Entry Details
      </h1>

      {/* LOADING */}
      {loading && (
        <div className="text-center text-gray-400 mt-10">
          Loading...
        </div>
      )}

      {!loading && (
        <>
          <div className="text-center mb-3 text-sm text-gray-400">
            {completedDays} / {items.length} days completed
          </div>

          <button
            onClick={() => router.push(`/history/${id}/summary`)}
            className="bg-green-500 text-white px-4 py-2 rounded w-full mb-3"
          >
            View Payout Summary
          </button>

          {/* ITEMS */}
          <div className="bg-gray-900 rounded p-3 border border-gray-700">
            {items.map((item, index) => (
              <div
                key={item.day}
                className="grid grid-cols-4 gap-2 py-2 border-b border-gray-700 text-sm"
              >
                <span>Day {item.day}</span>

                <input
                  value={item.kgs || ""}
                  onChange={(e) =>
                    handleChange(index, "kgs", e.target.value)
                  }
                  className="bg-gray-800 border border-gray-600 rounded px-1"
                  placeholder="Kgs"
                />

                <input
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
                    : "—"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <input
              type="number"
              value={commissionPercent}
              onChange={(e) =>
                setCommissionPercent(
                  Math.min(100, Math.max(0, parseFloat(e.target.value) || 0))
                )
              }
              className="bg-gray-800 border border-gray-600 rounded px-2 py-2 w-full"
            />
          </div>

          <div className="mt-4 bg-gray-800 p-3 rounded border border-gray-700">
            <div className="flex justify-between">
              <span>Total</span>
              <span>₹{Math.round(total).toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-green-400 font-bold mt-2">
              <span>Final</span>
              <span>₹{Math.round(final).toLocaleString()}</span>
            </div>
          </div>

          {dirty && (
            <div className="text-yellow-400 text-xs mt-2 text-center">
              Unsaved changes ⚠️
            </div>
          )}
        </>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 px-4 py-2 rounded shadow text-sm">
          {toast}
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur border-t border-gray-800 p-3">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-2">

          <button
            onClick={saveData}
            className="bg-blue-600 py-3 rounded-xl"
          >
            Save
          </button>

          <button
            onClick={() => router.push("/history")}
            className="bg-gray-700 py-3 rounded-xl"
          >
            Back
          </button>

        </div>
      </div>
    </div>
  );
}