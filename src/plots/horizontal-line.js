const HorizontalLine = {
    name: 'horizontal-line',
    title: 'Horizontal Line',
    parameters: {
        stroke: {
            title: 'Stroke Color',
            type: 'color',
            default: '#0000FF'
        },
        visible: {
            title: 'Visible',
            type: 'boolean',
            default: true
        },
        width: {
            title: 'Stroke Width',
            type: 'number',
            enum: [1, 1.5, 2, 2.5],
            default: 1.5
        },
        style: {
            title: 'Stroke Style',
            type: 'string',
            enum: ['solid', 'dashed', 'dotted'],
            default: 'solid'
        }
    },
    render: ({chart, panel, element, data, parameters}) => {
        element.select('path').remove();

        if(data){
            element.append('path')
                .attr('d', `M 0 ${Math.round(panel.scale(data)) - 0.5} h ${panel.width}`)
                .attr('stroke', 'green');
        }
    }
};

module.exports = HorizontalLine;