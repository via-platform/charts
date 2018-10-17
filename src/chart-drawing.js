const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const VS = require('./chart-vs');
const etch = require('etch');
const $ = etch.dom;

const defaults = {
    working: true,
    done: false,
    selectable: true,
    priority: 1,
    ephemeral: false
};

//Get a description from the chart plugin of how many points are required
//Create ranges and flags for the necessary points
//If the state is contains all of the necessary points, we have a complete shape and that's it
//Otherwise, we have to start a new shape from the first point that was given to us.
//We need to call the plugin's draw function with the points that we do have, as well as our generated
//flags and ranges.

//When the mouse is clicked, we have to record the points in real pixel terms.

//When the number of points reaches the number specified in the description, we are done
//and can dispose and disposables that were created during drawing.

//We must have a disposable that watches for core:cancel so that the drawing can be properly deleted if the
//escape key is pressed.

//TODO Add an invisible background layer while working to prevent clicks elsewhere

module.exports = class ChartDrawing {
    constructor({chart, state, panel, plugin, event}){
        this.disposables = new CompositeDisposable();
        this.working = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.plugin = plugin;
        this.points = [];
        this.params = _.defaults(this.plugin.params, defaults);

        this.element = this.panel.zoomable.append('g')
            .datum(this.params.priority)
            .classed('layer', true)
            .classed(this.plugin.name, true)
            .classed('selectable', this.params.selectable);

        this.working.add(this.panel.onDidClick(this.click.bind(this)));
        this.working.add(this.panel.onDidMouseMove(this.move.bind(this)));

        if(state){
            this.points = state;
            this.done();
        }else{
            this.point(event);

            if(this.points.length === this.plugin.points){
                this.done();
            }else{
                this.point(event);
            }
        }
    }

    move({event}){
        const last = _.last(this.points);

        last.x = new Date(Math.round(this.chart.scale.invert(event.offsetX).getTime() / this.chart.granularity) * this.chart.granularity);
        last.y = this.panel.scale.invert(event.offsetY);

        this.render();
    }

    click({event}){
        this.move({event});

        if(this.plugin.points === 0 && event.detail === 2){
            this.done();
        }else if(this.points.length === this.plugin.points){
            this.done();
        }else{
            this.point(event);
            this.render();
        }
    }

    point(event){
        this.points.push({
            x: new Date(Math.round(this.chart.scale.invert(event.offsetX).getTime() / this.chart.granularity) * this.chart.granularity),
            y: this.panel.scale.invert(event.offsetY)
        });
    }

    render(){
        //TODO If selected, render the actual points, flags, and ranges
        this.element.classed('working', this.params.working).classed('done', this.params.done);
        this.plugin.render({chart: this.chart, panel: this.panel, points: this.points, element: this.element, params: this.params});
    }

    done(){
        console.log('DONE DRAWING PLUGIN', this.points.length, this.params);
        if(this.params.ephemeral){
            return this.panel.remove(this);
        }

        this.params.working = false;
        this.params.done = true;
        this.working.dispose();
        this.working = null;

        this.render();
    }

    title(){
        return '';
    }

    value(){
        return '';
    }

    destroy(){
        if(this.working){
            this.working.dispose();
        }

        this.element.remove();
        this.disposables.dispose();
    }
}