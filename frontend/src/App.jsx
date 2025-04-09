import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar"
import Home from "./pages/Home";
import Send from "./pages/Send";
import History from "./pages/History";
import Balance from "./pages/Balance";
import Crypto from "./pages/Crypto";
import NFTMarketplace from "./components/NFTMarketplace";
import News from "./pages/News";
import { WalletProvider } from "./context/WalletContext";
import "./App.css";

export default function App() {
  return (
    <WalletProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/send" element={<Send />} />
          <Route path="/history" element={<History />} />
          <Route path="/balance" element={<Balance />} />
          <Route path="/crypto" element={<Crypto />} />
          <Route path="/nft-marketplace" element={<NFTMarketplace />} />
          <Route path="/news" element={<News />} />
        </Routes>
      </Router>
    </WalletProvider>
  );
}
