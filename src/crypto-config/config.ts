import { sepolia } from "viem/chains";

/**
 * Simple crypto configuration for PYUSD on Ethereum Sepolia testnet
 */
export const cryptoConfig = {
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
    chainId: sepolia.id, // Ethereum Sepolia chain ID
    name: 'Ethereum Sepolia',
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
    blockExplorerUrl: 'https://sepolia.etherscan.io',
  }
};