# Cryptocurrency Functionality Migration Guide

This document provides instructions for migrating the cryptocurrency functionality from the Financial Wellness Wallet to a new application. This guide focuses exclusively on the cryptocurrency components and excludes the budget management and UI elements.

## Overview

The Financial Wellness Wallet includes cryptocurrency functionality built on the Coinbase Developer Platform (CDP), supporting:

1. ERC20 token transfers (PYUSD)
2. Native ETH transfers
3. Balance checking
4. Transaction creation and submission
5. Network configuration for Ethereum Sepolia and Base Sepolia

## Required Dependencies

Add these dependencies to your new project:

```json
{
  "dependencies": {
    "@coinbase/cdp-hooks": "^1.0.0",
    "@coinbase/cdp-react": "^1.0.0",
    "viem": "^2.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

## File Structure

Create the following file structure in your new application:

```
src/
└── crypto-config/
    ├── config.ts       # Token and network configurations
    └── index.ts        # Core functionality and exports
```

## Implementation Steps

### 1. Create the Configuration File

Create `src/crypto-config/config.ts` with the following content:

```typescript
import { baseSepolia } from "viem/chains";

/**
 * Configuration for ETH on Base Sepolia
 */
export const ethCryptoConfig = {
  token: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    // Native ETH doesn't have a contract address, but we'll use null for consistency
    contractAddress: null,
    iconPath: '/eth.svg',
    faucetUrl: 'https://portal.cdp.coinbase.com/products/faucet',
    explorerUrl: 'https://sepolia.basescan.org/tx/',
  },
  network: {
    chainId: baseSepolia.id,
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorerUrl: 'https://sepolia.basescan.org',
  }
};

/**
 * Configuration for PYUSD on Ethereum Sepolia
 */
export const pyUsdCryptoConfig = {
  token: {
    // PYUSD Token Information
    name: 'PayPal USD',
    symbol: 'PYUSD',
    decimals: 6, // PYUSD uses 6 decimals, not 18 like ETH
    
    // Official PYUSD contract address on Ethereum Sepolia
    contractAddress: '0xcac524bca292aaade2df8a05cc58f0a65b1b3bb9',
    
    iconPath: '/pyusd.svg', // You'll need to add PYUSD icon to your public folder
    
    // Google Cloud PYUSD faucet for Ethereum Sepolia
    faucetUrl: 'https://cloud.google.com/application/web3/faucet/ethereum/sepolia/pyusd',
    
    // Ethereum Sepolia block explorer for transactions
    explorerUrl: 'https://sepolia.etherscan.io/tx/',
  },
  network: {
    chainId: 11155111, // Ethereum Sepolia chain ID
    name: 'Ethereum Sepolia',
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
    blockExplorerUrl: 'https://sepolia.etherscan.io',
  }
};

// Export the active configuration
// Change this line to switch between configurations
export const cryptoConfig = pyUsdCryptoConfig;
```

### 2. Create the Core Functionality File

Create `src/crypto-config/index.ts` with the following content:

```typescript
import { createPublicClient, formatUnits, http, parseAbi, encodeFunctionData } from "viem";
import { baseSepolia, sepolia } from "viem/chains";
import { cryptoConfig } from "./config";

/**
 * Create a client for the network specified in the config
 */
export const createNetworkClient = () => {
  // Use the appropriate chain based on the network name
  const chain = cryptoConfig.network.name === 'Ethereum Sepolia' ? sepolia : baseSepolia;
  
  return createPublicClient({
    chain,
    transport: http(cryptoConfig.network.rpcUrl),
  });
};

// ERC20 ABI for token interactions
const erc20Abi = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
]);

/**
 * Helper function to ensure contract address has 0x prefix and is properly typed
 */
const toHexAddress = (address: string | null): `0x${string}` | null => {
  if (!address) return null;
  
  // Ensure address has 0x prefix
  if (!address.startsWith('0x')) {
    return `0x${address}` as `0x${string}`;
  }
  
  return address as `0x${string}`;
};

/**
 * Get the token balance for the given address
 */
export const getTokenBalance = async (address: string): Promise<bigint> => {
  const client = createNetworkClient();
  
  // If the token has a contract address, it's an ERC20 token
  if (cryptoConfig.token.contractAddress) {
    // Get properly formatted contract address
    const contractAddress = toHexAddress(cryptoConfig.token.contractAddress);
    
    if (!contractAddress) {
      throw new Error('Invalid contract address');
    }
    
    // Call the balanceOf function on the ERC20 contract
    return await client.readContract({
      address: contractAddress,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address as `0x${string}`]
    });
  }
  
  // For native tokens like ETH, use getBalance
  return await client.getBalance({ address });
};

/**
 * Format a token balance for display
 */
export const formatBalance = (balance: bigint): string => {
  return formatUnits(balance, cryptoConfig.token.decimals);
};

/**
 * Format a transaction URL for display
 */
export const formatTransaction = (txHash: string): string => {
  return `${cryptoConfig.token.explorerUrl}${txHash}`;
};

/**
 * Create a transaction object for sending ERC20 tokens
 * 
 * @param to Recipient address
 * @param amount Amount to send in token's smallest unit (e.g., wei for ETH)
 * @returns Transaction object compatible with SendTransactionButton
 */
export const createERC20TransferTransaction = (to: string, amount: bigint) => {
  // If we have a contract address, it's an ERC20 token
  if (cryptoConfig.token.contractAddress) {
    const contractAddress = toHexAddress(cryptoConfig.token.contractAddress);
    
    if (!contractAddress) {
      throw new Error('Invalid contract address');
    }
    
    // Create data for ERC20 transfer
    const data = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [to as `0x${string}`, amount]
    });
    
    // Return transaction object
    return {
      to: contractAddress,
      data,
      value: 0n, // No ETH is sent with an ERC20 transfer
      chainId: cryptoConfig.network.chainId,
      type: "eip1559" as const, // Type assertion to satisfy TypeScript
    };
  }
  
  // For native ETH
  return {
    to: to as `0x${string}`,
    value: amount,
    chainId: cryptoConfig.network.chainId,
    type: "eip1559" as const, // Type assertion to satisfy TypeScript
  };
};

/**
 * Get the crypto configuration
 */
export const getConfig = () => {
  return cryptoConfig;
};

// Export the config directly
export { cryptoConfig };
```

## React Component Integration

### 1. Basic Wallet Component

Create a basic wallet component that displays the user's balance and allows them to send transactions:

```tsx
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { SendTransactionButton } from "@coinbase/cdp-react/components/SendTransactionButton";
import { useCallback, useEffect, useState } from "react";
import { cryptoConfig, getTokenBalance, formatBalance, createERC20TransferTransaction, formatTransaction } from "./crypto-config";

export function CryptoWallet() {
  const { evmAddress } = useEvmAddress();
  const [balance, setBalance] = useState<bigint | undefined>(undefined);
  const [amount, setAmount] = useState<string>("1");
  const [recipient, setRecipient] = useState<string>("");
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Format balance using our utility function
  const formattedBalance = balance !== undefined ? formatBalance(balance) : undefined;

  const getBalance = useCallback(async () => {
    if (!evmAddress) return;
    try {
      // Use our getTokenBalance utility function
      const balance = await getTokenBalance(evmAddress);
      setBalance(balance);
    } catch (error) {
      console.error("Failed to get balance:", error);
    }
  }, [evmAddress]);

  useEffect(() => {
    getBalance();
    const interval = setInterval(getBalance, 5000);
    return () => clearInterval(interval);
  }, [getBalance]);

  const handleTransactionSuccess = (hash: string) => {
    setTransactionHash(hash);
    setError("");
    getBalance();
  };

  const handleTransactionError = (error: Error) => {
    setTransactionHash("");
    setError(error.message);
  };

  const handleReset = () => {
    setTransactionHash("");
    setError("");
  };

  // Calculate the amount in the smallest unit based on decimals
  const calculateAmount = () => {
    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) return 0n;
      const factor = BigInt(10) ** BigInt(cryptoConfig.token.decimals);
      return BigInt(Math.floor(parsedAmount * Number(factor)));
    } catch (e) {
      return 0n;
    }
  };

  const transaction = recipient ? createERC20TransferTransaction(recipient, calculateAmount()) : null;

  return (
    <div className="crypto-wallet">
      <h2>Crypto Wallet</h2>
      
      {/* Balance Display */}
      <div className="balance-section">
        <h3>Your Balance</h3>
        {formattedBalance === undefined ? (
          <p>Loading balance...</p>
        ) : (
          <p className="balance">
            {formattedBalance} {cryptoConfig.token.symbol}
          </p>
        )}
        <p>
          <a 
            href={cryptoConfig.token.faucetUrl} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Get {cryptoConfig.token.symbol} from faucet
          </a>
        </p>
      </div>

      {/* Transaction Section */}
      {!transactionHash && !error && evmAddress && (
        <div className="transaction-section">
          <h3>Send {cryptoConfig.token.symbol}</h3>
          <div className="form-group">
            <label htmlFor="recipient">Recipient Address:</label>
            <input
              id="recipient"
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="amount">Amount:</label>
            <input
              id="amount"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1.0"
            />
          </div>
          
          {cryptoConfig.token.contractAddress && (
            <p className="gas-notice">
              <small>Note: You need ETH on {cryptoConfig.network.name} to pay for gas fees when sending {cryptoConfig.token.symbol}.</small>
            </p>
          )}
          
          {transaction && (
            <SendTransactionButton
              account={evmAddress}
              network={cryptoConfig.network.name === 'Ethereum Sepolia' ? 'ethereum-sepolia' : 'base-sepolia'}
              transaction={transaction}
              onError={handleTransactionError}
              onSuccess={handleTransactionSuccess}
            />
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-section">
          <h3>Transaction Error</h3>
          <p>{error}</p>
          <button onClick={handleReset}>Try Again</button>
        </div>
      )}

      {/* Transaction Success */}
      {transactionHash && (
        <div className="success-section">
          <h3>Transaction Sent!</h3>
          <p>
            Transaction hash:{" "}
            <a
              href={formatTransaction(transactionHash)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {transactionHash.slice(0, 6)}...{transactionHash.slice(-4)}
            </a>
          </p>
          <button onClick={handleReset}>Send Another Transaction</button>
        </div>
      )}
    </div>
  );
}
```

### 2. App Integration

Integrate the wallet component with the Coinbase CDP provider:

```tsx
import { CoinbaseProvider } from "@coinbase/cdp-react";
import { CryptoWallet } from "./CryptoWallet";

function App() {
  return (
    <CoinbaseProvider
      appName="Your App Name"
      appIcon="/your-app-icon.png"
    >
      <div className="app">
        <header>
          <h1>Your App</h1>
        </header>
        <main>
          <CryptoWallet />
        </main>
      </div>
    </CoinbaseProvider>
  );
}

export default App;
```

## Required Assets

1. Add token icons to your public directory:
   - `/public/eth.svg` - Ethereum icon
   - `/public/pyusd.svg` - PYUSD icon

## Configuration Options

### Switching Between Tokens

To switch between ETH and PYUSD, modify the export in `crypto-config/config.ts`:

```typescript
// For ETH:
export const cryptoConfig = ethCryptoConfig;

// For PYUSD:
export const cryptoConfig = pyUsdCryptoConfig;
```

### Adding New Tokens

To add a new token, create a new configuration object in `crypto-config/config.ts`:

```typescript
export const newTokenConfig = {
  token: {
    name: 'Token Name',
    symbol: 'TKN',
    decimals: 18, // Check the specific token's decimals
    contractAddress: '0x...', // Contract address on the target network
    iconPath: '/token-icon.svg',
    faucetUrl: 'https://faucet-url',
    explorerUrl: 'https://explorer-url/tx/',
  },
  network: {
    chainId: 1, // Network chain ID
    name: 'Network Name',
    rpcUrl: 'https://rpc-url',
    blockExplorerUrl: 'https://explorer-url',
  }
};
```

## Technical Notes

1. **PYUSD Specifics**:
   - Uses 6 decimals (vs ETH's 18)
   - Contract address on Ethereum Sepolia: `0xcac524bca292aaade2df8a05cc58f0a65b1b3bb9`

2. **Network Support**:
   - Ethereum Sepolia (chainId: 11155111)
   - Base Sepolia (chainId: 84532)

3. **Coinbase CDP Integration**:
   - Uses `@coinbase/cdp-hooks` for wallet connection
   - Uses `@coinbase/cdp-react` for UI components
   - Requires proper setup of the CoinbaseProvider

4. **Transaction Handling**:
   - ERC20 transfers require the contract address and ABI
   - Native ETH transfers are handled differently
   - Both require gas fees in the native token (ETH)
