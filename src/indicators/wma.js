const {prop, wma} = require('via-script');

module.exports = {
    name: 'wma',
    title: 'Weighted Moving Average',
    description: 'An n-period moving average weighted arithmetically.',
    abbreviation: 'WMA',
    decimals: chart => chart.market ? chart.market.precision.price : 0,
    components: {
        wma: {
            title: 'WMA',
            type: 'plot',
            parameters: {
                color: '#FFFFFF',
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
            min: 2,
            max: 100,
            step: 1,
            default: 9,
            legend: true
        }
    },
    calculate: ({series, parameters, draw}) => {
        draw('wma', wma(prop(series, parameters.property), parameters.length));
    }
}