import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { WalletProvider } from "./context/WalletContext";
import Home from "./pages/Home";
import Balance from "./pages/Balance";
import "./App.css";

export default function App() {
  return (
    <WalletProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/balance" element={<Balance />} />

        </Routes>
      </Router>
    </WalletProvider>
  );
}
