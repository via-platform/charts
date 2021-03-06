const {ema, prop} = require('via-script');

module.exports = {
    name: 'ema',
    title: 'Exponential Moving Average',
    description: 'An n-period exponential moving average.',
    abbreviation: 'EMA',
    decimals: chart => chart.market ? chart.market.precision.price : 0,
    components: {
        ema: {
            title: 'EMA',
            type: 'plot',
            parameters: {
                color: '#f1c40f',
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
            max: 200,
            step: 1,
            default: 9,
            legend: true
        }
    },
    calculate: ({series, parameters, draw}) => {
        draw('ema', ema(prop(series, parameters.property), parameters.length));
    }
}