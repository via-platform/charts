const {rma, wma, ema, sma, tr} = require('via-script');

module.exports = {
    name: 'average-true-range',
    title: 'Average True Range',
    abbreviation: 'ATR',
    description: 'Measures the volatility in a market.',
    decimals: () => 4,
    panel: true,
    components: {
        atr: {
            title: 'Average True Range',
            type: 'plot',
            parameters: {
                color: '#f39c12',
                style: 'line'
            }
        }
    },
    parameters: {
        length: {
            title: 'Length',
            type: 'number',
            min: 2,
            max: 100,
            step: 1,
            default: 14,
            legend: true
        },
        smoothing: {
            title: 'Smoothing',
            type: 'string',
            enum: [
                {title: 'RMA', value: 'rma'},
                {title: 'EMA', value: 'ema'},
                {title: 'SMA', value: 'sma'},
                {title: 'WMA', value: 'wma'}
            ],
            default: 'rma'
        }
    },
    calculate: ({series, parameters, draw}) => {
        if(parameters.smoothing === 'rma') draw('atr', rma(tr(series), parameters.length));
        if(parameters.smoothing === 'ema') draw('atr', ema(tr(series), parameters.length));
        if(parameters.smoothing === 'sma') draw('atr', sma(tr(series), parameters.length));
        if(parameters.smoothing === 'wma') draw('atr', wma(tr(series), parameters.length));
    }
}
