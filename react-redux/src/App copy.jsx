import React, { useEffect, useState } from "react";

import { getSwiper } from "./utils/request";

function App() {
  const [state, setState] = useState([]);
  useEffect(async () => {
    const res = await getSwiper();
    console.log("🚀 ~ file: App.jsx ~ line 9 ~ useEffect ~ res", res);
    setState([...res]);
  }, []);

  return (
    <div className="App">
      {state.map((item, index) => {
        return <div key={index}>{item.name}</div>;
      })}
    </div>
  );
}

export default App;
