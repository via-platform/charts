module.exports = {
    name: 'vertical-line',
    title: 'Vertical Line',
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
        element.select('path').remove();
        element.append('path').attr('d', `M ${data} 0 v ${panel.height}`);
    }
};
