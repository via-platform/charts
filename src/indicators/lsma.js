const {linreg, prop} = require('via-script');

module.exports = {
    name: 'lsma',
    title: 'Least Squares Moving Average',
    description: 'A moving average based on a linear regression.',
    abbreviation: 'LSMA',
    decimals: chart => chart.market ? chart.market.precision.price : 0,
    components: {
        lsma: {
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
            constraint: x => (x > 1 && x <= 200),
            default: 25,
            legend: true
        }
    },
    calculate: ({series, parameters, draw}) => {
        draw('lsma', linreg(prop(series, parameters.property), parameters.length));
    }
}