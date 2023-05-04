import { useEffect, useState } from 'react';
import { tokenListURIs } from '../../../utils/data/tokenListURIs';
import fetchTokenList from '../../../utils/functions/fetchTokenList';
import { TokenIF, TokenListIF } from '../../../utils/interfaces/exports';

export const useNewTokens = (): void => {
    const tokenListsLocalStorageKey = 'tokenLists';

    // fn to retrieve and parse token lists from local storage
    function getTokenListsFromLS(): TokenListIF[]|null {
        // get entry from local storage
        const entry: string|null = localStorage.getItem(tokenListsLocalStorageKey);
        // declare an output variable
        let output: TokenListIF[] | null;
        // process data retrieved from local storage
        // returns parsed data if persisted data was found
        // returns `null` if no data was found or could not be parsed
        // clears existing data if it could not be parsed
        if (entry) {
            try {
                const data: TokenListIF[] = JSON.parse(entry);
                output = data;
            } catch {
                console.warn('localStorage token lists corrupt, clearing data and re-fetching');
                localStorage.removeItem(tokenListsLocalStorageKey);
                output = null;
            }
        } else {
            output = null;
        }
        // return output value
        return output;
    }

    // hook to memoize token lists in local storage
    const [tokenLists, setTokenLists] = useState<TokenListIF[]>(
        getTokenListsFromLS() ?? []
    );
    
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
                        updatedListsArr.find((list: TokenListIF) => 
                            list.uri === tokenListURIs.ambient
                        ),
                        ...updatedListsArr.filter((list: TokenListIF) => 
                        list.uri !== tokenListURIs.ambient
                    )
                    ];
                    // send array of token lists to local state
                    setTokenLists(sequencedLists);
                    // send array of tiken lists to local storage
                    localStorage.setItem(
                        tokenListsLocalStorageKey, JSON.stringify(sequencedLists)
                    );
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
};
