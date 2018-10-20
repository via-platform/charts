module.exports = {
    plot: {
        style: {
            title: 'Plot Style',
            type: 'string',
            enum: [
                {title: 'Line', value: 'line'},
                {title: 'Area', value: 'area'},
                {title: 'Histogram', value: 'histogram'},
                {title: 'Column', value: 'column'},
                {title: 'Mountain', value: 'mountain'},
                {title: 'Cross', value: 'cross'},
                {title: 'Circle', value: 'circle'},
                {title: 'Step Line', value: 'step'},
            ],
            default: 'line'
        },
        color: {
            title: 'Color',
            type: 'color',
            default: '#0000FF'
        },
        track: {
            title: 'Track Value',
            type: 'boolean',
            default: false
        },
        visible: {
            title: 'Visible',
            type: 'boolean',
            default: true
        }
    },
    line: ,
    hl: {
        color: {
            title: 'Color',
            type: 'color',
            default: '#0000FF'
        },
        visible: {
            title: 'Visible',
            type: 'boolean',
            default: true
        }
    },
    vl: {
        color: {
            title: 'Color',
            type: 'color',
            default: '#0000FF'
        },
        visible: {
            title: 'Visible',
            type: 'boolean',
            default: true
        }
    },
    hr: {
        color: {
            title: 'Color',
            type: 'color',
            default: '#0000FF'
        },
        visible: {
            title: 'Visible',
            type: 'boolean',
            default: true
        }
    },
    vr: {
        color: {
            title: 'Color',
            type: 'color',
            default: '#0000FF'
        },
        visible: {
            title: 'Visible',
            type: 'boolean',
            default: true
        }
    }
};
