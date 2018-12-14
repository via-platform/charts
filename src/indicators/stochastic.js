const {stochastic, sma} = require('via-script');

module.exports = {
    name: 'stochastic',
    title: 'Stochastic',
    description: 'Measures the momentum of price.',
    decimals: () => 4,
    panel: 'true',
    components: {
        k: {
            title: 'K',
            type: 'plot',
            parameters: {
                color: '#4594eb',
                style: 'line'
            }
        },
        d: {
            title: 'D',
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
            max: 200,
            step: 1,
            default: 14,
            legend: true
        },
        k: {
            title: 'K Smoothing',
            type: 'number',
            min: 2,
            max: 200,
            step: 1,
            default: 3,
            legend: true
        },
        d: {
            title: 'D Smoothing',
            type: 'number',
            min: 2,
            max: 200,
            step: 1,
            default: 3,
            legend: true
        },
        upper_limit: {
            title: 'Upper Limit',
            type: 'integer',
            legend: false,
            min: 0,
            max: 100,
            step: 1,
            default: 80
        },
        lower_limit: {
            title: 'Lower Limit',
            type: 'integer',
            legend: false,
            min: 0,
            max: 100,
            step: 1,
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
