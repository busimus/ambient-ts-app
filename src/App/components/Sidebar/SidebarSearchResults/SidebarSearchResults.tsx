import { Dispatch, SetStateAction, ReactNode } from 'react';
import { PositionIF, TokenIF, TokenPairIF, TempPoolIF, TransactionIF } from '../../../../utils/interfaces/exports';
import styles from './SidebarSearchResults.module.css';
import PoolsSearchResults from './PoolsSearchResults/PoolsSearchResults';
import PositionsSearchResults from './PositionsSearchResults/PositionsSearchResults';
import OrdersSearchResults from './OrdersSearchResults/OrdersSearchResults';
import TxSearchResults from './TxSearchResults/TxSearchResults';
import { PoolStatsFn } from '../../../functions/getPoolStats';

interface propsIF {
    searchedPools: TempPoolIF[];
    searchInput: ReactNode;
    exampleLoading: boolean;
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    tokenPair: TokenPairIF;
    chainId: string;
    isConnected: boolean;
    cachedPoolStatsFetch: PoolStatsFn;
    searchedPositions: PositionIF[];
    isDenomBase: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    txsByUser: TransactionIF[];
}

export default function SidebarSearchResults(props: propsIF) {
    const {
        searchedPools,
        exampleLoading,
        searchInput,
        getTokenByAddress,
        tokenPair,
        chainId,
        isConnected,
        cachedPoolStatsFetch,
        searchedPositions,
        isDenomBase,
        setOutsideControl,
        setSelectedOutsideTab,
        setCurrentPositionActive,
        setIsShowAllEnabled,
        txsByUser
    } = props;

    return (
        <div className={styles.container}>
            <div className={styles.search_result_title}>Search Results</div>
            <PoolsSearchResults
                searchedPools={searchedPools}
                getTokenByAddress={getTokenByAddress}
                tokenPair={tokenPair}
                chainId={chainId}
                cachedPoolStatsFetch={cachedPoolStatsFetch}
            />
            {isConnected && (
                <>
                    <PositionsSearchResults
                        searchedPositions={searchedPositions}
                        isDenomBase={isDenomBase}
                        setOutsideControl={setOutsideControl}
                        setSelectedOutsideTab={setSelectedOutsideTab}
                        setCurrentPositionActive={setCurrentPositionActive}
                        setIsShowAllEnabled={setIsShowAllEnabled}
                    />
                    {false && <OrdersSearchResults loading={exampleLoading} searchInput={searchInput} />}
                    <TxSearchResults
                        loading={exampleLoading}
                        searchInput={searchInput}
                        txsByUser={txsByUser}
                    />
                </>
            )}
        </div>
    );
}
