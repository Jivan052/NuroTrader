import { createRoot } from 'react-dom/client'
import { ThirdwebProvider } from "@thirdweb-dev/react";
import App from './App.tsx'
import './index.css'

// Define the chains you want to support
// Ethereum, Polygon, etc.
const activeChain = "ethereum";

createRoot(document.getElementById("root")!).render(
  <ThirdwebProvider activeChain={activeChain}>
    <App />
  </ThirdwebProvider>
);
