// A Cross-Browser, Event-based, Element Resize Detection.
// https://github.com/jonataswalker/on-element-resize.js
// Version: v1.0.0
// Built: 2016-03-02T00:39:26-0300

(function(win, doc) {
  'use strict';

  var ElementResize = (function() {

      // internal
      var _ElementResize;

      /**
       * @constructor
       * @param {String|Array<String>|Element|Array<Element>} target String or 
       * array of string, DOM node or array of nodes.
       * @param {Object|undefined} opt_options Options.
       */
      var ElementResize = function(target, opt_options) {
        utils.assert(Array.isArray(target) || utils.typeOf(target) == 'string' ||
          utils.isElement(target), '@param `target` should be Element, String or Array.');

        this.target = target;
        _ElementResize = new ElementResize.Internal(this);
        _ElementResize.init();

      };

      ElementResize.prototype = {
        removeListener: function() {
          _ElementResize.removeListener();
        }

      };

      ElementResize.EventType = {
        resize: 'resize'
      };
      (function(ElementResize, win, doc) {

        // main class
        var _ElementResize;

        ElementResize.Internal = function(resize) {
          _ElementResize = this.Resize = resize;
          this.attachEvent = doc.attachEvent;
          this.stylesCreated = false;
          this.animation = {
            name: 'resizeanim',
            keyframes: undefined,
            style: undefined,
            startevent: 'animationstart'
          };

          // increment internal ids
          this._ids = 0;

          // these are targets we're working on
          this.targets = [];

        };
        ElementResize.Internal.prototype = {
          init: function() {
            this.setListener(this.Resize.target);

          },
          setListener: function(target) {
            var this_ = this,
              ar_target = [],
              element;

            // to array if string
            target = Array.isArray(target) ? target : [target];
            // merge
            Array.prototype.push.apply(ar_target, target);

            ar_target.forEach(function(el, i) {
              element = utils.evaluate(el);

              if (!element) return;

              var id = this_._ids++;
              element._id = id;
              this_.targets[id] = {
                element: element
              };

              this_.addResizeListener(element);
            });
          },
          removeListener: function() {
            var this_ = this;

            this.targets.forEach(function(target) {
              this_.removeResizeListener(target.element);
            });
            this.targets = [];
          },
          detectAnimation: function() {
            /* Detect CSS Animations support to detect element display/re-attach */
            var
              animation = false,
              animationstring = 'animation',
              keyframeprefix = '',
              domPrefixes = ['Webkit', 'Moz', 'O', 'ms'],
              startEvents = [
                'webkitAnimationStart',
                'animationstart',
                'oAnimationStart',
                'MSAnimationStart'
              ],
              pfx = '';
            var elm = doc.createElement('fakeelement');
            if (elm.style.animationName !== undefined) {
              animation = true;
            }

            if (animation === false) {
              for (var i = 0; i < domPrefixes.length; i++) {
                if (elm.style[domPrefixes[i] + 'AnimationName'] !== undefined) {
                  pfx = domPrefixes[i];
                  animationstring = pfx + 'Animation';
                  keyframeprefix = '-' + pfx.toLowerCase() + '-';
                  this.animation.startevent = startEvents[i];
                  animation = true;
                  break;
                }
              }
            }

            var animationKeyframes = [
              '@',
              keyframeprefix,
              'keyframes ',
              this.animation.name,
              ' { from { opacity: 0; } to { opacity: 0; }}'
            ].join('');

            this.animation = {
              keyframes: animationKeyframes,
              style: keyframeprefix + 'animation: 1ms ' + this.animation.name + ';'
            };
          },
          trigger: function(element) {
            _ElementResize.dispatchEvent({
              type: ElementResize.EventType.resize,
              element: {
                target: element,
                offset: utils.offset(element)
              },
              window: utils.getWindowSize()
            });
          },
          scrollListener: function(evt) {
            var this_ = ElementResize.Internal.prototype;
            var element = this;

            this_.resetTriggers(this);
            if (this.__resizeRAF__) cancelFrame(this.__resizeRAF__);
            this.__resizeRAF__ = requestFrame(function() {
              if (this_.checkTriggers(element)) {
                element.__resizeLast__.width = element.offsetWidth;
                element.__resizeLast__.height = element.offsetHeight;
                element.__resizeListeners__.forEach(function() {
                  this_.trigger(element);
                });
              }
            });
          },
          addResizeListener: function(element) {
            var this_ = this;

            if (this.attachEvent) {
              element.attachEvent('onresize', this.trigger);
              return;
            }

            if (!element.__resizeTriggers__) {
              if (win.getComputedStyle(element).position == 'static') {
                element.style.position = 'relative';
              }

              this.createStyles();

              element.__resizeLast__ = {};
              element.__resizeListeners__ = [];
              (element.__resizeTriggers__ = doc.createElement('div')).className =
                'resize-triggers';
              element.__resizeTriggers__.innerHTML =
                '<div class="expand-trigger"><div></div></div>' +
                '<div class="contract-trigger"></div>';
              element.appendChild(element.__resizeTriggers__);

              this.resetTriggers(element);
              element.addEventListener('scroll', this.scrollListener, true);

              /* Listen for a css animation to detect element display/re-attach */

              if (this.animation.startevent) {
                element.__resizeTriggers__.addEventListener(this.animation.startevent,
                  function(e) {
                    if (e.animationName == this.animation.name)
                      this_.resetTriggers(element);
                  });
              }
            }
            // FIXME what to do with this thing?
            element.__resizeListeners__.push(element._id);

          },
          removeResizeListener: function(element) {
            if (this.attachEvent) {
              element.detachEvent('onresize', this.trigger);
              return;
            }
            element.__resizeListeners__.splice(
              element.__resizeListeners__.indexOf(element._id), 1);
            if (!element.__resizeListeners__.length) {
              element.removeEventListener('scroll', this.scrollListener);
              element.__resizeTriggers__ = !element.removeChild(element.__resizeTriggers__);
            }
          },
          createStyles: function() {
            if (this.stylesCreated) return;

            var anim = this.animation;

            //opacity:0 works around a chrome bug
            // https://code.google.com/p/chromium/issues/detail?id=286360

            var css = [
              anim.keyframes ? anim.keyframes : '',
              '.resize-triggers { ',
              anim.style ? anim.style : '',
              'visibility:hidden; opacity:0; } ',
              '.resize-triggers, .resize-triggers > div, .contract-trigger:before { content: \" \"; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; } .resize-triggers > div { background: #eee; overflow: auto; } .contract-trigger:before { width: 200%; height: 200%; }'
            ].join('');

            var head = doc.head || doc.getElementsByTagName('head')[0];
            var style = doc.createElement('style');
            style.type = 'text/css';

            if (style.styleSheet) {
              style.styleSheet.cssText = css;
            } else {
              style.appendChild(doc.createTextNode(css));
            }

            head.appendChild(style);
            this.stylesCreated = true;
          },
          resetTriggers: function(element) {
            var
              triggers = element.__resizeTriggers__,
              expand = triggers.firstElementChild,
              contract = triggers.lastElementChild,
              expandChild = expand.firstElementChild;
            contract.scrollLeft = contract.scrollWidth;
            contract.scrollTop = contract.scrollHeight;
            expandChild.style.width = expand.offsetWidth + 1 + 'px';
            expandChild.style.height = expand.offsetHeight + 1 + 'px';
            expand.scrollLeft = expand.scrollWidth;
            expand.scrollTop = expand.scrollHeight;
          },
          checkTriggers: function(element) {
            return element.offsetWidth != element.__resizeLast__.width ||
              element.offsetHeight != element.__resizeLast__.height;
          }
        };

        var requestFrame = (function() {
          var raf = win.requestAnimationFrame ||
            win.mozRequestAnimationFrame ||
            win.webkitRequestAnimationFrame ||
            function(fn) {
              return win.setTimeout(fn, 20);
            };
          return function(fn) {
            return raf(fn);
          };
        })();

        var cancelFrame = (function() {
          var cancel = win.cancelAnimationFrame ||
            win.mozCancelAnimationFrame ||
            win.webkitCancelAnimationFrame ||
            win.clearTimeout;
          return function(id) {
            return cancel(id);
          };
        })();

      })(ElementResize, win, doc);
      (function(ElementResize, win, doc) {


        ElementResize.Utils = {
          $: function(id) {
            id = (id[0] === '#') ? id.substr(1, id.length) : id;
            return doc.getElementById(id);
          },
          isElement: function(obj) {
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
          offset: function(element) {
            var rect = element.getBoundingClientRect();
            var docEl = doc.documentElement;
            return {
              left: rect.left + win.pageXOffset - docEl.clientLeft,
              top: rect.top + win.pageYOffset - docEl.clientTop,
              width: element.offsetWidth,
              height: element.offsetHeight
            };
          },
          getWindowSize: function() {
            return {
              width: win.innerWidth ||
                doc.documentElement.clientWidth || doc.body.clientWidth,
              height: win.innerHeight ||
                doc.documentElement.clientHeight || doc.body.clientHeight
            };
          },
          toType: function(obj) {
            if (obj == win && obj.doc && obj.location) {
              return 'window';
            } else if (obj == doc) {
              return 'htmldocument';
            } else if (typeof obj === 'string') {
              return 'string';
            } else if (utils.isElement(obj)) {
              return 'element';
            }
          },
          typeOf: function(obj) {
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

        ElementResize.EventDispatcher = function() {};

        ElementResize.EventDispatcher.prototype = {
          constructor: ElementResize.EventDispatcher,
          apply: function(object) {
            object.addEventListener = object.on =
              ElementResize.EventDispatcher.prototype.addEventListener;
            object.hasEventListener =
              ElementResize.EventDispatcher.prototype.hasEventListener;
            object.removeEventListener = object.un =
              ElementResize.EventDispatcher.prototype.removeEventListener;
            object.dispatchEvent = ElementResize.EventDispatcher.prototype.dispatchEvent;
          },
          addEventListener: function(type, listener) {
            if (this._listeners === undefined) this._listeners = {};
            var listeners = this._listeners;
            if (listeners[type] === undefined) {
              listeners[type] = [];
            }

            if (listeners[type].indexOf(listener) === -1) {
              listeners[type].push(listener);
            }
          },
          hasEventListener: function(type, listener) {
            if (this._listeners === undefined) return false;
            var listeners = this._listeners;
            if (listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1) {
              return true;
            }
            return false;
          },
          removeEventListener: function(type, listener) {
            if (this._listeners === undefined) return;
            var listeners = this._listeners;
            var listenerArray = listeners[type];
            if (listenerArray !== undefined) {
              var index = listenerArray.indexOf(listener);
              if (index !== -1) {
                listenerArray.splice(index, 1);
              }
            }
          },
          dispatchEvent: function(event) {
            if (this._listeners === undefined) return;
            var listeners = this._listeners;
            var listenerArray = listeners[event.type];
            if (listenerArray !== undefined) {
              event.target = this;
              var array = [];
              var length = listenerArray.length;
              for (var i = 0; i < length; i++) {
                array[i] = listenerArray[i];
              }
              for (i = 0; i < length; i++) {
                array[i].call(this, event);
              }
            }
          }
        };
      })(ElementResize, win, doc);
      return ElementResize;
    })(),
    utils = ElementResize.Utils;

  ElementResize.EventDispatcher.prototype.apply(ElementResize.prototype);

  if (typeof define === 'function' && define.amd) {
    define(function() {
      return ElementResize;
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = ElementResize;
  } else if (typeof this !== 'undefined') {
    this.ElementResize = ElementResize;
  }
}).call(this, window, document);