import styles from './RangeDetailsSimplify.module.css';
import { PositionIF } from '../../../ambient-utils/types';
import { useProcessRange } from '../../../utils/hooks/useProcessRange';
import { ZERO_ADDRESS } from '../../../ambient-utils/constants';
import { RiExternalLinkLine } from 'react-icons/ri';
import moment from 'moment';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import { memo, useContext } from 'react';
import { FiCopy } from 'react-icons/fi';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { useMediaQuery } from '@material-ui/core';
import { UserDataContext } from '../../../contexts/UserDataContext';
import InfoRow from '../../Global/InfoRow';

interface RangeDetailsSimplifyPropsIF {
    position: PositionIF;
    baseFeesDisplay: string | undefined;
    quoteFeesDisplay: string | undefined;
    isAccountView: boolean;
    updatedPositionApy: number | undefined;
}

// TODO: refactor to using styled-components
function RangeDetailsSimplify(props: RangeDetailsSimplifyPropsIF) {
    const {
        position,
        baseFeesDisplay,
        quoteFeesDisplay,
        isAccountView,
        updatedPositionApy,
    } = props;
    const { userAddress } = useContext(UserDataContext);

    const {
        ensName,
        isDenomBase,
        isBaseTokenMoneynessGreaterOrEqual,
        minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness,
        userNameToDisplay,
        posHashTruncated,
        posHash,
        // blockExplorer,
        isOwnerActiveAccount,
        ownerId,
        usdValue,
        baseTokenSymbol,
        quoteTokenSymbol,
        baseTokenName,
        quoteTokenName,
        baseTokenAddressTruncated,
        quoteTokenAddressTruncated,
        isPositionInRange,
        isAmbient,
        ambientOrMax,
        ambientOrMin,
        width,
        blockExplorer,
        tokenAAddressLowerCase,
        tokenBAddressLowerCase,
        baseDisplayFrontend,
        quoteDisplayFrontend,
        elapsedTimeString,
        elapsedTimeSinceFirstMintString,
    } = useProcessRange(position, userAddress, isAccountView);

    const showFullAddresses = useMediaQuery('(min-width: 768px)');

    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

    const { chainData } = useContext(CrocEnvContext);

    const [_, copy] = useCopyToClipboard();

    function handleOpenWallet() {
        const walletUrl = isOwnerActiveAccount
            ? '/account'
            : `/account/${ownerId}`;
        window.open(walletUrl);
    }

    const aprAmountString = updatedPositionApy
        ? updatedPositionApy >= 1000
            ? updatedPositionApy.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
              }) + '%+'
            : updatedPositionApy.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              }) + '%'
        : undefined;

    function handleCopyPositionHash() {
        copy(posHash.toString());
        openSnackbar(`${posHash.toString()} copied`, 'info');
    }

    function handleOpenBaseAddress() {
        if (tokenAAddressLowerCase && blockExplorer) {
            const adressUrl =
                tokenAAddressLowerCase === ZERO_ADDRESS
                    ? `${blockExplorer}address/${chainData.addrs.dex}`
                    : `${blockExplorer}token/${tokenAAddressLowerCase}`;
            window.open(adressUrl);
        }
    }
    function handleOpenQuoteAddress() {
        if (tokenBAddressLowerCase && blockExplorer) {
            const adressUrl = `${blockExplorer}token/${tokenBAddressLowerCase}`;
            window.open(adressUrl);
        }
    }
    // const txContent = (
    //     <div className={styles.link_row} onClick={handleOpenExplorer}>
    //         <p>{posHashTruncated}</p>
    //         <RiExternalLinkLine />
    //     </div>
    // );

    const posHashContent = (
        <div className={styles.link_row} onClick={handleCopyPositionHash}>
            <p>{posHashTruncated}</p>
            <FiCopy style={{ cursor: 'pointer' }} />
        </div>
    );

    const walletContent = (
        <div
            className={styles.link_row}
            onClick={handleOpenWallet}
            style={{ cursor: 'pointer' }}
        >
            <p style={!ensName ? { fontFamily: 'monospace' } : undefined}>
                {showFullAddresses
                    ? ensName
                        ? ensName
                        : ownerId
                    : userNameToDisplay}
            </p>
            <RiExternalLinkLine />
        </div>
    );

    const baseAddressContent = (
        <div
            onClick={handleOpenBaseAddress}
            className={styles.link_row}
            style={{ cursor: 'pointer' }}
        >
            <p>{baseTokenAddressTruncated}</p>
            <RiExternalLinkLine />
        </div>
    );
    const quoteAddressContent = (
        <div
            onClick={handleOpenQuoteAddress}
            className={styles.link_row}
            style={{ cursor: 'pointer' }}
        >
            <p>{quoteTokenAddressTruncated}</p>
            <RiExternalLinkLine />
        </div>
    );

    const status = isAmbient
        ? 'Ambient'
        : isPositionInRange
        ? 'In Range'
        : 'Out of Range';

    const submissionTime =
        moment(position.timeFirstMint * 1000).format('MM/DD/YYYY HH:mm') +
        ' ' +
        '(' +
        elapsedTimeSinceFirstMintString +
        ' ago)';

    const updateTime =
        moment(position.latestUpdateTime * 1000).format('MM/DD/YYYY HH:mm') +
        ' ' +
        '(' +
        elapsedTimeString +
        ' ago)';

    const infoContent = [
        {
            title: 'Position Type ',
            content: isAmbient ? 'Ambient' : 'Range',
            explanation: 'e.g. Range, Ambient ',
        },
        {
            title: 'Submit Time ',
            content: submissionTime,
            explanation:
                'The time the owner first added liquidity at these prices',
        },
        {
            title: 'Position Slot ID ',
            content: posHashContent,
            // eslint-disable-next-line quotes
            explanation: "A unique identifier for this user's position",
        },

        {
            title: 'Wallet ',
            content: walletContent,
            explanation: 'The account of the position owner',
        },
        {
            title: 'Status ',
            content: status,
            explanation: 'e.g. Ambient / In Range / Out of Range',
        },

        {
            title: 'Token 1 ',
            content: baseTokenSymbol + ' - ' + baseTokenName,
            explanation: 'Token #1 in the token pair',
        },

        {
            title: 'Token 1 Address ',
            content: baseAddressContent,
            explanation: 'Address of token #1 in the token pair',
        },

        {
            title: 'Token 1 Qty ',
            content: baseDisplayFrontend + ' ' + baseTokenSymbol,
            explanation: 'The quantity of token #1 in the token pair',
        },

        {
            title: 'Token 2 ',
            content: quoteTokenSymbol + ' - ' + quoteTokenName,
            explanation: 'Token #2 in the token pair',
        },

        {
            title: 'Token 2 Address ',
            content: quoteAddressContent,
            explanation: 'Address of token #2 in the token pair',
        },

        {
            title: 'Token 2 Qty ',
            content: quoteDisplayFrontend + ' ' + quoteTokenSymbol,
            explanation: 'The quantity of token #2 in the token pair',
        },
        {
            title: 'Range Min ',
            content: isAmbient
                ? ambientOrMin
                : isAccountView
                ? isBaseTokenMoneynessGreaterOrEqual
                    ? `1 ${quoteTokenSymbol} = ${minRangeDenomByMoneyness} ${baseTokenSymbol}`
                    : `1 ${baseTokenSymbol} = ${minRangeDenomByMoneyness} ${quoteTokenSymbol}`
                : isDenomBase
                ? `1 ${baseTokenSymbol} = ${ambientOrMin} ${quoteTokenSymbol}`
                : `1 ${quoteTokenSymbol} = ${ambientOrMin} ${baseTokenSymbol}`,
            explanation: 'The low price boundary of the range',
        },
        {
            title: 'Range Max ',
            content: isAmbient
                ? ambientOrMax
                : isAccountView
                ? isBaseTokenMoneynessGreaterOrEqual
                    ? `1 ${quoteTokenSymbol} = ${maxRangeDenomByMoneyness} ${baseTokenSymbol}`
                    : `1 ${baseTokenSymbol} = ${maxRangeDenomByMoneyness} ${quoteTokenSymbol}`
                : isDenomBase
                ? `1 ${baseTokenSymbol} = ${ambientOrMax} ${quoteTokenSymbol}`
                : `1 ${quoteTokenSymbol} = ${ambientOrMax} ${baseTokenSymbol}`,
            explanation: 'The upper price boundary of the range',
        },

        {
            title: 'Width ',
            content: isAmbient ? 'Infinite' : width + '%',
            explanation: 'The geometric range width',
        },
        {
            title: 'APR',
            content: aprAmountString || '',
            explanation:
                'The estimated APR of the position based on rewards earned',
        },
        {
            title: 'Value ',
            content: usdValue,
            explanation: 'The approximate US dollar value of the limit order',
        },
        ...(!isAmbient
            ? [
                  {
                      title: 'Token 1 Unclaimed Rewards ',
                      content: baseFeesDisplay + ' ' + baseTokenSymbol,
                      explanation: 'Token #1 unclaimed rewards',
                  },
                  {
                      title: 'Token 2 Unclaimed Rewards ',
                      content: quoteFeesDisplay + ' ' + quoteTokenSymbol,
                      explanation: 'Token #2 unclaimed rewards',
                  },
                  {
                      title: 'Low Tick ',
                      content: position.bidTick.toString(),
                      explanation:
                          'The low price boundary represented in a geometric scale',
                  },
                  {
                      title: 'High Tick ',
                      content: position.askTick.toString(),
                      explanation:
                          'The upper price boundary represented in a geometric scale',
                  },
              ]
            : []),
    ];

    if (submissionTime !== updateTime) {
        infoContent.splice(2, 0, {
            title: 'Update Time ',
            content: updateTime,
            explanation: 'Time the owner last updated the limit at this price',
        });
    }

    return (
        <div className={styles.tx_details_container}>
            <div className={styles.main_container}>
                <section>
                    {infoContent
                        .slice(0, infoContent.length / 2)
                        .map((info, idx) => (
                            <InfoRow
                                key={info.title + idx}
                                title={info.title}
                                content={info.content}
                                explanation={info.explanation}
                            />
                        ))}
                </section>

                <section>
                    {infoContent
                        .slice(infoContent.length / 2, infoContent.length)
                        .map((info, idx) => (
                            <InfoRow
                                key={info.title + idx}
                                title={info.title}
                                content={info.content}
                                explanation={info.explanation}
                            />
                        ))}
                </section>
            </div>
        </div>
    );
}

export default memo(RangeDetailsSimplify);
