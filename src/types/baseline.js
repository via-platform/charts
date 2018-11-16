const {Color, UUID, d3} = require('via');
const {prop} = require('via-script');
const _ = require('underscore-plus');

module.exports = {
    name: 'baseline',
    title: 'Baseline',
    parameters: {
        property: {
            title: 'Property',
            type: 'string',
            enum: [
                {title: 'Open', value: 'price_open'},
                {title: 'High', value: 'price_high'},
                {title: 'Low', value: 'price_low'},
                {title: 'Close', value: 'price_close'},
                {title: 'High-Low Average', value: 'hl_average'},
                {title: 'OHLC Average', value: 'ohlc_average'}
            ],
            default: 'price_close'
        },
        baseline: {
            title: 'Baseline',
            type: 'number',
            default: 50
        },
        positive: {
            title: 'Positive Color',
            type: 'color',
            default: '#0bd691'
        },
        negative: {
            title: 'Negative Color',
            type: 'color',
            default: '#ff3b30'
        },
        width: {
            title: 'Stroke Width',
            type: 'number',
            enum: [1, 1.5, 2, 2.5],
            default: 1.5
        }
    },
    calculate: ({series, parameters}) => {
        return prop(series, parameters.property);
    },
    domain: series => {
        return series.length ? [series.min(), series.max()] : [];
    },
    render: ({chart, panel, element, data, parameters}) => {
        element.datum(data).selectAll('*').remove();

        if(data){
            const [low, high] = panel.scale.domain();
            const baseline = low + ((high - low) * parameters.baseline / 100);
            const clip_below = UUID();
            const clip_above = UUID();
            const positive = Color.parse(parameters.positive);
            const negative = Color.parse(parameters.negative);

            const line = d3.line()
                .x(([x]) => chart.scale(x))
                .y(([x, y]) => panel.scale(y));

            const area = d3.area()
                .x(([x]) => chart.scale(x))
                .y1(([x, y]) => panel.scale(y))
                .y0(panel.scale(baseline));

            element.append('clipPath')
                .attr('id', clip_below)
                .append('rect')
                .attr('width', panel.width)
                .attr('height', panel.height * parameters.baseline / 100)
                .attr('x', 0)
                .attr('y', 0);

            element.append('clipPath')
                .attr('id', clip_above)
                .append('rect')
                .attr('width', panel.width)
                .attr('height', panel.height * (100 - parameters.baseline) / 100)
                .attr('x', 0)
                .attr('y', panel.height * parameters.baseline / 100);

            positive.alpha = 0.2;
            negative.alpha = 0.2;

            element.append('path')
                .classed('baseline', true)
                .attr('d', data.length > 1 ? `M 0 ${Math.round(panel.scale(baseline)) - 0.5} h ${panel.width}` : '')
                .attr('stroke', 'rgba(255, 255, 255, 0.5)')
                .attr('stroke-dasharray', 2)
                .attr('stroke-width', 1);

            element.append('path')
                .attr('clip-path', `url(#${clip_below})`)
                .attr('d', area)
                .attr('fill', positive.toRGBAString());

            element.append('path')
                .attr('clip-path', `url(#${clip_above})`)
                .attr('d', area)
                .attr('fill', negative.toRGBAString());

            element.append('path')
                .attr('clip-path', `url(#${clip_below})`)
                .attr('d', line)
                .attr('stroke', parameters.positive)
                .attr('stroke-width', parameters.width);

            element.append('path')
                .attr('clip-path', `url(#${clip_above})`)
                .attr('d', line)
                .attr('stroke', parameters.negative)
                .attr('stroke-width', parameters.width);
        }
    }
};
