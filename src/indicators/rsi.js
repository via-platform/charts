const {rsi, map} = require('via').VS;

module.exports = {
    name: 'rsi',
    title: 'Relative Strength Index',
    description: 'A momentum oscillator that measures the speed and change of price movements.',
    panel: true,
    components: {
        rsi: {
            type: 'plot',
            title: 'RSI',
            parameters: {
                color: '#0000FF',
                style: 'line'
            }
        },
        upper_limit: {
            type: 'horizontal-line',
            title: 'Upper Limit',
            trackable: false,
            parameters: {
                stroke: '#0000FF',
                style: 'dashed'
            }
        },
        lower_limit: {
            type: 'horizontal-line',
            title: 'Lower Limit',
            trackable: false,
            parameters: {
                stroke: '#0000FF',
                style: 'dashed'
            }
        },
        limit_range: {
            type: 'range',
            title: 'Range',
            trackable: false,
            parameters: {
                fill: 'rgba(0, 0, 255, 0.2)',
                style: 'dashed'
            }
        }
    },
    parameters: {
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
    calculate: ({series, parameters, draw}) => {
        draw('limit_range', [parameters.lower_limit, parameters.upper_limit]);
        draw('upper_limit', parameters.upper_limit);
        draw('lower_limit', parameters.lower_limit);
        draw('rsi', rsi(series, parameters.length));
    }
}
