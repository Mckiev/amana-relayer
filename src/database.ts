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

const updateBetToRedeeming = async (betId: string): Promise<void> => {
  const query = 'UPDATE Bets SET state=$1 WHERE id=$2 AND state=$3';
  const params = ['Redeeming', betId, 'Placed'];
  await connection.query(query, params);
}

const getBetId = async (redemptionAddress: string): Promise<string> => {
  const query = 'SELECT * FROM Bets WHERE state=$1 AND redemptionaddress=$2 LIMIT 1';
  const params = ['Placed', redemptionAddress];
  const results = await connection.query(query, params);
  const row = results.rows[0];
  if (!isBetRow(row)) {
    throw new Error('Expected the row to be a BetRow');
  }
  return convertToBet(row).id;
}

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
  updateBetToRedeeming,
  getBetId,
  getBets,
};
