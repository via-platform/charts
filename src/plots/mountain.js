const _ = require('underscore-plus');

module.exports = {
    name: 'mountain',
    title: 'Mountain',
    trackable: true,
    parameters: {
        stroke: {
            title: 'Stroke Color',
            type: 'color',
            default: '#0000FF'
        },
        fill: {
            title: 'Fill Color',
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
        const [start] = _.first(data);
        const [top, bottom] = panel.scale.range();
        const points = data.map(([x, y]) => `${chart.scale(x)} ${panel.scale(y)}`).join(' L ');

        element.select('path').remove();
        element.append('path').classed('stroke', true).attr('d', data.length > 1 ? `M ${points}` : '');
        element.append('path').classed('fill', true).attr('d', data.length > 1 ? `M ${points} V ${bottom} H ${chart.scale(start)} Z` : '');
    }
};
