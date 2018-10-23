# Events

* On initialize, subscribe to the market candles, calculate all layers, and draw all layers.
* On market candles update, calculate all layers and draw all layers.
* On chart move / zoom, request new data and draw all layers.
* On market change, subscribe to new market, calculate all layers, and draw all layers.
* On granularity change, subscribe to new granularity, calculate all layers, and draw all layers.


# Important things to know:

* Axis width due to decimal precision
* Panel domain / scale
* Let a panel know when a layer has recalculated
* Rescale a panel when a parameter has updated
* Somewhere, the params for each indicator must be stored


Indicator class calls create layer with a plugin.
Layer initializes params as defined by the plugin.
If plugin defines a recalculation function, layer uses that, otherwise it recalculates when the chart market updates its candles.
If plugin defines a draw function, layer uses that, otherwise it just draws what has been created by calling the plot function.
If plugin defines a title function, layer uses that, otherwise it just uses what has been created by calling the plot function.

Indicator class calls calculate on indicator definition.
Indicator class now holds the plotted # results so they can be drawn.
Indicator class now holds the domain as well as the decimal precision.


# Weird Edge Cases

* Volume profiles don't use the normal charting mechanisms
* Local High / Low
* Bid / Ask Price


# Other Notes

* I'll probably eliminate current-value in favor of a more generalized price line solution.


# Draw Cycle

* Update data
* Recalculate data for each layer

---or---

* Update chart domain (by panning or zooming)

---or---

* Update triggered by plugin (who may be using another data source)

* Recalculate the visible domain for each layer
* Recalculate the number of significant digits for each layer
* Update the chart offset (sig figs) if necessary
* Update the panel scale if the domain has changed
* Render the layers


Four concepts:

* Recalculate - Reacting to changes in data, recalculating entire series' worth of data points
* Rescale - Determining the sizes and domains of the components with the new data
* Resize - Resizing of the axes / panels if the chart offset has changed, or a panel has been added / remove, or the axis type has changed
* Render - The actual drawing of the axes and plots

On new data: recalculate, rescale, redraw, render
On zoom: rescale, redraw, render