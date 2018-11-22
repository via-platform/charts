const {subtract, adl, ema} = require('via-script');

module.exports = {
    name: 'chaikin-oscillator',
    title: 'Chaikin Oscillator',
    description: 'An oscillator based on money flow.',
    decimals: () => 4,
    panel: true,
    components: {
        oscillator: {
            title: 'Chaikin Oscillator',
            type: 'plot',
            parameters: {
                color: '#eb2f06',
                style: 'line'
            }
        },
        baseline: {
            title: 'Baseline',
            type: 'horizontal-line',
            trackable: false,
            parameters: {
                stroke: '#AAAAAA',
                style: 'dashed'
            }
        },
    },
    parameters: {
        fast: {
            title: 'Fast Length',
            type: 'number',
            min: 2,
            max: 100,
            step: 1,
            default: 3,
            legend: true
        },
        slow: {
            title: 'Slow Length',
            type: 'number',
            min: 2,
            max: 100,
            step: 1,
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
