import { useState } from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WalletData {
  address: string;
  balance: string;
  provider: string;
  chainId: number;
}

interface WalletInfoProps {
  walletData: WalletData;
  onDisconnect: () => void;
}

export default function WalletInfo({ walletData, onDisconnect }: WalletInfoProps) {
  const chainNames: Record<number, string> = {
    1: "Ethereum",
    56: "BSC",
    137: "Polygon",
    43114: "Avalanche"
  };

  const chainName = chainNames[walletData.chainId] || "Unknown Chain";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border border-primary/20 glass">
          <Wallet className="mr-2 h-4 w-4 text-primary" />
          <span className="text-silver-bright">{walletData.address}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 glass border-primary/20">
        <DropdownMenuLabel>Wallet Info</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-2 text-sm">
          <div className="mb-2">
            <span className="text-muted-foreground">Connected with:</span>
            <p className="font-medium text-silver-bright">{walletData.provider}</p>
          </div>
          <div className="mb-2">
            <span className="text-muted-foreground">Network:</span>
            <p className="font-medium text-silver-bright">{chainName}</p>
          </div>
          <div className="mb-2">
            <span className="text-muted-foreground">Balance:</span>
            <p className="font-medium text-silver-bright">{walletData.balance}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDisconnect} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
