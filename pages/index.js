import { useState, useEffect } from "react";
import { ethers } from "ethers";
import subscription_abi from "../artifacts/contracts/Assessment.sol/MysteryBoxSubscription.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [subscriptionService, setSubscriptionService] = useState(undefined);
  const [name, setName] = useState("");
  const [subscriptionSize, setSubscriptionSize] = useState("Small");
  const [subscriptionCost, setSubscriptionCost] = useState(0.01);
  const [userAddress, setUserAddress] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const subscriptionABI = subscription_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    getSubscriptionServiceContract();
  };

  const getSubscriptionServiceContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const subscriptionContract = new ethers.Contract(contractAddress, subscriptionABI, signer);

    setSubscriptionService(subscriptionContract);
  };

  const subscribe = async () => {
    if (subscriptionService && name && userAddress) {
      const subscriptionSizeIndex =
        subscriptionSize === "Small"
          ? 0
          : subscriptionSize === "Medium"
          ? 1
          : subscriptionSize === "Large"
          ? 2
          : 3;
      const subscriptionValue = ethers.utils.parseEther(subscriptionCost.toString());

      try {
        let overrides = {
          value: subscriptionValue,
          gasLimit: ethers.BigNumber.from("3000000"), // Adjust the gas limit as needed
        };

        let tx = await subscriptionService.subscribe(name, subscriptionSizeIndex, overrides);
        await tx.wait();

        alert(`Subscribed to ${subscriptionSize} plan successfully!`);
      } catch (error) {
        console.error("Subscription error:", error);
        alert("Error subscribing. Check console for more info.");
      }
    } else {
      alert("Please fill in your name and address, or connect your ETH wallet.");
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p className="message">Please install MetaMask to use this service.</p>;
    }

    if (!account) {
      return <button className="btn" onClick={connectAccount}>Connect MetaMask Wallet</button>;
    }

    return (
      <div className="form-container">
        <p className="account-info">Your Account: {account}</p>
        <div className="input-group">
          <label>
            Name:
            <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
        </div>
        <div className="input-group">
          <label>
            Address:
            <input className="input" type="text" value={userAddress} onChange={(e) => setUserAddress(e.target.value)} />
          </label>
        </div>
        <div className="subscription-options">
          <label>
            <input
              type="radio"
              value="Small"
              checked={subscriptionSize === "Small"}
              onChange={() => {
                setSubscriptionSize("Small");
                setSubscriptionCost(0.01);
              }}
            />
            Small (0.01 ETH)
          </label>
          <label>
            <input
              type="radio"
              value="Medium"
              checked={subscriptionSize === "Medium"}
              onChange={() => {
                setSubscriptionSize("Medium");
                setSubscriptionCost(0.03);
              }}
            />
            Medium (0.03 ETH)
          </label>
          <label>
            <input
              type="radio"
              value="Large"
              checked={subscriptionSize === "Large"}
              onChange={() => {
                setSubscriptionSize("Large");
                setSubscriptionCost(0.05);
              }}
            />
            Large (0.05 ETH)
          </label>
          <label>
            <input
              type="radio"
              value="ExtraLarge"
              checked={subscriptionSize === "ExtraLarge"}
              onChange={() => {
                setSubscriptionSize("ExtraLarge");
                setSubscriptionCost(1);
              }}
            />
            Extra Large (1 ETH)
          </label>
        </div>
        <button className="btn" onClick={subscribe}>Subscribe</button>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h2>Welcome to MysteryBox Subscription!</h2>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #fbc2eb, #a6c0fe);
          color: #333;
          font-family: Tahoma, Arial, sans-serif;
          text-align: center;
        }
        header {
          margin-bottom: 10px;
          text-align: center;
          border: 5px solid white;
          padding: 20px;
          border-radius: 30px;
        }
        .form-container {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
        }
        .input-group {
          text-align: center;
          margin-bottom: 15px;
        }
        .input-group label {
          text-align: center;
          flex-direction: column;
        }
        .input {
          margin-top: 5px;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .subscription-options {
          margin-bottom: 20px;
        }
        .subscription-options label {
          display: flex;
          margin-bottom: 10px;
        }
        .btn {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }
        .btn:hover {
          background-color: #0056b3;
        }
        .account-info {
          margin-bottom: 20px;
          font-weight: bold;
        }
        .message {
          color: #ff0000;
        }
      `}</style>
    </main>
  );
}
