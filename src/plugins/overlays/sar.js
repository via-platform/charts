class SAR {
    draw(vs){
        vs.line({
            value: vs.sma(
                vs.prop(
                    vs.param('property')
                ),
                vs.param('length')
            ),
            color: vs.param('color'),
            width: vs.param('width'),
            track: vs.param('track')
        });
    }
}

module.exports = {
    name: 'sar',
    type: 'overlay',
    settings: {
        strokeWidth: {
            title: 'Stroke Width',
            type: 'number',
            valid: value => (value > 0 && value <= 5),
            default: 1.5
        },
        strokeStyle: {
            title: 'Stroke Style',
            type: 'string',
            enum: ['solid', 'dotted', 'dashed'],
            default: 'solid'
        },
        strokeColor: {
            title: 'Stroke Color',
            type: 'color',
            default: '#FF0000'
        },
        periods: {
            title: 'Periods',
            type: 'number',
            valid: value => (value > 0 && value <= 200),
            default: 15
        }
    },
    title: 'Parabolic SAR',
    abbreviation: 'SAR',
    description: 'An n-period moving average.',
    instance: params => new SAR()
};
