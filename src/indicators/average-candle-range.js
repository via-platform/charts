const {prop, subtract, sma, wma, ema, rma} = require('via-script');

module.exports = {
    name: 'average-candle-range',
    title: 'Average Candle Range',
    description: 'The moving average of difference between the high and low values in a given period.',
    panel: true,
    decimals: chart => chart.market ? chart.market.precision.price : 0,
    components: {
        average: {
            type: 'plot',
            title: 'Average Candle Range',
            parameters: {
                style: 'line',
                color: '#95a5a6'
            }
        }
    },
    parameters: {
        average: {
            title: 'Average',
            type: 'string',
            enum: [
                {title: 'SMA', value: 'sma'},
                {title: 'EMA', value: 'ema'},
                {title: 'WMA', value: 'wma'},
                {title: 'RMA', value: 'rma'}
            ],
            default: 'sma'
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
        const averages = {sma, ema, wma, rma};
        draw('average', averages[parameters.average](subtract(prop(series, 'price_high'), prop(series, 'price_low')), parameters.length));
    }
};