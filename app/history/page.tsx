"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Entry = {
  id: number;
  date: string;
  total: number;
  final: number;
  commission?: number;
};

export default function History() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const router = useRouter();

  // FETCH ONCE
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .order("id", { ascending: false });

    if (!error) setEntries(data || []);

    setLoading(false);
  };

  // OPTIMISTIC DELETE
  const deleteEntry = async (id: number) => {
    // instant UI update
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setToast("Deleted ✅");

    try {
      await supabase.from("items").delete().eq("entry_id", id);
      await supabase.from("entries").delete().eq("id", id);
    } catch {
      setToast("Delete failed ❌");
      fetchData();
    }

    setTimeout(() => setToast(""), 2000);
  };

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">

      {/* HEADER */}
      <h1 className="text-xl font-bold mb-4 text-center">
        📜 History
      </h1>

      {loading && (
        <div className="text-center text-gray-400 mt-10">
          Loading...
        </div>
      )}

      {!loading && entries.length === 0 && (
        <p className="text-gray-500 text-center mt-10">
          No records found
        </p>
      )}

      {entries.map((e) => {
        const commissionPercent = e.commission || 10;
        const commissionValue =
          (e.total * commissionPercent) / 100;

        return (
          <div
            key={e.id}
            className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 p-4 mb-4 rounded-2xl shadow hover:shadow-lg transition"
          >

            {/* CLICKABLE AREA */}
            <div
              onClick={() => router.push(`/history/${e.id}`)}
              className="cursor-pointer"
            >

              <div className="flex justify-between items-center mb-2">
                <div className="text-xs text-gray-400">
                  {new Date(e.date).toLocaleString()}
                </div>

                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    deleteEntry(e.id);
                  }}
                  className="text-gray-400 hover:text-red-500 text-lg"
                >
                  🗑️
                </button>
              </div>

              <div className="flex justify-between text-sm">
                <span>Total</span>
                <span>₹{Math.round(e.total).toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-sm text-red-400 mt-1">
                <span>Commission ({commissionPercent}%)</span>
                <span>-₹{Math.round(commissionValue).toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-green-400 font-bold mt-2">
                <span>Final</span>
                <span>₹{Math.round(e.final).toLocaleString()}</span>
              </div>

            </div>
          </div>
        );
      })}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 px-4 py-2 rounded shadow text-sm">
          {toast}
        </div>
      )}
    </div>
  );
}