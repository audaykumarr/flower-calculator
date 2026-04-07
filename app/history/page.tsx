"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

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
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/entries`);
      setEntries(res.data);
    } catch (err) {
      console.error(err);
    }
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
            className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 p-4 mb-4 rounded-2xl shadow-md hover:shadow-xl transition"
          >

            {/* CLICKABLE CONTENT */}
            <div
              onClick={() => router.push(`/history/${e.id}`)}
              className="cursor-pointer"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-400 pr-2">
                  {new Date(e.date).toLocaleString()}
                </div>

                <button
                  onClick={(event) => {
                    event.stopPropagation();

                    const confirmDelete = confirm("Delete this entry?");
                    if (!confirmDelete) return;

                    axios
                      .delete(`${process.env.NEXT_PUBLIC_API_URL}/entries/${e.id}`)
                      .then(() => fetchData())
                      .catch(() => alert("Delete failed ❌"));
                  }}
                  className="text-gray-400 hover:text-red-500 text-lg"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>

              <div className="mt-2 text-sm text-gray-300 flex justify-between">
                <span>Total</span>
                <span className="font-semibold">
                  ₹{Math.round(e.total).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="text-gray-400">
                  Commission ({commissionPercent}%)
                </span>
                <span className="text-red-400 font-medium">
                  -₹{Math.round(commissionValue).toLocaleString()}
                </span>
              </div>

              <div className="border-t border-gray-700 my-2"></div>

              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-300 font-medium">Final</span>
                <span className="text-green-400 font-bold text-lg">
                  ₹{Math.round(e.final).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}