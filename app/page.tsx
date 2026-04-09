"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Row = {
  kgs: string;
  price: string;
  amount: number;
};

export default function Home() {
  const router = useRouter();
  const rows = 15;

  const generateRows = () =>
    Array.from({ length: rows }, () => ({
      kgs: "",
      price: "",
      amount: 0,
    }));

  const [data, setData] = useState<Row[]>(generateRows());
  const [commissionPercent, setCommissionPercent] = useState(10);

  const [toast, setToast] = useState("");
  const [dirty, setDirty] = useState(false);

  // LOAD DRAFT
  useEffect(() => {
    const saved = localStorage.getItem("flower_draft");
    if (saved) setData(JSON.parse(saved));
  }, []);

  // SAVE LOCAL
  useEffect(() => {
    localStorage.setItem("flower_draft", JSON.stringify(data));
  }, [data]);

  const { updatedData, total, finalTotal } = useMemo(() => {
    let total = 0;

    const updated = data.map((row) => {
      const kgs = parseFloat(row.kgs) || 0;
      const price = parseFloat(row.price) || 0;
      const amount = kgs > 0 && price > 0 ? kgs * price : 0;

      total += amount;

      return { ...row, amount };
    });

    const final = total - total * (commissionPercent / 100);

    return { updatedData: updated, total, finalTotal: final };
  }, [data, commissionPercent]);

  // INPUT CHANGE
  const handleChange = (
    index: number,
    field: "kgs" | "price",
    value: string
  ) => {
    const updated = [...data];
    updated[index][field] = value;

    setData(updated);
    setDirty(true);
  };

  // RESET
  const reset = () => {
    setData(generateRows());
    setDirty(false);
    setToast("Reset done");
    setTimeout(() => setToast(""), 2000);
  };

  // SAVE
  const saveData = async () => {
    const hasData = data.some(
      (r) => parseFloat(r.kgs) > 0 || parseFloat(r.price) > 0
    );

    if (!hasData) {
      setToast("Enter data first ❌");
      setTimeout(() => setToast(""), 2000);
      return;
    }

    try {
      const { data: entry, error } = await supabase
        .from("entries")
        .insert([
          {
            total,
            final: finalTotal,
            commission: commissionPercent,
            cycle_days: data.length,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const items = updatedData.map((row, i) => ({
        entry_id: entry.id,
        day: i + 1,
        kgs: parseFloat(row.kgs) || 0,
        price: parseFloat(row.price) || 0,
        amount: row.amount,
      }));

      await supabase.from("items").insert(items);

      setToast("Saved successfully ✅");
      setDirty(false);
      localStorage.removeItem("flower_draft");

    } catch (err) {
      setToast("Save failed ❌");
    }

    setTimeout(() => setToast(""), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 pb-28">
      <div className="max-w-md mx-auto">

        <h1 className="text-2xl font-bold text-center mb-6">
          🌸 Flower Calculator
        </h1>

        {updatedData.map((row, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 py-2 border-b border-gray-800">
            <span className="text-gray-400 text-sm">
              D{String(i + 1).padStart(2, "0")}
            </span>

            <input
              value={row.kgs}
              onChange={(e) => handleChange(i, "kgs", e.target.value)}
              className="bg-gray-900 px-2 rounded"
              placeholder="Kgs"
            />

            <input
              value={row.price}
              onChange={(e) => handleChange(i, "price", e.target.value)}
              className="bg-gray-900 px-2 rounded"
              placeholder="Price"
            />

            <span className="text-right">
              {row.amount > 0
                ? ₹${row.amount.toLocaleString()}
                : "—"}
            </span>
          </div>
        ))}

        <div className="mt-4">
          <input
            type="number"
            value={commissionPercent}
            onChange={(e) =>
              setCommissionPercent(parseFloat(e.target.value) || 0)
            }
            className="w-full bg-gray-900 px-2 py-2 rounded"
          />
        </div>

        {/* TOTAL */}
        <div className="mt-4 text-sm">
          <div>Total: ₹{Math.round(total).toLocaleString()}</div>
          <div className="text-green-400 font-bold">
            Final: ₹{Math.round(finalTotal).toLocaleString()}
          </div>
        </div>

        {dirty && (
          <div className="text-yellow-400 text-xs mt-2">
            Unsaved changes ⚠️
          </div>
        )}

      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 px-4 py-2 rounded shadow-lg text-sm">
          {toast}
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur border-t border-gray-800 p-3">
        <div className="max-w-md mx-auto grid grid-cols-3 gap-2">

          <button onClick={saveData} className="bg-blue-600 py-3 rounded-xl">
            Save
          </button>

          <button onClick={reset} className="bg-gray-700 py-3 rounded-xl">
            Reset
          </button>

          <button
            onClick={() => router.push("/history")}
            className="bg-green-600 py-3 rounded-xl"
          >
            History
          </button>

        </div>
      </div>
    </div>
  );
}