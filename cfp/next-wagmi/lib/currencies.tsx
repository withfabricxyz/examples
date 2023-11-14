type numberish = string | number | bigint;

function formatFractionalValue(value: number) : string {
  if (value >= 0.01) {
    return value.toFixed(2);
  } else if(value == 0) {
    return '0';
  } else {
    return '<0.01';
  }
}

function formatLargishValue(num: number) : string {
  const digits = 1;
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'K' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'B' },
  ];
  const item = lookup.slice().reverse().find((item) => num >= item.value);
  return item ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0';
}

export function denormalizeTokens(amount: numberish, decimals: number) : number {
  return Number(amount) / (10 ** decimals);
}

export function normalizeTokens(amount: numberish, decimals: number) : bigint {
  return BigInt(Number(amount) * (10 ** decimals));
}

export function tokenToHuman(amount: numberish, decimals: number) : string {
  const value = denormalizeTokens(amount, decimals);
  if (value < 1) {
    return formatFractionalValue(value);
  }
  return value.toLocaleString('en-US');
}

export function shortenHumanValue(amount: numberish) : string {
  if (Number(amount) < 1) {
    return formatFractionalValue(Number(amount));
  }
  return formatLargishValue(Number(amount));
}

export function tokenToHumanShort(amount: numberish, decimals: number) : string {
  return shortenHumanValue(denormalizeTokens(amount, decimals));
}
