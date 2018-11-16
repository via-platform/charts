const {prop, subtract} = require('via').VS;

module.exports = {
    name: 'candle-range',
    title: 'Candle Range',
    description: 'The difference between the high and low values in a given period.',
    panel: true,
    decimals: chart => chart.market ? chart.market.precision.price : 0,
    components: {
        range: {
            type: 'plot',
            title: 'Candle Range',
            parameters: {
                style: 'histogram',
                color: '#AAA'
            }
        }
    },
    parameters: {},
    calculate: ({series, parameters, draw}) => {
        draw('range', subtract(prop(series, 'price_high'), prop(series, 'price_low')));
    }
};