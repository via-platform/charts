module.exports = class RSI {
    static metadata(){
        return {
            name: 'rsi',
            type: 'indicator',
            title: 'Relative Strength Index',
            description: 'A momentum oscillator that measures the speed and change of price movements.'
        }
    }

    describe(){
        return {
            components: {
                rsi: {
                    type: 'plot',
                    default: 'line',
                    stroke: '#0000FF'
                },
                upper_limit: {
                    type: 'line',
                    style: 'dashed',
                    stroke: '#0000FF'
                },
                lower_limit: {
                    type: 'line',
                    style: 'dashed',
                    stroke: '#0000FF'
                },
                limit_range: {
                    type: 'fill',
                    fill: '#0000FF',
                    opacity: 0.5
                }
            },
            params: {
                length: {
                    title: 'Length',
                    type: 'number',
                    constraint: x => x => 0 && x <= 100,
                    default: 14
                },
                upper_limit: {
                    title: 'Upper Limit',
                    type: 'integer',
                    constraint: x => x => 0 && x <= 100,
                    default: 70
                },
                lower_limit: {
                    title: 'Lower Limit',
                    type: 'integer',
                    constraint: x => x => 0 && x <= 100,
                    default: 30
                }
            }
        };
    }

    calculate(vs){
        vs.plot('limit_range', [vs.param('lower_limit'), vs.param('upper_limit')]);
        vs.plot('upper_limit', vs.param('upper_limit'));
        vs.plot('lower_limit', vs.param('lower_limit'));
        vs.plot('rsi', vs.rsi(vs.param('length')));
    }
}