const {sar} = require('via-script');

module.exports = {
    name: 'parabolic-sar',
    title: 'Parabolic SAR',
    abbreviation: 'SAR',
    description: 'Used to identify points of potential stops and reverses.',
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
            min: 0,
            max: 1,
            step: 0.01,
            default: 0.02
        },
        increment: {
            title: 'Increment',
            type: 'number',
            min: 0,
            max: 1,
            step: 0.01,
            default: 0.02
        },
        max: {
            title: 'Max Value',
            type: 'number',
            min: 1,
            max: 10,
            step: 0.1,
            default: 0.2
        }
    },
    calculate: ({series, parameters, draw}) => {
        draw('sar', sar(series, parameters.start, parameters.increment, parameters.max));
    }
};
