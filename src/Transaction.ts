import { InfuraProvider, Wallet } from 'ethers';
import { Mutex } from 'async-mutex';
import constants from './constants';
import config from './config';

const provider = new InfuraProvider(137)

const transactionMutex = new Mutex();

const send = async (data: string, gasLimit: bigint): Promise<string> => {
  return transactionMutex.runExclusive(async () => {
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
    const transactionResponse = await wallet.sendTransaction(transaction);
    const receipt = await transactionResponse.wait(3);
    if (receipt?.hash === undefined) {
      throw new Error('Transaction failed');
    }
    return receipt?.hash;
  });
};

export default {
  send,
};