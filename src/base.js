// internal
var _WatchElementResize;

/**
 * @constructor
 * @param {String|Array<String>|Element|Array<Element>} target String or 
 * array of string, DOM node or array of nodes.
 * @param {Object|undefined} opt_options Options.
 */
var WatchElementResize = function(target, opt_options) {
  utils.assert(Array.isArray(target) || utils.typeOf(target) == 'string' || 
    utils.isElement(target), '@param `target` should be Element, String or Array.');
  
  this.target = target;
  _WatchElementResize = new WatchElementResize.Internal(this);
  _WatchElementResize.init();

};

WatchElementResize.prototype = {
  removeListener: function(){
    _WatchElementResize.removeListener();
  }

};

WatchElementResize.EventType = {
  resize: 'resize'
};
