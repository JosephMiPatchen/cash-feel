import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import type { ExtendedBudgetAllocation } from "@/lib/budget/ui-types";
import { AllocationTypeEnum } from "@/lib/budget/types";
import { SpendingAnimationModal } from "./SpendingAnimationModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Transaction from "./Transaction";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { formatTransaction } from "@/crypto-config";

interface SendMoneySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (allocation: string, amount: number, recipient: string, description: string, allowOverspend?: boolean) => void;
  allocations: ExtendedBudgetAllocation[];
  onTransactionSuccess?: () => void;
}

export function SendMoneySheet({ isOpen, onClose, onSend, allocations, onTransactionSuccess }: SendMoneySheetProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedAllocation, setSelectedAllocation] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [allowOverspend, setAllowOverspend] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationData, setAnimationData] = useState<{ allocation: ExtendedBudgetAllocation; amount: number } | null>(null);
  // No longer using tabs for transaction types
  const [transactionHash, setTransactionHash] = useState("");
  const [transactionError, setTransactionError] = useState("");
  const { evmAddress } = useEvmAddress();
  const { toast } = useToast();

  const selectedEnvelope = allocations.find(a => a.name === selectedAllocation);
  const amountValue = parseFloat(amount) || 0;
  const canAfford = selectedEnvelope ? amountValue <= selectedEnvelope.remaining : false;
  const willOverspend = selectedEnvelope ? amountValue > selectedEnvelope.remaining : false;
  const overspendAmount = selectedEnvelope && willOverspend ? amountValue - selectedEnvelope.remaining : 0;

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      // Reset all state when the modal is opened
      setRecipient("");
      setAmount("");
      setSelectedAllocation("");
      setDescription("");
      setIsLoading(false);
      setAllowOverspend(false);
      setShowAnimation(false);
      setAnimationData(null);
      setTransactionHash("");
      setTransactionError("");
    }
  }, [isOpen]);

  // Handle successful crypto transaction
  const handleTransactionSuccess = (hash: string) => {
    console.log("Transaction successful!", hash);
    setTransactionHash(hash);
    setTransactionError("");
    
    // Create a toast with a clickable transaction hash link
    toast({
      title: "Transaction sent successfully!",
      description: (
        <a
          href={formatTransaction(hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            window.open(formatTransaction(hash), '_blank');
          }}
        >
          View on Etherscan: {hash.slice(0, 6)}...{hash.slice(-4)}
        </a>
      ),
      duration: 10000, // 10 seconds
    });
    
    // Call the onTransactionSuccess callback to refresh the balance
    if (onTransactionSuccess) {
      console.log("Calling onTransactionSuccess to refresh crypto balance");
      onTransactionSuccess();
    }
    
    // Call handleSend to trigger the same animation logic that was working before
    console.log("Calling handleSend to trigger animation");
    handleSend();
  };

  // Handle crypto transaction error
  const handleTransactionError = (error: Error) => {
    console.error("Transaction error:", error);
    setTransactionHash("");
    setTransactionError(error.message);
    
    toast({
      title: "Transaction failed",
      description: error.message,
      variant: "destructive",
      duration: 10000,
    });
  };

  const handleSend = async () => {
    if (!recipient || !amount || !selectedAllocation) {
      toast({
        title: "Invalid transaction",
        description: "Please fill all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (willOverspend && !allowOverspend) {
      toast({
        title: "Budget Override Required",
        description: "Enable 'Allow Overspending' to proceed with this transaction.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Starting transaction:', { selectedAllocation, amountValue, recipient, allowOverspend });
      
      // Mock delay for transaction processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Calling onSend with params:', { selectedAllocation, amountValue, recipient, description: description || `Payment to ${recipient}`, allowOverspend });
      onSend(selectedAllocation, amountValue, recipient, description || `Payment to ${recipient}`, allowOverspend);
      
      console.log('onSend completed, showing animation');
      // Show animation modal
      if (selectedEnvelope) {
        setAnimationData({ allocation: selectedEnvelope, amount: amountValue });
        setShowAnimation(true);
      }
      
      toast({
        title: "Money sent successfully!",
        description: `$${amountValue.toFixed(2)} sent from ${selectedAllocation}`,
      });
      
      // Reset form
      setRecipient("");
      setAmount("");
      setSelectedAllocation("");
      setDescription("");
      onClose();
    } catch (error) {
      toast({
        title: "Transaction failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
        <SheetHeader>
          <SheetTitle>Send Money</SheetTitle>
          <SheetDescription>
            Send money to recipients
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Recipient */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address or ENS</Label>
            <Input
              id="recipient"
              placeholder="0x... or username.eth"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="h-12"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (PYUSD)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 text-lg"
            />
          </div>

          {/* Spending Category Selection */}
          <div className="space-y-2">
            <Label>Spending Category</Label>
            <Select value={selectedAllocation} onValueChange={setSelectedAllocation}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select spending category" />
              </SelectTrigger>
              <SelectContent>
                {allocations
                  .filter(allocation => allocation.type === AllocationTypeEnum.EXPENSE)
                  .map((allocation) => (
                  <SelectItem key={allocation.id} value={allocation.name}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: allocation.color }}
                        />
                        <span>{allocation.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground ml-4">
                        ${allocation.remaining.toFixed(2)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Envelope Status */}
          {selectedEnvelope && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{selectedEnvelope.name}</span>
                <span className="text-sm text-muted-foreground">
                  Available: ${selectedEnvelope.remaining.toFixed(2)}
                </span>
              </div>
              {amountValue > 0 && (
                <div className="text-sm">
                  {canAfford ? (
                    <span className="text-success">
                      ✓ After transaction: ${(selectedEnvelope.remaining - amountValue).toFixed(2)}
                    </span>
                  ) : willOverspend ? (
                    <div className="space-y-1">
                      <span className="text-destructive font-medium">
                        ⚠️ This will exceed your budget by ${overspendAmount.toFixed(2)}
                      </span>
                      <span className="text-destructive text-xs block">
                        Category will be -${Math.abs(selectedEnvelope.remaining - amountValue).toFixed(2)} after transaction
                      </span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* Overspend Override Switch */}
          {willOverspend && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="allow-overspend" className="text-sm font-medium text-destructive">
                    Allow Overspending
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Override budget limits for this transaction
                  </p>
                </div>
                <Switch
                  id="allow-overspend"
                  checked={allowOverspend}
                  onCheckedChange={setAllowOverspend}
                />
              </div>
              {allowOverspend && (
                <div className="text-xs text-destructive font-medium">
                  ⚠️ Budget override enabled - transaction will exceed category limit
                </div>
              )}
            </div>
          )}


          {/* Transaction Status */}          
          {transactionError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg space-y-2 mb-4">
              <h3 className="font-medium text-red-500">Transaction Failed</h3>
              <p className="text-sm text-muted-foreground">{transactionError}</p>
            </div>
          )}

          {/* Transaction Component */}
          <div className="space-y-3">
            <Transaction 
              balance={"100"} 
              recipient={recipient} 
              amount={amount}
              onSuccess={handleTransactionSuccess}
              onError={handleTransactionError}
            />
            <p className="text-xs text-muted-foreground text-center">
              <span className="text-amber-500">⚠️</span> You need ETH on Sepolia to pay for gas fees
            </p>
          </div>
        </div>
      </SheetContent>

      {/* Spending Animation Modal */}
      {animationData && (
        <SpendingAnimationModal
          isOpen={showAnimation}
          onClose={() => setShowAnimation(false)}
          allocation={animationData.allocation}
          spentAmount={animationData.amount}
        />
      )}
    </Sheet>
  );
}