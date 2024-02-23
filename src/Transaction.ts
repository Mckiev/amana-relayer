import { InfuraProvider, Wallet } from 'ethers';
import constants from './constants';
import config from './config';

const provider = new InfuraProvider(137)

const send = async (data: string, gasLimit: bigint): Promise<string> => {
  const wallet = Wallet.fromPhrase(config.mnemonic, provider);
  const transaction = {
    from: wallet.address,
    to: constants.RAILGUN_SMART_CONTRACT_ADDRESS,
    data,
    gasLimit,
    maxFeePerGas: constants.MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: constants.MAX_PRIORITY_FEE_PER_GAS,
    type: constants.TRANSACTION_TYPE,
  };
  console.log('transaction', transaction)
  const transactionResponse = await wallet.sendTransaction(transaction);
  console.log('transactionResponse', transactionResponse)
  const receipt = await transactionResponse.wait(3);
  console.log('receipt', receipt)
  if (receipt?.hash === undefined) {
    throw new Error('Transaction failed');
  }
  return receipt?.hash;
};

export default {
  send,
};