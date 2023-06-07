export interface LimitOrderIF {
    id: string;
    limitOrderId: string;
    pivotTime: number;
    crossTime: number;
    user: string;
    base: string;
    quote: string;
    poolIdx: number;
    bidTick: number;
    askTickInvPriceDecimalCorrected: number;
    askTickPriceDecimalCorrected: number;
    bidTickInvPriceDecimalCorrected: number;
    bidTickPriceDecimalCorrected: number;
    askTick: number;
    isBid: boolean;
    positionLiq: number;
    positionLiqBase: number;
    positionLiqQuote: number;
    positionLiqBaseDecimalCorrected: number;
    positionLiqQuoteDecimalCorrected: number;
    claimableLiq: number;
    claimableLiqPivotTimes: number;
    claimableLiqBase: number;
    claimableLiqQuote: number;
    claimableLiqBaseDecimalCorrected: number;
    claimableLiqQuoteDecimalCorrected: number;
    baseSymbol: string;
    baseDecimals: number;
    baseTokenLogoURI: string;
    quoteSymbol: string;
    quoteDecimals: number;
    quoteTokenLogoURI: string;
    limitPrice: number;
    invLimitPrice: number;
    limitPriceDecimalCorrected: number;
    invLimitPriceDecimalCorrected: number;
    ensResolution: string;
    totalValueUSD: number;
    latestUpdateTime: number;
    timeFirstMint: number;
    chainId: string;
    concLiq: number;
    rewardLiq: number;
}

export interface LimitOrderServerIF {
    chainId: string;
    limitOrderId: string;
    pivotTime: number;
    askTick: number;
    bidTick: number;
    isBid: boolean;
    poolIdx: number;
    base: string;
    quote: string;
    user: string;
    concLiq: number;
    rewardLiq: number;
    claimableLiq: number;
    crossTime: number;
    latestUpdateTime: number;
}
