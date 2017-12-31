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
const BaseURI = 'via://charts';

const AXIS_HEIGHT = 30;
const AXIS_WIDTH = 60;

module.exports = class Chart {
    static deserialize({manager, plugins, omnibar}, params){
        return new Chart({manager, plugins, omnibar}, params);
    }

    serialize(){
        return {
            uri: this.getURI(),
            time: this.time,
            type: this.type,
            panels: this.panels.serialize(),
            tools: this.tools.serialize(),
            data: this.data.serialize()
        };
    }

    constructor({manager, plugins, omnibar}, params = {}){
        this.manager = manager;
        this.plugins = plugins;
        this.omnibar = omnibar;

        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.warnings = [];

        this.panels = null;

        this.uri = params.uri;

        this.width = 0;
        this.height = 0;
        this.transform = d3.zoomIdentity;

        //TODO allow the user to set a preference on this
        this.type = 'candlestick';

        //TODO allow the padding to be customized
        this.padding = 0.2;
        this.bandwidth = 10;
        this.bandInterval = null;
        this.granularity = 0;

        this.basis = d3.scaleTime().domain([new Date(Date.now() - 864e5), new Date()]);
        this.scale = this.basis.copy();

        this.element = document.createElement('div');
        this.element.classList.add('chart');

        this.changeGranularity(params.granularity || 3e5);

        this.data = new ChartData({chart: this, granularity: this.granularity});

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

        this.symbol = via.symbols.findByIdentifier(this.getURI().slice(BaseURI.length + 1));

        if(this.symbol){
            this.emitter.emit('did-change-symbol', this.symbol);
        }

        //There isn't a great place to initialize uber-general plugins like the crosshairs
        //Might as well do it here...
        this.manager.observePlugins(plugin => {
            if(plugin.type === 'other'){
                plugin.instance({chart: this, tools: this});
            }
        });
    }

    zoomed({event, target}){
        this.transform = event.transform;
        this.scale.domain(event.transform.rescaleX(this.basis).domain());
        this.updateBandwidth();
        this.emitter.emit('did-zoom', {event, target});
    }

    resize(){
        if(this.transform && this.element.clientWidth && this.width){
            //TODO This doesn't work very well, but it's suffient to not appear like an obvious bug
            this.transform.x = this.transform.x * (this.element.clientWidth / this.width);
        }

        this.width = this.element.clientWidth;
        this.height = this.element.clientHeight;

        this.basis.range([0, this.width - AXIS_WIDTH]);
        this.scale.range([0, this.width - AXIS_WIDTH]);

        this.updateBandwidth();

        this.emitter.emit('did-resize', {width: this.width, height: this.height});
    }

    updateBandwidth(){
        const [start, end] = this.scale.domain();
        const total = Math.ceil((end - start) / this.granularity);
        this.bandwidth = (this.width - AXIS_WIDTH) / total;
    }

    draw(){
        //Redraw all panels and the X axis
        this.axis.draw();
    }

    attachAxis(){

    }

    consumeActionBar(actionBar){
        this.omnibar = actionBar.omnibar;
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

    getType(){
        return this.type;
    }

    getSymbol(){
        return this.symbol;
    }

    getTypePlugin(){
        return this.plugins.get(this.getType());
    }

    addWarning(warning){
        this.warnings.push(warning);
        this.emitter.emit('did-add-warning', warning);
    }

    removeWarning(warning){
        _.remove(this.warnings, warning);
        this.emitter.emit('did-remove-warning', warning);
    }

    setNextBandTimeout(shift = true){
        if(this.bandTimeout){
            clearTimeout(this.bandTimeout);
        }

        if(shift){
            //Shift the graph to the left by one bandwidth
            this.transform.x -= this.bandwidth;
            this.zoomed({event: {transform: this.transform}});
        }

        const nextCandle = this.nearestCandle(new Date(Date.now() + this.granularity));
        this.bandTimeout = setTimeout(() => this.setNextBandTimeout(), nextCandle.getTime() - Date.now());
    }

    clearWarnings(){
        this.warnings = [];
    }

    changeSymbol(symbol){
        this.symbol = symbol;
        this.emitter.emit('did-change-symbol', symbol);
    }

    changeGranularity(granularity){
        //TODO check to make this is a valid granularity for the symbol
        if(this.granularity !== granularity){
            this.granularity = granularity;
            this.updateBandwidth();
            this.setNextBandTimeout(false);
            this.emitter.emit('did-change-granularity', granularity);
        }
    }

    changeType(type){
        if(this.type !== type){
            this.type = type;
            this.emitter.emit('did-change-type', this.plugins.get(type));
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

    nearestCandle(date){
        return new Date(Math.floor(date.getTime() / this.granularity) * this.granularity);
    }

    addLeftPanel(){

    }

    addRightPanel(){

    }

    addRightPanel(){

    }

    onDidChangeGranularity(callback){
        return this.emitter.on('did-change-granularity', callback);
    }

    onDidChangeData(callback){
        return this.emitter.on('did-change-data', callback);
    }

    onDidChangeType(callback){
        return this.emitter.on('did-change-type', callback);
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
