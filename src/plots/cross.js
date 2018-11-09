module.exports = {
    name: 'cross',
    title: 'Cross',
    trackable: true,
    parameters: {
        fill: {
            title: 'Fill Color',
            type: 'color',
            default: '#FFFFFF'
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
        }
    },
    render: ({chart, panel, element, data, parameters}) => {
        const w = parameters.width;
        const n = -1 * w;
        const h = w / 2;

        if(data){
            const cross = element.selectAll('path').data(data);

            cross.enter()
                .append('path')
                .merge(cross)
                    .attr('d', ([x, y]) => {
                        return `M ${chart.scale(x) - h} ${panel.scale(y) - h} v ${n} h ${w} v ${w} h ${w} v ${w} h ${n} v ${w} h ${n} v ${n} h ${n} v ${n} h ${w} Z`;
                    })
                    .attr('fill', parameters.fill);

            cross.exit().remove();
        }else{
            element.selectAll('path').remove();
        }
    }
};