import express from 'express';
import bodyParser from 'body-parser';
import Transaction from './Transaction';
import database from './database';
import { RailgunEngine, verifyED25519 } from '@railgun-community/engine';

// Hex value of message string: "Redeem AMANA Bet"
const REDEEM_MESSAGE_HEX = '52656465656d20414d414e4120426574';

const app = express();

app.use(bodyParser.json());

const port = 9000;

app.get('/positions', async (req, res) => {
  const positions = await database.getBets();
  res.json(positions);
});

app.post('/redeem', async (req, res) => {
  try {
    const { redemptionAddress, signature } = req.body;
    if (typeof redemptionAddress !== 'string') {
      throw new Error('Expected redemptionAddress to be a string');
    }
    if (typeof signature !== 'string') {
      throw new Error('Expected signature to be a string');
    }
    const betId = await database.getBetId(redemptionAddress);
    const { viewingPublicKey } = RailgunEngine.decodeAddress(redemptionAddress);
    const isVerified = verifyED25519(REDEEM_MESSAGE_HEX, signature, viewingPublicKey);
    if (!isVerified) {
      throw new Error('Invalid signature');
    }
    await database.updateBetToRedeeming(betId);
  } catch (e: unknown) {
    res.json({
      success: false,
    });
  }
});

app.post('/send-transaction', async (req, res) => {
  const { data, gasLimit } = req.body;
  console.log('data', data);
  console.log('gasLimit', gasLimit);
  if (typeof data !== 'string') {
    return res.json({
      success: false,
    });
  }
  if (typeof gasLimit !== 'string') {
    return res.json({
      success: false,
    });
  }
  try {
    const txid = await Transaction.send(data, BigInt(gasLimit));
    console.log('txid', txid);
    res.json({
      success: false,
      txid,
    });
  } catch (e) {
    return res.json({
      success: false,
    });
  }
});

const initialize = async () => {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  });
};

export default {
  initialize,
};