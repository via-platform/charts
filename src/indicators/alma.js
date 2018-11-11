const {alma, prop} = require('via').VS;

module.exports = {
    name: 'alma',
    title: 'Arnaud Legoux Moving Average',
    description: 'An n-period moving average using Gaussian weights.',
    abbreviation: 'ALMA',
    decimals: chart => chart.market ? chart.market.precision.price : 0,
    components: {
        alma: {
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
            default: 9
        },
        offset: {
            title: 'Offset',
            type: 'number',
            constraint: x => (x > 1 && x <= 200),
            default: 0.85
        },
        sigma: {
            title: 'Sigma',
            type: 'number',
            constraint: x => (x > 1 && x <= 200),
            default: 6
        }
    },
    calculate: ({series, parameters, draw}) => {
        draw('alma', alma(prop(series, parameters.property), parameters.length, parameters.offset, parameters.sigma));
    }
}