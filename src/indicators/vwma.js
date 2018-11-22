const {vwma} = require('via-script');

module.exports = {
    name: 'vwma',
    title: 'Volume Weighted Moving Average',
    description: 'An n-period moving average weighted by trading volume.',
    abbreviation: 'VWMA',
    decimals: chart => chart.market ? chart.market.precision.price : 0,
    components: {
        vwma: {
            title: 'VWMA',
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
            default: 20,
            legend: true
        }
    },
    calculate: ({series, parameters, draw}) => {
        draw('vwma', vwma(series, parameters.property, parameters.length));
    }
}