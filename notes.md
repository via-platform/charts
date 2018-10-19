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


