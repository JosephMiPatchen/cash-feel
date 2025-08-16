import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { LoadingSkeleton } from "@coinbase/cdp-react/components/ui/LoadingSkeleton";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { cryptoConfig, getTokenBalance, formatBalance } from "@/crypto-config";
import { useToast } from "@/hooks/use-toast";

interface WalletBalanceProps {
  balance?: number;
  currency?: string;
}

export function WalletBalance({ balance: staticBalance, currency = "PYUSD" }: WalletBalanceProps) {
  const { toast } = useToast();
  const { evmAddress } = useEvmAddress();
  const [cryptoBalance, setCryptoBalance] = useState<bigint | undefined>(undefined);
  const [formattedBalance, setFormattedBalance] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch crypto balance
  const fetchCryptoBalance = useCallback(async () => {
    if (!evmAddress) return;
    
    try {
      setIsLoading(true);
      const balance = await getTokenBalance(evmAddress);
      setCryptoBalance(balance);
      setFormattedBalance(formatBalance(balance));
    } catch (error) {
      console.error("Error fetching crypto balance:", error);
    } finally {
      setIsLoading(false);
    }
  }, [evmAddress]);

  // Fetch crypto balance on component mount and when evmAddress changes
  useEffect(() => {
    if (evmAddress) {
      fetchCryptoBalance();
      
      // Refresh balance every 30 seconds
      const interval = setInterval(fetchCryptoBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [evmAddress, fetchCryptoBalance]);

  // Display balance - prioritize crypto balance if available, fall back to static balance
  const displayBalance = formattedBalance 
    ? parseFloat(formattedBalance) 
    : staticBalance !== undefined 
      ? staticBalance 
      : undefined;

  return (
    <Card className="bg-gradient-wallet border-0 text-white shadow-wallet">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-90 mb-1">Wallet Balance</p>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <LoadingSkeleton as="span" className="w-24 h-8 bg-white/20" />
              ) : displayBalance !== undefined ? (
                `$${displayBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              ) : (
                "$0.00"
              )}
            </div>
            {!evmAddress && (
              <p className="text-xs mt-1 opacity-75">Connect wallet to view balance</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <img 
                src={cryptoConfig.token.iconPath} 
                alt={cryptoConfig.token.symbol} 
                className="w-5 h-5"
                onError={(e) => {
                  e.currentTarget.src = "";
                  e.currentTarget.alt = "₱";
                }}
              />
            </div>
            <span className="text-sm opacity-75">{cryptoConfig.token.symbol}</span>
          </div>
        </div>
        {evmAddress && (
          <div className="mt-2 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 opacity-75">
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded">TESTNET</span>
                <span className="truncate hidden sm:inline">{evmAddress.slice(0, 6)}...{evmAddress.slice(-4)}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs bg-white/10 hover:bg-white/20"
                onClick={() => {
                  navigator.clipboard.writeText(evmAddress);
                  toast({
                    title: "Testnet address copied",
                    description: "Sepolia testnet address copied to clipboard"
                  });
                }}
              >
                Copy Address
              </Button>
            </div>
            <div className="text-right opacity-75">
              <a 
                href={cryptoConfig.token.faucetUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:opacity-100 transition-opacity"
              >
                Get {cryptoConfig.token.symbol} from faucet
              </a>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}