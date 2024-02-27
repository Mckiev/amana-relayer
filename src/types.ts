type ObjectRecord = Record<string, unknown>;

const isObjectRecord = (value: unknown): value is ObjectRecord => (
  typeof value === 'object'
    && !Array.isArray(value)
    && value !== null
);

enum ShareType {
  yes = 'YES',
  no = 'NO',
}

enum BetState {
  Placing = 'Placing',
  Placed = 'Placed',
  Redeeming = 'Redeeming',
  Redeemed = 'Redeemed',
  Failed = 'Failed',
}

type Bet = {
  id: string;
  timestamp: string;
  railgunTransactionId: string;
  amount: string;
  marketUrl: string;
  marketId: string;
  prediction: ShareType;
  redemptionAddress: string;
  betId: string | undefined;
  nShares: number | undefined;
  state: BetState;
};

type BetRow = {
  id: string,
  timestamp: string,
  railguntransactionid: string,
  amount: string,
  marketurl: string,
  marketid: string,
  prediction: string,
  redemptionaddress: string,
  betid: string | null,
  nshares: number | null,
  state: string
};

const isBetRow = (value: unknown) : value is BetRow => (
  isObjectRecord(value)
    && typeof value.id === 'string'
    && typeof value.timestamp === 'string'
    && typeof value.railguntransactionid === 'string'
    && typeof value.amount === 'string'
    && typeof value.marketurl === 'string'
    && typeof value.marketid === 'string'
    && typeof value.prediction === 'string'
    && typeof value.redemptionaddress === 'string'
    &&  (
      value.betid === null
      || typeof value.betid === 'string'
    )
    &&  (
      value.nshares === null
      || typeof value.nshares === 'number'
    )
    && typeof value.state === 'string'
);

const isBetState = (value: unknown): value is BetState => (
  typeof value === 'string'
    && value in BetState
);

export {
  isBetState,
  isBetRow,
  Bet,
  BetRow,
  ShareType,
}