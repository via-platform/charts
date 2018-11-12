const {map, sum, nz, divide} = require('via').VS;

module.exports = {
    name: 'money-flow',
    title: 'Money Flow',
    description: 'An oscillator designed to measure buying and selling pressure.',
    decimals: chart => chart.market ? chart.market.precision.price : 0,
    panel: true,
    components: {
        mf: {
            type: 'plot',
            parameters: {
                color: '#0bd691',
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
            constraint: x => (x > 1 && x <= 100),
            default: 14,
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
        const positive_money_flow = map(series, (value, index) => index > 0 && value.hlc_average > series.get(index - 1).hlc_average ? value.hlc_average * value.volume_traded : 0);
        const negative_money_flow = map(series, (value, index) => index > 0 && value.hlc_average < series.get(index - 1).hlc_average ? value.hlc_average * value.volume_traded : 0);

        const positive = sum(positive_money_flow, parameters.length);
        const negative = sum(negative_money_flow, parameters.length);

        draw('limit_range', [parameters.lower_limit, parameters.upper_limit]);
        draw('upper_limit', parameters.upper_limit);
        draw('lower_limit', parameters.lower_limit);
        draw('mf', map(nz(divide(positive, negative), 100), value => 100 - 100 / (1 + value)));
    }
}
