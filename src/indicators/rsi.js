const {rsi} = require('via').VS;

module.exports = {
    name: 'rsi',
    type: 'indicator',
    title: 'Relative Strength Index',
    description: 'A momentum oscillator that measures the speed and change of price movements.',
    components: {
        rsi: {
            type: 'plot',
            default: 'line',
            stroke: '#0000FF'
        },
        upper_limit: {
            type: 'line',
            style: 'dashed',
            stroke: '#0000FF'
        },
        lower_limit: {
            type: 'line',
            style: 'dashed',
            stroke: '#0000FF'
        },
        limit_range: {
            type: 'fill',
            fill: '#0000FF',
            opacity: 0.5
        }
    },
    params: {
        length: {
            title: 'Length',
            type: 'number',
            constraint: x => x => 0 && x <= 100,
            default: 14
        },
        upper_limit: {
            title: 'Upper Limit',
            type: 'integer',
            constraint: x => x => 0 && x <= 100,
            default: 70
        },
        lower_limit: {
            title: 'Lower Limit',
            type: 'integer',
            constraint: x => x => 0 && x <= 100,
            default: 30
        }
    },
    calculate: ({series, params, plot}) => {
        plot('limit_range', [params.lower_limit, params.upper_limit]);
        plot('upper_limit', params.upper_limit);
        plot('lower_limit', params.lower_limit);
        plot('rsi', rsi(series, params.length));
    }
}