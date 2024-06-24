import "./App.css";
import { useEffect } from "react";
import InitScene from "./Components/InitScene";
import MarkerScene from "./Components/MarkerScene";

function App() {
  useEffect(() => {}, []);

  return (
    <div className="App">
      {/* <InitScene/> */}
      {/* <VRScene></VRScene> */}
      <MarkerScene />
    </div>
  );
}

export default App;
