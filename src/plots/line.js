module.exports = {
    name: 'line',
    title: 'Line',
    parameters: {
        color: {
            title: 'Color',
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
        // console.log(parameters)
        //TODO handle properties like color / width
        element.select('path').remove();
        element.append('path').classed('stroke', true).datum(data).attr('d', d => d.length > 1 ? 'M ' + d.map(([x, y]) => `${chart.scale(x)} ${panel.scale(y)}`).join(' L ') : '');
    }
};
