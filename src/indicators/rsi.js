const {rsi, map} = require('via').VS;

module.exports = {
    name: 'rsi',
    title: 'Relative Strength Index',
    description: 'A momentum oscillator that measures the speed and change of price movements.',
    panel: true,
    components: {
        rsi: {
            type: 'plot',
            style: {
                color: '#0000FF'
            }
        },
        upper_limit: {
            type: 'hl',
            trackable: false,
            style: {
                color: '#0000FF',
                style: 'dashed'
            }
        },
        lower_limit: {
            type: 'hl',
            trackable: false,
            style: {
                color: '#0000FF',
                style: 'dashed'
            }
        },
        limit_range: {
            type: 'hr',
            trackable: false,
            style: {
                color: 'rgba(0, 0, 255, 0.5)',
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