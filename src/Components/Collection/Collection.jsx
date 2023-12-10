import { TatumSDK, Network } from "@tatumio/tatum";
import fetch from "node-fetch";
import { useState, useEffect } from "react";

export default function Collection({ state }) {
  const [nftArray, setNftArray] = useState([]);

  useEffect(()=>{
    app()
  },[])

  const app = async () => {
    try {
      const { web3 } = state;
      const accounts = await web3.eth.getAccounts();
      const tatum = await TatumSDK.init({ network: Network.POLYGON_MUMBAI });
      const balance = await tatum.nft.getBalance({
        addresses: [accounts[0]],
      });
      console.log(balance.data);
      const Data = balance.data;

      // Use Promise.all to wait for all fetch requests to complete
      const nftArrayPromises = Data.map(async (item, index) => {
        if (
          item.tokenAddress === "0x07e4b73169fe42e93a62a49b21594f8a0f378b57"
        ) {
          console.log("Index", index, "IPFS", item.metadataURI);
          try {
            const response = await fetch(item.metadataURI);
            const data = await response.json();
            console.log("Data :", data);
            data.id = item.tokenId;
            data.address = shortenEthereumAddress(item.tokenAddress);
            console.log("Update : ", data);
            return data;
          } catch (error) {
            console.error("Error fetching IPFS data:", error);
            return null; // or handle the error as needed
          }
        }
        return null;
      });

      const updatedNftArray = await Promise.all(nftArrayPromises);
      setNftArray(updatedNftArray.filter(Boolean));
    } catch (error) {
      console.error("Error fetching NFT balance:", error);
    }
  };

  function shortenEthereumAddress(address) {
    const prefix = address.substring(0, 6);
    const suffix = address.substring(address.length - 6);
    return `${prefix}***${suffix}`;
  }

  return (
    <>
    <section
        class="text-gray-400 bg-gray-900 body-font"
        style={{ minHeight: "90vh" }}
      >
        <div class="container px-5 py-24 mx-auto">
          <div class="flex flex-wrap -m-4">
          {nftArray.map((item, index) => (
            <div class="mx-auto mt-11 w-80 transform overflow-hidden rounded-lg bg-white dark:bg-slate-800 shadow-md duration-300 hover:scale-105 hover:shadow-lg" key={index}>
            <img class="h-48 w-full object-cover object-center" src={item.image} alt="Product Image" />
            <div class="p-4">
              <h2 class="mb-2 text-lg font-medium dark:text-white text-gray-900">{item.name} <span style={{ fontSize: "xx-large" }}>#{item.id}</span></h2>
              <p class="mb-2 text-base dark:text-gray-300 text-gray-700">{item.description}</p>
            </div>
          </div>

            // <div class="p-4 md:w-1/3" key={index}>
            //   <div class="h-full border-2 border-gray-800 rounded-lg overflow-hidden">
            //     <img
            //       class="lg:h-48 md:h-36 w-full object-cover object-center"
            //       src={ item.image }
            //       alt="blog"
            //     />
            //     <div class="p-6">
            //       <h1 class="title-font text-lg font-medium text-white mb-3">
            //       { item.name } #{ item.id }
            //       </h1>
            //       <p class="leading-relaxed mb-3">
            //       { item.description }
            //       </p>
            //     </div>
            //   </div>
            // </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}