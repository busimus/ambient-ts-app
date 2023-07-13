import { useContext, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import TopPools from '../../components/Global/Analytics/TopPools';
import { AnalyticsContext } from '../../contexts/AnalyticsContext';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { PoolContext } from '../../contexts/PoolContext';
import styled from 'styled-components';

export default function Explore() {
    const cont = useContext(AnalyticsContext);
    const { poolList } = useContext(PoolContext);
    const { crocEnv, chainData } = useContext(CrocEnvContext);

    const getPools = async () => {
        if (crocEnv && poolList.length && cont.pools.all.length === 0) {
            cont.pools.getAll(poolList, crocEnv, chainData.chainId);
            cont.pools.autopoll.disable();
        }
    };

    useEffect(() => {
        cont.pools.autopoll.allowed && getPools();
    }, [crocEnv, chainData.chainId, poolList.length]);

    return (
        <Section>
            <MainWrapper>
                Top Pools on Ambient
                <Button
                    onClick={() => {
                        console.log('woah there');
                        getPools();
                    }}
                >
                    <RefreshIcon />
                </Button>
            </MainWrapper>

            <TopPools allPools={cont.pools.all} chainId={chainData.chainId} />
        </Section>
    );
}

const Section = styled.section`
    background: var(--dark2);
    height: calc(100vh - 56px);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const MainWrapper = styled.p`
    font-size: var(--header1-size);
    line-height: var(--header1-lh);
    color: var(--text1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px;
`;

const Button = styled.button`
    background-color: var(--dark3);
    border-radius: 4px;
    padding: 4px 8px;
    border: none;
    outline: none;
`;

const RefreshIcon = styled(FiRefreshCw)`
    font-size: 18px;
    cursor: pointer;
`;
