import express from 'express';
import bodyParser from 'body-parser';
import Transaction from './Transaction';

const app = express();

app.use(bodyParser.json());

const port = 9000;

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