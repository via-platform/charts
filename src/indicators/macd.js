const {prop, ema, subtract} = require('via-script');

module.exports = {
    name: 'macd',
    title: 'MACD',
    description: 'Moving Average Convergence / Divergence.',
    decimals: () => 4,
    panel: 'true',
    components: {
        macd: {
            type: 'plot',
            parameters: {
                color: '#4594eb',
                style: 'line'
            }
        },
        signal: {
            type: 'plot',
            parameters: {
                color: '#f39c12',
                style: 'line'
            }
        },
        histogram: {
            type: 'plot',
            parameters: {
                style: 'histogram'
            }
        }
    },
    parameters: {
        property: {
            title: 'Property',
            type: 'string',
            enum: [
                {title: 'Open', value: 'price_open'},
                {title: 'High', value: 'price_high'},
                {title: 'Low', value: 'price_low'},
                {title: 'Close', value: 'price_close'},
                {title: 'High-Low Average', value: 'hl_average'},
                {title: 'OHLC Average', value: 'ohlc_average'}
            ],
            default: 'price_close'
        },
        fast: {
            title: 'Fast Length',
            type: 'number',
            constraint: x => (x >= 1 && x <= 200),
            default: 12,
            legend: true
        },
        slow: {
            title: 'Slow length',
            type: 'number',
            constraint: x => (x >= 1 && x <= 200),
            default: 26,
            legend: true
        },
        smoothing: {
            title: 'Signal Smoothing',
            type: 'number',
            constraint: x => (x > 1 && x <= 200),
            default: 9,
            legend: true
        },
        positive_up: {
            type: 'color',
            default: '#0bd691'
        },
        positive_down: {
            type: 'color',
            default: '#a8dfcc'
        },
        negative_up: {
            type: 'color',
            default: '#ff8a83'
        },
        negative_down: {
            type: 'color',
            default: '#ff3b30'
        }
    },
    calculate: ({series, parameters, draw}) => {
        const property = prop(series, parameters.property);
        const fast = ema(property, parameters.fast);
        const slow = ema(property, parameters.slow);
        const macd = subtract(fast, slow);
        const signal = ema(macd, parameters.smoothing);

        const fill = (value, index, data) => {
            if(index === 0){
                return (data.get(index) >= 0) ? parameters.positive_up : parameters.negative_down;
            }

            if(data.get(index) >= 0){
                return data.get(index) >= data.get(index - 1) ? parameters.positive_up : parameters.positive_down;
            }else{
                return data.get(index) >= data.get(index - 1) ? parameters.negative_up : parameters.negative_down;
            }
        };

        draw('macd', macd);
        draw('signal', signal);
        draw('histogram', subtract(macd, signal), {fill})
    }
}
