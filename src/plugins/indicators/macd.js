module.exports = class MACD {
    static metadata(){
        return {
            name: 'macd',
            type: 'indicator',
            title: 'MACD',
            description: 'An n-period moving average.'
        }
    }

    describe(){
        return {
            components: {
                macd: 'plot',
                signal: 'plot',
                histogram: 'plot'
            },
            params: {
                property: {
                    title: 'Property',
                    type: 'string',
                    enum: ['open', 'high', 'low', 'close', 'mid', 'average'],
                    default: 'close'
                },
                fast_length: {
                    title: 'Fast Length',
                    type: 'integer',
                    constraint: x => x > 0 && x < 100,
                    default: 12
                },
                slow_length: {
                    title: 'Slow Length',
                    type: 'integer',
                    constraint: x => x > 0 && x < 100,
                    default: 12
                },
                signal_length: {
                    title: 'Signal Length',
                    type: 'integer',
                    constraint: x => x > 0 && x < 100,
                    default: 9
                }
            }
        };
    }

    calculate(vs){
        const [ml, sl, hl] = vs.macd(
            vs.param('property'),
            vs.param('fast_length'),
            vs.param('slow_length'),
            vs.param('signal_length')
        );

        vs.plot({id: 'macd', value: ml});
        vs.plot({id: 'signal', value: sl});
        vs.plot({id: 'histogram', value: hl});
    }
}
