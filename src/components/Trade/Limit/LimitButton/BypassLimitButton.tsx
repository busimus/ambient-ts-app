import styles from './BypassLimitButton.module.css';
import {
    CircleLoader,
    CircleLoaderCompleted,
    CircleLoaderFailed,
} from '../../../Global/LoadingAnimations/CircleLoader/CircleLoader';
import { TokenPairIF } from '../../../../utils/interfaces/TokenPairIF';
import WaitingConfirmation from '../../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionDenied from '../../../Global/TransactionDenied/TransactionDenied';
import TransactionException from '../../../Global/TransactionException/TransactionException';
import TransactionSubmitted from '../../../Global/TransactionSubmitted/TransactionSubmitted';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import TransactionFailed from '../../../../Global/TransactionFailed/TransactionFailed';
import { useState, Dispatch, SetStateAction } from 'react';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { CrocImpact } from '@crocswap-libs/sdk';

interface propsIF {
    newLimitOrderTransactionHash: string;
    tokenPair: TokenPairIF;
    txErrorCode: string;
    txErrorMessage: string;
    showConfirmation: boolean;
    setShowBypassConfirm: Dispatch<SetStateAction<boolean>>;
    resetConfirmation: () => void;
    slippageTolerancePercentage: number;
    effectivePrice: number;
    isSellTokenBase: boolean;
    bypassConfirm: boolean;
    toggleBypassConfirm: (item: string, pref: boolean) => void;
    sellQtyString: string;
    buyQtyString: string;
    setShowBypassConfirmButton: Dispatch<SetStateAction<string>>;
    showBypassConfirmButton: boolean;
    tokenAInputQty: string;
    tokenBInputQty: string;
}
export default function BypassLimitButton(props: propsIF) {
    const receiptData = useAppSelector((state) => state.receiptData);
    const {
        newLimitOrderTransactionHash,
        txErrorCode,
        tokenAInputQty,
        tokenBInputQty,
        tokenPair,
        resetConfirmation,
        setShowBypassConfirm,
        setShowBypassConfirmButton,
    } = props;

    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode === 'CALL_EXCEPTION';
    const isGasLimitException = txErrorCode === 'UNPREDICTABLE_GAS_LIMIT';
    const isInsufficientFundsException = txErrorCode === 'INSUFFICIENT_FUNDS';
    const transactionApproved = newLimitOrderTransactionHash !== '';

    // const isTransactionDenied =
    //     txErrorCode === 4001 &&
    //     txErrorMessage === 'MetaMask Tx Signature: User denied transaction signature.';
    const sellTokenQty = (document.getElementById('sell-limit-quantity') as HTMLInputElement)
        ?.value;
    const buyTokenQty = (document.getElementById('buy-limit-quantity') as HTMLInputElement)?.value;

    const sellTokenData = tokenPair.dataTokenA;

    const buyTokenData = tokenPair.dataTokenB;

    const confirmSendMessage = (
        <WaitingConfirmation
            content={` Submitting Limit Order to Swap ${sellTokenQty} ${
                sellTokenData.symbol
            } for ${buyTokenQty} ${
                buyTokenData.symbol
            }. Please check the ${'Metamask'} extension in your browser for notifications.`}
        />
    );
    const transactionDenied = <TransactionDenied resetConfirmation={resetConfirmation} />;
    const transactionFailed = <p>Transaction Failed</p>;

    const transactionException = <TransactionException resetConfirmation={resetConfirmation} />;

    const lastReceipt =
        receiptData?.sessionReceipts.length > 0
            ? JSON.parse(receiptData.sessionReceipts[receiptData.sessionReceipts.length - 1])
            : null;

    const isLastReceiptSuccess = lastReceipt?.status === 1;

    const transactionSubmitted = (
        <TransactionSubmitted
            hash={newLimitOrderTransactionHash}
            tokenBSymbol={buyTokenData.symbol}
            tokenBAddress={buyTokenData.address}
            tokenBDecimals={buyTokenData.decimals}
            tokenBImage={buyTokenData.logoURI}
        />
    );

    const confirmationDisplay =
        isTransactionException || isGasLimitException || isInsufficientFundsException
            ? transactionException
            : isTransactionDenied
            ? transactionDenied
            : transactionApproved
            ? transactionSubmitted
            : lastReceipt && !isLastReceiptSuccess
            ? transactionFailed
            : confirmSendMessage;

    const buttonColor =
        isTransactionException || isGasLimitException || isInsufficientFundsException
            ? 'orange'
            : isTransactionDenied || (lastReceipt && !isLastReceiptSuccess)
            ? 'var(--negative)'
            : transactionApproved
            ? 'var(--positive)'
            : 'var(--text-highlight-dark)';

    const animationDisplay =
        isTransactionException || isGasLimitException || isInsufficientFundsException ? (
            <CircleLoaderFailed size='30px' />
        ) : isTransactionDenied || (lastReceipt && !isLastReceiptSuccess) ? (
            <CircleLoaderFailed size='30px' />
        ) : transactionApproved ? (
            <CircleLoaderCompleted size='30px' />
        ) : (
            <CircleLoader size='30px' />
        );

    const buttonText =
        isTransactionException || isGasLimitException || isInsufficientFundsException
            ? 'Transaction Exception'
            : isTransactionDenied
            ? 'Transaction Denied'
            : lastReceipt && !isLastReceiptSuccess
            ? 'Transaction Failed'
            : transactionApproved
            ? 'Transaction Submitted'
            : `Submitting Limit Order to swap ${tokenAInputQty} ${sellTokenData.symbol} for ${tokenBInputQty} ${buyTokenData.symbol}`;

    const [showExtraInfo, setShowExtraInfo] = useState(false);

    return (
        <section className={styles.container}>
            <div className={styles.button_container}>
                <button
                    className={styles.button_content}
                    onClick={() => setShowExtraInfo(!showExtraInfo)}
                >
                    <div style={{ color: buttonColor }}>
                        {animationDisplay}
                        {buttonText}
                    </div>
                    {showExtraInfo ? <RiArrowUpSLine size={20} /> : <RiArrowDownSLine size={20} />}
                </button>

                {showExtraInfo && (
                    <section className={styles.extra_info_container}>{confirmationDisplay}</section>
                )}
                <span className={styles.close_icon_container}>
                    <button onClick={() => setShowBypassConfirm(false)}>
                        Submit another transaction
                    </button>
                </span>
            </div>
        </section>
    );
}
