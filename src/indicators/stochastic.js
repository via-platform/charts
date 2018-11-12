const {stochastic, sma} = require('via').VS;

module.exports = {
    name: 'stochastic',
    title: 'Stochastic',
    description: 'Measures the momentum of price.',
    decimals: () => 4,
    panel: 'true',
    components: {
        k: {
            type: 'plot',
            parameters: {
                color: '#4594eb',
                style: 'line'
            }
        },
        d: {
            type: 'plot',
            parameters: {
                color: '#f39c12',
                style: 'line'
            }
        },
        upper_limit: {
            type: 'horizontal-line',
            title: 'Upper Limit',
            trackable: false,
            parameters: {
                stroke: 'rgba(69, 148, 235, 0.5)',
                style: 'dashed'
            }
        },
        lower_limit: {
            type: 'horizontal-line',
            title: 'Lower Limit',
            trackable: false,
            parameters: {
                stroke: 'rgba(69, 148, 235, 0.5)',
                style: 'dashed'
            }
        },
        limit_range: {
            type: 'horizontal-range',
            title: 'Range',
            trackable: false,
            parameters: {
                fill: 'rgba(69, 148, 235, 0.1)'
            }
        }
    },
    parameters: {
        length: {
            title: 'Length',
            type: 'number',
            constraint: x => (x > 1 && x <= 200),
            default: 14,
            legend: true
        },
        k: {
            title: 'K Smoothing',
            type: 'number',
            constraint: x => (x >= 1 && x <= 200),
            default: 3,
            legend: true
        },
        d: {
            title: 'D Smoothing',
            type: 'number',
            constraint: x => (x >= 1 && x <= 200),
            default: 3,
            legend: true
        },
        upper_limit: {
            title: 'Upper Limit',
            type: 'integer',
            legend: false,
            constraint: x => x => 0 && x <= 100,
            default: 80
        },
        lower_limit: {
            title: 'Lower Limit',
            type: 'integer',
            legend: false,
            constraint: x => x => 0 && x <= 100,
            default: 20
        }
    },
    calculate: ({series, parameters, draw}) => {
        const k = sma(stochastic(series, parameters.length), parameters.k);
        const d = sma(k, parameters.d);

        draw('limit_range', [parameters.lower_limit, parameters.upper_limit]);
        draw('upper_limit', parameters.upper_limit);
        draw('lower_limit', parameters.lower_limit);
        draw('k', k);
        draw('d', d);
    }
}
