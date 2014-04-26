/**
 * Created by artzub on 27.04.2014.
 */

L.HistoryBarLayer = L.Class.extend({
    options : {
        position : 'topleft',
        categories : null
    },

    initialize : function(options) {
        this.options = L.Util.setOptions(this.options, options);
    },

    onAdd: function (map) {
        if (this._map == map && this.bar) {
            this.bar.show();
            return;
        }

        this._map = map;

        this.options.position = this.options.position || "topleft";

        this.bar = d3.select(map._controlContainer).insert('div', 'firstChild');
        this.bar.classed('leaflet-layer-history' +
            (this.options.keepOpen ? ' open' : '') +
            ' ' + this.options.position, true);

        this.hbar = d3.blackHole.progressBarBasedOnBrushAndArea(this.bar, 0, 0);
        this.hbar.setting.margin.top = 5;

        this.bar.lastpostion = this.options.position;

        this.bar.hide = function() {
            this.style('display', 'none');
        };

        this.bar.show = function() {
            this.style('display', null);
        };
    },

    addTo : function(map) {
        map.addLayer(this);
        return this;
    },

    getPosition : function() {
        return this.bar ? this.bar.lastpostion || this.options.position : this.options.position;
    },

    setPosition : function(position) {
        this.options.position = position || this.options.position;
        if (this.bar) {
            this.bar.classed(this.bar.lastpostion, false);
            this.bar.lastpostion = this.options.position;
            this.bar.classed(this.bar.lastpostion, true);
        }
    },

    onRemove: function() {
        this.bar.hide();
    }
});

L.historybar = function(options) {
    return new L.HistoryBarLayer(options);
};