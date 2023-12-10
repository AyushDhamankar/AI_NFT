import { useState } from "react";
import axios from "axios";
import { Buffer } from "buffer";
import img from "../assets/loader.svg";

// Components
// import ReactLoading from "react-loading";

function Mint({ state }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState(null);
  const [wait, setWait] = useState(true);
  const [id, setId] = useState("");
  const [data, setData] = useState("");

  const submitHandler = async (e) => {
    console.log("Hii");
    console.log(state);
    e.preventDefault();

    // Call AI API to generate a image based on description
    await createImage();
  };

  function randomlyChangeCase(inputString) {
    return inputString
      .split("")
      .map((char) => {
        // Use Math.random() to decide whether to change the case
        const shouldChangeCase = Math.random() < 0.5;

        // Change the case if the condition is met
        return shouldChangeCase ? char.toUpperCase() : char.toLowerCase();
      })
      .join("");
  }

  const createImage = async () => {
    setWait(false);

    // You can replace this with different model API's
    const URL = process.env.REACT_APP_Hugging_Face_API;

    const text = randomlyChangeCase(desc);

    // Send the request
    const response = await axios({
      url: URL,
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_Hugging_Face_Token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        inputs: text,
        options: { wait_for_model: true },
      }),
      responseType: "arraybuffer",
    });

    const type = response.headers["content-type"];
    const data = response.data;
    setData(data);

    const base64data = Buffer.from(data).toString("base64");
    const img = `data:${type};base64,` + base64data; // <-- This is so we can render it on the page
    setImage(img);

    setWait(true);
  };

  const uploadToPinata = async () => {
    if (data) {
      // Convert ArrayBuffer to Blob
      const blob = new Blob([new Uint8Array(data)], { type: "image/jpeg" });

      // Create FormData and append the image file
      const formData = new FormData();
      formData.append("file", blob, "image.jpg");

      // Make a POST request to Pinata's pinFileToIPFS endpoint
      const response1 = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: process.env.REACT_APP_Pinata_API_Key,
            pinata_secret_api_key:
              process.env.REACT_APP_Pinata_Secret_API_Key,
          },
        }
      );

      console.log("IPFS Response:", response1.data.IpfsHash);
      const imgUrl = `https://ipfs.io/ipfs/${response1.data.IpfsHash}`;

      await uploadImage(imgUrl);
    } else {
      console.log("Error uploadtopinata");
    }
  };

  const uploadImage = async (imageData) => {
    console.log("Uploading Image...");

    try {
      const jsonData = {
        name: name,
        description: desc,
        image: imageData,
      };

      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        jsonData,
        {
          headers: {
            "Content-Type": "application/json",
            pinata_api_key: process.env.REACT_APP_Pinata_API_Key,
            pinata_secret_api_key:
             process.env.REACT_APP_Pinata_Secret_API_Key,
          },
        }
      );
      console.log("IPFS Response:", response.data.IpfsHash);
      const url = `https://ipfs.io/ipfs/${response.data.IpfsHash}`;
      await mintImage(url);
    } catch (error) {
      console.error(
        "Error uploading JSON to Pinata:",
        error.message,
        error.response?.data
      );
    }
  };

  const mintImage = async (tokenURI) => {
    console.log(tokenURI);
    console.log("Waiting for Mint...");

    const { contract, web3 } = state;
    const accounts = await web3.eth.getAccounts();
    const num = await contract.methods
      .awardItem(accounts[0], tokenURI)
      .send({ from: accounts[0] });

    const newItemId = num.events.Transfer.returnValues[2];
    console.log("New Item ID:", newItemId);
    setId(newItemId);
    console.log("NFT Minted...", num);
    setModalVisible(!isModalVisible);
  };

  //
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  //

  return (
    <>
      <section
        class="text-gray-400 bg-gray-900 body-font relative"
        style={{ minHeight: "90vh", display: "flex" }}
      >
        <div class="container px-5 py-24 mx-auto flex sm:flex-nowrap flex-wrap">
          <div
            class="lg:w-2/3 md:w-1/2 bg-gray-900 rounded-lg overflow-hidden sm:mr-10 p-10 flex items-end justify-start relative"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {wait === true ? (
              <img
                class="object-cover object-center rounded"
                alt="hero"
                height= "50vh"
                src={image === null ? "https://dummyimage.com/720x600" : image}
              />
            ) : (
              <>
                <img src={img} alt="image" height= "50vh" />
              </>
            )}
          </div>
          <div class="lg:w-1/3 md:w-1/2 flex flex-col md:ml-auto w-full md:py-8 mt-8 md:mt-0" style={{ justifyContent: "center" }}>
            <h2 class="text-white text-lg mb-1 font-medium title-font">
              Mint Your Own AI Powered NFT
            </h2>
            <p class="leading-relaxed mb-5">
            Unlock the potential of your imagination with CryptoCanvas, where art meets artificial intelligence to create unique and captivating NFTs.
            </p>
            <div class="relative mb-4">
              <label for="name" class="leading-7 text-sm text-gray-400">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                class="w-full bg-gray-800 rounded border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900 text-base outline-none text-gray-100 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </div>
            <div class="relative mb-4">
              <label for="email" class="leading-7 text-sm text-gray-400">
                Description of Image
              </label>
              <input
                type="text"
                id="email"
                name="email"
                class="w-full bg-gray-800 rounded border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900 text-base outline-none text-gray-100 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                onChange={(e) => {
                  setDesc(e.target.value);
                }}
              />
            </div>
            <button
              class="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
              onClick={(e) => {
                submitHandler(e);
              }}
            >
              Generate
            </button>

            <button
              class="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
              style={{ marginTop: "10px" }}
              onClick={uploadToPinata}
            >
              Mint NFT
            </button>

            <div>
              {isModalVisible && (
                <div className="fixed z-10 overflow-y-auto top-0 w-full left-0">
                  <div className="flex items-center justify-center min-height-100vh pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity">
                      <div className="absolute inset-0 bg-gray-900 opacity-75" />
                    </div>
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
                      &#8203;
                    </span>
                    <div className="inline-block align-center bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <label className="font-medium text-gray-800">
                          NFT Contract Address
                        </label>
                        <input
                          type="text"
                          className="w-full outline-none rounded bg-gray-100 p-2 mt-2 mb-3"
                          value="0x07e4B73169fe42e93A62a49B21594F8A0f378b57"
                        />
                        <label className="font-medium text-gray-800">
                          NFT ID
                        </label>
                        <input
                          type="text"
                          className="w-full outline-none rounded bg-gray-100 p-2 mt-2 mb-3"
                          value={id}
                        />
                      </div>
                      <div className="bg-gray-200 px-4 py-3 text-right">
                        <button
                          type="button"
                          className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-700 mr-2"
                          onClick={toggleModal}
                        >
                          <i className="fas fa-times"></i> Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Mint;
