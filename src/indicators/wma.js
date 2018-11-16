const {prop, wma} = require('via').VS;

module.exports = {
    name: 'wma',
    title: 'Weighted Moving Average',
    description: 'An n-period moving average weighted arithmetically.',
    abbreviation: 'WMA',
    decimals: chart => chart.market ? chart.market.precision.price : 0,
    components: {
        wma: {
            type: 'plot',
            parameters: {
                color: '#FFF',
                style: 'line'
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
        length: {
            title: 'Length',
            type: 'number',
            constraint: x => (x > 1 && x <= 200),
            default: 9,
            legend: true
        }
    },
    calculate: ({series, parameters, draw}) => {
        draw('wma', wma(prop(series, parameters.property), parameters.length));
    }
}