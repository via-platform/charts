module.exports = ({chart, panel, element, series, properties}) => {
    //TODO handle properties like color / width
    element.select('path').remove();

    element.append('path')
        .classed('stroke', true)
        .datum(series)
        .attr('d', d => d.length > 1 ? 'M ' + d.map(([x, y]) => `${chart.scale(x)} ${panel.scale(y)}`).join(' L ') : '');
};