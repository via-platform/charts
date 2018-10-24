module.exports = {
    name: 'polyline',
    title: 'Polyline',
    description: 'Draw a polyline on the chart.',
    points: 0,
    parameters: {},
    render: ({chart, panel, element, points, parameters}) => {
        const polyline = points.map(({x, y}) => `${chart.scale(x)} ${panel.scale(y)}`).join('L');

        element.selectAll('path').remove();
        element.append('path').attr('d', `M ${polyline} ${parameters.working ? '' : 'Z'}`);
    }
};