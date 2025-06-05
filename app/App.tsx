import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const [instruments, setInstruments] = useState([]);

  useEffect(() => {
    getInstruments();
  }, []);

async function getInstruments() {
  const { data, error } = await supabase
    .from("tbl_simpe_test")
    .select("get_gud, gg, created_at");
    
    if (error) {
    console.log(data)
    console.error("Supabase fetch error:", error.message);
  } else {
    console.log("Fetched instruments:", data);
    setInstruments(data); 
    console.log(data)

  }
}
  return (
    <ul>
      {instruments.length === 0 && <li>No data</li>}
      {instruments.map((instrument, index) => (
        <li key={index}>
          {instrument.get_gud} - {instrument.created_at} - {instrument.gg}
        </li>
      ))}
    </ul>
  );
}

export default App;
