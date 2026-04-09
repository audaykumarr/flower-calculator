"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Row = {
  kgs: string;
  price: string;
  amount: number;
};

export default function Home() {
  const rows = 15;
  const router = useRouter();
  const [commissionPercent, setCommissionPercent] = useState(10);

  const [data, setData] = useState<Row[]>(
    Array.from({ length: rows }, () => ({
      kgs: "",
      price: "",
      amount: 0,
    }))
  );

  const [total, setTotal] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  // Load draft
  useEffect(() => {
    const saved = localStorage.getItem("flower_draft");

    if (saved) {
      const parsed = JSON.parse(saved);
      setData(parsed);

      const result = calculate(parsed);
      setTotal(result.total);
      setFinalTotal(result.finalTotal);
    }
  }, []);

  // Auto save
  useEffect(() => {
    localStorage.setItem("flower_draft", JSON.stringify(data));
  }, [data]);

  const calculate = (updatedData: Row[]) => {
    let total = 0;

    const newData = updatedData.map((row) => {
      const kgs = parseFloat(row.kgs) || 0;
      const price = parseFloat(row.price) || 0;
      const amount = kgs > 0 && price > 0 ? kgs * price : 0;

      total += amount;

      return { ...row, amount };
    });

    const commission = total * (commissionPercent / 100);
    const finalTotal = total - commission;

    return { newData, total, finalTotal };
  };

  const handleChange = (
      index: number,
      field: "kgs" | "price",
      value: string
    ) => {
    const updated = [...data];
    updated[index][field] = value;

    const result = calculate(updated);

    setData(result.newData);
    setTotal(result.total);
    setFinalTotal(result.finalTotal);
  };

  const reset = () => {
    setData(
      Array.from({ length: rows }, () => ({
        kgs: "",
        price: "",
        amount: 0,
      }))
    );
    setTotal(0);
    setFinalTotal(0);
  };

  const saveData = async () => {
    const hasData = data.some(
      (row) => parseFloat(row.kgs) > 0 || parseFloat(row.price) > 0
    );

    if (!hasData) {
      alert("Please enter at least one entry ❌");
      return;
    }

    try {
      // 1. Insert entry
      const { data: entry, error: entryError } = await supabase
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

      if (entryError) throw entryError;

      // 2. Insert items
      const itemsToInsert = data.map((row, index) => ({
        entry_id: entry.id,
        day: index + 1,
        kgs: parseFloat(row.kgs) || 0,
        price: parseFloat(row.price) || 0,
        amount: row.amount,
      }));

      const { error: itemsError } = await supabase
        .from("items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      alert("Saved successfully ✅");
      localStorage.removeItem("flower_draft");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error saving ❌");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">
      <div className="max-w-md mx-auto">

        {/* HEADER */}
        <h1 className="text-2xl font-bold text-center mb-6">
          🌸 Flower Calculator
        </h1>

        {/* ROWS (LIKE ENTRY PAGE) */}
        <div>
          {data.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-4 gap-2 py-2 border-b border-gray-800 items-center"
            >
              <span className="text-gray-400 text-sm">
                D{String(i + 1).padStart(2, "0")}
              </span>

              <input
                type="number"
                placeholder="Kgs"
                value={row.kgs}
                onChange={(e) => handleChange(i, "kgs", e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
              />

              <input
                type="number"
                placeholder="Price"
                value={row.price}
                onChange={(e) => handleChange(i, "price", e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
              />

              <span className="text-right font-semibold">
                {row.amount > 0
                  ? `₹${row.amount.toLocaleString()}`
                  : <span className="text-gray-500">Pending</span>}
              </span>
            </div>
          ))}
        </div>

        {/* COMMISSION */}
        <div className="mt-4">
          <label className="text-sm text-gray-400">
            Commission %
          </label>

          <input
            type="number"
            value={commissionPercent}
            onChange={(e) =>
              setCommissionPercent(parseFloat(e.target.value) || 0)
            }
            className="w-full mt-1 bg-gray-900 border border-gray-700 rounded px-2 py-2"
          />
        </div>

        {/* TOTAL */}
        <div className="mt-4 border-t border-gray-700 pt-3">
          <div className="flex justify-between text-gray-300">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-red-400 mt-1">
            <span>Commission ({commissionPercent}%)</span>
            <span>
              -₹{Math.round(total * (commissionPercent / 100)).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between text-green-400 font-bold text-lg mt-2">
            <span>Final</span>
            <span>₹{Math.round(finalTotal).toLocaleString()}</span>
          </div>
        </div>

        {deferredPrompt && (
          <button
            onClick={() => {
              deferredPrompt.prompt();
              setDeferredPrompt(null);
            }}
            className="w-full mt-4 bg-yellow-500 text-black py-2 rounded font-medium"
          >
            📲 Install Flower Calculator 🌸
          </button>
        )}

        {/* BUTTONS */}
        <div className="grid grid-cols-3 gap-2 mt-5">
          <button
            onClick={saveData}
            className="bg-blue-600 py-2 rounded"
          >
            Save
          </button>

          <button
            onClick={reset}
            className="bg-gray-700 py-2 rounded"
          >
            Reset
          </button>

          <button
            onClick={() => router.push("/history")}
            className="bg-green-600 py-2 rounded"
          >
            History
          </button>
        </div>

      </div>
    </div>
  );
}