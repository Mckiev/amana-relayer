import { Pool } from 'pg';
import {
  isBetState,
  isBetRow,
  Bet,
  BetRow,
  ShareType,
  isObjectRecord,
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
    if (!isBetRow(row)) {
      throw new Error('Expected the row to be a BetRow');
    }
    return convertToBet(row);
  });
  return bets;
}

const getNUsers = async (): Promise<number> => {
  const query = 'SELECT COUNT(DISTINCT(manifolduserid)) FROM deposits';
  const result = await connection.query(query);
  if (result.rows.length === 0) {
    throw new Error(`unexpected result: ${result}`);
  }
  const row: unknown = result.rows[0];
  if (!isObjectRecord(row) || typeof row.count !== 'string') {
    throw new Error('Invalid row');
  }
  return Number(row.count);
}

const getNBets = async (): Promise<number> => {
  const query = 'SELECT COUNT(*) FROM bets';
  const result = await connection.query(query);  
  if (result.rows.length === 0) {
    throw new Error(`unexpected result: ${result}`);
  }
  const row: unknown = result.rows[0];
  if (!isObjectRecord(row) || typeof row.count !== 'string') {
    throw new Error('Invalid row');
  }
  return Number(row.count);
}

const getTotalManaInflow = async (): Promise<number> => {
  const query = 'SELECT SUM(amount) FROM deposits';
  const result1 = await connection.query(query);
  const query2 = 'SELECT SUM(amount) FROM withdrawals';
  const result2 = await connection.query(query2);
  if (result1.rows.length === 0) {
    throw new Error(`unexpected result: ${result1}`);
  }
  const row: unknown = result1.rows[0];
  if (!isObjectRecord(row) || typeof row.sum !== 'string') {
    throw new Error('Invalid row');
  }
  const depositedAmount = Number(row.sum);
  if (result2.rows.length === 0) {
    throw new Error(`unexpected result: ${result2}`);
  }
  const row2: unknown = result2.rows[0];
  if (!isObjectRecord(row2) || typeof row.sum !== 'string') {
    throw new Error('Invalid row');
  }
  const withdrawnAmount = Number(row2.sum);
  return depositedAmount - withdrawnAmount;
}

export default {
  updateBetToRedeeming,
  getBetId,
  getBets,
  getNUsers,
  getNBets,
  getTotalManaInflow,
};
