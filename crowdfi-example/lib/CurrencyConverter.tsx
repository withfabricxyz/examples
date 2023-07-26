type numberish = string | number | bigint;

function formatFractionalValue(value: number) : string {
  if(value >= 0.01) {
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

export default class CurrencyConverter {
  // Given a normalized token count, return a fractional denormalized value
  denormalizeTokens(amount: numberish, decimals: number) : number {
    return Number(amount) / (10 ** decimals);
  }

  // Convert denormalized amount to base token count
  normalizeTokens(amount: numberish, decimals: number) : bigint {
    return BigInt(Number(amount) * (10 ** decimals));
  }

  tokenToHuman(amount: numberish, decimals: number) : string {
    const value = this.denormalizeTokens(amount, decimals);
    if(value < 1) {
      return formatFractionalValue(value);
    }
    return value.toLocaleString('en-US');
  }

  // tokenSummary(symbol: string, decimals: number, tokens: bigint) : string {
  //   return `${this.tokenToHuman(tokens, decimals)} ${symbol} (About $${this.tokenToUsd(symbol, decimals, tokens)})`;
  // }

  shortenHumanValue(amount: numberish) : string {
    if(Number(amount) < 1) {
      return formatFractionalValue(Number(amount));
    }
    return formatLargishValue(Number(amount));
  }

  tokenToHumanShort(amount: numberish, decimals: number) : string {
    return this.shortenHumanValue(this.denormalizeTokens(amount, decimals));
  }

  // tokenToUsd(symbol: string, decimals: number, amount: numberish) : string | undefined {
  //   const rate = this.rates[symbol.toLowerCase()];
  //   if(!rate) {
  //     return undefined;
  //   }
  //   const tokens = this.denormalizeTokens(amount, decimals);
  //   const result = rate * tokens;
  //   return result.toLocaleString('en', {
  //     minimumFractionDigits: 0,
  //     maximumFractionDigits: 0,
  //   });
  // }
}