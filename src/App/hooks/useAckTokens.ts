import { useState } from 'react';
import { TokenIF } from '../../utils/interfaces/exports';

export interface ackTokensMethodsIF {
    tokens: TokenIF[];
    acknowledge: (newTkn: TokenIF) => void;
    check: (tkn: TokenIF) => boolean;
}

export const useAckTokens = (): ackTokensMethodsIF => {
    const localStorageKey = 'acknowledgedTokens';

    const [ackTokens, setAckTokens] = useState<TokenIF[]>(
        JSON.parse(localStorage.getItem(localStorageKey) as string) ?? []
    );

    function acknowledgeToken(newTkn: TokenIF): void {
        const ackTokensWithNewRemoved: TokenIF[] = ackTokens.filter((ackToken: TokenIF) => (
            ackToken.address.toLowerCase() !== newTkn.address.toLowerCase() ||
            ackToken.chainId === newTkn.chainId
        ));
        const updatedAckTokensArray: TokenIF[] = [newTkn, ...ackTokensWithNewRemoved];
        setAckTokens(updatedAckTokensArray);
        localStorage.setItem(
            localStorageKey, JSON.stringify(updatedAckTokensArray)
        );
    }

    function checkToken(tkn: TokenIF): boolean {
        return ackTokens.some((ackToken: TokenIF) => (
            ackToken.address.toLowerCase() === tkn.address.toLowerCase() &&
            ackToken.chainId === tkn.chainId
        ));
    }

    return {
        tokens: ackTokens,
        acknowledge: acknowledgeToken,
        check: checkToken,
    }
}