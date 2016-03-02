(function(WatchElementResize, win, doc){
  
  
  WatchElementResize.Utils = {
    $: function(id){
      id = (id[0] === '#') ? id.substr(1, id.length) : id;
      return doc.getElementById(id);
    },
    isElement: function(obj){
      // DOM, Level2
      if ("HTMLElement" in win) {
        return (!!obj && obj instanceof HTMLElement);
      }
      // Older browsers
      return (!!obj && typeof obj === "object" && obj.nodeType === 1 && 
        !!obj.nodeName);
    },
    evaluate: function(element) {
      var el;
      switch (utils.toType(element)) {
        case 'window':
        case 'htmldocument':
        case 'element':
          el = element;
          break;
        case 'string':
          el = utils.$(element);
          break;
      }
      utils.assert(el, "Can't evaluate: @param " + element);
      return el;
    },
    /**
      * @param {HTMLElement} element
      * @param {String}      prop
      * @returns {String|Number}
      */
    getComputedStyle: function(element, prop) {
      if (element.currentStyle) {
        return element.currentStyle[prop];
      } else if (win.getComputedStyle) {
        return win.getComputedStyle(element, null).getPropertyValue(prop);
      } else {
        return element.style[prop];
      }
    },
    offset: function(element){
      var rect = element.getBoundingClientRect();
      var docEl = doc.documentElement;
      return {
        left: rect.left + win.pageXOffset - docEl.clientLeft,
        top: rect.top + win.pageYOffset - docEl.clientTop,
        width: element.offsetWidth,
        height: element.offsetHeight
      };
    },
    getWindowSize: function(){
      return {
        width:
          win.innerWidth ||
          doc.documentElement.clientWidth || doc.body.clientWidth,
        height:
          win.innerHeight ||
          doc.documentElement.clientHeight || doc.body.clientHeight
      };
    },
    toType: function(obj) {
      if(obj == win && obj.doc && obj.location){
        return 'window';
      } else if(obj == doc){
        return 'htmldocument';
      } else if(typeof obj === 'string'){
        return 'string';
      } else if(utils.isElement(obj)){
        return 'element';
      }
    },
    typeOf: function(obj){
      return ({}).toString.call(obj)
        .match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    },
    assert: function(condition, message) {
      if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
          throw new Error(message);
        }
        throw message; // Fallback
      }
    }
  };

  /**
   * @author mrdoob / https://github.com/mrdoob/eventdispatcher.js
  */

  WatchElementResize.EventDispatcher = function () {};

  WatchElementResize.EventDispatcher.prototype = {
    constructor: WatchElementResize.EventDispatcher,
    apply: function ( object ) {
      object.addEventListener = object.on = 
        WatchElementResize.EventDispatcher.prototype.addEventListener;
      object.hasEventListener = 
          WatchElementResize.EventDispatcher.prototype.hasEventListener;
      object.removeEventListener = object.un = 
        WatchElementResize.EventDispatcher.prototype.removeEventListener;
      object.dispatchEvent = WatchElementResize.EventDispatcher.prototype.dispatchEvent;
    },
    addEventListener: function ( type, listener ) {
      if ( this._listeners === undefined ) this._listeners = {};
      var listeners = this._listeners;
      if ( listeners[ type ] === undefined ) {
        listeners[ type ] = [];
      }

      if ( listeners[ type ].indexOf( listener ) === - 1 ) {
        listeners[ type ].push( listener );
      }
    },
    hasEventListener: function ( type, listener ) {
      if ( this._listeners === undefined ) return false;
      var listeners = this._listeners;
      if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {
        return true;
      }
      return false;
    },
    removeEventListener: function ( type, listener ) {
      if ( this._listeners === undefined ) return;
      var listeners = this._listeners;
      var listenerArray = listeners[ type ];
      if ( listenerArray !== undefined ) {
        var index = listenerArray.indexOf( listener );
        if ( index !== - 1 ) {
          listenerArray.splice( index, 1 );
        }
      }
    },
    dispatchEvent: function ( event ) {
      if ( this._listeners === undefined ) return;
      var listeners = this._listeners;
      var listenerArray = listeners[ event.type ];
      if ( listenerArray !== undefined ) {
        event.target = this;
        var array = [];
        var length = listenerArray.length;
        for ( var i = 0; i < length; i ++ ) {
          array[ i ] = listenerArray[ i ];
        }
        for ( i = 0; i < length; i ++ ) {
          array[ i ].call( this, event );
        }
      }
    }
  };
})(WatchElementResize, win, doc);