module.exports = {
    name: 'horizontal-range',
    title: 'Horizontal Range',
    trackable: false,
    parameters: {
        fill: {
            title: 'Fill Color',
            type: 'color',
            default: '#0000FF'
        },
        opacity: {
            title: 'Fill Opacity',
            type: 'number',
            min: 1,
            max: 100,
            step: 1,
            default: 10
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
                .attr('fill', parameters.fill)
                .attr('fill-opacity', parameters.opacity / 100);
        }
    }
};