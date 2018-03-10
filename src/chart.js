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

const abbreviations = {
    6e4: '1m',
    18e4: '3m',
    3e5: '5m',
    6e5: '10m',
    9e5: '15m',
    18e5: '30m',
    36e5: '1h',
    72e5: '2h',
    108e5: '3h',
    144e5: '4h',
    216e5: '6h',
    288e5: '8h',
    432e5: '12h',
    864e5: '1D',
    2592e5: '3D',
    6048e5: '1W'
};

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
            tools: this.tools.serialize()
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

        this.type = via.config.get('charts.defaultChartType');

        //TODO allow the padding to be customized
        this.padding = 0.2;
        this.bandwidth = 10;
        this.bandInterval = null;
        this.granularity = 0;

        this.basis = d3.scaleTime().domain([new Date(Date.now() - 864e5), new Date()]);
        this.scale = this.basis.copy();

        this.element = document.createElement('div');
        this.element.classList.add('chart', 'pane-item', 'focusable-panel');
        this.element.tabIndex = -1;

        this.changeGranularity(params.granularity || 3e5);

        this.data = new ChartData(this);

        this.resizeObserver = new ResizeObserver(this.resize.bind(this));
        this.resizeObserver.observe(this.element);

        this.disposables.add(via.commands.add(this.element, {
            'charts:zoom-in': () => this.zoom(2),
            'charts:zoom-out': () => this.zoom(0.5),
        }));

        this.initialize(params);
        this.draw();
    }

    initialize(state = {}){
        // debugger;
        this.changeMarket(via.markets.findByIdentifier(this.getURI().slice(BaseURI.length + 1)));

        this.tools = new ChartTools({chart: this, state: state.tools});
        this.panels = new ChartPanels({chart: this, state: state.panels});
        this.axis = new ChartAxis({chart: this});

        this.element.appendChild(this.tools.element);
        this.element.appendChild(this.panels.element);
        this.element.appendChild(this.axis.element);

        //There isn't a great place to initialize uber-general plugins like the crosshairs
        //Might as well do it here...
        this.manager.observePlugins(plugin => {
            if(plugin.type === 'other'){
                plugin.instance({chart: this, tools: this});
            }
        });
    }

    zoom(factor = 2){
        if(!factor) return;

        const x = this.width / 2;
        const ix = this.transform.invertX(x);

        this.transform.k *= factor;
        this.transform.x = x - ix * this.transform.k;

        this.scale.domain(this.transform.rescaleX(this.basis).domain());
        this.updateBandwidth();
        this.emitter.emit('did-zoom');
    }

    zoomed({event, target}){
        this.transform = event.transform;
        this.scale.domain(event.transform.rescaleX(this.basis).domain());
        this.updateBandwidth();
        this.emitter.emit('did-zoom', {event, target});
    }

    mouseover({event, target}){
        this.emitter.emit('did-mouse-over', {event, target});
    }

    mouseout({event, target}){
        this.emitter.emit('did-mouse-out', {event, target});
    }

    mousemove({event, target}){
        this.emitter.emit('did-mouse-move', {event, target});
    }

    resize(){
        if(this.transform && this.element.clientWidth && this.width){
            //We have to subtract out the axis width (since it is fixed at AXIS_WIDTH)
            //If we don't, the ratio of the old-width to new-width is incorrect
            this.transform.x = this.transform.x * ((this.element.clientWidth - AXIS_WIDTH) / (this.width - AXIS_WIDTH));
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
        this.data.destroy();
        this.panels.destroy();
        this.tools.destroy();
        this.axis.destroy();
        this.resizeObserver.disconnect();
        this.emitter.emit('did-destroy');

        this.disposables.dispose();
        this.emitter.dispose();
    }

    getURI(){
        return this.uri;
    }

    getIdentifier(){
        return this.getURI().slice(BaseURI.length + 1);
    }

    getTitle(){
        return this.market ? `${this.market.name}, ${this.getTypePlugin().title}, ${abbreviations[this.granularity]}` : 'Chart';
    }

    getType(){
        return this.type;
    }

    getMarket(){
        return this.market;
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

    changeMarket(market){
        if(!market || market === this.market) return;

        this.market = market;
        this.emitter.emit('did-change-market', market);
        this.emitter.emit('did-change-title');
    }

    changeGranularity(granularity){
        //TODO check to make this is a valid granularity for the symbol
        if(this.granularity !== granularity){
            this.granularity = granularity;
            this.updateBandwidth();
            this.setNextBandTimeout(false);
            this.emitter.emit('did-change-granularity', granularity);
            this.emitter.emit('did-change-title');
        }
    }

    changeType(type){
        if(this.type !== type){
            this.type = type;
            this.emitter.emit('did-change-type', this.plugins.get(type));
            this.emitter.emit('did-change-title');
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

    onDidChangeTitle(callback){
        return this.emitter.on('did-change-title', callback);
    }

    onDidAddWarning(callback){
        return this.emitter.on('did-add-warning', callback);
    }

    onDidRemoveWarning(callback){
        return this.emitter.on('did-remove-warning', callback);
    }

    onDidChangeMarket(callback){
        return this.emitter.on('did-change-market', callback);
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

    onDidMouseOver(callback){
        return this.emitter.on('did-mouse-over', callback);
    }

    onDidMouseMove(callback){
        return this.emitter.on('did-mouse-move', callback);
    }

    onDidMouseOut(callback){
        return this.emitter.on('did-mouse-out', callback);
    }
}
