import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowRight } from "lucide-react";

interface WalletOption {
  name: string;
  icon: string;
}

interface WalletConnectProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletData: any) => void;
}

const WalletConnect = ({ isOpen, onClose, onConnect }: WalletConnectProps) => {
  const [connecting, setConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  
  const walletOptions: WalletOption[] = [
    { name: "MetaMask", icon: "🦊" },
    { name: "Coinbase Wallet", icon: "🔵" },
    { name: "WalletConnect", icon: "🔗" },
    { name: "Trust Wallet", icon: "🛡️" }
  ];
  
  const connectWallet = async (walletName: string) => {
    setSelectedWallet(walletName);
    setConnecting(true);
    
    try {
      if (walletName === "MetaMask") {
        // Check if MetaMask is installed
        if (window.ethereum && window.ethereum.isMetaMask) {
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const address = accounts[0];
          
          // Get chain ID
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const decimalChainId = parseInt(chainId, 16);
          
          // Get balance
          const balanceHex = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [address, 'latest']
          });
          const balance = parseInt(balanceHex, 16) / 1e18; // Convert wei to ETH
          
          const walletData = {
            address: address,
            chainId: decimalChainId,
            balance: balance.toFixed(4) + " ETH",
            provider: walletName
          };
          
          onConnect(walletData);
          onClose();
        } else {
          alert("MetaMask not detected! Please install MetaMask to continue.");
        }
      } else {
        // For other wallets - would implement specific connection logic for each
        alert(`${walletName} integration coming soon!`);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    } finally {
      setConnecting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md glass border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-silver-bright">Connect Your Wallet</DialogTitle>
          <DialogDescription className="text-silver">
            Connect your wallet to start using NeuroTrader and access your personalized analytics.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {walletOptions.map((wallet) => (
            <Button
              key={wallet.name}
              variant="outline"
              className="flex justify-between items-center h-16 px-4 hover:bg-primary/10 border border-primary/20"
              disabled={connecting}
              onClick={() => connectWallet(wallet.name)}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{wallet.icon}</div>
                <span className="text-silver-bright font-medium">{wallet.name}</span>
              </div>
              {connecting && selectedWallet === wallet.name ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
              ) : (
                <ArrowRight className="h-4 w-4 text-primary" />
              )}
            </Button>
          ))}
        </div>
        
        <DialogFooter className="flex justify-center sm:justify-center">
          <Button variant="ghost" onClick={onClose} disabled={connecting}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnect;
