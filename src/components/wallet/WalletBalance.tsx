import { Card } from "@/components/ui/card";

interface WalletBalanceProps {
  balance: number;
  currency?: string;
}

export function WalletBalance({ balance, currency = "PYUSD" }: WalletBalanceProps) {
  return (
    <Card className="bg-gradient-wallet border-0 text-white shadow-wallet">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-90 mb-1">Wallet Balance</p>
            <div className="text-2xl font-bold">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold">₱</span>
            </div>
            <span className="text-sm opacity-75">{currency}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}