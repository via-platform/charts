const {subtract, sma, prop} = require('via-script');

module.exports = {
    name: 'awesome-oscillator',
    title: 'Awesome Oscillator',
    abbreviation: 'AO',
    description: 'Measures market momentum.',
    decimals: () => 2,
    panel: true,
    components: {
        ao: {
            title: 'Awesome Oscillator',
            type: 'plot',
            parameters: {
                color: '#CCCCCC',
                style: 'histogram'
            }
        }
    },
    parameters: {
        rising: {
            title: 'Rising Color',
            type: 'color',
            default: '#0bd691'
        },
        falling: {
            title: 'Falling Color',
            type: 'color',
            default: '#ff3b30'
        }
    },
    calculate: ({series, parameters, draw}) => {
        const fill = (value, index, data) => {
            if(index){
                return data.get(index - 1) > data.get(index) ? parameters.falling : parameters.rising;
            }else{
                return parameters.rising;
            }
        };

        draw('ao', subtract(sma(prop(series, 'hl_average'), 5), sma(prop(series, 'hl_average'), 34)), {fill});
    }
}
