const {Disposable, CompositeDisposable, Emitter} = require('via');
// const d3 = require('d3');
// const techan = require('techan');
// const Candlestick = require('./candlestick');
const ChartCenter = require('./chart-center');
// const ChartData = require('./chart-data');
const ChartStudy = require('./chart-study');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;
const PluginTypes = 'plots annotations indicators studies tools'.split(' ');
const ChartDefaults = {end: 0, start: Date.now() - 864e5};
const ChartAreas = 'top left bottom right'.split(' ');

module.exports = class Chart {
    static deserialize(plugins, params){
        return new Chart(plugins, params);
    }

    serialize(){
        return {
            uri: this.uri,
            series: this.series,
            time: this.time,
            plots: this.plots.map(plot => plot.serialize()),
            annotations: this.annotations.map(annotation => annotation.serialize()),
            indicators: this.indicators.map(indicator => indicator.serialize()),
            studies: this.studies.map(study => study.serialize()),
            tools: this.tools.map(tool => tool.serialize())
        };
    }

    constructor(charts, plugins, params = {}){
        this.charts = charts;
        this.plugins = plugins;

        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.warnings = [];
        this.studies = params.studies || [];
        this.tools = params.tools || [];
        this.uri = params.uri;
        this.type = params.type || 'candlestick';
        this.extent = _.defaults(params.extent || {}, ChartDefaults);
        this.seriesDisposables = new Map();
        this.series = [];

        this.granularity = params.granularity || 9e5; //5 minutes

        etch.initialize(this);

        this.center = new ChartCenter(this);
        // this.data = new ChartData(this);

        this.resizeObserver = new ResizeObserver(this.didResize.bind(this));
        this.resizeObserver.observe(this.element);

        this.initialize(params);
    }

    initialize(params){
        if(params.series){
            //Find the symbol object for each symbol id
            for(let series of params.series){
                series.symbol = via.symbols.findByURI(series.uri);

                if(series.symbol){
                    this.addSeries(series);
                }
            }
        }
    }

    didResize(){
        this.emitter.emit('did-resize');
    }

    destroy(){
        this.disposables.dispose();
        this.emitter.dispose();
        this.center.destroy();
        this.resizeObserver.disconnect();

        for(let study of this.studies){
            study.destroy();
        }

        for(let disposables of this.seriesDisposables.values()){
            disposables.dispose();
        }

        this.seriesDisposables.clear();
        this.seriesDisposables = null;
        this.emitter.emit('did-destroy');
    }

    getURI(){
        return this.uri;
    }

    getTitle(){
        //TODO make the title more helpful
        return 'Chart';
    }

    addedPlugin(plugin){
        // let metadata = plugin.getMetadata();
        //
        // this.clearWarnings();
        //
        // if(!PluginTypes.includes(metadata.type)){
        //     this.addWarning({type: 'error', message: `Tried to add a plugin with an invalid type: ${plugin.type}.`});
        //     return;
        // }
    }

    removedPlugin(plugin){
        console.log('Removed a plugin!');
        //TODO remove any disposables that may be associated with this plugin
    }

    addWarning(warning){
        this.warnings.push(warning);
        this.emitter.emit('did-add-warning', warning);
    }

    removeWarning(warning){
        _.remove(this.warnings, warning);
        this.emitter.emit('did-remove-warning', warning);
    }

    clearWarnings(){
        this.warnings = [];
    }

    getSeries(){
        return this.series.slice();
    }

    addSeries(series){
        if(this.series.includes(series)){
            return;
        }

        this.series.push(series);
        this.emitter.emit('did-add-series', series);
        this.charts.didAddSeries(this, series);

        console.log('series.symbol.subscribe();');
        series.symbol.ticker.subscribe(function(){});

        let disposables = new CompositeDisposable();

        this.seriesDisposables.set(series, disposables);

        etch.update(this);
    }

    removeSeries(series){
        if(this.series.includes(series)){
            _.remove(this.series, series);
            this.emitter.emit('did-remove-series', series);
            this.charts.didRemoveSeries(this, series);
            this.seriesDisposables.get(series).dispose();
            this.seriesDisposables.delete(series);
        }
    }

    addTool(tool){
        let element = tool.element;
        this.emitter.emit('did-add-tool', tool);

        //TODO observe the weight of the tool to put it in the proper order
        let parent = (tool.location === 'left') ? this.refs.toolsLeft : this.refs.toolsRight;
        parent.appendChild(element);

        return new Disposable(() => this.removeTool(tool));
    }

    removeTool(tool){
        tool.element.remove();
        this.emitter.emit('did-remove-tool', tool);
    }

    addStudy(params){
        let study = new ChartStudy(this, params);
        this.studies.push(study);
        this.emitter.emit('did-add-study', study);
    }

    removeStudy(study){
        _.remove(this.studies, study);
        this.emitter.emit('did-remove-study', study);
    }

    setChartType(type){
        this.chart.type = type;
        this.emitter.emit('did-change-chart-type', type);
    }

    getChartType(){
        return this.chart.type;
    }

    render(){
        return $.div({class: 'chart'},
            $.div({class: 'chart-tools', ref: 'tools'},
                $.div({class: 'chart-tools-left', ref: 'toolsLeft'}),
                $.div({class: 'chart-tools-divider'}),
                $.div({class: 'chart-tools-left', ref: 'toolsRight'})
            ),
            $.div({class: 'chart-graphic'},
                $.div({class: 'chart-area top', ref: 'top'}),
                $.div({class: 'chart-center', ref: 'center'}),
                $.div({class: 'chart-area bottom', ref: 'bottom'})
            )
        );
    }

    update(){}

    onDidChangeResolution(callback){
        return this.emitter.on('did-change-resolution', callback);
    }

    onDidChangeData(callback){
        return this.emitter.on('did-change-data', callback);
    }

    onDidChangeChartType(callback){
        return this.emitter.on('did-change-chart-type', callback);
    }

    onDidAddWarning(callback){
        return this.emitter.on('did-add-warning', callback);
    }

    onDidRemoveWarning(callback){
        return this.emitter.on('did-remove-warning', callback);
    }

    observeSeries(callback){
        for(let series of this.series){
            callback(series);
        }

        return this.emitter.on('did-add-series', callback);
    }

    onDidAddSeries(callback){
        return this.emitter.on('did-add-series', callback);
    }

    onDidRemoveSeries(callback){
        return this.emitter.on('did-remove-series', callback);
    }

    onDidModifySeries(callback){
        return this.emitter.on('did-modify-series', callback);
    }

    onDidDestroy(callback){
        return this.emitter.on('did-destroy', callback);
    }

    onDidAddLayer(callback){
        return this.center.onDidAddLayer(callback);
    }

    onDidRemoveLayer(callback){
        return this.center.onDidRemoveLayer(callback);
    }

    onDidAddStudy(callback){
        return this.emitter.on('did-add-study', callback);
    }

    onDidRemoveStudy(callback){
        return this.emitter.on('did-remove-study', callback);
    }

    onDidResize(callback){
        return this.emitter.on('did-resize', callback);
    }
}
