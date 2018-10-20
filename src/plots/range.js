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
                .attr('d', `M 0 ${panel.scale(start)} h ${panel.width} V ${panel.scale(end)} h ${-1 * panel.width} Z`)
                .attr('fill', 'rgba(0, 255, 0, 0.1)');
        }
    }
};