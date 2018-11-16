const {subtract, adl, ema} = require('via').VS;

module.exports = {
    name: 'chaikin-oscillator',
    title: 'Chaikin Oscillator',
    description: 'An oscillator based on money flow.',
    decimals: () => 4,
    panel: true,
    components: {
        oscillator: {
            type: 'plot',
            parameters: {
                color: '#eb2f06',
                style: 'line'
            }
        },
        baseline: {
            type: 'horizontal-line',
            title: 'Baseline',
            trackable: false,
            parameters: {
                stroke: '#AAA',
                style: 'dashed'
            }
        },
    },
    parameters: {
        fast: {
            title: 'Fast Length',
            type: 'number',
            constraint: x => (x > 1 && x <= 200),
            default: 3,
            legend: true
        },
        slow: {
            title: 'Slow Length',
            type: 'number',
            constraint: x => (x > 1 && x <= 200),
            default: 10,
            legend: true
        }
    },
    calculate: ({series, parameters, draw}) => {
        const adl_line = adl(series);

        draw('baseline', 0);
        draw('oscillator', subtract(ema(adl_line, parameters.fast), ema(adl_line, parameters.slow)));
    }
}
