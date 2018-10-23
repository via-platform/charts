module.exports = {
    name: 'range',
    title: 'Range',
    parameters: {
        fill: {
            title: 'Fill Color',
            type: 'color',
            default: '#0000FF'
        },
        visible: {
            title: 'Visible',
            type: 'boolean',
            default: true
        }
    },
    render: ({chart, panel, element, data, parameters}) => {
        element.select('path').remove();

        if(data){
            const [start, end] = data;

            element.append('path')
                .attr('d', `M 0 ${Math.round(panel.scale(start)) - 0.5} h ${panel.width} V ${Math.round(panel.scale(end)) - 0.5} h ${-1 * panel.width} Z`)
                .attr('fill', parameters.fill);
        }
    }
};