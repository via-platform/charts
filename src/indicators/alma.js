const {alma, prop} = require('via-script');

module.exports = {
    name: 'alma',
    title: 'Arnaud Legoux Moving Average',
    description: 'An n-period moving average using Gaussian weights.',
    abbreviation: 'ALMA',
    decimals: chart => chart.market ? chart.market.precision.price : 0,
    components: {
        alma: {
            title: 'ALMA',
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
            max: 200,
            step: 1,
            default: 9,
            legend: true
        },
        offset: {
            title: 'Offset',
            type: 'number',
            min: 0.1,
            max: 200,
            step: 0.01,
            default: 0.85,
            legend: true
        },
        sigma: {
            title: 'Sigma',
            type: 'number',
            min: 2,
            max: 200,
            step: 1,
            default: 6,
            legend: true
        }
    },
    calculate: ({series, parameters, draw}) => {
        draw('alma', alma(prop(series, parameters.property), parameters.length, parameters.offset, parameters.sigma));
    }
}