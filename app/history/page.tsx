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
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .order("id", { ascending: false });

    if (!error) setEntries(data || []);
  };

  const deleteEntry = async (id: number) => {
    const confirmDelete = confirm("Delete this entry?");
    if (!confirmDelete) return;

    await supabase.from("items").delete().eq("entry_id", id);
    await supabase.from("entries").delete().eq("id", id);

    fetchData();
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">📜 History</h1>

      {entries.length === 0 && (
        <p className="text-gray-500">No records found</p>
      )}

      {entries.map((e) => {
        const commissionPercent = e.commission || 10;
        const commissionValue =
          (e.total * commissionPercent) / 100;

        return (
          <div
            key={e.id}
            className="bg-gray-900 border border-gray-700 p-4 mb-4 rounded-xl"
          >
            <div
              onClick={() => router.push(`/history/${e.id}`)}
              className="cursor-pointer"
            >
              <div className="flex justify-between mb-2">
                <div className="text-sm text-gray-400">
                  {new Date(e.date).toLocaleString()}
                </div>

                <button
                  onClick={(e2) => {
                    e2.stopPropagation();
                    deleteEntry(e.id);
                  }}
                >
                  🗑️
                </button>
              </div>

              <div className="flex justify-between">
                <span>Total</span>
                <span>₹{Math.round(e.total)}</span>
              </div>

              <div className="flex justify-between text-red-400">
                <span>Commission ({commissionPercent}%)</span>
                <span>-₹{Math.round(commissionValue)}</span>
              </div>

              <div className="flex justify-between text-green-400 font-bold">
                <span>Final</span>
                <span>₹{Math.round(e.final)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}