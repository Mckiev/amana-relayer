import * as dotenv from 'dotenv';

dotenv.config();

const mnemonic = process.env.MNEMONIC;

if (mnemonic === undefined) {
  throw new Error('An environment variable for the MNEMONIC was not provided.');
}

const config = {
  mnemonic,
}

export default config;
