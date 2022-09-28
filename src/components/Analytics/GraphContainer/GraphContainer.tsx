import styles from './GraphContainer.module.css';
import { useProtocolChartData, useProtocolData } from '../../../state/protocol/hooks';
import { useEffect, useMemo, useState } from 'react';
import {
    formatAmount,
    //  formatDollarAmount
} from '../../../utils/numbers';
import AreaChart from '../../Global/Charts/AreaChart';
import BarChart from '../../Global/Charts/BarChart';
import { useTransformedTvlData, useTransformedVolumeData } from '../../../hooks/chart';
import logo from '../../../assets/images/logos/ambient_logo.svg';
import moment from 'moment';
import { ChartDataTimeframe } from '../../../hooks/ChartDataTimeframe';
import { getDexStatsFresh } from '../../../utils/functions/getDexStats';
import {
    getDexTvlSeries,
    getDexVolumeSeries,
    ITvlSeriesData,
    IVolumeSeriesData,
    seriesDatum,
} from '../../../utils/functions/getDexSeriesData';

export default function GraphContainer() {
    const [protocolData] = useProtocolData();
    const [volumeHover, setVolumeHover] = useState<number | undefined>();
    const [liquidityHover, setLiquidityHover] = useState<number | undefined>();
    const [chartData] = useProtocolChartData();

    const [valueTvl, setValueTvl] = useState<number | undefined>();

    const [valueVolume, setValueVolume] = useState<number | undefined>();

    const [valueTvlDate, setValueTvlDate] = useState<string | undefined>();

    const [valueVolumeDate, setValueVolumeDate] = useState<string | undefined>();
    const [tempData, setTempData] = useState(chartData);

    const [totalTvlString, setTotalTvlString] = useState<string | undefined>();
    const [totalVolumeString, setTotalVolumeString] = useState<string | undefined>();
    const [totalFeesString, setTotalFeesString] = useState<string | undefined>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [tvlSeriesData, setTvlSeriesData] = useState<ITvlSeriesData | undefined>();
    // const [tvlSeriesData, setTvlSeriesData] = useState<tvlSeriesData | undefined>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [volumeSeriesData, setVolumeSeriesData] = useState<IVolumeSeriesData | undefined>();
    // const [volumeSeriesData, setVolumeSeriesData] = useState<volumeSeriesData | undefined>();

    useEffect(() => {
        console.log({ tvlSeriesData });
    }, [tvlSeriesData]);

    useEffect(() => {
        console.log({ volumeSeriesData });
    }, [volumeSeriesData]);

    useEffect(() => {
        getDexStatsFresh()
            .then((dexStats) => {
                if (dexStats.tvl) setTotalTvlString('$' + formatAmount(dexStats.tvl));
                if (dexStats.volume) setTotalVolumeString('$' + formatAmount(dexStats.volume));
                if (dexStats.fees) setTotalFeesString('$' + formatAmount(dexStats.fees));
            })
            .catch(console.log);

        getDexTvlSeries()
            .then((tvlSeriesData) => {
                setTvlSeriesData(tvlSeriesData);
            })
            .catch(console.log);

        getDexVolumeSeries()
            .then((volumeSeriesData) => {
                setVolumeSeriesData(volumeSeriesData);
            })
            .catch(console.log);
    }, []);

    const formattedTvlData = useMemo(() => {
        if (tvlSeriesData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return tvlSeriesData.series.map((item: seriesDatum) => {
                return {
                    time: new Date(item.time * 1000),
                    value: item.total,
                };
            });
        } else {
            return [];
        }
    }, [tvlSeriesData]);

    const formattedVolumeData = useMemo(() => {
        if (volumeSeriesData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return volumeSeriesData.series.map((item: seriesDatum) => {
                return {
                    time: new Date(item.time * 1000),
                    value: item.total,
                };
            });
        } else {
            return [];
        }
    }, [volumeSeriesData]);

    // const oneDayVolumeData = useTransformedVolumeData(
    //     chartData?.filter(
    //         (item) =>
    //             moment(item.date * 1000).format('YYYY-MM-DD') ===
    //             moment(new Date()).format('YYYY-MM-DD'),
    //     ),
    //     ChartDataTimeframe.oneDay,
    // );
    // const oneMonthVolumeData = useTransformedVolumeData(
    //     chartData?.filter(
    //         (item) =>
    //             moment(new Date()).subtract(1, 'M').format('YYYY-MM-DD') <=
    //                 moment(item.date * 1000).format('YYYY-MM-DD') ||
    //             moment(new Date()).format('YYYY-MM-DD') <=
    //                 moment(item.date * 1000).format('YYYY-MM-DD'),
    //     ),
    //     ChartDataTimeframe.oneMonth,
    // );

    // const sixMonthVolumeData = useTransformedVolumeData(
    //     chartData?.filter(
    //         (item) =>
    //             moment(new Date()).subtract(6, 'M').format('YYYY-MM-DD') <=
    //                 moment(item.date * 1000).format('YYYY-MM-DD') ||
    //             moment(new Date()).format('YYYY-MM-DD') <=
    //                 moment(item.date * 1000).format('YYYY-MM-DD'),
    //     ),
    //     ChartDataTimeframe.sixMonth,
    // );

    // const oneYearVolumeData = useTransformedVolumeData(
    //     chartData?.filter(
    //         (item) =>
    //             moment(new Date()).subtract(12, 'M').format('YYYY-MM-DD') <=
    //                 moment(item.date * 1000).format('YYYY-MM-DD') ||
    //             moment(new Date()).format('YYYY-MM-DD') <=
    //                 moment(item.date * 1000).format('YYYY-MM-DD'),
    //     ),
    //     ChartDataTimeframe.oneYear,
    // );

    //  const sixMonthVolumeData = useTransformedVolumeData(
    //     chartData,
    //     ChartDataTimeframe.oneYear,
    // );

    const [volumeWindow, setVolumeWindow] = useState(ChartDataTimeframe.all);

    // const volumeData = useTransformedVolumeData(tempData, volumeWindow);

    // const tvlData = useTransformedTvlData(tempData, volumeWindow);

    useEffect(() => {
        if (volumeHover === undefined && protocolData) {
            setVolumeHover(protocolData.volumeUSD);
        }
        setTempData(chartData);
    }, [protocolData, volumeHover]);

    useEffect(() => {
        if (liquidityHover === undefined && protocolData) {
            setLiquidityHover(protocolData.tvlUSD);
        }
    }, [liquidityHover, protocolData]);

    // const formattedTvlData = useMemo(() => {
    //     if (tvlData) {
    //         // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //         return tvlData.map((day: any) => {
    //             return {
    //                 time: new Date(day.time), // new Date(day.time * 1000),
    //                 value: day.value,
    //             };
    //         });
    //     } else {
    //         return [];
    //     }
    // }, [tvlData]);

    const setChartDataValues = (_volumeWindow: ChartDataTimeframe) => {
        setVolumeWindow(_volumeWindow);
        switch (_volumeWindow) {
            case ChartDataTimeframe.oneDay:
                setTempData(
                    chartData?.filter(
                        (item) =>
                            moment(item.date * 1000).format('YYYY-MM-DD') ===
                            moment(new Date()).format('YYYY-MM-DD'),
                    ),
                );
                break;

            case ChartDataTimeframe.oneMonth:
                setTempData(
                    chartData?.filter(
                        (item) =>
                            moment(new Date()).subtract(1, 'M').format('YYYY-MM-DD') <=
                                moment(item.date * 1000).format('YYYY-MM-DD') ||
                            moment(new Date()).format('YYYY-MM-DD') <=
                                moment(item.date * 1000).format('YYYY-MM-DD'),
                    ),
                );
                break;

            case ChartDataTimeframe.sixMonth:
                setTempData(
                    chartData?.filter(
                        (item) =>
                            moment(new Date()).subtract(6, 'M').format('YYYY-MM-DD') <=
                                moment(item.date * 1000).format('YYYY-MM-DD') ||
                            moment(new Date()).format('YYYY-MM-DD') <=
                                moment(item.date * 1000).format('YYYY-MM-DD'),
                    ),
                );
                break;

            case ChartDataTimeframe.oneYear:
                setTempData(
                    chartData?.filter(
                        (item) =>
                            moment(new Date()).subtract(12, 'M').format('YYYY-MM-DD') <=
                                moment(item.date * 1000).format('YYYY-MM-DD') ||
                            moment(new Date()).format('YYYY-MM-DD') <=
                                moment(item.date * 1000).format('YYYY-MM-DD'),
                    ),
                );
                break;

            default:
                setTempData(chartData);
        }
    };
    const timeFrame = (
        <div className={styles.time_frame_container}>
            <div className={styles.title}>Ambient Analytics</div>
            <div className={styles.right_side}>
                <span>Timeframe</span>
                <button
                    style={{
                        backgroundColor:
                            volumeWindow === ChartDataTimeframe.oneDay ? '#7371FC' : '',
                        cursor: 'pointer',
                    }}
                    onClick={() => setChartDataValues(ChartDataTimeframe.oneDay)}
                >
                    1d
                </button>
                <button
                    style={{
                        backgroundColor:
                            volumeWindow === ChartDataTimeframe.oneMonth ? '#7371FC' : '',
                        cursor: 'pointer',
                    }}
                    onClick={() => setChartDataValues(ChartDataTimeframe.oneMonth)}
                >
                    1M
                </button>
                <button
                    style={{
                        backgroundColor:
                            volumeWindow === ChartDataTimeframe.sixMonth ? '#7371FC' : '',
                        cursor: 'pointer',
                    }}
                    onClick={() => setChartDataValues(ChartDataTimeframe.sixMonth)}
                >
                    6M{' '}
                </button>
                <button
                    style={{
                        backgroundColor:
                            volumeWindow === ChartDataTimeframe.oneYear ? '#7371FC' : '',
                        cursor: 'pointer',
                    }}
                    onClick={() => setChartDataValues(ChartDataTimeframe.oneYear)}
                >
                    1Y
                </button>
                <button
                    style={{
                        backgroundColor: volumeWindow === ChartDataTimeframe.all ? '#7371FC' : '',
                        cursor: 'pointer',
                    }}
                    onClick={() => setChartDataValues(ChartDataTimeframe.all)}
                >
                    All
                </button>
            </div>
        </div>
    );

    const loading = (
        <div className={styles.animatedImg}>
            <img src={logo} width={110} alt='logo' />
        </div>
    );

    const graphData = (
        <div className={styles.graph_data}>
            <div className={styles.graph_container}>
                <div className={styles.title}>Total Value Locked</div>

                <label className={styles.v4m1wv}>
                    {valueTvl ? '$' + formatAmount(valueTvl) : '-'}
                </label>
                <br></br>
                <label className={styles.eJnjNO}>
                    {valueTvlDate ? valueTvlDate + ' (UTC) ' : '-'}
                </label>
                <div className={styles.chart_container}>
                    {' '}
                    {formattedTvlData && formattedTvlData.length > 0 ? (
                        <AreaChart
                            data={formattedTvlData}
                            valueTvl={valueTvl}
                            valueTvlDate={valueTvlDate}
                            setValueTvl={setValueTvl}
                            setValueTvlDate={setValueTvlDate}
                        />
                    ) : (
                        <>{loading}</>
                    )}
                </div>
            </div>
            <div className={styles.graph_container}>
                <div className={styles.title}>Volume 24H</div>
                <label className={styles.eJnjNO}>
                    {valueVolume ? '$' + formatAmount(valueVolume) : '-'}
                </label>
                <br></br>
                <label className={styles.eJnjNO}>
                    {valueVolumeDate ? valueVolumeDate + ' (UTC) ' : '-'}
                </label>
                <div className={styles.chart_container}>
                    {formattedVolumeData && formattedVolumeData.length > 0 ? (
                        <BarChart
                            data={formattedVolumeData}
                            valueVolume={valueVolume}
                            valueVolumeDate={valueVolumeDate}
                            setValueVolume={setValueVolume}
                            setValueVolumeDate={setValueVolumeDate}
                            snapType={
                                volumeWindow === ChartDataTimeframe.oneDay
                                    ? 'days'
                                    : volumeWindow === ChartDataTimeframe.oneMonth
                                    ? 'months'
                                    : 'weeks'
                            }
                        />
                    ) : (
                        <>{loading}</>
                    )}
                </div>
            </div>
        </div>
    );

    const analyticsInfo = (
        <div className={styles.info_container}>
            <div className={styles.info_content}>
                <div className={styles.info_title}>Total TVL</div>
                <div className={styles.info_value}>
                    {totalTvlString || '...'}
                    {/* {formatDollarAmount(liquidityHover, 2, true)}{' '} */}
                </div>
            </div>

            <div className={styles.info_content}>
                <div className={styles.info_title}>24h Volume</div>
                <div className={styles.info_value}>{totalVolumeString || '...'}</div>
                {/* <div className={styles.info_value}>{formatDollarAmount(volumeHover, 2)}</div> */}
            </div>

            <div className={styles.info_content}>
                <div className={styles.info_title}>24h Fees</div>
                <div className={styles.info_value}>{totalFeesString || '...'}</div>
                {/* <div className={styles.info_value}>{formatDollarAmount(protocolData?.feesUSD)}</div> */}
            </div>
        </div>
    );
    return (
        <div className={styles.GraphContainers}>
            {timeFrame}
            {graphData}
            {analyticsInfo}
        </div>
    );
}
