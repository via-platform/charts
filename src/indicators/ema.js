module.exports = class EMA {
    static metadata(){
        return {
            name: 'ema',
            type: 'overlay',
            title: 'Exponential Moving Average',
            description: 'An n-period exponential moving average.'
        }
    }

    describe(){
        return {
            components: {
                default: 'plot'
            },
            params: {
                property: {
                    title: 'Property',
                    type: 'string',
                    enum: ['open', 'high', 'low', 'close', 'mid', 'average'],
                    default: 'close'
                },
                length: {
                    title: 'Length',
                    type: 'number',
                    constraint: x => (x > 1 && x <= 200),
                    default: 15
                }
            }
        };
    }

    calculate(vs){
        vs.plot({value: vs.ema(vs.prop(vs.param('property')), vs.param('length'))});
    }
}