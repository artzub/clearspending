/**
 * Created by artzub on 22.04.2014.
 */

L.CategoriesLayer = L.Class.extend({
    options : {
        position : 'topleft',
        categories : null
    },

    /*initialize : function(options) {
        L.Util.setOptions(this.options, options);
    },*/

    onAdd: function (map) {
        if (this._map == map && this.bar) {
            this.bar.show();
            return;
        }

        this._map = map;

        this.options.position = this.options.position || "topleft";

        this.bar = d3.select(map._controlContainer).insert('div', 'firstChild');
        this.bar.classed('leaflet-layer-categories' +
            (this.options.keepOpen ? ' open' : '') +
            ' ' + this.options.position, true);

        this.legend = d3.blackHole.legend(this.bar, 0, 0, this.options.categories);

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

L.categories = function(options) {
    return new L.CategoriesLayer(options);
};
