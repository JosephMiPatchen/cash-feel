import { createPublicClient, formatUnits, http, parseAbi, encodeFunctionData } from "viem";
import { sepolia } from "viem/chains";
import { cryptoConfig } from "./config";

/**
 * Create a client for the Ethereum Sepolia network
 */
export const createNetworkClient = () => {
  return createPublicClient({
    chain: sepolia,
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
      args: [toHexAddress(address) as `0x${string}`]
    });
  }
  
  // For native tokens like ETH, use getBalance
  return await client.getBalance({ address: toHexAddress(address) as `0x${string}` });
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
