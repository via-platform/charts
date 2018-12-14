const {rsi, map} = require('via-script');

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
                color: '#4594eb',
                style: 'line',
                width: 1.5
            }
        },
        upper_limit: {
            type: 'horizontal-line',
            title: 'Upper Limit',
            trackable: false,
            parameters: {
                stroke: '#4594eb',
                opacity: 50,
                style: 'dashed'
            }
        },
        lower_limit: {
            type: 'horizontal-line',
            title: 'Lower Limit',
            trackable: false,
            parameters: {
                stroke: '#4594eb',
                opacity: 50,
                style: 'dashed'
            }
        },
        limit_range: {
            type: 'horizontal-range',
            title: 'Range',
            trackable: false,
            parameters: {
                fill: '#4594eb',
                opacity: 10
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
        upper_limit: {
            title: 'Upper Limit',
            type: 'number',
            min: 0,
            max: 100,
            step: 1,
            default: 70
        },
        lower_limit: {
            title: 'Lower Limit',
            type: 'number',
            min: 0,
            max: 100,
            step: 1,
            default: 30
        }
    },
    decimals: () => 4,
    calculate: ({series, parameters, draw}) => {
        draw('limit_range', [parameters.lower_limit, parameters.upper_limit]);
        draw('upper_limit', parameters.upper_limit);
        draw('lower_limit', parameters.lower_limit);
        draw('rsi', rsi(series, parameters.length));
    }
}
