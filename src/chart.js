const {Disposable, CompositeDisposable, Emitter} = require('via');
const d3 = require('d3');
const ChartCenter = require('./chart-center');
const ChartData = require('./chart-data');
const ChartStudy = require('./chart-study');
const ChartPanels = require('./chart-panels');
const ChartTools = require('./chart-tools');
const ChartAxis = require('./chart-axis');
const _ = require('underscore-plus');
const ChartDefaults = {end: 0, start: Date.now() - 864e5};
const ChartAreas = 'top left bottom right'.split(' ');
const BaseURI = 'via://chart';

module.exports = class Chart {
    static deserialize(plugins, params){
        return new Chart(plugins, params);
    }

    serialize(){
        return {
            uri: this.getURI(),
            time: this.time,
            panels: this.panels.serialize(),
            tools: this.tools.serialize()
        };
    }

    constructor(plugins, params = {}){
        this.plugins = plugins;

        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.warnings = [];

        this.panels = [];
        this.symbol = null;

        this.uri = params.uri;
        this.extent = _.defaults(params.extent || {}, ChartDefaults);
        this.granularity = params.granularity || 6e4;

        this.width = 0;
        this.height = 0;

        // this.data = new ChartData(this);

        this.basis = d3.scaleTime().domain([new Date(Date.now() - 36e5), new Date()]);
        this.scale = this.basis.copy();

        this.element = document.createElement('div');
        this.element.classList.add('chart');

        this.resizeObserver = new ResizeObserver(this.resize.bind(this));
        this.resizeObserver.observe(this.element);

        this.initialize(params);
        this.draw();
    }

    initialize(state = {}){
        this.tools = new ChartTools({chart: this, state: state.tools});
        this.panels = new ChartPanels({chart: this, state: state.panels});
        this.axis = new ChartAxis({chart: this});

        this.element.appendChild(this.tools.element);
        this.element.appendChild(this.panels.element);
        this.element.appendChild(this.axis.element);
    }

    zoomed({event, target}){
        this.scale.domain(event.transform.rescaleX(this.basis).domain());
        this.emitter.emit('did-zoom', {event, target});
    }

    resize(){
        this.width = this.element.clientWidth;
        this.height = this.element.clientHeight;

        this.basis.range([0, this.width]);
        this.scale.range([0, this.width]);

        this.emitter.emit('did-resize', {width: this.width, height: this.height});
    }

    draw(){
        //Redraw all panels and the X axis
        this.axis.draw();
    }

    attachAxis(){

    }

    addPanel(state){
        let chartPanel = new ChartPanel({chart: this, state});
        this.graphic.appendChild(chartPanel.element);
        this.panels.push(chartPanel);
        this.emitter.emit('did-add-panel');
    }

    destroy(){
        this.disposables.dispose();
        this.emitter.dispose();
        this.panels.destroy();
        this.tools.destroy();
        this.axis.destroy();
        this.resizeObserver.disconnect();
        this.emitter.emit('did-destroy');
    }

    getURI(){
        return this.uri;
    }

    getIdentifier(){
        return this.getURI().slice(BaseURI.length + 1);
    }

    getTitle(){
        //TODO make the title more helpful
        return 'Chart';
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

    changeSymbol(symbol){
        this.symbol = symbol;
        this.emitter.emit('did-change-symbol', symbol);
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

    nearestCandle(date){
        return new Date(Math.floor(date.getTime() / this.granularity) * this.granularity);
    }

    addLeftPanel(){

    }

    addRightPanel(){

    }

    addRightPanel(){

    }

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

    onDidChangeSymbol(callback){
        return this.emitter.on('did-change-symbol', callback);
    }

    onDidAddStudy(callback){
        return this.emitter.on('did-add-study', callback);
    }

    onDidRemoveStudy(callback){
        return this.emitter.on('did-remove-study', callback);
    }

    onDidDestroy(callback){
        return this.emitter.on('did-destroy', callback);
    }

    onDidResize(callback){
        return this.emitter.on('did-resize', callback);
    }

    onDidDraw(callback){
        return this.emitter.on('did-draw', callback);
    }

    onDidZoom(callback){
        return this.emitter.on('did-zoom', callback);
    }
}
