    return WatchElementResize;
  })(),
  utils = WatchElementResize.Utils;
  
  WatchElementResize.EventDispatcher.prototype.apply(WatchElementResize.prototype);
  
  if (typeof define === 'function' && define.amd) {
    define(function () { return WatchElementResize; });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = WatchElementResize;
  } else if (typeof this !== 'undefined') {
    this.WatchElementResize = WatchElementResize;
  }
}).call(this, window, document);