import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ABI from "./ABI.json";
import Web3 from "web3";
function Navbar({ saveState }) {
  const [connected, setConnected] = useState(true);
  useEffect(() => {
    init();
  }, []);
  const init = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const contract = new web3.eth.Contract(
        ABI,
        "0x07e4B73169fe42e93A62a49B21594F8A0f378b57"
      );
      saveState({ web3: web3, contract: contract }, accounts[0]);
      const shortenedAddress = shortenEthereumAddress(accounts[0]);
      console.log(shortenedAddress);
      setConnected(shortenedAddress);
      console.log(contract);
    } catch (err) {
      console.log(err);
    }
  };

  function shortenEthereumAddress(address) {
    const prefix = address.substring(0, 6);
    const suffix = address.substring(address.length - 3);
    return `${prefix}...${suffix}`;
  }

  const styles = {
    minHeight: "10vh",
  };
  return (
    <>
      <header class="text-gray-400 bg-gray-900 body-font" style={styles}>
        <div class="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
          <Link
            to="/"
            class="flex title-font font-medium items-center text-white mb-4 md:mb-0"
          >
            <span class="ml-3 text-xl">CryptoCanvas</span>
          </Link>
          <nav class="md:ml-auto flex flex-wrap items-center text-base justify-center">
            <Link to="/mint" class="mr-5 hover:text-white">
              Mint
            </Link>
            <Link to="/collection" class="mr-5 hover:text-white">
              Collection
            </Link>
          </nav>
          <button class="inline-flex items-center bg-gray-800 border-0 py-1 px-3 focus:outline-none hover:bg-gray-700 rounded text-base mt-4 md:mt-0" style={{ backgroundColor: "#6366f1", color: "white" }}>
            { connected }
          </button>
        </div>
      </header>
    </>
  );
}

export default Navbar;
