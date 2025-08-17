import { useEvmAddress } from "@coinbase/cdp-hooks";
import {
  SendTransactionButton,
  type SendTransactionButtonProps,
} from "@coinbase/cdp-react/components/SendTransactionButton";
import { Button } from "@coinbase/cdp-react/components/ui/Button";
import { LoadingSkeleton } from "@coinbase/cdp-react/components/ui/LoadingSkeleton";
import { useMemo, useState } from "react";
import { cryptoConfig, formatTransaction, createERC20TransferTransaction } from "../../crypto-config";

interface Props {
  balance: string;
  recipient?: string;
  amount?: string;
  onSuccess?: (hash: string) => void;
  onError?: (error: Error) => void;
}

/**
 * This component demonstrates how to send an EVM transaction using the CDP hooks.
 *
 * @param {Props} props - The props for the Transaction component.
 * @param {string} [props.balance] - The user's balance.
 * @param {() => void} [props.onSuccess] - A function to call when the transaction is successful.
 * @returns A component that displays a transaction form and a transaction hash.
 */
function Transaction({ 
  balance, 
  recipient, 
  amount, 
  onSuccess, 
  onError
}: Props) {
  const { evmAddress } = useEvmAddress();
  const [transactionHash, setTransactionHash] = useState("");
  const [error, setError] = useState("");

  const hasBalance = useMemo(() => {
    return balance && balance !== "0";
  }, [balance]);

  // Use provided recipient or fallback to hardcoded address
  const destinationAddress = recipient || '0x16520479fd477d5A2E5481b56cFC0E79E156159E';
  
  const transaction = useMemo<SendTransactionButtonProps["transaction"]>(() => {
    if (!destinationAddress) {
      console.log("No recipient address provided");
      return undefined;
    }
    
    try {
      // Convert amount from dollars to token units (PYUSD has 6 decimals)
      // 1 PYUSD = 1000000 units (1 dollar)
      const amountValue = amount ? parseFloat(amount) : 1;
      if (isNaN(amountValue) || amountValue <= 0) {
        console.log("Invalid amount", { amount, amountValue });
        return undefined;
      }
      
      const tokenUnits = BigInt(Math.floor(amountValue * 1000000));
      console.log("Creating transaction with:", {
        recipient: destinationAddress,
        amount: amountValue,
        tokenUnits: tokenUnits.toString()
      });
      
      // Use our helper function to create the transaction
      return createERC20TransferTransaction(destinationAddress, tokenUnits);
    } catch (error) {
      console.error("Error creating transaction:", error);
      return undefined;
    }
  }, [destinationAddress, amount]);

  const handleTransactionError: SendTransactionButtonProps["onError"] = error => {
    console.error("Transaction error:", error);
    setTransactionHash("");
    setError(error.message);
    
    // Call the onError callback if provided
    if (onError) {
      onError(error);
    }
  };

  const handleTransactionSuccess: SendTransactionButtonProps["onSuccess"] = hash => {
    console.log("Transaction successful with hash:", hash);
    setTransactionHash(hash);
    setError("");
    
    // Call the onSuccess callback with the transaction hash if provided
    if (onSuccess) {
      onSuccess(hash);
    }
  };

  const handleReset = () => {
    setTransactionHash("");
    setError("");
  };

  return (
    <div className="w-full">
      {balance === undefined && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Send a transaction</h2>
          <LoadingSkeleton className="h-12 w-full" />
        </div>
      )}
      {balance !== undefined && (
        <div className="space-y-4">
          {!transactionHash && error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg space-y-2">
              <h3 className="font-medium text-red-500">Transaction Error</h3>
              <p className="text-sm">{error}</p>
              <Button 
                onClick={handleReset} 
                variant="secondary"
                className="w-full mt-2"
              >
                Try Again
              </Button>
            </div>
          )}
          {!transactionHash && !error && (
            <div>
              {hasBalance && evmAddress && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Transaction Details</span>
                    <span className="text-sm text-muted-foreground">{cryptoConfig.network.name}</span>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Send {cryptoConfig.token.symbol}</span>
                      <span className="font-semibold">{amount || '1'} {cryptoConfig.token.symbol}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>To:</span>
                      <code>{destinationAddress.slice(0, 10)}...{destinationAddress.slice(-8)}</code>
                    </div>
                  </div>
                  
                  <SendTransactionButton
                    account={evmAddress}
                    network={cryptoConfig.network.name === 'Ethereum Sepolia' ? 'ethereum-sepolia' : 'base-sepolia'}
                    transaction={transaction}
                    onError={handleTransactionError}
                    onSuccess={handleTransactionSuccess}
                    className="w-full h-12 text-lg font-semibold"
                  />
                </div>
              )}
              {!hasBalance && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg space-y-2">
                  <h3 className="font-medium text-amber-500">Insufficient Balance</h3>
                  <p className="text-sm">You need ETH on {cryptoConfig.network.name} to pay for transaction fees.</p>
                  {cryptoConfig.token.faucetUrl && (
                    <a
                      href={cryptoConfig.token.faucetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm block mt-2"
                    >
                      Get ETH from {cryptoConfig.network.name} Faucet
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
          {transactionHash && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg space-y-2">
              <h3 className="font-medium text-green-500">Transaction Sent!</h3>
              <p className="text-sm">Your transaction has been submitted to the blockchain.</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Transaction Hash:</span>
                <a
                  href={formatTransaction(transactionHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {transactionHash.slice(0, 6)}...{transactionHash.slice(-4)}
                </a>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full mt-2" 
                onClick={handleReset}
              >
                Send Another Transaction
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Transaction;
