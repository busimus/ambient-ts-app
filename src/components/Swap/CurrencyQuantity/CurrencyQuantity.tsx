import {
    ChangeEvent,
    Dispatch,
    memo,
    SetStateAction,
    useEffect,
    useState,
} from 'react';
import useDebounce from '../../../App/hooks/useDebounce';
import { TokenIF } from '../../../utils/interfaces/exports';
import styles from './CurrencyQuantity.module.css';
import Spinner from '../../Global/Spinner/Spinner';
import { decimalNumRegEx } from '../../../utils/regex/exports';

interface propsIF {
    disable?: boolean;
    fieldId: string;
    value: string;
    handleChangeEvent: (evt: ChangeEvent<HTMLInputElement>) => void;
    setSellQtyString: Dispatch<SetStateAction<string>>;
    setBuyQtyString: Dispatch<SetStateAction<string>>;
    thisToken: TokenIF;
    setDisableReverseTokens: Dispatch<SetStateAction<boolean>>;
    setIsSellLoading: Dispatch<SetStateAction<boolean>>;
    setIsBuyLoading: Dispatch<SetStateAction<boolean>>;
    isLoading: boolean;
}

function CurrencyQuantity(props: propsIF) {
    const {
        value,
        thisToken,
        disable,
        fieldId,
        handleChangeEvent,
        setSellQtyString,
        setBuyQtyString,
        setDisableReverseTokens,
        setIsBuyLoading,
        setIsSellLoading,
        isLoading,
    } = props;

    const [displayValue, setDisplayValue] = useState<string>('');

    const [lastEvent, setLastEvent] = useState<
        ChangeEvent<HTMLInputElement> | undefined
    >();

    useEffect(() => {
        const valueWithLeadingZero = value.startsWith('.')
            ? '0' + value
            : value;
        setDisplayValue(valueWithLeadingZero);
    }, [value]);

    // Let input rest 3/4 of a second before triggering an update
    const debouncedLastEvent = useDebounce(lastEvent, 750);

    useEffect(() => {
        if (debouncedLastEvent) handleChangeEvent(debouncedLastEvent);
    }, [debouncedLastEvent]);

    const handleEventLocal = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        const inputValue = value.startsWith('.') ? '0' + value : value;
        if (fieldId === 'sell') {
            setBuyQtyString('');
            if (inputValue) {
                setIsBuyLoading(true);
                setSellQtyString(inputValue);
            }
            value || setIsBuyLoading(false);
        } else if (fieldId === 'buy') {
            setSellQtyString('');
            if (inputValue) {
                setIsSellLoading(true);
                setBuyQtyString(inputValue);
            }
            value || setIsSellLoading(false);
        }

        setDisplayValue(inputValue);
        setDisableReverseTokens(true);
        setLastEvent(event);
    };

    const precisionOfInput = (inputString: string) => {
        if (inputString.includes('.')) {
            return inputString.split('.')[1].length;
        }
        return 0;
    };

    const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
        const targetValue = event.target.value.replace(',', '.');
        const isPrecisionGreaterThanDecimals =
            precisionOfInput(targetValue) > thisToken.decimals;
        const isUserInputValid = true;
        if (isUserInputValid && !isPrecisionGreaterThanDecimals) {
            let valueWithDecimal = targetValue;
            if (valueWithDecimal.includes(',')) {
                const parts = valueWithDecimal.split(',');
                const lastPart = parts.pop();
                const firstPart = parts.join('');
                valueWithDecimal = `${firstPart}.${lastPart}`;
            }
            handleEventLocal({
                ...event,
                target: { ...event.target, value: valueWithDecimal },
            });
        }
    };

    const ariaLive = fieldId === 'sell' ? 'polite' : 'off';

    const progressDisplay = (
        <div className={styles.circular_progress}>
            <Spinner size={24} bg='var(--dark2)' weight={2} />
        </div>
    );
    return (
        <div className={`${styles.token_amount} `}>
            {isLoading && progressDisplay}
            <input
                id={`${fieldId}-quantity`}
                className={styles.currency_quantity}
                placeholder={isLoading ? '' : '0.0'}
                tabIndex={0}
                aria-live={ariaLive}
                aria-label={`Enter ${fieldId} amount`}
                onChange={(event) => {
                    handleOnChange(event);
                }}
                value={isLoading ? '' : displayValue}
                type='text'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                pattern={decimalNumRegEx.source}
                disabled={disable}
            />
        </div>
    );
}

export default memo(CurrencyQuantity);
