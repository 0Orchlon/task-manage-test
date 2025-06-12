import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const [instruments, setInstruments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getInstruments();

  }, []);

  async function getInstruments() {
    const { data, error } = await supabase
      .from("tbl_simpe_test")
      .select("get_gud, gg, created_at");

    if (error) {
      setError(error.message);
      setInstruments([]);
    } else {
      setError(null);
      setInstruments(data || []);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Instruments
        </h2>
        {error && (
          <p className="mb-4 text-red-500 text-center">{error}</p>
        )}
        <ul className="divide-y divide-gray-200">
          {instruments.length === 0 && !error && (
            <li className="py-2 text-center text-gray-500">No data</li>
          )}
          {instruments.map((instrument, index) => (
            <li key={index} className="py-2">
              <span className="font-semibold">{instrument.get_gud}</span> -{" "}
              <span className="text-gray-500">{instrument.created_at}</span> -{" "}
              <span>{instrument.gg}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
