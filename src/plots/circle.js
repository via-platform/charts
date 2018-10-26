module.exports = ({chart, panel, element, data, parameters}) => {
    //TODO handle properties like color / width
    const circle = element.selectAll('circle.circle').data(data);

    circle.enter()
        .append('path')
        .merge(circle)
            .attr('class', 'circle')
            .attr('cx', ([x]) => chart.scale(x))
            .attr('cy', ([x, y]) => panel.scale(y))
            .attr('r', 2);

    circle.exit().remove();
};
