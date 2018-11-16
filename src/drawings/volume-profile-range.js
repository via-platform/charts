const {d3} = require('via');

const coerce = (value, profile_increment) => {
    return Math.floor(value * (1 / profile_increment)) * profile_increment;
};

const coerce_without_division = (value, profile_increment) => {
    return Math.floor(value * (1 / profile_increment));
};

module.exports = {
    name: 'volume-profile-range',
    title: 'Volume Profile Range',
    description: 'View the volume profile within the selected range.',
    points: 2,
    selectable: true,
    parameters: {},
    render: ({chart, panel, element, points}) => {
        const [start, end] = points;

        const sx = Math.round(chart.scale(start.x));
        const ex = Math.round(chart.scale(end.x));

        const bars = (end.x - start.x) / chart.granularity;
        const duration = via.fn.time.duration(start.x, end.x, 'd[d], h[h], m[m], s[s]', {largest: 2, trim: 'both'});

        const s = {
            x: Math.min(sx, ex)
        };

        const e = {
            x: Math.max(sx, ex)
        };

        element.selectAll('path').remove();
        element.append('path').classed('boundary', true).attr('d', `M ${sx + 0.5} 0 v ${panel.height}`);
        element.append('path').classed('boundary', true).attr('d', `M ${ex + 0.5} 0 v ${panel.height}`);

        element.selectAll('rect').remove();
        element.append('rect').attr('x', s.x).attr('y', 0).attr('width', e.x - s.x).attr('height', panel.height);

        element.selectAll('text').remove();
        element.append('text')
            .attr('alignment-baseline', 'hanging')
            .attr('text-anchor', 'middle')
            .attr('x', (ex + sx) / 2)
            .attr('y', panel.height - 25)
            .text(`${duration} (${bars} Bars)`);

        const data = chart.data.all().range(start.x, end.x);
        const profile_increment = data.prop('profile_increment').max();
        const levels = new Map();

        for(const [key, candle] of data){
            for(const [level, buy, sell] of candle.profile){
                const rounded = coerce_without_division(level, profile_increment);
                const existing = levels.get(rounded);

                if(existing){
                    existing.buy += buy;
                    existing.sell += sell;
                    existing.total = existing.buy + existing.sell;
                }else{
                    levels.set(rounded, {level: rounded, buy, sell, total: buy + sell})
                }
            }
        }

        const values = Array.from(levels.values());
        const value_levels = values.map(value => value.level * profile_increment);
        const highest_point = panel.scale(d3.max(value_levels));
        const lowest_point = panel.scale(d3.min(value_levels));
        const max = d3.max(values.map(level => level.total));
        const height = Math.max(1, Math.floor(Math.abs(highest_point - lowest_point) / values.length * 0.8));
        const scale = d3.scaleLinear().domain([0, max]).range([0, Math.abs(sx - ex) / 2]);

        const volume_bar = element.selectAll('g').data(values, d => d.level);

        volume_bar.enter()
            .append('rect')
            .classed('volume-bar', true)
            .merge(volume_bar)
                .attr('width', d => scale(d.total))
                .attr('height', height)
                .attr('x', sx)
                .attr('y', d => Math.floor(panel.scale(d.level * profile_increment)));

        volume_bar.exit().remove();
    }
};