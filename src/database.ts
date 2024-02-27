import { Pool } from 'pg';
import {
  isBetState,
  isBetRow,
  Bet,
  BetRow,
  ShareType,
} from './types';

const pool = new Pool({
  ssl: {
    rejectUnauthorized: false,
    // cert: PG_CERT,
  }
});

const connection = {
  query: (text: string, params: unknown[] = []) => pool.query(text, params),
};

const convertToBet = (value: BetRow): Bet => {
  const state = value.state;
  if (!isBetState(state)) {
    throw new Error(`Invalid state value: ${value.state}`);
  }
  let prediction: ShareType;
  if (value.prediction.toUpperCase() == 'YES') {
    prediction = ShareType.yes;
  } else if (value.prediction.toUpperCase() == 'NO') {
    prediction = ShareType.no;
  } else {
    throw new Error(`Invalid prediction value: ${value.prediction}`);
  }

  return {
    id: value.id,
    timestamp: value.timestamp,
    railgunTransactionId: value.railguntransactionid,
    amount: value.amount,
    marketUrl: value.marketurl,
    marketId: value.marketid,
    prediction,
    redemptionAddress: value.redemptionaddress,
    betId: (
      value.betid === null
      ? undefined
      : value.betid
    ),
    nShares: value.nshares ?? undefined,
    state,
  };
};

const getBets = async (): Promise<Bet[]> => {
  const query = 'SELECT * FROM Bets ORDER BY timestamp ASC';
  const results = await connection.query(query);
  const rows = results.rows;
  const bets = rows.map((row: unknown) => {
    console.log('row', row);
    if (!isBetRow(row)) {
      throw new Error('Expected the row to be a BetRow');
    }
    return convertToBet(row);
  });
  return bets;
}

export default {
  getBets,
};
