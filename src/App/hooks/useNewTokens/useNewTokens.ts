import { useEffect, useState } from 'react';
import { tokenListURIs } from '../../../utils/data/tokenListURIs';
import fetchTokenList from '../../../utils/functions/fetchTokenList';
import { TokenIF, TokenListIF } from '../../../utils/interfaces/exports';

export interface tokenMethodsIF {
    verify: (addr: string, chainId: string) => boolean;
    acknowledge: (tkn: TokenIF) => void;
    getByAddress: (addr: string, chainId: string) => TokenIF|undefined;
    getByChain: (chn: string) => TokenIF[];
    getBySource: (uri: string) => TokenIF[];
}

export const useNewTokens = (chainId: string): tokenMethodsIF => {
    const localStorageKeys = {
        tokenLists: 'tokenLists',
        ackTokens: 'ackTokens',
    };

    // fn to retrieve and parse token lists from local storage
    function getTokenListsFromLS(): TokenListIF[]|null {
        // get entry from local storage
        const entry: string|null = localStorage.getItem(localStorageKeys.tokenLists);
        // declare an output variable
        let output: TokenListIF[] | null;
        // process data retrieved from local storage
        if (entry) {
            try {
                // parse data from local storage and assign to output variable
                const data: TokenListIF[] = JSON.parse(entry);
                output = data;
            } catch {
                // clear data from local storage and warn user if unable to parse
                // assign `null` value to output variable
                console.warn('localStorage token lists corrupt, clearing data and re-fetching');
                localStorage.removeItem(localStorageKeys.tokenLists);
                output = null;
            }
        } else {
            // assign `null` to output variable if no persisted data was found
            output = null;
        }
        // return output value
        return output;
    }

    // fn to retrieve and parse token lists from local storage
    function getAckTokensFromLS(): TokenIF[]|null {
        // get entry from local storage
        const entry: string|null = localStorage.getItem(localStorageKeys.ackTokens);
        // declare an output variable
        let output: TokenIF[] | null;
        // process data retrieved from local storage
        if (entry) {
            try {
                // parse data from local storage and assign to output variable
                const data: TokenIF[] = JSON.parse(entry);
                output = data;
            } catch {
                // clear data from local storage and warn user if unable to parse
                // assign `null` value to output variable
                console.warn('localStorage acknowledged token lists corrupt, clearing data and re-fetching');
                localStorage.removeItem(localStorageKeys.ackTokens);
                output = null;
            }
        } else {
            // assign `null` to output variable if no persisted data was found
            output = null;
        }
        // return output value
        return output;
    }

    // hook to memoize token lists in local state
    const [tokenLists, setTokenLists] = useState<TokenListIF[]>(
        getTokenListsFromLS() ?? []
    );

    class Token implements TokenIF {
        name: string;
        address: string;
        symbol: string;
        decimals: number;
        chainId: number;
        logoURI: string;
        fromList: string;
        fromListArr: string[];
        constructor(rawToken: TokenIF, newListURI='') {
            this.name = rawToken.name;
            this.address = rawToken.address;
            this.symbol = rawToken.symbol;
            this.decimals = rawToken.decimals;
            this.chainId = rawToken.chainId;
            this.logoURI = rawToken.logoURI;
            this.fromList = rawToken.fromList ?? newListURI;
            if (rawToken.fromListArr) {
                this.fromListArr = [...rawToken.fromListArr, newListURI]
            } else {
                this.fromListArr = [rawToken.fromList ?? ''];
            }
        }
    };

    const [tokenMap, setTokenMap] = useState<Map<string, TokenIF>>(new Map());
    
    // this hook fetches external token lists and sends them to local state and local
    // ... storage, it runs asynchronously after initial render of the app only; it is
    // ... intelligent and will only fetch lists that are missing or stale-dated
    useEffect(() => {
        // fn to fetch token lists, apply middleware, and update data in state/local storage
        // will patch fetched lists intelligently with current lists which are relevant
        function fetchAndFormatTokenLists(
            listURIs: string[],
            existingLists: TokenListIF[] = []
        ): void {
            // create an array of promises to fetch all token lists in the URIs file
            const tokenListPromises: Promise<TokenListIF>[] = listURIs.map((uri: string) => fetchTokenList(uri, false));
            Promise.allSettled(tokenListPromises)
                // format returned data into a useful form for the app
                // 1st val ➡ indicates if second val is a value
                // 2nd val ➡ value returned by promise
                .then((promises) => promises.flatMap((promise) => Object.entries(promise))
                    .filter((promise) => promise[0] === 'value')
                    .map((promise) => promise[1])
                )
                // middleware to add metadata used by the Ambient platform
                .then((lists) => {
                    // current UNIX time to mark when lists should be refreshed
                    // const unixTimeInFourHours: number = Date.now() + 14400000;
                    const unixTimeInFourHours: number = Date.now() + 14400000;
                    // indicate which list each token data object was imported with
                    lists.forEach((list) => {
                        list.refreshAfter = unixTimeInFourHours;
                        list.tokens.forEach(
                            (token: TokenIF) => (token.fromList = list.uri),
                        )
                    });
                    const updatedListsArr = [...existingLists, ...lists];
                    // logic to put the Ambient token list at index 0 of the array
                    const sequencedLists: TokenListIF[] = [
                        // ambient token list
                        updatedListsArr.find((list: TokenListIF) => 
                            list.uri === tokenListURIs.ambient
                        ),
                        // all token lists other than Ambient
                        ...updatedListsArr.filter((list: TokenListIF) => 
                        list.uri !== tokenListURIs.ambient
                    )
                    ];
                    // send array of token lists to local state
                    setTokenLists(sequencedLists);
                    // send array of token lists to local storage
                    localStorage.setItem(
                        localStorageKeys.tokenLists, JSON.stringify(sequencedLists)
                    );
                    setTokenMap(makeTokenMap(sequencedLists));
                });
        }

        // code block to manage fetching token lists
        // no lists present ➡ will fetch all lists
        // some lists present ➡ will only fetch missing and stale lists
        if (tokenLists.length === 0) {
            fetchAndFormatTokenLists(Object.values(tokenListURIs));
        } else if (tokenLists.length > 0) {
            // current UNIX time when this code block runs
            const unixTimeNow: number = Date.now();
            // URIs of lists retrieved more than four hours ago
            const staleListURIs: string[] = tokenLists.filter((list: TokenListIF) => (
                (unixTimeNow - (list.refreshAfter ?? 0)) > 0
            )).map((list: TokenListIF) => list.uri as string);
            // array of lists (full list) which were not marked stale
            const freshLists: TokenListIF[] = tokenLists.filter((list: TokenListIF) => (
                !staleListURIs.includes(list.uri as string) &&
                Object.values(tokenListURIs).includes(list.uri as string)
            ));
            // logic to determine which lists the app currently has by URI
            // this uses `freshLists` so stale lists will be excluded
            const presentListURIs: string[] = freshLists.map((list: TokenListIF) => list.uri as string);
            // logic to determine which default lists need to be retrieved
            // important if prior query failed, a new list is added to the app, etc
            const neededListURIs: string[] = Object.values(tokenListURIs)
                .filter((uri: string) => !presentListURIs.includes(uri));
            fetchAndFormatTokenLists(neededListURIs, freshLists);
        };
    }, []);

    // fn to make a map of all tokens from lists and tokens acknowledged by user
    function makeTokenMap(listsToMap: TokenListIF[]): Map<string, TokenIF> {
        console.time('making token map');
        // initialize an empty Map
        const newTokenMap = new Map<string, TokenIF>();
        // unified array of all tokens from all lists (not de-duped!)
        const allListedTokens: TokenIF[] = listsToMap.flatMap(
            (tokenList: TokenListIF) => tokenList.tokens
        );
        // iterate through tokens array and add to Map, including de-dupe logic
        allListedTokens.forEach((tkn: TokenIF) => {
            // make a key to label token in the map
            const tokenKey: string = makeTokenMapKey(tkn.address, tkn.chainId);
            // check if token is already in the map
            const tokenFromMap: TokenIF|undefined = newTokenMap.get(tokenKey);
            newTokenMap.set(tokenKey, new Token(tokenFromMap ?? tkn, tkn.fromList));
        });
        // array of acknowledged from local storage (gets an empty array if none)
        const ackTokens: TokenIF[] = JSON.parse(
            localStorage.getItem(localStorageKeys.ackTokens) as string
        ) ?? [];
        // iterate through acknowledged tokens and add to Map if not already listed
        ackTokens.forEach((tkn: TokenIF) => {
            verifyToken(tkn.address, `0x_${tkn.chainId.toString(16)}`) ||
                newTokenMap.set(
                    makeTokenMapKey(tkn.address, tkn.chainId),
                    new Token(tkn, 'custom_token')
                );
        });
        console.timeEnd('making token map');
        return newTokenMap;
    }

    // fn to construct a token map key to lookup or record a given token
    function makeTokenMapKey(addr: string, chn: string|number): string {
        // logic router to convert `chn` to a 0x hex string if necessary
        let chainIdAsString: string;
        switch (typeof chn) {
            // no conversion necessary if already a string
            case 'string':
                chainIdAsString = chn;
                break;
            // convert to a 0x hex string if provided a number
            case 'number':
                chainIdAsString = '0x' + chn.toString(16);
                break;
            // handling for edge cases and to satisfy the linter
            default:
                console.warn(`Unexpected value in function makeTokenMapKey() in useNewTokens.ts file. Expected param <<chn>> to be of type 'string' or type 'number' but received type ${typeof chn}. Fn will use current chain <<${chainId}>> as a default value instead of param <<${chn}>>.`);
                chainIdAsString = chainId;
        }
        // marry output values with an underscore and make lowercase
        return addr.toLowerCase() + '_' + chainIdAsString.toLowerCase();
    }

    // fn to convert the token map to an array
    function convertTokenMapToArray(): TokenIF[] {
        return [...tokenMap.values()];
    }

    // fn to verify a token is on a known list or user-acknowledged
    function verifyToken(addr: string, chn: string): boolean {
        // key to look up token in the map
        const tokenKey: string = makeTokenMapKey(addr, chn);
        // return boolean representation of token being found in map
        return !!tokenMap.get(tokenKey);
    }

    // fn to acknowledge a custom token
    function acknowledgeToken(tkn: TokenIF): void {
        // put the token into the Token class constructor for consistency
        const tokenObj: TokenIF = new Token(tkn, 'custom_token');
        // array of ack'd tokens from local storage (empty array if none yet)
        const tkns: TokenIF[] = getAckTokensFromLS() ?? [];
        // array from local storage with the new token added
        // we're assuming the app only calls this in cases it is not yet ack'd
        const updatedTokens: TokenIF[] = [...tkns, tokenObj];
        // update the persisted array in local storage
        localStorage.setItem(localStorageKeys.ackTokens, JSON.stringify(updatedTokens));
        // create a local-scope copy of the token Map
        const localMap: Map<string, TokenIF> = tokenMap;
        // add the new custom token to the local map
        const tokenKey: string = makeTokenMapKey(tkn.address, tkn.chainId);
        localMap.set(tokenKey, tokenObj);
        // send the updated map to local state
        setTokenMap(localMap);
    }

    // fn to look up a token by contract address
    function getTokenByAddress(
        addr: string, chn: string
    ): TokenIF|undefined {
        // key to look up token in the map
        const tokenKey: string = makeTokenMapKey(addr, chn);
        // return token if found, otherwise `undefined`
        return tokenMap.get(tokenKey);
    }

    // fn to look up all listed & ack'd tokens by chain
    function getTokensByChain(chn: string) {
        // array of all tokens currently in `tokenMap`
        const tokensAsArray: TokenIF[] = convertTokenMapToArray();
        // return tokens filtered for a given chainId
        return tokensAsArray.filter((tkn: TokenIF) => tkn.chainId === parseInt(chn));
    }

    function getTokensFromList(uri: string) {
        // array of all tokens currently in `tokenMap`
        const tokensAsArray: TokenIF[] = convertTokenMapToArray();
        // return tokens filtered for a given list URI
        return tokensAsArray.filter((tkn: TokenIF) => tkn.fromListArr?.includes(uri));
    }

    return {
        verify: verifyToken,
        acknowledge: acknowledgeToken,
        getByAddress: getTokenByAddress,
        getByChain: getTokensByChain,
        getBySource: getTokensFromList,
    };
};
