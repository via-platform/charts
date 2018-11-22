const {prop, ema, subtract} = require('via-script');

module.exports = {
    name: 'macd',
    title: 'MACD',
    description: 'Moving Average Convergence / Divergence.',
    decimals: () => 4,
    panel: 'true',
    components: {
        macd: {
            title: 'MACD',
            type: 'plot',
            parameters: {
                color: '#4594eb',
                style: 'line'
            }
        },
        signal: {
            title: 'Signal Line',
            type: 'plot',
            parameters: {
                color: '#f39c12',
                style: 'line'
            }
        },
        histogram: {
            title: 'Histogram',
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
            min: 2,
            max: 200,
            step: 1,
            default: 12,
            legend: true
        },
        slow: {
            title: 'Slow length',
            type: 'number',
            min: 2,
            max: 200,
            step: 1,
            default: 26,
            legend: true
        },
        smoothing: {
            title: 'Signal Smoothing',
            type: 'number',
            min: 2,
            max: 200,
            step: 1,
            default: 9,
            legend: true
        },
        positive_up: {
            title: 'Increasing Positive',
            type: 'color',
            default: '#0bd691'
        },
        positive_down: {
            title: 'Decreasing Positive',
            type: 'color',
            default: '#a8dfcc'
        },
        negative_up: {
            title: 'Increasing Negative',
            type: 'color',
            default: '#ff8a83'
        },
        negative_down: {
            title: 'Decreasing Negative',
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
