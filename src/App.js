import { useState } from "react";
import Navbar from "./Components/Navbar/Navbar";
import Hero from "./Components/Hero/Hero";
import Mint from "./Components/Mint/Mint";
import Collection from "./Components/Collection/Collection";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  const [state, setState] = useState({
    web3: null,
    contract: null,
  });

  const saveState = (state) => {
    console.log(state);
    setState(state);
  };
  return (
    <>
      <Router>
        <Navbar saveState={saveState}></Navbar>
        <Routes>
          <Route exact path="/" element={<Hero />}></Route>
          <Route exact path="/mint" element={<Mint state={state} />}></Route>
          <Route exact path="/collection" element={<Collection state={state} />}></Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
