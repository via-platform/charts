const {ema, prop, add, subtract, multiply} = require('via-script');

module.exports = {
    name: 'tema',
    title: 'Triple Exponential Moving Average',
    description: 'An triple n-period exponential moving average.',
    abbreviation: 'TEMA',
    decimals: chart => chart.market ? chart.market.precision.price : 0,
    components: {
        tema: {
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
            default: 9,
            legend: true
        }
    },
    calculate: ({series, parameters, draw}) => {
        const single_ema = ema(prop(series, parameters.property), parameters.length);
        const double_ema = ema(single_ema, parameters.length);
        const triple_ema = ema(double_ema, parameters.length);

        draw('tema', add(subtract(multiply(single_ema, 3), multiply(double_ema, 3)), triple_ema));
    }
}