const {multiply, divide, prop, mfm, sum} = require('via').VS;

module.exports = {
    name: 'chaikin-money-flow',
    title: 'Chaikin Money Flow',
    abbreviation: 'CMF',
    description: 'Measures money flow volume over a set period of time.',
    decimals: () => 4,
    panel: true,
    components: {
        cmf: {
            type: 'plot',
            parameters: {
                color: '#eb2f06',
                style: 'line'
            }
        }
    },
    parameters: {
        length: {
            title: 'Length',
            type: 'number',
            constraint: x => (x > 1 && x <= 200),
            default: 21,
            legend: true
        }
    },
    calculate: ({series, parameters, draw}) => {
        const volume = prop(series, 'volume_traded');
        const mfv = multiply(mfm(series), volume);

        draw('cmf', divide(sum(mfv, parameters.length), sum(volume, parameters.length)));
    }
}
