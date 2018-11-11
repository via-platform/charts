const {sar} = require('via').VS;

module.exports = {
    name: 'parabolic-sar',
    type: 'overlay',
    title: 'Parabolic SAR',
    abbreviation: 'SAR',
    description: 'An n-period moving average.',
    components: {
        sar: {
            type: 'plot',
            title: 'SAR',
            style: {
                style: 'cross'
            }
        }
    },
    parameters: {
        start: {
            title: 'Start',
            type: 'number',
            constraint: value => (value >= 0 && value <= 1),
            increment: 0.01,
            default: 0.02
        },
        increment: {
            title: 'Increment',
            type: 'number',
            constraint: value => (value >= 0 && value <= 1),
            increment: 0.01,
            default: 0.02
        },
        max: {
            title: 'Max Value',
            type: 'number',
            constraint: value => (value > 0 && value <= 10),
            increment: 0.1,
            default: 0.2
        }
    },
    calculate: ({series, parameters, draw}) => {
        draw('sar', sar(series, parameters.start, parameters.increment, parameters.max));
    }
};
