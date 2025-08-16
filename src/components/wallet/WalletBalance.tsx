import { Card } from "@/components/ui/card";

interface WalletBalanceProps {
  balance: number;
  currency?: string;
}

export function WalletBalance({ balance, currency = "PYUSD" }: WalletBalanceProps) {
  return (
    <Card className="bg-gradient-wallet border-0 text-white shadow-wallet">
      <div className="p-6">
        <div className="text-center">
          <p className="text-sm opacity-90 mb-2">Wallet Balance</p>
          <div className="text-4xl font-bold mb-1">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-sm opacity-75">{currency}</p>
        </div>
      </div>
    </Card>
  );
}