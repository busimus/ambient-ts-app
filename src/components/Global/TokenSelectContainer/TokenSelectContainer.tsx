import styles from './TokenSelectContainer.module.css';
import { useState } from 'react';
import TokenSelect from '../TokenSelect/TokenSelect';
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';

interface TokenSelectContainerPropsIF {
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    tokenList?: Array<TokenIF>;
    chainId?: string;
    tokenToUpdate: string;
    closeModal: () => void;
}

export default function TokenSelectContainer(props: TokenSelectContainerPropsIF) {
    const { tokenPair, tokensBank, tokenToUpdate, closeModal } = props;

    console.log(tokenToUpdate);
    const [searchTerm, setSearchTerm] = useState('');

    const searchInput = (
        <div className={styles.search_input}>
            <input
                type='text'
                placeholder='Search name or paste address'
                onChange={(event) => setSearchTerm(event.target.value)}
            />
        </div>
    );

    const tokenListContent = (
        <>
            {tokensBank
                .filter((val) => {
                    if (searchTerm === '') {
                        return val;
                    } else if (
                        val.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        val.symbol.toLowerCase().includes(searchTerm.toLowerCase())
                    ) {
                        return val;
                    }
                })
                .map((token, idx) => {
                    return (
                        <TokenSelect
                            key={idx}
                            icon={token.logoURI}
                            symbol={token.symbol}
                            name={token.name}
                            qty={token.decimals}
                            address={token.address}
                            tokenToUpdate={tokenToUpdate}
                            closeModal={closeModal}
                            tokenPair={tokenPair}
                        />
                    );
                })}
        </>
    );

    return (
        <div className={styles.token_select_container}>
            {searchInput}
            {tokenListContent}
        </div>
    );
}
