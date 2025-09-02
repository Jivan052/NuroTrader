import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';

type Token = {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  price: number;
  change24h: number;
};

type TokenSelectorProps = {
  tokens: Token[];
  selectedToken: string;
  onTokenChange: (token: string) => void;
};

const TokenSelector: React.FC<TokenSelectorProps> = ({
  tokens,
  selectedToken,
  onTokenChange
}) => {
  const selected = tokens.find(t => t.id === selectedToken) || tokens[0];
  
  return (
    <div className="w-full">
      <Select value={selectedToken} onValueChange={onTokenChange}>
        <SelectTrigger className="w-full sm:w-[220px] h-10 sm:h-11 border-primary/20 bg-background/50">
          <div className="flex items-center gap-2 w-full">
            {selected && (
              <>
                <img 
                  src={selected.logo} 
                  alt={selected.name} 
                  className="w-5 h-5 rounded-full"
                />
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{selected.symbol}</span>
                    {selected.change24h > 0 ? (
                      <Badge variant="outline" className="text-[10px] py-0 px-1 text-green-400 border-green-400/30">
                        <TrendingUp className="mr-0.5 h-2.5 w-2.5" />
                        {selected.change24h.toFixed(1)}%
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] py-0 px-1 text-red-400 border-red-400/30">
                        <TrendingDown className="mr-0.5 h-2.5 w-2.5" />
                        {Math.abs(selected.change24h).toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </SelectTrigger>
        <SelectContent className="min-w-[250px] border-primary/20 bg-background/95 backdrop-blur-lg">
          <SelectGroup>
            <SelectLabel className="flex items-center gap-1.5 text-xs">
              <Sparkles className="h-3 w-3 text-primary" />
              Select Token
            </SelectLabel>
            {tokens.map(token => (
              <SelectItem key={token.id} value={token.id} className="py-2">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <img src={token.logo} alt={token.name} className="w-6 h-6 rounded-full" />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{token.name}</span>
                      <span className="text-muted-foreground text-xs">{token.symbol}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm">${token.price.toFixed(2)}</span>
                    <span className={`text-xs ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TokenSelector;
