/**
 * Created by artzub on 22.04.2014.
 */

L.BlackHoleLayer = L.Class.extend({
    options : {
        position : 'topleft' //top-left | top-right | bottom-left | bottom-right
    },

    /**
     * @param categories
     * @param options
     */
    initialize: function (categories, options) {
        this._categories = categories;
    },

    onAdd: function (map) {
        if (this._el && this._map == map) {
            this._el.style('display', null);
            return;
        }

        this._map = map;

        this._el = d3.select(map.getPanes().overlayPane).append('div');
        this._bh = d3.blackHole(this._el);

        this._bh.setting.skipEmptyDate =
            this._bh.setting.createNearParent = true;
        this._bh.setting.zoomAndDrag = false;
        this._bh.setting.drawParent = false;
        this._bh.setting.drawParentLabel = false;
        this._bh.setting.padding = 1;
        this._bh.setting.childLife = 0;
        this._bh.setting.blendingLighter = false;
        this._bh.setting.drawAsPlasma = false;
        this._bh.setting.drawTrack = true;

        var animated = map.options.zoomAnimation && L.Browser.any3d;
        this._el.classed('leaflet-zoom-' + (animated ? 'animated' : 'hide'), true);
        this._el.classed('leaflet-blackhole-layer', true);


        if (animated) {
            map.on('zoomanim', this._animateZoom, this);
        }

        map.on('viewreset', this._reset, this)
            .on('resize', this._resize, this)
            .on('move', this._reset, this)
            .on('moveend', this._reset, this)
        ;
        this._reset();
    },

    onRemove: function (map) {
        this._el.style('display', 'none');
    },

    addTo: function (map) {
        map.addLayer(this);
        return this;
    },

    _resize : function() {
        this._bh.size([this._map._size.x, this._map._size.y]);
        this._reset();
    },

    _reset: function () {
        var topLeft = this._map.containerPointToLayerPoint([0, 0]);

        var arr = [-topLeft.x, -topLeft.y];

        this._bh.style('transform', 'translate3d(' + topLeft.x + 'px, ' + topLeft.y + 'px, 0px)');
        this._bh.translate(arr);
    },

    _animateZoom: function (e) {
        var scale = this._map.getZoomScale(e.zoom),
            offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());

        //TODO подумать о маштабировании частиц.

        //this._canvas.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ')';
        // L.DomUtil.setTransform(this._canvas, offset, scale);
    },

    start : function(data) {
        this._bh &&
        this._bh.start(data, this._map._size.x, this._map._size.y);
        return this;
    }
});

L.blackHoleLayer = function() {
    return new L.BlackHoleLayer();
};
