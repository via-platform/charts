const {d3} = require('via');
const _ = require('underscore-plus');

//There are some very unusual problems with floating point numbers that only seem to occur in Electron (i.e. they don't also happen in Node)
//As a result, when we are coercing volume profiles into larger buckets, we can't divide by the profile increment
//Basically, we have to wait until later (when we are rendering) to do this. If we don't, it won't "find" the buckets that we've created
//in the Map because floating point is super weird.

const coerce = (value, profile_increment) => {
    return Math.floor(value * (1 / profile_increment)) * profile_increment;
};

const coerce_without_division = (value, profile_increment) => {
    return Math.floor(value * (1 / profile_increment));
};

module.exports = {
    name: 'cluster',
    title: 'Cluster',
    parameters: {
        positive: {
            title: 'Positive Color',
            type: 'color',
            default: '#0bd691'
        },
        negative: {
            title: 'Negative Color',
            type: 'color',
            default: '#ff3b30'
        }
    },
    domain: series => {
        return series.length ? [series.prop('price_low').min(), series.prop('price_high').max()] : [];
    },
    render: ({chart, panel, element, data, parameters}) => {
        const min_cell_height = 16;
        const max_price_levels = Math.floor(panel.height / min_cell_height);

        if(data){
            let profile_increment = data.prop('profile_increment').max();
            const [high, low] = panel.scale.domain();
            const default_color_scale = d3.scaleLinear().range(['#002248', '#288eff']);
            const original_candles = new Map();

            for(const [k, v] of data){
                original_candles.set(k.getTime(), v);
            }

            while(Math.floor((high - low) / profile_increment) > max_price_levels){
                profile_increment *= 2;
            }

            const clusters = data.map(candle => {
                const candle_low = coerce_without_division(candle.price_low, profile_increment);
                const candle_high = coerce_without_division(candle.price_high, profile_increment);
                const levels = new Map();

                for(let i = candle_low; i <= candle_high; i += (profile_increment / profile_increment)){
                    levels.set(i, {buy: 0, sell: 0, total: 0});
                }

                for(const [level, buy, sell] of candle.profile){
                    const rounded = coerce_without_division(level, profile_increment);
                    const existing = levels.get(rounded);

                    if(existing){
                        existing.buy += buy;
                        existing.sell += sell;
                        existing.total = existing.buy + existing.sell;
                    }else{
                        // console.log('No existing', level, profile_increment, rounded)
                    }
                }

                const values = Array.from(levels.values());
                const totals = values.map(value => value.total);
                const color_scale = default_color_scale.domain([d3.min(totals), d3.max(totals)]);

                for(const value of values){
                    value.color = color_scale(value.total);
                }

                return Array.from(levels.entries());
            });

            // console.log(data);
            // console.log(clusters);

            const column_spacing = Math.max(3, Math.min(10, chart.bandwidth * 0.2));
            const cell_width = Math.floor(chart.bandwidth - column_spacing);

            const selected_clusters = element.selectAll('g.cluster').data(clusters.array());
            const cluster_entries = selected_clusters.enter().append('g').classed('cluster', true);
            const all_clusters = cluster_entries.merge(selected_clusters);
            const price_levels = all_clusters.selectAll('g.price-level').data(([date, levels]) => levels);

            all_clusters.attr('transform', ([x]) => `translate(${Math.round(chart.scale(x))}, 0)`);

            cluster_entries.append('path').classed('cluster-background', true);
            cluster_entries.append('path').classed('open-close-range', true);

            all_clusters.select('path.open-close-range')
                .attr('d', ([date]) => {
                    const candle = original_candles.get(date.getTime());
                    const bar_width = column_spacing < 5 ? 1 : 2;
                    let open = coerce(candle.price_open, profile_increment);
                    let close = coerce(candle.price_close, profile_increment);

                    if(candle.price_open < candle.price_close){
                        close = Math.round(panel.scale(close + profile_increment)) + 1;
                        open = Math.round(panel.scale(open));
                    }else{
                        close = Math.round(panel.scale(close));
                        open = Math.round(panel.scale(open + profile_increment)) + 1;
                    }

                    return `M ${-1 - bar_width} ${open} h ${bar_width} V ${close} h ${-1 * bar_width} Z`;
                })
                .attr('fill', ([date]) => {
                    const candle = original_candles.get(date.getTime());
                    return candle.price_open < candle.price_close ? parameters.positive : parameters.negative;
                });

            all_clusters.select('path.cluster-background')
                .attr('d', ([date]) => {
                    const candle = original_candles.get(date.getTime());
                    const top = Math.round(panel.scale(coerce(candle.price_high, profile_increment) + profile_increment));
                    const bottom = Math.round(panel.scale(coerce(candle.price_low, profile_increment)));

                    return `M ${-1} ${top} h ${cell_width + 2} V ${bottom + 1} h ${-1 * cell_width - 2} Z`;
                });

            const price_level_entries = price_levels.enter().append('g').classed('price-level', true);
            const all_price_levels = price_levels.merge(price_level_entries);

            price_level_entries.append('path');

            price_level_entries.append('text')
                .attr('fill', '#FFF')
                .attr('alignment-baseline', 'middle')
                .attr('text-anchor', 'middle');

            all_price_levels.select('path')
                .attr('fill', ([price, volume]) => volume.color)
                .attr('d', ([price]) => {
                    return `M 0 ${Math.round(panel.scale(price * profile_increment))}
                            h ${cell_width}
                            V ${Math.round(panel.scale(price * profile_increment + profile_increment)) + 1}
                            h ${-1 * cell_width} Z`;
                });

            all_price_levels.select('text')
                .attr('x', cell_width / 2)
                .attr('y', ([price]) => Math.ceil(panel.scale(price * profile_increment + profile_increment / 2)) + 0.5)
                .text(([price, volume]) => {
                    return cell_width > 40 ? via.fn.number.formatAmount(volume.total, chart.market) : '';
                });

            selected_clusters.exit().remove();
            price_levels.exit().remove();
        }
    }
};
