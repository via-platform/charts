module.exports = ({chart, panel, element, data, parameters}) => {
    //TODO handle properties like color / width
    const cross = element.selectAll('rect').data(data);
    const w = 1;
    const n = -1 * w;
    const h = w / 2;

    cross.enter()
        .append('path')
        .merge(cross)
            .attr('d', ([x, y]) => `M ${chart.scale(x) - h} ${panel.scale(y) - h} v ${n} h ${w} v ${w} h ${w} v ${w} h ${n} v ${w} h ${n} v ${n} h ${n} v ${n} h ${w} Z`);

    cross.exit().remove();
};
