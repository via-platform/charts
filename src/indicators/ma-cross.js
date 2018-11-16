const {sma, prop, trim, iff, cross} = require('via').VS;

module.exports = {
    name: 'ma-cross',
    title: 'Moving Average Cross',
    description: 'The crossing points of a fast and slow moving average.',
    abbreviation: 'MA Cross',
    decimals: chart => chart.market ? chart.market.precision.price : 0,
    components: {
        fast: {
            type: 'plot',
            parameters: {
                color: '#3498db',
                style: 'line'
            }
        },
        slow: {
            type: 'plot',
            parameters: {
                color: '#f39c12',
                style: 'line'
            }
        },
        cross: {
            type: 'plot',
            parameters: {
                color: '#ecf0f1',
                style: 'cross',
                width: 2.5
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
            constraint: x => (x > 1 && x <= 200),
            default: 9,
            legend: true
        },
        slow: {
            title: 'Slow Length',
            type: 'number',
            constraint: x => (x > 1 && x <= 200),
            default: 21,
            legend: true
        }
    },
    calculate: ({series, parameters, draw}) => {
        const property = prop(series, parameters.property);
        const fast = sma(property, parameters.fast);
        const slow = sma(property, parameters.slow);

        draw('fast', fast);
        draw('slow', slow);
        draw('cross', trim(iff(cross(fast, slow), fast, NaN)));
    }
}