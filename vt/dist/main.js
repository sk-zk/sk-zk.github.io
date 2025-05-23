function createRadioSelector(
  parentId,
  groupId,
  options,
  callback,
  createCustomField = false
) {
  const div = document.createElement("div");
  for (const option of options) {
    const button = document.createElement("input");
    const id = groupId + "-" + option.value;
    button.type = "radio";
    button.id = id; 
    button.name = groupId;
    if (option.checked) {
      button.checked = true;
    }
    button.addEventListener("change", (_) => {
      callback(option.value);
    });
    div.appendChild(button);

    const label = document.createElement("label");
    label.htmlFor = id;
    label.innerText = option.description;
    div.appendChild(label);

    div.appendChild(document.createElement("br"));
  }
  if (createCustomField) {
    const custom = document.createElement("input");
    const id = groupId + "-custom";
    custom.type = "radio";
    custom.id = id;
    custom.name = groupId;
    div.appendChild(custom);

    const label = document.createElement("label");
    label.htmlFor = id;
    label.innerText = "Custom: ";
    div.appendChild(label);

    const textBox = document.createElement("input");
    textBox.type = "number";
    textBox.required = true;
    textBox.min = "0";
    textBox.value = options[0].value;
    div.appendChild(textBox);

    custom.addEventListener("change", (_) => {
      if (textBox.value != "") {
        callback(textBox.value);
      }
    });
    textBox.addEventListener("input", (_) => {
      if (custom.checked && textBox.value != "") {
        callback(textBox.value);
      }
    });

    div.appendChild(document.createElement("br"));
  }
  const container = document.getElementById(parentId);
  container.appendChild(div);
}

function createCheckBox(
  parentId,
  id,
  description,
  checkedInitially,
  callback
) {
  const div = document.createElement("div");
  const chk = document.createElement("input");
  chk.type = "checkbox";
  chk.id = id;
  chk.name = id;
  chk.checked = checkedInitially;
  chk.addEventListener("change", (_) => {
    callback(chk.checked);
  });
  div.appendChild(chk);
  const label = document.createElement("label");
  label.htmlFor = chk.id;
  label.innerText = description;
  div.appendChild(label);
  const container = document.getElementById(parentId);
  container.appendChild(div);
}

const LayerType = Object.freeze({
  Road: 0,
  Satellite: 1,
  Overlay: 2,
  TerrainAll: 4,
  TerrainRelief: 5,
  TerrainContours: 6,
  None: 99999,
});

const ToggleType = Object.freeze({
  Normal: 1,

  HighDpi: 2,

  /** No text or icons are displayed. */ 
  NoLabels: 3,

  SatelliteOverlay: 4,

  BigRoadIcons: 13,

  LabelsAndIconsOnly: 15,

  WhiteRoads: 21,

  MapStyle: 26,

  StreetViewDarkBlue: 40,

  /** Google Maps uses this style if terrain is enabled. */ 
  WhiteAndGrayRoads: 63,

  /** Enables the terrain overlay in conjunction with adding base layers 5 and 6. */
  Terrain: 67,

  SomeSortOfOverlayThing: 68,
});

const RasterType = Object.freeze({
  PNG: 0,
  JPG: 1,
  GIF: 2,
  WEBP: 3,
  DDS: 4,
});

class Field {
  constructor(id, type, value) {
    this.id = id;
    this.type = type;
    this.value = value;
  }

  count() {
    return 1;
  }

  toString() {
    let valueStr;
    if (typeof this.value === "boolean") {
      valueStr = +this.value; // cast to int
    } else {
      valueStr = this.value;
    }
    return `${this.id}${this.type}${valueStr}`;
  }
}

class Message {
  constructor(id, fields) {
    this.id = id;
    this.fields = fields;
  }

  count() {
    return this.fields.reduce((acc, field) => acc + field.count(), 1);
  }

  toString(isParent = false) {
    const fieldsStr = this.fields
      .sort((a, b) => a.id - b.id)
      .map((f) => f.toString())
      .join("!");
    if (isParent) {
      return `!${fieldsStr}`;
    } else {
      const count = this.count();
      return `${this.id}m${count - 1}!${fieldsStr}`;
    }
  }
}

let Layer$2 = class Layer {
  constructor(id, name, otherFields) {
    this.id = id;
    if (name) {
      this.name = name;
    }
    this.otherFields = otherFields ? otherFields : [];
  }

  toMessage() {
    const message = new Message(2, [
      new Field(1, "e", this.id),
      ...this.otherFields,
    ]);
    if (this.name) {
      message.fields.push(new Field(2, "s", this.name));
    }
    return message;
  }
};

class Toggle {
  constructor(id, otherFields) {
    this.id = id;
    this.otherFields = otherFields ? otherFields : [];
  }

  toMessage() {
    return new Message(12, [
      new Field(1, "e", this.id),
      ...this.otherFields,
    ]);
  }
}

/**
 * @module ol/events/Event
 */

/**
 * @classdesc
 * Stripped down implementation of the W3C DOM Level 2 Event interface.
 * See https://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-interface.
 *
 * This implementation only provides `type` and `target` properties, and
 * `stopPropagation` and `preventDefault` methods. It is meant as base class
 * for higher level events defined in the library, and works with
 * {@link module:ol/events/Target~Target}.
 */
class BaseEvent {
  /**
   * @param {string} type Type.
   */
  constructor(type) {
    /**
     * @type {boolean}
     */
    this.propagationStopped;

    /**
     * @type {boolean}
     */
    this.defaultPrevented;

    /**
     * The event type.
     * @type {string}
     * @api
     */
    this.type = type;

    /**
     * The event target.
     * @type {Object}
     * @api
     */
    this.target = null;
  }

  /**
   * Prevent default. This means that no emulated `click`, `singleclick` or `doubleclick` events
   * will be fired.
   * @api
   */
  preventDefault() {
    this.defaultPrevented = true;
  }

  /**
   * Stop event propagation.
   * @api
   */
  stopPropagation() {
    this.propagationStopped = true;
  }
}

var Event = BaseEvent;

/**
 * @module ol/ObjectEventType
 */

/**
 * @enum {string}
 */
var ObjectEventType = {
  /**
   * Triggered when a property is changed.
   * @event module:ol/Object.ObjectEvent#propertychange
   * @api
   */
  PROPERTYCHANGE: 'propertychange',
};

/**
 * @typedef {'propertychange'} Types
 */

/**
 * @module ol/Disposable
 */

/**
 * @classdesc
 * Objects that need to clean up after themselves.
 */
class Disposable {
  constructor() {
    /**
     * The object has already been disposed.
     * @type {boolean}
     * @protected
     */
    this.disposed = false;
  }

  /**
   * Clean up.
   */
  dispose() {
    if (!this.disposed) {
      this.disposed = true;
      this.disposeInternal();
    }
  }

  /**
   * Extension point for disposable objects.
   * @protected
   */
  disposeInternal() {}
}

var Disposable$1 = Disposable;

/**
 * @module ol/array
 */

/**
 * Compare function sorting arrays in ascending order.  Safe to use for numeric values.
 * @param {*} a The first object to be compared.
 * @param {*} b The second object to be compared.
 * @return {number} A negative number, zero, or a positive number as the first
 *     argument is less than, equal to, or greater than the second.
 */
function ascending(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
}

/**
 * {@link module:ol/tilegrid/TileGrid~TileGrid#getZForResolution} can use a function
 * of this type to determine which nearest resolution to use.
 *
 * This function takes a `{number}` representing a value between two array entries,
 * a `{number}` representing the value of the nearest higher entry and
 * a `{number}` representing the value of the nearest lower entry
 * as arguments and returns a `{number}`. If a negative number or zero is returned
 * the lower value will be used, if a positive number is returned the higher value
 * will be used.
 * @typedef {function(number, number, number): number} NearestDirectionFunction
 * @api
 */

/**
 * @param {Array<number>} arr Array in descending order.
 * @param {number} target Target.
 * @param {number|NearestDirectionFunction} direction
 *    0 means return the nearest,
 *    > 0 means return the largest nearest,
 *    < 0 means return the smallest nearest.
 * @return {number} Index.
 */
function linearFindNearest(arr, target, direction) {
  const n = arr.length;
  if (arr[0] <= target) {
    return 0;
  } else if (target <= arr[n - 1]) {
    return n - 1;
  }
  let i;
  if (direction > 0) {
    for (i = 1; i < n; ++i) {
      if (arr[i] < target) {
        return i - 1;
      }
    }
  } else if (direction < 0) {
    for (i = 1; i < n; ++i) {
      if (arr[i] <= target) {
        return i;
      }
    }
  } else {
    for (i = 1; i < n; ++i) {
      if (arr[i] == target) {
        return i;
      } else if (arr[i] < target) {
        if (typeof direction === 'function') {
          if (direction(target, arr[i - 1], arr[i]) > 0) {
            return i - 1;
          }
          return i;
        } else if (arr[i - 1] - target < target - arr[i]) {
          return i - 1;
        }
        return i;
      }
    }
  }
  return n - 1;
}

/**
 * @param {Array<VALUE>} arr The array to modify.
 * @param {!Array<VALUE>|VALUE} data The elements or arrays of elements to add to arr.
 * @template VALUE
 */
function extend$1(arr, data) {
  const extension = Array.isArray(data) ? data : [data];
  const length = extension.length;
  for (let i = 0; i < length; i++) {
    arr[arr.length] = extension[i];
  }
}

/**
 * @param {Array|Uint8ClampedArray} arr1 The first array to compare.
 * @param {Array|Uint8ClampedArray} arr2 The second array to compare.
 * @return {boolean} Whether the two arrays are equal.
 */
function equals$2(arr1, arr2) {
  const len1 = arr1.length;
  if (len1 !== arr2.length) {
    return false;
  }
  for (let i = 0; i < len1; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

/**
 * @param {Array<*>} arr The array to test.
 * @param {Function} [func] Comparison function.
 * @param {boolean} [strict] Strictly sorted (default false).
 * @return {boolean} Return index.
 */
function isSorted(arr, func, strict) {
  const compare = func || ascending;
  return arr.every(function (currentVal, index) {
    if (index === 0) {
      return true;
    }
    const res = compare(arr[index - 1], currentVal);
    return !(res > 0 || (strict && res === 0));
  });
}

/**
 * @module ol/functions
 */

/**
 * Always returns true.
 * @return {boolean} true.
 */
function TRUE() {
  return true;
}

/**
 * Always returns false.
 * @return {boolean} false.
 */
function FALSE() {
  return false;
}

/**
 * A reusable function, used e.g. as a default for callbacks.
 *
 * @return {void} Nothing.
 */
function VOID() {}

/**
 * Wrap a function in another function that remembers the last return.  If the
 * returned function is called twice in a row with the same arguments and the same
 * this object, it will return the value from the first call in the second call.
 *
 * @param {function(...any): ReturnType} fn The function to memoize.
 * @return {function(...any): ReturnType} The memoized function.
 * @template ReturnType
 */
function memoizeOne(fn) {
  let called = false;

  /** @type {ReturnType} */
  let lastResult;

  /** @type {Array<any>} */
  let lastArgs;

  let lastThis;

  return function () {
    const nextArgs = Array.prototype.slice.call(arguments);
    if (!called || this !== lastThis || !equals$2(nextArgs, lastArgs)) {
      called = true;
      lastThis = this;
      lastArgs = nextArgs;
      lastResult = fn.apply(this, arguments);
    }
    return lastResult;
  };
}

/**
 * @module ol/obj
 */

/**
 * Removes all properties from an object.
 * @param {Object} object The object to clear.
 */
function clear(object) {
  for (const property in object) {
    delete object[property];
  }
}

/**
 * Determine if an object has any properties.
 * @param {Object} object The object to check.
 * @return {boolean} The object is empty.
 */
function isEmpty$1(object) {
  let property;
  for (property in object) {
    return false;
  }
  return !property;
}

/**
 * @module ol/events/Target
 */

/**
 * @typedef {EventTarget|Target} EventTargetLike
 */

/**
 * @classdesc
 * A simplified implementation of the W3C DOM Level 2 EventTarget interface.
 * See https://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/events.html#Events-EventTarget.
 *
 * There are two important simplifications compared to the specification:
 *
 * 1. The handling of `useCapture` in `addEventListener` and
 *    `removeEventListener`. There is no real capture model.
 * 2. The handling of `stopPropagation` and `preventDefault` on `dispatchEvent`.
 *    There is no event target hierarchy. When a listener calls
 *    `stopPropagation` or `preventDefault` on an event object, it means that no
 *    more listeners after this one will be called. Same as when the listener
 *    returns false.
 */
class Target extends Disposable$1 {
  /**
   * @param {*} [target] Default event target for dispatched events.
   */
  constructor(target) {
    super();

    /**
     * @private
     * @type {*}
     */
    this.eventTarget_ = target;

    /**
     * @private
     * @type {Object<string, number>}
     */
    this.pendingRemovals_ = null;

    /**
     * @private
     * @type {Object<string, number>}
     */
    this.dispatching_ = null;

    /**
     * @private
     * @type {Object<string, Array<import("../events.js").Listener>>}
     */
    this.listeners_ = null;
  }

  /**
   * @param {string} type Type.
   * @param {import("../events.js").Listener} listener Listener.
   */
  addEventListener(type, listener) {
    if (!type || !listener) {
      return;
    }
    const listeners = this.listeners_ || (this.listeners_ = {});
    const listenersForType = listeners[type] || (listeners[type] = []);
    if (!listenersForType.includes(listener)) {
      listenersForType.push(listener);
    }
  }

  /**
   * Dispatches an event and calls all listeners listening for events
   * of this type. The event parameter can either be a string or an
   * Object with a `type` property.
   *
   * @param {import("./Event.js").default|string} event Event object.
   * @return {boolean|undefined} `false` if anyone called preventDefault on the
   *     event object or if any of the listeners returned false.
   * @api
   */
  dispatchEvent(event) {
    const isString = typeof event === 'string';
    const type = isString ? event : event.type;
    const listeners = this.listeners_ && this.listeners_[type];
    if (!listeners) {
      return;
    }

    const evt = isString ? new Event(event) : /** @type {Event} */ (event);
    if (!evt.target) {
      evt.target = this.eventTarget_ || this;
    }
    const dispatching = this.dispatching_ || (this.dispatching_ = {});
    const pendingRemovals =
      this.pendingRemovals_ || (this.pendingRemovals_ = {});
    if (!(type in dispatching)) {
      dispatching[type] = 0;
      pendingRemovals[type] = 0;
    }
    ++dispatching[type];
    let propagate;
    for (let i = 0, ii = listeners.length; i < ii; ++i) {
      if ('handleEvent' in listeners[i]) {
        propagate = /** @type {import("../events.js").ListenerObject} */ (
          listeners[i]
        ).handleEvent(evt);
      } else {
        propagate = /** @type {import("../events.js").ListenerFunction} */ (
          listeners[i]
        ).call(this, evt);
      }
      if (propagate === false || evt.propagationStopped) {
        propagate = false;
        break;
      }
    }
    if (--dispatching[type] === 0) {
      let pr = pendingRemovals[type];
      delete pendingRemovals[type];
      while (pr--) {
        this.removeEventListener(type, VOID);
      }
      delete dispatching[type];
    }
    return propagate;
  }

  /**
   * Clean up.
   */
  disposeInternal() {
    this.listeners_ && clear(this.listeners_);
  }

  /**
   * Get the listeners for a specified event type. Listeners are returned in the
   * order that they will be called in.
   *
   * @param {string} type Type.
   * @return {Array<import("../events.js").Listener>|undefined} Listeners.
   */
  getListeners(type) {
    return (this.listeners_ && this.listeners_[type]) || undefined;
  }

  /**
   * @param {string} [type] Type. If not provided,
   *     `true` will be returned if this event target has any listeners.
   * @return {boolean} Has listeners.
   */
  hasListener(type) {
    if (!this.listeners_) {
      return false;
    }
    return type
      ? type in this.listeners_
      : Object.keys(this.listeners_).length > 0;
  }

  /**
   * @param {string} type Type.
   * @param {import("../events.js").Listener} listener Listener.
   */
  removeEventListener(type, listener) {
    const listeners = this.listeners_ && this.listeners_[type];
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        if (this.pendingRemovals_ && type in this.pendingRemovals_) {
          // make listener a no-op, and remove later in #dispatchEvent()
          listeners[index] = VOID;
          ++this.pendingRemovals_[type];
        } else {
          listeners.splice(index, 1);
          if (listeners.length === 0) {
            delete this.listeners_[type];
          }
        }
      }
    }
  }
}

var EventTarget = Target;

/**
 * @module ol/events/EventType
 */

/**
 * @enum {string}
 * @const
 */
var EventType = {
  /**
   * Generic change event. Triggered when the revision counter is increased.
   * @event module:ol/events/Event~BaseEvent#change
   * @api
   */
  CHANGE: 'change',

  /**
   * Generic error event. Triggered when an error occurs.
   * @event module:ol/events/Event~BaseEvent#error
   * @api
   */
  ERROR: 'error',

  BLUR: 'blur',
  CLEAR: 'clear',
  CONTEXTMENU: 'contextmenu',
  CLICK: 'click',
  DBLCLICK: 'dblclick',
  DRAGENTER: 'dragenter',
  DRAGOVER: 'dragover',
  DROP: 'drop',
  FOCUS: 'focus',
  KEYDOWN: 'keydown',
  KEYPRESS: 'keypress',
  LOAD: 'load',
  RESIZE: 'resize',
  TOUCHMOVE: 'touchmove',
  WHEEL: 'wheel',
};

/**
 * @module ol/events
 */

/**
 * Key to use with {@link module:ol/Observable.unByKey}.
 * @typedef {Object} EventsKey
 * @property {ListenerFunction} listener Listener.
 * @property {import("./events/Target.js").EventTargetLike} target Target.
 * @property {string} type Type.
 * @api
 */

/**
 * Listener function. This function is called with an event object as argument.
 * When the function returns `false`, event propagation will stop.
 *
 * @typedef {function((Event|import("./events/Event.js").default)): (void|boolean)} ListenerFunction
 * @api
 */

/**
 * @typedef {Object} ListenerObject
 * @property {ListenerFunction} handleEvent HandleEvent listener function.
 */

/**
 * @typedef {ListenerFunction|ListenerObject} Listener
 */

/**
 * Registers an event listener on an event target. Inspired by
 * https://google.github.io/closure-library/api/source/closure/goog/events/events.js.src.html
 *
 * This function efficiently binds a `listener` to a `this` object, and returns
 * a key for use with {@link module:ol/events.unlistenByKey}.
 *
 * @param {import("./events/Target.js").EventTargetLike} target Event target.
 * @param {string} type Event type.
 * @param {ListenerFunction} listener Listener.
 * @param {Object} [thisArg] Object referenced by the `this` keyword in the
 *     listener. Default is the `target`.
 * @param {boolean} [once] If true, add the listener as one-off listener.
 * @return {EventsKey} Unique key for the listener.
 */
function listen(target, type, listener, thisArg, once) {
  if (thisArg && thisArg !== target) {
    listener = listener.bind(thisArg);
  }
  if (once) {
    const originalListener = listener;
    listener = function () {
      target.removeEventListener(type, listener);
      originalListener.apply(this, arguments);
    };
  }
  const eventsKey = {
    target: target,
    type: type,
    listener: listener,
  };
  target.addEventListener(type, listener);
  return eventsKey;
}

/**
 * Registers a one-off event listener on an event target. Inspired by
 * https://google.github.io/closure-library/api/source/closure/goog/events/events.js.src.html
 *
 * This function efficiently binds a `listener` as self-unregistering listener
 * to a `this` object, and returns a key for use with
 * {@link module:ol/events.unlistenByKey} in case the listener needs to be
 * unregistered before it is called.
 *
 * When {@link module:ol/events.listen} is called with the same arguments after this
 * function, the self-unregistering listener will be turned into a permanent
 * listener.
 *
 * @param {import("./events/Target.js").EventTargetLike} target Event target.
 * @param {string} type Event type.
 * @param {ListenerFunction} listener Listener.
 * @param {Object} [thisArg] Object referenced by the `this` keyword in the
 *     listener. Default is the `target`.
 * @return {EventsKey} Key for unlistenByKey.
 */
function listenOnce(target, type, listener, thisArg) {
  return listen(target, type, listener, thisArg, true);
}

/**
 * Unregisters event listeners on an event target. Inspired by
 * https://google.github.io/closure-library/api/source/closure/goog/events/events.js.src.html
 *
 * The argument passed to this function is the key returned from
 * {@link module:ol/events.listen} or {@link module:ol/events.listenOnce}.
 *
 * @param {EventsKey} key The key.
 */
function unlistenByKey(key) {
  if (key && key.target) {
    key.target.removeEventListener(key.type, key.listener);
    clear(key);
  }
}

/**
 * @module ol/Observable
 */

/***
 * @template {string} Type
 * @template {Event|import("./events/Event.js").default} EventClass
 * @template Return
 * @typedef {(type: Type, listener: (event: EventClass) => ?) => Return} OnSignature
 */

/***
 * @template {string} Type
 * @template Return
 * @typedef {(type: Type[], listener: (event: Event|import("./events/Event").default) => ?) => Return extends void ? void : Return[]} CombinedOnSignature
 */

/**
 * @typedef {'change'|'error'} EventTypes
 */

/***
 * @template Return
 * @typedef {OnSignature<EventTypes, import("./events/Event.js").default, Return> & CombinedOnSignature<EventTypes, Return>} ObservableOnSignature
 */

/**
 * @classdesc
 * Abstract base class; normally only used for creating subclasses and not
 * instantiated in apps.
 * An event target providing convenient methods for listener registration
 * and unregistration. A generic `change` event is always available through
 * {@link module:ol/Observable~Observable#changed}.
 *
 * @fires import("./events/Event.js").default
 * @api
 */
class Observable extends EventTarget {
  constructor() {
    super();

    this.on =
      /** @type {ObservableOnSignature<import("./events").EventsKey>} */ (
        this.onInternal
      );

    this.once =
      /** @type {ObservableOnSignature<import("./events").EventsKey>} */ (
        this.onceInternal
      );

    this.un = /** @type {ObservableOnSignature<void>} */ (this.unInternal);

    /**
     * @private
     * @type {number}
     */
    this.revision_ = 0;
  }

  /**
   * Increases the revision counter and dispatches a 'change' event.
   * @api
   */
  changed() {
    ++this.revision_;
    this.dispatchEvent(EventType.CHANGE);
  }

  /**
   * Get the version number for this object.  Each time the object is modified,
   * its version number will be incremented.
   * @return {number} Revision.
   * @api
   */
  getRevision() {
    return this.revision_;
  }

  /**
   * @param {string|Array<string>} type Type.
   * @param {function((Event|import("./events/Event").default)): ?} listener Listener.
   * @return {import("./events.js").EventsKey|Array<import("./events.js").EventsKey>} Event key.
   * @protected
   */
  onInternal(type, listener) {
    if (Array.isArray(type)) {
      const len = type.length;
      const keys = new Array(len);
      for (let i = 0; i < len; ++i) {
        keys[i] = listen(this, type[i], listener);
      }
      return keys;
    }
    return listen(this, /** @type {string} */ (type), listener);
  }

  /**
   * @param {string|Array<string>} type Type.
   * @param {function((Event|import("./events/Event").default)): ?} listener Listener.
   * @return {import("./events.js").EventsKey|Array<import("./events.js").EventsKey>} Event key.
   * @protected
   */
  onceInternal(type, listener) {
    let key;
    if (Array.isArray(type)) {
      const len = type.length;
      key = new Array(len);
      for (let i = 0; i < len; ++i) {
        key[i] = listenOnce(this, type[i], listener);
      }
    } else {
      key = listenOnce(this, /** @type {string} */ (type), listener);
    }
    /** @type {Object} */ (listener).ol_key = key;
    return key;
  }

  /**
   * Unlisten for a certain type of event.
   * @param {string|Array<string>} type Type.
   * @param {function((Event|import("./events/Event").default)): ?} listener Listener.
   * @protected
   */
  unInternal(type, listener) {
    const key = /** @type {Object} */ (listener).ol_key;
    if (key) {
      unByKey(key);
    } else if (Array.isArray(type)) {
      for (let i = 0, ii = type.length; i < ii; ++i) {
        this.removeEventListener(type[i], listener);
      }
    } else {
      this.removeEventListener(type, listener);
    }
  }
}

/**
 * Listen for a certain type of event.
 * @function
 * @param {string|Array<string>} type The event type or array of event types.
 * @param {function((Event|import("./events/Event").default)): ?} listener The listener function.
 * @return {import("./events.js").EventsKey|Array<import("./events.js").EventsKey>} Unique key for the listener. If
 *     called with an array of event types as the first argument, the return
 *     will be an array of keys.
 * @api
 */
Observable.prototype.on;

/**
 * Listen once for a certain type of event.
 * @function
 * @param {string|Array<string>} type The event type or array of event types.
 * @param {function((Event|import("./events/Event").default)): ?} listener The listener function.
 * @return {import("./events.js").EventsKey|Array<import("./events.js").EventsKey>} Unique key for the listener. If
 *     called with an array of event types as the first argument, the return
 *     will be an array of keys.
 * @api
 */
Observable.prototype.once;

/**
 * Unlisten for a certain type of event.
 * @function
 * @param {string|Array<string>} type The event type or array of event types.
 * @param {function((Event|import("./events/Event").default)): ?} listener The listener function.
 * @api
 */
Observable.prototype.un;

/**
 * Removes an event listener using the key returned by `on()` or `once()`.
 * @param {import("./events.js").EventsKey|Array<import("./events.js").EventsKey>} key The key returned by `on()`
 *     or `once()` (or an array of keys).
 * @api
 */
function unByKey(key) {
  if (Array.isArray(key)) {
    for (let i = 0, ii = key.length; i < ii; ++i) {
      unlistenByKey(key[i]);
    }
  } else {
    unlistenByKey(/** @type {import("./events.js").EventsKey} */ (key));
  }
}

var Observable$1 = Observable;

/**
 * @module ol/util
 */

/**
 * @return {never} Any return.
 */
function abstract() {
  throw new Error('Unimplemented abstract method.');
}

/**
 * Counter for getUid.
 * @type {number}
 * @private
 */
let uidCounter_ = 0;

/**
 * Gets a unique ID for an object. This mutates the object so that further calls
 * with the same object as a parameter returns the same value. Unique IDs are generated
 * as a strictly increasing sequence. Adapted from goog.getUid.
 *
 * @param {Object} obj The object to get the unique ID for.
 * @return {string} The unique ID for the object.
 * @api
 */
function getUid(obj) {
  return obj.ol_uid || (obj.ol_uid = String(++uidCounter_));
}

/**
 * @module ol/Object
 */

/**
 * @classdesc
 * Events emitted by {@link module:ol/Object~BaseObject} instances are instances of this type.
 */
class ObjectEvent extends Event {
  /**
   * @param {string} type The event type.
   * @param {string} key The property name.
   * @param {*} oldValue The old value for `key`.
   */
  constructor(type, key, oldValue) {
    super(type);

    /**
     * The name of the property whose value is changing.
     * @type {string}
     * @api
     */
    this.key = key;

    /**
     * The old value. To get the new value use `e.target.get(e.key)` where
     * `e` is the event object.
     * @type {*}
     * @api
     */
    this.oldValue = oldValue;
  }
}

/***
 * @template Return
 * @typedef {import("./Observable").OnSignature<import("./Observable").EventTypes, import("./events/Event.js").default, Return> &
 *    import("./Observable").OnSignature<import("./ObjectEventType").Types, ObjectEvent, Return> &
 *    import("./Observable").CombinedOnSignature<import("./Observable").EventTypes|import("./ObjectEventType").Types, Return>} ObjectOnSignature
 */

/**
 * @classdesc
 * Abstract base class; normally only used for creating subclasses and not
 * instantiated in apps.
 * Most non-trivial classes inherit from this.
 *
 * This extends {@link module:ol/Observable~Observable} with observable
 * properties, where each property is observable as well as the object as a
 * whole.
 *
 * Classes that inherit from this have pre-defined properties, to which you can
 * add your owns. The pre-defined properties are listed in this documentation as
 * 'Observable Properties', and have their own accessors; for example,
 * {@link module:ol/Map~Map} has a `target` property, accessed with
 * `getTarget()` and changed with `setTarget()`. Not all properties are however
 * settable. There are also general-purpose accessors `get()` and `set()`. For
 * example, `get('target')` is equivalent to `getTarget()`.
 *
 * The `set` accessors trigger a change event, and you can monitor this by
 * registering a listener. For example, {@link module:ol/View~View} has a
 * `center` property, so `view.on('change:center', function(evt) {...});` would
 * call the function whenever the value of the center property changes. Within
 * the function, `evt.target` would be the view, so `evt.target.getCenter()`
 * would return the new center.
 *
 * You can add your own observable properties with
 * `object.set('prop', 'value')`, and retrieve that with `object.get('prop')`.
 * You can listen for changes on that property value with
 * `object.on('change:prop', listener)`. You can get a list of all
 * properties with {@link module:ol/Object~BaseObject#getProperties}.
 *
 * Note that the observable properties are separate from standard JS properties.
 * You can, for example, give your map object a title with
 * `map.title='New title'` and with `map.set('title', 'Another title')`. The
 * first will be a `hasOwnProperty`; the second will appear in
 * `getProperties()`. Only the second is observable.
 *
 * Properties can be deleted by using the unset method. E.g.
 * object.unset('foo').
 *
 * @fires ObjectEvent
 * @api
 */
class BaseObject extends Observable$1 {
  /**
   * @param {Object<string, *>} [values] An object with key-value pairs.
   */
  constructor(values) {
    super();

    /***
     * @type {ObjectOnSignature<import("./events").EventsKey>}
     */
    this.on;

    /***
     * @type {ObjectOnSignature<import("./events").EventsKey>}
     */
    this.once;

    /***
     * @type {ObjectOnSignature<void>}
     */
    this.un;

    // Call {@link module:ol/util.getUid} to ensure that the order of objects' ids is
    // the same as the order in which they were created.  This also helps to
    // ensure that object properties are always added in the same order, which
    // helps many JavaScript engines generate faster code.
    getUid(this);

    /**
     * @private
     * @type {Object<string, *>}
     */
    this.values_ = null;

    if (values !== undefined) {
      this.setProperties(values);
    }
  }

  /**
   * Gets a value.
   * @param {string} key Key name.
   * @return {*} Value.
   * @api
   */
  get(key) {
    let value;
    if (this.values_ && this.values_.hasOwnProperty(key)) {
      value = this.values_[key];
    }
    return value;
  }

  /**
   * Get a list of object property names.
   * @return {Array<string>} List of property names.
   * @api
   */
  getKeys() {
    return (this.values_ && Object.keys(this.values_)) || [];
  }

  /**
   * Get an object of all property names and values.
   * @return {Object<string, *>} Object.
   * @api
   */
  getProperties() {
    return (this.values_ && Object.assign({}, this.values_)) || {};
  }

  /**
   * @return {boolean} The object has properties.
   */
  hasProperties() {
    return !!this.values_;
  }

  /**
   * @param {string} key Key name.
   * @param {*} oldValue Old value.
   */
  notify(key, oldValue) {
    let eventType;
    eventType = `change:${key}`;
    if (this.hasListener(eventType)) {
      this.dispatchEvent(new ObjectEvent(eventType, key, oldValue));
    }
    eventType = ObjectEventType.PROPERTYCHANGE;
    if (this.hasListener(eventType)) {
      this.dispatchEvent(new ObjectEvent(eventType, key, oldValue));
    }
  }

  /**
   * @param {string} key Key name.
   * @param {import("./events.js").Listener} listener Listener.
   */
  addChangeListener(key, listener) {
    this.addEventListener(`change:${key}`, listener);
  }

  /**
   * @param {string} key Key name.
   * @param {import("./events.js").Listener} listener Listener.
   */
  removeChangeListener(key, listener) {
    this.removeEventListener(`change:${key}`, listener);
  }

  /**
   * Sets a value.
   * @param {string} key Key name.
   * @param {*} value Value.
   * @param {boolean} [silent] Update without triggering an event.
   * @api
   */
  set(key, value, silent) {
    const values = this.values_ || (this.values_ = {});
    if (silent) {
      values[key] = value;
    } else {
      const oldValue = values[key];
      values[key] = value;
      if (oldValue !== value) {
        this.notify(key, oldValue);
      }
    }
  }

  /**
   * Sets a collection of key-value pairs.  Note that this changes any existing
   * properties and adds new ones (it does not remove any existing properties).
   * @param {Object<string, *>} values Values.
   * @param {boolean} [silent] Update without triggering an event.
   * @api
   */
  setProperties(values, silent) {
    for (const key in values) {
      this.set(key, values[key], silent);
    }
  }

  /**
   * Apply any properties from another object without triggering events.
   * @param {BaseObject} source The source object.
   * @protected
   */
  applyProperties(source) {
    if (!source.values_) {
      return;
    }
    Object.assign(this.values_ || (this.values_ = {}), source.values_);
  }

  /**
   * Unsets a property.
   * @param {string} key Key name.
   * @param {boolean} [silent] Unset without triggering an event.
   * @api
   */
  unset(key, silent) {
    if (this.values_ && key in this.values_) {
      const oldValue = this.values_[key];
      delete this.values_[key];
      if (isEmpty$1(this.values_)) {
        this.values_ = null;
      }
      if (!silent) {
        this.notify(key, oldValue);
      }
    }
  }
}

var BaseObject$1 = BaseObject;

/**
 * @module ol/AssertionError
 */

/** @type {Object<number, string>} */
const messages = {
  1: 'The view center is not defined',
  2: 'The view resolution is not defined',
  3: 'The view rotation is not defined',
  4: '`image` and `src` cannot be provided at the same time',
  5: '`imgSize` must be set when `image` is provided',
  7: '`format` must be set when `url` is set',
  8: 'Unknown `serverType` configured',
  9: '`url` must be configured or set using `#setUrl()`',
  10: 'The default `geometryFunction` can only handle `Point` geometries',
  11: '`options.featureTypes` must be an Array',
  12: '`options.geometryName` must also be provided when `options.bbox` is set',
  13: 'Invalid corner',
  14: 'Invalid color',
  15: 'Tried to get a value for a key that does not exist in the cache',
  16: 'Tried to set a value for a key that is used already',
  17: '`resolutions` must be sorted in descending order',
  18: 'Either `origin` or `origins` must be configured, never both',
  19: 'Number of `tileSizes` and `resolutions` must be equal',
  20: 'Number of `origins` and `resolutions` must be equal',
  22: 'Either `tileSize` or `tileSizes` must be configured, never both',
  24: 'Invalid extent or geometry provided as `geometry`',
  25: 'Cannot fit empty extent provided as `geometry`',
  26: 'Features must have an id set',
  27: 'Features must have an id set',
  28: '`renderMode` must be `"hybrid"` or `"vector"`',
  30: 'The passed `feature` was already added to the source',
  31: 'Tried to enqueue an `element` that was already added to the queue',
  32: 'Transformation matrix cannot be inverted',
  33: 'Invalid units',
  34: 'Invalid geometry layout',
  36: 'Unknown SRS type',
  37: 'Unknown geometry type found',
  38: '`styleMapValue` has an unknown type',
  39: 'Unknown geometry type',
  40: 'Expected `feature` to have a geometry',
  41: 'Expected an `ol/style/Style` or an array of `ol/style/Style.js`',
  42: 'Question unknown, the answer is 42',
  43: 'Expected `layers` to be an array or a `Collection`',
  47: 'Expected `controls` to be an array or an `ol/Collection`',
  48: 'Expected `interactions` to be an array or an `ol/Collection`',
  49: 'Expected `overlays` to be an array or an `ol/Collection`',
  50: '`options.featureTypes` should be an Array',
  51: 'Either `url` or `tileJSON` options must be provided',
  52: 'Unknown `serverType` configured',
  53: 'Unknown `tierSizeCalculation` configured',
  55: 'The {-y} placeholder requires a tile grid with extent',
  56: 'mapBrowserEvent must originate from a pointer event',
  57: 'At least 2 conditions are required',
  59: 'Invalid command found in the PBF',
  60: 'Missing or invalid `size`',
  61: 'Cannot determine IIIF Image API version from provided image information JSON',
  62: 'A `WebGLArrayBuffer` must either be of type `ELEMENT_ARRAY_BUFFER` or `ARRAY_BUFFER`',
  64: 'Layer opacity must be a number',
  66: '`forEachFeatureAtCoordinate` cannot be used on a WebGL layer if the hit detection logic has not been enabled. This is done by providing adequate shaders using the `hitVertexShader` and `hitFragmentShader` properties of `WebGLPointsLayerRenderer`',
  67: 'A layer can only be added to the map once. Use either `layer.setMap()` or `map.addLayer()`, not both',
  68: 'A VectorTile source can only be rendered if it has a projection compatible with the view projection',
  69: '`width` or `height` cannot be provided together with `scale`',
};

/**
 * Error object thrown when an assertion failed. This is an ECMA-262 Error,
 * extended with a `code` property.
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error.
 */
class AssertionError extends Error {
  /**
   * @param {number} code Error code.
   */
  constructor(code) {
    const message = messages[code];

    super(message);

    /**
     * Error code. The meaning of the code can be found on
     * https://openlayers.org/en/latest/doc/errors/ (replace `latest` with
     * the version found in the OpenLayers script's header comment if a version
     * other than the latest is used).
     * @type {number}
     * @deprecated ol/AssertionError and error codes will be removed in v8.0
     * @api
     */
    this.code = code;

    /**
     * @type {string}
     */
    this.name = 'AssertionError';

    // Re-assign message, see https://github.com/Rich-Harris/buble/issues/40
    this.message = message;
  }
}

var AssertionError$1 = AssertionError;

/**
 * @module ol/CollectionEventType
 */

/**
 * @enum {string}
 */
var CollectionEventType = {
  /**
   * Triggered when an item is added to the collection.
   * @event module:ol/Collection.CollectionEvent#add
   * @api
   */
  ADD: 'add',
  /**
   * Triggered when an item is removed from the collection.
   * @event module:ol/Collection.CollectionEvent#remove
   * @api
   */
  REMOVE: 'remove',
};

/**
 * @module ol/Collection
 */

/**
 * @enum {string}
 * @private
 */
const Property$1 = {
  LENGTH: 'length',
};

/**
 * @classdesc
 * Events emitted by {@link module:ol/Collection~Collection} instances are instances of this
 * type.
 * @template T
 */
class CollectionEvent extends Event {
  /**
   * @param {import("./CollectionEventType.js").default} type Type.
   * @param {T} element Element.
   * @param {number} index The index of the added or removed element.
   */
  constructor(type, element, index) {
    super(type);

    /**
     * The element that is added to or removed from the collection.
     * @type {T}
     * @api
     */
    this.element = element;

    /**
     * The index of the added or removed element.
     * @type {number}
     * @api
     */
    this.index = index;
  }
}

/***
 * @template T
 * @template Return
 * @typedef {import("./Observable").OnSignature<import("./Observable").EventTypes, import("./events/Event.js").default, Return> &
 *   import("./Observable").OnSignature<import("./ObjectEventType").Types|'change:length', import("./Object").ObjectEvent, Return> &
 *   import("./Observable").OnSignature<'add'|'remove', CollectionEvent<T>, Return> &
 *   import("./Observable").CombinedOnSignature<import("./Observable").EventTypes|import("./ObjectEventType").Types|
 *     'change:length'|'add'|'remove',Return>} CollectionOnSignature
 */

/**
 * @typedef {Object} Options
 * @property {boolean} [unique=false] Disallow the same item from being added to
 * the collection twice.
 */

/**
 * @classdesc
 * An expanded version of standard JS Array, adding convenience methods for
 * manipulation. Add and remove changes to the Collection trigger a Collection
 * event. Note that this does not cover changes to the objects _within_ the
 * Collection; they trigger events on the appropriate object, not on the
 * Collection as a whole.
 *
 * @fires CollectionEvent
 *
 * @template T
 * @api
 */
class Collection extends BaseObject$1 {
  /**
   * @param {Array<T>} [array] Array.
   * @param {Options} [options] Collection options.
   */
  constructor(array, options) {
    super();

    /***
     * @type {CollectionOnSignature<T, import("./events").EventsKey>}
     */
    this.on;

    /***
     * @type {CollectionOnSignature<T, import("./events").EventsKey>}
     */
    this.once;

    /***
     * @type {CollectionOnSignature<T, void>}
     */
    this.un;

    options = options || {};

    /**
     * @private
     * @type {boolean}
     */
    this.unique_ = !!options.unique;

    /**
     * @private
     * @type {!Array<T>}
     */
    this.array_ = array ? array : [];

    if (this.unique_) {
      for (let i = 0, ii = this.array_.length; i < ii; ++i) {
        this.assertUnique_(this.array_[i], i);
      }
    }

    this.updateLength_();
  }

  /**
   * Remove all elements from the collection.
   * @api
   */
  clear() {
    while (this.getLength() > 0) {
      this.pop();
    }
  }

  /**
   * Add elements to the collection.  This pushes each item in the provided array
   * to the end of the collection.
   * @param {!Array<T>} arr Array.
   * @return {Collection<T>} This collection.
   * @api
   */
  extend(arr) {
    for (let i = 0, ii = arr.length; i < ii; ++i) {
      this.push(arr[i]);
    }
    return this;
  }

  /**
   * Iterate over each element, calling the provided callback.
   * @param {function(T, number, Array<T>): *} f The function to call
   *     for every element. This function takes 3 arguments (the element, the
   *     index and the array). The return value is ignored.
   * @api
   */
  forEach(f) {
    const array = this.array_;
    for (let i = 0, ii = array.length; i < ii; ++i) {
      f(array[i], i, array);
    }
  }

  /**
   * Get a reference to the underlying Array object. Warning: if the array
   * is mutated, no events will be dispatched by the collection, and the
   * collection's "length" property won't be in sync with the actual length
   * of the array.
   * @return {!Array<T>} Array.
   * @api
   */
  getArray() {
    return this.array_;
  }

  /**
   * Get the element at the provided index.
   * @param {number} index Index.
   * @return {T} Element.
   * @api
   */
  item(index) {
    return this.array_[index];
  }

  /**
   * Get the length of this collection.
   * @return {number} The length of the array.
   * @observable
   * @api
   */
  getLength() {
    return this.get(Property$1.LENGTH);
  }

  /**
   * Insert an element at the provided index.
   * @param {number} index Index.
   * @param {T} elem Element.
   * @api
   */
  insertAt(index, elem) {
    if (index < 0 || index > this.getLength()) {
      throw new Error('Index out of bounds: ' + index);
    }
    if (this.unique_) {
      this.assertUnique_(elem);
    }
    this.array_.splice(index, 0, elem);
    this.updateLength_();
    this.dispatchEvent(
      new CollectionEvent(CollectionEventType.ADD, elem, index)
    );
  }

  /**
   * Remove the last element of the collection and return it.
   * Return `undefined` if the collection is empty.
   * @return {T|undefined} Element.
   * @api
   */
  pop() {
    return this.removeAt(this.getLength() - 1);
  }

  /**
   * Insert the provided element at the end of the collection.
   * @param {T} elem Element.
   * @return {number} New length of the collection.
   * @api
   */
  push(elem) {
    if (this.unique_) {
      this.assertUnique_(elem);
    }
    const n = this.getLength();
    this.insertAt(n, elem);
    return this.getLength();
  }

  /**
   * Remove the first occurrence of an element from the collection.
   * @param {T} elem Element.
   * @return {T|undefined} The removed element or undefined if none found.
   * @api
   */
  remove(elem) {
    const arr = this.array_;
    for (let i = 0, ii = arr.length; i < ii; ++i) {
      if (arr[i] === elem) {
        return this.removeAt(i);
      }
    }
    return undefined;
  }

  /**
   * Remove the element at the provided index and return it.
   * Return `undefined` if the collection does not contain this index.
   * @param {number} index Index.
   * @return {T|undefined} Value.
   * @api
   */
  removeAt(index) {
    if (index < 0 || index >= this.getLength()) {
      return undefined;
    }
    const prev = this.array_[index];
    this.array_.splice(index, 1);
    this.updateLength_();
    this.dispatchEvent(
      /** @type {CollectionEvent<T>} */ (
        new CollectionEvent(CollectionEventType.REMOVE, prev, index)
      )
    );
    return prev;
  }

  /**
   * Set the element at the provided index.
   * @param {number} index Index.
   * @param {T} elem Element.
   * @api
   */
  setAt(index, elem) {
    const n = this.getLength();
    if (index >= n) {
      this.insertAt(index, elem);
      return;
    }
    if (index < 0) {
      throw new Error('Index out of bounds: ' + index);
    }
    if (this.unique_) {
      this.assertUnique_(elem, index);
    }
    const prev = this.array_[index];
    this.array_[index] = elem;
    this.dispatchEvent(
      /** @type {CollectionEvent<T>} */ (
        new CollectionEvent(CollectionEventType.REMOVE, prev, index)
      )
    );
    this.dispatchEvent(
      /** @type {CollectionEvent<T>} */ (
        new CollectionEvent(CollectionEventType.ADD, elem, index)
      )
    );
  }

  /**
   * @private
   */
  updateLength_() {
    this.set(Property$1.LENGTH, this.array_.length);
  }

  /**
   * @private
   * @param {T} elem Element.
   * @param {number} [except] Optional index to ignore.
   */
  assertUnique_(elem, except) {
    for (let i = 0, ii = this.array_.length; i < ii; ++i) {
      if (this.array_[i] === elem && i !== except) {
        throw new AssertionError$1(58);
      }
    }
  }
}

var Collection$1 = Collection;

/**
 * @module ol/has
 */

const ua =
  typeof navigator !== 'undefined' && typeof navigator.userAgent !== 'undefined'
    ? navigator.userAgent.toLowerCase()
    : '';

/**
 * User agent string says we are dealing with Firefox as browser.
 * @type {boolean}
 */
const FIREFOX = ua.includes('firefox');

/**
 * User agent string says we are dealing with Safari as browser.
 * @type {boolean}
 */
const SAFARI = ua.includes('safari') && !ua.includes('chrom');

/**
 * https://bugs.webkit.org/show_bug.cgi?id=237906
 * @type {boolean}
 */
SAFARI &&
  (ua.includes('version/15.4') ||
    /cpu (os|iphone os) 15_4 like mac os x/.test(ua));

/**
 * User agent string says we are dealing with a WebKit engine.
 * @type {boolean}
 */
const WEBKIT = ua.includes('webkit') && !ua.includes('edge');

/**
 * User agent string says we are dealing with a Mac as platform.
 * @type {boolean}
 */
const MAC = ua.includes('macintosh');

/**
 * The ratio between physical pixels and device-independent pixels
 * (dips) on the device (`window.devicePixelRatio`).
 * @const
 * @type {number}
 * @api
 */
const DEVICE_PIXEL_RATIO =
  typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1;

/**
 * The execution context is a worker with OffscreenCanvas available.
 * @const
 * @type {boolean}
 */
const WORKER_OFFSCREEN_CANVAS =
  typeof WorkerGlobalScope !== 'undefined' &&
  typeof OffscreenCanvas !== 'undefined' &&
  self instanceof WorkerGlobalScope; //eslint-disable-line

/**
 * Image.prototype.decode() is supported.
 * @type {boolean}
 */
const IMAGE_DECODE =
  typeof Image !== 'undefined' && Image.prototype.decode;

/**
 * @type {boolean}
 */
const PASSIVE_EVENT_LISTENERS = (function () {
  let passive = false;
  try {
    const options = Object.defineProperty({}, 'passive', {
      get: function () {
        passive = true;
      },
    });

    window.addEventListener('_', null, options);
    window.removeEventListener('_', null, options);
  } catch (error) {
    // passive not supported
  }
  return passive;
})();

/**
 * @module ol/asserts
 */

/**
 * @param {*} assertion Assertion we expected to be truthy.
 * @param {number} errorCode Error code.
 */
function assert(assertion, errorCode) {
  if (!assertion) {
    throw new AssertionError$1(errorCode);
  }
}

/**
 * @module ol/transform
 */

/**
 * An array representing an affine 2d transformation for use with
 * {@link module:ol/transform} functions. The array has 6 elements.
 * @typedef {!Array<number>} Transform
 * @api
 */

/**
 * Collection of affine 2d transformation functions. The functions work on an
 * array of 6 elements. The element order is compatible with the [SVGMatrix
 * interface](https://developer.mozilla.org/en-US/docs/Web/API/SVGMatrix) and is
 * a subset (elements a to f) of a 3×3 matrix:
 * ```
 * [ a c e ]
 * [ b d f ]
 * [ 0 0 1 ]
 * ```
 */

/**
 * @private
 * @type {Transform}
 */
new Array(6);

/**
 * Create an identity transform.
 * @return {!Transform} Identity transform.
 */
function create() {
  return [1, 0, 0, 1, 0, 0];
}

/**
 * Transforms the given coordinate with the given transform returning the
 * resulting, transformed coordinate. The coordinate will be modified in-place.
 *
 * @param {Transform} transform The transformation.
 * @param {import("./coordinate.js").Coordinate|import("./pixel.js").Pixel} coordinate The coordinate to transform.
 * @return {import("./coordinate.js").Coordinate|import("./pixel.js").Pixel} return coordinate so that operations can be
 *     chained together.
 */
function apply(transform, coordinate) {
  const x = coordinate[0];
  const y = coordinate[1];
  coordinate[0] = transform[0] * x + transform[2] * y + transform[4];
  coordinate[1] = transform[1] * x + transform[3] * y + transform[5];
  return coordinate;
}

/**
 * Creates a composite transform given an initial translation, scale, rotation, and
 * final translation (in that order only, not commutative).
 * @param {!Transform} transform The transform (will be modified in place).
 * @param {number} dx1 Initial translation x.
 * @param {number} dy1 Initial translation y.
 * @param {number} sx Scale factor x.
 * @param {number} sy Scale factor y.
 * @param {number} angle Rotation (in counter-clockwise radians).
 * @param {number} dx2 Final translation x.
 * @param {number} dy2 Final translation y.
 * @return {!Transform} The composite transform.
 */
function compose(transform, dx1, dy1, sx, sy, angle, dx2, dy2) {
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  transform[0] = sx * cos;
  transform[1] = sy * sin;
  transform[2] = -sx * sin;
  transform[3] = sy * cos;
  transform[4] = dx2 * sx * cos - dy2 * sx * sin + dx1;
  transform[5] = dx2 * sy * sin + dy2 * sy * cos + dy1;
  return transform;
}

/**
 * Invert the given transform.
 * @param {!Transform} target Transform to be set as the inverse of
 *     the source transform.
 * @param {!Transform} source The source transform to invert.
 * @return {!Transform} The inverted (target) transform.
 */
function makeInverse(target, source) {
  const det = determinant(source);
  assert(det !== 0, 32); // Transformation matrix cannot be inverted

  const a = source[0];
  const b = source[1];
  const c = source[2];
  const d = source[3];
  const e = source[4];
  const f = source[5];

  target[0] = d / det;
  target[1] = -b / det;
  target[2] = -c / det;
  target[3] = a / det;
  target[4] = (c * f - d * e) / det;
  target[5] = -(a * f - b * e) / det;

  return target;
}

/**
 * Returns the determinant of the given matrix.
 * @param {!Transform} mat Matrix.
 * @return {number} Determinant.
 */
function determinant(mat) {
  return mat[0] * mat[3] - mat[1] * mat[2];
}

/**
 * @type {HTMLElement}
 * @private
 */
let transformStringDiv;

/**
 * A rounded string version of the transform.  This can be used
 * for CSS transforms.
 * @param {!Transform} mat Matrix.
 * @return {string} The transform as a string.
 */
function toString$1(mat) {
  const transformString = 'matrix(' + mat.join(', ') + ')';
  if (WORKER_OFFSCREEN_CANVAS) {
    return transformString;
  }
  const node =
    transformStringDiv || (transformStringDiv = document.createElement('div'));
  node.style.transform = transformString;
  return node.style.transform;
}

/**
 * @module ol/extent/Relationship
 */

/**
 * Relationship to an extent.
 * @enum {number}
 */
var Relationship = {
  UNKNOWN: 0,
  INTERSECTING: 1,
  ABOVE: 2,
  RIGHT: 4,
  BELOW: 8,
  LEFT: 16,
};

/**
 * @module ol/extent
 */

/**
 * An array of numbers representing an extent: `[minx, miny, maxx, maxy]`.
 * @typedef {Array<number>} Extent
 * @api
 */

/**
 * Extent corner.
 * @typedef {'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'} Corner
 */

/**
 * Build an extent that includes all given coordinates.
 *
 * @param {Array<import("./coordinate.js").Coordinate>} coordinates Coordinates.
 * @return {Extent} Bounding extent.
 * @api
 */
function boundingExtent(coordinates) {
  const extent = createEmpty();
  for (let i = 0, ii = coordinates.length; i < ii; ++i) {
    extendCoordinate(extent, coordinates[i]);
  }
  return extent;
}

/**
 * Creates a clone of an extent.
 *
 * @param {Extent} extent Extent to clone.
 * @param {Extent} [dest] Extent.
 * @return {Extent} The clone.
 */
function clone(extent, dest) {
  if (dest) {
    dest[0] = extent[0];
    dest[1] = extent[1];
    dest[2] = extent[2];
    dest[3] = extent[3];
    return dest;
  }
  return extent.slice();
}

/**
 * @param {Extent} extent Extent.
 * @param {number} x X.
 * @param {number} y Y.
 * @return {number} Closest squared distance.
 */
function closestSquaredDistanceXY(extent, x, y) {
  let dx, dy;
  if (x < extent[0]) {
    dx = extent[0] - x;
  } else if (extent[2] < x) {
    dx = x - extent[2];
  } else {
    dx = 0;
  }
  if (y < extent[1]) {
    dy = extent[1] - y;
  } else if (extent[3] < y) {
    dy = y - extent[3];
  } else {
    dy = 0;
  }
  return dx * dx + dy * dy;
}

/**
 * Check if the passed coordinate is contained or on the edge of the extent.
 *
 * @param {Extent} extent Extent.
 * @param {import("./coordinate.js").Coordinate} coordinate Coordinate.
 * @return {boolean} The coordinate is contained in the extent.
 * @api
 */
function containsCoordinate(extent, coordinate) {
  return containsXY(extent, coordinate[0], coordinate[1]);
}

/**
 * Check if one extent contains another.
 *
 * An extent is deemed contained if it lies completely within the other extent,
 * including if they share one or more edges.
 *
 * @param {Extent} extent1 Extent 1.
 * @param {Extent} extent2 Extent 2.
 * @return {boolean} The second extent is contained by or on the edge of the
 *     first.
 * @api
 */
function containsExtent(extent1, extent2) {
  return (
    extent1[0] <= extent2[0] &&
    extent2[2] <= extent1[2] &&
    extent1[1] <= extent2[1] &&
    extent2[3] <= extent1[3]
  );
}

/**
 * Check if the passed coordinate is contained or on the edge of the extent.
 *
 * @param {Extent} extent Extent.
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 * @return {boolean} The x, y values are contained in the extent.
 * @api
 */
function containsXY(extent, x, y) {
  return extent[0] <= x && x <= extent[2] && extent[1] <= y && y <= extent[3];
}

/**
 * Get the relationship between a coordinate and extent.
 * @param {Extent} extent The extent.
 * @param {import("./coordinate.js").Coordinate} coordinate The coordinate.
 * @return {import("./extent/Relationship.js").default} The relationship (bitwise compare with
 *     import("./extent/Relationship.js").Relationship).
 */
function coordinateRelationship(extent, coordinate) {
  const minX = extent[0];
  const minY = extent[1];
  const maxX = extent[2];
  const maxY = extent[3];
  const x = coordinate[0];
  const y = coordinate[1];
  let relationship = Relationship.UNKNOWN;
  if (x < minX) {
    relationship = relationship | Relationship.LEFT;
  } else if (x > maxX) {
    relationship = relationship | Relationship.RIGHT;
  }
  if (y < minY) {
    relationship = relationship | Relationship.BELOW;
  } else if (y > maxY) {
    relationship = relationship | Relationship.ABOVE;
  }
  if (relationship === Relationship.UNKNOWN) {
    relationship = Relationship.INTERSECTING;
  }
  return relationship;
}

/**
 * Create an empty extent.
 * @return {Extent} Empty extent.
 * @api
 */
function createEmpty() {
  return [Infinity, Infinity, -Infinity, -Infinity];
}

/**
 * Create a new extent or update the provided extent.
 * @param {number} minX Minimum X.
 * @param {number} minY Minimum Y.
 * @param {number} maxX Maximum X.
 * @param {number} maxY Maximum Y.
 * @param {Extent} [dest] Destination extent.
 * @return {Extent} Extent.
 */
function createOrUpdate$2(minX, minY, maxX, maxY, dest) {
  if (dest) {
    dest[0] = minX;
    dest[1] = minY;
    dest[2] = maxX;
    dest[3] = maxY;
    return dest;
  }
  return [minX, minY, maxX, maxY];
}

/**
 * Create a new empty extent or make the provided one empty.
 * @param {Extent} [dest] Extent.
 * @return {Extent} Extent.
 */
function createOrUpdateEmpty(dest) {
  return createOrUpdate$2(Infinity, Infinity, -Infinity, -Infinity, dest);
}

/**
 * @param {import("./coordinate.js").Coordinate} coordinate Coordinate.
 * @param {Extent} [dest] Extent.
 * @return {Extent} Extent.
 */
function createOrUpdateFromCoordinate(coordinate, dest) {
  const x = coordinate[0];
  const y = coordinate[1];
  return createOrUpdate$2(x, y, x, y, dest);
}

/**
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @param {Extent} [dest] Extent.
 * @return {Extent} Extent.
 */
function createOrUpdateFromFlatCoordinates(
  flatCoordinates,
  offset,
  end,
  stride,
  dest
) {
  const extent = createOrUpdateEmpty(dest);
  return extendFlatCoordinates(extent, flatCoordinates, offset, end, stride);
}

/**
 * Determine if two extents are equivalent.
 * @param {Extent} extent1 Extent 1.
 * @param {Extent} extent2 Extent 2.
 * @return {boolean} The two extents are equivalent.
 * @api
 */
function equals$1(extent1, extent2) {
  return (
    extent1[0] == extent2[0] &&
    extent1[2] == extent2[2] &&
    extent1[1] == extent2[1] &&
    extent1[3] == extent2[3]
  );
}

/**
 * Modify an extent to include another extent.
 * @param {Extent} extent1 The extent to be modified.
 * @param {Extent} extent2 The extent that will be included in the first.
 * @return {Extent} A reference to the first (extended) extent.
 * @api
 */
function extend(extent1, extent2) {
  if (extent2[0] < extent1[0]) {
    extent1[0] = extent2[0];
  }
  if (extent2[2] > extent1[2]) {
    extent1[2] = extent2[2];
  }
  if (extent2[1] < extent1[1]) {
    extent1[1] = extent2[1];
  }
  if (extent2[3] > extent1[3]) {
    extent1[3] = extent2[3];
  }
  return extent1;
}

/**
 * @param {Extent} extent Extent.
 * @param {import("./coordinate.js").Coordinate} coordinate Coordinate.
 */
function extendCoordinate(extent, coordinate) {
  if (coordinate[0] < extent[0]) {
    extent[0] = coordinate[0];
  }
  if (coordinate[0] > extent[2]) {
    extent[2] = coordinate[0];
  }
  if (coordinate[1] < extent[1]) {
    extent[1] = coordinate[1];
  }
  if (coordinate[1] > extent[3]) {
    extent[3] = coordinate[1];
  }
}

/**
 * @param {Extent} extent Extent.
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @return {Extent} Extent.
 */
function extendFlatCoordinates(
  extent,
  flatCoordinates,
  offset,
  end,
  stride
) {
  for (; offset < end; offset += stride) {
    extendXY(extent, flatCoordinates[offset], flatCoordinates[offset + 1]);
  }
  return extent;
}

/**
 * @param {Extent} extent Extent.
 * @param {number} x X.
 * @param {number} y Y.
 */
function extendXY(extent, x, y) {
  extent[0] = Math.min(extent[0], x);
  extent[1] = Math.min(extent[1], y);
  extent[2] = Math.max(extent[2], x);
  extent[3] = Math.max(extent[3], y);
}

/**
 * This function calls `callback` for each corner of the extent. If the
 * callback returns a truthy value the function returns that value
 * immediately. Otherwise the function returns `false`.
 * @param {Extent} extent Extent.
 * @param {function(import("./coordinate.js").Coordinate): S} callback Callback.
 * @return {S|boolean} Value.
 * @template S
 */
function forEachCorner(extent, callback) {
  let val;
  val = callback(getBottomLeft(extent));
  if (val) {
    return val;
  }
  val = callback(getBottomRight(extent));
  if (val) {
    return val;
  }
  val = callback(getTopRight(extent));
  if (val) {
    return val;
  }
  val = callback(getTopLeft(extent));
  if (val) {
    return val;
  }
  return false;
}

/**
 * Get the size of an extent.
 * @param {Extent} extent Extent.
 * @return {number} Area.
 * @api
 */
function getArea(extent) {
  let area = 0;
  if (!isEmpty(extent)) {
    area = getWidth(extent) * getHeight(extent);
  }
  return area;
}

/**
 * Get the bottom left coordinate of an extent.
 * @param {Extent} extent Extent.
 * @return {import("./coordinate.js").Coordinate} Bottom left coordinate.
 * @api
 */
function getBottomLeft(extent) {
  return [extent[0], extent[1]];
}

/**
 * Get the bottom right coordinate of an extent.
 * @param {Extent} extent Extent.
 * @return {import("./coordinate.js").Coordinate} Bottom right coordinate.
 * @api
 */
function getBottomRight(extent) {
  return [extent[2], extent[1]];
}

/**
 * Get the center coordinate of an extent.
 * @param {Extent} extent Extent.
 * @return {import("./coordinate.js").Coordinate} Center.
 * @api
 */
function getCenter(extent) {
  return [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
}

/**
 * Get a corner coordinate of an extent.
 * @param {Extent} extent Extent.
 * @param {Corner} corner Corner.
 * @return {import("./coordinate.js").Coordinate} Corner coordinate.
 */
function getCorner(extent, corner) {
  let coordinate;
  if (corner === 'bottom-left') {
    coordinate = getBottomLeft(extent);
  } else if (corner === 'bottom-right') {
    coordinate = getBottomRight(extent);
  } else if (corner === 'top-left') {
    coordinate = getTopLeft(extent);
  } else if (corner === 'top-right') {
    coordinate = getTopRight(extent);
  } else {
    assert(false, 13); // Invalid corner
  }
  return coordinate;
}

/**
 * @param {import("./coordinate.js").Coordinate} center Center.
 * @param {number} resolution Resolution.
 * @param {number} rotation Rotation.
 * @param {import("./size.js").Size} size Size.
 * @param {Extent} [dest] Destination extent.
 * @return {Extent} Extent.
 */
function getForViewAndSize(center, resolution, rotation, size, dest) {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = getRotatedViewport(
    center,
    resolution,
    rotation,
    size
  );
  return createOrUpdate$2(
    Math.min(x0, x1, x2, x3),
    Math.min(y0, y1, y2, y3),
    Math.max(x0, x1, x2, x3),
    Math.max(y0, y1, y2, y3),
    dest
  );
}

/**
 * @param {import("./coordinate.js").Coordinate} center Center.
 * @param {number} resolution Resolution.
 * @param {number} rotation Rotation.
 * @param {import("./size.js").Size} size Size.
 * @return {Array<number>} Linear ring representing the viewport.
 */
function getRotatedViewport(center, resolution, rotation, size) {
  const dx = (resolution * size[0]) / 2;
  const dy = (resolution * size[1]) / 2;
  const cosRotation = Math.cos(rotation);
  const sinRotation = Math.sin(rotation);
  const xCos = dx * cosRotation;
  const xSin = dx * sinRotation;
  const yCos = dy * cosRotation;
  const ySin = dy * sinRotation;
  const x = center[0];
  const y = center[1];
  return [
    x - xCos + ySin,
    y - xSin - yCos,
    x - xCos - ySin,
    y - xSin + yCos,
    x + xCos - ySin,
    y + xSin + yCos,
    x + xCos + ySin,
    y + xSin - yCos,
    x - xCos + ySin,
    y - xSin - yCos,
  ];
}

/**
 * Get the height of an extent.
 * @param {Extent} extent Extent.
 * @return {number} Height.
 * @api
 */
function getHeight(extent) {
  return extent[3] - extent[1];
}

/**
 * Get the intersection of two extents.
 * @param {Extent} extent1 Extent 1.
 * @param {Extent} extent2 Extent 2.
 * @param {Extent} [dest] Optional extent to populate with intersection.
 * @return {Extent} Intersecting extent.
 * @api
 */
function getIntersection(extent1, extent2, dest) {
  const intersection = dest ? dest : createEmpty();
  if (intersects(extent1, extent2)) {
    if (extent1[0] > extent2[0]) {
      intersection[0] = extent1[0];
    } else {
      intersection[0] = extent2[0];
    }
    if (extent1[1] > extent2[1]) {
      intersection[1] = extent1[1];
    } else {
      intersection[1] = extent2[1];
    }
    if (extent1[2] < extent2[2]) {
      intersection[2] = extent1[2];
    } else {
      intersection[2] = extent2[2];
    }
    if (extent1[3] < extent2[3]) {
      intersection[3] = extent1[3];
    } else {
      intersection[3] = extent2[3];
    }
  } else {
    createOrUpdateEmpty(intersection);
  }
  return intersection;
}

/**
 * Get the top left coordinate of an extent.
 * @param {Extent} extent Extent.
 * @return {import("./coordinate.js").Coordinate} Top left coordinate.
 * @api
 */
function getTopLeft(extent) {
  return [extent[0], extent[3]];
}

/**
 * Get the top right coordinate of an extent.
 * @param {Extent} extent Extent.
 * @return {import("./coordinate.js").Coordinate} Top right coordinate.
 * @api
 */
function getTopRight(extent) {
  return [extent[2], extent[3]];
}

/**
 * Get the width of an extent.
 * @param {Extent} extent Extent.
 * @return {number} Width.
 * @api
 */
function getWidth(extent) {
  return extent[2] - extent[0];
}

/**
 * Determine if one extent intersects another.
 * @param {Extent} extent1 Extent 1.
 * @param {Extent} extent2 Extent.
 * @return {boolean} The two extents intersect.
 * @api
 */
function intersects(extent1, extent2) {
  return (
    extent1[0] <= extent2[2] &&
    extent1[2] >= extent2[0] &&
    extent1[1] <= extent2[3] &&
    extent1[3] >= extent2[1]
  );
}

/**
 * Determine if an extent is empty.
 * @param {Extent} extent Extent.
 * @return {boolean} Is empty.
 * @api
 */
function isEmpty(extent) {
  return extent[2] < extent[0] || extent[3] < extent[1];
}

/**
 * @param {Extent} extent Extent.
 * @param {Extent} [dest] Extent.
 * @return {Extent} Extent.
 */
function returnOrUpdate(extent, dest) {
  if (dest) {
    dest[0] = extent[0];
    dest[1] = extent[1];
    dest[2] = extent[2];
    dest[3] = extent[3];
    return dest;
  }
  return extent;
}

/**
 * Determine if the segment between two coordinates intersects (crosses,
 * touches, or is contained by) the provided extent.
 * @param {Extent} extent The extent.
 * @param {import("./coordinate.js").Coordinate} start Segment start coordinate.
 * @param {import("./coordinate.js").Coordinate} end Segment end coordinate.
 * @return {boolean} The segment intersects the extent.
 */
function intersectsSegment(extent, start, end) {
  let intersects = false;
  const startRel = coordinateRelationship(extent, start);
  const endRel = coordinateRelationship(extent, end);
  if (
    startRel === Relationship.INTERSECTING ||
    endRel === Relationship.INTERSECTING
  ) {
    intersects = true;
  } else {
    const minX = extent[0];
    const minY = extent[1];
    const maxX = extent[2];
    const maxY = extent[3];
    const startX = start[0];
    const startY = start[1];
    const endX = end[0];
    const endY = end[1];
    const slope = (endY - startY) / (endX - startX);
    let x, y;
    if (!!(endRel & Relationship.ABOVE) && !(startRel & Relationship.ABOVE)) {
      // potentially intersects top
      x = endX - (endY - maxY) / slope;
      intersects = x >= minX && x <= maxX;
    }
    if (
      !intersects &&
      !!(endRel & Relationship.RIGHT) &&
      !(startRel & Relationship.RIGHT)
    ) {
      // potentially intersects right
      y = endY - (endX - maxX) * slope;
      intersects = y >= minY && y <= maxY;
    }
    if (
      !intersects &&
      !!(endRel & Relationship.BELOW) &&
      !(startRel & Relationship.BELOW)
    ) {
      // potentially intersects bottom
      x = endX - (endY - minY) / slope;
      intersects = x >= minX && x <= maxX;
    }
    if (
      !intersects &&
      !!(endRel & Relationship.LEFT) &&
      !(startRel & Relationship.LEFT)
    ) {
      // potentially intersects left
      y = endY - (endX - minX) * slope;
      intersects = y >= minY && y <= maxY;
    }
  }
  return intersects;
}

/**
 * @module ol/math
 */

/**
 * Takes a number and clamps it to within the provided bounds.
 * @param {number} value The input number.
 * @param {number} min The minimum value to return.
 * @param {number} max The maximum value to return.
 * @return {number} The input number if it is within bounds, or the nearest
 *     number within the bounds.
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Returns the square of the closest distance between the point (x, y) and the
 * line segment (x1, y1) to (x2, y2).
 * @param {number} x X.
 * @param {number} y Y.
 * @param {number} x1 X1.
 * @param {number} y1 Y1.
 * @param {number} x2 X2.
 * @param {number} y2 Y2.
 * @return {number} Squared distance.
 */
function squaredSegmentDistance(x, y, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx !== 0 || dy !== 0) {
    const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x1 = x2;
      y1 = y2;
    } else if (t > 0) {
      x1 += dx * t;
      y1 += dy * t;
    }
  }
  return squaredDistance(x, y, x1, y1);
}

/**
 * Returns the square of the distance between the points (x1, y1) and (x2, y2).
 * @param {number} x1 X1.
 * @param {number} y1 Y1.
 * @param {number} x2 X2.
 * @param {number} y2 Y2.
 * @return {number} Squared distance.
 */
function squaredDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

/**
 * Solves system of linear equations using Gaussian elimination method.
 *
 * @param {Array<Array<number>>} mat Augmented matrix (n x n + 1 column)
 *                                     in row-major order.
 * @return {Array<number>} The resulting vector.
 */
function solveLinearSystem(mat) {
  const n = mat.length;

  for (let i = 0; i < n; i++) {
    // Find max in the i-th column (ignoring i - 1 first rows)
    let maxRow = i;
    let maxEl = Math.abs(mat[i][i]);
    for (let r = i + 1; r < n; r++) {
      const absValue = Math.abs(mat[r][i]);
      if (absValue > maxEl) {
        maxEl = absValue;
        maxRow = r;
      }
    }

    if (maxEl === 0) {
      return null; // matrix is singular
    }

    // Swap max row with i-th (current) row
    const tmp = mat[maxRow];
    mat[maxRow] = mat[i];
    mat[i] = tmp;

    // Subtract the i-th row to make all the remaining rows 0 in the i-th column
    for (let j = i + 1; j < n; j++) {
      const coef = -mat[j][i] / mat[i][i];
      for (let k = i; k < n + 1; k++) {
        if (i == k) {
          mat[j][k] = 0;
        } else {
          mat[j][k] += coef * mat[i][k];
        }
      }
    }
  }

  // Solve Ax=b for upper triangular matrix A (mat)
  const x = new Array(n);
  for (let l = n - 1; l >= 0; l--) {
    x[l] = mat[l][n] / mat[l][l];
    for (let m = l - 1; m >= 0; m--) {
      mat[m][n] -= mat[m][l] * x[l];
    }
  }
  return x;
}

/**
 * Converts degrees to radians.
 *
 * @param {number} angleInDegrees Angle in degrees.
 * @return {number} Angle in radians.
 */
function toRadians(angleInDegrees) {
  return (angleInDegrees * Math.PI) / 180;
}

/**
 * Returns the modulo of a / b, depending on the sign of b.
 *
 * @param {number} a Dividend.
 * @param {number} b Divisor.
 * @return {number} Modulo.
 */
function modulo(a, b) {
  const r = a % b;
  return r * b < 0 ? r + b : r;
}

/**
 * Calculates the linearly interpolated value of x between a and b.
 *
 * @param {number} a Number
 * @param {number} b Number
 * @param {number} x Value to be interpolated.
 * @return {number} Interpolated value.
 */
function lerp(a, b, x) {
  return a + x * (b - a);
}

/**
 * Returns a number with a limited number of decimal digits.
 * @param {number} n The input number.
 * @param {number} decimals The maximum number of decimal digits.
 * @return {number} The input number with a limited number of decimal digits.
 */
function toFixed(n, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}

/**
 * Rounds a number to the next smaller integer considering only the given number
 * of decimal digits (with rounding on the final digit).
 * @param {number} n The input number.
 * @param {number} decimals The maximum number of decimal digits.
 * @return {number} The next smaller integer.
 */
function floor(n, decimals) {
  return Math.floor(toFixed(n, decimals));
}

/**
 * Rounds a number to the next bigger integer considering only the given number
 * of decimal digits (with rounding on the final digit).
 * @param {number} n The input number.
 * @param {number} decimals The maximum number of decimal digits.
 * @return {number} The next bigger integer.
 */
function ceil(n, decimals) {
  return Math.ceil(toFixed(n, decimals));
}

/**
 * @module ol/color
 */

/**
 * A color represented as a short array [red, green, blue, alpha].
 * red, green, and blue should be integers in the range 0..255 inclusive.
 * alpha should be a float in the range 0..1 inclusive. If no alpha value is
 * given then `1` will be used.
 * @typedef {Array<number>} Color
 * @api
 */

/**
 * This RegExp matches # followed by 3, 4, 6, or 8 hex digits.
 * @const
 * @type {RegExp}
 * @private
 */
const HEX_COLOR_RE_ = /^#([a-f0-9]{3}|[a-f0-9]{4}(?:[a-f0-9]{2}){0,2})$/i;

/**
 * Regular expression for matching potential named color style strings.
 * @const
 * @type {RegExp}
 * @private
 */
const NAMED_COLOR_RE_ = /^([a-z]*)$|^hsla?\(.*\)$/i;

/**
 * Return the color as an rgba string.
 * @param {Color|string} color Color.
 * @return {string} Rgba string.
 * @api
 */
function asString(color) {
  if (typeof color === 'string') {
    return color;
  }
  return toString(color);
}

/**
 * Return named color as an rgba string.
 * @param {string} color Named color.
 * @return {string} Rgb string.
 */
function fromNamed(color) {
  const el = document.createElement('div');
  el.style.color = color;
  if (el.style.color !== '') {
    document.body.appendChild(el);
    const rgb = getComputedStyle(el).color;
    document.body.removeChild(el);
    return rgb;
  }
  return '';
}

/**
 * @param {string} s String.
 * @return {Color} Color.
 */
const fromString = (function () {
  // We maintain a small cache of parsed strings.  To provide cheap LRU-like
  // semantics, whenever the cache grows too large we simply delete an
  // arbitrary 25% of the entries.

  /**
   * @const
   * @type {number}
   */
  const MAX_CACHE_SIZE = 1024;

  /**
   * @type {Object<string, Color>}
   */
  const cache = {};

  /**
   * @type {number}
   */
  let cacheSize = 0;

  return (
    /**
     * @param {string} s String.
     * @return {Color} Color.
     */
    function (s) {
      let color;
      if (cache.hasOwnProperty(s)) {
        color = cache[s];
      } else {
        if (cacheSize >= MAX_CACHE_SIZE) {
          let i = 0;
          for (const key in cache) {
            if ((i++ & 3) === 0) {
              delete cache[key];
              --cacheSize;
            }
          }
        }
        color = fromStringInternal_(s);
        cache[s] = color;
        ++cacheSize;
      }
      return color;
    }
  );
})();

/**
 * Return the color as an array. This function maintains a cache of calculated
 * arrays which means the result should not be modified.
 * @param {Color|string} color Color.
 * @return {Color} Color.
 * @api
 */
function asArray(color) {
  if (Array.isArray(color)) {
    return color;
  }
  return fromString(color);
}

/**
 * @param {string} s String.
 * @private
 * @return {Color} Color.
 */
function fromStringInternal_(s) {
  let r, g, b, a, color;

  if (NAMED_COLOR_RE_.exec(s)) {
    s = fromNamed(s);
  }

  if (HEX_COLOR_RE_.exec(s)) {
    // hex
    const n = s.length - 1; // number of hex digits
    let d; // number of digits per channel
    if (n <= 4) {
      d = 1;
    } else {
      d = 2;
    }
    const hasAlpha = n === 4 || n === 8;
    r = parseInt(s.substr(1 + 0 * d, d), 16);
    g = parseInt(s.substr(1 + 1 * d, d), 16);
    b = parseInt(s.substr(1 + 2 * d, d), 16);
    if (hasAlpha) {
      a = parseInt(s.substr(1 + 3 * d, d), 16);
    } else {
      a = 255;
    }
    if (d == 1) {
      r = (r << 4) + r;
      g = (g << 4) + g;
      b = (b << 4) + b;
      if (hasAlpha) {
        a = (a << 4) + a;
      }
    }
    color = [r, g, b, a / 255];
  } else if (s.startsWith('rgba(')) {
    // rgba()
    color = s.slice(5, -1).split(',').map(Number);
    normalize(color);
  } else if (s.startsWith('rgb(')) {
    // rgb()
    color = s.slice(4, -1).split(',').map(Number);
    color.push(1);
    normalize(color);
  } else {
    assert(false, 14); // Invalid color
  }
  return color;
}

/**
 * TODO this function is only used in the test, we probably shouldn't export it
 * @param {Color} color Color.
 * @return {Color} Clamped color.
 */
function normalize(color) {
  color[0] = clamp((color[0] + 0.5) | 0, 0, 255);
  color[1] = clamp((color[1] + 0.5) | 0, 0, 255);
  color[2] = clamp((color[2] + 0.5) | 0, 0, 255);
  color[3] = clamp(color[3], 0, 1);
  return color;
}

/**
 * @param {Color} color Color.
 * @return {string} String.
 */
function toString(color) {
  let r = color[0];
  if (r != (r | 0)) {
    r = (r + 0.5) | 0;
  }
  let g = color[1];
  if (g != (g | 0)) {
    g = (g + 0.5) | 0;
  }
  let b = color[2];
  if (b != (b | 0)) {
    b = (b + 0.5) | 0;
  }
  const a = color[3] === undefined ? 1 : Math.round(color[3] * 100) / 100;
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

/**
 * @module ol/style/IconImageCache
 */

/**
 * @classdesc
 * Singleton class. Available through {@link module:ol/style/IconImageCache.shared}.
 */
class IconImageCache {
  constructor() {
    /**
     * @type {!Object<string, import("./IconImage.js").default>}
     * @private
     */
    this.cache_ = {};

    /**
     * @type {number}
     * @private
     */
    this.cacheSize_ = 0;

    /**
     * @type {number}
     * @private
     */
    this.maxCacheSize_ = 32;
  }

  /**
   * FIXME empty description for jsdoc
   */
  clear() {
    this.cache_ = {};
    this.cacheSize_ = 0;
  }

  /**
   * @return {boolean} Can expire cache.
   */
  canExpireCache() {
    return this.cacheSize_ > this.maxCacheSize_;
  }

  /**
   * FIXME empty description for jsdoc
   */
  expire() {
    if (this.canExpireCache()) {
      let i = 0;
      for (const key in this.cache_) {
        const iconImage = this.cache_[key];
        if ((i++ & 3) === 0 && !iconImage.hasListener()) {
          delete this.cache_[key];
          --this.cacheSize_;
        }
      }
    }
  }

  /**
   * @param {string} src Src.
   * @param {?string} crossOrigin Cross origin.
   * @param {import("../color.js").Color} color Color.
   * @return {import("./IconImage.js").default} Icon image.
   */
  get(src, crossOrigin, color) {
    const key = getKey$1(src, crossOrigin, color);
    return key in this.cache_ ? this.cache_[key] : null;
  }

  /**
   * @param {string} src Src.
   * @param {?string} crossOrigin Cross origin.
   * @param {import("../color.js").Color} color Color.
   * @param {import("./IconImage.js").default} iconImage Icon image.
   */
  set(src, crossOrigin, color, iconImage) {
    const key = getKey$1(src, crossOrigin, color);
    this.cache_[key] = iconImage;
    ++this.cacheSize_;
  }

  /**
   * Set the cache size of the icon cache. Default is `32`. Change this value when
   * your map uses more than 32 different icon images and you are not caching icon
   * styles on the application level.
   * @param {number} maxCacheSize Cache max size.
   * @api
   */
  setSize(maxCacheSize) {
    this.maxCacheSize_ = maxCacheSize;
    this.expire();
  }
}

/**
 * @param {string} src Src.
 * @param {?string} crossOrigin Cross origin.
 * @param {import("../color.js").Color} color Color.
 * @return {string} Cache key.
 */
function getKey$1(src, crossOrigin, color) {
  const colorString = color ? asString(color) : 'null';
  return crossOrigin + ':' + src + ':' + colorString;
}

/**
 * The {@link module:ol/style/IconImageCache~IconImageCache} for
 * {@link module:ol/style/Icon~Icon} images.
 * @api
 */
const shared = new IconImageCache();

/**
 * @module ol/layer/Property
 */

/**
 * @enum {string}
 */
var LayerProperty = {
  OPACITY: 'opacity',
  VISIBLE: 'visible',
  EXTENT: 'extent',
  Z_INDEX: 'zIndex',
  MAX_RESOLUTION: 'maxResolution',
  MIN_RESOLUTION: 'minResolution',
  MAX_ZOOM: 'maxZoom',
  MIN_ZOOM: 'minZoom',
  SOURCE: 'source',
  MAP: 'map',
};

/**
 * @module ol/layer/Base
 */

/**
 * A css color, or a function called with a view resolution returning a css color.
 *
 * @typedef {string|function(number):string} BackgroundColor
 * @api
 */

/**
 * @typedef {import("../ObjectEventType").Types|'change:extent'|'change:maxResolution'|'change:maxZoom'|
 *    'change:minResolution'|'change:minZoom'|'change:opacity'|'change:visible'|'change:zIndex'} BaseLayerObjectEventTypes
 */

/***
 * @template Return
 * @typedef {import("../Observable").OnSignature<import("../Observable").EventTypes, import("../events/Event.js").default, Return> &
 *   import("../Observable").OnSignature<BaseLayerObjectEventTypes, import("../Object").ObjectEvent, Return> &
 *   import("../Observable").CombinedOnSignature<import("../Observable").EventTypes|BaseLayerObjectEventTypes, Return>} BaseLayerOnSignature
 */

/**
 * @typedef {Object} Options
 * @property {string} [className='ol-layer'] A CSS class name to set to the layer element.
 * @property {number} [opacity=1] Opacity (0, 1).
 * @property {boolean} [visible=true] Visibility.
 * @property {import("../extent.js").Extent} [extent] The bounding extent for layer rendering.  The layer will not be
 * rendered outside of this extent.
 * @property {number} [zIndex] The z-index for layer rendering.  At rendering time, the layers
 * will be ordered, first by Z-index and then by position. When `undefined`, a `zIndex` of 0 is assumed
 * for layers that are added to the map's `layers` collection, or `Infinity` when the layer's `setMap()`
 * method was used.
 * @property {number} [minResolution] The minimum resolution (inclusive) at which this layer will be
 * visible.
 * @property {number} [maxResolution] The maximum resolution (exclusive) below which this layer will
 * be visible.
 * @property {number} [minZoom] The minimum view zoom level (exclusive) above which this layer will be
 * visible.
 * @property {number} [maxZoom] The maximum view zoom level (inclusive) at which this layer will
 * be visible.
 * @property {BackgroundColor} [background] Background color for the layer. If not specified, no background
 * will be rendered.
 * @property {Object<string, *>} [properties] Arbitrary observable properties. Can be accessed with `#get()` and `#set()`.
 */

/**
 * @classdesc
 * Abstract base class; normally only used for creating subclasses and not
 * instantiated in apps.
 * Note that with {@link module:ol/layer/Base~BaseLayer} and all its subclasses, any property set in
 * the options is set as a {@link module:ol/Object~BaseObject} property on the layer object, so
 * is observable, and has get/set accessors.
 *
 * @api
 */
class BaseLayer extends BaseObject$1 {
  /**
   * @param {Options} options Layer options.
   */
  constructor(options) {
    super();

    /***
     * @type {BaseLayerOnSignature<import("../events").EventsKey>}
     */
    this.on;

    /***
     * @type {BaseLayerOnSignature<import("../events").EventsKey>}
     */
    this.once;

    /***
     * @type {BaseLayerOnSignature<void>}
     */
    this.un;

    /**
     * @type {BackgroundColor|false}
     * @private
     */
    this.background_ = options.background;

    /**
     * @type {Object<string, *>}
     */
    const properties = Object.assign({}, options);
    if (typeof options.properties === 'object') {
      delete properties.properties;
      Object.assign(properties, options.properties);
    }

    properties[LayerProperty.OPACITY] =
      options.opacity !== undefined ? options.opacity : 1;
    assert(typeof properties[LayerProperty.OPACITY] === 'number', 64); // Layer opacity must be a number

    properties[LayerProperty.VISIBLE] =
      options.visible !== undefined ? options.visible : true;
    properties[LayerProperty.Z_INDEX] = options.zIndex;
    properties[LayerProperty.MAX_RESOLUTION] =
      options.maxResolution !== undefined ? options.maxResolution : Infinity;
    properties[LayerProperty.MIN_RESOLUTION] =
      options.minResolution !== undefined ? options.minResolution : 0;
    properties[LayerProperty.MIN_ZOOM] =
      options.minZoom !== undefined ? options.minZoom : -Infinity;
    properties[LayerProperty.MAX_ZOOM] =
      options.maxZoom !== undefined ? options.maxZoom : Infinity;

    /**
     * @type {string}
     * @private
     */
    this.className_ =
      properties.className !== undefined ? properties.className : 'ol-layer';
    delete properties.className;

    this.setProperties(properties);

    /**
     * @type {import("./Layer.js").State}
     * @private
     */
    this.state_ = null;
  }

  /**
   * Get the background for this layer.
   * @return {BackgroundColor|false} Layer background.
   */
  getBackground() {
    return this.background_;
  }

  /**
   * @return {string} CSS class name.
   */
  getClassName() {
    return this.className_;
  }

  /**
   * This method is not meant to be called by layers or layer renderers because the state
   * is incorrect if the layer is included in a layer group.
   *
   * @param {boolean} [managed] Layer is managed.
   * @return {import("./Layer.js").State} Layer state.
   */
  getLayerState(managed) {
    /** @type {import("./Layer.js").State} */
    const state =
      this.state_ ||
      /** @type {?} */ ({
        layer: this,
        managed: managed === undefined ? true : managed,
      });
    const zIndex = this.getZIndex();
    state.opacity = clamp(Math.round(this.getOpacity() * 100) / 100, 0, 1);
    state.visible = this.getVisible();
    state.extent = this.getExtent();
    state.zIndex = zIndex === undefined && !state.managed ? Infinity : zIndex;
    state.maxResolution = this.getMaxResolution();
    state.minResolution = Math.max(this.getMinResolution(), 0);
    state.minZoom = this.getMinZoom();
    state.maxZoom = this.getMaxZoom();
    this.state_ = state;

    return state;
  }

  /**
   * @abstract
   * @param {Array<import("./Layer.js").default>} [array] Array of layers (to be
   *     modified in place).
   * @return {Array<import("./Layer.js").default>} Array of layers.
   */
  getLayersArray(array) {
    return abstract();
  }

  /**
   * @abstract
   * @param {Array<import("./Layer.js").State>} [states] Optional list of layer
   *     states (to be modified in place).
   * @return {Array<import("./Layer.js").State>} List of layer states.
   */
  getLayerStatesArray(states) {
    return abstract();
  }

  /**
   * Return the {@link module:ol/extent~Extent extent} of the layer or `undefined` if it
   * will be visible regardless of extent.
   * @return {import("../extent.js").Extent|undefined} The layer extent.
   * @observable
   * @api
   */
  getExtent() {
    return /** @type {import("../extent.js").Extent|undefined} */ (
      this.get(LayerProperty.EXTENT)
    );
  }

  /**
   * Return the maximum resolution of the layer.
   * @return {number} The maximum resolution of the layer.
   * @observable
   * @api
   */
  getMaxResolution() {
    return /** @type {number} */ (this.get(LayerProperty.MAX_RESOLUTION));
  }

  /**
   * Return the minimum resolution of the layer.
   * @return {number} The minimum resolution of the layer.
   * @observable
   * @api
   */
  getMinResolution() {
    return /** @type {number} */ (this.get(LayerProperty.MIN_RESOLUTION));
  }

  /**
   * Return the minimum zoom level of the layer.
   * @return {number} The minimum zoom level of the layer.
   * @observable
   * @api
   */
  getMinZoom() {
    return /** @type {number} */ (this.get(LayerProperty.MIN_ZOOM));
  }

  /**
   * Return the maximum zoom level of the layer.
   * @return {number} The maximum zoom level of the layer.
   * @observable
   * @api
   */
  getMaxZoom() {
    return /** @type {number} */ (this.get(LayerProperty.MAX_ZOOM));
  }

  /**
   * Return the opacity of the layer (between 0 and 1).
   * @return {number} The opacity of the layer.
   * @observable
   * @api
   */
  getOpacity() {
    return /** @type {number} */ (this.get(LayerProperty.OPACITY));
  }

  /**
   * @abstract
   * @return {import("../source/Source.js").State} Source state.
   */
  getSourceState() {
    return abstract();
  }

  /**
   * Return the visibility of the layer (`true` or `false`).
   * @return {boolean} The visibility of the layer.
   * @observable
   * @api
   */
  getVisible() {
    return /** @type {boolean} */ (this.get(LayerProperty.VISIBLE));
  }

  /**
   * Return the Z-index of the layer, which is used to order layers before
   * rendering. The default Z-index is 0.
   * @return {number} The Z-index of the layer.
   * @observable
   * @api
   */
  getZIndex() {
    return /** @type {number} */ (this.get(LayerProperty.Z_INDEX));
  }

  /**
   * Sets the background color.
   * @param {BackgroundColor} [background] Background color.
   */
  setBackground(background) {
    this.background_ = background;
    this.changed();
  }

  /**
   * Set the extent at which the layer is visible.  If `undefined`, the layer
   * will be visible at all extents.
   * @param {import("../extent.js").Extent|undefined} extent The extent of the layer.
   * @observable
   * @api
   */
  setExtent(extent) {
    this.set(LayerProperty.EXTENT, extent);
  }

  /**
   * Set the maximum resolution at which the layer is visible.
   * @param {number} maxResolution The maximum resolution of the layer.
   * @observable
   * @api
   */
  setMaxResolution(maxResolution) {
    this.set(LayerProperty.MAX_RESOLUTION, maxResolution);
  }

  /**
   * Set the minimum resolution at which the layer is visible.
   * @param {number} minResolution The minimum resolution of the layer.
   * @observable
   * @api
   */
  setMinResolution(minResolution) {
    this.set(LayerProperty.MIN_RESOLUTION, minResolution);
  }

  /**
   * Set the maximum zoom (exclusive) at which the layer is visible.
   * Note that the zoom levels for layer visibility are based on the
   * view zoom level, which may be different from a tile source zoom level.
   * @param {number} maxZoom The maximum zoom of the layer.
   * @observable
   * @api
   */
  setMaxZoom(maxZoom) {
    this.set(LayerProperty.MAX_ZOOM, maxZoom);
  }

  /**
   * Set the minimum zoom (inclusive) at which the layer is visible.
   * Note that the zoom levels for layer visibility are based on the
   * view zoom level, which may be different from a tile source zoom level.
   * @param {number} minZoom The minimum zoom of the layer.
   * @observable
   * @api
   */
  setMinZoom(minZoom) {
    this.set(LayerProperty.MIN_ZOOM, minZoom);
  }

  /**
   * Set the opacity of the layer, allowed values range from 0 to 1.
   * @param {number} opacity The opacity of the layer.
   * @observable
   * @api
   */
  setOpacity(opacity) {
    assert(typeof opacity === 'number', 64); // Layer opacity must be a number
    this.set(LayerProperty.OPACITY, opacity);
  }

  /**
   * Set the visibility of the layer (`true` or `false`).
   * @param {boolean} visible The visibility of the layer.
   * @observable
   * @api
   */
  setVisible(visible) {
    this.set(LayerProperty.VISIBLE, visible);
  }

  /**
   * Set Z-index of the layer, which is used to order layers before rendering.
   * The default Z-index is 0.
   * @param {number} zindex The z-index of the layer.
   * @observable
   * @api
   */
  setZIndex(zindex) {
    this.set(LayerProperty.Z_INDEX, zindex);
  }

  /**
   * Clean up.
   */
  disposeInternal() {
    if (this.state_) {
      this.state_.layer = null;
      this.state_ = null;
    }
    super.disposeInternal();
  }
}

var BaseLayer$1 = BaseLayer;

/**
 * @module ol/render/EventType
 */

/**
 * @enum {string}
 */
var RenderEventType = {
  /**
   * Triggered before a layer is rendered.
   * @event module:ol/render/Event~RenderEvent#prerender
   * @api
   */
  PRERENDER: 'prerender',

  /**
   * Triggered after a layer is rendered.
   * @event module:ol/render/Event~RenderEvent#postrender
   * @api
   */
  POSTRENDER: 'postrender',

  /**
   * Triggered before layers are composed.  When dispatched by the map, the event object will not have
   * a `context` set.  When dispatched by a layer, the event object will have a `context` set.  Only
   * WebGL layers currently dispatch this event.
   * @event module:ol/render/Event~RenderEvent#precompose
   * @api
   */
  PRECOMPOSE: 'precompose',

  /**
   * Triggered after layers are composed.  When dispatched by the map, the event object will not have
   * a `context` set.  When dispatched by a layer, the event object will have a `context` set.  Only
   * WebGL layers currently dispatch this event.
   * @event module:ol/render/Event~RenderEvent#postcompose
   * @api
   */
  POSTCOMPOSE: 'postcompose',

  /**
   * Triggered when rendering is complete, i.e. all sources and tiles have
   * finished loading for the current viewport, and all tiles are faded in.
   * The event object will not have a `context` set.
   * @event module:ol/render/Event~RenderEvent#rendercomplete
   * @api
   */
  RENDERCOMPLETE: 'rendercomplete',
};

/**
 * @typedef {'postrender'|'precompose'|'postcompose'|'rendercomplete'} MapRenderEventTypes
 */

/**
 * @typedef {'postrender'|'prerender'} LayerRenderEventTypes
 */

/**
 * @module ol/layer/Layer
 */

/**
 * @typedef {function(import("../Map.js").FrameState):HTMLElement} RenderFunction
 */

/**
 * @typedef {'sourceready'|'change:source'} LayerEventType
 */

/***
 * @template Return
 * @typedef {import("../Observable").OnSignature<import("../Observable").EventTypes, import("../events/Event.js").default, Return> &
 *   import("../Observable").OnSignature<import("./Base").BaseLayerObjectEventTypes|
 *     LayerEventType, import("../Object").ObjectEvent, Return> &
 *   import("../Observable").OnSignature<import("../render/EventType").LayerRenderEventTypes, import("../render/Event").default, Return> &
 *   import("../Observable").CombinedOnSignature<import("../Observable").EventTypes|import("./Base").BaseLayerObjectEventTypes|LayerEventType|
 *     import("../render/EventType").LayerRenderEventTypes, Return>} LayerOnSignature
 */

/**
 * @template {import("../source/Source.js").default} [SourceType=import("../source/Source.js").default]
 * @typedef {Object} Options
 * @property {string} [className='ol-layer'] A CSS class name to set to the layer element.
 * @property {number} [opacity=1] Opacity (0, 1).
 * @property {boolean} [visible=true] Visibility.
 * @property {import("../extent.js").Extent} [extent] The bounding extent for layer rendering.  The layer will not be
 * rendered outside of this extent.
 * @property {number} [zIndex] The z-index for layer rendering.  At rendering time, the layers
 * will be ordered, first by Z-index and then by position. When `undefined`, a `zIndex` of 0 is assumed
 * for layers that are added to the map's `layers` collection, or `Infinity` when the layer's `setMap()`
 * method was used.
 * @property {number} [minResolution] The minimum resolution (inclusive) at which this layer will be
 * visible.
 * @property {number} [maxResolution] The maximum resolution (exclusive) below which this layer will
 * be visible.
 * @property {number} [minZoom] The minimum view zoom level (exclusive) above which this layer will be
 * visible.
 * @property {number} [maxZoom] The maximum view zoom level (inclusive) at which this layer will
 * be visible.
 * @property {SourceType} [source] Source for this layer.  If not provided to the constructor,
 * the source can be set by calling {@link module:ol/layer/Layer~Layer#setSource layer.setSource(source)} after
 * construction.
 * @property {import("../Map.js").default|null} [map] Map.
 * @property {RenderFunction} [render] Render function. Takes the frame state as input and is expected to return an
 * HTML element. Will overwrite the default rendering for the layer.
 * @property {Object<string, *>} [properties] Arbitrary observable properties. Can be accessed with `#get()` and `#set()`.
 */

/**
 * @typedef {Object} State
 * @property {import("./Layer.js").default} layer Layer.
 * @property {number} opacity Opacity, the value is rounded to two digits to appear after the decimal point.
 * @property {boolean} visible Visible.
 * @property {boolean} managed Managed.
 * @property {import("../extent.js").Extent} [extent] Extent.
 * @property {number} zIndex ZIndex.
 * @property {number} maxResolution Maximum resolution.
 * @property {number} minResolution Minimum resolution.
 * @property {number} minZoom Minimum zoom.
 * @property {number} maxZoom Maximum zoom.
 */

/**
 * @classdesc
 * Base class from which all layer types are derived. This should only be instantiated
 * in the case where a custom layer is added to the map with a custom `render` function.
 * Such a function can be specified in the `options` object, and is expected to return an HTML element.
 *
 * A visual representation of raster or vector map data.
 * Layers group together those properties that pertain to how the data is to be
 * displayed, irrespective of the source of that data.
 *
 * Layers are usually added to a map with [map.addLayer()]{@link import("../Map.js").default#addLayer}.
 * Components like {@link module:ol/interaction/Draw~Draw} use unmanaged layers
 * internally. These unmanaged layers are associated with the map using
 * [layer.setMap()]{@link module:ol/layer/Layer~Layer#setMap} instead.
 *
 * A generic `change` event is fired when the state of the source changes.
 * A `sourceready` event is fired when the layer's source is ready.
 *
 * @fires import("../render/Event.js").RenderEvent#prerender
 * @fires import("../render/Event.js").RenderEvent#postrender
 * @fires import("../events/Event.js").BaseEvent#sourceready
 *
 * @template {import("../source/Source.js").default} [SourceType=import("../source/Source.js").default]
 * @template {import("../renderer/Layer.js").default} [RendererType=import("../renderer/Layer.js").default]
 * @api
 */
class Layer extends BaseLayer$1 {
  /**
   * @param {Options<SourceType>} options Layer options.
   */
  constructor(options) {
    const baseOptions = Object.assign({}, options);
    delete baseOptions.source;

    super(baseOptions);

    /***
     * @type {LayerOnSignature<import("../events").EventsKey>}
     */
    this.on;

    /***
     * @type {LayerOnSignature<import("../events").EventsKey>}
     */
    this.once;

    /***
     * @type {LayerOnSignature<void>}
     */
    this.un;

    /**
     * @private
     * @type {?import("../events.js").EventsKey}
     */
    this.mapPrecomposeKey_ = null;

    /**
     * @private
     * @type {?import("../events.js").EventsKey}
     */
    this.mapRenderKey_ = null;

    /**
     * @private
     * @type {?import("../events.js").EventsKey}
     */
    this.sourceChangeKey_ = null;

    /**
     * @private
     * @type {RendererType}
     */
    this.renderer_ = null;

    /**
     * @private
     * @type {boolean}
     */
    this.sourceReady_ = false;

    /**
     * @protected
     * @type {boolean}
     */
    this.rendered = false;

    // Overwrite default render method with a custom one
    if (options.render) {
      this.render = options.render;
    }

    if (options.map) {
      this.setMap(options.map);
    }

    this.addChangeListener(
      LayerProperty.SOURCE,
      this.handleSourcePropertyChange_
    );

    const source = options.source
      ? /** @type {SourceType} */ (options.source)
      : null;
    this.setSource(source);
  }

  /**
   * @param {Array<import("./Layer.js").default>} [array] Array of layers (to be modified in place).
   * @return {Array<import("./Layer.js").default>} Array of layers.
   */
  getLayersArray(array) {
    array = array ? array : [];
    array.push(this);
    return array;
  }

  /**
   * @param {Array<import("./Layer.js").State>} [states] Optional list of layer states (to be modified in place).
   * @return {Array<import("./Layer.js").State>} List of layer states.
   */
  getLayerStatesArray(states) {
    states = states ? states : [];
    states.push(this.getLayerState());
    return states;
  }

  /**
   * Get the layer source.
   * @return {SourceType|null} The layer source (or `null` if not yet set).
   * @observable
   * @api
   */
  getSource() {
    return /** @type {SourceType} */ (this.get(LayerProperty.SOURCE)) || null;
  }

  /**
   * @return {SourceType|null} The source being rendered.
   */
  getRenderSource() {
    return this.getSource();
  }

  /**
   * @return {import("../source/Source.js").State} Source state.
   */
  getSourceState() {
    const source = this.getSource();
    return !source ? 'undefined' : source.getState();
  }

  /**
   * @private
   */
  handleSourceChange_() {
    this.changed();
    if (this.sourceReady_ || this.getSource().getState() !== 'ready') {
      return;
    }
    this.sourceReady_ = true;
    this.dispatchEvent('sourceready');
  }

  /**
   * @private
   */
  handleSourcePropertyChange_() {
    if (this.sourceChangeKey_) {
      unlistenByKey(this.sourceChangeKey_);
      this.sourceChangeKey_ = null;
    }
    this.sourceReady_ = false;
    const source = this.getSource();
    if (source) {
      this.sourceChangeKey_ = listen(
        source,
        EventType.CHANGE,
        this.handleSourceChange_,
        this
      );
      if (source.getState() === 'ready') {
        this.sourceReady_ = true;
        setTimeout(() => {
          this.dispatchEvent('sourceready');
        }, 0);
      }
    }
    this.changed();
  }

  /**
   * @param {import("../pixel").Pixel} pixel Pixel.
   * @return {Promise<Array<import("../Feature").FeatureLike>>} Promise that resolves with
   * an array of features.
   */
  getFeatures(pixel) {
    if (!this.renderer_) {
      return Promise.resolve([]);
    }
    return this.renderer_.getFeatures(pixel);
  }

  /**
   * @param {import("../pixel").Pixel} pixel Pixel.
   * @return {Uint8ClampedArray|Uint8Array|Float32Array|DataView|null} Pixel data.
   */
  getData(pixel) {
    if (!this.renderer_ || !this.rendered) {
      return null;
    }
    return this.renderer_.getData(pixel);
  }

  /**
   * In charge to manage the rendering of the layer. One layer type is
   * bounded with one layer renderer.
   * @param {?import("../Map.js").FrameState} frameState Frame state.
   * @param {HTMLElement} target Target which the renderer may (but need not) use
   * for rendering its content.
   * @return {HTMLElement} The rendered element.
   */
  render(frameState, target) {
    const layerRenderer = this.getRenderer();

    if (layerRenderer.prepareFrame(frameState)) {
      this.rendered = true;
      return layerRenderer.renderFrame(frameState, target);
    }
  }

  /**
   * Called when a layer is not visible during a map render.
   */
  unrender() {
    this.rendered = false;
  }

  /**
   * For use inside the library only.
   * @param {import("../Map.js").default|null} map Map.
   */
  setMapInternal(map) {
    if (!map) {
      this.unrender();
    }
    this.set(LayerProperty.MAP, map);
  }

  /**
   * For use inside the library only.
   * @return {import("../Map.js").default|null} Map.
   */
  getMapInternal() {
    return this.get(LayerProperty.MAP);
  }

  /**
   * Sets the layer to be rendered on top of other layers on a map. The map will
   * not manage this layer in its layers collection. This
   * is useful for temporary layers. To remove an unmanaged layer from the map,
   * use `#setMap(null)`.
   *
   * To add the layer to a map and have it managed by the map, use
   * {@link module:ol/Map~Map#addLayer} instead.
   * @param {import("../Map.js").default|null} map Map.
   * @api
   */
  setMap(map) {
    if (this.mapPrecomposeKey_) {
      unlistenByKey(this.mapPrecomposeKey_);
      this.mapPrecomposeKey_ = null;
    }
    if (!map) {
      this.changed();
    }
    if (this.mapRenderKey_) {
      unlistenByKey(this.mapRenderKey_);
      this.mapRenderKey_ = null;
    }
    if (map) {
      this.mapPrecomposeKey_ = listen(
        map,
        RenderEventType.PRECOMPOSE,
        function (evt) {
          const renderEvent =
            /** @type {import("../render/Event.js").default} */ (evt);
          const layerStatesArray = renderEvent.frameState.layerStatesArray;
          const layerState = this.getLayerState(false);
          // A layer can only be added to the map once. Use either `layer.setMap()` or `map.addLayer()`, not both.
          assert(
            !layerStatesArray.some(function (arrayLayerState) {
              return arrayLayerState.layer === layerState.layer;
            }),
            67
          );
          layerStatesArray.push(layerState);
        },
        this
      );
      this.mapRenderKey_ = listen(this, EventType.CHANGE, map.render, map);
      this.changed();
    }
  }

  /**
   * Set the layer source.
   * @param {SourceType|null} source The layer source.
   * @observable
   * @api
   */
  setSource(source) {
    this.set(LayerProperty.SOURCE, source);
  }

  /**
   * Get the renderer for this layer.
   * @return {RendererType|null} The layer renderer.
   */
  getRenderer() {
    if (!this.renderer_) {
      this.renderer_ = this.createRenderer();
    }
    return this.renderer_;
  }

  /**
   * @return {boolean} The layer has a renderer.
   */
  hasRenderer() {
    return !!this.renderer_;
  }

  /**
   * Create a renderer for this layer.
   * @return {RendererType} A layer renderer.
   * @protected
   */
  createRenderer() {
    return null;
  }

  /**
   * Clean up.
   */
  disposeInternal() {
    if (this.renderer_) {
      this.renderer_.dispose();
      delete this.renderer_;
    }

    this.setSource(null);
    super.disposeInternal();
  }
}

/**
 * Return `true` if the layer is visible and if the provided view state
 * has resolution and zoom levels that are in range of the layer's min/max.
 * @param {State} layerState Layer state.
 * @param {import("../View.js").State} viewState View state.
 * @return {boolean} The layer is visible at the given view state.
 */
function inView(layerState, viewState) {
  if (!layerState.visible) {
    return false;
  }
  const resolution = viewState.resolution;
  if (
    resolution < layerState.minResolution ||
    resolution >= layerState.maxResolution
  ) {
    return false;
  }
  const zoom = viewState.zoom;
  return zoom > layerState.minZoom && zoom <= layerState.maxZoom;
}

var Layer$1 = Layer;

/**
 * @module ol/coordinate
 */

/**
 * An array of numbers representing an xy coordinate. Example: `[16, 48]`.
 * @typedef {Array<number>} Coordinate
 * @api
 */

/**
 * A function that takes a {@link module:ol/coordinate~Coordinate} and
 * transforms it into a `{string}`.
 *
 * @typedef {function((Coordinate|undefined)): string} CoordinateFormat
 * @api
 */

/**
 * Add `delta` to `coordinate`. `coordinate` is modified in place and returned
 * by the function.
 *
 * Example:
 *
 *     import {add} from 'ol/coordinate.js';
 *
 *     const coord = [7.85, 47.983333];
 *     add(coord, [-2, 4]);
 *     // coord is now [5.85, 51.983333]
 *
 * @param {Coordinate} coordinate Coordinate.
 * @param {Coordinate} delta Delta.
 * @return {Coordinate} The input coordinate adjusted by
 * the given delta.
 * @api
 */
function add$2(coordinate, delta) {
  coordinate[0] += +delta[0];
  coordinate[1] += +delta[1];
  return coordinate;
}

/**
 * @param {Coordinate} coordinate1 First coordinate.
 * @param {Coordinate} coordinate2 Second coordinate.
 * @return {boolean} The two coordinates are equal.
 */
function equals(coordinate1, coordinate2) {
  let equals = true;
  for (let i = coordinate1.length - 1; i >= 0; --i) {
    if (coordinate1[i] != coordinate2[i]) {
      equals = false;
      break;
    }
  }
  return equals;
}

/**
 * Rotate `coordinate` by `angle`. `coordinate` is modified in place and
 * returned by the function.
 *
 * Example:
 *
 *     import {rotate} from 'ol/coordinate.js';
 *
 *     const coord = [7.85, 47.983333];
 *     const rotateRadians = Math.PI / 2; // 90 degrees
 *     rotate(coord, rotateRadians);
 *     // coord is now [-47.983333, 7.85]
 *
 * @param {Coordinate} coordinate Coordinate.
 * @param {number} angle Angle in radian.
 * @return {Coordinate} Coordinate.
 * @api
 */
function rotate$1(coordinate, angle) {
  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);
  const x = coordinate[0] * cosAngle - coordinate[1] * sinAngle;
  const y = coordinate[1] * cosAngle + coordinate[0] * sinAngle;
  coordinate[0] = x;
  coordinate[1] = y;
  return coordinate;
}

/**
 * Scale `coordinate` by `scale`. `coordinate` is modified in place and returned
 * by the function.
 *
 * Example:
 *
 *     import {scale as scaleCoordinate} from 'ol/coordinate.js';
 *
 *     const coord = [7.85, 47.983333];
 *     const scale = 1.2;
 *     scaleCoordinate(coord, scale);
 *     // coord is now [9.42, 57.5799996]
 *
 * @param {Coordinate} coordinate Coordinate.
 * @param {number} scale Scale factor.
 * @return {Coordinate} Coordinate.
 */
function scale$2(coordinate, scale) {
  coordinate[0] *= scale;
  coordinate[1] *= scale;
  return coordinate;
}

/**
 * Modifies the provided coordinate in-place to be within the real world
 * extent. The lower projection extent boundary is inclusive, the upper one
 * exclusive.
 *
 * @param {Coordinate} coordinate Coordinate.
 * @param {import("./proj/Projection.js").default} projection Projection.
 * @return {Coordinate} The coordinate within the real world extent.
 */
function wrapX$1(coordinate, projection) {
  if (projection.canWrapX()) {
    const worldWidth = getWidth(projection.getExtent());
    const worldsAway = getWorldsAway(coordinate, projection, worldWidth);
    if (worldsAway) {
      coordinate[0] -= worldsAway * worldWidth;
    }
  }
  return coordinate;
}
/**
 * @param {Coordinate} coordinate Coordinate.
 * @param {import("./proj/Projection.js").default} projection Projection.
 * @param {number} [sourceExtentWidth] Width of the source extent.
 * @return {number} Offset in world widths.
 */
function getWorldsAway(coordinate, projection, sourceExtentWidth) {
  const projectionExtent = projection.getExtent();
  let worldsAway = 0;
  if (
    projection.canWrapX() &&
    (coordinate[0] < projectionExtent[0] || coordinate[0] > projectionExtent[2])
  ) {
    sourceExtentWidth = sourceExtentWidth || getWidth(projectionExtent);
    worldsAway = Math.floor(
      (coordinate[0] - projectionExtent[0]) / sourceExtentWidth
    );
  }
  return worldsAway;
}

/**
 * @module ol/renderer/Map
 */

/**
 * @typedef HitMatch
 * @property {import("../Feature.js").FeatureLike} feature Feature.
 * @property {import("../layer/Layer.js").default} layer Layer.
 * @property {import("../geom/SimpleGeometry.js").default} geometry Geometry.
 * @property {number} distanceSq Squared distance.
 * @property {import("./vector.js").FeatureCallback<T>} callback Callback.
 * @template T
 */

/**
 * @abstract
 */
class MapRenderer extends Disposable$1 {
  /**
   * @param {import("../Map.js").default} map Map.
   */
  constructor(map) {
    super();

    /**
     * @private
     * @type {import("../Map.js").default}
     */
    this.map_ = map;
  }

  /**
   * @abstract
   * @param {import("../render/EventType.js").default} type Event type.
   * @param {import("../Map.js").FrameState} frameState Frame state.
   */
  dispatchRenderEvent(type, frameState) {
    abstract();
  }

  /**
   * @param {import("../Map.js").FrameState} frameState FrameState.
   * @protected
   */
  calculateMatrices2D(frameState) {
    const viewState = frameState.viewState;
    const coordinateToPixelTransform = frameState.coordinateToPixelTransform;
    const pixelToCoordinateTransform = frameState.pixelToCoordinateTransform;

    compose(
      coordinateToPixelTransform,
      frameState.size[0] / 2,
      frameState.size[1] / 2,
      1 / viewState.resolution,
      -1 / viewState.resolution,
      -viewState.rotation,
      -viewState.center[0],
      -viewState.center[1]
    );

    makeInverse(pixelToCoordinateTransform, coordinateToPixelTransform);
  }

  /**
   * @param {import("../coordinate.js").Coordinate} coordinate Coordinate.
   * @param {import("../Map.js").FrameState} frameState FrameState.
   * @param {number} hitTolerance Hit tolerance in pixels.
   * @param {boolean} checkWrapped Check for wrapped geometries.
   * @param {import("./vector.js").FeatureCallback<T>} callback Feature callback.
   * @param {S} thisArg Value to use as `this` when executing `callback`.
   * @param {function(this: U, import("../layer/Layer.js").default): boolean} layerFilter Layer filter
   *     function, only layers which are visible and for which this function
   *     returns `true` will be tested for features.  By default, all visible
   *     layers will be tested.
   * @param {U} thisArg2 Value to use as `this` when executing `layerFilter`.
   * @return {T|undefined} Callback result.
   * @template S,T,U
   */
  forEachFeatureAtCoordinate(
    coordinate,
    frameState,
    hitTolerance,
    checkWrapped,
    callback,
    thisArg,
    layerFilter,
    thisArg2
  ) {
    let result;
    const viewState = frameState.viewState;

    /**
     * @param {boolean} managed Managed layer.
     * @param {import("../Feature.js").FeatureLike} feature Feature.
     * @param {import("../layer/Layer.js").default} layer Layer.
     * @param {import("../geom/Geometry.js").default} geometry Geometry.
     * @return {T|undefined} Callback result.
     */
    function forEachFeatureAtCoordinate(managed, feature, layer, geometry) {
      return callback.call(thisArg, feature, managed ? layer : null, geometry);
    }

    const projection = viewState.projection;

    const translatedCoordinate = wrapX$1(coordinate.slice(), projection);
    const offsets = [[0, 0]];
    if (projection.canWrapX() && checkWrapped) {
      const projectionExtent = projection.getExtent();
      const worldWidth = getWidth(projectionExtent);
      offsets.push([-worldWidth, 0], [worldWidth, 0]);
    }

    const layerStates = frameState.layerStatesArray;
    const numLayers = layerStates.length;

    const matches = /** @type {Array<HitMatch<T>>} */ ([]);
    const tmpCoord = [];
    for (let i = 0; i < offsets.length; i++) {
      for (let j = numLayers - 1; j >= 0; --j) {
        const layerState = layerStates[j];
        const layer = layerState.layer;
        if (
          layer.hasRenderer() &&
          inView(layerState, viewState) &&
          layerFilter.call(thisArg2, layer)
        ) {
          const layerRenderer = layer.getRenderer();
          const source = layer.getSource();
          if (layerRenderer && source) {
            const coordinates = source.getWrapX()
              ? translatedCoordinate
              : coordinate;
            const callback = forEachFeatureAtCoordinate.bind(
              null,
              layerState.managed
            );
            tmpCoord[0] = coordinates[0] + offsets[i][0];
            tmpCoord[1] = coordinates[1] + offsets[i][1];
            result = layerRenderer.forEachFeatureAtCoordinate(
              tmpCoord,
              frameState,
              hitTolerance,
              callback,
              matches
            );
          }
          if (result) {
            return result;
          }
        }
      }
    }
    if (matches.length === 0) {
      return undefined;
    }
    const order = 1 / matches.length;
    matches.forEach((m, i) => (m.distanceSq += i * order));
    matches.sort((a, b) => a.distanceSq - b.distanceSq);
    matches.some((m) => {
      return (result = m.callback(m.feature, m.layer, m.geometry));
    });
    return result;
  }

  /**
   * @param {import("../coordinate.js").Coordinate} coordinate Coordinate.
   * @param {import("../Map.js").FrameState} frameState FrameState.
   * @param {number} hitTolerance Hit tolerance in pixels.
   * @param {boolean} checkWrapped Check for wrapped geometries.
   * @param {function(this: U, import("../layer/Layer.js").default): boolean} layerFilter Layer filter
   *     function, only layers which are visible and for which this function
   *     returns `true` will be tested for features.  By default, all visible
   *     layers will be tested.
   * @param {U} thisArg Value to use as `this` when executing `layerFilter`.
   * @return {boolean} Is there a feature at the given coordinate?
   * @template U
   */
  hasFeatureAtCoordinate(
    coordinate,
    frameState,
    hitTolerance,
    checkWrapped,
    layerFilter,
    thisArg
  ) {
    const hasFeature = this.forEachFeatureAtCoordinate(
      coordinate,
      frameState,
      hitTolerance,
      checkWrapped,
      TRUE,
      this,
      layerFilter,
      thisArg
    );

    return hasFeature !== undefined;
  }

  /**
   * @return {import("../Map.js").default} Map.
   */
  getMap() {
    return this.map_;
  }

  /**
   * Render.
   * @abstract
   * @param {?import("../Map.js").FrameState} frameState Frame state.
   */
  renderFrame(frameState) {
    abstract();
  }

  /**
   * @param {import("../Map.js").FrameState} frameState Frame state.
   * @protected
   */
  scheduleExpireIconCache(frameState) {
    if (shared.canExpireCache()) {
      frameState.postRenderFunctions.push(expireIconCache);
    }
  }
}

/**
 * @param {import("../Map.js").default} map Map.
 * @param {import("../Map.js").FrameState} frameState Frame state.
 */
function expireIconCache(map, frameState) {
  shared.expire();
}

var MapRenderer$1 = MapRenderer;

/**
 * @module ol/render/Event
 */

class RenderEvent extends Event {
  /**
   * @param {import("./EventType.js").default} type Type.
   * @param {import("../transform.js").Transform} [inversePixelTransform] Transform for
   *     CSS pixels to rendered pixels.
   * @param {import("../Map.js").FrameState} [frameState] Frame state.
   * @param {?(CanvasRenderingContext2D|WebGLRenderingContext)} [context] Context.
   */
  constructor(type, inversePixelTransform, frameState, context) {
    super(type);

    /**
     * Transform from CSS pixels (relative to the top-left corner of the map viewport)
     * to rendered pixels on this event's `context`. Only available when a Canvas renderer is used, null otherwise.
     * @type {import("../transform.js").Transform|undefined}
     * @api
     */
    this.inversePixelTransform = inversePixelTransform;

    /**
     * An object representing the current render frame state.
     * @type {import("../Map.js").FrameState|undefined}
     * @api
     */
    this.frameState = frameState;

    /**
     * Canvas context. Not available when the event is dispatched by the map. For Canvas 2D layers,
     * the context will be the 2D rendering context.  For WebGL layers, the context will be the WebGL
     * context.
     * @type {CanvasRenderingContext2D|WebGLRenderingContext|undefined}
     * @api
     */
    this.context = context;
  }
}

var RenderEvent$1 = RenderEvent;

/**
 * @module ol/css
 */

/**
 * @typedef {Object} FontParameters
 * @property {string} style Style.
 * @property {string} variant Variant.
 * @property {string} weight Weight.
 * @property {string} size Size.
 * @property {string} lineHeight LineHeight.
 * @property {string} family Family.
 * @property {Array<string>} families Families.
 */

/**
 * The CSS class for hidden feature.
 *
 * @const
 * @type {string}
 */
const CLASS_HIDDEN = 'ol-hidden';

/**
 * The CSS class that we'll give the DOM elements to have them unselectable.
 *
 * @const
 * @type {string}
 */
const CLASS_UNSELECTABLE = 'ol-unselectable';

/**
 * The CSS class for controls.
 *
 * @const
 * @type {string}
 */
const CLASS_CONTROL = 'ol-control';

/**
 * The CSS class that we'll give the DOM elements that are collapsed, i.e.
 * to those elements which usually can be expanded.
 *
 * @const
 * @type {string}
 */
const CLASS_COLLAPSED = 'ol-collapsed';

/**
 * @module ol/dom
 */

//FIXME Move this function to the canvas module
/**
 * Create an html canvas element and returns its 2d context.
 * @param {number} [width] Canvas width.
 * @param {number} [height] Canvas height.
 * @param {Array<HTMLCanvasElement>} [canvasPool] Canvas pool to take existing canvas from.
 * @param {CanvasRenderingContext2DSettings} [settings] CanvasRenderingContext2DSettings
 * @return {CanvasRenderingContext2D} The context.
 */
function createCanvasContext2D(width, height, canvasPool, settings) {
  /** @type {HTMLCanvasElement|OffscreenCanvas} */
  let canvas;
  if (canvasPool && canvasPool.length) {
    canvas = canvasPool.shift();
  } else if (WORKER_OFFSCREEN_CANVAS) {
    canvas = new OffscreenCanvas(width || 300, height || 300);
  } else {
    canvas = document.createElement('canvas');
  }
  if (width) {
    canvas.width = width;
  }
  if (height) {
    canvas.height = height;
  }
  //FIXME Allow OffscreenCanvasRenderingContext2D as return type
  return /** @type {CanvasRenderingContext2D} */ (
    canvas.getContext('2d', settings)
  );
}

/**
 * Releases canvas memory to avoid exceeding memory limits in Safari.
 * See https://pqina.nl/blog/total-canvas-memory-use-exceeds-the-maximum-limit/
 * @param {CanvasRenderingContext2D} context Context.
 */
function releaseCanvas(context) {
  const canvas = context.canvas;
  canvas.width = 1;
  canvas.height = 1;
  context.clearRect(0, 0, 1, 1);
}

/**
 * @param {Node} newNode Node to replace old node
 * @param {Node} oldNode The node to be replaced
 */
function replaceNode(newNode, oldNode) {
  const parent = oldNode.parentNode;
  if (parent) {
    parent.replaceChild(newNode, oldNode);
  }
}

/**
 * @param {Node} node The node to remove.
 * @return {Node|null} The node that was removed or null.
 */
function removeNode(node) {
  return node && node.parentNode ? node.parentNode.removeChild(node) : null;
}

/**
 * @param {Node} node The node to remove the children from.
 */
function removeChildren(node) {
  while (node.lastChild) {
    node.removeChild(node.lastChild);
  }
}

/**
 * Transform the children of a parent node so they match the
 * provided list of children.  This function aims to efficiently
 * remove, add, and reorder child nodes while maintaining a simple
 * implementation (it is not guaranteed to minimize DOM operations).
 * @param {Node} node The parent node whose children need reworking.
 * @param {Array<Node>} children The desired children.
 */
function replaceChildren(node, children) {
  const oldChildren = node.childNodes;

  for (let i = 0; true; ++i) {
    const oldChild = oldChildren[i];
    const newChild = children[i];

    // check if our work is done
    if (!oldChild && !newChild) {
      break;
    }

    // check if children match
    if (oldChild === newChild) {
      continue;
    }

    // check if a new child needs to be added
    if (!oldChild) {
      node.appendChild(newChild);
      continue;
    }

    // check if an old child needs to be removed
    if (!newChild) {
      node.removeChild(oldChild);
      --i;
      continue;
    }

    // reorder
    node.insertBefore(newChild, oldChild);
  }
}

/**
 * @module ol/render/canvas
 */

/**
 * @type {BaseObject}
 */
const checkedFonts = new BaseObject$1();

/**
 * @module ol/renderer/Composite
 */

/**
 * @classdesc
 * Canvas map renderer.
 * @api
 */
class CompositeMapRenderer extends MapRenderer$1 {
  /**
   * @param {import("../Map.js").default} map Map.
   */
  constructor(map) {
    super(map);

    /**
     * @type {import("../events.js").EventsKey}
     */
    this.fontChangeListenerKey_ = listen(
      checkedFonts,
      ObjectEventType.PROPERTYCHANGE,
      map.redrawText.bind(map)
    );

    /**
     * @private
     * @type {HTMLDivElement}
     */
    this.element_ = document.createElement('div');
    const style = this.element_.style;
    style.position = 'absolute';
    style.width = '100%';
    style.height = '100%';
    style.zIndex = '0';

    this.element_.className = CLASS_UNSELECTABLE + ' ol-layers';

    const container = map.getViewport();
    container.insertBefore(this.element_, container.firstChild || null);

    /**
     * @private
     * @type {Array<HTMLElement>}
     */
    this.children_ = [];

    /**
     * @private
     * @type {boolean}
     */
    this.renderedVisible_ = true;
  }

  /**
   * @param {import("../render/EventType.js").default} type Event type.
   * @param {import("../Map.js").FrameState} frameState Frame state.
   */
  dispatchRenderEvent(type, frameState) {
    const map = this.getMap();
    if (map.hasListener(type)) {
      const event = new RenderEvent$1(type, undefined, frameState);
      map.dispatchEvent(event);
    }
  }

  disposeInternal() {
    unlistenByKey(this.fontChangeListenerKey_);
    this.element_.parentNode.removeChild(this.element_);
    super.disposeInternal();
  }

  /**
   * Render.
   * @param {?import("../Map.js").FrameState} frameState Frame state.
   */
  renderFrame(frameState) {
    if (!frameState) {
      if (this.renderedVisible_) {
        this.element_.style.display = 'none';
        this.renderedVisible_ = false;
      }
      return;
    }

    this.calculateMatrices2D(frameState);
    this.dispatchRenderEvent(RenderEventType.PRECOMPOSE, frameState);

    const layerStatesArray = frameState.layerStatesArray.sort(function (a, b) {
      return a.zIndex - b.zIndex;
    });
    const viewState = frameState.viewState;

    this.children_.length = 0;
    /**
     * @type {Array<import("../layer/BaseVector.js").default>}
     */
    const declutterLayers = [];
    let previousElement = null;
    for (let i = 0, ii = layerStatesArray.length; i < ii; ++i) {
      const layerState = layerStatesArray[i];
      frameState.layerIndex = i;

      const layer = layerState.layer;
      const sourceState = layer.getSourceState();
      if (
        !inView(layerState, viewState) ||
        (sourceState != 'ready' && sourceState != 'undefined')
      ) {
        layer.unrender();
        continue;
      }

      const element = layer.render(frameState, previousElement);
      if (!element) {
        continue;
      }
      if (element !== previousElement) {
        this.children_.push(element);
        previousElement = element;
      }
      if ('getDeclutter' in layer) {
        declutterLayers.push(
          /** @type {import("../layer/BaseVector.js").default} */ (layer)
        );
      }
    }
    for (let i = declutterLayers.length - 1; i >= 0; --i) {
      declutterLayers[i].renderDeclutter(frameState);
    }

    replaceChildren(this.element_, this.children_);

    this.dispatchRenderEvent(RenderEventType.POSTCOMPOSE, frameState);

    if (!this.renderedVisible_) {
      this.element_.style.display = '';
      this.renderedVisible_ = true;
    }

    this.scheduleExpireIconCache(frameState);
  }
}

var CompositeMapRenderer$1 = CompositeMapRenderer;

/**
 * @module ol/layer/Group
 */

/**
 * @typedef {'addlayer'|'removelayer'} EventType
 */

/**
 * @classdesc
 * A layer group triggers 'addlayer' and 'removelayer' events when layers are added to or removed from
 * the group or one of its child groups.  When a layer group is added to or removed from another layer group,
 * a single event will be triggered (instead of one per layer in the group added or removed).
 */
class GroupEvent extends Event {
  /**
   * @param {EventType} type The event type.
   * @param {BaseLayer} layer The layer.
   */
  constructor(type, layer) {
    super(type);

    /**
     * The added or removed layer.
     * @type {BaseLayer}
     * @api
     */
    this.layer = layer;
  }
}

/***
 * @template Return
 * @typedef {import("../Observable").OnSignature<import("../Observable").EventTypes, import("../events/Event.js").default, Return> &
 *   import("../Observable").OnSignature<import("./Base").BaseLayerObjectEventTypes|
 *     'change:layers', import("../Object").ObjectEvent, Return> &
 *   import("../Observable").CombinedOnSignature<import("../Observable").EventTypes|import("./Base").BaseLayerObjectEventTypes|'change:layers', Return>} GroupOnSignature
 */

/**
 * @typedef {Object} Options
 * @property {number} [opacity=1] Opacity (0, 1).
 * @property {boolean} [visible=true] Visibility.
 * @property {import("../extent.js").Extent} [extent] The bounding extent for layer rendering.  The layer will not be
 * rendered outside of this extent.
 * @property {number} [zIndex] The z-index for layer rendering.  At rendering time, the layers
 * will be ordered, first by Z-index and then by position. When `undefined`, a `zIndex` of 0 is assumed
 * for layers that are added to the map's `layers` collection, or `Infinity` when the layer's `setMap()`
 * method was used.
 * @property {number} [minResolution] The minimum resolution (inclusive) at which this layer will be
 * visible.
 * @property {number} [maxResolution] The maximum resolution (exclusive) below which this layer will
 * be visible.
 * @property {number} [minZoom] The minimum view zoom level (exclusive) above which this layer will be
 * visible.
 * @property {number} [maxZoom] The maximum view zoom level (inclusive) at which this layer will
 * be visible.
 * @property {Array<import("./Base.js").default>|Collection<import("./Base.js").default>} [layers] Child layers.
 * @property {Object<string, *>} [properties] Arbitrary observable properties. Can be accessed with `#get()` and `#set()`.
 */

/**
 * @enum {string}
 * @private
 */
const Property = {
  LAYERS: 'layers',
};

/**
 * @classdesc
 * A {@link module:ol/Collection~Collection} of layers that are handled together.
 *
 * A generic `change` event is triggered when the group/Collection changes.
 *
 * @api
 */
class LayerGroup extends BaseLayer$1 {
  /**
   * @param {Options} [options] Layer options.
   */
  constructor(options) {
    options = options || {};
    const baseOptions = /** @type {Options} */ (Object.assign({}, options));
    delete baseOptions.layers;

    let layers = options.layers;

    super(baseOptions);

    /***
     * @type {GroupOnSignature<import("../events").EventsKey>}
     */
    this.on;

    /***
     * @type {GroupOnSignature<import("../events").EventsKey>}
     */
    this.once;

    /***
     * @type {GroupOnSignature<void>}
     */
    this.un;

    /**
     * @private
     * @type {Array<import("../events.js").EventsKey>}
     */
    this.layersListenerKeys_ = [];

    /**
     * @private
     * @type {Object<string, Array<import("../events.js").EventsKey>>}
     */
    this.listenerKeys_ = {};

    this.addChangeListener(Property.LAYERS, this.handleLayersChanged_);

    if (layers) {
      if (Array.isArray(layers)) {
        layers = new Collection$1(layers.slice(), {unique: true});
      } else {
        assert(typeof (/** @type {?} */ (layers).getArray) === 'function', 43); // Expected `layers` to be an array or a `Collection`
      }
    } else {
      layers = new Collection$1(undefined, {unique: true});
    }

    this.setLayers(layers);
  }

  /**
   * @private
   */
  handleLayerChange_() {
    this.changed();
  }

  /**
   * @private
   */
  handleLayersChanged_() {
    this.layersListenerKeys_.forEach(unlistenByKey);
    this.layersListenerKeys_.length = 0;

    const layers = this.getLayers();
    this.layersListenerKeys_.push(
      listen(layers, CollectionEventType.ADD, this.handleLayersAdd_, this),
      listen(layers, CollectionEventType.REMOVE, this.handleLayersRemove_, this)
    );

    for (const id in this.listenerKeys_) {
      this.listenerKeys_[id].forEach(unlistenByKey);
    }
    clear(this.listenerKeys_);

    const layersArray = layers.getArray();
    for (let i = 0, ii = layersArray.length; i < ii; i++) {
      const layer = layersArray[i];
      this.registerLayerListeners_(layer);
      this.dispatchEvent(new GroupEvent('addlayer', layer));
    }
    this.changed();
  }

  /**
   * @param {BaseLayer} layer The layer.
   */
  registerLayerListeners_(layer) {
    const listenerKeys = [
      listen(
        layer,
        ObjectEventType.PROPERTYCHANGE,
        this.handleLayerChange_,
        this
      ),
      listen(layer, EventType.CHANGE, this.handleLayerChange_, this),
    ];

    if (layer instanceof LayerGroup) {
      listenerKeys.push(
        listen(layer, 'addlayer', this.handleLayerGroupAdd_, this),
        listen(layer, 'removelayer', this.handleLayerGroupRemove_, this)
      );
    }

    this.listenerKeys_[getUid(layer)] = listenerKeys;
  }

  /**
   * @param {GroupEvent} event The layer group event.
   */
  handleLayerGroupAdd_(event) {
    this.dispatchEvent(new GroupEvent('addlayer', event.layer));
  }

  /**
   * @param {GroupEvent} event The layer group event.
   */
  handleLayerGroupRemove_(event) {
    this.dispatchEvent(new GroupEvent('removelayer', event.layer));
  }

  /**
   * @param {import("../Collection.js").CollectionEvent<import("./Base.js").default>} collectionEvent CollectionEvent.
   * @private
   */
  handleLayersAdd_(collectionEvent) {
    const layer = collectionEvent.element;
    this.registerLayerListeners_(layer);
    this.dispatchEvent(new GroupEvent('addlayer', layer));
    this.changed();
  }

  /**
   * @param {import("../Collection.js").CollectionEvent<import("./Base.js").default>} collectionEvent CollectionEvent.
   * @private
   */
  handleLayersRemove_(collectionEvent) {
    const layer = collectionEvent.element;
    const key = getUid(layer);
    this.listenerKeys_[key].forEach(unlistenByKey);
    delete this.listenerKeys_[key];
    this.dispatchEvent(new GroupEvent('removelayer', layer));
    this.changed();
  }

  /**
   * Returns the {@link module:ol/Collection~Collection collection} of {@link module:ol/layer/Layer~Layer layers}
   * in this group.
   * @return {!Collection<import("./Base.js").default>} Collection of
   *   {@link module:ol/layer/Base~BaseLayer layers} that are part of this group.
   * @observable
   * @api
   */
  getLayers() {
    return /** @type {!Collection<import("./Base.js").default>} */ (
      this.get(Property.LAYERS)
    );
  }

  /**
   * Set the {@link module:ol/Collection~Collection collection} of {@link module:ol/layer/Layer~Layer layers}
   * in this group.
   * @param {!Collection<import("./Base.js").default>} layers Collection of
   *   {@link module:ol/layer/Base~BaseLayer layers} that are part of this group.
   * @observable
   * @api
   */
  setLayers(layers) {
    const collection = this.getLayers();
    if (collection) {
      const currentLayers = collection.getArray();
      for (let i = 0, ii = currentLayers.length; i < ii; ++i) {
        this.dispatchEvent(new GroupEvent('removelayer', currentLayers[i]));
      }
    }

    this.set(Property.LAYERS, layers);
  }

  /**
   * @param {Array<import("./Layer.js").default>} [array] Array of layers (to be modified in place).
   * @return {Array<import("./Layer.js").default>} Array of layers.
   */
  getLayersArray(array) {
    array = array !== undefined ? array : [];
    this.getLayers().forEach(function (layer) {
      layer.getLayersArray(array);
    });
    return array;
  }

  /**
   * Get the layer states list and use this groups z-index as the default
   * for all layers in this and nested groups, if it is unset at this point.
   * If dest is not provided and this group's z-index is undefined
   * 0 is used a the default z-index.
   * @param {Array<import("./Layer.js").State>} [dest] Optional list
   * of layer states (to be modified in place).
   * @return {Array<import("./Layer.js").State>} List of layer states.
   */
  getLayerStatesArray(dest) {
    const states = dest !== undefined ? dest : [];
    const pos = states.length;

    this.getLayers().forEach(function (layer) {
      layer.getLayerStatesArray(states);
    });

    const ownLayerState = this.getLayerState();
    let defaultZIndex = ownLayerState.zIndex;
    if (!dest && ownLayerState.zIndex === undefined) {
      defaultZIndex = 0;
    }
    for (let i = pos, ii = states.length; i < ii; i++) {
      const layerState = states[i];
      layerState.opacity *= ownLayerState.opacity;
      layerState.visible = layerState.visible && ownLayerState.visible;
      layerState.maxResolution = Math.min(
        layerState.maxResolution,
        ownLayerState.maxResolution
      );
      layerState.minResolution = Math.max(
        layerState.minResolution,
        ownLayerState.minResolution
      );
      layerState.minZoom = Math.max(layerState.minZoom, ownLayerState.minZoom);
      layerState.maxZoom = Math.min(layerState.maxZoom, ownLayerState.maxZoom);
      if (ownLayerState.extent !== undefined) {
        if (layerState.extent !== undefined) {
          layerState.extent = getIntersection(
            layerState.extent,
            ownLayerState.extent
          );
        } else {
          layerState.extent = ownLayerState.extent;
        }
      }
      if (layerState.zIndex === undefined) {
        layerState.zIndex = defaultZIndex;
      }
    }

    return states;
  }

  /**
   * @return {import("../source/Source.js").State} Source state.
   */
  getSourceState() {
    return 'ready';
  }
}

var LayerGroup$1 = LayerGroup;

/**
 * @module ol/MapEvent
 */

/**
 * @classdesc
 * Events emitted as map events are instances of this type.
 * See {@link module:ol/Map~Map} for which events trigger a map event.
 */
class MapEvent extends Event {
  /**
   * @param {string} type Event type.
   * @param {import("./Map.js").default} map Map.
   * @param {?import("./Map.js").FrameState} [frameState] Frame state.
   */
  constructor(type, map, frameState) {
    super(type);

    /**
     * The map where the event occurred.
     * @type {import("./Map.js").default}
     * @api
     */
    this.map = map;

    /**
     * The frame state at the time of the event.
     * @type {?import("./Map.js").FrameState}
     * @api
     */
    this.frameState = frameState !== undefined ? frameState : null;
  }
}

var MapEvent$1 = MapEvent;

/**
 * @module ol/MapBrowserEvent
 */

/**
 * @classdesc
 * Events emitted as map browser events are instances of this type.
 * See {@link module:ol/Map~Map} for which events trigger a map browser event.
 * @template {UIEvent} EVENT
 */
class MapBrowserEvent extends MapEvent$1 {
  /**
   * @param {string} type Event type.
   * @param {import("./Map.js").default} map Map.
   * @param {EVENT} originalEvent Original event.
   * @param {boolean} [dragging] Is the map currently being dragged?
   * @param {import("./Map.js").FrameState} [frameState] Frame state.
   * @param {Array<PointerEvent>} [activePointers] Active pointers.
   */
  constructor(type, map, originalEvent, dragging, frameState, activePointers) {
    super(type, map, frameState);

    /**
     * The original browser event.
     * @const
     * @type {EVENT}
     * @api
     */
    this.originalEvent = originalEvent;

    /**
     * The map pixel relative to the viewport corresponding to the original browser event.
     * @type {?import("./pixel.js").Pixel}
     */
    this.pixel_ = null;

    /**
     * The coordinate in the user projection corresponding to the original browser event.
     * @type {?import("./coordinate.js").Coordinate}
     */
    this.coordinate_ = null;

    /**
     * Indicates if the map is currently being dragged. Only set for
     * `POINTERDRAG` and `POINTERMOVE` events. Default is `false`.
     *
     * @type {boolean}
     * @api
     */
    this.dragging = dragging !== undefined ? dragging : false;

    /**
     * @type {Array<PointerEvent>|undefined}
     */
    this.activePointers = activePointers;
  }

  /**
   * The map pixel relative to the viewport corresponding to the original event.
   * @type {import("./pixel.js").Pixel}
   * @api
   */
  get pixel() {
    if (!this.pixel_) {
      this.pixel_ = this.map.getEventPixel(this.originalEvent);
    }
    return this.pixel_;
  }
  set pixel(pixel) {
    this.pixel_ = pixel;
  }

  /**
   * The coordinate corresponding to the original browser event.  This will be in the user
   * projection if one is set.  Otherwise it will be in the view projection.
   * @type {import("./coordinate.js").Coordinate}
   * @api
   */
  get coordinate() {
    if (!this.coordinate_) {
      this.coordinate_ = this.map.getCoordinateFromPixel(this.pixel);
    }
    return this.coordinate_;
  }
  set coordinate(coordinate) {
    this.coordinate_ = coordinate;
  }

  /**
   * Prevents the default browser action.
   * See https://developer.mozilla.org/en-US/docs/Web/API/event.preventDefault.
   * @api
   */
  preventDefault() {
    super.preventDefault();
    if ('preventDefault' in this.originalEvent) {
      /** @type {UIEvent} */ (this.originalEvent).preventDefault();
    }
  }

  /**
   * Prevents further propagation of the current event.
   * See https://developer.mozilla.org/en-US/docs/Web/API/event.stopPropagation.
   * @api
   */
  stopPropagation() {
    super.stopPropagation();
    if ('stopPropagation' in this.originalEvent) {
      /** @type {UIEvent} */ (this.originalEvent).stopPropagation();
    }
  }
}

var MapBrowserEvent$1 = MapBrowserEvent;

/**
 * @module ol/MapBrowserEventType
 */

/**
 * Constants for event names.
 * @enum {string}
 */
var MapBrowserEventType = {
  /**
   * A true single click with no dragging and no double click. Note that this
   * event is delayed by 250 ms to ensure that it is not a double click.
   * @event module:ol/MapBrowserEvent~MapBrowserEvent#singleclick
   * @api
   */
  SINGLECLICK: 'singleclick',

  /**
   * A click with no dragging. A double click will fire two of this.
   * @event module:ol/MapBrowserEvent~MapBrowserEvent#click
   * @api
   */
  CLICK: EventType.CLICK,

  /**
   * A true double click, with no dragging.
   * @event module:ol/MapBrowserEvent~MapBrowserEvent#dblclick
   * @api
   */
  DBLCLICK: EventType.DBLCLICK,

  /**
   * Triggered when a pointer is dragged.
   * @event module:ol/MapBrowserEvent~MapBrowserEvent#pointerdrag
   * @api
   */
  POINTERDRAG: 'pointerdrag',

  /**
   * Triggered when a pointer is moved. Note that on touch devices this is
   * triggered when the map is panned, so is not the same as mousemove.
   * @event module:ol/MapBrowserEvent~MapBrowserEvent#pointermove
   * @api
   */
  POINTERMOVE: 'pointermove',

  POINTERDOWN: 'pointerdown',
  POINTERUP: 'pointerup',
  POINTEROVER: 'pointerover',
  POINTEROUT: 'pointerout',
  POINTERENTER: 'pointerenter',
  POINTERLEAVE: 'pointerleave',
  POINTERCANCEL: 'pointercancel',
};

/***
 * @typedef {'singleclick'|'click'|'dblclick'|'pointerdrag'|'pointermove'} Types
 */

/**
 * @module ol/pointer/EventType
 */

/**
 * Constants for event names.
 * @enum {string}
 */
var PointerEventType = {
  POINTERMOVE: 'pointermove',
  POINTERDOWN: 'pointerdown',
  POINTERUP: 'pointerup',
  POINTEROVER: 'pointerover',
  POINTEROUT: 'pointerout',
  POINTERENTER: 'pointerenter',
  POINTERLEAVE: 'pointerleave',
  POINTERCANCEL: 'pointercancel',
};

/**
 * @module ol/MapBrowserEventHandler
 */

class MapBrowserEventHandler extends EventTarget {
  /**
   * @param {import("./Map.js").default} map The map with the viewport to listen to events on.
   * @param {number} [moveTolerance] The minimal distance the pointer must travel to trigger a move.
   */
  constructor(map, moveTolerance) {
    super(map);

    /**
     * This is the element that we will listen to the real events on.
     * @type {import("./Map.js").default}
     * @private
     */
    this.map_ = map;

    /**
     * @type {any}
     * @private
     */
    this.clickTimeoutId_;

    /**
     * Emulate dblclick and singleclick. Will be true when only one pointer is active.
     * @type {boolean}
     */
    this.emulateClicks_ = false;

    /**
     * @type {boolean}
     * @private
     */
    this.dragging_ = false;

    /**
     * @type {!Array<import("./events.js").EventsKey>}
     * @private
     */
    this.dragListenerKeys_ = [];

    /**
     * @type {number}
     * @private
     */
    this.moveTolerance_ = moveTolerance === undefined ? 1 : moveTolerance;

    /**
     * The most recent "down" type event (or null if none have occurred).
     * Set on pointerdown.
     * @type {PointerEvent|null}
     * @private
     */
    this.down_ = null;

    const element = this.map_.getViewport();

    /**
     * @type {Array<PointerEvent>}
     * @private
     */
    this.activePointers_ = [];

    /**
     * @type {!Object<number, Event>}
     * @private
     */
    this.trackedTouches_ = {};

    this.element_ = element;

    /**
     * @type {?import("./events.js").EventsKey}
     * @private
     */
    this.pointerdownListenerKey_ = listen(
      element,
      PointerEventType.POINTERDOWN,
      this.handlePointerDown_,
      this
    );

    /**
     * @type {PointerEvent}
     * @private
     */
    this.originalPointerMoveEvent_;

    /**
     * @type {?import("./events.js").EventsKey}
     * @private
     */
    this.relayedListenerKey_ = listen(
      element,
      PointerEventType.POINTERMOVE,
      this.relayMoveEvent_,
      this
    );

    /**
     * @private
     */
    this.boundHandleTouchMove_ = this.handleTouchMove_.bind(this);

    this.element_.addEventListener(
      EventType.TOUCHMOVE,
      this.boundHandleTouchMove_,
      PASSIVE_EVENT_LISTENERS ? {passive: false} : false
    );
  }

  /**
   * @param {PointerEvent} pointerEvent Pointer
   * event.
   * @private
   */
  emulateClick_(pointerEvent) {
    let newEvent = new MapBrowserEvent$1(
      MapBrowserEventType.CLICK,
      this.map_,
      pointerEvent
    );
    this.dispatchEvent(newEvent);
    if (this.clickTimeoutId_ !== undefined) {
      // double-click
      clearTimeout(this.clickTimeoutId_);
      this.clickTimeoutId_ = undefined;
      newEvent = new MapBrowserEvent$1(
        MapBrowserEventType.DBLCLICK,
        this.map_,
        pointerEvent
      );
      this.dispatchEvent(newEvent);
    } else {
      // click
      this.clickTimeoutId_ = setTimeout(() => {
        this.clickTimeoutId_ = undefined;
        const newEvent = new MapBrowserEvent$1(
          MapBrowserEventType.SINGLECLICK,
          this.map_,
          pointerEvent
        );
        this.dispatchEvent(newEvent);
      }, 250);
    }
  }

  /**
   * Keeps track on how many pointers are currently active.
   *
   * @param {PointerEvent} pointerEvent Pointer
   * event.
   * @private
   */
  updateActivePointers_(pointerEvent) {
    const event = pointerEvent;
    const id = event.pointerId;

    if (
      event.type == MapBrowserEventType.POINTERUP ||
      event.type == MapBrowserEventType.POINTERCANCEL
    ) {
      delete this.trackedTouches_[id];
      for (const pointerId in this.trackedTouches_) {
        if (this.trackedTouches_[pointerId].target !== event.target) {
          // Some platforms assign a new pointerId when the target changes.
          // If this happens, delete one tracked pointer. If there is more
          // than one tracked pointer for the old target, it will be cleared
          // by subsequent POINTERUP events from other pointers.
          delete this.trackedTouches_[pointerId];
          break;
        }
      }
    } else if (
      event.type == MapBrowserEventType.POINTERDOWN ||
      event.type == MapBrowserEventType.POINTERMOVE
    ) {
      this.trackedTouches_[id] = event;
    }
    this.activePointers_ = Object.values(this.trackedTouches_);
  }

  /**
   * @param {PointerEvent} pointerEvent Pointer
   * event.
   * @private
   */
  handlePointerUp_(pointerEvent) {
    this.updateActivePointers_(pointerEvent);
    const newEvent = new MapBrowserEvent$1(
      MapBrowserEventType.POINTERUP,
      this.map_,
      pointerEvent,
      undefined,
      undefined,
      this.activePointers_
    );
    this.dispatchEvent(newEvent);

    // We emulate click events on left mouse button click, touch contact, and pen
    // contact. isMouseActionButton returns true in these cases (evt.button is set
    // to 0).
    // See http://www.w3.org/TR/pointerevents/#button-states
    // We only fire click, singleclick, and doubleclick if nobody has called
    // event.preventDefault().
    if (
      this.emulateClicks_ &&
      !newEvent.defaultPrevented &&
      !this.dragging_ &&
      this.isMouseActionButton_(pointerEvent)
    ) {
      this.emulateClick_(this.down_);
    }

    if (this.activePointers_.length === 0) {
      this.dragListenerKeys_.forEach(unlistenByKey);
      this.dragListenerKeys_.length = 0;
      this.dragging_ = false;
      this.down_ = null;
    }
  }

  /**
   * @param {PointerEvent} pointerEvent Pointer
   * event.
   * @return {boolean} If the left mouse button was pressed.
   * @private
   */
  isMouseActionButton_(pointerEvent) {
    return pointerEvent.button === 0;
  }

  /**
   * @param {PointerEvent} pointerEvent Pointer
   * event.
   * @private
   */
  handlePointerDown_(pointerEvent) {
    this.emulateClicks_ = this.activePointers_.length === 0;
    this.updateActivePointers_(pointerEvent);
    const newEvent = new MapBrowserEvent$1(
      MapBrowserEventType.POINTERDOWN,
      this.map_,
      pointerEvent,
      undefined,
      undefined,
      this.activePointers_
    );
    this.dispatchEvent(newEvent);

    // Store a copy of the down event
    this.down_ = /** @type {PointerEvent} */ ({});
    for (const property in pointerEvent) {
      const value = pointerEvent[property];
      this.down_[property] = typeof value === 'function' ? VOID : value;
    }

    if (this.dragListenerKeys_.length === 0) {
      const doc = this.map_.getOwnerDocument();
      this.dragListenerKeys_.push(
        listen(
          doc,
          MapBrowserEventType.POINTERMOVE,
          this.handlePointerMove_,
          this
        ),
        listen(doc, MapBrowserEventType.POINTERUP, this.handlePointerUp_, this),
        /* Note that the listener for `pointercancel is set up on
         * `pointerEventHandler_` and not `documentPointerEventHandler_` like
         * the `pointerup` and `pointermove` listeners.
         *
         * The reason for this is the following: `TouchSource.vacuumTouches_()`
         * issues `pointercancel` events, when there was no `touchend` for a
         * `touchstart`. Now, let's say a first `touchstart` is registered on
         * `pointerEventHandler_`. The `documentPointerEventHandler_` is set up.
         * But `documentPointerEventHandler_` doesn't know about the first
         * `touchstart`. If there is no `touchend` for the `touchstart`, we can
         * only receive a `touchcancel` from `pointerEventHandler_`, because it is
         * only registered there.
         */
        listen(
          this.element_,
          MapBrowserEventType.POINTERCANCEL,
          this.handlePointerUp_,
          this
        )
      );
      if (this.element_.getRootNode && this.element_.getRootNode() !== doc) {
        this.dragListenerKeys_.push(
          listen(
            this.element_.getRootNode(),
            MapBrowserEventType.POINTERUP,
            this.handlePointerUp_,
            this
          )
        );
      }
    }
  }

  /**
   * @param {PointerEvent} pointerEvent Pointer
   * event.
   * @private
   */
  handlePointerMove_(pointerEvent) {
    // Between pointerdown and pointerup, pointermove events are triggered.
    // To avoid a 'false' touchmove event to be dispatched, we test if the pointer
    // moved a significant distance.
    if (this.isMoving_(pointerEvent)) {
      this.updateActivePointers_(pointerEvent);
      this.dragging_ = true;
      const newEvent = new MapBrowserEvent$1(
        MapBrowserEventType.POINTERDRAG,
        this.map_,
        pointerEvent,
        this.dragging_,
        undefined,
        this.activePointers_
      );
      this.dispatchEvent(newEvent);
    }
  }

  /**
   * Wrap and relay a pointermove event.
   * @param {PointerEvent} pointerEvent Pointer
   * event.
   * @private
   */
  relayMoveEvent_(pointerEvent) {
    this.originalPointerMoveEvent_ = pointerEvent;
    const dragging = !!(this.down_ && this.isMoving_(pointerEvent));
    this.dispatchEvent(
      new MapBrowserEvent$1(
        MapBrowserEventType.POINTERMOVE,
        this.map_,
        pointerEvent,
        dragging
      )
    );
  }

  /**
   * Flexible handling of a `touch-action: none` css equivalent: because calling
   * `preventDefault()` on a `pointermove` event does not stop native page scrolling
   * and zooming, we also listen for `touchmove` and call `preventDefault()` on it
   * when an interaction (currently `DragPan` handles the event.
   * @param {TouchEvent} event Event.
   * @private
   */
  handleTouchMove_(event) {
    // Due to https://github.com/mpizenberg/elm-pep/issues/2, `this.originalPointerMoveEvent_`
    // may not be initialized yet when we get here on a platform without native pointer events.
    const originalEvent = this.originalPointerMoveEvent_;
    if (
      (!originalEvent || originalEvent.defaultPrevented) &&
      (typeof event.cancelable !== 'boolean' || event.cancelable === true)
    ) {
      event.preventDefault();
    }
  }

  /**
   * @param {PointerEvent} pointerEvent Pointer
   * event.
   * @return {boolean} Is moving.
   * @private
   */
  isMoving_(pointerEvent) {
    return (
      this.dragging_ ||
      Math.abs(pointerEvent.clientX - this.down_.clientX) >
        this.moveTolerance_ ||
      Math.abs(pointerEvent.clientY - this.down_.clientY) > this.moveTolerance_
    );
  }

  /**
   * Clean up.
   */
  disposeInternal() {
    if (this.relayedListenerKey_) {
      unlistenByKey(this.relayedListenerKey_);
      this.relayedListenerKey_ = null;
    }
    this.element_.removeEventListener(
      EventType.TOUCHMOVE,
      this.boundHandleTouchMove_
    );

    if (this.pointerdownListenerKey_) {
      unlistenByKey(this.pointerdownListenerKey_);
      this.pointerdownListenerKey_ = null;
    }

    this.dragListenerKeys_.forEach(unlistenByKey);
    this.dragListenerKeys_.length = 0;

    this.element_ = null;
    super.disposeInternal();
  }
}

var MapBrowserEventHandler$1 = MapBrowserEventHandler;

/**
 * @module ol/MapEventType
 */

/**
 * @enum {string}
 */
var MapEventType = {
  /**
   * Triggered after a map frame is rendered.
   * @event module:ol/MapEvent~MapEvent#postrender
   * @api
   */
  POSTRENDER: 'postrender',

  /**
   * Triggered when the map starts moving.
   * @event module:ol/MapEvent~MapEvent#movestart
   * @api
   */
  MOVESTART: 'movestart',

  /**
   * Triggered after the map is moved.
   * @event module:ol/MapEvent~MapEvent#moveend
   * @api
   */
  MOVEEND: 'moveend',

  /**
   * Triggered when loading of additional map data (tiles, images, features) starts.
   * @event module:ol/MapEvent~MapEvent#loadstart
   * @api
   */
  LOADSTART: 'loadstart',

  /**
   * Triggered when loading of additional map data has completed.
   * @event module:ol/MapEvent~MapEvent#loadend
   * @api
   */
  LOADEND: 'loadend',
};

/***
 * @typedef {'postrender'|'movestart'|'moveend'|'loadstart'|'loadend'} Types
 */

/**
 * @module ol/MapProperty
 */

/**
 * @enum {string}
 */
var MapProperty = {
  LAYERGROUP: 'layergroup',
  SIZE: 'size',
  TARGET: 'target',
  VIEW: 'view',
};

/**
 * @module ol/structs/PriorityQueue
 */

/**
 * @type {number}
 */
const DROP = Infinity;

/**
 * @classdesc
 * Priority queue.
 *
 * The implementation is inspired from the Closure Library's Heap class and
 * Python's heapq module.
 *
 * See https://github.com/google/closure-library/blob/master/closure/goog/structs/heap.js
 * and https://hg.python.org/cpython/file/2.7/Lib/heapq.py.
 *
 * @template T
 */
class PriorityQueue {
  /**
   * @param {function(T): number} priorityFunction Priority function.
   * @param {function(T): string} keyFunction Key function.
   */
  constructor(priorityFunction, keyFunction) {
    /**
     * @type {function(T): number}
     * @private
     */
    this.priorityFunction_ = priorityFunction;

    /**
     * @type {function(T): string}
     * @private
     */
    this.keyFunction_ = keyFunction;

    /**
     * @type {Array<T>}
     * @private
     */
    this.elements_ = [];

    /**
     * @type {Array<number>}
     * @private
     */
    this.priorities_ = [];

    /**
     * @type {!Object<string, boolean>}
     * @private
     */
    this.queuedElements_ = {};
  }

  /**
   * FIXME empty description for jsdoc
   */
  clear() {
    this.elements_.length = 0;
    this.priorities_.length = 0;
    clear(this.queuedElements_);
  }

  /**
   * Remove and return the highest-priority element. O(log N).
   * @return {T} Element.
   */
  dequeue() {
    const elements = this.elements_;
    const priorities = this.priorities_;
    const element = elements[0];
    if (elements.length == 1) {
      elements.length = 0;
      priorities.length = 0;
    } else {
      elements[0] = elements.pop();
      priorities[0] = priorities.pop();
      this.siftUp_(0);
    }
    const elementKey = this.keyFunction_(element);
    delete this.queuedElements_[elementKey];
    return element;
  }

  /**
   * Enqueue an element. O(log N).
   * @param {T} element Element.
   * @return {boolean} The element was added to the queue.
   */
  enqueue(element) {
    assert(!(this.keyFunction_(element) in this.queuedElements_), 31); // Tried to enqueue an `element` that was already added to the queue
    const priority = this.priorityFunction_(element);
    if (priority != DROP) {
      this.elements_.push(element);
      this.priorities_.push(priority);
      this.queuedElements_[this.keyFunction_(element)] = true;
      this.siftDown_(0, this.elements_.length - 1);
      return true;
    }
    return false;
  }

  /**
   * @return {number} Count.
   */
  getCount() {
    return this.elements_.length;
  }

  /**
   * Gets the index of the left child of the node at the given index.
   * @param {number} index The index of the node to get the left child for.
   * @return {number} The index of the left child.
   * @private
   */
  getLeftChildIndex_(index) {
    return index * 2 + 1;
  }

  /**
   * Gets the index of the right child of the node at the given index.
   * @param {number} index The index of the node to get the right child for.
   * @return {number} The index of the right child.
   * @private
   */
  getRightChildIndex_(index) {
    return index * 2 + 2;
  }

  /**
   * Gets the index of the parent of the node at the given index.
   * @param {number} index The index of the node to get the parent for.
   * @return {number} The index of the parent.
   * @private
   */
  getParentIndex_(index) {
    return (index - 1) >> 1;
  }

  /**
   * Make this a heap. O(N).
   * @private
   */
  heapify_() {
    let i;
    for (i = (this.elements_.length >> 1) - 1; i >= 0; i--) {
      this.siftUp_(i);
    }
  }

  /**
   * @return {boolean} Is empty.
   */
  isEmpty() {
    return this.elements_.length === 0;
  }

  /**
   * @param {string} key Key.
   * @return {boolean} Is key queued.
   */
  isKeyQueued(key) {
    return key in this.queuedElements_;
  }

  /**
   * @param {T} element Element.
   * @return {boolean} Is queued.
   */
  isQueued(element) {
    return this.isKeyQueued(this.keyFunction_(element));
  }

  /**
   * @param {number} index The index of the node to move down.
   * @private
   */
  siftUp_(index) {
    const elements = this.elements_;
    const priorities = this.priorities_;
    const count = elements.length;
    const element = elements[index];
    const priority = priorities[index];
    const startIndex = index;

    while (index < count >> 1) {
      const lIndex = this.getLeftChildIndex_(index);
      const rIndex = this.getRightChildIndex_(index);

      const smallerChildIndex =
        rIndex < count && priorities[rIndex] < priorities[lIndex]
          ? rIndex
          : lIndex;

      elements[index] = elements[smallerChildIndex];
      priorities[index] = priorities[smallerChildIndex];
      index = smallerChildIndex;
    }

    elements[index] = element;
    priorities[index] = priority;
    this.siftDown_(startIndex, index);
  }

  /**
   * @param {number} startIndex The index of the root.
   * @param {number} index The index of the node to move up.
   * @private
   */
  siftDown_(startIndex, index) {
    const elements = this.elements_;
    const priorities = this.priorities_;
    const element = elements[index];
    const priority = priorities[index];

    while (index > startIndex) {
      const parentIndex = this.getParentIndex_(index);
      if (priorities[parentIndex] > priority) {
        elements[index] = elements[parentIndex];
        priorities[index] = priorities[parentIndex];
        index = parentIndex;
      } else {
        break;
      }
    }
    elements[index] = element;
    priorities[index] = priority;
  }

  /**
   * FIXME empty description for jsdoc
   */
  reprioritize() {
    const priorityFunction = this.priorityFunction_;
    const elements = this.elements_;
    const priorities = this.priorities_;
    let index = 0;
    const n = elements.length;
    let element, i, priority;
    for (i = 0; i < n; ++i) {
      element = elements[i];
      priority = priorityFunction(element);
      if (priority == DROP) {
        delete this.queuedElements_[this.keyFunction_(element)];
      } else {
        priorities[index] = priority;
        elements[index++] = element;
      }
    }
    elements.length = index;
    priorities.length = index;
    this.heapify_();
  }
}

var PriorityQueue$1 = PriorityQueue;

/**
 * @module ol/TileState
 */

/**
 * @enum {number}
 */
var TileState = {
  IDLE: 0,
  LOADING: 1,
  LOADED: 2,
  /**
   * Indicates that tile loading failed
   * @type {number}
   */
  ERROR: 3,
  EMPTY: 4,
};

/**
 * @module ol/TileQueue
 */

/**
 * @typedef {function(import("./Tile.js").default, string, import("./coordinate.js").Coordinate, number): number} PriorityFunction
 */

class TileQueue extends PriorityQueue$1 {
  /**
   * @param {PriorityFunction} tilePriorityFunction Tile priority function.
   * @param {function(): ?} tileChangeCallback Function called on each tile change event.
   */
  constructor(tilePriorityFunction, tileChangeCallback) {
    super(
      /**
       * @param {Array} element Element.
       * @return {number} Priority.
       */
      function (element) {
        return tilePriorityFunction.apply(null, element);
      },
      /**
       * @param {Array} element Element.
       * @return {string} Key.
       */
      function (element) {
        return /** @type {import("./Tile.js").default} */ (element[0]).getKey();
      }
    );

    /** @private */
    this.boundHandleTileChange_ = this.handleTileChange.bind(this);

    /**
     * @private
     * @type {function(): ?}
     */
    this.tileChangeCallback_ = tileChangeCallback;

    /**
     * @private
     * @type {number}
     */
    this.tilesLoading_ = 0;

    /**
     * @private
     * @type {!Object<string,boolean>}
     */
    this.tilesLoadingKeys_ = {};
  }

  /**
   * @param {Array} element Element.
   * @return {boolean} The element was added to the queue.
   */
  enqueue(element) {
    const added = super.enqueue(element);
    if (added) {
      const tile = element[0];
      tile.addEventListener(EventType.CHANGE, this.boundHandleTileChange_);
    }
    return added;
  }

  /**
   * @return {number} Number of tiles loading.
   */
  getTilesLoading() {
    return this.tilesLoading_;
  }

  /**
   * @param {import("./events/Event.js").default} event Event.
   * @protected
   */
  handleTileChange(event) {
    const tile = /** @type {import("./Tile.js").default} */ (event.target);
    const state = tile.getState();
    if (
      state === TileState.LOADED ||
      state === TileState.ERROR ||
      state === TileState.EMPTY
    ) {
      if (state !== TileState.ERROR) {
        tile.removeEventListener(EventType.CHANGE, this.boundHandleTileChange_);
      }
      const tileKey = tile.getKey();
      if (tileKey in this.tilesLoadingKeys_) {
        delete this.tilesLoadingKeys_[tileKey];
        --this.tilesLoading_;
      }
      this.tileChangeCallback_();
    }
  }

  /**
   * @param {number} maxTotalLoading Maximum number tiles to load simultaneously.
   * @param {number} maxNewLoads Maximum number of new tiles to load.
   */
  loadMoreTiles(maxTotalLoading, maxNewLoads) {
    let newLoads = 0;
    let state, tile, tileKey;
    while (
      this.tilesLoading_ < maxTotalLoading &&
      newLoads < maxNewLoads &&
      this.getCount() > 0
    ) {
      tile = /** @type {import("./Tile.js").default} */ (this.dequeue()[0]);
      tileKey = tile.getKey();
      state = tile.getState();
      if (state === TileState.IDLE && !(tileKey in this.tilesLoadingKeys_)) {
        this.tilesLoadingKeys_[tileKey] = true;
        ++this.tilesLoading_;
        ++newLoads;
        tile.load();
      }
    }
  }
}

var TileQueue$1 = TileQueue;

/**
 * @param {import('./Map.js').FrameState} frameState Frame state.
 * @param {import("./Tile.js").default} tile Tile.
 * @param {string} tileSourceKey Tile source key.
 * @param {import("./coordinate.js").Coordinate} tileCenter Tile center.
 * @param {number} tileResolution Tile resolution.
 * @return {number} Tile priority.
 */
function getTilePriority(
  frameState,
  tile,
  tileSourceKey,
  tileCenter,
  tileResolution
) {
  // Filter out tiles at higher zoom levels than the current zoom level, or that
  // are outside the visible extent.
  if (!frameState || !(tileSourceKey in frameState.wantedTiles)) {
    return DROP;
  }
  if (!frameState.wantedTiles[tileSourceKey][tile.getKey()]) {
    return DROP;
  }
  // Prioritize the highest zoom level tiles closest to the focus.
  // Tiles at higher zoom levels are prioritized using Math.log(tileResolution).
  // Within a zoom level, tiles are prioritized by the distance in pixels between
  // the center of the tile and the center of the viewport.  The factor of 65536
  // means that the prioritization should behave as desired for tiles up to
  // 65536 * Math.log(2) = 45426 pixels from the focus.
  const center = frameState.viewState.center;
  const deltaX = tileCenter[0] - center[0];
  const deltaY = tileCenter[1] - center[1];
  return (
    65536 * Math.log(tileResolution) +
    Math.sqrt(deltaX * deltaX + deltaY * deltaY) / tileResolution
  );
}

/**
 * @module ol/ViewHint
 */

/**
 * @enum {number}
 */
var ViewHint = {
  ANIMATING: 0,
  INTERACTING: 1,
};

/**
 * @module ol/ViewProperty
 */

/**
 * @enum {string}
 */
var ViewProperty = {
  CENTER: 'center',
  RESOLUTION: 'resolution',
  ROTATION: 'rotation',
};

/**
 * @module ol/tilegrid/common
 */

/**
 * Default maximum zoom for default tile grids.
 * @type {number}
 */
const DEFAULT_MAX_ZOOM = 42;

/**
 * Default tile size.
 * @type {number}
 */
const DEFAULT_TILE_SIZE = 256;

/**
 * @module ol/proj/Units
 */

/**
 * @typedef {Object} MetersPerUnitLookup
 * @property {number} radians Radians
 * @property {number} degrees Degrees
 * @property {number} ft  Feet
 * @property {number} m Meters
 * @property {number} us-ft US feet
 */

/**
 * Meters per unit lookup table.
 * @const
 * @type {MetersPerUnitLookup}
 * @api
 */
const METERS_PER_UNIT$1 = {
  // use the radius of the Normal sphere
  'radians': 6370997 / (2 * Math.PI),
  'degrees': (2 * Math.PI * 6370997) / 360,
  'ft': 0.3048,
  'm': 1,
  'us-ft': 1200 / 3937,
};

/**
 * @module ol/proj/Projection
 */

/**
 * @typedef {Object} Options
 * @property {string} code The SRS identifier code, e.g. `EPSG:4326`.
 * @property {import("./Units.js").Units} [units] Units. Required unless a
 * proj4 projection is defined for `code`.
 * @property {import("../extent.js").Extent} [extent] The validity extent for the SRS.
 * @property {string} [axisOrientation='enu'] The axis orientation as specified in Proj4.
 * @property {boolean} [global=false] Whether the projection is valid for the whole globe.
 * @property {number} [metersPerUnit] The meters per unit for the SRS.
 * If not provided, the `units` are used to get the meters per unit from the {@link METERS_PER_UNIT}
 * lookup table.
 * @property {import("../extent.js").Extent} [worldExtent] The world extent for the SRS.
 * @property {function(number, import("../coordinate.js").Coordinate):number} [getPointResolution]
 * Function to determine resolution at a point. The function is called with a
 * `number` view resolution and a {@link module:ol/coordinate~Coordinate} as arguments, and returns
 * the `number` resolution in projection units at the passed coordinate. If this is `undefined`,
 * the default {@link module:ol/proj.getPointResolution} function will be used.
 */

/**
 * @classdesc
 * Projection definition class. One of these is created for each projection
 * supported in the application and stored in the {@link module:ol/proj} namespace.
 * You can use these in applications, but this is not required, as API params
 * and options use {@link module:ol/proj~ProjectionLike} which means the simple string
 * code will suffice.
 *
 * You can use {@link module:ol/proj.get} to retrieve the object for a particular
 * projection.
 *
 * The library includes definitions for `EPSG:4326` and `EPSG:3857`, together
 * with the following aliases:
 * * `EPSG:4326`: CRS:84, urn:ogc:def:crs:EPSG:6.6:4326,
 *     urn:ogc:def:crs:OGC:1.3:CRS84, urn:ogc:def:crs:OGC:2:84,
 *     http://www.opengis.net/gml/srs/epsg.xml#4326,
 *     urn:x-ogc:def:crs:EPSG:4326
 * * `EPSG:3857`: EPSG:102100, EPSG:102113, EPSG:900913,
 *     urn:ogc:def:crs:EPSG:6.18:3:3857,
 *     http://www.opengis.net/gml/srs/epsg.xml#3857
 *
 * If you use [proj4js](https://github.com/proj4js/proj4js), aliases can
 * be added using `proj4.defs()`. After all required projection definitions are
 * added, call the {@link module:ol/proj/proj4.register} function.
 *
 * @api
 */
class Projection {
  /**
   * @param {Options} options Projection options.
   */
  constructor(options) {
    /**
     * @private
     * @type {string}
     */
    this.code_ = options.code;

    /**
     * Units of projected coordinates. When set to `TILE_PIXELS`, a
     * `this.extent_` and `this.worldExtent_` must be configured properly for each
     * tile.
     * @private
     * @type {import("./Units.js").Units}
     */
    this.units_ = /** @type {import("./Units.js").Units} */ (options.units);

    /**
     * Validity extent of the projection in projected coordinates. For projections
     * with `TILE_PIXELS` units, this is the extent of the tile in
     * tile pixel space.
     * @private
     * @type {import("../extent.js").Extent}
     */
    this.extent_ = options.extent !== undefined ? options.extent : null;

    /**
     * Extent of the world in EPSG:4326. For projections with
     * `TILE_PIXELS` units, this is the extent of the tile in
     * projected coordinate space.
     * @private
     * @type {import("../extent.js").Extent}
     */
    this.worldExtent_ =
      options.worldExtent !== undefined ? options.worldExtent : null;

    /**
     * @private
     * @type {string}
     */
    this.axisOrientation_ =
      options.axisOrientation !== undefined ? options.axisOrientation : 'enu';

    /**
     * @private
     * @type {boolean}
     */
    this.global_ = options.global !== undefined ? options.global : false;

    /**
     * @private
     * @type {boolean}
     */
    this.canWrapX_ = !!(this.global_ && this.extent_);

    /**
     * @private
     * @type {function(number, import("../coordinate.js").Coordinate):number|undefined}
     */
    this.getPointResolutionFunc_ = options.getPointResolution;

    /**
     * @private
     * @type {import("../tilegrid/TileGrid.js").default}
     */
    this.defaultTileGrid_ = null;

    /**
     * @private
     * @type {number|undefined}
     */
    this.metersPerUnit_ = options.metersPerUnit;
  }

  /**
   * @return {boolean} The projection is suitable for wrapping the x-axis
   */
  canWrapX() {
    return this.canWrapX_;
  }

  /**
   * Get the code for this projection, e.g. 'EPSG:4326'.
   * @return {string} Code.
   * @api
   */
  getCode() {
    return this.code_;
  }

  /**
   * Get the validity extent for this projection.
   * @return {import("../extent.js").Extent} Extent.
   * @api
   */
  getExtent() {
    return this.extent_;
  }

  /**
   * Get the units of this projection.
   * @return {import("./Units.js").Units} Units.
   * @api
   */
  getUnits() {
    return this.units_;
  }

  /**
   * Get the amount of meters per unit of this projection.  If the projection is
   * not configured with `metersPerUnit` or a units identifier, the return is
   * `undefined`.
   * @return {number|undefined} Meters.
   * @api
   */
  getMetersPerUnit() {
    return this.metersPerUnit_ || METERS_PER_UNIT$1[this.units_];
  }

  /**
   * Get the world extent for this projection.
   * @return {import("../extent.js").Extent} Extent.
   * @api
   */
  getWorldExtent() {
    return this.worldExtent_;
  }

  /**
   * Get the axis orientation of this projection.
   * Example values are:
   * enu - the default easting, northing, elevation.
   * neu - northing, easting, up - useful for "lat/long" geographic coordinates,
   *     or south orientated transverse mercator.
   * wnu - westing, northing, up - some planetary coordinate systems have
   *     "west positive" coordinate systems
   * @return {string} Axis orientation.
   * @api
   */
  getAxisOrientation() {
    return this.axisOrientation_;
  }

  /**
   * Is this projection a global projection which spans the whole world?
   * @return {boolean} Whether the projection is global.
   * @api
   */
  isGlobal() {
    return this.global_;
  }

  /**
   * Set if the projection is a global projection which spans the whole world
   * @param {boolean} global Whether the projection is global.
   * @api
   */
  setGlobal(global) {
    this.global_ = global;
    this.canWrapX_ = !!(global && this.extent_);
  }

  /**
   * @return {import("../tilegrid/TileGrid.js").default} The default tile grid.
   */
  getDefaultTileGrid() {
    return this.defaultTileGrid_;
  }

  /**
   * @param {import("../tilegrid/TileGrid.js").default} tileGrid The default tile grid.
   */
  setDefaultTileGrid(tileGrid) {
    this.defaultTileGrid_ = tileGrid;
  }

  /**
   * Set the validity extent for this projection.
   * @param {import("../extent.js").Extent} extent Extent.
   * @api
   */
  setExtent(extent) {
    this.extent_ = extent;
    this.canWrapX_ = !!(this.global_ && extent);
  }

  /**
   * Set the world extent for this projection.
   * @param {import("../extent.js").Extent} worldExtent World extent
   *     [minlon, minlat, maxlon, maxlat].
   * @api
   */
  setWorldExtent(worldExtent) {
    this.worldExtent_ = worldExtent;
  }

  /**
   * Set the getPointResolution function (see {@link module:ol/proj.getPointResolution}
   * for this projection.
   * @param {function(number, import("../coordinate.js").Coordinate):number} func Function
   * @api
   */
  setGetPointResolution(func) {
    this.getPointResolutionFunc_ = func;
  }

  /**
   * Get the custom point resolution function for this projection (if set).
   * @return {function(number, import("../coordinate.js").Coordinate):number|undefined} The custom point
   * resolution function (if set).
   */
  getPointResolutionFunc() {
    return this.getPointResolutionFunc_;
  }
}

var Projection$1 = Projection;

/**
 * @module ol/proj/epsg3857
 */

/**
 * Radius of WGS84 sphere
 *
 * @const
 * @type {number}
 */
const RADIUS$1 = 6378137;

/**
 * @const
 * @type {number}
 */
const HALF_SIZE = Math.PI * RADIUS$1;

/**
 * @const
 * @type {import("../extent.js").Extent}
 */
const EXTENT$1 = [-HALF_SIZE, -HALF_SIZE, HALF_SIZE, HALF_SIZE];

/**
 * @const
 * @type {import("../extent.js").Extent}
 */
const WORLD_EXTENT = [-180, -85, 180, 85];

/**
 * Maximum safe value in y direction
 * @const
 * @type {number}
 */
const MAX_SAFE_Y = RADIUS$1 * Math.log(Math.tan(Math.PI / 2));

/**
 * @classdesc
 * Projection object for web/spherical Mercator (EPSG:3857).
 */
class EPSG3857Projection extends Projection$1 {
  /**
   * @param {string} code Code.
   */
  constructor(code) {
    super({
      code: code,
      units: 'm',
      extent: EXTENT$1,
      global: true,
      worldExtent: WORLD_EXTENT,
      getPointResolution: function (resolution, point) {
        return resolution / Math.cosh(point[1] / RADIUS$1);
      },
    });
  }
}

/**
 * Projections equal to EPSG:3857.
 *
 * @const
 * @type {Array<import("./Projection.js").default>}
 */
const PROJECTIONS$1 = [
  new EPSG3857Projection('EPSG:3857'),
  new EPSG3857Projection('EPSG:102100'),
  new EPSG3857Projection('EPSG:102113'),
  new EPSG3857Projection('EPSG:900913'),
  new EPSG3857Projection('http://www.opengis.net/def/crs/EPSG/0/3857'),
  new EPSG3857Projection('http://www.opengis.net/gml/srs/epsg.xml#3857'),
];

/**
 * Transformation from EPSG:4326 to EPSG:3857.
 *
 * @param {Array<number>} input Input array of coordinate values.
 * @param {Array<number>} [output] Output array of coordinate values.
 * @param {number} [dimension] Dimension (default is `2`).
 * @return {Array<number>} Output array of coordinate values.
 */
function fromEPSG4326(input, output, dimension) {
  const length = input.length;
  dimension = dimension > 1 ? dimension : 2;
  if (output === undefined) {
    if (dimension > 2) {
      // preserve values beyond second dimension
      output = input.slice();
    } else {
      output = new Array(length);
    }
  }
  for (let i = 0; i < length; i += dimension) {
    output[i] = (HALF_SIZE * input[i]) / 180;
    let y = RADIUS$1 * Math.log(Math.tan((Math.PI * (+input[i + 1] + 90)) / 360));
    if (y > MAX_SAFE_Y) {
      y = MAX_SAFE_Y;
    } else if (y < -MAX_SAFE_Y) {
      y = -MAX_SAFE_Y;
    }
    output[i + 1] = y;
  }
  return output;
}

/**
 * Transformation from EPSG:3857 to EPSG:4326.
 *
 * @param {Array<number>} input Input array of coordinate values.
 * @param {Array<number>} [output] Output array of coordinate values.
 * @param {number} [dimension] Dimension (default is `2`).
 * @return {Array<number>} Output array of coordinate values.
 */
function toEPSG4326(input, output, dimension) {
  const length = input.length;
  dimension = dimension > 1 ? dimension : 2;
  if (output === undefined) {
    if (dimension > 2) {
      // preserve values beyond second dimension
      output = input.slice();
    } else {
      output = new Array(length);
    }
  }
  for (let i = 0; i < length; i += dimension) {
    output[i] = (180 * input[i]) / HALF_SIZE;
    output[i + 1] =
      (360 * Math.atan(Math.exp(input[i + 1] / RADIUS$1))) / Math.PI - 90;
  }
  return output;
}

/**
 * @module ol/proj/epsg4326
 */

/**
 * Semi-major radius of the WGS84 ellipsoid.
 *
 * @const
 * @type {number}
 */
const RADIUS = 6378137;

/**
 * Extent of the EPSG:4326 projection which is the whole world.
 *
 * @const
 * @type {import("../extent.js").Extent}
 */
const EXTENT = [-180, -90, 180, 90];

/**
 * @const
 * @type {number}
 */
const METERS_PER_UNIT = (Math.PI * RADIUS) / 180;

/**
 * @classdesc
 * Projection object for WGS84 geographic coordinates (EPSG:4326).
 *
 * Note that OpenLayers does not strictly comply with the EPSG definition.
 * The EPSG registry defines 4326 as a CRS for Latitude,Longitude (y,x).
 * OpenLayers treats EPSG:4326 as a pseudo-projection, with x,y coordinates.
 */
class EPSG4326Projection extends Projection$1 {
  /**
   * @param {string} code Code.
   * @param {string} [axisOrientation] Axis orientation.
   */
  constructor(code, axisOrientation) {
    super({
      code: code,
      units: 'degrees',
      extent: EXTENT,
      axisOrientation: axisOrientation,
      global: true,
      metersPerUnit: METERS_PER_UNIT,
      worldExtent: EXTENT,
    });
  }
}

/**
 * Projections equal to EPSG:4326.
 *
 * @const
 * @type {Array<import("./Projection.js").default>}
 */
const PROJECTIONS = [
  new EPSG4326Projection('CRS:84'),
  new EPSG4326Projection('EPSG:4326', 'neu'),
  new EPSG4326Projection('urn:ogc:def:crs:OGC:1.3:CRS84'),
  new EPSG4326Projection('urn:ogc:def:crs:OGC:2:84'),
  new EPSG4326Projection('http://www.opengis.net/def/crs/OGC/1.3/CRS84'),
  new EPSG4326Projection('http://www.opengis.net/gml/srs/epsg.xml#4326', 'neu'),
  new EPSG4326Projection('http://www.opengis.net/def/crs/EPSG/0/4326', 'neu'),
];

/**
 * @module ol/proj/projections
 */

/**
 * @type {Object<string, import("./Projection.js").default>}
 */
let cache = {};

/**
 * Get a cached projection by code.
 * @param {string} code The code for the projection.
 * @return {import("./Projection.js").default} The projection (if cached).
 */
function get$2(code) {
  return (
    cache[code] ||
    cache[code.replace(/urn:(x-)?ogc:def:crs:EPSG:(.*:)?(\w+)$/, 'EPSG:$3')] ||
    null
  );
}

/**
 * Add a projection to the cache.
 * @param {string} code The projection code.
 * @param {import("./Projection.js").default} projection The projection to cache.
 */
function add$1(code, projection) {
  cache[code] = projection;
}

/**
 * @module ol/proj/transforms
 */

/**
 * @private
 * @type {!Object<string, Object<string, import("../proj.js").TransformFunction>>}
 */
let transforms = {};

/**
 * Registers a conversion function to convert coordinates from the source
 * projection to the destination projection.
 *
 * @param {import("./Projection.js").default} source Source.
 * @param {import("./Projection.js").default} destination Destination.
 * @param {import("../proj.js").TransformFunction} transformFn Transform.
 */
function add(source, destination, transformFn) {
  const sourceCode = source.getCode();
  const destinationCode = destination.getCode();
  if (!(sourceCode in transforms)) {
    transforms[sourceCode] = {};
  }
  transforms[sourceCode][destinationCode] = transformFn;
}

/**
 * Get a transform given a source code and a destination code.
 * @param {string} sourceCode The code for the source projection.
 * @param {string} destinationCode The code for the destination projection.
 * @return {import("../proj.js").TransformFunction|undefined} The transform function (if found).
 */
function get$1(sourceCode, destinationCode) {
  let transform;
  if (sourceCode in transforms && destinationCode in transforms[sourceCode]) {
    transform = transforms[sourceCode][destinationCode];
  }
  return transform;
}

/**
 * @module ol/sphere
 */

/**
 * Object literal with options for the {@link getLength} or {@link getArea}
 * functions.
 * @typedef {Object} SphereMetricOptions
 * @property {import("./proj.js").ProjectionLike} [projection='EPSG:3857']
 * Projection of the  geometry.  By default, the geometry is assumed to be in
 * Web Mercator.
 * @property {number} [radius=6371008.8] Sphere radius.  By default, the
 * [mean Earth radius](https://en.wikipedia.org/wiki/Earth_radius#Mean_radius)
 * for the WGS84 ellipsoid is used.
 */

/**
 * The mean Earth radius (1/3 * (2a + b)) for the WGS84 ellipsoid.
 * https://en.wikipedia.org/wiki/Earth_radius#Mean_radius
 * @type {number}
 */
const DEFAULT_RADIUS = 6371008.8;

/**
 * Get the great circle distance (in meters) between two geographic coordinates.
 * @param {Array} c1 Starting coordinate.
 * @param {Array} c2 Ending coordinate.
 * @param {number} [radius] The sphere radius to use.  Defaults to the Earth's
 *     mean radius using the WGS84 ellipsoid.
 * @return {number} The great circle distance between the points (in meters).
 * @api
 */
function getDistance(c1, c2, radius) {
  radius = radius || DEFAULT_RADIUS;
  const lat1 = toRadians(c1[1]);
  const lat2 = toRadians(c2[1]);
  const deltaLatBy2 = (lat2 - lat1) / 2;
  const deltaLonBy2 = toRadians(c2[0] - c1[0]) / 2;
  const a =
    Math.sin(deltaLatBy2) * Math.sin(deltaLatBy2) +
    Math.sin(deltaLonBy2) *
      Math.sin(deltaLonBy2) *
      Math.cos(lat1) *
      Math.cos(lat2);
  return 2 * radius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * @module ol/console
 */

/**
 * @typedef {'info'|'warn'|'error'|'none'} Level
 */

/**
 * @type {Object<Level, number>}
 */
const levels = {
  info: 1,
  warn: 2,
  error: 3,
  none: 4,
};

/**
 * @type {number}
 */
let level = levels.info;

function warn(...args) {
  if (level > levels.warn) {
    return;
  }
  console.warn(...args); // eslint-disable-line no-console
}

/**
 * @module ol/proj
 */

let showCoordinateWarning = true;

/**
 * @param {boolean} [disable = true] Disable console info about `useGeographic()`
 */
function disableCoordinateWarning(disable) {
  const hide = disable === undefined ? true : disable;
  showCoordinateWarning = !hide;
}

/**
 * @param {Array<number>} input Input coordinate array.
 * @param {Array<number>} [output] Output array of coordinate values.
 * @return {Array<number>} Output coordinate array (new array, same coordinate
 *     values).
 */
function cloneTransform(input, output) {
  if (output !== undefined) {
    for (let i = 0, ii = input.length; i < ii; ++i) {
      output[i] = input[i];
    }
    output = output;
  } else {
    output = input.slice();
  }
  return output;
}

/**
 * @param {Array<number>} input Input coordinate array.
 * @param {Array<number>} [output] Output array of coordinate values.
 * @return {Array<number>} Input coordinate array (same array as input).
 */
function identityTransform(input, output) {
  if (output !== undefined && input !== output) {
    for (let i = 0, ii = input.length; i < ii; ++i) {
      output[i] = input[i];
    }
    input = output;
  }
  return input;
}

/**
 * Add a Projection object to the list of supported projections that can be
 * looked up by their code.
 *
 * @param {Projection} projection Projection instance.
 * @api
 */
function addProjection(projection) {
  add$1(projection.getCode(), projection);
  add(projection, projection, cloneTransform);
}

/**
 * @param {Array<Projection>} projections Projections.
 */
function addProjections(projections) {
  projections.forEach(addProjection);
}

/**
 * Fetches a Projection object for the code specified.
 *
 * @param {ProjectionLike} projectionLike Either a code string which is
 *     a combination of authority and identifier such as "EPSG:4326", or an
 *     existing projection object, or undefined.
 * @return {Projection|null} Projection object, or null if not in list.
 * @api
 */
function get(projectionLike) {
  return typeof projectionLike === 'string'
    ? get$2(/** @type {string} */ (projectionLike))
    : /** @type {Projection} */ (projectionLike) || null;
}

/**
 * Get the resolution of the point in degrees or distance units.
 * For projections with degrees as the unit this will simply return the
 * provided resolution. For other projections the point resolution is
 * by default estimated by transforming the `point` pixel to EPSG:4326,
 * measuring its width and height on the normal sphere,
 * and taking the average of the width and height.
 * A custom function can be provided for a specific projection, either
 * by setting the `getPointResolution` option in the
 * {@link module:ol/proj/Projection~Projection} constructor or by using
 * {@link module:ol/proj/Projection~Projection#setGetPointResolution} to change an existing
 * projection object.
 * @param {ProjectionLike} projection The projection.
 * @param {number} resolution Nominal resolution in projection units.
 * @param {import("./coordinate.js").Coordinate} point Point to find adjusted resolution at.
 * @param {import("./proj/Units.js").Units} [units] Units to get the point resolution in.
 * Default is the projection's units.
 * @return {number} Point resolution.
 * @api
 */
function getPointResolution(projection, resolution, point, units) {
  projection = get(projection);
  let pointResolution;
  const getter = projection.getPointResolutionFunc();
  if (getter) {
    pointResolution = getter(resolution, point);
    if (units && units !== projection.getUnits()) {
      const metersPerUnit = projection.getMetersPerUnit();
      if (metersPerUnit) {
        pointResolution =
          (pointResolution * metersPerUnit) / METERS_PER_UNIT$1[units];
      }
    }
  } else {
    const projUnits = projection.getUnits();
    if ((projUnits == 'degrees' && !units) || units == 'degrees') {
      pointResolution = resolution;
    } else {
      // Estimate point resolution by transforming the center pixel to EPSG:4326,
      // measuring its width and height on the normal sphere, and taking the
      // average of the width and height.
      const toEPSG4326 = getTransformFromProjections(
        projection,
        get('EPSG:4326')
      );
      if (toEPSG4326 === identityTransform && projUnits !== 'degrees') {
        // no transform is available
        pointResolution = resolution * projection.getMetersPerUnit();
      } else {
        let vertices = [
          point[0] - resolution / 2,
          point[1],
          point[0] + resolution / 2,
          point[1],
          point[0],
          point[1] - resolution / 2,
          point[0],
          point[1] + resolution / 2,
        ];
        vertices = toEPSG4326(vertices, vertices, 2);
        const width = getDistance(vertices.slice(0, 2), vertices.slice(2, 4));
        const height = getDistance(vertices.slice(4, 6), vertices.slice(6, 8));
        pointResolution = (width + height) / 2;
      }
      const metersPerUnit = units
        ? METERS_PER_UNIT$1[units]
        : projection.getMetersPerUnit();
      if (metersPerUnit !== undefined) {
        pointResolution /= metersPerUnit;
      }
    }
  }
  return pointResolution;
}

/**
 * Registers transformation functions that don't alter coordinates. Those allow
 * to transform between projections with equal meaning.
 *
 * @param {Array<Projection>} projections Projections.
 * @api
 */
function addEquivalentProjections(projections) {
  addProjections(projections);
  projections.forEach(function (source) {
    projections.forEach(function (destination) {
      if (source !== destination) {
        add(source, destination, cloneTransform);
      }
    });
  });
}

/**
 * Registers transformation functions to convert coordinates in any projection
 * in projection1 to any projection in projection2.
 *
 * @param {Array<Projection>} projections1 Projections with equal
 *     meaning.
 * @param {Array<Projection>} projections2 Projections with equal
 *     meaning.
 * @param {TransformFunction} forwardTransform Transformation from any
 *   projection in projection1 to any projection in projection2.
 * @param {TransformFunction} inverseTransform Transform from any projection
 *   in projection2 to any projection in projection1..
 */
function addEquivalentTransforms(
  projections1,
  projections2,
  forwardTransform,
  inverseTransform
) {
  projections1.forEach(function (projection1) {
    projections2.forEach(function (projection2) {
      add(projection1, projection2, forwardTransform);
      add(projection2, projection1, inverseTransform);
    });
  });
}

/**
 * @param {Projection|string|undefined} projection Projection.
 * @param {string} defaultCode Default code.
 * @return {Projection} Projection.
 */
function createProjection(projection, defaultCode) {
  if (!projection) {
    return get(defaultCode);
  } else if (typeof projection === 'string') {
    return get(projection);
  }
  return /** @type {Projection} */ (projection);
}

/**
 * Checks if two projections are the same, that is every coordinate in one
 * projection does represent the same geographic point as the same coordinate in
 * the other projection.
 *
 * @param {Projection} projection1 Projection 1.
 * @param {Projection} projection2 Projection 2.
 * @return {boolean} Equivalent.
 * @api
 */
function equivalent(projection1, projection2) {
  if (projection1 === projection2) {
    return true;
  }
  const equalUnits = projection1.getUnits() === projection2.getUnits();
  if (projection1.getCode() === projection2.getCode()) {
    return equalUnits;
  }
  const transformFunc = getTransformFromProjections(projection1, projection2);
  return transformFunc === cloneTransform && equalUnits;
}

/**
 * Searches in the list of transform functions for the function for converting
 * coordinates from the source projection to the destination projection.
 *
 * @param {Projection} sourceProjection Source Projection object.
 * @param {Projection} destinationProjection Destination Projection
 *     object.
 * @return {TransformFunction} Transform function.
 */
function getTransformFromProjections(
  sourceProjection,
  destinationProjection
) {
  const sourceCode = sourceProjection.getCode();
  const destinationCode = destinationProjection.getCode();
  let transformFunc = get$1(sourceCode, destinationCode);
  if (!transformFunc) {
    transformFunc = identityTransform;
  }
  return transformFunc;
}

/**
 * Given the projection-like objects, searches for a transformation
 * function to convert a coordinates array from the source projection to the
 * destination projection.
 *
 * @param {ProjectionLike} source Source.
 * @param {ProjectionLike} destination Destination.
 * @return {TransformFunction} Transform function.
 * @api
 */
function getTransform(source, destination) {
  const sourceProjection = get(source);
  const destinationProjection = get(destination);
  return getTransformFromProjections(sourceProjection, destinationProjection);
}

/**
 * Transforms a coordinate from source projection to destination projection.
 * This returns a new coordinate (and does not modify the original).
 *
 * See {@link module:ol/proj.transformExtent} for extent transformation.
 * See the transform method of {@link module:ol/geom/Geometry~Geometry} and its
 * subclasses for geometry transforms.
 *
 * @param {import("./coordinate.js").Coordinate} coordinate Coordinate.
 * @param {ProjectionLike} source Source projection-like.
 * @param {ProjectionLike} destination Destination projection-like.
 * @return {import("./coordinate.js").Coordinate} Coordinate.
 * @api
 */
function transform(coordinate, source, destination) {
  const transformFunc = getTransform(source, destination);
  return transformFunc(coordinate, undefined, coordinate.length);
}

/**
 * Return a coordinate transformed into the user projection.  If no user projection
 * is set, the original coordinate is returned.
 * @param {Array<number>} coordinate Input coordinate.
 * @param {ProjectionLike} sourceProjection The input coordinate projection.
 * @return {Array<number>} The input coordinate in the user projection.
 */
function toUserCoordinate(coordinate, sourceProjection) {
  {
    return coordinate;
  }
}

/**
 * Return a coordinate transformed from the user projection.  If no user projection
 * is set, the original coordinate is returned.
 * @param {Array<number>} coordinate Input coordinate.
 * @param {ProjectionLike} destProjection The destination projection.
 * @return {Array<number>} The input coordinate transformed.
 */
function fromUserCoordinate(coordinate, destProjection) {
  {
    if (
      showCoordinateWarning &&
      !equals(coordinate, [0, 0]) &&
      coordinate[0] >= -180 &&
      coordinate[0] <= 180 &&
      coordinate[1] >= -90 &&
      coordinate[1] <= 90
    ) {
      showCoordinateWarning = false;
      warn(
        'Call useGeographic() from ol/proj once to work with [longitude, latitude] coordinates.'
      );
    }
    return coordinate;
  }
}

/**
 * Return an extent transformed into the user projection.  If no user projection
 * is set, the original extent is returned.
 * @param {import("./extent.js").Extent} extent Input extent.
 * @param {ProjectionLike} sourceProjection The input extent projection.
 * @return {import("./extent.js").Extent} The input extent in the user projection.
 */
function toUserExtent(extent, sourceProjection) {
  {
    return extent;
  }
}

/**
 * Return an extent transformed from the user projection.  If no user projection
 * is set, the original extent is returned.
 * @param {import("./extent.js").Extent} extent Input extent.
 * @param {ProjectionLike} destProjection The destination projection.
 * @return {import("./extent.js").Extent} The input extent transformed.
 */
function fromUserExtent(extent, destProjection) {
  {
    return extent;
  }
}

/**
 * Add transforms to and from EPSG:4326 and EPSG:3857.  This function is called
 * by when this module is executed and should only need to be called again after
 * `clearAllProjections()` is called (e.g. in tests).
 */
function addCommon() {
  // Add transformations that don't alter coordinates to convert within set of
  // projections with equal meaning.
  addEquivalentProjections(PROJECTIONS$1);
  addEquivalentProjections(PROJECTIONS);
  // Add transformations to convert EPSG:4326 like coordinates to EPSG:3857 like
  // coordinates and back.
  addEquivalentTransforms(
    PROJECTIONS,
    PROJECTIONS$1,
    fromEPSG4326,
    toEPSG4326
  );
}

addCommon();

/**
 * @module ol/centerconstraint
 */

/**
 * @typedef {function((import("./coordinate.js").Coordinate|undefined), number, import("./size.js").Size, boolean=, Array<number>=): (import("./coordinate.js").Coordinate|undefined)} Type
 */

/**
 * @param {import("./extent.js").Extent} extent Extent.
 * @param {boolean} onlyCenter If true, the constraint will only apply to the view center.
 * @param {boolean} smooth If true, the view will be able to go slightly out of the given extent
 * (only during interaction and animation).
 * @return {Type} The constraint.
 */
function createExtent(extent, onlyCenter, smooth) {
  return (
    /**
     * @param {import("./coordinate.js").Coordinate|undefined} center Center.
     * @param {number|undefined} resolution Resolution.
     * @param {import("./size.js").Size} size Viewport size; unused if `onlyCenter` was specified.
     * @param {boolean} [isMoving] True if an interaction or animation is in progress.
     * @param {Array<number>} [centerShift] Shift between map center and viewport center.
     * @return {import("./coordinate.js").Coordinate|undefined} Center.
     */
    function (center, resolution, size, isMoving, centerShift) {
      if (!center) {
        return undefined;
      }
      if (!resolution && !onlyCenter) {
        return center;
      }
      const viewWidth = onlyCenter ? 0 : size[0] * resolution;
      const viewHeight = onlyCenter ? 0 : size[1] * resolution;
      const shiftX = centerShift ? centerShift[0] : 0;
      const shiftY = centerShift ? centerShift[1] : 0;
      let minX = extent[0] + viewWidth / 2 + shiftX;
      let maxX = extent[2] - viewWidth / 2 + shiftX;
      let minY = extent[1] + viewHeight / 2 + shiftY;
      let maxY = extent[3] - viewHeight / 2 + shiftY;

      // note: when zooming out of bounds, min and max values for x and y may
      // end up inverted (min > max); this has to be accounted for
      if (minX > maxX) {
        minX = (maxX + minX) / 2;
        maxX = minX;
      }
      if (minY > maxY) {
        minY = (maxY + minY) / 2;
        maxY = minY;
      }

      let x = clamp(center[0], minX, maxX);
      let y = clamp(center[1], minY, maxY);

      // during an interaction, allow some overscroll
      if (isMoving && smooth && resolution) {
        const ratio = 30 * resolution;
        x +=
          -ratio * Math.log(1 + Math.max(0, minX - center[0]) / ratio) +
          ratio * Math.log(1 + Math.max(0, center[0] - maxX) / ratio);
        y +=
          -ratio * Math.log(1 + Math.max(0, minY - center[1]) / ratio) +
          ratio * Math.log(1 + Math.max(0, center[1] - maxY) / ratio);
      }

      return [x, y];
    }
  );
}

/**
 * @param {import("./coordinate.js").Coordinate} [center] Center.
 * @return {import("./coordinate.js").Coordinate|undefined} Center.
 */
function none$1(center) {
  return center;
}

/**
 * @module ol/resolutionconstraint
 */

/**
 * @typedef {function((number|undefined), number, import("./size.js").Size, boolean=): (number|undefined)} Type
 */

/**
 * Returns a modified resolution taking into account the viewport size and maximum
 * allowed extent.
 * @param {number} resolution Resolution
 * @param {import("./extent.js").Extent} maxExtent Maximum allowed extent.
 * @param {import("./size.js").Size} viewportSize Viewport size.
 * @param {boolean} showFullExtent Whether to show the full extent.
 * @return {number} Capped resolution.
 */
function getViewportClampedResolution(
  resolution,
  maxExtent,
  viewportSize,
  showFullExtent
) {
  const xResolution = getWidth(maxExtent) / viewportSize[0];
  const yResolution = getHeight(maxExtent) / viewportSize[1];

  if (showFullExtent) {
    return Math.min(resolution, Math.max(xResolution, yResolution));
  }
  return Math.min(resolution, Math.min(xResolution, yResolution));
}

/**
 * Returns a modified resolution to be between maxResolution and minResolution while
 * still allowing the value to be slightly out of bounds.
 * Note: the computation is based on the logarithm function (ln):
 *  - at 1, ln(x) is 0
 *  - above 1, ln(x) keeps increasing but at a much slower pace than x
 * The final result is clamped to prevent getting too far away from bounds.
 * @param {number} resolution Resolution.
 * @param {number} maxResolution Max resolution.
 * @param {number} minResolution Min resolution.
 * @return {number} Smoothed resolution.
 */
function getSmoothClampedResolution(resolution, maxResolution, minResolution) {
  let result = Math.min(resolution, maxResolution);
  const ratio = 50;

  result *=
    Math.log(1 + ratio * Math.max(0, resolution / maxResolution - 1)) / ratio +
    1;
  if (minResolution) {
    result = Math.max(result, minResolution);
    result /=
      Math.log(1 + ratio * Math.max(0, minResolution / resolution - 1)) /
        ratio +
      1;
  }
  return clamp(result, minResolution / 2, maxResolution * 2);
}

/**
 * @param {Array<number>} resolutions Resolutions.
 * @param {boolean} [smooth] If true, the view will be able to slightly exceed resolution limits. Default: true.
 * @param {import("./extent.js").Extent} [maxExtent] Maximum allowed extent.
 * @param {boolean} [showFullExtent] If true, allows us to show the full extent. Default: false.
 * @return {Type} Zoom function.
 */
function createSnapToResolutions(
  resolutions,
  smooth,
  maxExtent,
  showFullExtent
) {
  smooth = smooth !== undefined ? smooth : true;
  return (
    /**
     * @param {number|undefined} resolution Resolution.
     * @param {number} direction Direction.
     * @param {import("./size.js").Size} size Viewport size.
     * @param {boolean} [isMoving] True if an interaction or animation is in progress.
     * @return {number|undefined} Resolution.
     */
    function (resolution, direction, size, isMoving) {
      if (resolution !== undefined) {
        const maxResolution = resolutions[0];
        const minResolution = resolutions[resolutions.length - 1];
        const cappedMaxRes = maxExtent
          ? getViewportClampedResolution(
              maxResolution,
              maxExtent,
              size,
              showFullExtent
            )
          : maxResolution;

        // during interacting or animating, allow intermediary values
        if (isMoving) {
          if (!smooth) {
            return clamp(resolution, minResolution, cappedMaxRes);
          }
          return getSmoothClampedResolution(
            resolution,
            cappedMaxRes,
            minResolution
          );
        }

        const capped = Math.min(cappedMaxRes, resolution);
        const z = Math.floor(linearFindNearest(resolutions, capped, direction));
        if (resolutions[z] > cappedMaxRes && z < resolutions.length - 1) {
          return resolutions[z + 1];
        }
        return resolutions[z];
      }
      return undefined;
    }
  );
}

/**
 * @param {number} power Power.
 * @param {number} maxResolution Maximum resolution.
 * @param {number} [minResolution] Minimum resolution.
 * @param {boolean} [smooth] If true, the view will be able to slightly exceed resolution limits. Default: true.
 * @param {import("./extent.js").Extent} [maxExtent] Maximum allowed extent.
 * @param {boolean} [showFullExtent] If true, allows us to show the full extent. Default: false.
 * @return {Type} Zoom function.
 */
function createSnapToPower(
  power,
  maxResolution,
  minResolution,
  smooth,
  maxExtent,
  showFullExtent
) {
  smooth = smooth !== undefined ? smooth : true;
  minResolution = minResolution !== undefined ? minResolution : 0;

  return (
    /**
     * @param {number|undefined} resolution Resolution.
     * @param {number} direction Direction.
     * @param {import("./size.js").Size} size Viewport size.
     * @param {boolean} [isMoving] True if an interaction or animation is in progress.
     * @return {number|undefined} Resolution.
     */
    function (resolution, direction, size, isMoving) {
      if (resolution !== undefined) {
        const cappedMaxRes = maxExtent
          ? getViewportClampedResolution(
              maxResolution,
              maxExtent,
              size,
              showFullExtent
            )
          : maxResolution;

        // during interacting or animating, allow intermediary values
        if (isMoving) {
          if (!smooth) {
            return clamp(resolution, minResolution, cappedMaxRes);
          }
          return getSmoothClampedResolution(
            resolution,
            cappedMaxRes,
            minResolution
          );
        }

        const tolerance = 1e-9;
        const minZoomLevel = Math.ceil(
          Math.log(maxResolution / cappedMaxRes) / Math.log(power) - tolerance
        );
        const offset = -direction * (0.5 - tolerance) + 0.5;
        const capped = Math.min(cappedMaxRes, resolution);
        const cappedZoomLevel = Math.floor(
          Math.log(maxResolution / capped) / Math.log(power) + offset
        );
        const zoomLevel = Math.max(minZoomLevel, cappedZoomLevel);
        const newResolution = maxResolution / Math.pow(power, zoomLevel);
        return clamp(newResolution, minResolution, cappedMaxRes);
      }
      return undefined;
    }
  );
}

/**
 * @param {number} maxResolution Max resolution.
 * @param {number} minResolution Min resolution.
 * @param {boolean} [smooth] If true, the view will be able to slightly exceed resolution limits. Default: true.
 * @param {import("./extent.js").Extent} [maxExtent] Maximum allowed extent.
 * @param {boolean} [showFullExtent] If true, allows us to show the full extent. Default: false.
 * @return {Type} Zoom function.
 */
function createMinMaxResolution(
  maxResolution,
  minResolution,
  smooth,
  maxExtent,
  showFullExtent
) {
  smooth = smooth !== undefined ? smooth : true;

  return (
    /**
     * @param {number|undefined} resolution Resolution.
     * @param {number} direction Direction.
     * @param {import("./size.js").Size} size Viewport size.
     * @param {boolean} [isMoving] True if an interaction or animation is in progress.
     * @return {number|undefined} Resolution.
     */
    function (resolution, direction, size, isMoving) {
      if (resolution !== undefined) {
        const cappedMaxRes = maxExtent
          ? getViewportClampedResolution(
              maxResolution,
              maxExtent,
              size,
              showFullExtent
            )
          : maxResolution;

        if (!smooth || !isMoving) {
          return clamp(resolution, minResolution, cappedMaxRes);
        }
        return getSmoothClampedResolution(
          resolution,
          cappedMaxRes,
          minResolution
        );
      }
      return undefined;
    }
  );
}

/**
 * @module ol/rotationconstraint
 */

/**
 * @typedef {function((number|undefined), boolean=): (number|undefined)} Type
 */

/**
 * @param {number|undefined} rotation Rotation.
 * @return {number|undefined} Rotation.
 */
function disable(rotation) {
  if (rotation !== undefined) {
    return 0;
  }
  return undefined;
}

/**
 * @param {number|undefined} rotation Rotation.
 * @return {number|undefined} Rotation.
 */
function none(rotation) {
  if (rotation !== undefined) {
    return rotation;
  }
  return undefined;
}

/**
 * @param {number} n N.
 * @return {Type} Rotation constraint.
 */
function createSnapToN(n) {
  const theta = (2 * Math.PI) / n;
  return (
    /**
     * @param {number|undefined} rotation Rotation.
     * @param {boolean} [isMoving] True if an interaction or animation is in progress.
     * @return {number|undefined} Rotation.
     */
    function (rotation, isMoving) {
      if (isMoving) {
        return rotation;
      }

      if (rotation !== undefined) {
        rotation = Math.floor(rotation / theta + 0.5) * theta;
        return rotation;
      }
      return undefined;
    }
  );
}

/**
 * @param {number} [tolerance] Tolerance.
 * @return {Type} Rotation constraint.
 */
function createSnapToZero(tolerance) {
  tolerance = tolerance || toRadians(5);
  return (
    /**
     * @param {number|undefined} rotation Rotation.
     * @param {boolean} [isMoving] True if an interaction or animation is in progress.
     * @return {number|undefined} Rotation.
     */
    function (rotation, isMoving) {
      if (isMoving) {
        return rotation;
      }

      if (rotation !== undefined) {
        if (Math.abs(rotation) <= tolerance) {
          return 0;
        }
        return rotation;
      }
      return undefined;
    }
  );
}

/**
 * @module ol/easing
 */

/**
 * Start slow and speed up.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 * @api
 */
function easeIn(t) {
  return Math.pow(t, 3);
}

/**
 * Start fast and slow down.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 * @api
 */
function easeOut(t) {
  return 1 - easeIn(1 - t);
}

/**
 * Start slow, speed up, and then slow down again.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 * @api
 */
function inAndOut(t) {
  return 3 * t * t - 2 * t * t * t;
}

/**
 * Maintain a constant speed over time.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 * @api
 */
function linear(t) {
  return t;
}

/**
 * @module ol/geom/flat/transform
 */

/**
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @param {import("../../transform.js").Transform} transform Transform.
 * @param {Array<number>} [dest] Destination.
 * @return {Array<number>} Transformed coordinates.
 */
function transform2D(
  flatCoordinates,
  offset,
  end,
  stride,
  transform,
  dest
) {
  dest = dest ? dest : [];
  let i = 0;
  for (let j = offset; j < end; j += stride) {
    const x = flatCoordinates[j];
    const y = flatCoordinates[j + 1];
    dest[i++] = transform[0] * x + transform[2] * y + transform[4];
    dest[i++] = transform[1] * x + transform[3] * y + transform[5];
  }
  if (dest && dest.length != i) {
    dest.length = i;
  }
  return dest;
}

/**
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @param {number} angle Angle.
 * @param {Array<number>} anchor Rotation anchor point.
 * @param {Array<number>} [dest] Destination.
 * @return {Array<number>} Transformed coordinates.
 */
function rotate(
  flatCoordinates,
  offset,
  end,
  stride,
  angle,
  anchor,
  dest
) {
  dest = dest ? dest : [];
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const anchorX = anchor[0];
  const anchorY = anchor[1];
  let i = 0;
  for (let j = offset; j < end; j += stride) {
    const deltaX = flatCoordinates[j] - anchorX;
    const deltaY = flatCoordinates[j + 1] - anchorY;
    dest[i++] = anchorX + deltaX * cos - deltaY * sin;
    dest[i++] = anchorY + deltaX * sin + deltaY * cos;
    for (let k = j + 2; k < j + stride; ++k) {
      dest[i++] = flatCoordinates[k];
    }
  }
  if (dest && dest.length != i) {
    dest.length = i;
  }
  return dest;
}

/**
 * Scale the coordinates.
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @param {number} sx Scale factor in the x-direction.
 * @param {number} sy Scale factor in the y-direction.
 * @param {Array<number>} anchor Scale anchor point.
 * @param {Array<number>} [dest] Destination.
 * @return {Array<number>} Transformed coordinates.
 */
function scale$1(
  flatCoordinates,
  offset,
  end,
  stride,
  sx,
  sy,
  anchor,
  dest
) {
  dest = dest ? dest : [];
  const anchorX = anchor[0];
  const anchorY = anchor[1];
  let i = 0;
  for (let j = offset; j < end; j += stride) {
    const deltaX = flatCoordinates[j] - anchorX;
    const deltaY = flatCoordinates[j + 1] - anchorY;
    dest[i++] = anchorX + sx * deltaX;
    dest[i++] = anchorY + sy * deltaY;
    for (let k = j + 2; k < j + stride; ++k) {
      dest[i++] = flatCoordinates[k];
    }
  }
  if (dest && dest.length != i) {
    dest.length = i;
  }
  return dest;
}

/**
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @param {number} deltaX Delta X.
 * @param {number} deltaY Delta Y.
 * @param {Array<number>} [dest] Destination.
 * @return {Array<number>} Transformed coordinates.
 */
function translate(
  flatCoordinates,
  offset,
  end,
  stride,
  deltaX,
  deltaY,
  dest
) {
  dest = dest ? dest : [];
  let i = 0;
  for (let j = offset; j < end; j += stride) {
    dest[i++] = flatCoordinates[j] + deltaX;
    dest[i++] = flatCoordinates[j + 1] + deltaY;
    for (let k = j + 2; k < j + stride; ++k) {
      dest[i++] = flatCoordinates[k];
    }
  }
  if (dest && dest.length != i) {
    dest.length = i;
  }
  return dest;
}

/**
 * @module ol/geom/Geometry
 */

/**
 * @typedef {'XY' | 'XYZ' | 'XYM' | 'XYZM'} GeometryLayout
 * The coordinate layout for geometries, indicating whether a 3rd or 4th z ('Z')
 * or measure ('M') coordinate is available.
 */

/**
 * @typedef {'Point' | 'LineString' | 'LinearRing' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon' | 'GeometryCollection' | 'Circle'} Type
 * The geometry type.  One of `'Point'`, `'LineString'`, `'LinearRing'`,
 * `'Polygon'`, `'MultiPoint'`, `'MultiLineString'`, `'MultiPolygon'`,
 * `'GeometryCollection'`, or `'Circle'`.
 */

/**
 * @type {import("../transform.js").Transform}
 */
const tmpTransform = create();

/**
 * @classdesc
 * Abstract base class; normally only used for creating subclasses and not
 * instantiated in apps.
 * Base class for vector geometries.
 *
 * To get notified of changes to the geometry, register a listener for the
 * generic `change` event on your geometry instance.
 *
 * @abstract
 * @api
 */
class Geometry extends BaseObject$1 {
  constructor() {
    super();

    /**
     * @private
     * @type {import("../extent.js").Extent}
     */
    this.extent_ = createEmpty();

    /**
     * @private
     * @type {number}
     */
    this.extentRevision_ = -1;

    /**
     * @protected
     * @type {number}
     */
    this.simplifiedGeometryMaxMinSquaredTolerance = 0;

    /**
     * @protected
     * @type {number}
     */
    this.simplifiedGeometryRevision = 0;

    /**
     * Get a transformed and simplified version of the geometry.
     * @abstract
     * @param {number} revision The geometry revision.
     * @param {number} squaredTolerance Squared tolerance.
     * @param {import("../proj.js").TransformFunction} [transform] Optional transform function.
     * @return {Geometry} Simplified geometry.
     */
    this.simplifyTransformedInternal = memoizeOne(function (
      revision,
      squaredTolerance,
      transform
    ) {
      if (!transform) {
        return this.getSimplifiedGeometry(squaredTolerance);
      }
      const clone = this.clone();
      clone.applyTransform(transform);
      return clone.getSimplifiedGeometry(squaredTolerance);
    });
  }

  /**
   * Get a transformed and simplified version of the geometry.
   * @abstract
   * @param {number} squaredTolerance Squared tolerance.
   * @param {import("../proj.js").TransformFunction} [transform] Optional transform function.
   * @return {Geometry} Simplified geometry.
   */
  simplifyTransformed(squaredTolerance, transform) {
    return this.simplifyTransformedInternal(
      this.getRevision(),
      squaredTolerance,
      transform
    );
  }

  /**
   * Make a complete copy of the geometry.
   * @abstract
   * @return {!Geometry} Clone.
   */
  clone() {
    return abstract();
  }

  /**
   * @abstract
   * @param {number} x X.
   * @param {number} y Y.
   * @param {import("../coordinate.js").Coordinate} closestPoint Closest point.
   * @param {number} minSquaredDistance Minimum squared distance.
   * @return {number} Minimum squared distance.
   */
  closestPointXY(x, y, closestPoint, minSquaredDistance) {
    return abstract();
  }

  /**
   * @param {number} x X.
   * @param {number} y Y.
   * @return {boolean} Contains (x, y).
   */
  containsXY(x, y) {
    const coord = this.getClosestPoint([x, y]);
    return coord[0] === x && coord[1] === y;
  }

  /**
   * Return the closest point of the geometry to the passed point as
   * {@link module:ol/coordinate~Coordinate coordinate}.
   * @param {import("../coordinate.js").Coordinate} point Point.
   * @param {import("../coordinate.js").Coordinate} [closestPoint] Closest point.
   * @return {import("../coordinate.js").Coordinate} Closest point.
   * @api
   */
  getClosestPoint(point, closestPoint) {
    closestPoint = closestPoint ? closestPoint : [NaN, NaN];
    this.closestPointXY(point[0], point[1], closestPoint, Infinity);
    return closestPoint;
  }

  /**
   * Returns true if this geometry includes the specified coordinate. If the
   * coordinate is on the boundary of the geometry, returns false.
   * @param {import("../coordinate.js").Coordinate} coordinate Coordinate.
   * @return {boolean} Contains coordinate.
   * @api
   */
  intersectsCoordinate(coordinate) {
    return this.containsXY(coordinate[0], coordinate[1]);
  }

  /**
   * @abstract
   * @param {import("../extent.js").Extent} extent Extent.
   * @protected
   * @return {import("../extent.js").Extent} extent Extent.
   */
  computeExtent(extent) {
    return abstract();
  }

  /**
   * Get the extent of the geometry.
   * @param {import("../extent.js").Extent} [extent] Extent.
   * @return {import("../extent.js").Extent} extent Extent.
   * @api
   */
  getExtent(extent) {
    if (this.extentRevision_ != this.getRevision()) {
      const extent = this.computeExtent(this.extent_);
      if (isNaN(extent[0]) || isNaN(extent[1])) {
        createOrUpdateEmpty(extent);
      }
      this.extentRevision_ = this.getRevision();
    }
    return returnOrUpdate(this.extent_, extent);
  }

  /**
   * Rotate the geometry around a given coordinate. This modifies the geometry
   * coordinates in place.
   * @abstract
   * @param {number} angle Rotation angle in radians.
   * @param {import("../coordinate.js").Coordinate} anchor The rotation center.
   * @api
   */
  rotate(angle, anchor) {
    abstract();
  }

  /**
   * Scale the geometry (with an optional origin).  This modifies the geometry
   * coordinates in place.
   * @abstract
   * @param {number} sx The scaling factor in the x-direction.
   * @param {number} [sy] The scaling factor in the y-direction (defaults to sx).
   * @param {import("../coordinate.js").Coordinate} [anchor] The scale origin (defaults to the center
   *     of the geometry extent).
   * @api
   */
  scale(sx, sy, anchor) {
    abstract();
  }

  /**
   * Create a simplified version of this geometry.  For linestrings, this uses
   * the [Douglas Peucker](https://en.wikipedia.org/wiki/Ramer-Douglas-Peucker_algorithm)
   * algorithm.  For polygons, a quantization-based
   * simplification is used to preserve topology.
   * @param {number} tolerance The tolerance distance for simplification.
   * @return {Geometry} A new, simplified version of the original geometry.
   * @api
   */
  simplify(tolerance) {
    return this.getSimplifiedGeometry(tolerance * tolerance);
  }

  /**
   * Create a simplified version of this geometry using the Douglas Peucker
   * algorithm.
   * See https://en.wikipedia.org/wiki/Ramer-Douglas-Peucker_algorithm.
   * @abstract
   * @param {number} squaredTolerance Squared tolerance.
   * @return {Geometry} Simplified geometry.
   */
  getSimplifiedGeometry(squaredTolerance) {
    return abstract();
  }

  /**
   * Get the type of this geometry.
   * @abstract
   * @return {Type} Geometry type.
   */
  getType() {
    return abstract();
  }

  /**
   * Apply a transform function to the coordinates of the geometry.
   * The geometry is modified in place.
   * If you do not want the geometry modified in place, first `clone()` it and
   * then use this function on the clone.
   * @abstract
   * @param {import("../proj.js").TransformFunction} transformFn Transform function.
   * Called with a flat array of geometry coordinates.
   */
  applyTransform(transformFn) {
    abstract();
  }

  /**
   * Test if the geometry and the passed extent intersect.
   * @abstract
   * @param {import("../extent.js").Extent} extent Extent.
   * @return {boolean} `true` if the geometry and the extent intersect.
   */
  intersectsExtent(extent) {
    return abstract();
  }

  /**
   * Translate the geometry.  This modifies the geometry coordinates in place.  If
   * instead you want a new geometry, first `clone()` this geometry.
   * @abstract
   * @param {number} deltaX Delta X.
   * @param {number} deltaY Delta Y.
   * @api
   */
  translate(deltaX, deltaY) {
    abstract();
  }

  /**
   * Transform each coordinate of the geometry from one coordinate reference
   * system to another. The geometry is modified in place.
   * For example, a line will be transformed to a line and a circle to a circle.
   * If you do not want the geometry modified in place, first `clone()` it and
   * then use this function on the clone.
   *
   * @param {import("../proj.js").ProjectionLike} source The current projection.  Can be a
   *     string identifier or a {@link module:ol/proj/Projection~Projection} object.
   * @param {import("../proj.js").ProjectionLike} destination The desired projection.  Can be a
   *     string identifier or a {@link module:ol/proj/Projection~Projection} object.
   * @return {Geometry} This geometry.  Note that original geometry is
   *     modified in place.
   * @api
   */
  transform(source, destination) {
    /** @type {import("../proj/Projection.js").default} */
    const sourceProj = get(source);
    const transformFn =
      sourceProj.getUnits() == 'tile-pixels'
        ? function (inCoordinates, outCoordinates, stride) {
            const pixelExtent = sourceProj.getExtent();
            const projectedExtent = sourceProj.getWorldExtent();
            const scale = getHeight(projectedExtent) / getHeight(pixelExtent);
            compose(
              tmpTransform,
              projectedExtent[0],
              projectedExtent[3],
              scale,
              -scale,
              0,
              0,
              0
            );
            transform2D(
              inCoordinates,
              0,
              inCoordinates.length,
              stride,
              tmpTransform,
              outCoordinates
            );
            return getTransform(sourceProj, destination)(
              inCoordinates,
              outCoordinates,
              stride
            );
          }
        : getTransform(sourceProj, destination);
    this.applyTransform(transformFn);
    return this;
  }
}

var Geometry$1 = Geometry;

/**
 * @module ol/geom/SimpleGeometry
 */

/**
 * @classdesc
 * Abstract base class; only used for creating subclasses; do not instantiate
 * in apps, as cannot be rendered.
 *
 * @abstract
 * @api
 */
class SimpleGeometry extends Geometry$1 {
  constructor() {
    super();

    /**
     * @protected
     * @type {import("./Geometry.js").GeometryLayout}
     */
    this.layout = 'XY';

    /**
     * @protected
     * @type {number}
     */
    this.stride = 2;

    /**
     * @protected
     * @type {Array<number>}
     */
    this.flatCoordinates = null;
  }

  /**
   * @param {import("../extent.js").Extent} extent Extent.
   * @protected
   * @return {import("../extent.js").Extent} extent Extent.
   */
  computeExtent(extent) {
    return createOrUpdateFromFlatCoordinates(
      this.flatCoordinates,
      0,
      this.flatCoordinates.length,
      this.stride,
      extent
    );
  }

  /**
   * @abstract
   * @return {Array<*> | null} Coordinates.
   */
  getCoordinates() {
    return abstract();
  }

  /**
   * Return the first coordinate of the geometry.
   * @return {import("../coordinate.js").Coordinate} First coordinate.
   * @api
   */
  getFirstCoordinate() {
    return this.flatCoordinates.slice(0, this.stride);
  }

  /**
   * @return {Array<number>} Flat coordinates.
   */
  getFlatCoordinates() {
    return this.flatCoordinates;
  }

  /**
   * Return the last coordinate of the geometry.
   * @return {import("../coordinate.js").Coordinate} Last point.
   * @api
   */
  getLastCoordinate() {
    return this.flatCoordinates.slice(
      this.flatCoordinates.length - this.stride
    );
  }

  /**
   * Return the {@link import("./Geometry.js").GeometryLayout layout} of the geometry.
   * @return {import("./Geometry.js").GeometryLayout} Layout.
   * @api
   */
  getLayout() {
    return this.layout;
  }

  /**
   * Create a simplified version of this geometry using the Douglas Peucker algorithm.
   * @param {number} squaredTolerance Squared tolerance.
   * @return {SimpleGeometry} Simplified geometry.
   */
  getSimplifiedGeometry(squaredTolerance) {
    if (this.simplifiedGeometryRevision !== this.getRevision()) {
      this.simplifiedGeometryMaxMinSquaredTolerance = 0;
      this.simplifiedGeometryRevision = this.getRevision();
    }
    // If squaredTolerance is negative or if we know that simplification will not
    // have any effect then just return this.
    if (
      squaredTolerance < 0 ||
      (this.simplifiedGeometryMaxMinSquaredTolerance !== 0 &&
        squaredTolerance <= this.simplifiedGeometryMaxMinSquaredTolerance)
    ) {
      return this;
    }

    const simplifiedGeometry =
      this.getSimplifiedGeometryInternal(squaredTolerance);
    const simplifiedFlatCoordinates = simplifiedGeometry.getFlatCoordinates();
    if (simplifiedFlatCoordinates.length < this.flatCoordinates.length) {
      return simplifiedGeometry;
    }
    // Simplification did not actually remove any coordinates.  We now know
    // that any calls to getSimplifiedGeometry with a squaredTolerance less
    // than or equal to the current squaredTolerance will also not have any
    // effect.  This allows us to short circuit simplification (saving CPU
    // cycles) and prevents the cache of simplified geometries from filling
    // up with useless identical copies of this geometry (saving memory).
    this.simplifiedGeometryMaxMinSquaredTolerance = squaredTolerance;
    return this;
  }

  /**
   * @param {number} squaredTolerance Squared tolerance.
   * @return {SimpleGeometry} Simplified geometry.
   * @protected
   */
  getSimplifiedGeometryInternal(squaredTolerance) {
    return this;
  }

  /**
   * @return {number} Stride.
   */
  getStride() {
    return this.stride;
  }

  /**
   * @param {import("./Geometry.js").GeometryLayout} layout Layout.
   * @param {Array<number>} flatCoordinates Flat coordinates.
   */
  setFlatCoordinates(layout, flatCoordinates) {
    this.stride = getStrideForLayout(layout);
    this.layout = layout;
    this.flatCoordinates = flatCoordinates;
  }

  /**
   * @abstract
   * @param {!Array<*>} coordinates Coordinates.
   * @param {import("./Geometry.js").GeometryLayout} [layout] Layout.
   */
  setCoordinates(coordinates, layout) {
    abstract();
  }

  /**
   * @param {import("./Geometry.js").GeometryLayout|undefined} layout Layout.
   * @param {Array<*>} coordinates Coordinates.
   * @param {number} nesting Nesting.
   * @protected
   */
  setLayout(layout, coordinates, nesting) {
    /** @type {number} */
    let stride;
    if (layout) {
      stride = getStrideForLayout(layout);
    } else {
      for (let i = 0; i < nesting; ++i) {
        if (coordinates.length === 0) {
          this.layout = 'XY';
          this.stride = 2;
          return;
        }
        coordinates = /** @type {Array} */ (coordinates[0]);
      }
      stride = coordinates.length;
      layout = getLayoutForStride(stride);
    }
    this.layout = layout;
    this.stride = stride;
  }

  /**
   * Apply a transform function to the coordinates of the geometry.
   * The geometry is modified in place.
   * If you do not want the geometry modified in place, first `clone()` it and
   * then use this function on the clone.
   * @param {import("../proj.js").TransformFunction} transformFn Transform function.
   * Called with a flat array of geometry coordinates.
   * @api
   */
  applyTransform(transformFn) {
    if (this.flatCoordinates) {
      transformFn(this.flatCoordinates, this.flatCoordinates, this.stride);
      this.changed();
    }
  }

  /**
   * Rotate the geometry around a given coordinate. This modifies the geometry
   * coordinates in place.
   * @param {number} angle Rotation angle in counter-clockwise radians.
   * @param {import("../coordinate.js").Coordinate} anchor The rotation center.
   * @api
   */
  rotate(angle, anchor) {
    const flatCoordinates = this.getFlatCoordinates();
    if (flatCoordinates) {
      const stride = this.getStride();
      rotate(
        flatCoordinates,
        0,
        flatCoordinates.length,
        stride,
        angle,
        anchor,
        flatCoordinates
      );
      this.changed();
    }
  }

  /**
   * Scale the geometry (with an optional origin).  This modifies the geometry
   * coordinates in place.
   * @param {number} sx The scaling factor in the x-direction.
   * @param {number} [sy] The scaling factor in the y-direction (defaults to sx).
   * @param {import("../coordinate.js").Coordinate} [anchor] The scale origin (defaults to the center
   *     of the geometry extent).
   * @api
   */
  scale(sx, sy, anchor) {
    if (sy === undefined) {
      sy = sx;
    }
    if (!anchor) {
      anchor = getCenter(this.getExtent());
    }
    const flatCoordinates = this.getFlatCoordinates();
    if (flatCoordinates) {
      const stride = this.getStride();
      scale$1(
        flatCoordinates,
        0,
        flatCoordinates.length,
        stride,
        sx,
        sy,
        anchor,
        flatCoordinates
      );
      this.changed();
    }
  }

  /**
   * Translate the geometry.  This modifies the geometry coordinates in place.  If
   * instead you want a new geometry, first `clone()` this geometry.
   * @param {number} deltaX Delta X.
   * @param {number} deltaY Delta Y.
   * @api
   */
  translate(deltaX, deltaY) {
    const flatCoordinates = this.getFlatCoordinates();
    if (flatCoordinates) {
      const stride = this.getStride();
      translate(
        flatCoordinates,
        0,
        flatCoordinates.length,
        stride,
        deltaX,
        deltaY,
        flatCoordinates
      );
      this.changed();
    }
  }
}

/**
 * @param {number} stride Stride.
 * @return {import("./Geometry.js").GeometryLayout} layout Layout.
 */
function getLayoutForStride(stride) {
  let layout;
  if (stride == 2) {
    layout = 'XY';
  } else if (stride == 3) {
    layout = 'XYZ';
  } else if (stride == 4) {
    layout = 'XYZM';
  }
  return /** @type {import("./Geometry.js").GeometryLayout} */ (layout);
}

/**
 * @param {import("./Geometry.js").GeometryLayout} layout Layout.
 * @return {number} Stride.
 */
function getStrideForLayout(layout) {
  let stride;
  if (layout == 'XY') {
    stride = 2;
  } else if (layout == 'XYZ' || layout == 'XYM') {
    stride = 3;
  } else if (layout == 'XYZM') {
    stride = 4;
  }
  return /** @type {number} */ (stride);
}

var SimpleGeometry$1 = SimpleGeometry;

/**
 * @module ol/geom/flat/closest
 */

/**
 * Returns the point on the 2D line segment flatCoordinates[offset1] to
 * flatCoordinates[offset2] that is closest to the point (x, y).  Extra
 * dimensions are linearly interpolated.
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset1 Offset 1.
 * @param {number} offset2 Offset 2.
 * @param {number} stride Stride.
 * @param {number} x X.
 * @param {number} y Y.
 * @param {Array<number>} closestPoint Closest point.
 */
function assignClosest(
  flatCoordinates,
  offset1,
  offset2,
  stride,
  x,
  y,
  closestPoint
) {
  const x1 = flatCoordinates[offset1];
  const y1 = flatCoordinates[offset1 + 1];
  const dx = flatCoordinates[offset2] - x1;
  const dy = flatCoordinates[offset2 + 1] - y1;
  let offset;
  if (dx === 0 && dy === 0) {
    offset = offset1;
  } else {
    const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      offset = offset2;
    } else if (t > 0) {
      for (let i = 0; i < stride; ++i) {
        closestPoint[i] = lerp(
          flatCoordinates[offset1 + i],
          flatCoordinates[offset2 + i],
          t
        );
      }
      closestPoint.length = stride;
      return;
    } else {
      offset = offset1;
    }
  }
  for (let i = 0; i < stride; ++i) {
    closestPoint[i] = flatCoordinates[offset + i];
  }
  closestPoint.length = stride;
}

/**
 * Return the squared of the largest distance between any pair of consecutive
 * coordinates.
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @param {number} max Max squared delta.
 * @return {number} Max squared delta.
 */
function maxSquaredDelta(flatCoordinates, offset, end, stride, max) {
  let x1 = flatCoordinates[offset];
  let y1 = flatCoordinates[offset + 1];
  for (offset += stride; offset < end; offset += stride) {
    const x2 = flatCoordinates[offset];
    const y2 = flatCoordinates[offset + 1];
    const squaredDelta = squaredDistance(x1, y1, x2, y2);
    if (squaredDelta > max) {
      max = squaredDelta;
    }
    x1 = x2;
    y1 = y2;
  }
  return max;
}

/**
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {Array<number>} ends Ends.
 * @param {number} stride Stride.
 * @param {number} max Max squared delta.
 * @return {number} Max squared delta.
 */
function arrayMaxSquaredDelta(
  flatCoordinates,
  offset,
  ends,
  stride,
  max
) {
  for (let i = 0, ii = ends.length; i < ii; ++i) {
    const end = ends[i];
    max = maxSquaredDelta(flatCoordinates, offset, end, stride, max);
    offset = end;
  }
  return max;
}

/**
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @param {number} maxDelta Max delta.
 * @param {boolean} isRing Is ring.
 * @param {number} x X.
 * @param {number} y Y.
 * @param {Array<number>} closestPoint Closest point.
 * @param {number} minSquaredDistance Minimum squared distance.
 * @param {Array<number>} [tmpPoint] Temporary point object.
 * @return {number} Minimum squared distance.
 */
function assignClosestPoint(
  flatCoordinates,
  offset,
  end,
  stride,
  maxDelta,
  isRing,
  x,
  y,
  closestPoint,
  minSquaredDistance,
  tmpPoint
) {
  if (offset == end) {
    return minSquaredDistance;
  }
  let i, squaredDistance$1;
  if (maxDelta === 0) {
    // All points are identical, so just test the first point.
    squaredDistance$1 = squaredDistance(
      x,
      y,
      flatCoordinates[offset],
      flatCoordinates[offset + 1]
    );
    if (squaredDistance$1 < minSquaredDistance) {
      for (i = 0; i < stride; ++i) {
        closestPoint[i] = flatCoordinates[offset + i];
      }
      closestPoint.length = stride;
      return squaredDistance$1;
    }
    return minSquaredDistance;
  }
  tmpPoint = tmpPoint ? tmpPoint : [NaN, NaN];
  let index = offset + stride;
  while (index < end) {
    assignClosest(
      flatCoordinates,
      index - stride,
      index,
      stride,
      x,
      y,
      tmpPoint
    );
    squaredDistance$1 = squaredDistance(x, y, tmpPoint[0], tmpPoint[1]);
    if (squaredDistance$1 < minSquaredDistance) {
      minSquaredDistance = squaredDistance$1;
      for (i = 0; i < stride; ++i) {
        closestPoint[i] = tmpPoint[i];
      }
      closestPoint.length = stride;
      index += stride;
    } else {
      // Skip ahead multiple points, because we know that all the skipped
      // points cannot be any closer than the closest point we have found so
      // far.  We know this because we know how close the current point is, how
      // close the closest point we have found so far is, and the maximum
      // distance between consecutive points.  For example, if we're currently
      // at distance 10, the best we've found so far is 3, and that the maximum
      // distance between consecutive points is 2, then we'll need to skip at
      // least (10 - 3) / 2 == 3 (rounded down) points to have any chance of
      // finding a closer point.  We use Math.max(..., 1) to ensure that we
      // always advance at least one point, to avoid an infinite loop.
      index +=
        stride *
        Math.max(
          ((Math.sqrt(squaredDistance$1) - Math.sqrt(minSquaredDistance)) /
            maxDelta) |
            0,
          1
        );
    }
  }
  if (isRing) {
    // Check the closing segment.
    assignClosest(
      flatCoordinates,
      end - stride,
      offset,
      stride,
      x,
      y,
      tmpPoint
    );
    squaredDistance$1 = squaredDistance(x, y, tmpPoint[0], tmpPoint[1]);
    if (squaredDistance$1 < minSquaredDistance) {
      minSquaredDistance = squaredDistance$1;
      for (i = 0; i < stride; ++i) {
        closestPoint[i] = tmpPoint[i];
      }
      closestPoint.length = stride;
    }
  }
  return minSquaredDistance;
}

/**
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {Array<number>} ends Ends.
 * @param {number} stride Stride.
 * @param {number} maxDelta Max delta.
 * @param {boolean} isRing Is ring.
 * @param {number} x X.
 * @param {number} y Y.
 * @param {Array<number>} closestPoint Closest point.
 * @param {number} minSquaredDistance Minimum squared distance.
 * @param {Array<number>} [tmpPoint] Temporary point object.
 * @return {number} Minimum squared distance.
 */
function assignClosestArrayPoint(
  flatCoordinates,
  offset,
  ends,
  stride,
  maxDelta,
  isRing,
  x,
  y,
  closestPoint,
  minSquaredDistance,
  tmpPoint
) {
  tmpPoint = tmpPoint ? tmpPoint : [NaN, NaN];
  for (let i = 0, ii = ends.length; i < ii; ++i) {
    const end = ends[i];
    minSquaredDistance = assignClosestPoint(
      flatCoordinates,
      offset,
      end,
      stride,
      maxDelta,
      isRing,
      x,
      y,
      closestPoint,
      minSquaredDistance,
      tmpPoint
    );
    offset = end;
  }
  return minSquaredDistance;
}

/**
 * @module ol/geom/flat/deflate
 */

/**
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {import("../../coordinate.js").Coordinate} coordinate Coordinate.
 * @param {number} stride Stride.
 * @return {number} offset Offset.
 */
function deflateCoordinate(flatCoordinates, offset, coordinate, stride) {
  for (let i = 0, ii = coordinate.length; i < ii; ++i) {
    flatCoordinates[offset++] = coordinate[i];
  }
  return offset;
}

/**
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {Array<import("../../coordinate.js").Coordinate>} coordinates Coordinates.
 * @param {number} stride Stride.
 * @return {number} offset Offset.
 */
function deflateCoordinates(
  flatCoordinates,
  offset,
  coordinates,
  stride
) {
  for (let i = 0, ii = coordinates.length; i < ii; ++i) {
    const coordinate = coordinates[i];
    for (let j = 0; j < stride; ++j) {
      flatCoordinates[offset++] = coordinate[j];
    }
  }
  return offset;
}

/**
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {Array<Array<import("../../coordinate.js").Coordinate>>} coordinatess Coordinatess.
 * @param {number} stride Stride.
 * @param {Array<number>} [ends] Ends.
 * @return {Array<number>} Ends.
 */
function deflateCoordinatesArray(
  flatCoordinates,
  offset,
  coordinatess,
  stride,
  ends
) {
  ends = ends ? ends : [];
  let i = 0;
  for (let j = 0, jj = coordinatess.length; j < jj; ++j) {
    const end = deflateCoordinates(
      flatCoordinates,
      offset,
      coordinatess[j],
      stride
    );
    ends[i++] = end;
    offset = end;
  }
  ends.length = i;
  return ends;
}

/**
 * @module ol/geom/flat/simplify
 */

/**
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @param {number} squaredTolerance Squared tolerance.
 * @param {Array<number>} simplifiedFlatCoordinates Simplified flat
 *     coordinates.
 * @param {number} simplifiedOffset Simplified offset.
 * @return {number} Simplified offset.
 */
function douglasPeucker(
  flatCoordinates,
  offset,
  end,
  stride,
  squaredTolerance,
  simplifiedFlatCoordinates,
  simplifiedOffset
) {
  const n = (end - offset) / stride;
  if (n < 3) {
    for (; offset < end; offset += stride) {
      simplifiedFlatCoordinates[simplifiedOffset++] = flatCoordinates[offset];
      simplifiedFlatCoordinates[simplifiedOffset++] =
        flatCoordinates[offset + 1];
    }
    return simplifiedOffset;
  }
  /** @type {Array<number>} */
  const markers = new Array(n);
  markers[0] = 1;
  markers[n - 1] = 1;
  /** @type {Array<number>} */
  const stack = [offset, end - stride];
  let index = 0;
  while (stack.length > 0) {
    const last = stack.pop();
    const first = stack.pop();
    let maxSquaredDistance = 0;
    const x1 = flatCoordinates[first];
    const y1 = flatCoordinates[first + 1];
    const x2 = flatCoordinates[last];
    const y2 = flatCoordinates[last + 1];
    for (let i = first + stride; i < last; i += stride) {
      const x = flatCoordinates[i];
      const y = flatCoordinates[i + 1];
      const squaredDistance = squaredSegmentDistance(x, y, x1, y1, x2, y2);
      if (squaredDistance > maxSquaredDistance) {
        index = i;
        maxSquaredDistance = squaredDistance;
      }
    }
    if (maxSquaredDistance > squaredTolerance) {
      markers[(index - offset) / stride] = 1;
      if (first + stride < index) {
        stack.push(first, index);
      }
      if (index + stride < last) {
        stack.push(index, last);
      }
    }
  }
  for (let i = 0; i < n; ++i) {
    if (markers[i]) {
      simplifiedFlatCoordinates[simplifiedOffset++] =
        flatCoordinates[offset + i * stride];
      simplifiedFlatCoordinates[simplifiedOffset++] =
        flatCoordinates[offset + i * stride + 1];
    }
  }
  return simplifiedOffset;
}

/**
 * @param {number} value Value.
 * @param {number} tolerance Tolerance.
 * @return {number} Rounded value.
 */
function snap(value, tolerance) {
  return tolerance * Math.round(value / tolerance);
}

/**
 * Simplifies a line string using an algorithm designed by Tim Schaub.
 * Coordinates are snapped to the nearest value in a virtual grid and
 * consecutive duplicate coordinates are discarded.  This effectively preserves
 * topology as the simplification of any subsection of a line string is
 * independent of the rest of the line string.  This means that, for examples,
 * the common edge between two polygons will be simplified to the same line
 * string independently in both polygons.  This implementation uses a single
 * pass over the coordinates and eliminates intermediate collinear points.
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @param {number} tolerance Tolerance.
 * @param {Array<number>} simplifiedFlatCoordinates Simplified flat
 *     coordinates.
 * @param {number} simplifiedOffset Simplified offset.
 * @return {number} Simplified offset.
 */
function quantize(
  flatCoordinates,
  offset,
  end,
  stride,
  tolerance,
  simplifiedFlatCoordinates,
  simplifiedOffset
) {
  // do nothing if the line is empty
  if (offset == end) {
    return simplifiedOffset;
  }
  // snap the first coordinate (P1)
  let x1 = snap(flatCoordinates[offset], tolerance);
  let y1 = snap(flatCoordinates[offset + 1], tolerance);
  offset += stride;
  // add the first coordinate to the output
  simplifiedFlatCoordinates[simplifiedOffset++] = x1;
  simplifiedFlatCoordinates[simplifiedOffset++] = y1;
  // find the next coordinate that does not snap to the same value as the first
  // coordinate (P2)
  let x2, y2;
  do {
    x2 = snap(flatCoordinates[offset], tolerance);
    y2 = snap(flatCoordinates[offset + 1], tolerance);
    offset += stride;
    if (offset == end) {
      // all coordinates snap to the same value, the line collapses to a point
      // push the last snapped value anyway to ensure that the output contains
      // at least two points
      // FIXME should we really return at least two points anyway?
      simplifiedFlatCoordinates[simplifiedOffset++] = x2;
      simplifiedFlatCoordinates[simplifiedOffset++] = y2;
      return simplifiedOffset;
    }
  } while (x2 == x1 && y2 == y1);
  while (offset < end) {
    // snap the next coordinate (P3)
    const x3 = snap(flatCoordinates[offset], tolerance);
    const y3 = snap(flatCoordinates[offset + 1], tolerance);
    offset += stride;
    // skip P3 if it is equal to P2
    if (x3 == x2 && y3 == y2) {
      continue;
    }
    // calculate the delta between P1 and P2
    const dx1 = x2 - x1;
    const dy1 = y2 - y1;
    // calculate the delta between P3 and P1
    const dx2 = x3 - x1;
    const dy2 = y3 - y1;
    // if P1, P2, and P3 are colinear and P3 is further from P1 than P2 is from
    // P1 in the same direction then P2 is on the straight line between P1 and
    // P3
    if (
      dx1 * dy2 == dy1 * dx2 &&
      ((dx1 < 0 && dx2 < dx1) || dx1 == dx2 || (dx1 > 0 && dx2 > dx1)) &&
      ((dy1 < 0 && dy2 < dy1) || dy1 == dy2 || (dy1 > 0 && dy2 > dy1))
    ) {
      // discard P2 and set P2 = P3
      x2 = x3;
      y2 = y3;
      continue;
    }
    // either P1, P2, and P3 are not colinear, or they are colinear but P3 is
    // between P3 and P1 or on the opposite half of the line to P2.  add P2,
    // and continue with P1 = P2 and P2 = P3
    simplifiedFlatCoordinates[simplifiedOffset++] = x2;
    simplifiedFlatCoordinates[simplifiedOffset++] = y2;
    x1 = x2;
    y1 = y2;
    x2 = x3;
    y2 = y3;
  }
  // add the last point (P2)
  simplifiedFlatCoordinates[simplifiedOffset++] = x2;
  simplifiedFlatCoordinates[simplifiedOffset++] = y2;
  return simplifiedOffset;
}

/**
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {Array<number>} ends Ends.
 * @param {number} stride Stride.
 * @param {number} tolerance Tolerance.
 * @param {Array<number>} simplifiedFlatCoordinates Simplified flat
 *     coordinates.
 * @param {number} simplifiedOffset Simplified offset.
 * @param {Array<number>} simplifiedEnds Simplified ends.
 * @return {number} Simplified offset.
 */
function quantizeArray(
  flatCoordinates,
  offset,
  ends,
  stride,
  tolerance,
  simplifiedFlatCoordinates,
  simplifiedOffset,
  simplifiedEnds
) {
  for (let i = 0, ii = ends.length; i < ii; ++i) {
    const end = ends[i];
    simplifiedOffset = quantize(
      flatCoordinates,
      offset,
      end,
      stride,
      tolerance,
      simplifiedFlatCoordinates,
      simplifiedOffset
    );
    simplifiedEnds.push(simplifiedOffset);
    offset = end;
  }
  return simplifiedOffset;
}

/**
 * @module ol/geom/flat/inflate
 */

/**
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @param {Array<import("../../coordinate.js").Coordinate>} [coordinates] Coordinates.
 * @return {Array<import("../../coordinate.js").Coordinate>} Coordinates.
 */
function inflateCoordinates(
  flatCoordinates,
  offset,
  end,
  stride,
  coordinates
) {
  coordinates = coordinates !== undefined ? coordinates : [];
  let i = 0;
  for (let j = offset; j < end; j += stride) {
    coordinates[i++] = flatCoordinates.slice(j, j + stride);
  }
  coordinates.length = i;
  return coordinates;
}

/**
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {Array<number>} ends Ends.
 * @param {number} stride Stride.
 * @param {Array<Array<import("../../coordinate.js").Coordinate>>} [coordinatess] Coordinatess.
 * @return {Array<Array<import("../../coordinate.js").Coordinate>>} Coordinatess.
 */
function inflateCoordinatesArray(
  flatCoordinates,
  offset,
  ends,
  stride,
  coordinatess
) {
  coordinatess = coordinatess !== undefined ? coordinatess : [];
  let i = 0;
  for (let j = 0, jj = ends.length; j < jj; ++j) {
    const end = ends[j];
    coordinatess[i++] = inflateCoordinates(
      flatCoordinates,
      offset,
      end,
      stride,
      coordinatess[i]
    );
    offset = end;
  }
  coordinatess.length = i;
  return coordinatess;
}

/**
 * @module ol/geom/flat/area
 */

/**
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @return {number} Area.
 */
function linearRing(flatCoordinates, offset, end, stride) {
  let twiceArea = 0;
  let x1 = flatCoordinates[end - stride];
  let y1 = flatCoordinates[end - stride + 1];
  for (; offset < end; offset += stride) {
    const x2 = flatCoordinates[offset];
    const y2 = flatCoordinates[offset + 1];
    twiceArea += y1 * x2 - x1 * y2;
    x1 = x2;
    y1 = y2;
  }
  return twiceArea / 2;
}

/**
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {Array<number>} ends Ends.
 * @param {number} stride Stride.
 * @return {number} Area.
 */
function linearRings(flatCoordinates, offset, ends, stride) {
  let area = 0;
  for (let i = 0, ii = ends.length; i < ii; ++i) {
    const end = ends[i];
    area += linearRing(flatCoordinates, offset, end, stride);
    offset = end;
  }
  return area;
}

/**
 * @module ol/geom/LinearRing
 */

/**
 * @classdesc
 * Linear ring geometry. Only used as part of polygon; cannot be rendered
 * on its own.
 *
 * @api
 */
class LinearRing extends SimpleGeometry$1 {
  /**
   * @param {Array<import("../coordinate.js").Coordinate>|Array<number>} coordinates Coordinates.
   *     For internal use, flat coordinates in combination with `layout` are also accepted.
   * @param {import("./Geometry.js").GeometryLayout} [layout] Layout.
   */
  constructor(coordinates, layout) {
    super();

    /**
     * @private
     * @type {number}
     */
    this.maxDelta_ = -1;

    /**
     * @private
     * @type {number}
     */
    this.maxDeltaRevision_ = -1;

    if (layout !== undefined && !Array.isArray(coordinates[0])) {
      this.setFlatCoordinates(
        layout,
        /** @type {Array<number>} */ (coordinates)
      );
    } else {
      this.setCoordinates(
        /** @type {Array<import("../coordinate.js").Coordinate>} */ (
          coordinates
        ),
        layout
      );
    }
  }

  /**
   * Make a complete copy of the geometry.
   * @return {!LinearRing} Clone.
   * @api
   */
  clone() {
    return new LinearRing(this.flatCoordinates.slice(), this.layout);
  }

  /**
   * @param {number} x X.
   * @param {number} y Y.
   * @param {import("../coordinate.js").Coordinate} closestPoint Closest point.
   * @param {number} minSquaredDistance Minimum squared distance.
   * @return {number} Minimum squared distance.
   */
  closestPointXY(x, y, closestPoint, minSquaredDistance) {
    if (minSquaredDistance < closestSquaredDistanceXY(this.getExtent(), x, y)) {
      return minSquaredDistance;
    }
    if (this.maxDeltaRevision_ != this.getRevision()) {
      this.maxDelta_ = Math.sqrt(
        maxSquaredDelta(
          this.flatCoordinates,
          0,
          this.flatCoordinates.length,
          this.stride,
          0
        )
      );
      this.maxDeltaRevision_ = this.getRevision();
    }
    return assignClosestPoint(
      this.flatCoordinates,
      0,
      this.flatCoordinates.length,
      this.stride,
      this.maxDelta_,
      true,
      x,
      y,
      closestPoint,
      minSquaredDistance
    );
  }

  /**
   * Return the area of the linear ring on projected plane.
   * @return {number} Area (on projected plane).
   * @api
   */
  getArea() {
    return linearRing(
      this.flatCoordinates,
      0,
      this.flatCoordinates.length,
      this.stride
    );
  }

  /**
   * Return the coordinates of the linear ring.
   * @return {Array<import("../coordinate.js").Coordinate>} Coordinates.
   * @api
   */
  getCoordinates() {
    return inflateCoordinates(
      this.flatCoordinates,
      0,
      this.flatCoordinates.length,
      this.stride
    );
  }

  /**
   * @param {number} squaredTolerance Squared tolerance.
   * @return {LinearRing} Simplified LinearRing.
   * @protected
   */
  getSimplifiedGeometryInternal(squaredTolerance) {
    const simplifiedFlatCoordinates = [];
    simplifiedFlatCoordinates.length = douglasPeucker(
      this.flatCoordinates,
      0,
      this.flatCoordinates.length,
      this.stride,
      squaredTolerance,
      simplifiedFlatCoordinates,
      0
    );
    return new LinearRing(simplifiedFlatCoordinates, 'XY');
  }

  /**
   * Get the type of this geometry.
   * @return {import("./Geometry.js").Type} Geometry type.
   * @api
   */
  getType() {
    return 'LinearRing';
  }

  /**
   * Test if the geometry and the passed extent intersect.
   * @param {import("../extent.js").Extent} extent Extent.
   * @return {boolean} `true` if the geometry and the extent intersect.
   * @api
   */
  intersectsExtent(extent) {
    return false;
  }

  /**
   * Set the coordinates of the linear ring.
   * @param {!Array<import("../coordinate.js").Coordinate>} coordinates Coordinates.
   * @param {import("./Geometry.js").GeometryLayout} [layout] Layout.
   * @api
   */
  setCoordinates(coordinates, layout) {
    this.setLayout(layout, coordinates, 1);
    if (!this.flatCoordinates) {
      this.flatCoordinates = [];
    }
    this.flatCoordinates.length = deflateCoordinates(
      this.flatCoordinates,
      0,
      coordinates,
      this.stride
    );
    this.changed();
  }
}

var LinearRing$1 = LinearRing;

/**
 * @module ol/geom/Point
 */

/**
 * @classdesc
 * Point geometry.
 *
 * @api
 */
class Point extends SimpleGeometry$1 {
  /**
   * @param {import("../coordinate.js").Coordinate} coordinates Coordinates.
   * @param {import("./Geometry.js").GeometryLayout} [layout] Layout.
   */
  constructor(coordinates, layout) {
    super();
    this.setCoordinates(coordinates, layout);
  }

  /**
   * Make a complete copy of the geometry.
   * @return {!Point} Clone.
   * @api
   */
  clone() {
    const point = new Point(this.flatCoordinates.slice(), this.layout);
    point.applyProperties(this);
    return point;
  }

  /**
   * @param {number} x X.
   * @param {number} y Y.
   * @param {import("../coordinate.js").Coordinate} closestPoint Closest point.
   * @param {number} minSquaredDistance Minimum squared distance.
   * @return {number} Minimum squared distance.
   */
  closestPointXY(x, y, closestPoint, minSquaredDistance) {
    const flatCoordinates = this.flatCoordinates;
    const squaredDistance$1 = squaredDistance(
      x,
      y,
      flatCoordinates[0],
      flatCoordinates[1]
    );
    if (squaredDistance$1 < minSquaredDistance) {
      const stride = this.stride;
      for (let i = 0; i < stride; ++i) {
        closestPoint[i] = flatCoordinates[i];
      }
      closestPoint.length = stride;
      return squaredDistance$1;
    }
    return minSquaredDistance;
  }

  /**
   * Return the coordinate of the point.
   * @return {import("../coordinate.js").Coordinate} Coordinates.
   * @api
   */
  getCoordinates() {
    return !this.flatCoordinates ? [] : this.flatCoordinates.slice();
  }

  /**
   * @param {import("../extent.js").Extent} extent Extent.
   * @protected
   * @return {import("../extent.js").Extent} extent Extent.
   */
  computeExtent(extent) {
    return createOrUpdateFromCoordinate(this.flatCoordinates, extent);
  }

  /**
   * Get the type of this geometry.
   * @return {import("./Geometry.js").Type} Geometry type.
   * @api
   */
  getType() {
    return 'Point';
  }

  /**
   * Test if the geometry and the passed extent intersect.
   * @param {import("../extent.js").Extent} extent Extent.
   * @return {boolean} `true` if the geometry and the extent intersect.
   * @api
   */
  intersectsExtent(extent) {
    return containsXY(extent, this.flatCoordinates[0], this.flatCoordinates[1]);
  }

  /**
   * @param {!Array<*>} coordinates Coordinates.
   * @param {import("./Geometry.js").GeometryLayout} [layout] Layout.
   * @api
   */
  setCoordinates(coordinates, layout) {
    this.setLayout(layout, coordinates, 0);
    if (!this.flatCoordinates) {
      this.flatCoordinates = [];
    }
    this.flatCoordinates.length = deflateCoordinate(
      this.flatCoordinates,
      0,
      coordinates,
      this.stride
    );
    this.changed();
  }
}

var Point$1 = Point;

/**
 * @module ol/geom/flat/contains
 */

/**
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @param {import("../../extent.js").Extent} extent Extent.
 * @return {boolean} Contains extent.
 */
function linearRingContainsExtent(
  flatCoordinates,
  offset,
  end,
  stride,
  extent
) {
  const outside = forEachCorner(
    extent,
    /**
     * @param {import("../../coordinate.js").Coordinate} coordinate Coordinate.
     * @return {boolean} Contains (x, y).
     */
    function (coordinate) {
      return !linearRingContainsXY(
        flatCoordinates,
        offset,
        end,
        stride,
        coordinate[0],
        coordinate[1]
      );
    }
  );
  return !outside;
}

/**
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @param {number} x X.
 * @param {number} y Y.
 * @return {boolean} Contains (x, y).
 */
function linearRingContainsXY(
  flatCoordinates,
  offset,
  end,
  stride,
  x,
  y
) {
  // https://geomalgorithms.com/a03-_inclusion.html
  // Copyright 2000 softSurfer, 2012 Dan Sunday
  // This code may be freely used and modified for any purpose
  // providing that this copyright notice is included with it.
  // SoftSurfer makes no warranty for this code, and cannot be held
  // liable for any real or imagined damage resulting from its use.
  // Users of this code must verify correctness for their application.
  let wn = 0;
  let x1 = flatCoordinates[end - stride];
  let y1 = flatCoordinates[end - stride + 1];
  for (; offset < end; offset += stride) {
    const x2 = flatCoordinates[offset];
    const y2 = flatCoordinates[offset + 1];
    if (y1 <= y) {
      if (y2 > y && (x2 - x1) * (y - y1) - (x - x1) * (y2 - y1) > 0) {
        wn++;
      }
    } else if (y2 <= y && (x2 - x1) * (y - y1) - (x - x1) * (y2 - y1) < 0) {
      wn--;
    }
    x1 = x2;
    y1 = y2;
  }
  return wn !== 0;
}

/**
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {Array<number>} ends Ends.
 * @param {number} stride Stride.
 * @param {number} x X.
 * @param {number} y Y.
 * @return {boolean} Contains (x, y).
 */
function linearRingsContainsXY(
  flatCoordinates,
  offset,
  ends,
  stride,
  x,
  y
) {
  if (ends.length === 0) {
    return false;
  }
  if (!linearRingContainsXY(flatCoordinates, offset, ends[0], stride, x, y)) {
    return false;
  }
  for (let i = 1, ii = ends.length; i < ii; ++i) {
    if (
      linearRingContainsXY(flatCoordinates, ends[i - 1], ends[i], stride, x, y)
    ) {
      return false;
    }
  }
  return true;
}

/**
 * @module ol/geom/flat/interiorpoint
 */

/**
 * Calculates a point that is likely to lie in the interior of the linear rings.
 * Inspired by JTS's com.vividsolutions.jts.geom.Geometry#getInteriorPoint.
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {Array<number>} ends Ends.
 * @param {number} stride Stride.
 * @param {Array<number>} flatCenters Flat centers.
 * @param {number} flatCentersOffset Flat center offset.
 * @param {Array<number>} [dest] Destination.
 * @return {Array<number>} Destination point as XYM coordinate, where M is the
 * length of the horizontal intersection that the point belongs to.
 */
function getInteriorPointOfArray(
  flatCoordinates,
  offset,
  ends,
  stride,
  flatCenters,
  flatCentersOffset,
  dest
) {
  let i, ii, x, x1, x2, y1, y2;
  const y = flatCenters[flatCentersOffset + 1];
  /** @type {Array<number>} */
  const intersections = [];
  // Calculate intersections with the horizontal line
  for (let r = 0, rr = ends.length; r < rr; ++r) {
    const end = ends[r];
    x1 = flatCoordinates[end - stride];
    y1 = flatCoordinates[end - stride + 1];
    for (i = offset; i < end; i += stride) {
      x2 = flatCoordinates[i];
      y2 = flatCoordinates[i + 1];
      if ((y <= y1 && y2 <= y) || (y1 <= y && y <= y2)) {
        x = ((y - y1) / (y2 - y1)) * (x2 - x1) + x1;
        intersections.push(x);
      }
      x1 = x2;
      y1 = y2;
    }
  }
  // Find the longest segment of the horizontal line that has its center point
  // inside the linear ring.
  let pointX = NaN;
  let maxSegmentLength = -Infinity;
  intersections.sort(ascending);
  x1 = intersections[0];
  for (i = 1, ii = intersections.length; i < ii; ++i) {
    x2 = intersections[i];
    const segmentLength = Math.abs(x2 - x1);
    if (segmentLength > maxSegmentLength) {
      x = (x1 + x2) / 2;
      if (linearRingsContainsXY(flatCoordinates, offset, ends, stride, x, y)) {
        pointX = x;
        maxSegmentLength = segmentLength;
      }
    }
    x1 = x2;
  }
  if (isNaN(pointX)) {
    // There is no horizontal line that has its center point inside the linear
    // ring.  Use the center of the the linear ring's extent.
    pointX = flatCenters[flatCentersOffset];
  }
  if (dest) {
    dest.push(pointX, y, maxSegmentLength);
    return dest;
  }
  return [pointX, y, maxSegmentLength];
}

/**
 * @module ol/geom/flat/segments
 */

/**
 * This function calls `callback` for each segment of the flat coordinates
 * array. If the callback returns a truthy value the function returns that
 * value immediately. Otherwise the function returns `false`.
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @param {function(import("../../coordinate.js").Coordinate, import("../../coordinate.js").Coordinate): T} callback Function
 *     called for each segment.
 * @return {T|boolean} Value.
 * @template T
 */
function forEach(flatCoordinates, offset, end, stride, callback) {
  let ret;
  offset += stride;
  for (; offset < end; offset += stride) {
    ret = callback(
      flatCoordinates.slice(offset - stride, offset),
      flatCoordinates.slice(offset, offset + stride)
    );
    if (ret) {
      return ret;
    }
  }
  return false;
}

/**
 * @module ol/geom/flat/intersectsextent
 */

/**
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @param {import("../../extent.js").Extent} extent Extent.
 * @return {boolean} True if the geometry and the extent intersect.
 */
function intersectsLineString(
  flatCoordinates,
  offset,
  end,
  stride,
  extent
) {
  const coordinatesExtent = extendFlatCoordinates(
    createEmpty(),
    flatCoordinates,
    offset,
    end,
    stride
  );
  if (!intersects(extent, coordinatesExtent)) {
    return false;
  }
  if (containsExtent(extent, coordinatesExtent)) {
    return true;
  }
  if (coordinatesExtent[0] >= extent[0] && coordinatesExtent[2] <= extent[2]) {
    return true;
  }
  if (coordinatesExtent[1] >= extent[1] && coordinatesExtent[3] <= extent[3]) {
    return true;
  }
  return forEach(
    flatCoordinates,
    offset,
    end,
    stride,
    /**
     * @param {import("../../coordinate.js").Coordinate} point1 Start point.
     * @param {import("../../coordinate.js").Coordinate} point2 End point.
     * @return {boolean} `true` if the segment and the extent intersect,
     *     `false` otherwise.
     */
    function (point1, point2) {
      return intersectsSegment(extent, point1, point2);
    }
  );
}

/**
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @param {import("../../extent.js").Extent} extent Extent.
 * @return {boolean} True if the geometry and the extent intersect.
 */
function intersectsLinearRing(
  flatCoordinates,
  offset,
  end,
  stride,
  extent
) {
  if (intersectsLineString(flatCoordinates, offset, end, stride, extent)) {
    return true;
  }
  if (
    linearRingContainsXY(
      flatCoordinates,
      offset,
      end,
      stride,
      extent[0],
      extent[1]
    )
  ) {
    return true;
  }
  if (
    linearRingContainsXY(
      flatCoordinates,
      offset,
      end,
      stride,
      extent[0],
      extent[3]
    )
  ) {
    return true;
  }
  if (
    linearRingContainsXY(
      flatCoordinates,
      offset,
      end,
      stride,
      extent[2],
      extent[1]
    )
  ) {
    return true;
  }
  if (
    linearRingContainsXY(
      flatCoordinates,
      offset,
      end,
      stride,
      extent[2],
      extent[3]
    )
  ) {
    return true;
  }
  return false;
}

/**
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {Array<number>} ends Ends.
 * @param {number} stride Stride.
 * @param {import("../../extent.js").Extent} extent Extent.
 * @return {boolean} True if the geometry and the extent intersect.
 */
function intersectsLinearRingArray(
  flatCoordinates,
  offset,
  ends,
  stride,
  extent
) {
  if (!intersectsLinearRing(flatCoordinates, offset, ends[0], stride, extent)) {
    return false;
  }
  if (ends.length === 1) {
    return true;
  }
  for (let i = 1, ii = ends.length; i < ii; ++i) {
    if (
      linearRingContainsExtent(
        flatCoordinates,
        ends[i - 1],
        ends[i],
        stride,
        extent
      )
    ) {
      if (
        !intersectsLineString(
          flatCoordinates,
          ends[i - 1],
          ends[i],
          stride,
          extent
        )
      ) {
        return false;
      }
    }
  }
  return true;
}

/**
 * @module ol/geom/flat/reverse
 */

/**
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 */
function coordinates(flatCoordinates, offset, end, stride) {
  while (offset < end - stride) {
    for (let i = 0; i < stride; ++i) {
      const tmp = flatCoordinates[offset + i];
      flatCoordinates[offset + i] = flatCoordinates[end - stride + i];
      flatCoordinates[end - stride + i] = tmp;
    }
    offset += stride;
    end -= stride;
  }
}

/**
 * @module ol/geom/flat/orient
 */

/**
 * Is the linear ring oriented clockwise in a coordinate system with a bottom-left
 * coordinate origin? For a coordinate system with a top-left coordinate origin,
 * the ring's orientation is clockwise when this function returns false.
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @return {boolean} Is clockwise.
 */
function linearRingIsClockwise(flatCoordinates, offset, end, stride) {
  // https://stackoverflow.com/q/1165647/clockwise-method#1165943
  // https://github.com/OSGeo/gdal/blob/master/gdal/ogr/ogrlinearring.cpp
  let edge = 0;
  let x1 = flatCoordinates[end - stride];
  let y1 = flatCoordinates[end - stride + 1];
  for (; offset < end; offset += stride) {
    const x2 = flatCoordinates[offset];
    const y2 = flatCoordinates[offset + 1];
    edge += (x2 - x1) * (y2 + y1);
    x1 = x2;
    y1 = y2;
  }
  return edge === 0 ? undefined : edge > 0;
}

/**
 * Determines if linear rings are oriented.  By default, left-hand orientation
 * is tested (first ring must be clockwise, remaining rings counter-clockwise).
 * To test for right-hand orientation, use the `right` argument.
 *
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {Array<number>} ends Array of end indexes.
 * @param {number} stride Stride.
 * @param {boolean} [right] Test for right-hand orientation
 *     (counter-clockwise exterior ring and clockwise interior rings).
 * @return {boolean} Rings are correctly oriented.
 */
function linearRingsAreOriented(
  flatCoordinates,
  offset,
  ends,
  stride,
  right
) {
  right = right !== undefined ? right : false;
  for (let i = 0, ii = ends.length; i < ii; ++i) {
    const end = ends[i];
    const isClockwise = linearRingIsClockwise(
      flatCoordinates,
      offset,
      end,
      stride
    );
    if (i === 0) {
      if ((right && isClockwise) || (!right && !isClockwise)) {
        return false;
      }
    } else {
      if ((right && !isClockwise) || (!right && isClockwise)) {
        return false;
      }
    }
    offset = end;
  }
  return true;
}

/**
 * Orient coordinates in a flat array of linear rings.  By default, rings
 * are oriented following the left-hand rule (clockwise for exterior and
 * counter-clockwise for interior rings).  To orient according to the
 * right-hand rule, use the `right` argument.
 *
 * @param {Array<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {Array<number>} ends Ends.
 * @param {number} stride Stride.
 * @param {boolean} [right] Follow the right-hand rule for orientation.
 * @return {number} End.
 */
function orientLinearRings(
  flatCoordinates,
  offset,
  ends,
  stride,
  right
) {
  right = right !== undefined ? right : false;
  for (let i = 0, ii = ends.length; i < ii; ++i) {
    const end = ends[i];
    const isClockwise = linearRingIsClockwise(
      flatCoordinates,
      offset,
      end,
      stride
    );
    const reverse =
      i === 0
        ? (right && isClockwise) || (!right && !isClockwise)
        : (right && !isClockwise) || (!right && isClockwise);
    if (reverse) {
      coordinates(flatCoordinates, offset, end, stride);
    }
    offset = end;
  }
  return offset;
}

/**
 * @module ol/geom/Polygon
 */

/**
 * @classdesc
 * Polygon geometry.
 *
 * @api
 */
class Polygon extends SimpleGeometry$1 {
  /**
   * @param {!Array<Array<import("../coordinate.js").Coordinate>>|!Array<number>} coordinates
   *     Array of linear rings that define the polygon. The first linear ring of the
   *     array defines the outer-boundary or surface of the polygon. Each subsequent
   *     linear ring defines a hole in the surface of the polygon. A linear ring is
   *     an array of vertices' coordinates where the first coordinate and the last are
   *     equivalent. (For internal use, flat coordinates in combination with
   *     `layout` and `ends` are also accepted.)
   * @param {import("./Geometry.js").GeometryLayout} [layout] Layout.
   * @param {Array<number>} [ends] Ends (for internal use with flat coordinates).
   */
  constructor(coordinates, layout, ends) {
    super();

    /**
     * @type {Array<number>}
     * @private
     */
    this.ends_ = [];

    /**
     * @private
     * @type {number}
     */
    this.flatInteriorPointRevision_ = -1;

    /**
     * @private
     * @type {import("../coordinate.js").Coordinate}
     */
    this.flatInteriorPoint_ = null;

    /**
     * @private
     * @type {number}
     */
    this.maxDelta_ = -1;

    /**
     * @private
     * @type {number}
     */
    this.maxDeltaRevision_ = -1;

    /**
     * @private
     * @type {number}
     */
    this.orientedRevision_ = -1;

    /**
     * @private
     * @type {Array<number>}
     */
    this.orientedFlatCoordinates_ = null;

    if (layout !== undefined && ends) {
      this.setFlatCoordinates(
        layout,
        /** @type {Array<number>} */ (coordinates)
      );
      this.ends_ = ends;
    } else {
      this.setCoordinates(
        /** @type {Array<Array<import("../coordinate.js").Coordinate>>} */ (
          coordinates
        ),
        layout
      );
    }
  }

  /**
   * Append the passed linear ring to this polygon.
   * @param {LinearRing} linearRing Linear ring.
   * @api
   */
  appendLinearRing(linearRing) {
    if (!this.flatCoordinates) {
      this.flatCoordinates = linearRing.getFlatCoordinates().slice();
    } else {
      extend$1(this.flatCoordinates, linearRing.getFlatCoordinates());
    }
    this.ends_.push(this.flatCoordinates.length);
    this.changed();
  }

  /**
   * Make a complete copy of the geometry.
   * @return {!Polygon} Clone.
   * @api
   */
  clone() {
    const polygon = new Polygon(
      this.flatCoordinates.slice(),
      this.layout,
      this.ends_.slice()
    );
    polygon.applyProperties(this);
    return polygon;
  }

  /**
   * @param {number} x X.
   * @param {number} y Y.
   * @param {import("../coordinate.js").Coordinate} closestPoint Closest point.
   * @param {number} minSquaredDistance Minimum squared distance.
   * @return {number} Minimum squared distance.
   */
  closestPointXY(x, y, closestPoint, minSquaredDistance) {
    if (minSquaredDistance < closestSquaredDistanceXY(this.getExtent(), x, y)) {
      return minSquaredDistance;
    }
    if (this.maxDeltaRevision_ != this.getRevision()) {
      this.maxDelta_ = Math.sqrt(
        arrayMaxSquaredDelta(
          this.flatCoordinates,
          0,
          this.ends_,
          this.stride,
          0
        )
      );
      this.maxDeltaRevision_ = this.getRevision();
    }
    return assignClosestArrayPoint(
      this.flatCoordinates,
      0,
      this.ends_,
      this.stride,
      this.maxDelta_,
      true,
      x,
      y,
      closestPoint,
      minSquaredDistance
    );
  }

  /**
   * @param {number} x X.
   * @param {number} y Y.
   * @return {boolean} Contains (x, y).
   */
  containsXY(x, y) {
    return linearRingsContainsXY(
      this.getOrientedFlatCoordinates(),
      0,
      this.ends_,
      this.stride,
      x,
      y
    );
  }

  /**
   * Return the area of the polygon on projected plane.
   * @return {number} Area (on projected plane).
   * @api
   */
  getArea() {
    return linearRings(
      this.getOrientedFlatCoordinates(),
      0,
      this.ends_,
      this.stride
    );
  }

  /**
   * Get the coordinate array for this geometry.  This array has the structure
   * of a GeoJSON coordinate array for polygons.
   *
   * @param {boolean} [right] Orient coordinates according to the right-hand
   *     rule (counter-clockwise for exterior and clockwise for interior rings).
   *     If `false`, coordinates will be oriented according to the left-hand rule
   *     (clockwise for exterior and counter-clockwise for interior rings).
   *     By default, coordinate orientation will depend on how the geometry was
   *     constructed.
   * @return {Array<Array<import("../coordinate.js").Coordinate>>} Coordinates.
   * @api
   */
  getCoordinates(right) {
    let flatCoordinates;
    if (right !== undefined) {
      flatCoordinates = this.getOrientedFlatCoordinates().slice();
      orientLinearRings(flatCoordinates, 0, this.ends_, this.stride, right);
    } else {
      flatCoordinates = this.flatCoordinates;
    }

    return inflateCoordinatesArray(flatCoordinates, 0, this.ends_, this.stride);
  }

  /**
   * @return {Array<number>} Ends.
   */
  getEnds() {
    return this.ends_;
  }

  /**
   * @return {Array<number>} Interior point.
   */
  getFlatInteriorPoint() {
    if (this.flatInteriorPointRevision_ != this.getRevision()) {
      const flatCenter = getCenter(this.getExtent());
      this.flatInteriorPoint_ = getInteriorPointOfArray(
        this.getOrientedFlatCoordinates(),
        0,
        this.ends_,
        this.stride,
        flatCenter,
        0
      );
      this.flatInteriorPointRevision_ = this.getRevision();
    }
    return this.flatInteriorPoint_;
  }

  /**
   * Return an interior point of the polygon.
   * @return {Point} Interior point as XYM coordinate, where M is the
   * length of the horizontal intersection that the point belongs to.
   * @api
   */
  getInteriorPoint() {
    return new Point$1(this.getFlatInteriorPoint(), 'XYM');
  }

  /**
   * Return the number of rings of the polygon,  this includes the exterior
   * ring and any interior rings.
   *
   * @return {number} Number of rings.
   * @api
   */
  getLinearRingCount() {
    return this.ends_.length;
  }

  /**
   * Return the Nth linear ring of the polygon geometry. Return `null` if the
   * given index is out of range.
   * The exterior linear ring is available at index `0` and the interior rings
   * at index `1` and beyond.
   *
   * @param {number} index Index.
   * @return {LinearRing|null} Linear ring.
   * @api
   */
  getLinearRing(index) {
    if (index < 0 || this.ends_.length <= index) {
      return null;
    }
    return new LinearRing$1(
      this.flatCoordinates.slice(
        index === 0 ? 0 : this.ends_[index - 1],
        this.ends_[index]
      ),
      this.layout
    );
  }

  /**
   * Return the linear rings of the polygon.
   * @return {Array<LinearRing>} Linear rings.
   * @api
   */
  getLinearRings() {
    const layout = this.layout;
    const flatCoordinates = this.flatCoordinates;
    const ends = this.ends_;
    const linearRings = [];
    let offset = 0;
    for (let i = 0, ii = ends.length; i < ii; ++i) {
      const end = ends[i];
      const linearRing = new LinearRing$1(
        flatCoordinates.slice(offset, end),
        layout
      );
      linearRings.push(linearRing);
      offset = end;
    }
    return linearRings;
  }

  /**
   * @return {Array<number>} Oriented flat coordinates.
   */
  getOrientedFlatCoordinates() {
    if (this.orientedRevision_ != this.getRevision()) {
      const flatCoordinates = this.flatCoordinates;
      if (linearRingsAreOriented(flatCoordinates, 0, this.ends_, this.stride)) {
        this.orientedFlatCoordinates_ = flatCoordinates;
      } else {
        this.orientedFlatCoordinates_ = flatCoordinates.slice();
        this.orientedFlatCoordinates_.length = orientLinearRings(
          this.orientedFlatCoordinates_,
          0,
          this.ends_,
          this.stride
        );
      }
      this.orientedRevision_ = this.getRevision();
    }
    return this.orientedFlatCoordinates_;
  }

  /**
   * @param {number} squaredTolerance Squared tolerance.
   * @return {Polygon} Simplified Polygon.
   * @protected
   */
  getSimplifiedGeometryInternal(squaredTolerance) {
    const simplifiedFlatCoordinates = [];
    const simplifiedEnds = [];
    simplifiedFlatCoordinates.length = quantizeArray(
      this.flatCoordinates,
      0,
      this.ends_,
      this.stride,
      Math.sqrt(squaredTolerance),
      simplifiedFlatCoordinates,
      0,
      simplifiedEnds
    );
    return new Polygon(simplifiedFlatCoordinates, 'XY', simplifiedEnds);
  }

  /**
   * Get the type of this geometry.
   * @return {import("./Geometry.js").Type} Geometry type.
   * @api
   */
  getType() {
    return 'Polygon';
  }

  /**
   * Test if the geometry and the passed extent intersect.
   * @param {import("../extent.js").Extent} extent Extent.
   * @return {boolean} `true` if the geometry and the extent intersect.
   * @api
   */
  intersectsExtent(extent) {
    return intersectsLinearRingArray(
      this.getOrientedFlatCoordinates(),
      0,
      this.ends_,
      this.stride,
      extent
    );
  }

  /**
   * Set the coordinates of the polygon.
   * @param {!Array<Array<import("../coordinate.js").Coordinate>>} coordinates Coordinates.
   * @param {import("./Geometry.js").GeometryLayout} [layout] Layout.
   * @api
   */
  setCoordinates(coordinates, layout) {
    this.setLayout(layout, coordinates, 2);
    if (!this.flatCoordinates) {
      this.flatCoordinates = [];
    }
    const ends = deflateCoordinatesArray(
      this.flatCoordinates,
      0,
      coordinates,
      this.stride,
      this.ends_
    );
    this.flatCoordinates.length = ends.length === 0 ? 0 : ends[ends.length - 1];
    this.changed();
  }
}

/**
 * Create a polygon from an extent. The layout used is `XY`.
 * @param {import("../extent.js").Extent} extent The extent.
 * @return {Polygon} The polygon.
 * @api
 */
function fromExtent(extent) {
  const minX = extent[0];
  const minY = extent[1];
  const maxX = extent[2];
  const maxY = extent[3];
  const flatCoordinates = [
    minX,
    minY,
    minX,
    maxY,
    maxX,
    maxY,
    maxX,
    minY,
    minX,
    minY,
  ];
  return new Polygon(flatCoordinates, 'XY', [flatCoordinates.length]);
}

/**
 * @module ol/View
 */

/**
 * An animation configuration
 *
 * @typedef {Object} Animation
 * @property {import("./coordinate.js").Coordinate} [sourceCenter] Source center.
 * @property {import("./coordinate.js").Coordinate} [targetCenter] Target center.
 * @property {number} [sourceResolution] Source resolution.
 * @property {number} [targetResolution] Target resolution.
 * @property {number} [sourceRotation] Source rotation.
 * @property {number} [targetRotation] Target rotation.
 * @property {import("./coordinate.js").Coordinate} [anchor] Anchor.
 * @property {number} start Start.
 * @property {number} duration Duration.
 * @property {boolean} complete Complete.
 * @property {function(number):number} easing Easing.
 * @property {function(boolean):void} callback Callback.
 */

/**
 * @typedef {Object} Constraints
 * @property {import("./centerconstraint.js").Type} center Center.
 * @property {import("./resolutionconstraint.js").Type} resolution Resolution.
 * @property {import("./rotationconstraint.js").Type} rotation Rotation.
 */

/**
 * @typedef {Object} FitOptions
 * @property {import("./size.js").Size} [size] The size in pixels of the box to fit
 * the extent into. Default is the current size of the first map in the DOM that
 * uses this view, or `[100, 100]` if no such map is found.
 * @property {!Array<number>} [padding=[0, 0, 0, 0]] Padding (in pixels) to be
 * cleared inside the view. Values in the array are top, right, bottom and left
 * padding.
 * @property {boolean} [nearest=false] If the view `constrainResolution` option is `true`,
 * get the nearest extent instead of the closest that actually fits the view.
 * @property {number} [minResolution=0] Minimum resolution that we zoom to.
 * @property {number} [maxZoom] Maximum zoom level that we zoom to. If
 * `minResolution` is given, this property is ignored.
 * @property {number} [duration] The duration of the animation in milliseconds.
 * By default, there is no animation to the target extent.
 * @property {function(number):number} [easing] The easing function used during
 * the animation (defaults to {@link module:ol/easing.inAndOut}).
 * The function will be called for each frame with a number representing a
 * fraction of the animation's duration.  The function should return a number
 * between 0 and 1 representing the progress toward the destination state.
 * @property {function(boolean):void} [callback] Function called when the view is in
 * its final position. The callback will be called with `true` if the animation
 * series completed on its own or `false` if it was cancelled.
 */

/**
 * @typedef {Object} ViewOptions
 * @property {import("./coordinate.js").Coordinate} [center] The initial center for
 * the view. If a user projection is not set, the coordinate system for the center is
 * specified with the `projection` option. Layer sources will not be fetched if this
 * is not set, but the center can be set later with {@link #setCenter}.
 * @property {boolean|number} [constrainRotation=true] Rotation constraint.
 * `false` means no constraint. `true` means no constraint, but snap to zero
 * near zero. A number constrains the rotation to that number of values. For
 * example, `4` will constrain the rotation to 0, 90, 180, and 270 degrees.
 * @property {boolean} [enableRotation=true] Enable rotation.
 * If `false`, a rotation constraint that always sets the rotation to zero is
 * used. The `constrainRotation` option has no effect if `enableRotation` is
 * `false`.
 * @property {import("./extent.js").Extent} [extent] The extent that constrains the
 * view, in other words, nothing outside of this extent can be visible on the map.
 * @property {boolean} [constrainOnlyCenter=false] If true, the extent
 * constraint will only apply to the view center and not the whole extent.
 * @property {boolean} [smoothExtentConstraint=true] If true, the extent
 * constraint will be applied smoothly, i.e. allow the view to go slightly outside
 * of the given `extent`.
 * @property {number} [maxResolution] The maximum resolution used to determine
 * the resolution constraint. It is used together with `minResolution` (or
 * `maxZoom`) and `zoomFactor`. If unspecified it is calculated in such a way
 * that the projection's validity extent fits in a 256x256 px tile. If the
 * projection is Spherical Mercator (the default) then `maxResolution` defaults
 * to `40075016.68557849 / 256 = 156543.03392804097`.
 * @property {number} [minResolution] The minimum resolution used to determine
 * the resolution constraint.  It is used together with `maxResolution` (or
 * `minZoom`) and `zoomFactor`.  If unspecified it is calculated assuming 29
 * zoom levels (with a factor of 2). If the projection is Spherical Mercator
 * (the default) then `minResolution` defaults to
 * `40075016.68557849 / 256 / Math.pow(2, 28) = 0.0005831682455839253`.
 * @property {number} [maxZoom=28] The maximum zoom level used to determine the
 * resolution constraint. It is used together with `minZoom` (or
 * `maxResolution`) and `zoomFactor`.  Note that if `minResolution` is also
 * provided, it is given precedence over `maxZoom`.
 * @property {number} [minZoom=0] The minimum zoom level used to determine the
 * resolution constraint. It is used together with `maxZoom` (or
 * `minResolution`) and `zoomFactor`.  Note that if `maxResolution` is also
 * provided, it is given precedence over `minZoom`.
 * @property {boolean} [multiWorld=false] If `false` the view is constrained so
 * only one world is visible, and you cannot pan off the edge.  If `true` the map
 * may show multiple worlds at low zoom levels.  Only used if the `projection` is
 * global.  Note that if `extent` is also provided it is given precedence.
 * @property {boolean} [constrainResolution=false] If true, the view will always
 * animate to the closest zoom level after an interaction; false means
 * intermediary zoom levels are allowed.
 * @property {boolean} [smoothResolutionConstraint=true] If true, the resolution
 * min/max values will be applied smoothly, i. e. allow the view to exceed slightly
 * the given resolution or zoom bounds.
 * @property {boolean} [showFullExtent=false] Allow the view to be zoomed out to
 * show the full configured extent. By default, when a view is configured with an
 * extent, users will not be able to zoom out so the viewport exceeds the extent in
 * either dimension. This means the full extent may not be visible if the viewport
 * is taller or wider than the aspect ratio of the configured extent. If
 * showFullExtent is true, the user will be able to zoom out so that the viewport
 * exceeds the height or width of the configured extent, but not both, allowing the
 * full extent to be shown.
 * @property {import("./proj.js").ProjectionLike} [projection='EPSG:3857'] The
 * projection. The default is Spherical Mercator.
 * @property {number} [resolution] The initial resolution for the view. The
 * units are `projection` units per pixel (e.g. meters per pixel). An
 * alternative to setting this is to set `zoom`. Layer sources will not be
 * fetched if neither this nor `zoom` are defined, but they can be set later
 * with {@link #setZoom} or {@link #setResolution}.
 * @property {Array<number>} [resolutions] Resolutions that determine the
 * zoom levels if specified. The index in the array corresponds to the zoom level,
 * therefore the resolution values have to be in descending order. It also constrains
 * the resolution by the minimum and maximum value. If set the `maxResolution`,
 * `minResolution`, `minZoom`, `maxZoom`, and `zoomFactor` options are ignored.
 * @property {number} [rotation=0] The initial rotation for the view in radians
 * (positive rotation clockwise, 0 means North).
 * @property {number} [zoom] Only used if `resolution` is not defined. Zoom
 * level used to calculate the initial resolution for the view.
 * @property {number} [zoomFactor=2] The zoom factor used to compute the
 * corresponding resolution.
 * @property {!Array<number>} [padding=[0, 0, 0, 0]] Padding (in css pixels).
 * If the map viewport is partially covered with other content (overlays) along
 * its edges, this setting allows to shift the center of the viewport away from
 * that content. The order of the values is top, right, bottom, left.
 */

/**
 * @typedef {Object} AnimationOptions
 * @property {import("./coordinate.js").Coordinate} [center] The center of the view at the end of
 * the animation.
 * @property {number} [zoom] The zoom level of the view at the end of the
 * animation. This takes precedence over `resolution`.
 * @property {number} [resolution] The resolution of the view at the end
 * of the animation.  If `zoom` is also provided, this option will be ignored.
 * @property {number} [rotation] The rotation of the view at the end of
 * the animation.
 * @property {import("./coordinate.js").Coordinate} [anchor] Optional anchor to remain fixed
 * during a rotation or resolution animation.
 * @property {number} [duration=1000] The duration of the animation in milliseconds.
 * @property {function(number):number} [easing] The easing function used
 * during the animation (defaults to {@link module:ol/easing.inAndOut}).
 * The function will be called for each frame with a number representing a
 * fraction of the animation's duration.  The function should return a number
 * between 0 and 1 representing the progress toward the destination state.
 */

/**
 * @typedef {Object} State
 * @property {import("./coordinate.js").Coordinate} center Center.
 * @property {import("./proj/Projection.js").default} projection Projection.
 * @property {number} resolution Resolution.
 * @property {import("./coordinate.js").Coordinate} [nextCenter] The next center during an animation series.
 * @property {number} [nextResolution] The next resolution during an animation series.
 * @property {number} [nextRotation] The next rotation during an animation series.
 * @property {number} rotation Rotation.
 * @property {number} zoom Zoom.
 */

/**
 * Default min zoom level for the map view.
 * @type {number}
 */
const DEFAULT_MIN_ZOOM = 0;

/**
 * @typedef {import("./ObjectEventType").Types|'change:center'|'change:resolution'|'change:rotation'} ViewObjectEventTypes
 */

/***
 * @template Return
 * @typedef {import("./Observable").OnSignature<import("./Observable").EventTypes, import("./events/Event.js").default, Return> &
 *   import("./Observable").OnSignature<ViewObjectEventTypes, import("./Object").ObjectEvent, Return> &
 *   import("./Observable").CombinedOnSignature<import("./Observable").EventTypes|ViewObjectEventTypes, Return>} ViewOnSignature
 */

/**
 * @classdesc
 * A View object represents a simple 2D view of the map.
 *
 * This is the object to act upon to change the center, resolution,
 * and rotation of the map.
 *
 * A View has a `projection`. The projection determines the
 * coordinate system of the center, and its units determine the units of the
 * resolution (projection units per pixel). The default projection is
 * Web Mercator (EPSG:3857).
 *
 * ### The view states
 *
 * A View is determined by three states: `center`, `resolution`,
 * and `rotation`. Each state has a corresponding getter and setter, e.g.
 * `getCenter` and `setCenter` for the `center` state.
 *
 * The `zoom` state is actually not saved on the view: all computations
 * internally use the `resolution` state. Still, the `setZoom` and `getZoom`
 * methods are available, as well as `getResolutionForZoom` and
 * `getZoomForResolution` to switch from one system to the other.
 *
 * ### The constraints
 *
 * `setCenter`, `setResolution` and `setRotation` can be used to change the
 * states of the view, but any constraint defined in the constructor will
 * be applied along the way.
 *
 * A View object can have a *resolution constraint*, a *rotation constraint*
 * and a *center constraint*.
 *
 * The *resolution constraint* typically restricts min/max values and
 * snaps to specific resolutions. It is determined by the following
 * options: `resolutions`, `maxResolution`, `maxZoom` and `zoomFactor`.
 * If `resolutions` is set, the other three options are ignored. See
 * documentation for each option for more information. By default, the view
 * only has a min/max restriction and allow intermediary zoom levels when
 * pinch-zooming for example.
 *
 * The *rotation constraint* snaps to specific angles. It is determined
 * by the following options: `enableRotation` and `constrainRotation`.
 * By default rotation is allowed and its value is snapped to zero when approaching the
 * horizontal.
 *
 * The *center constraint* is determined by the `extent` option. By
 * default the view center is not constrained at all.
 *
 * ### Changing the view state
 *
 * It is important to note that `setZoom`, `setResolution`, `setCenter` and
 * `setRotation` are subject to the above mentioned constraints. As such, it
 * may sometimes not be possible to know in advance the resulting state of the
 * View. For example, calling `setResolution(10)` does not guarantee that
 * `getResolution()` will return `10`.
 *
 * A consequence of this is that, when applying a delta on the view state, one
 * should use `adjustCenter`, `adjustRotation`, `adjustZoom` and `adjustResolution`
 * rather than the corresponding setters. This will let view do its internal
 * computations. Besides, the `adjust*` methods also take an `anchor`
 * argument which allows specifying an origin for the transformation.
 *
 * ### Interacting with the view
 *
 * View constraints are usually only applied when the view is *at rest*, meaning that
 * no interaction or animation is ongoing. As such, if the user puts the view in a
 * state that is not equivalent to a constrained one (e.g. rotating the view when
 * the snap angle is 0), an animation will be triggered at the interaction end to
 * put back the view to a stable state;
 *
 * @api
 */
class View extends BaseObject$1 {
  /**
   * @param {ViewOptions} [options] View options.
   */
  constructor(options) {
    super();

    /***
     * @type {ViewOnSignature<import("./events").EventsKey>}
     */
    this.on;

    /***
     * @type {ViewOnSignature<import("./events").EventsKey>}
     */
    this.once;

    /***
     * @type {ViewOnSignature<void>}
     */
    this.un;

    options = Object.assign({}, options);

    /**
     * @private
     * @type {Array<number>}
     */
    this.hints_ = [0, 0];

    /**
     * @private
     * @type {Array<Array<Animation>>}
     */
    this.animations_ = [];

    /**
     * @private
     * @type {number|undefined}
     */
    this.updateAnimationKey_;

    /**
     * @private
     * @const
     * @type {import("./proj/Projection.js").default}
     */
    this.projection_ = createProjection(options.projection, 'EPSG:3857');

    /**
     * @private
     * @type {import("./size.js").Size}
     */
    this.viewportSize_ = [100, 100];

    /**
     * @private
     * @type {import("./coordinate.js").Coordinate|undefined}
     */
    this.targetCenter_ = null;

    /**
     * @private
     * @type {number|undefined}
     */
    this.targetResolution_;

    /**
     * @private
     * @type {number|undefined}
     */
    this.targetRotation_;

    /**
     * @private
     * @type {import("./coordinate.js").Coordinate}
     */
    this.nextCenter_ = null;

    /**
     * @private
     * @type {number}
     */
    this.nextResolution_;

    /**
     * @private
     * @type {number}
     */
    this.nextRotation_;

    /**
     * @private
     * @type {import("./coordinate.js").Coordinate|undefined}
     */
    this.cancelAnchor_ = undefined;

    if (options.projection) {
      disableCoordinateWarning();
    }
    if (options.center) {
      options.center = fromUserCoordinate(options.center, this.projection_);
    }
    if (options.extent) {
      options.extent = fromUserExtent(options.extent, this.projection_);
    }

    this.applyOptions_(options);
  }

  /**
   * Set up the view with the given options.
   * @param {ViewOptions} options View options.
   */
  applyOptions_(options) {
    const properties = Object.assign({}, options);
    for (const key in ViewProperty) {
      delete properties[key];
    }
    this.setProperties(properties, true);

    const resolutionConstraintInfo = createResolutionConstraint(options);

    /**
     * @private
     * @type {number}
     */
    this.maxResolution_ = resolutionConstraintInfo.maxResolution;

    /**
     * @private
     * @type {number}
     */
    this.minResolution_ = resolutionConstraintInfo.minResolution;

    /**
     * @private
     * @type {number}
     */
    this.zoomFactor_ = resolutionConstraintInfo.zoomFactor;

    /**
     * @private
     * @type {Array<number>|undefined}
     */
    this.resolutions_ = options.resolutions;

    /**
     * @type {Array<number>|undefined}
     * @private
     */
    this.padding_ = options.padding;

    /**
     * @private
     * @type {number}
     */
    this.minZoom_ = resolutionConstraintInfo.minZoom;

    const centerConstraint = createCenterConstraint(options);
    const resolutionConstraint = resolutionConstraintInfo.constraint;
    const rotationConstraint = createRotationConstraint(options);

    /**
     * @private
     * @type {Constraints}
     */
    this.constraints_ = {
      center: centerConstraint,
      resolution: resolutionConstraint,
      rotation: rotationConstraint,
    };

    this.setRotation(options.rotation !== undefined ? options.rotation : 0);
    this.setCenterInternal(
      options.center !== undefined ? options.center : null
    );
    if (options.resolution !== undefined) {
      this.setResolution(options.resolution);
    } else if (options.zoom !== undefined) {
      this.setZoom(options.zoom);
    }
  }

  /**
   * Padding (in css pixels).
   * If the map viewport is partially covered with other content (overlays) along
   * its edges, this setting allows to shift the center of the viewport away from that
   * content. The order of the values in the array is top, right, bottom, left.
   * The default is no padding, which is equivalent to `[0, 0, 0, 0]`.
   * @type {Array<number>|undefined}
   * @api
   */
  get padding() {
    return this.padding_;
  }
  set padding(padding) {
    let oldPadding = this.padding_;
    this.padding_ = padding;
    const center = this.getCenter();
    if (center) {
      const newPadding = padding || [0, 0, 0, 0];
      oldPadding = oldPadding || [0, 0, 0, 0];
      const resolution = this.getResolution();
      const offsetX =
        (resolution / 2) *
        (newPadding[3] - oldPadding[3] + oldPadding[1] - newPadding[1]);
      const offsetY =
        (resolution / 2) *
        (newPadding[0] - oldPadding[0] + oldPadding[2] - newPadding[2]);
      this.setCenterInternal([center[0] + offsetX, center[1] - offsetY]);
    }
  }

  /**
   * Get an updated version of the view options used to construct the view.  The
   * current resolution (or zoom), center, and rotation are applied to any stored
   * options.  The provided options can be used to apply new min/max zoom or
   * resolution limits.
   * @param {ViewOptions} newOptions New options to be applied.
   * @return {ViewOptions} New options updated with the current view state.
   */
  getUpdatedOptions_(newOptions) {
    const options = this.getProperties();

    // preserve resolution (or zoom)
    if (options.resolution !== undefined) {
      options.resolution = this.getResolution();
    } else {
      options.zoom = this.getZoom();
    }

    // preserve center
    options.center = this.getCenterInternal();

    // preserve rotation
    options.rotation = this.getRotation();

    return Object.assign({}, options, newOptions);
  }

  /**
   * Animate the view.  The view's center, zoom (or resolution), and rotation
   * can be animated for smooth transitions between view states.  For example,
   * to animate the view to a new zoom level:
   *
   *     view.animate({zoom: view.getZoom() + 1});
   *
   * By default, the animation lasts one second and uses in-and-out easing.  You
   * can customize this behavior by including `duration` (in milliseconds) and
   * `easing` options (see {@link module:ol/easing}).
   *
   * To chain together multiple animations, call the method with multiple
   * animation objects.  For example, to first zoom and then pan:
   *
   *     view.animate({zoom: 10}, {center: [0, 0]});
   *
   * If you provide a function as the last argument to the animate method, it
   * will get called at the end of an animation series.  The callback will be
   * called with `true` if the animation series completed on its own or `false`
   * if it was cancelled.
   *
   * Animations are cancelled by user interactions (e.g. dragging the map) or by
   * calling `view.setCenter()`, `view.setResolution()`, or `view.setRotation()`
   * (or another method that calls one of these).
   *
   * @param {...(AnimationOptions|function(boolean): void)} var_args Animation
   *     options.  Multiple animations can be run in series by passing multiple
   *     options objects.  To run multiple animations in parallel, call the method
   *     multiple times.  An optional callback can be provided as a final
   *     argument.  The callback will be called with a boolean indicating whether
   *     the animation completed without being cancelled.
   * @api
   */
  animate(var_args) {
    if (this.isDef() && !this.getAnimating()) {
      this.resolveConstraints(0);
    }
    const args = new Array(arguments.length);
    for (let i = 0; i < args.length; ++i) {
      let options = arguments[i];
      if (options.center) {
        options = Object.assign({}, options);
        options.center = fromUserCoordinate(
          options.center,
          this.getProjection()
        );
      }
      if (options.anchor) {
        options = Object.assign({}, options);
        options.anchor = fromUserCoordinate(
          options.anchor,
          this.getProjection()
        );
      }
      args[i] = options;
    }
    this.animateInternal.apply(this, args);
  }

  /**
   * @param {...(AnimationOptions|function(boolean): void)} var_args Animation options.
   */
  animateInternal(var_args) {
    let animationCount = arguments.length;
    let callback;
    if (
      animationCount > 1 &&
      typeof arguments[animationCount - 1] === 'function'
    ) {
      callback = arguments[animationCount - 1];
      --animationCount;
    }

    let i = 0;
    for (; i < animationCount && !this.isDef(); ++i) {
      // if view properties are not yet set, shortcut to the final state
      const state = arguments[i];
      if (state.center) {
        this.setCenterInternal(state.center);
      }
      if (state.zoom !== undefined) {
        this.setZoom(state.zoom);
      } else if (state.resolution) {
        this.setResolution(state.resolution);
      }
      if (state.rotation !== undefined) {
        this.setRotation(state.rotation);
      }
    }
    if (i === animationCount) {
      if (callback) {
        animationCallback(callback, true);
      }
      return;
    }

    let start = Date.now();
    let center = this.targetCenter_.slice();
    let resolution = this.targetResolution_;
    let rotation = this.targetRotation_;
    const series = [];
    for (; i < animationCount; ++i) {
      const options = /** @type {AnimationOptions} */ (arguments[i]);

      const animation = {
        start: start,
        complete: false,
        anchor: options.anchor,
        duration: options.duration !== undefined ? options.duration : 1000,
        easing: options.easing || inAndOut,
        callback: callback,
      };

      if (options.center) {
        animation.sourceCenter = center;
        animation.targetCenter = options.center.slice();
        center = animation.targetCenter;
      }

      if (options.zoom !== undefined) {
        animation.sourceResolution = resolution;
        animation.targetResolution = this.getResolutionForZoom(options.zoom);
        resolution = animation.targetResolution;
      } else if (options.resolution) {
        animation.sourceResolution = resolution;
        animation.targetResolution = options.resolution;
        resolution = animation.targetResolution;
      }

      if (options.rotation !== undefined) {
        animation.sourceRotation = rotation;
        const delta =
          modulo(options.rotation - rotation + Math.PI, 2 * Math.PI) - Math.PI;
        animation.targetRotation = rotation + delta;
        rotation = animation.targetRotation;
      }

      // check if animation is a no-op
      if (isNoopAnimation(animation)) {
        animation.complete = true;
        // we still push it onto the series for callback handling
      } else {
        start += animation.duration;
      }
      series.push(animation);
    }
    this.animations_.push(series);
    this.setHint(ViewHint.ANIMATING, 1);
    this.updateAnimations_();
  }

  /**
   * Determine if the view is being animated.
   * @return {boolean} The view is being animated.
   * @api
   */
  getAnimating() {
    return this.hints_[ViewHint.ANIMATING] > 0;
  }

  /**
   * Determine if the user is interacting with the view, such as panning or zooming.
   * @return {boolean} The view is being interacted with.
   * @api
   */
  getInteracting() {
    return this.hints_[ViewHint.INTERACTING] > 0;
  }

  /**
   * Cancel any ongoing animations.
   * @api
   */
  cancelAnimations() {
    this.setHint(ViewHint.ANIMATING, -this.hints_[ViewHint.ANIMATING]);
    let anchor;
    for (let i = 0, ii = this.animations_.length; i < ii; ++i) {
      const series = this.animations_[i];
      if (series[0].callback) {
        animationCallback(series[0].callback, false);
      }
      if (!anchor) {
        for (let j = 0, jj = series.length; j < jj; ++j) {
          const animation = series[j];
          if (!animation.complete) {
            anchor = animation.anchor;
            break;
          }
        }
      }
    }
    this.animations_.length = 0;
    this.cancelAnchor_ = anchor;
    this.nextCenter_ = null;
    this.nextResolution_ = NaN;
    this.nextRotation_ = NaN;
  }

  /**
   * Update all animations.
   */
  updateAnimations_() {
    if (this.updateAnimationKey_ !== undefined) {
      cancelAnimationFrame(this.updateAnimationKey_);
      this.updateAnimationKey_ = undefined;
    }
    if (!this.getAnimating()) {
      return;
    }
    const now = Date.now();
    let more = false;
    for (let i = this.animations_.length - 1; i >= 0; --i) {
      const series = this.animations_[i];
      let seriesComplete = true;
      for (let j = 0, jj = series.length; j < jj; ++j) {
        const animation = series[j];
        if (animation.complete) {
          continue;
        }
        const elapsed = now - animation.start;
        let fraction =
          animation.duration > 0 ? elapsed / animation.duration : 1;
        if (fraction >= 1) {
          animation.complete = true;
          fraction = 1;
        } else {
          seriesComplete = false;
        }
        const progress = animation.easing(fraction);
        if (animation.sourceCenter) {
          const x0 = animation.sourceCenter[0];
          const y0 = animation.sourceCenter[1];
          const x1 = animation.targetCenter[0];
          const y1 = animation.targetCenter[1];
          this.nextCenter_ = animation.targetCenter;
          const x = x0 + progress * (x1 - x0);
          const y = y0 + progress * (y1 - y0);
          this.targetCenter_ = [x, y];
        }
        if (animation.sourceResolution && animation.targetResolution) {
          const resolution =
            progress === 1
              ? animation.targetResolution
              : animation.sourceResolution +
                progress *
                  (animation.targetResolution - animation.sourceResolution);
          if (animation.anchor) {
            const size = this.getViewportSize_(this.getRotation());
            const constrainedResolution = this.constraints_.resolution(
              resolution,
              0,
              size,
              true
            );
            this.targetCenter_ = this.calculateCenterZoom(
              constrainedResolution,
              animation.anchor
            );
          }
          this.nextResolution_ = animation.targetResolution;
          this.targetResolution_ = resolution;
          this.applyTargetState_(true);
        }
        if (
          animation.sourceRotation !== undefined &&
          animation.targetRotation !== undefined
        ) {
          const rotation =
            progress === 1
              ? modulo(animation.targetRotation + Math.PI, 2 * Math.PI) -
                Math.PI
              : animation.sourceRotation +
                progress *
                  (animation.targetRotation - animation.sourceRotation);
          if (animation.anchor) {
            const constrainedRotation = this.constraints_.rotation(
              rotation,
              true
            );
            this.targetCenter_ = this.calculateCenterRotate(
              constrainedRotation,
              animation.anchor
            );
          }
          this.nextRotation_ = animation.targetRotation;
          this.targetRotation_ = rotation;
        }
        this.applyTargetState_(true);
        more = true;
        if (!animation.complete) {
          break;
        }
      }
      if (seriesComplete) {
        this.animations_[i] = null;
        this.setHint(ViewHint.ANIMATING, -1);
        this.nextCenter_ = null;
        this.nextResolution_ = NaN;
        this.nextRotation_ = NaN;
        const callback = series[0].callback;
        if (callback) {
          animationCallback(callback, true);
        }
      }
    }
    // prune completed series
    this.animations_ = this.animations_.filter(Boolean);
    if (more && this.updateAnimationKey_ === undefined) {
      this.updateAnimationKey_ = requestAnimationFrame(
        this.updateAnimations_.bind(this)
      );
    }
  }

  /**
   * @param {number} rotation Target rotation.
   * @param {import("./coordinate.js").Coordinate} anchor Rotation anchor.
   * @return {import("./coordinate.js").Coordinate|undefined} Center for rotation and anchor.
   */
  calculateCenterRotate(rotation, anchor) {
    let center;
    const currentCenter = this.getCenterInternal();
    if (currentCenter !== undefined) {
      center = [currentCenter[0] - anchor[0], currentCenter[1] - anchor[1]];
      rotate$1(center, rotation - this.getRotation());
      add$2(center, anchor);
    }
    return center;
  }

  /**
   * @param {number} resolution Target resolution.
   * @param {import("./coordinate.js").Coordinate} anchor Zoom anchor.
   * @return {import("./coordinate.js").Coordinate|undefined} Center for resolution and anchor.
   */
  calculateCenterZoom(resolution, anchor) {
    let center;
    const currentCenter = this.getCenterInternal();
    const currentResolution = this.getResolution();
    if (currentCenter !== undefined && currentResolution !== undefined) {
      const x =
        anchor[0] -
        (resolution * (anchor[0] - currentCenter[0])) / currentResolution;
      const y =
        anchor[1] -
        (resolution * (anchor[1] - currentCenter[1])) / currentResolution;
      center = [x, y];
    }
    return center;
  }

  /**
   * Returns the current viewport size.
   * @private
   * @param {number} [rotation] Take into account the rotation of the viewport when giving the size
   * @return {import("./size.js").Size} Viewport size or `[100, 100]` when no viewport is found.
   */
  getViewportSize_(rotation) {
    const size = this.viewportSize_;
    if (rotation) {
      const w = size[0];
      const h = size[1];
      return [
        Math.abs(w * Math.cos(rotation)) + Math.abs(h * Math.sin(rotation)),
        Math.abs(w * Math.sin(rotation)) + Math.abs(h * Math.cos(rotation)),
      ];
    }
    return size;
  }

  /**
   * Stores the viewport size on the view. The viewport size is not read every time from the DOM
   * to avoid performance hit and layout reflow.
   * This should be done on map size change.
   * Note: the constraints are not resolved during an animation to avoid stopping it
   * @param {import("./size.js").Size} [size] Viewport size; if undefined, [100, 100] is assumed
   */
  setViewportSize(size) {
    this.viewportSize_ = Array.isArray(size) ? size.slice() : [100, 100];
    if (!this.getAnimating()) {
      this.resolveConstraints(0);
    }
  }

  /**
   * Get the view center.
   * @return {import("./coordinate.js").Coordinate|undefined} The center of the view.
   * @observable
   * @api
   */
  getCenter() {
    const center = this.getCenterInternal();
    if (!center) {
      return center;
    }
    return toUserCoordinate(center, this.getProjection());
  }

  /**
   * Get the view center without transforming to user projection.
   * @return {import("./coordinate.js").Coordinate|undefined} The center of the view.
   */
  getCenterInternal() {
    return /** @type {import("./coordinate.js").Coordinate|undefined} */ (
      this.get(ViewProperty.CENTER)
    );
  }

  /**
   * @return {Constraints} Constraints.
   */
  getConstraints() {
    return this.constraints_;
  }

  /**
   * @return {boolean} Resolution constraint is set
   */
  getConstrainResolution() {
    return this.get('constrainResolution');
  }

  /**
   * @param {Array<number>} [hints] Destination array.
   * @return {Array<number>} Hint.
   */
  getHints(hints) {
    if (hints !== undefined) {
      hints[0] = this.hints_[0];
      hints[1] = this.hints_[1];
      return hints;
    }
    return this.hints_.slice();
  }

  /**
   * Calculate the extent for the current view state and the passed size.
   * The size is the pixel dimensions of the box into which the calculated extent
   * should fit. In most cases you want to get the extent of the entire map,
   * that is `map.getSize()`.
   * @param {import("./size.js").Size} [size] Box pixel size. If not provided, the size
   * of the map that uses this view will be used.
   * @return {import("./extent.js").Extent} Extent.
   * @api
   */
  calculateExtent(size) {
    const extent = this.calculateExtentInternal(size);
    return toUserExtent(extent, this.getProjection());
  }

  /**
   * @param {import("./size.js").Size} [size] Box pixel size. If not provided,
   * the map's last known viewport size will be used.
   * @return {import("./extent.js").Extent} Extent.
   */
  calculateExtentInternal(size) {
    size = size || this.getViewportSizeMinusPadding_();
    const center = /** @type {!import("./coordinate.js").Coordinate} */ (
      this.getCenterInternal()
    );
    assert(center, 1); // The view center is not defined
    const resolution = /** @type {!number} */ (this.getResolution());
    assert(resolution !== undefined, 2); // The view resolution is not defined
    const rotation = /** @type {!number} */ (this.getRotation());
    assert(rotation !== undefined, 3); // The view rotation is not defined

    return getForViewAndSize(center, resolution, rotation, size);
  }

  /**
   * Get the maximum resolution of the view.
   * @return {number} The maximum resolution of the view.
   * @api
   */
  getMaxResolution() {
    return this.maxResolution_;
  }

  /**
   * Get the minimum resolution of the view.
   * @return {number} The minimum resolution of the view.
   * @api
   */
  getMinResolution() {
    return this.minResolution_;
  }

  /**
   * Get the maximum zoom level for the view.
   * @return {number} The maximum zoom level.
   * @api
   */
  getMaxZoom() {
    return /** @type {number} */ (
      this.getZoomForResolution(this.minResolution_)
    );
  }

  /**
   * Set a new maximum zoom level for the view.
   * @param {number} zoom The maximum zoom level.
   * @api
   */
  setMaxZoom(zoom) {
    this.applyOptions_(this.getUpdatedOptions_({maxZoom: zoom}));
  }

  /**
   * Get the minimum zoom level for the view.
   * @return {number} The minimum zoom level.
   * @api
   */
  getMinZoom() {
    return /** @type {number} */ (
      this.getZoomForResolution(this.maxResolution_)
    );
  }

  /**
   * Set a new minimum zoom level for the view.
   * @param {number} zoom The minimum zoom level.
   * @api
   */
  setMinZoom(zoom) {
    this.applyOptions_(this.getUpdatedOptions_({minZoom: zoom}));
  }

  /**
   * Set whether the view should allow intermediary zoom levels.
   * @param {boolean} enabled Whether the resolution is constrained.
   * @api
   */
  setConstrainResolution(enabled) {
    this.applyOptions_(this.getUpdatedOptions_({constrainResolution: enabled}));
  }

  /**
   * Get the view projection.
   * @return {import("./proj/Projection.js").default} The projection of the view.
   * @api
   */
  getProjection() {
    return this.projection_;
  }

  /**
   * Get the view resolution.
   * @return {number|undefined} The resolution of the view.
   * @observable
   * @api
   */
  getResolution() {
    return /** @type {number|undefined} */ (this.get(ViewProperty.RESOLUTION));
  }

  /**
   * Get the resolutions for the view. This returns the array of resolutions
   * passed to the constructor of the View, or undefined if none were given.
   * @return {Array<number>|undefined} The resolutions of the view.
   * @api
   */
  getResolutions() {
    return this.resolutions_;
  }

  /**
   * Get the resolution for a provided extent (in map units) and size (in pixels).
   * @param {import("./extent.js").Extent} extent Extent.
   * @param {import("./size.js").Size} [size] Box pixel size.
   * @return {number} The resolution at which the provided extent will render at
   *     the given size.
   * @api
   */
  getResolutionForExtent(extent, size) {
    return this.getResolutionForExtentInternal(
      fromUserExtent(extent, this.getProjection()),
      size
    );
  }

  /**
   * Get the resolution for a provided extent (in map units) and size (in pixels).
   * @param {import("./extent.js").Extent} extent Extent.
   * @param {import("./size.js").Size} [size] Box pixel size.
   * @return {number} The resolution at which the provided extent will render at
   *     the given size.
   */
  getResolutionForExtentInternal(extent, size) {
    size = size || this.getViewportSizeMinusPadding_();
    const xResolution = getWidth(extent) / size[0];
    const yResolution = getHeight(extent) / size[1];
    return Math.max(xResolution, yResolution);
  }

  /**
   * Return a function that returns a value between 0 and 1 for a
   * resolution. Exponential scaling is assumed.
   * @param {number} [power] Power.
   * @return {function(number): number} Resolution for value function.
   */
  getResolutionForValueFunction(power) {
    power = power || 2;
    const maxResolution = this.getConstrainedResolution(this.maxResolution_);
    const minResolution = this.minResolution_;
    const max = Math.log(maxResolution / minResolution) / Math.log(power);
    return (
      /**
       * @param {number} value Value.
       * @return {number} Resolution.
       */
      function (value) {
        const resolution = maxResolution / Math.pow(power, value * max);
        return resolution;
      }
    );
  }

  /**
   * Get the view rotation.
   * @return {number} The rotation of the view in radians.
   * @observable
   * @api
   */
  getRotation() {
    return /** @type {number} */ (this.get(ViewProperty.ROTATION));
  }

  /**
   * Return a function that returns a resolution for a value between
   * 0 and 1. Exponential scaling is assumed.
   * @param {number} [power] Power.
   * @return {function(number): number} Value for resolution function.
   */
  getValueForResolutionFunction(power) {
    const logPower = Math.log(power || 2);
    const maxResolution = this.getConstrainedResolution(this.maxResolution_);
    const minResolution = this.minResolution_;
    const max = Math.log(maxResolution / minResolution) / logPower;
    return (
      /**
       * @param {number} resolution Resolution.
       * @return {number} Value.
       */
      function (resolution) {
        const value = Math.log(maxResolution / resolution) / logPower / max;
        return value;
      }
    );
  }

  /**
   * Returns the size of the viewport minus padding.
   * @private
   * @param {number} [rotation] Take into account the rotation of the viewport when giving the size
   * @return {import("./size.js").Size} Viewport size reduced by the padding.
   */
  getViewportSizeMinusPadding_(rotation) {
    let size = this.getViewportSize_(rotation);
    const padding = this.padding_;
    if (padding) {
      size = [
        size[0] - padding[1] - padding[3],
        size[1] - padding[0] - padding[2],
      ];
    }
    return size;
  }

  /**
   * @return {State} View state.
   */
  getState() {
    const projection = this.getProjection();
    const resolution = this.getResolution();
    const rotation = this.getRotation();
    let center = /** @type {import("./coordinate.js").Coordinate} */ (
      this.getCenterInternal()
    );
    const padding = this.padding_;
    if (padding) {
      const reducedSize = this.getViewportSizeMinusPadding_();
      center = calculateCenterOn(
        center,
        this.getViewportSize_(),
        [reducedSize[0] / 2 + padding[3], reducedSize[1] / 2 + padding[0]],
        resolution,
        rotation
      );
    }
    return {
      center: center.slice(0),
      projection: projection !== undefined ? projection : null,
      resolution: resolution,
      nextCenter: this.nextCenter_,
      nextResolution: this.nextResolution_,
      nextRotation: this.nextRotation_,
      rotation: rotation,
      zoom: this.getZoom(),
    };
  }

  /**
   * Get the current zoom level. This method may return non-integer zoom levels
   * if the view does not constrain the resolution, or if an interaction or
   * animation is underway.
   * @return {number|undefined} Zoom.
   * @api
   */
  getZoom() {
    let zoom;
    const resolution = this.getResolution();
    if (resolution !== undefined) {
      zoom = this.getZoomForResolution(resolution);
    }
    return zoom;
  }

  /**
   * Get the zoom level for a resolution.
   * @param {number} resolution The resolution.
   * @return {number|undefined} The zoom level for the provided resolution.
   * @api
   */
  getZoomForResolution(resolution) {
    let offset = this.minZoom_ || 0;
    let max, zoomFactor;
    if (this.resolutions_) {
      const nearest = linearFindNearest(this.resolutions_, resolution, 1);
      offset = nearest;
      max = this.resolutions_[nearest];
      if (nearest == this.resolutions_.length - 1) {
        zoomFactor = 2;
      } else {
        zoomFactor = max / this.resolutions_[nearest + 1];
      }
    } else {
      max = this.maxResolution_;
      zoomFactor = this.zoomFactor_;
    }
    return offset + Math.log(max / resolution) / Math.log(zoomFactor);
  }

  /**
   * Get the resolution for a zoom level.
   * @param {number} zoom Zoom level.
   * @return {number} The view resolution for the provided zoom level.
   * @api
   */
  getResolutionForZoom(zoom) {
    if (this.resolutions_) {
      if (this.resolutions_.length <= 1) {
        return 0;
      }
      const baseLevel = clamp(
        Math.floor(zoom),
        0,
        this.resolutions_.length - 2
      );
      const zoomFactor =
        this.resolutions_[baseLevel] / this.resolutions_[baseLevel + 1];
      return (
        this.resolutions_[baseLevel] /
        Math.pow(zoomFactor, clamp(zoom - baseLevel, 0, 1))
      );
    }
    return (
      this.maxResolution_ / Math.pow(this.zoomFactor_, zoom - this.minZoom_)
    );
  }

  /**
   * Fit the given geometry or extent based on the given map size and border.
   * The size is pixel dimensions of the box to fit the extent into.
   * In most cases you will want to use the map size, that is `map.getSize()`.
   * Takes care of the map angle.
   * @param {import("./geom/SimpleGeometry.js").default|import("./extent.js").Extent} geometryOrExtent The geometry or
   *     extent to fit the view to.
   * @param {FitOptions} [options] Options.
   * @api
   */
  fit(geometryOrExtent, options) {
    /** @type {import("./geom/SimpleGeometry.js").default} */
    let geometry;
    assert(
      Array.isArray(geometryOrExtent) ||
        typeof (/** @type {?} */ (geometryOrExtent).getSimplifiedGeometry) ===
          'function',
      24
    ); // Invalid extent or geometry provided as `geometry`
    if (Array.isArray(geometryOrExtent)) {
      assert(!isEmpty(geometryOrExtent), 25); // Cannot fit empty extent provided as `geometry`
      const extent = fromUserExtent(geometryOrExtent, this.getProjection());
      geometry = fromExtent(extent);
    } else if (geometryOrExtent.getType() === 'Circle') {
      const extent = fromUserExtent(
        geometryOrExtent.getExtent(),
        this.getProjection()
      );
      geometry = fromExtent(extent);
      geometry.rotate(this.getRotation(), getCenter(extent));
    } else {
      {
        geometry = geometryOrExtent;
      }
    }

    this.fitInternal(geometry, options);
  }

  /**
   * Calculate rotated extent
   * @param {import("./geom/SimpleGeometry.js").default} geometry The geometry.
   * @return {import("./extent").Extent} The rotated extent for the geometry.
   */
  rotatedExtentForGeometry(geometry) {
    const rotation = this.getRotation();
    const cosAngle = Math.cos(rotation);
    const sinAngle = Math.sin(-rotation);
    const coords = geometry.getFlatCoordinates();
    const stride = geometry.getStride();
    let minRotX = +Infinity;
    let minRotY = +Infinity;
    let maxRotX = -Infinity;
    let maxRotY = -Infinity;
    for (let i = 0, ii = coords.length; i < ii; i += stride) {
      const rotX = coords[i] * cosAngle - coords[i + 1] * sinAngle;
      const rotY = coords[i] * sinAngle + coords[i + 1] * cosAngle;
      minRotX = Math.min(minRotX, rotX);
      minRotY = Math.min(minRotY, rotY);
      maxRotX = Math.max(maxRotX, rotX);
      maxRotY = Math.max(maxRotY, rotY);
    }
    return [minRotX, minRotY, maxRotX, maxRotY];
  }

  /**
   * @param {import("./geom/SimpleGeometry.js").default} geometry The geometry.
   * @param {FitOptions} [options] Options.
   */
  fitInternal(geometry, options) {
    options = options || {};
    let size = options.size;
    if (!size) {
      size = this.getViewportSizeMinusPadding_();
    }
    const padding =
      options.padding !== undefined ? options.padding : [0, 0, 0, 0];
    const nearest = options.nearest !== undefined ? options.nearest : false;
    let minResolution;
    if (options.minResolution !== undefined) {
      minResolution = options.minResolution;
    } else if (options.maxZoom !== undefined) {
      minResolution = this.getResolutionForZoom(options.maxZoom);
    } else {
      minResolution = 0;
    }

    const rotatedExtent = this.rotatedExtentForGeometry(geometry);

    // calculate resolution
    let resolution = this.getResolutionForExtentInternal(rotatedExtent, [
      size[0] - padding[1] - padding[3],
      size[1] - padding[0] - padding[2],
    ]);
    resolution = isNaN(resolution)
      ? minResolution
      : Math.max(resolution, minResolution);
    resolution = this.getConstrainedResolution(resolution, nearest ? 0 : 1);

    // calculate center
    const rotation = this.getRotation();
    const sinAngle = Math.sin(rotation);
    const cosAngle = Math.cos(rotation);
    const centerRot = getCenter(rotatedExtent);
    centerRot[0] += ((padding[1] - padding[3]) / 2) * resolution;
    centerRot[1] += ((padding[0] - padding[2]) / 2) * resolution;
    const centerX = centerRot[0] * cosAngle - centerRot[1] * sinAngle;
    const centerY = centerRot[1] * cosAngle + centerRot[0] * sinAngle;
    const center = this.getConstrainedCenter([centerX, centerY], resolution);
    const callback = options.callback ? options.callback : VOID;

    if (options.duration !== undefined) {
      this.animateInternal(
        {
          resolution: resolution,
          center: center,
          duration: options.duration,
          easing: options.easing,
        },
        callback
      );
    } else {
      this.targetResolution_ = resolution;
      this.targetCenter_ = center;
      this.applyTargetState_(false, true);
      animationCallback(callback, true);
    }
  }

  /**
   * Center on coordinate and view position.
   * @param {import("./coordinate.js").Coordinate} coordinate Coordinate.
   * @param {import("./size.js").Size} size Box pixel size.
   * @param {import("./pixel.js").Pixel} position Position on the view to center on.
   * @api
   */
  centerOn(coordinate, size, position) {
    this.centerOnInternal(
      fromUserCoordinate(coordinate, this.getProjection()),
      size,
      position
    );
  }

  /**
   * @param {import("./coordinate.js").Coordinate} coordinate Coordinate.
   * @param {import("./size.js").Size} size Box pixel size.
   * @param {import("./pixel.js").Pixel} position Position on the view to center on.
   */
  centerOnInternal(coordinate, size, position) {
    this.setCenterInternal(
      calculateCenterOn(
        coordinate,
        size,
        position,
        this.getResolution(),
        this.getRotation()
      )
    );
  }

  /**
   * Calculates the shift between map and viewport center.
   * @param {import("./coordinate.js").Coordinate} center Center.
   * @param {number} resolution Resolution.
   * @param {number} rotation Rotation.
   * @param {import("./size.js").Size} size Size.
   * @return {Array<number>|undefined} Center shift.
   */
  calculateCenterShift(center, resolution, rotation, size) {
    let centerShift;
    const padding = this.padding_;
    if (padding && center) {
      const reducedSize = this.getViewportSizeMinusPadding_(-rotation);
      const shiftedCenter = calculateCenterOn(
        center,
        size,
        [reducedSize[0] / 2 + padding[3], reducedSize[1] / 2 + padding[0]],
        resolution,
        rotation
      );
      centerShift = [
        center[0] - shiftedCenter[0],
        center[1] - shiftedCenter[1],
      ];
    }
    return centerShift;
  }

  /**
   * @return {boolean} Is defined.
   */
  isDef() {
    return !!this.getCenterInternal() && this.getResolution() !== undefined;
  }

  /**
   * Adds relative coordinates to the center of the view. Any extent constraint will apply.
   * @param {import("./coordinate.js").Coordinate} deltaCoordinates Relative value to add.
   * @api
   */
  adjustCenter(deltaCoordinates) {
    const center = toUserCoordinate(this.targetCenter_, this.getProjection());
    this.setCenter([
      center[0] + deltaCoordinates[0],
      center[1] + deltaCoordinates[1],
    ]);
  }

  /**
   * Adds relative coordinates to the center of the view. Any extent constraint will apply.
   * @param {import("./coordinate.js").Coordinate} deltaCoordinates Relative value to add.
   */
  adjustCenterInternal(deltaCoordinates) {
    const center = this.targetCenter_;
    this.setCenterInternal([
      center[0] + deltaCoordinates[0],
      center[1] + deltaCoordinates[1],
    ]);
  }

  /**
   * Multiply the view resolution by a ratio, optionally using an anchor. Any resolution
   * constraint will apply.
   * @param {number} ratio The ratio to apply on the view resolution.
   * @param {import("./coordinate.js").Coordinate} [anchor] The origin of the transformation.
   * @api
   */
  adjustResolution(ratio, anchor) {
    anchor = anchor && fromUserCoordinate(anchor, this.getProjection());
    this.adjustResolutionInternal(ratio, anchor);
  }

  /**
   * Multiply the view resolution by a ratio, optionally using an anchor. Any resolution
   * constraint will apply.
   * @param {number} ratio The ratio to apply on the view resolution.
   * @param {import("./coordinate.js").Coordinate} [anchor] The origin of the transformation.
   */
  adjustResolutionInternal(ratio, anchor) {
    const isMoving = this.getAnimating() || this.getInteracting();
    const size = this.getViewportSize_(this.getRotation());
    const newResolution = this.constraints_.resolution(
      this.targetResolution_ * ratio,
      0,
      size,
      isMoving
    );

    if (anchor) {
      this.targetCenter_ = this.calculateCenterZoom(newResolution, anchor);
    }

    this.targetResolution_ *= ratio;
    this.applyTargetState_();
  }

  /**
   * Adds a value to the view zoom level, optionally using an anchor. Any resolution
   * constraint will apply.
   * @param {number} delta Relative value to add to the zoom level.
   * @param {import("./coordinate.js").Coordinate} [anchor] The origin of the transformation.
   * @api
   */
  adjustZoom(delta, anchor) {
    this.adjustResolution(Math.pow(this.zoomFactor_, -delta), anchor);
  }

  /**
   * Adds a value to the view rotation, optionally using an anchor. Any rotation
   * constraint will apply.
   * @param {number} delta Relative value to add to the zoom rotation, in radians.
   * @param {import("./coordinate.js").Coordinate} [anchor] The rotation center.
   * @api
   */
  adjustRotation(delta, anchor) {
    if (anchor) {
      anchor = fromUserCoordinate(anchor, this.getProjection());
    }
    this.adjustRotationInternal(delta, anchor);
  }

  /**
   * @param {number} delta Relative value to add to the zoom rotation, in radians.
   * @param {import("./coordinate.js").Coordinate} [anchor] The rotation center.
   */
  adjustRotationInternal(delta, anchor) {
    const isMoving = this.getAnimating() || this.getInteracting();
    const newRotation = this.constraints_.rotation(
      this.targetRotation_ + delta,
      isMoving
    );
    if (anchor) {
      this.targetCenter_ = this.calculateCenterRotate(newRotation, anchor);
    }
    this.targetRotation_ += delta;
    this.applyTargetState_();
  }

  /**
   * Set the center of the current view. Any extent constraint will apply.
   * @param {import("./coordinate.js").Coordinate|undefined} center The center of the view.
   * @observable
   * @api
   */
  setCenter(center) {
    this.setCenterInternal(
      center ? fromUserCoordinate(center, this.getProjection()) : center
    );
  }

  /**
   * Set the center using the view projection (not the user projection).
   * @param {import("./coordinate.js").Coordinate|undefined} center The center of the view.
   */
  setCenterInternal(center) {
    this.targetCenter_ = center;
    this.applyTargetState_();
  }

  /**
   * @param {import("./ViewHint.js").default} hint Hint.
   * @param {number} delta Delta.
   * @return {number} New value.
   */
  setHint(hint, delta) {
    this.hints_[hint] += delta;
    this.changed();
    return this.hints_[hint];
  }

  /**
   * Set the resolution for this view. Any resolution constraint will apply.
   * @param {number|undefined} resolution The resolution of the view.
   * @observable
   * @api
   */
  setResolution(resolution) {
    this.targetResolution_ = resolution;
    this.applyTargetState_();
  }

  /**
   * Set the rotation for this view. Any rotation constraint will apply.
   * @param {number} rotation The rotation of the view in radians.
   * @observable
   * @api
   */
  setRotation(rotation) {
    this.targetRotation_ = rotation;
    this.applyTargetState_();
  }

  /**
   * Zoom to a specific zoom level. Any resolution constrain will apply.
   * @param {number} zoom Zoom level.
   * @api
   */
  setZoom(zoom) {
    this.setResolution(this.getResolutionForZoom(zoom));
  }

  /**
   * Recompute rotation/resolution/center based on target values.
   * Note: we have to compute rotation first, then resolution and center considering that
   * parameters can influence one another in case a view extent constraint is present.
   * @param {boolean} [doNotCancelAnims] Do not cancel animations.
   * @param {boolean} [forceMoving] Apply constraints as if the view is moving.
   * @private
   */
  applyTargetState_(doNotCancelAnims, forceMoving) {
    const isMoving =
      this.getAnimating() || this.getInteracting() || forceMoving;

    // compute rotation
    const newRotation = this.constraints_.rotation(
      this.targetRotation_,
      isMoving
    );
    const size = this.getViewportSize_(newRotation);
    const newResolution = this.constraints_.resolution(
      this.targetResolution_,
      0,
      size,
      isMoving
    );
    const newCenter = this.constraints_.center(
      this.targetCenter_,
      newResolution,
      size,
      isMoving,
      this.calculateCenterShift(
        this.targetCenter_,
        newResolution,
        newRotation,
        size
      )
    );

    if (this.get(ViewProperty.ROTATION) !== newRotation) {
      this.set(ViewProperty.ROTATION, newRotation);
    }
    if (this.get(ViewProperty.RESOLUTION) !== newResolution) {
      this.set(ViewProperty.RESOLUTION, newResolution);
      this.set('zoom', this.getZoom(), true);
    }
    if (
      !newCenter ||
      !this.get(ViewProperty.CENTER) ||
      !equals(this.get(ViewProperty.CENTER), newCenter)
    ) {
      this.set(ViewProperty.CENTER, newCenter);
    }

    if (this.getAnimating() && !doNotCancelAnims) {
      this.cancelAnimations();
    }
    this.cancelAnchor_ = undefined;
  }

  /**
   * If any constraints need to be applied, an animation will be triggered.
   * This is typically done on interaction end.
   * Note: calling this with a duration of 0 will apply the constrained values straight away,
   * without animation.
   * @param {number} [duration] The animation duration in ms.
   * @param {number} [resolutionDirection] Which direction to zoom.
   * @param {import("./coordinate.js").Coordinate} [anchor] The origin of the transformation.
   */
  resolveConstraints(duration, resolutionDirection, anchor) {
    duration = duration !== undefined ? duration : 200;
    const direction = resolutionDirection || 0;

    const newRotation = this.constraints_.rotation(this.targetRotation_);
    const size = this.getViewportSize_(newRotation);
    const newResolution = this.constraints_.resolution(
      this.targetResolution_,
      direction,
      size
    );
    const newCenter = this.constraints_.center(
      this.targetCenter_,
      newResolution,
      size,
      false,
      this.calculateCenterShift(
        this.targetCenter_,
        newResolution,
        newRotation,
        size
      )
    );

    if (duration === 0 && !this.cancelAnchor_) {
      this.targetResolution_ = newResolution;
      this.targetRotation_ = newRotation;
      this.targetCenter_ = newCenter;
      this.applyTargetState_();
      return;
    }

    anchor = anchor || (duration === 0 ? this.cancelAnchor_ : undefined);
    this.cancelAnchor_ = undefined;

    if (
      this.getResolution() !== newResolution ||
      this.getRotation() !== newRotation ||
      !this.getCenterInternal() ||
      !equals(this.getCenterInternal(), newCenter)
    ) {
      if (this.getAnimating()) {
        this.cancelAnimations();
      }

      this.animateInternal({
        rotation: newRotation,
        center: newCenter,
        resolution: newResolution,
        duration: duration,
        easing: easeOut,
        anchor: anchor,
      });
    }
  }

  /**
   * Notify the View that an interaction has started.
   * The view state will be resolved to a stable one if needed
   * (depending on its constraints).
   * @api
   */
  beginInteraction() {
    this.resolveConstraints(0);

    this.setHint(ViewHint.INTERACTING, 1);
  }

  /**
   * Notify the View that an interaction has ended. The view state will be resolved
   * to a stable one if needed (depending on its constraints).
   * @param {number} [duration] Animation duration in ms.
   * @param {number} [resolutionDirection] Which direction to zoom.
   * @param {import("./coordinate.js").Coordinate} [anchor] The origin of the transformation.
   * @api
   */
  endInteraction(duration, resolutionDirection, anchor) {
    anchor = anchor && fromUserCoordinate(anchor, this.getProjection());
    this.endInteractionInternal(duration, resolutionDirection, anchor);
  }

  /**
   * Notify the View that an interaction has ended. The view state will be resolved
   * to a stable one if needed (depending on its constraints).
   * @param {number} [duration] Animation duration in ms.
   * @param {number} [resolutionDirection] Which direction to zoom.
   * @param {import("./coordinate.js").Coordinate} [anchor] The origin of the transformation.
   */
  endInteractionInternal(duration, resolutionDirection, anchor) {
    this.setHint(ViewHint.INTERACTING, -1);

    this.resolveConstraints(duration, resolutionDirection, anchor);
  }

  /**
   * Get a valid position for the view center according to the current constraints.
   * @param {import("./coordinate.js").Coordinate|undefined} targetCenter Target center position.
   * @param {number} [targetResolution] Target resolution. If not supplied, the current one will be used.
   * This is useful to guess a valid center position at a different zoom level.
   * @return {import("./coordinate.js").Coordinate|undefined} Valid center position.
   */
  getConstrainedCenter(targetCenter, targetResolution) {
    const size = this.getViewportSize_(this.getRotation());
    return this.constraints_.center(
      targetCenter,
      targetResolution || this.getResolution(),
      size
    );
  }

  /**
   * Get a valid zoom level according to the current view constraints.
   * @param {number|undefined} targetZoom Target zoom.
   * @param {number} [direction=0] Indicate which resolution should be used
   * by a renderer if the view resolution does not match any resolution of the tile source.
   * If 0, the nearest resolution will be used. If 1, the nearest lower resolution
   * will be used. If -1, the nearest higher resolution will be used.
   * @return {number|undefined} Valid zoom level.
   */
  getConstrainedZoom(targetZoom, direction) {
    const targetRes = this.getResolutionForZoom(targetZoom);
    return this.getZoomForResolution(
      this.getConstrainedResolution(targetRes, direction)
    );
  }

  /**
   * Get a valid resolution according to the current view constraints.
   * @param {number|undefined} targetResolution Target resolution.
   * @param {number} [direction=0] Indicate which resolution should be used
   * by a renderer if the view resolution does not match any resolution of the tile source.
   * If 0, the nearest resolution will be used. If 1, the nearest lower resolution
   * will be used. If -1, the nearest higher resolution will be used.
   * @return {number|undefined} Valid resolution.
   */
  getConstrainedResolution(targetResolution, direction) {
    direction = direction || 0;
    const size = this.getViewportSize_(this.getRotation());

    return this.constraints_.resolution(targetResolution, direction, size);
  }
}

/**
 * @param {Function} callback Callback.
 * @param {*} returnValue Return value.
 */
function animationCallback(callback, returnValue) {
  setTimeout(function () {
    callback(returnValue);
  }, 0);
}

/**
 * @param {ViewOptions} options View options.
 * @return {import("./centerconstraint.js").Type} The constraint.
 */
function createCenterConstraint(options) {
  if (options.extent !== undefined) {
    const smooth =
      options.smoothExtentConstraint !== undefined
        ? options.smoothExtentConstraint
        : true;
    return createExtent(options.extent, options.constrainOnlyCenter, smooth);
  }

  const projection = createProjection(options.projection, 'EPSG:3857');
  if (options.multiWorld !== true && projection.isGlobal()) {
    const extent = projection.getExtent().slice();
    extent[0] = -Infinity;
    extent[2] = Infinity;
    return createExtent(extent, false, false);
  }

  return none$1;
}

/**
 * @param {ViewOptions} options View options.
 * @return {{constraint: import("./resolutionconstraint.js").Type, maxResolution: number,
 *     minResolution: number, minZoom: number, zoomFactor: number}} The constraint.
 */
function createResolutionConstraint(options) {
  let resolutionConstraint;
  let maxResolution;
  let minResolution;

  // TODO: move these to be ol constants
  // see https://github.com/openlayers/openlayers/issues/2076
  const defaultMaxZoom = 28;
  const defaultZoomFactor = 2;

  let minZoom =
    options.minZoom !== undefined ? options.minZoom : DEFAULT_MIN_ZOOM;

  let maxZoom =
    options.maxZoom !== undefined ? options.maxZoom : defaultMaxZoom;

  const zoomFactor =
    options.zoomFactor !== undefined ? options.zoomFactor : defaultZoomFactor;

  const multiWorld =
    options.multiWorld !== undefined ? options.multiWorld : false;

  const smooth =
    options.smoothResolutionConstraint !== undefined
      ? options.smoothResolutionConstraint
      : true;

  const showFullExtent =
    options.showFullExtent !== undefined ? options.showFullExtent : false;

  const projection = createProjection(options.projection, 'EPSG:3857');
  const projExtent = projection.getExtent();
  let constrainOnlyCenter = options.constrainOnlyCenter;
  let extent = options.extent;
  if (!multiWorld && !extent && projection.isGlobal()) {
    constrainOnlyCenter = false;
    extent = projExtent;
  }

  if (options.resolutions !== undefined) {
    const resolutions = options.resolutions;
    maxResolution = resolutions[minZoom];
    minResolution =
      resolutions[maxZoom] !== undefined
        ? resolutions[maxZoom]
        : resolutions[resolutions.length - 1];

    if (options.constrainResolution) {
      resolutionConstraint = createSnapToResolutions(
        resolutions,
        smooth,
        !constrainOnlyCenter && extent,
        showFullExtent
      );
    } else {
      resolutionConstraint = createMinMaxResolution(
        maxResolution,
        minResolution,
        smooth,
        !constrainOnlyCenter && extent,
        showFullExtent
      );
    }
  } else {
    // calculate the default min and max resolution
    const size = !projExtent
      ? // use an extent that can fit the whole world if need be
        (360 * METERS_PER_UNIT$1.degrees) / projection.getMetersPerUnit()
      : Math.max(getWidth(projExtent), getHeight(projExtent));

    const defaultMaxResolution =
      size / DEFAULT_TILE_SIZE / Math.pow(defaultZoomFactor, DEFAULT_MIN_ZOOM);

    const defaultMinResolution =
      defaultMaxResolution /
      Math.pow(defaultZoomFactor, defaultMaxZoom - DEFAULT_MIN_ZOOM);

    // user provided maxResolution takes precedence
    maxResolution = options.maxResolution;
    if (maxResolution !== undefined) {
      minZoom = 0;
    } else {
      maxResolution = defaultMaxResolution / Math.pow(zoomFactor, minZoom);
    }

    // user provided minResolution takes precedence
    minResolution = options.minResolution;
    if (minResolution === undefined) {
      if (options.maxZoom !== undefined) {
        if (options.maxResolution !== undefined) {
          minResolution = maxResolution / Math.pow(zoomFactor, maxZoom);
        } else {
          minResolution = defaultMaxResolution / Math.pow(zoomFactor, maxZoom);
        }
      } else {
        minResolution = defaultMinResolution;
      }
    }

    // given discrete zoom levels, minResolution may be different than provided
    maxZoom =
      minZoom +
      Math.floor(
        Math.log(maxResolution / minResolution) / Math.log(zoomFactor)
      );
    minResolution = maxResolution / Math.pow(zoomFactor, maxZoom - minZoom);

    if (options.constrainResolution) {
      resolutionConstraint = createSnapToPower(
        zoomFactor,
        maxResolution,
        minResolution,
        smooth,
        !constrainOnlyCenter && extent,
        showFullExtent
      );
    } else {
      resolutionConstraint = createMinMaxResolution(
        maxResolution,
        minResolution,
        smooth,
        !constrainOnlyCenter && extent,
        showFullExtent
      );
    }
  }
  return {
    constraint: resolutionConstraint,
    maxResolution: maxResolution,
    minResolution: minResolution,
    minZoom: minZoom,
    zoomFactor: zoomFactor,
  };
}

/**
 * @param {ViewOptions} options View options.
 * @return {import("./rotationconstraint.js").Type} Rotation constraint.
 */
function createRotationConstraint(options) {
  const enableRotation =
    options.enableRotation !== undefined ? options.enableRotation : true;
  if (enableRotation) {
    const constrainRotation = options.constrainRotation;
    if (constrainRotation === undefined || constrainRotation === true) {
      return createSnapToZero();
    } else if (constrainRotation === false) {
      return none;
    } else if (typeof constrainRotation === 'number') {
      return createSnapToN(constrainRotation);
    }
    return none;
  }
  return disable;
}

/**
 * Determine if an animation involves no view change.
 * @param {Animation} animation The animation.
 * @return {boolean} The animation involves no view change.
 */
function isNoopAnimation(animation) {
  if (animation.sourceCenter && animation.targetCenter) {
    if (!equals(animation.sourceCenter, animation.targetCenter)) {
      return false;
    }
  }
  if (animation.sourceResolution !== animation.targetResolution) {
    return false;
  }
  if (animation.sourceRotation !== animation.targetRotation) {
    return false;
  }
  return true;
}

/**
 * @param {import("./coordinate.js").Coordinate} coordinate Coordinate.
 * @param {import("./size.js").Size} size Box pixel size.
 * @param {import("./pixel.js").Pixel} position Position on the view to center on.
 * @param {number} resolution Resolution.
 * @param {number} rotation Rotation.
 * @return {import("./coordinate.js").Coordinate} Shifted center.
 */
function calculateCenterOn(coordinate, size, position, resolution, rotation) {
  // calculate rotated position
  const cosAngle = Math.cos(-rotation);
  let sinAngle = Math.sin(-rotation);
  let rotX = coordinate[0] * cosAngle - coordinate[1] * sinAngle;
  let rotY = coordinate[1] * cosAngle + coordinate[0] * sinAngle;
  rotX += (size[0] / 2 - position[0]) * resolution;
  rotY += (position[1] - size[1] / 2) * resolution;

  // go back to original angle
  sinAngle = -sinAngle; // go back to original rotation
  const centerX = rotX * cosAngle - rotY * sinAngle;
  const centerY = rotY * cosAngle + rotX * sinAngle;

  return [centerX, centerY];
}

var View$1 = View;

/**
 * @module ol/control/Control
 */

/**
 * @typedef {Object} Options
 * @property {HTMLElement} [element] The element is the control's
 * container element. This only needs to be specified if you're developing
 * a custom control.
 * @property {function(import("../MapEvent.js").default):void} [render] Function called when
 * the control should be re-rendered. This is called in a `requestAnimationFrame`
 * callback.
 * @property {HTMLElement|string} [target] Specify a target if you want
 * the control to be rendered outside of the map's viewport.
 */

/**
 * @classdesc
 * A control is a visible widget with a DOM element in a fixed position on the
 * screen. They can involve user input (buttons), or be informational only;
 * the position is determined using CSS. By default these are placed in the
 * container with CSS class name `ol-overlaycontainer-stopevent`, but can use
 * any outside DOM element.
 *
 * This is the base class for controls. You can use it for simple custom
 * controls by creating the element with listeners, creating an instance:
 * ```js
 * const myControl = new Control({element: myElement});
 * ```
 * and then adding this to the map.
 *
 * The main advantage of having this as a control rather than a simple separate
 * DOM element is that preventing propagation is handled for you. Controls
 * will also be objects in a {@link module:ol/Collection~Collection}, so you can use their methods.
 *
 * You can also extend this base for your own control class. See
 * examples/custom-controls for an example of how to do this.
 *
 * @api
 */
class Control extends BaseObject$1 {
  /**
   * @param {Options} options Control options.
   */
  constructor(options) {
    super();

    const element = options.element;
    if (element && !options.target && !element.style.pointerEvents) {
      element.style.pointerEvents = 'auto';
    }

    /**
     * @protected
     * @type {HTMLElement}
     */
    this.element = element ? element : null;

    /**
     * @private
     * @type {HTMLElement}
     */
    this.target_ = null;

    /**
     * @private
     * @type {import("../Map.js").default|null}
     */
    this.map_ = null;

    /**
     * @protected
     * @type {!Array<import("../events.js").EventsKey>}
     */
    this.listenerKeys = [];

    if (options.render) {
      this.render = options.render;
    }

    if (options.target) {
      this.setTarget(options.target);
    }
  }

  /**
   * Clean up.
   */
  disposeInternal() {
    removeNode(this.element);
    super.disposeInternal();
  }

  /**
   * Get the map associated with this control.
   * @return {import("../Map.js").default|null} Map.
   * @api
   */
  getMap() {
    return this.map_;
  }

  /**
   * Remove the control from its current map and attach it to the new map.
   * Pass `null` to just remove the control from the current map.
   * Subclasses may set up event handlers to get notified about changes to
   * the map here.
   * @param {import("../Map.js").default|null} map Map.
   * @api
   */
  setMap(map) {
    if (this.map_) {
      removeNode(this.element);
    }
    for (let i = 0, ii = this.listenerKeys.length; i < ii; ++i) {
      unlistenByKey(this.listenerKeys[i]);
    }
    this.listenerKeys.length = 0;
    this.map_ = map;
    if (map) {
      const target = this.target_
        ? this.target_
        : map.getOverlayContainerStopEvent();
      target.appendChild(this.element);
      if (this.render !== VOID) {
        this.listenerKeys.push(
          listen(map, MapEventType.POSTRENDER, this.render, this)
        );
      }
      map.render();
    }
  }

  /**
   * Renders the control.
   * @param {import("../MapEvent.js").default} mapEvent Map event.
   * @api
   */
  render(mapEvent) {}

  /**
   * This function is used to set a target element for the control. It has no
   * effect if it is called after the control has been added to the map (i.e.
   * after `setMap` is called on the control). If no `target` is set in the
   * options passed to the control constructor and if `setTarget` is not called
   * then the control is added to the map's overlay container.
   * @param {HTMLElement|string} target Target.
   * @api
   */
  setTarget(target) {
    this.target_ =
      typeof target === 'string' ? document.getElementById(target) : target;
  }
}

var Control$1 = Control;

/**
 * @module ol/control/Attribution
 */

/**
 * @typedef {Object} Options
 * @property {string} [className='ol-attribution'] CSS class name.
 * @property {HTMLElement|string} [target] Specify a target if you
 * want the control to be rendered outside of the map's
 * viewport.
 * @property {boolean} [collapsible] Specify if attributions can
 * be collapsed. If not specified, sources control this behavior with their
 * `attributionsCollapsible` setting.
 * @property {boolean} [collapsed=true] Specify if attributions should
 * be collapsed at startup.
 * @property {string} [tipLabel='Attributions'] Text label to use for the button tip.
 * @property {string|HTMLElement} [label='i'] Text label to use for the
 * collapsed attributions button.
 * Instead of text, also an element (e.g. a `span` element) can be used.
 * @property {string} [expandClassName=className + '-expand'] CSS class name for the
 * collapsed attributions button.
 * @property {string|HTMLElement} [collapseLabel='›'] Text label to use
 * for the expanded attributions button.
 * Instead of text, also an element (e.g. a `span` element) can be used.
 * @property {string} [collapseClassName=className + '-collapse'] CSS class name for the
 * expanded attributions button.
 * @property {function(import("../MapEvent.js").default):void} [render] Function called when
 * the control should be re-rendered. This is called in a `requestAnimationFrame`
 * callback.
 */

/**
 * @classdesc
 * Control to show all the attributions associated with the layer sources
 * in the map. This control is one of the default controls included in maps.
 * By default it will show in the bottom right portion of the map, but this can
 * be changed by using a css selector for `.ol-attribution`.
 *
 * @api
 */
class Attribution extends Control$1 {
  /**
   * @param {Options} [options] Attribution options.
   */
  constructor(options) {
    options = options ? options : {};

    super({
      element: document.createElement('div'),
      render: options.render,
      target: options.target,
    });

    /**
     * @private
     * @type {HTMLElement}
     */
    this.ulElement_ = document.createElement('ul');

    /**
     * @private
     * @type {boolean}
     */
    this.collapsed_ =
      options.collapsed !== undefined ? options.collapsed : true;

    /**
     * @private
     * @type {boolean}
     */
    this.userCollapsed_ = this.collapsed_;

    /**
     * @private
     * @type {boolean}
     */
    this.overrideCollapsible_ = options.collapsible !== undefined;

    /**
     * @private
     * @type {boolean}
     */
    this.collapsible_ =
      options.collapsible !== undefined ? options.collapsible : true;

    if (!this.collapsible_) {
      this.collapsed_ = false;
    }

    const className =
      options.className !== undefined ? options.className : 'ol-attribution';

    const tipLabel =
      options.tipLabel !== undefined ? options.tipLabel : 'Attributions';

    const expandClassName =
      options.expandClassName !== undefined
        ? options.expandClassName
        : className + '-expand';

    const collapseLabel =
      options.collapseLabel !== undefined ? options.collapseLabel : '\u203A';

    const collapseClassName =
      options.collapseClassName !== undefined
        ? options.collapseClassName
        : className + '-collapse';

    if (typeof collapseLabel === 'string') {
      /**
       * @private
       * @type {HTMLElement}
       */
      this.collapseLabel_ = document.createElement('span');
      this.collapseLabel_.textContent = collapseLabel;
      this.collapseLabel_.className = collapseClassName;
    } else {
      this.collapseLabel_ = collapseLabel;
    }

    const label = options.label !== undefined ? options.label : 'i';

    if (typeof label === 'string') {
      /**
       * @private
       * @type {HTMLElement}
       */
      this.label_ = document.createElement('span');
      this.label_.textContent = label;
      this.label_.className = expandClassName;
    } else {
      this.label_ = label;
    }

    const activeLabel =
      this.collapsible_ && !this.collapsed_ ? this.collapseLabel_ : this.label_;

    /**
     * @private
     * @type {HTMLElement}
     */
    this.toggleButton_ = document.createElement('button');
    this.toggleButton_.setAttribute('type', 'button');
    this.toggleButton_.setAttribute('aria-expanded', String(!this.collapsed_));
    this.toggleButton_.title = tipLabel;
    this.toggleButton_.appendChild(activeLabel);

    this.toggleButton_.addEventListener(
      EventType.CLICK,
      this.handleClick_.bind(this),
      false
    );

    const cssClasses =
      className +
      ' ' +
      CLASS_UNSELECTABLE +
      ' ' +
      CLASS_CONTROL +
      (this.collapsed_ && this.collapsible_ ? ' ' + CLASS_COLLAPSED : '') +
      (this.collapsible_ ? '' : ' ol-uncollapsible');
    const element = this.element;
    element.className = cssClasses;
    element.appendChild(this.toggleButton_);
    element.appendChild(this.ulElement_);

    /**
     * A list of currently rendered resolutions.
     * @type {Array<string>}
     * @private
     */
    this.renderedAttributions_ = [];

    /**
     * @private
     * @type {boolean}
     */
    this.renderedVisible_ = true;
  }

  /**
   * Collect a list of visible attributions and set the collapsible state.
   * @param {import("../Map.js").FrameState} frameState Frame state.
   * @return {Array<string>} Attributions.
   * @private
   */
  collectSourceAttributions_(frameState) {
    /**
     * Used to determine if an attribution already exists.
     * @type {!Object<string, boolean>}
     */
    const lookup = {};

    /**
     * A list of visible attributions.
     * @type {Array<string>}
     */
    const visibleAttributions = [];

    let collapsible = true;
    const layerStatesArray = frameState.layerStatesArray;
    for (let i = 0, ii = layerStatesArray.length; i < ii; ++i) {
      const layerState = layerStatesArray[i];
      if (!inView(layerState, frameState.viewState)) {
        continue;
      }

      const source = /** @type {import("../layer/Layer.js").default} */ (
        layerState.layer
      ).getSource();
      if (!source) {
        continue;
      }

      const attributionGetter = source.getAttributions();
      if (!attributionGetter) {
        continue;
      }

      const attributions = attributionGetter(frameState);
      if (!attributions) {
        continue;
      }

      collapsible =
        collapsible && source.getAttributionsCollapsible() !== false;

      if (Array.isArray(attributions)) {
        for (let j = 0, jj = attributions.length; j < jj; ++j) {
          if (!(attributions[j] in lookup)) {
            visibleAttributions.push(attributions[j]);
            lookup[attributions[j]] = true;
          }
        }
      } else {
        if (!(attributions in lookup)) {
          visibleAttributions.push(attributions);
          lookup[attributions] = true;
        }
      }
    }
    if (!this.overrideCollapsible_) {
      this.setCollapsible(collapsible);
    }
    return visibleAttributions;
  }

  /**
   * @private
   * @param {?import("../Map.js").FrameState} frameState Frame state.
   */
  updateElement_(frameState) {
    if (!frameState) {
      if (this.renderedVisible_) {
        this.element.style.display = 'none';
        this.renderedVisible_ = false;
      }
      return;
    }

    const attributions = this.collectSourceAttributions_(frameState);

    const visible = attributions.length > 0;
    if (this.renderedVisible_ != visible) {
      this.element.style.display = visible ? '' : 'none';
      this.renderedVisible_ = visible;
    }

    if (equals$2(attributions, this.renderedAttributions_)) {
      return;
    }

    removeChildren(this.ulElement_);

    // append the attributions
    for (let i = 0, ii = attributions.length; i < ii; ++i) {
      const element = document.createElement('li');
      element.innerHTML = attributions[i];
      this.ulElement_.appendChild(element);
    }

    this.renderedAttributions_ = attributions;
  }

  /**
   * @param {MouseEvent} event The event to handle
   * @private
   */
  handleClick_(event) {
    event.preventDefault();
    this.handleToggle_();
    this.userCollapsed_ = this.collapsed_;
  }

  /**
   * @private
   */
  handleToggle_() {
    this.element.classList.toggle(CLASS_COLLAPSED);
    if (this.collapsed_) {
      replaceNode(this.collapseLabel_, this.label_);
    } else {
      replaceNode(this.label_, this.collapseLabel_);
    }
    this.collapsed_ = !this.collapsed_;
    this.toggleButton_.setAttribute('aria-expanded', String(!this.collapsed_));
  }

  /**
   * Return `true` if the attribution is collapsible, `false` otherwise.
   * @return {boolean} True if the widget is collapsible.
   * @api
   */
  getCollapsible() {
    return this.collapsible_;
  }

  /**
   * Set whether the attribution should be collapsible.
   * @param {boolean} collapsible True if the widget is collapsible.
   * @api
   */
  setCollapsible(collapsible) {
    if (this.collapsible_ === collapsible) {
      return;
    }
    this.collapsible_ = collapsible;
    this.element.classList.toggle('ol-uncollapsible');
    if (this.userCollapsed_) {
      this.handleToggle_();
    }
  }

  /**
   * Collapse or expand the attribution according to the passed parameter. Will
   * not do anything if the attribution isn't collapsible or if the current
   * collapsed state is already the one requested.
   * @param {boolean} collapsed True if the widget is collapsed.
   * @api
   */
  setCollapsed(collapsed) {
    this.userCollapsed_ = collapsed;
    if (!this.collapsible_ || this.collapsed_ === collapsed) {
      return;
    }
    this.handleToggle_();
  }

  /**
   * Return `true` when the attribution is currently collapsed or `false`
   * otherwise.
   * @return {boolean} True if the widget is collapsed.
   * @api
   */
  getCollapsed() {
    return this.collapsed_;
  }

  /**
   * Update the attribution element.
   * @param {import("../MapEvent.js").default} mapEvent Map event.
   * @override
   */
  render(mapEvent) {
    this.updateElement_(mapEvent.frameState);
  }
}

var Attribution$1 = Attribution;

/**
 * @module ol/control/Rotate
 */

/**
 * @typedef {Object} Options
 * @property {string} [className='ol-rotate'] CSS class name.
 * @property {string|HTMLElement} [label='⇧'] Text label to use for the rotate button.
 * Instead of text, also an element (e.g. a `span` element) can be used.
 * @property {string} [tipLabel='Reset rotation'] Text label to use for the rotate tip.
 * @property {string} [compassClassName='ol-compass'] CSS class name for the compass.
 * @property {number} [duration=250] Animation duration in milliseconds.
 * @property {boolean} [autoHide=true] Hide the control when rotation is 0.
 * @property {function(import("../MapEvent.js").default):void} [render] Function called when the control should
 * be re-rendered. This is called in a `requestAnimationFrame` callback.
 * @property {function():void} [resetNorth] Function called when the control is clicked.
 * This will override the default `resetNorth`.
 * @property {HTMLElement|string} [target] Specify a target if you want the control to be
 * rendered outside of the map's viewport.
 */

/**
 * @classdesc
 * A button control to reset rotation to 0.
 * To style this control use css selector `.ol-rotate`. A `.ol-hidden` css
 * selector is added to the button when the rotation is 0.
 *
 * @api
 */
class Rotate extends Control$1 {
  /**
   * @param {Options} [options] Rotate options.
   */
  constructor(options) {
    options = options ? options : {};

    super({
      element: document.createElement('div'),
      render: options.render,
      target: options.target,
    });

    const className =
      options.className !== undefined ? options.className : 'ol-rotate';

    const label = options.label !== undefined ? options.label : '\u21E7';

    const compassClassName =
      options.compassClassName !== undefined
        ? options.compassClassName
        : 'ol-compass';

    /**
     * @type {HTMLElement}
     * @private
     */
    this.label_ = null;

    if (typeof label === 'string') {
      this.label_ = document.createElement('span');
      this.label_.className = compassClassName;
      this.label_.textContent = label;
    } else {
      this.label_ = label;
      this.label_.classList.add(compassClassName);
    }

    const tipLabel = options.tipLabel ? options.tipLabel : 'Reset rotation';

    const button = document.createElement('button');
    button.className = className + '-reset';
    button.setAttribute('type', 'button');
    button.title = tipLabel;
    button.appendChild(this.label_);

    button.addEventListener(
      EventType.CLICK,
      this.handleClick_.bind(this),
      false
    );

    const cssClasses =
      className + ' ' + CLASS_UNSELECTABLE + ' ' + CLASS_CONTROL;
    const element = this.element;
    element.className = cssClasses;
    element.appendChild(button);

    this.callResetNorth_ = options.resetNorth ? options.resetNorth : undefined;

    /**
     * @type {number}
     * @private
     */
    this.duration_ = options.duration !== undefined ? options.duration : 250;

    /**
     * @type {boolean}
     * @private
     */
    this.autoHide_ = options.autoHide !== undefined ? options.autoHide : true;

    /**
     * @private
     * @type {number|undefined}
     */
    this.rotation_ = undefined;

    if (this.autoHide_) {
      this.element.classList.add(CLASS_HIDDEN);
    }
  }

  /**
   * @param {MouseEvent} event The event to handle
   * @private
   */
  handleClick_(event) {
    event.preventDefault();
    if (this.callResetNorth_ !== undefined) {
      this.callResetNorth_();
    } else {
      this.resetNorth_();
    }
  }

  /**
   * @private
   */
  resetNorth_() {
    const map = this.getMap();
    const view = map.getView();
    if (!view) {
      // the map does not have a view, so we can't act
      // upon it
      return;
    }
    const rotation = view.getRotation();
    if (rotation !== undefined) {
      if (this.duration_ > 0 && rotation % (2 * Math.PI) !== 0) {
        view.animate({
          rotation: 0,
          duration: this.duration_,
          easing: easeOut,
        });
      } else {
        view.setRotation(0);
      }
    }
  }

  /**
   * Update the rotate control element.
   * @param {import("../MapEvent.js").default} mapEvent Map event.
   * @override
   */
  render(mapEvent) {
    const frameState = mapEvent.frameState;
    if (!frameState) {
      return;
    }
    const rotation = frameState.viewState.rotation;
    if (rotation != this.rotation_) {
      const transform = 'rotate(' + rotation + 'rad)';
      if (this.autoHide_) {
        const contains = this.element.classList.contains(CLASS_HIDDEN);
        if (!contains && rotation === 0) {
          this.element.classList.add(CLASS_HIDDEN);
        } else if (contains && rotation !== 0) {
          this.element.classList.remove(CLASS_HIDDEN);
        }
      }
      this.label_.style.transform = transform;
    }
    this.rotation_ = rotation;
  }
}

var Rotate$1 = Rotate;

/**
 * @module ol/control/Zoom
 */

/**
 * @typedef {Object} Options
 * @property {number} [duration=250] Animation duration in milliseconds.
 * @property {string} [className='ol-zoom'] CSS class name.
 * @property {string} [zoomInClassName=className + '-in'] CSS class name for the zoom-in button.
 * @property {string} [zoomOutClassName=className + '-out'] CSS class name for the zoom-out button.
 * @property {string|HTMLElement} [zoomInLabel='+'] Text label to use for the zoom-in
 * button. Instead of text, also an element (e.g. a `span` element) can be used.
 * @property {string|HTMLElement} [zoomOutLabel='–'] Text label to use for the zoom-out button.
 * Instead of text, also an element (e.g. a `span` element) can be used.
 * @property {string} [zoomInTipLabel='Zoom in'] Text label to use for the button tip.
 * @property {string} [zoomOutTipLabel='Zoom out'] Text label to use for the button tip.
 * @property {number} [delta=1] The zoom delta applied on each click.
 * @property {HTMLElement|string} [target] Specify a target if you want the control to be
 * rendered outside of the map's viewport.
 */

/**
 * @classdesc
 * A control with 2 buttons, one for zoom in and one for zoom out.
 * This control is one of the default controls of a map. To style this control
 * use css selectors `.ol-zoom-in` and `.ol-zoom-out`.
 *
 * @api
 */
class Zoom extends Control$1 {
  /**
   * @param {Options} [options] Zoom options.
   */
  constructor(options) {
    options = options ? options : {};

    super({
      element: document.createElement('div'),
      target: options.target,
    });

    const className =
      options.className !== undefined ? options.className : 'ol-zoom';

    const delta = options.delta !== undefined ? options.delta : 1;

    const zoomInClassName =
      options.zoomInClassName !== undefined
        ? options.zoomInClassName
        : className + '-in';

    const zoomOutClassName =
      options.zoomOutClassName !== undefined
        ? options.zoomOutClassName
        : className + '-out';

    const zoomInLabel =
      options.zoomInLabel !== undefined ? options.zoomInLabel : '+';
    const zoomOutLabel =
      options.zoomOutLabel !== undefined ? options.zoomOutLabel : '\u2013';

    const zoomInTipLabel =
      options.zoomInTipLabel !== undefined ? options.zoomInTipLabel : 'Zoom in';
    const zoomOutTipLabel =
      options.zoomOutTipLabel !== undefined
        ? options.zoomOutTipLabel
        : 'Zoom out';

    const inElement = document.createElement('button');
    inElement.className = zoomInClassName;
    inElement.setAttribute('type', 'button');
    inElement.title = zoomInTipLabel;
    inElement.appendChild(
      typeof zoomInLabel === 'string'
        ? document.createTextNode(zoomInLabel)
        : zoomInLabel
    );

    inElement.addEventListener(
      EventType.CLICK,
      this.handleClick_.bind(this, delta),
      false
    );

    const outElement = document.createElement('button');
    outElement.className = zoomOutClassName;
    outElement.setAttribute('type', 'button');
    outElement.title = zoomOutTipLabel;
    outElement.appendChild(
      typeof zoomOutLabel === 'string'
        ? document.createTextNode(zoomOutLabel)
        : zoomOutLabel
    );

    outElement.addEventListener(
      EventType.CLICK,
      this.handleClick_.bind(this, -delta),
      false
    );

    const cssClasses =
      className + ' ' + CLASS_UNSELECTABLE + ' ' + CLASS_CONTROL;
    const element = this.element;
    element.className = cssClasses;
    element.appendChild(inElement);
    element.appendChild(outElement);

    /**
     * @type {number}
     * @private
     */
    this.duration_ = options.duration !== undefined ? options.duration : 250;
  }

  /**
   * @param {number} delta Zoom delta.
   * @param {MouseEvent} event The event to handle
   * @private
   */
  handleClick_(delta, event) {
    event.preventDefault();
    this.zoomByDelta_(delta);
  }

  /**
   * @param {number} delta Zoom delta.
   * @private
   */
  zoomByDelta_(delta) {
    const map = this.getMap();
    const view = map.getView();
    if (!view) {
      // the map does not have a view, so we can't act
      // upon it
      return;
    }
    const currentZoom = view.getZoom();
    if (currentZoom !== undefined) {
      const newZoom = view.getConstrainedZoom(currentZoom + delta);
      if (this.duration_ > 0) {
        if (view.getAnimating()) {
          view.cancelAnimations();
        }
        view.animate({
          zoom: newZoom,
          duration: this.duration_,
          easing: easeOut,
        });
      } else {
        view.setZoom(newZoom);
      }
    }
  }
}

var Zoom$1 = Zoom;

/**
 * @module ol/control/defaults
 */

/**
 * @typedef {Object} DefaultsOptions
 * @property {boolean} [attribution=true] Include
 * {@link module:ol/control/Attribution~Attribution}.
 * @property {import("./Attribution.js").Options} [attributionOptions]
 * Options for {@link module:ol/control/Attribution~Attribution}.
 * @property {boolean} [rotate=true] Include
 * {@link module:ol/control/Rotate~Rotate}.
 * @property {import("./Rotate.js").Options} [rotateOptions] Options
 * for {@link module:ol/control/Rotate~Rotate}.
 * @property {boolean} [zoom] Include {@link module:ol/control/Zoom~Zoom}.
 * @property {import("./Zoom.js").Options} [zoomOptions] Options for
 * {@link module:ol/control/Zoom~Zoom}.
 */

/**
 * Set of controls included in maps by default. Unless configured otherwise,
 * this returns a collection containing an instance of each of the following
 * controls:
 * * {@link module:ol/control/Zoom~Zoom}
 * * {@link module:ol/control/Rotate~Rotate}
 * * {@link module:ol/control/Attribution~Attribution}
 *
 * @param {DefaultsOptions} [options] Options for the default controls.
 * @return {Collection<import("./Control.js").default>} A collection of controls
 * to be used with the {@link module:ol/Map~Map} constructor's `controls` option.
 * @api
 */
function defaults$1(options) {
  options = options ? options : {};

  /** @type {Collection<import("./Control.js").default>} */
  const controls = new Collection$1();

  const zoomControl = options.zoom !== undefined ? options.zoom : true;
  if (zoomControl) {
    controls.push(new Zoom$1(options.zoomOptions));
  }

  const rotateControl = options.rotate !== undefined ? options.rotate : true;
  if (rotateControl) {
    controls.push(new Rotate$1(options.rotateOptions));
  }

  const attributionControl =
    options.attribution !== undefined ? options.attribution : true;
  if (attributionControl) {
    controls.push(new Attribution$1(options.attributionOptions));
  }

  return controls;
}

/**
 * @module ol/interaction/Property
 */

/**
 * @enum {string}
 */
var InteractionProperty = {
  ACTIVE: 'active',
};

/**
 * @module ol/interaction/Interaction
 */

/***
 * @template Return
 * @typedef {import("../Observable").OnSignature<import("../Observable").EventTypes, import("../events/Event.js").default, Return> &
 *   import("../Observable").OnSignature<import("../ObjectEventType").Types|
 *     'change:active', import("../Object").ObjectEvent, Return> &
 *   import("../Observable").CombinedOnSignature<import("../Observable").EventTypes|import("../ObjectEventType").Types|
 *     'change:active', Return>} InteractionOnSignature
 */

/**
 * Object literal with config options for interactions.
 * @typedef {Object} InteractionOptions
 * @property {function(import("../MapBrowserEvent.js").default):boolean} handleEvent
 * Method called by the map to notify the interaction that a browser event was
 * dispatched to the map. If the function returns a falsy value, propagation of
 * the event to other interactions in the map's interactions chain will be
 * prevented (this includes functions with no explicit return). The interactions
 * are traversed in reverse order of the interactions collection of the map.
 */

/**
 * @classdesc
 * Abstract base class; normally only used for creating subclasses and not
 * instantiated in apps.
 * User actions that change the state of the map. Some are similar to controls,
 * but are not associated with a DOM element.
 * For example, {@link module:ol/interaction/KeyboardZoom~KeyboardZoom} is
 * functionally the same as {@link module:ol/control/Zoom~Zoom}, but triggered
 * by a keyboard event not a button element event.
 * Although interactions do not have a DOM element, some of them do render
 * vectors and so are visible on the screen.
 * @api
 */
class Interaction extends BaseObject$1 {
  /**
   * @param {InteractionOptions} [options] Options.
   */
  constructor(options) {
    super();

    /***
     * @type {InteractionOnSignature<import("../events").EventsKey>}
     */
    this.on;

    /***
     * @type {InteractionOnSignature<import("../events").EventsKey>}
     */
    this.once;

    /***
     * @type {InteractionOnSignature<void>}
     */
    this.un;

    if (options && options.handleEvent) {
      this.handleEvent = options.handleEvent;
    }

    /**
     * @private
     * @type {import("../Map.js").default|null}
     */
    this.map_ = null;

    this.setActive(true);
  }

  /**
   * Return whether the interaction is currently active.
   * @return {boolean} `true` if the interaction is active, `false` otherwise.
   * @observable
   * @api
   */
  getActive() {
    return /** @type {boolean} */ (this.get(InteractionProperty.ACTIVE));
  }

  /**
   * Get the map associated with this interaction.
   * @return {import("../Map.js").default|null} Map.
   * @api
   */
  getMap() {
    return this.map_;
  }

  /**
   * Handles the {@link module:ol/MapBrowserEvent~MapBrowserEvent map browser event}.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} `false` to stop event propagation.
   * @api
   */
  handleEvent(mapBrowserEvent) {
    return true;
  }

  /**
   * Activate or deactivate the interaction.
   * @param {boolean} active Active.
   * @observable
   * @api
   */
  setActive(active) {
    this.set(InteractionProperty.ACTIVE, active);
  }

  /**
   * Remove the interaction from its current map and attach it to the new map.
   * Subclasses may set up event handlers to get notified about changes to
   * the map here.
   * @param {import("../Map.js").default|null} map Map.
   */
  setMap(map) {
    this.map_ = map;
  }
}

/**
 * @param {import("../View.js").default} view View.
 * @param {import("../coordinate.js").Coordinate} delta Delta.
 * @param {number} [duration] Duration.
 */
function pan(view, delta, duration) {
  const currentCenter = view.getCenterInternal();
  if (currentCenter) {
    const center = [currentCenter[0] + delta[0], currentCenter[1] + delta[1]];
    view.animateInternal({
      duration: duration !== undefined ? duration : 250,
      easing: linear,
      center: view.getConstrainedCenter(center),
    });
  }
}

/**
 * @param {import("../View.js").default} view View.
 * @param {number} delta Delta from previous zoom level.
 * @param {import("../coordinate.js").Coordinate} [anchor] Anchor coordinate in the user projection.
 * @param {number} [duration] Duration.
 */
function zoomByDelta(view, delta, anchor, duration) {
  const currentZoom = view.getZoom();

  if (currentZoom === undefined) {
    return;
  }

  const newZoom = view.getConstrainedZoom(currentZoom + delta);
  const newResolution = view.getResolutionForZoom(newZoom);

  if (view.getAnimating()) {
    view.cancelAnimations();
  }
  view.animate({
    resolution: newResolution,
    anchor: anchor,
    duration: duration !== undefined ? duration : 250,
    easing: easeOut,
  });
}

var Interaction$1 = Interaction;

/**
 * @module ol/interaction/DoubleClickZoom
 */

/**
 * @typedef {Object} Options
 * @property {number} [duration=250] Animation duration in milliseconds.
 * @property {number} [delta=1] The zoom delta applied on each double click.
 */

/**
 * @classdesc
 * Allows the user to zoom by double-clicking on the map.
 * @api
 */
class DoubleClickZoom extends Interaction$1 {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    super();

    options = options ? options : {};

    /**
     * @private
     * @type {number}
     */
    this.delta_ = options.delta ? options.delta : 1;

    /**
     * @private
     * @type {number}
     */
    this.duration_ = options.duration !== undefined ? options.duration : 250;
  }

  /**
   * Handles the {@link module:ol/MapBrowserEvent~MapBrowserEvent map browser event} (if it was a
   * doubleclick) and eventually zooms the map.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} `false` to stop event propagation.
   */
  handleEvent(mapBrowserEvent) {
    let stopEvent = false;
    if (mapBrowserEvent.type == MapBrowserEventType.DBLCLICK) {
      const browserEvent = /** @type {MouseEvent} */ (
        mapBrowserEvent.originalEvent
      );
      const map = mapBrowserEvent.map;
      const anchor = mapBrowserEvent.coordinate;
      const delta = browserEvent.shiftKey ? -this.delta_ : this.delta_;
      const view = map.getView();
      zoomByDelta(view, delta, anchor, this.duration_);
      browserEvent.preventDefault();
      stopEvent = true;
    }
    return !stopEvent;
  }
}

var DoubleClickZoom$1 = DoubleClickZoom;

/**
 * @module ol/interaction/Pointer
 */

/**
 * @typedef {Object} Options
 * @property {function(import("../MapBrowserEvent.js").default):boolean} [handleDownEvent]
 * Function handling "down" events. If the function returns `true` then a drag
 * sequence is started.
 * @property {function(import("../MapBrowserEvent.js").default):void} [handleDragEvent]
 * Function handling "drag" events. This function is called on "move" events
 * during a drag sequence.
 * @property {function(import("../MapBrowserEvent.js").default):boolean} [handleEvent]
 * Method called by the map to notify the interaction that a browser event was
 * dispatched to the map. The function may return `false` to prevent the
 * propagation of the event to other interactions in the map's interactions
 * chain.
 * @property {function(import("../MapBrowserEvent.js").default):void} [handleMoveEvent]
 * Function handling "move" events. This function is called on "move" events.
 * This functions is also called during a drag sequence, so during a drag
 * sequence both the `handleDragEvent` function and this function are called.
 * If `handleDownEvent` is defined and it returns true this function will not
 * be called during a drag sequence.
 * @property {function(import("../MapBrowserEvent.js").default):boolean} [handleUpEvent]
 *  Function handling "up" events. If the function returns `false` then the
 * current drag sequence is stopped.
 * @property {function(boolean):boolean} [stopDown]
 * Should the down event be propagated to other interactions, or should be
 * stopped?
 */

/**
 * @classdesc
 * Base class that calls user-defined functions on `down`, `move` and `up`
 * events. This class also manages "drag sequences".
 *
 * When the `handleDownEvent` user function returns `true` a drag sequence is
 * started. During a drag sequence the `handleDragEvent` user function is
 * called on `move` events. The drag sequence ends when the `handleUpEvent`
 * user function is called and returns `false`.
 * @api
 */
class PointerInteraction extends Interaction$1 {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    options = options ? options : {};

    super(
      /** @type {import("./Interaction.js").InteractionOptions} */ (options)
    );

    if (options.handleDownEvent) {
      this.handleDownEvent = options.handleDownEvent;
    }

    if (options.handleDragEvent) {
      this.handleDragEvent = options.handleDragEvent;
    }

    if (options.handleMoveEvent) {
      this.handleMoveEvent = options.handleMoveEvent;
    }

    if (options.handleUpEvent) {
      this.handleUpEvent = options.handleUpEvent;
    }

    if (options.stopDown) {
      this.stopDown = options.stopDown;
    }

    /**
     * @type {boolean}
     * @protected
     */
    this.handlingDownUpSequence = false;

    /**
     * @type {Array<PointerEvent>}
     * @protected
     */
    this.targetPointers = [];
  }

  /**
   * Returns the current number of pointers involved in the interaction,
   * e.g. `2` when two fingers are used.
   * @return {number} The number of pointers.
   * @api
   */
  getPointerCount() {
    return this.targetPointers.length;
  }

  /**
   * Handle pointer down events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean} If the event was consumed.
   * @protected
   */
  handleDownEvent(mapBrowserEvent) {
    return false;
  }

  /**
   * Handle pointer drag events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @protected
   */
  handleDragEvent(mapBrowserEvent) {}

  /**
   * Handles the {@link module:ol/MapBrowserEvent~MapBrowserEvent map browser event} and may call into
   * other functions, if event sequences like e.g. 'drag' or 'down-up' etc. are
   * detected.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} `false` to stop event propagation.
   * @api
   */
  handleEvent(mapBrowserEvent) {
    if (!mapBrowserEvent.originalEvent) {
      return true;
    }

    let stopEvent = false;
    this.updateTrackedPointers_(mapBrowserEvent);
    if (this.handlingDownUpSequence) {
      if (mapBrowserEvent.type == MapBrowserEventType.POINTERDRAG) {
        this.handleDragEvent(mapBrowserEvent);
        // prevent page scrolling during dragging
        mapBrowserEvent.originalEvent.preventDefault();
      } else if (mapBrowserEvent.type == MapBrowserEventType.POINTERUP) {
        const handledUp = this.handleUpEvent(mapBrowserEvent);
        this.handlingDownUpSequence =
          handledUp && this.targetPointers.length > 0;
      }
    } else {
      if (mapBrowserEvent.type == MapBrowserEventType.POINTERDOWN) {
        const handled = this.handleDownEvent(mapBrowserEvent);
        this.handlingDownUpSequence = handled;
        stopEvent = this.stopDown(handled);
      } else if (mapBrowserEvent.type == MapBrowserEventType.POINTERMOVE) {
        this.handleMoveEvent(mapBrowserEvent);
      }
    }
    return !stopEvent;
  }

  /**
   * Handle pointer move events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @protected
   */
  handleMoveEvent(mapBrowserEvent) {}

  /**
   * Handle pointer up events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean} If the event was consumed.
   * @protected
   */
  handleUpEvent(mapBrowserEvent) {
    return false;
  }

  /**
   * This function is used to determine if "down" events should be propagated
   * to other interactions or should be stopped.
   * @param {boolean} handled Was the event handled by the interaction?
   * @return {boolean} Should the `down` event be stopped?
   */
  stopDown(handled) {
    return handled;
  }

  /**
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @private
   */
  updateTrackedPointers_(mapBrowserEvent) {
    if (mapBrowserEvent.activePointers) {
      this.targetPointers = mapBrowserEvent.activePointers;
    }
  }
}

/**
 * @param {Array<PointerEvent>} pointerEvents List of events.
 * @return {{clientX: number, clientY: number}} Centroid pixel.
 */
function centroid(pointerEvents) {
  const length = pointerEvents.length;
  let clientX = 0;
  let clientY = 0;
  for (let i = 0; i < length; i++) {
    clientX += pointerEvents[i].clientX;
    clientY += pointerEvents[i].clientY;
  }
  return {clientX: clientX / length, clientY: clientY / length};
}

var PointerInteraction$1 = PointerInteraction;

/**
 * @module ol/events/condition
 */

/**
 * A function that takes an {@link module:ol/MapBrowserEvent~MapBrowserEvent} and returns a
 * `{boolean}`. If the condition is met, true should be returned.
 *
 * @typedef {function(this: ?, import("../MapBrowserEvent.js").default): boolean} Condition
 */

/**
 * Creates a condition function that passes when all provided conditions pass.
 * @param {...Condition} var_args Conditions to check.
 * @return {Condition} Condition function.
 */
function all(var_args) {
  const conditions = arguments;
  /**
   * @param {import("../MapBrowserEvent.js").default} event Event.
   * @return {boolean} All conditions passed.
   */
  return function (event) {
    let pass = true;
    for (let i = 0, ii = conditions.length; i < ii; ++i) {
      pass = pass && conditions[i](event);
      if (!pass) {
        break;
      }
    }
    return pass;
  };
}

/**
 * Return `true` if only the alt-key and shift-key is pressed, `false` otherwise
 * (e.g. when additionally the platform-modifier-key is pressed).
 *
 * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
 * @return {boolean} True if only the alt and shift keys are pressed.
 * @api
 */
const altShiftKeysOnly = function (mapBrowserEvent) {
  const originalEvent = /** @type {KeyboardEvent|MouseEvent|TouchEvent} */ (
    mapBrowserEvent.originalEvent
  );
  return (
    originalEvent.altKey &&
    !(originalEvent.metaKey || originalEvent.ctrlKey) &&
    originalEvent.shiftKey
  );
};

/**
 * Return `true` if the map has the focus. This condition requires a map target
 * element with a `tabindex` attribute, e.g. `<div id="map" tabindex="1">`.
 *
 * @param {import("../MapBrowserEvent.js").default} event Map browser event.
 * @return {boolean} The map has the focus.
 * @api
 */
const focus = function (event) {
  const targetElement = event.map.getTargetElement();
  const activeElement = event.map.getOwnerDocument().activeElement;
  return targetElement.contains(activeElement);
};

/**
 * Return `true` if the map has the focus or no 'tabindex' attribute set.
 *
 * @param {import("../MapBrowserEvent.js").default} event Map browser event.
 * @return {boolean} The map container has the focus or no 'tabindex' attribute.
 */
const focusWithTabindex = function (event) {
  return event.map.getTargetElement().hasAttribute('tabindex')
    ? focus(event)
    : true;
};

/**
 * Return always true.
 *
 * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
 * @return {boolean} True.
 * @api
 */
const always = TRUE;

/**
 * Return `true` if the event has an "action"-producing mouse button.
 *
 * By definition, this includes left-click on windows/linux, and left-click
 * without the ctrl key on Macs.
 *
 * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
 * @return {boolean} The result.
 */
const mouseActionButton = function (mapBrowserEvent) {
  const originalEvent = /** @type {MouseEvent} */ (
    mapBrowserEvent.originalEvent
  );
  return originalEvent.button == 0 && !(WEBKIT && MAC && originalEvent.ctrlKey);
};

/**
 * Return `true` if no modifier key (alt-, shift- or platform-modifier-key) is
 * pressed.
 *
 * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
 * @return {boolean} True only if there no modifier keys are pressed.
 * @api
 */
const noModifierKeys = function (mapBrowserEvent) {
  const originalEvent = /** @type {KeyboardEvent|MouseEvent|TouchEvent} */ (
    mapBrowserEvent.originalEvent
  );
  return (
    !originalEvent.altKey &&
    !(originalEvent.metaKey || originalEvent.ctrlKey) &&
    !originalEvent.shiftKey
  );
};

/**
 * Return `true` if only the shift-key is pressed, `false` otherwise (e.g. when
 * additionally the alt-key is pressed).
 *
 * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
 * @return {boolean} True if only the shift key is pressed.
 * @api
 */
const shiftKeyOnly = function (mapBrowserEvent) {
  const originalEvent = /** @type {KeyboardEvent|MouseEvent|TouchEvent} */ (
    mapBrowserEvent.originalEvent
  );
  return (
    !originalEvent.altKey &&
    !(originalEvent.metaKey || originalEvent.ctrlKey) &&
    originalEvent.shiftKey
  );
};

/**
 * Return `true` if the target element is not editable, i.e. not an `input`,
 * `select`, or `textarea` element and no `contenteditable` attribute is
 * set or inherited, `false` otherwise.
 *
 * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
 * @return {boolean} True only if the target element is not editable.
 * @api
 */
const targetNotEditable = function (mapBrowserEvent) {
  const originalEvent = /** @type {KeyboardEvent|MouseEvent|TouchEvent} */ (
    mapBrowserEvent.originalEvent
  );
  const tagName = /** @type {Element} */ (originalEvent.target).tagName;
  return (
    tagName !== 'INPUT' &&
    tagName !== 'SELECT' &&
    tagName !== 'TEXTAREA' &&
    // `isContentEditable` is only available on `HTMLElement`, but it may also be a
    // different type like `SVGElement`.
    // @ts-ignore
    !originalEvent.target.isContentEditable
  );
};

/**
 * Return `true` if the event originates from a mouse device.
 *
 * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
 * @return {boolean} True if the event originates from a mouse device.
 * @api
 */
const mouseOnly = function (mapBrowserEvent) {
  const pointerEvent = /** @type {import("../MapBrowserEvent").default} */ (
    mapBrowserEvent
  ).originalEvent;
  assert(pointerEvent !== undefined, 56); // mapBrowserEvent must originate from a pointer event
  // see https://www.w3.org/TR/pointerevents/#widl-PointerEvent-pointerType
  return pointerEvent.pointerType == 'mouse';
};

/**
 * Return `true` if the event originates from a primary pointer in
 * contact with the surface or if the left mouse button is pressed.
 * See https://www.w3.org/TR/pointerevents/#button-states.
 *
 * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
 * @return {boolean} True if the event originates from a primary pointer.
 * @api
 */
const primaryAction = function (mapBrowserEvent) {
  const pointerEvent = /** @type {import("../MapBrowserEvent").default} */ (
    mapBrowserEvent
  ).originalEvent;
  assert(pointerEvent !== undefined, 56); // mapBrowserEvent must originate from a pointer event
  return pointerEvent.isPrimary && pointerEvent.button === 0;
};

/**
 * @module ol/interaction/DragPan
 */

/**
 * @typedef {Object} Options
 * @property {import("../events/condition.js").Condition} [condition] A function that takes an {@link module:ol/MapBrowserEvent~MapBrowserEvent} and returns a boolean
 * to indicate whether that event should be handled.
 * Default is {@link module:ol/events/condition.noModifierKeys} and {@link module:ol/events/condition.primaryAction}.
 * @property {boolean} [onFocusOnly=false] When the map's target has a `tabindex` attribute set,
 * the interaction will only handle events when the map has the focus.
 * @property {import("../Kinetic.js").default} [kinetic] Kinetic inertia to apply to the pan.
 */

/**
 * @classdesc
 * Allows the user to pan the map by dragging the map.
 * @api
 */
class DragPan extends PointerInteraction$1 {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    super({
      stopDown: FALSE,
    });

    options = options ? options : {};

    /**
     * @private
     * @type {import("../Kinetic.js").default|undefined}
     */
    this.kinetic_ = options.kinetic;

    /**
     * @type {import("../pixel.js").Pixel}
     */
    this.lastCentroid = null;

    /**
     * @type {number}
     */
    this.lastPointersCount_;

    /**
     * @type {boolean}
     */
    this.panning_ = false;

    const condition = options.condition
      ? options.condition
      : all(noModifierKeys, primaryAction);

    /**
     * @private
     * @type {import("../events/condition.js").Condition}
     */
    this.condition_ = options.onFocusOnly
      ? all(focusWithTabindex, condition)
      : condition;

    /**
     * @private
     * @type {boolean}
     */
    this.noKinetic_ = false;
  }

  /**
   * Handle pointer drag events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   */
  handleDragEvent(mapBrowserEvent) {
    const map = mapBrowserEvent.map;
    if (!this.panning_) {
      this.panning_ = true;
      map.getView().beginInteraction();
    }
    const targetPointers = this.targetPointers;
    const centroid$1 = map.getEventPixel(centroid(targetPointers));
    if (targetPointers.length == this.lastPointersCount_) {
      if (this.kinetic_) {
        this.kinetic_.update(centroid$1[0], centroid$1[1]);
      }
      if (this.lastCentroid) {
        const delta = [
          this.lastCentroid[0] - centroid$1[0],
          centroid$1[1] - this.lastCentroid[1],
        ];
        const map = mapBrowserEvent.map;
        const view = map.getView();
        scale$2(delta, view.getResolution());
        rotate$1(delta, view.getRotation());
        view.adjustCenterInternal(delta);
      }
    } else if (this.kinetic_) {
      // reset so we don't overestimate the kinetic energy after
      // after one finger down, tiny drag, second finger down
      this.kinetic_.begin();
    }
    this.lastCentroid = centroid$1;
    this.lastPointersCount_ = targetPointers.length;
    mapBrowserEvent.originalEvent.preventDefault();
  }

  /**
   * Handle pointer up events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean} If the event was consumed.
   */
  handleUpEvent(mapBrowserEvent) {
    const map = mapBrowserEvent.map;
    const view = map.getView();
    if (this.targetPointers.length === 0) {
      if (!this.noKinetic_ && this.kinetic_ && this.kinetic_.end()) {
        const distance = this.kinetic_.getDistance();
        const angle = this.kinetic_.getAngle();
        const center = view.getCenterInternal();
        const centerpx = map.getPixelFromCoordinateInternal(center);
        const dest = map.getCoordinateFromPixelInternal([
          centerpx[0] - distance * Math.cos(angle),
          centerpx[1] - distance * Math.sin(angle),
        ]);
        view.animateInternal({
          center: view.getConstrainedCenter(dest),
          duration: 500,
          easing: easeOut,
        });
      }
      if (this.panning_) {
        this.panning_ = false;
        view.endInteraction();
      }
      return false;
    }
    if (this.kinetic_) {
      // reset so we don't overestimate the kinetic energy after
      // after one finger up, tiny drag, second finger up
      this.kinetic_.begin();
    }
    this.lastCentroid = null;
    return true;
  }

  /**
   * Handle pointer down events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean} If the event was consumed.
   */
  handleDownEvent(mapBrowserEvent) {
    if (this.targetPointers.length > 0 && this.condition_(mapBrowserEvent)) {
      const map = mapBrowserEvent.map;
      const view = map.getView();
      this.lastCentroid = null;
      // stop any current animation
      if (view.getAnimating()) {
        view.cancelAnimations();
      }
      if (this.kinetic_) {
        this.kinetic_.begin();
      }
      // No kinetic as soon as more than one pointer on the screen is
      // detected. This is to prevent nasty pans after pinch.
      this.noKinetic_ = this.targetPointers.length > 1;
      return true;
    }
    return false;
  }
}

var DragPan$1 = DragPan;

/**
 * @module ol/interaction/DragRotate
 */

/**
 * @typedef {Object} Options
 * @property {import("../events/condition.js").Condition} [condition] A function that takes an
 * {@link module:ol/MapBrowserEvent~MapBrowserEvent} and returns a boolean
 * to indicate whether that event should be handled.
 * Default is {@link module:ol/events/condition.altShiftKeysOnly}.
 * @property {number} [duration=250] Animation duration in milliseconds.
 */

/**
 * @classdesc
 * Allows the user to rotate the map by clicking and dragging on the map,
 * normally combined with an {@link module:ol/events/condition} that limits
 * it to when the alt and shift keys are held down.
 *
 * This interaction is only supported for mouse devices.
 * @api
 */
class DragRotate extends PointerInteraction$1 {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    options = options ? options : {};

    super({
      stopDown: FALSE,
    });

    /**
     * @private
     * @type {import("../events/condition.js").Condition}
     */
    this.condition_ = options.condition ? options.condition : altShiftKeysOnly;

    /**
     * @private
     * @type {number|undefined}
     */
    this.lastAngle_ = undefined;

    /**
     * @private
     * @type {number}
     */
    this.duration_ = options.duration !== undefined ? options.duration : 250;
  }

  /**
   * Handle pointer drag events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   */
  handleDragEvent(mapBrowserEvent) {
    if (!mouseOnly(mapBrowserEvent)) {
      return;
    }

    const map = mapBrowserEvent.map;
    const view = map.getView();
    if (view.getConstraints().rotation === disable) {
      return;
    }
    const size = map.getSize();
    const offset = mapBrowserEvent.pixel;
    const theta = Math.atan2(size[1] / 2 - offset[1], offset[0] - size[0] / 2);
    if (this.lastAngle_ !== undefined) {
      const delta = theta - this.lastAngle_;
      view.adjustRotationInternal(-delta);
    }
    this.lastAngle_ = theta;
  }

  /**
   * Handle pointer up events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean} If the event was consumed.
   */
  handleUpEvent(mapBrowserEvent) {
    if (!mouseOnly(mapBrowserEvent)) {
      return true;
    }

    const map = mapBrowserEvent.map;
    const view = map.getView();
    view.endInteraction(this.duration_);
    return false;
  }

  /**
   * Handle pointer down events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean} If the event was consumed.
   */
  handleDownEvent(mapBrowserEvent) {
    if (!mouseOnly(mapBrowserEvent)) {
      return false;
    }

    if (
      mouseActionButton(mapBrowserEvent) &&
      this.condition_(mapBrowserEvent)
    ) {
      const map = mapBrowserEvent.map;
      map.getView().beginInteraction();
      this.lastAngle_ = undefined;
      return true;
    }
    return false;
  }
}

var DragRotate$1 = DragRotate;

/**
 * @module ol/render/Box
 */

class RenderBox extends Disposable$1 {
  /**
   * @param {string} className CSS class name.
   */
  constructor(className) {
    super();

    /**
     * @type {import("../geom/Polygon.js").default}
     * @private
     */
    this.geometry_ = null;

    /**
     * @type {HTMLDivElement}
     * @private
     */
    this.element_ = document.createElement('div');
    this.element_.style.position = 'absolute';
    this.element_.style.pointerEvents = 'auto';
    this.element_.className = 'ol-box ' + className;

    /**
     * @private
     * @type {import("../Map.js").default|null}
     */
    this.map_ = null;

    /**
     * @private
     * @type {import("../pixel.js").Pixel}
     */
    this.startPixel_ = null;

    /**
     * @private
     * @type {import("../pixel.js").Pixel}
     */
    this.endPixel_ = null;
  }

  /**
   * Clean up.
   */
  disposeInternal() {
    this.setMap(null);
  }

  /**
   * @private
   */
  render_() {
    const startPixel = this.startPixel_;
    const endPixel = this.endPixel_;
    const px = 'px';
    const style = this.element_.style;
    style.left = Math.min(startPixel[0], endPixel[0]) + px;
    style.top = Math.min(startPixel[1], endPixel[1]) + px;
    style.width = Math.abs(endPixel[0] - startPixel[0]) + px;
    style.height = Math.abs(endPixel[1] - startPixel[1]) + px;
  }

  /**
   * @param {import("../Map.js").default|null} map Map.
   */
  setMap(map) {
    if (this.map_) {
      this.map_.getOverlayContainer().removeChild(this.element_);
      const style = this.element_.style;
      style.left = 'inherit';
      style.top = 'inherit';
      style.width = 'inherit';
      style.height = 'inherit';
    }
    this.map_ = map;
    if (this.map_) {
      this.map_.getOverlayContainer().appendChild(this.element_);
    }
  }

  /**
   * @param {import("../pixel.js").Pixel} startPixel Start pixel.
   * @param {import("../pixel.js").Pixel} endPixel End pixel.
   */
  setPixels(startPixel, endPixel) {
    this.startPixel_ = startPixel;
    this.endPixel_ = endPixel;
    this.createOrUpdateGeometry();
    this.render_();
  }

  /**
   * Creates or updates the cached geometry.
   */
  createOrUpdateGeometry() {
    const startPixel = this.startPixel_;
    const endPixel = this.endPixel_;
    const pixels = [
      startPixel,
      [startPixel[0], endPixel[1]],
      endPixel,
      [endPixel[0], startPixel[1]],
    ];
    const coordinates = pixels.map(
      this.map_.getCoordinateFromPixelInternal,
      this.map_
    );
    // close the polygon
    coordinates[4] = coordinates[0].slice();
    if (!this.geometry_) {
      this.geometry_ = new Polygon([coordinates]);
    } else {
      this.geometry_.setCoordinates([coordinates]);
    }
  }

  /**
   * @return {import("../geom/Polygon.js").default} Geometry.
   */
  getGeometry() {
    return this.geometry_;
  }
}

var RenderBox$1 = RenderBox;

/**
 * @module ol/interaction/DragBox
 */

/**
 * A function that takes a {@link module:ol/MapBrowserEvent~MapBrowserEvent} and two
 * {@link module:ol/pixel~Pixel}s and returns a `{boolean}`. If the condition is met,
 * true should be returned.
 * @typedef {function(this: ?, import("../MapBrowserEvent.js").default, import("../pixel.js").Pixel, import("../pixel.js").Pixel):boolean} EndCondition
 */

/**
 * @typedef {Object} Options
 * @property {string} [className='ol-dragbox'] CSS class name for styling the box.
 * @property {import("../events/condition.js").Condition} [condition] A function that takes an {@link module:ol/MapBrowserEvent~MapBrowserEvent} and returns a boolean
 * to indicate whether that event should be handled.
 * Default is {@link ol/events/condition~mouseActionButton}.
 * @property {number} [minArea=64] The minimum area of the box in pixel, this value is used by the default
 * `boxEndCondition` function.
 * @property {EndCondition} [boxEndCondition] A function that takes a {@link module:ol/MapBrowserEvent~MapBrowserEvent} and two
 * {@link module:ol/pixel~Pixel}s to indicate whether a `boxend` event should be fired.
 * Default is `true` if the area of the box is bigger than the `minArea` option.
 * @property {function(this:DragBox, import("../MapBrowserEvent.js").default):void} [onBoxEnd] Code to execute just
 * before `boxend` is fired.
 */

/**
 * @enum {string}
 */
const DragBoxEventType = {
  /**
   * Triggered upon drag box start.
   * @event DragBoxEvent#boxstart
   * @api
   */
  BOXSTART: 'boxstart',

  /**
   * Triggered on drag when box is active.
   * @event DragBoxEvent#boxdrag
   * @api
   */
  BOXDRAG: 'boxdrag',

  /**
   * Triggered upon drag box end.
   * @event DragBoxEvent#boxend
   * @api
   */
  BOXEND: 'boxend',

  /**
   * Triggered upon drag box canceled.
   * @event DragBoxEvent#boxcancel
   * @api
   */
  BOXCANCEL: 'boxcancel',
};

/**
 * @classdesc
 * Events emitted by {@link module:ol/interaction/DragBox~DragBox} instances are instances of
 * this type.
 */
class DragBoxEvent extends Event {
  /**
   * @param {string} type The event type.
   * @param {import("../coordinate.js").Coordinate} coordinate The event coordinate.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Originating event.
   */
  constructor(type, coordinate, mapBrowserEvent) {
    super(type);

    /**
     * The coordinate of the drag event.
     * @const
     * @type {import("../coordinate.js").Coordinate}
     * @api
     */
    this.coordinate = coordinate;

    /**
     * @const
     * @type {import("../MapBrowserEvent.js").default}
     * @api
     */
    this.mapBrowserEvent = mapBrowserEvent;
  }
}

/***
 * @template Return
 * @typedef {import("../Observable").OnSignature<import("../Observable").EventTypes, import("../events/Event.js").default, Return> &
 *   import("../Observable").OnSignature<import("../ObjectEventType").Types|
 *     'change:active', import("../Object").ObjectEvent, Return> &
 *   import("../Observable").OnSignature<'boxcancel'|'boxdrag'|'boxend'|'boxstart', DragBoxEvent, Return> &
 *   import("../Observable").CombinedOnSignature<import("../Observable").EventTypes|import("../ObjectEventType").Types|
 *     'change:active'|'boxcancel'|'boxdrag'|'boxend', Return>} DragBoxOnSignature
 */

/**
 * @classdesc
 * Allows the user to draw a vector box by clicking and dragging on the map,
 * normally combined with an {@link module:ol/events/condition} that limits
 * it to when the shift or other key is held down. This is used, for example,
 * for zooming to a specific area of the map
 * (see {@link module:ol/interaction/DragZoom~DragZoom} and
 * {@link module:ol/interaction/DragRotateAndZoom~DragRotateAndZoom}).
 *
 * @fires DragBoxEvent
 * @api
 */
class DragBox extends PointerInteraction$1 {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    super();

    /***
     * @type {DragBoxOnSignature<import("../events").EventsKey>}
     */
    this.on;

    /***
     * @type {DragBoxOnSignature<import("../events").EventsKey>}
     */
    this.once;

    /***
     * @type {DragBoxOnSignature<void>}
     */
    this.un;

    options = options ? options : {};

    /**
     * @type {import("../render/Box.js").default}
     * @private
     */
    this.box_ = new RenderBox$1(options.className || 'ol-dragbox');

    /**
     * @type {number}
     * @private
     */
    this.minArea_ = options.minArea !== undefined ? options.minArea : 64;

    if (options.onBoxEnd) {
      this.onBoxEnd = options.onBoxEnd;
    }

    /**
     * @type {import("../pixel.js").Pixel}
     * @private
     */
    this.startPixel_ = null;

    /**
     * @private
     * @type {import("../events/condition.js").Condition}
     */
    this.condition_ = options.condition ? options.condition : mouseActionButton;

    /**
     * @private
     * @type {EndCondition}
     */
    this.boxEndCondition_ = options.boxEndCondition
      ? options.boxEndCondition
      : this.defaultBoxEndCondition;
  }

  /**
   * The default condition for determining whether the boxend event
   * should fire.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent The originating MapBrowserEvent
   *     leading to the box end.
   * @param {import("../pixel.js").Pixel} startPixel The starting pixel of the box.
   * @param {import("../pixel.js").Pixel} endPixel The end pixel of the box.
   * @return {boolean} Whether or not the boxend condition should be fired.
   */
  defaultBoxEndCondition(mapBrowserEvent, startPixel, endPixel) {
    const width = endPixel[0] - startPixel[0];
    const height = endPixel[1] - startPixel[1];
    return width * width + height * height >= this.minArea_;
  }

  /**
   * Returns geometry of last drawn box.
   * @return {import("../geom/Polygon.js").default} Geometry.
   * @api
   */
  getGeometry() {
    return this.box_.getGeometry();
  }

  /**
   * Handle pointer drag events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   */
  handleDragEvent(mapBrowserEvent) {
    this.box_.setPixels(this.startPixel_, mapBrowserEvent.pixel);

    this.dispatchEvent(
      new DragBoxEvent(
        DragBoxEventType.BOXDRAG,
        mapBrowserEvent.coordinate,
        mapBrowserEvent
      )
    );
  }

  /**
   * Handle pointer up events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean} If the event was consumed.
   */
  handleUpEvent(mapBrowserEvent) {
    this.box_.setMap(null);

    const completeBox = this.boxEndCondition_(
      mapBrowserEvent,
      this.startPixel_,
      mapBrowserEvent.pixel
    );
    if (completeBox) {
      this.onBoxEnd(mapBrowserEvent);
    }
    this.dispatchEvent(
      new DragBoxEvent(
        completeBox ? DragBoxEventType.BOXEND : DragBoxEventType.BOXCANCEL,
        mapBrowserEvent.coordinate,
        mapBrowserEvent
      )
    );
    return false;
  }

  /**
   * Handle pointer down events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean} If the event was consumed.
   */
  handleDownEvent(mapBrowserEvent) {
    if (this.condition_(mapBrowserEvent)) {
      this.startPixel_ = mapBrowserEvent.pixel;
      this.box_.setMap(mapBrowserEvent.map);
      this.box_.setPixels(this.startPixel_, this.startPixel_);
      this.dispatchEvent(
        new DragBoxEvent(
          DragBoxEventType.BOXSTART,
          mapBrowserEvent.coordinate,
          mapBrowserEvent
        )
      );
      return true;
    }
    return false;
  }

  /**
   * Function to execute just before `onboxend` is fired
   * @param {import("../MapBrowserEvent.js").default} event Event.
   */
  onBoxEnd(event) {}
}

var DragBox$1 = DragBox;

/**
 * @module ol/interaction/DragZoom
 */

/**
 * @typedef {Object} Options
 * @property {string} [className='ol-dragzoom'] CSS class name for styling the
 * box.
 * @property {import("../events/condition.js").Condition} [condition] A function that
 * takes an {@link module:ol/MapBrowserEvent~MapBrowserEvent} and returns a
 * boolean to indicate whether that event should be handled.
 * Default is {@link module:ol/events/condition.shiftKeyOnly}.
 * @property {number} [duration=200] Animation duration in milliseconds.
 * @property {boolean} [out=false] Use interaction for zooming out.
 * @property {number} [minArea=64] The minimum area of the box in pixel, this value is used by the parent default
 * `boxEndCondition` function.
 */

/**
 * @classdesc
 * Allows the user to zoom the map by clicking and dragging on the map,
 * normally combined with an {@link module:ol/events/condition} that limits
 * it to when a key, shift by default, is held down.
 *
 * To change the style of the box, use CSS and the `.ol-dragzoom` selector, or
 * your custom one configured with `className`.
 * @api
 */
class DragZoom extends DragBox$1 {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    options = options ? options : {};

    const condition = options.condition ? options.condition : shiftKeyOnly;

    super({
      condition: condition,
      className: options.className || 'ol-dragzoom',
      minArea: options.minArea,
    });

    /**
     * @private
     * @type {number}
     */
    this.duration_ = options.duration !== undefined ? options.duration : 200;

    /**
     * @private
     * @type {boolean}
     */
    this.out_ = options.out !== undefined ? options.out : false;
  }

  /**
   * Function to execute just before `onboxend` is fired
   * @param {import("../MapBrowserEvent.js").default} event Event.
   */
  onBoxEnd(event) {
    const map = this.getMap();
    const view = /** @type {!import("../View.js").default} */ (map.getView());
    let geometry = this.getGeometry();

    if (this.out_) {
      const rotatedExtent = view.rotatedExtentForGeometry(geometry);
      const resolution = view.getResolutionForExtentInternal(rotatedExtent);
      const factor = view.getResolution() / resolution;
      geometry = geometry.clone();
      geometry.scale(factor * factor);
    }

    view.fitInternal(geometry, {
      duration: this.duration_,
      easing: easeOut,
    });
  }
}

var DragZoom$1 = DragZoom;

/**
 * @module ol/events/KeyCode
 */

/**
 * @enum {number}
 * @const
 */
var KeyCode = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
};

/**
 * @module ol/interaction/KeyboardPan
 */

/**
 * @typedef {Object} Options
 * @property {import("../events/condition.js").Condition} [condition] A function that
 * takes an {@link module:ol/MapBrowserEvent~MapBrowserEvent} and returns a
 * boolean to indicate whether that event should be handled. Default is
 * {@link module:ol/events/condition.noModifierKeys} and
 * {@link module:ol/events/condition.targetNotEditable}.
 * @property {number} [duration=100] Animation duration in milliseconds.
 * @property {number} [pixelDelta=128] The amount of pixels to pan on each key
 * press.
 */

/**
 * @classdesc
 * Allows the user to pan the map using keyboard arrows.
 * Note that, although this interaction is by default included in maps,
 * the keys can only be used when browser focus is on the element to which
 * the keyboard events are attached. By default, this is the map div,
 * though you can change this with the `keyboardEventTarget` in
 * {@link module:ol/Map~Map}. `document` never loses focus but, for any other
 * element, focus will have to be on, and returned to, this element if the keys
 * are to function.
 * See also {@link module:ol/interaction/KeyboardZoom~KeyboardZoom}.
 * @api
 */
class KeyboardPan extends Interaction$1 {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    super();

    options = options || {};

    /**
     * @private
     * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Browser event.
     * @return {boolean} Combined condition result.
     */
    this.defaultCondition_ = function (mapBrowserEvent) {
      return (
        noModifierKeys(mapBrowserEvent) && targetNotEditable(mapBrowserEvent)
      );
    };

    /**
     * @private
     * @type {import("../events/condition.js").Condition}
     */
    this.condition_ =
      options.condition !== undefined
        ? options.condition
        : this.defaultCondition_;

    /**
     * @private
     * @type {number}
     */
    this.duration_ = options.duration !== undefined ? options.duration : 100;

    /**
     * @private
     * @type {number}
     */
    this.pixelDelta_ =
      options.pixelDelta !== undefined ? options.pixelDelta : 128;
  }

  /**
   * Handles the {@link module:ol/MapBrowserEvent~MapBrowserEvent map browser event} if it was a
   * `KeyEvent`, and decides the direction to pan to (if an arrow key was
   * pressed).
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} `false` to stop event propagation.
   */
  handleEvent(mapBrowserEvent) {
    let stopEvent = false;
    if (mapBrowserEvent.type == EventType.KEYDOWN) {
      const keyEvent = /** @type {KeyboardEvent} */ (
        mapBrowserEvent.originalEvent
      );
      const keyCode = keyEvent.keyCode;
      if (
        this.condition_(mapBrowserEvent) &&
        (keyCode == KeyCode.DOWN ||
          keyCode == KeyCode.LEFT ||
          keyCode == KeyCode.RIGHT ||
          keyCode == KeyCode.UP)
      ) {
        const map = mapBrowserEvent.map;
        const view = map.getView();
        const mapUnitsDelta = view.getResolution() * this.pixelDelta_;
        let deltaX = 0,
          deltaY = 0;
        if (keyCode == KeyCode.DOWN) {
          deltaY = -mapUnitsDelta;
        } else if (keyCode == KeyCode.LEFT) {
          deltaX = -mapUnitsDelta;
        } else if (keyCode == KeyCode.RIGHT) {
          deltaX = mapUnitsDelta;
        } else {
          deltaY = mapUnitsDelta;
        }
        const delta = [deltaX, deltaY];
        rotate$1(delta, view.getRotation());
        pan(view, delta, this.duration_);
        keyEvent.preventDefault();
        stopEvent = true;
      }
    }
    return !stopEvent;
  }
}

var KeyboardPan$1 = KeyboardPan;

/**
 * @module ol/interaction/KeyboardZoom
 */

/**
 * @typedef {Object} Options
 * @property {number} [duration=100] Animation duration in milliseconds.
 * @property {import("../events/condition.js").Condition} [condition] A function that
 * takes an {@link module:ol/MapBrowserEvent~MapBrowserEvent} and returns a
 * boolean to indicate whether that event should be handled. Default is
 * {@link module:ol/events/condition.targetNotEditable}.
 * @property {number} [delta=1] The zoom level delta on each key press.
 */

/**
 * @classdesc
 * Allows the user to zoom the map using keyboard + and -.
 * Note that, although this interaction is by default included in maps,
 * the keys can only be used when browser focus is on the element to which
 * the keyboard events are attached. By default, this is the map div,
 * though you can change this with the `keyboardEventTarget` in
 * {@link module:ol/Map~Map}. `document` never loses focus but, for any other
 * element, focus will have to be on, and returned to, this element if the keys
 * are to function.
 * See also {@link module:ol/interaction/KeyboardPan~KeyboardPan}.
 * @api
 */
class KeyboardZoom extends Interaction$1 {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    super();

    options = options ? options : {};

    /**
     * @private
     * @type {import("../events/condition.js").Condition}
     */
    this.condition_ = options.condition ? options.condition : targetNotEditable;

    /**
     * @private
     * @type {number}
     */
    this.delta_ = options.delta ? options.delta : 1;

    /**
     * @private
     * @type {number}
     */
    this.duration_ = options.duration !== undefined ? options.duration : 100;
  }

  /**
   * Handles the {@link module:ol/MapBrowserEvent~MapBrowserEvent map browser event} if it was a
   * `KeyEvent`, and decides whether to zoom in or out (depending on whether the
   * key pressed was '+' or '-').
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} `false` to stop event propagation.
   */
  handleEvent(mapBrowserEvent) {
    let stopEvent = false;
    if (
      mapBrowserEvent.type == EventType.KEYDOWN ||
      mapBrowserEvent.type == EventType.KEYPRESS
    ) {
      const keyEvent = /** @type {KeyboardEvent} */ (
        mapBrowserEvent.originalEvent
      );
      const charCode = keyEvent.charCode;
      if (
        this.condition_(mapBrowserEvent) &&
        (charCode == '+'.charCodeAt(0) || charCode == '-'.charCodeAt(0))
      ) {
        const map = mapBrowserEvent.map;
        const delta =
          charCode == '+'.charCodeAt(0) ? this.delta_ : -this.delta_;
        const view = map.getView();
        zoomByDelta(view, delta, undefined, this.duration_);
        keyEvent.preventDefault();
        stopEvent = true;
      }
    }
    return !stopEvent;
  }
}

var KeyboardZoom$1 = KeyboardZoom;

/**
 * @module ol/Kinetic
 */

/**
 * @classdesc
 * Implementation of inertial deceleration for map movement.
 *
 * @api
 */
class Kinetic {
  /**
   * @param {number} decay Rate of decay (must be negative).
   * @param {number} minVelocity Minimum velocity (pixels/millisecond).
   * @param {number} delay Delay to consider to calculate the kinetic
   *     initial values (milliseconds).
   */
  constructor(decay, minVelocity, delay) {
    /**
     * @private
     * @type {number}
     */
    this.decay_ = decay;

    /**
     * @private
     * @type {number}
     */
    this.minVelocity_ = minVelocity;

    /**
     * @private
     * @type {number}
     */
    this.delay_ = delay;

    /**
     * @private
     * @type {Array<number>}
     */
    this.points_ = [];

    /**
     * @private
     * @type {number}
     */
    this.angle_ = 0;

    /**
     * @private
     * @type {number}
     */
    this.initialVelocity_ = 0;
  }

  /**
   * FIXME empty description for jsdoc
   */
  begin() {
    this.points_.length = 0;
    this.angle_ = 0;
    this.initialVelocity_ = 0;
  }

  /**
   * @param {number} x X.
   * @param {number} y Y.
   */
  update(x, y) {
    this.points_.push(x, y, Date.now());
  }

  /**
   * @return {boolean} Whether we should do kinetic animation.
   */
  end() {
    if (this.points_.length < 6) {
      // at least 2 points are required (i.e. there must be at least 6 elements
      // in the array)
      return false;
    }
    const delay = Date.now() - this.delay_;
    const lastIndex = this.points_.length - 3;
    if (this.points_[lastIndex + 2] < delay) {
      // the last tracked point is too old, which means that the user stopped
      // panning before releasing the map
      return false;
    }

    // get the first point which still falls into the delay time
    let firstIndex = lastIndex - 3;
    while (firstIndex > 0 && this.points_[firstIndex + 2] > delay) {
      firstIndex -= 3;
    }

    const duration = this.points_[lastIndex + 2] - this.points_[firstIndex + 2];
    // we don't want a duration of 0 (divide by zero)
    // we also make sure the user panned for a duration of at least one frame
    // (1/60s) to compute sane displacement values
    if (duration < 1000 / 60) {
      return false;
    }

    const dx = this.points_[lastIndex] - this.points_[firstIndex];
    const dy = this.points_[lastIndex + 1] - this.points_[firstIndex + 1];
    this.angle_ = Math.atan2(dy, dx);
    this.initialVelocity_ = Math.sqrt(dx * dx + dy * dy) / duration;
    return this.initialVelocity_ > this.minVelocity_;
  }

  /**
   * @return {number} Total distance travelled (pixels).
   */
  getDistance() {
    return (this.minVelocity_ - this.initialVelocity_) / this.decay_;
  }

  /**
   * @return {number} Angle of the kinetic panning animation (radians).
   */
  getAngle() {
    return this.angle_;
  }
}

var Kinetic$1 = Kinetic;

/**
 * @module ol/interaction/MouseWheelZoom
 */

/**
 * @typedef {'trackpad' | 'wheel'} Mode
 */

/**
 * @typedef {Object} Options
 * @property {import("../events/condition.js").Condition} [condition] A function that
 * takes an {@link module:ol/MapBrowserEvent~MapBrowserEvent} and returns a
 * boolean to indicate whether that event should be handled. Default is
 * {@link module:ol/events/condition.always}.
 * @property {boolean} [onFocusOnly=false] When the map's target has a `tabindex` attribute set,
 * the interaction will only handle events when the map has the focus.
 * @property {number} [maxDelta=1] Maximum mouse wheel delta.
 * @property {number} [duration=250] Animation duration in milliseconds.
 * @property {number} [timeout=80] Mouse wheel timeout duration in milliseconds.
 * @property {boolean} [useAnchor=true] Enable zooming using the mouse's
 * location as the anchor. When set to `false`, zooming in and out will zoom to
 * the center of the screen instead of zooming on the mouse's location.
 * @property {boolean} [constrainResolution=false] If true, the mouse wheel zoom
 * event will always animate to the closest zoom level after an interaction;
 * false means intermediary zoom levels are allowed.
 */

/**
 * @classdesc
 * Allows the user to zoom the map by scrolling the mouse wheel.
 * @api
 */
class MouseWheelZoom extends Interaction$1 {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    options = options ? options : {};

    super(
      /** @type {import("./Interaction.js").InteractionOptions} */ (options)
    );

    /**
     * @private
     * @type {number}
     */
    this.totalDelta_ = 0;

    /**
     * @private
     * @type {number}
     */
    this.lastDelta_ = 0;

    /**
     * @private
     * @type {number}
     */
    this.maxDelta_ = options.maxDelta !== undefined ? options.maxDelta : 1;

    /**
     * @private
     * @type {number}
     */
    this.duration_ = options.duration !== undefined ? options.duration : 250;

    /**
     * @private
     * @type {number}
     */
    this.timeout_ = options.timeout !== undefined ? options.timeout : 80;

    /**
     * @private
     * @type {boolean}
     */
    this.useAnchor_ =
      options.useAnchor !== undefined ? options.useAnchor : true;

    /**
     * @private
     * @type {boolean}
     */
    this.constrainResolution_ =
      options.constrainResolution !== undefined
        ? options.constrainResolution
        : false;

    const condition = options.condition ? options.condition : always;

    /**
     * @private
     * @type {import("../events/condition.js").Condition}
     */
    this.condition_ = options.onFocusOnly
      ? all(focusWithTabindex, condition)
      : condition;

    /**
     * @private
     * @type {?import("../coordinate.js").Coordinate}
     */
    this.lastAnchor_ = null;

    /**
     * @private
     * @type {number|undefined}
     */
    this.startTime_ = undefined;

    /**
     * @private
     * @type {?}
     */
    this.timeoutId_;

    /**
     * @private
     * @type {Mode|undefined}
     */
    this.mode_ = undefined;

    /**
     * Trackpad events separated by this delay will be considered separate
     * interactions.
     * @type {number}
     */
    this.trackpadEventGap_ = 400;

    /**
     * @type {?}
     */
    this.trackpadTimeoutId_;

    /**
     * The number of delta values per zoom level
     * @private
     * @type {number}
     */
    this.deltaPerZoom_ = 300;
  }

  /**
   * @private
   */
  endInteraction_() {
    this.trackpadTimeoutId_ = undefined;
    const map = this.getMap();
    if (!map) {
      return;
    }
    const view = map.getView();
    view.endInteraction(
      undefined,
      this.lastDelta_ ? (this.lastDelta_ > 0 ? 1 : -1) : 0,
      this.lastAnchor_
    );
  }

  /**
   * Handles the {@link module:ol/MapBrowserEvent~MapBrowserEvent map browser event} (if it was a mousewheel-event) and eventually
   * zooms the map.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} `false` to stop event propagation.
   */
  handleEvent(mapBrowserEvent) {
    if (!this.condition_(mapBrowserEvent)) {
      return true;
    }
    const type = mapBrowserEvent.type;
    if (type !== EventType.WHEEL) {
      return true;
    }

    const map = mapBrowserEvent.map;
    const wheelEvent = /** @type {WheelEvent} */ (
      mapBrowserEvent.originalEvent
    );
    wheelEvent.preventDefault();

    if (this.useAnchor_) {
      this.lastAnchor_ = mapBrowserEvent.coordinate;
    }

    // Delta normalisation inspired by
    // https://github.com/mapbox/mapbox-gl-js/blob/001c7b9/js/ui/handler/scroll_zoom.js
    let delta;
    if (mapBrowserEvent.type == EventType.WHEEL) {
      delta = wheelEvent.deltaY;
      if (FIREFOX && wheelEvent.deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
        delta /= DEVICE_PIXEL_RATIO;
      }
      if (wheelEvent.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        delta *= 40;
      }
    }

    if (delta === 0) {
      return false;
    }
    this.lastDelta_ = delta;

    const now = Date.now();

    if (this.startTime_ === undefined) {
      this.startTime_ = now;
    }

    if (!this.mode_ || now - this.startTime_ > this.trackpadEventGap_) {
      this.mode_ = Math.abs(delta) < 4 ? 'trackpad' : 'wheel';
    }

    const view = map.getView();
    if (
      this.mode_ === 'trackpad' &&
      !(view.getConstrainResolution() || this.constrainResolution_)
    ) {
      if (this.trackpadTimeoutId_) {
        clearTimeout(this.trackpadTimeoutId_);
      } else {
        if (view.getAnimating()) {
          view.cancelAnimations();
        }
        view.beginInteraction();
      }
      this.trackpadTimeoutId_ = setTimeout(
        this.endInteraction_.bind(this),
        this.timeout_
      );
      view.adjustZoom(-delta / this.deltaPerZoom_, this.lastAnchor_);
      this.startTime_ = now;
      return false;
    }

    this.totalDelta_ += delta;

    const timeLeft = Math.max(this.timeout_ - (now - this.startTime_), 0);

    clearTimeout(this.timeoutId_);
    this.timeoutId_ = setTimeout(
      this.handleWheelZoom_.bind(this, map),
      timeLeft
    );

    return false;
  }

  /**
   * @private
   * @param {import("../Map.js").default} map Map.
   */
  handleWheelZoom_(map) {
    const view = map.getView();
    if (view.getAnimating()) {
      view.cancelAnimations();
    }
    let delta =
      -clamp(
        this.totalDelta_,
        -this.maxDelta_ * this.deltaPerZoom_,
        this.maxDelta_ * this.deltaPerZoom_
      ) / this.deltaPerZoom_;
    if (view.getConstrainResolution() || this.constrainResolution_) {
      // view has a zoom constraint, zoom by 1
      delta = delta ? (delta > 0 ? 1 : -1) : 0;
    }
    zoomByDelta(view, delta, this.lastAnchor_, this.duration_);

    this.mode_ = undefined;
    this.totalDelta_ = 0;
    this.lastAnchor_ = null;
    this.startTime_ = undefined;
    this.timeoutId_ = undefined;
  }

  /**
   * Enable or disable using the mouse's location as an anchor when zooming
   * @param {boolean} useAnchor true to zoom to the mouse's location, false
   * to zoom to the center of the map
   * @api
   */
  setMouseAnchor(useAnchor) {
    this.useAnchor_ = useAnchor;
    if (!useAnchor) {
      this.lastAnchor_ = null;
    }
  }
}

var MouseWheelZoom$1 = MouseWheelZoom;

/**
 * @module ol/interaction/PinchRotate
 */

/**
 * @typedef {Object} Options
 * @property {number} [duration=250] The duration of the animation in
 * milliseconds.
 * @property {number} [threshold=0.3] Minimal angle in radians to start a rotation.
 */

/**
 * @classdesc
 * Allows the user to rotate the map by twisting with two fingers
 * on a touch screen.
 * @api
 */
class PinchRotate extends PointerInteraction$1 {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    options = options ? options : {};

    const pointerOptions = /** @type {import("./Pointer.js").Options} */ (
      options
    );

    if (!pointerOptions.stopDown) {
      pointerOptions.stopDown = FALSE;
    }

    super(pointerOptions);

    /**
     * @private
     * @type {import("../coordinate.js").Coordinate}
     */
    this.anchor_ = null;

    /**
     * @private
     * @type {number|undefined}
     */
    this.lastAngle_ = undefined;

    /**
     * @private
     * @type {boolean}
     */
    this.rotating_ = false;

    /**
     * @private
     * @type {number}
     */
    this.rotationDelta_ = 0.0;

    /**
     * @private
     * @type {number}
     */
    this.threshold_ = options.threshold !== undefined ? options.threshold : 0.3;

    /**
     * @private
     * @type {number}
     */
    this.duration_ = options.duration !== undefined ? options.duration : 250;
  }

  /**
   * Handle pointer drag events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   */
  handleDragEvent(mapBrowserEvent) {
    let rotationDelta = 0.0;

    const touch0 = this.targetPointers[0];
    const touch1 = this.targetPointers[1];

    // angle between touches
    const angle = Math.atan2(
      touch1.clientY - touch0.clientY,
      touch1.clientX - touch0.clientX
    );

    if (this.lastAngle_ !== undefined) {
      const delta = angle - this.lastAngle_;
      this.rotationDelta_ += delta;
      if (!this.rotating_ && Math.abs(this.rotationDelta_) > this.threshold_) {
        this.rotating_ = true;
      }
      rotationDelta = delta;
    }
    this.lastAngle_ = angle;

    const map = mapBrowserEvent.map;
    const view = map.getView();
    if (view.getConstraints().rotation === disable) {
      return;
    }

    // rotate anchor point.
    // FIXME: should be the intersection point between the lines:
    //     touch0,touch1 and previousTouch0,previousTouch1
    this.anchor_ = map.getCoordinateFromPixelInternal(
      map.getEventPixel(centroid(this.targetPointers))
    );

    // rotate
    if (this.rotating_) {
      map.render();
      view.adjustRotationInternal(rotationDelta, this.anchor_);
    }
  }

  /**
   * Handle pointer up events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean} If the event was consumed.
   */
  handleUpEvent(mapBrowserEvent) {
    if (this.targetPointers.length < 2) {
      const map = mapBrowserEvent.map;
      const view = map.getView();
      view.endInteraction(this.duration_);
      return false;
    }
    return true;
  }

  /**
   * Handle pointer down events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean} If the event was consumed.
   */
  handleDownEvent(mapBrowserEvent) {
    if (this.targetPointers.length >= 2) {
      const map = mapBrowserEvent.map;
      this.anchor_ = null;
      this.lastAngle_ = undefined;
      this.rotating_ = false;
      this.rotationDelta_ = 0.0;
      if (!this.handlingDownUpSequence) {
        map.getView().beginInteraction();
      }
      return true;
    }
    return false;
  }
}

var PinchRotate$1 = PinchRotate;

/**
 * @module ol/interaction/PinchZoom
 */

/**
 * @typedef {Object} Options
 * @property {number} [duration=400] Animation duration in milliseconds.
 */

/**
 * @classdesc
 * Allows the user to zoom the map by pinching with two fingers
 * on a touch screen.
 * @api
 */
class PinchZoom extends PointerInteraction$1 {
  /**
   * @param {Options} [options] Options.
   */
  constructor(options) {
    options = options ? options : {};

    const pointerOptions = /** @type {import("./Pointer.js").Options} */ (
      options
    );

    if (!pointerOptions.stopDown) {
      pointerOptions.stopDown = FALSE;
    }

    super(pointerOptions);

    /**
     * @private
     * @type {import("../coordinate.js").Coordinate}
     */
    this.anchor_ = null;

    /**
     * @private
     * @type {number}
     */
    this.duration_ = options.duration !== undefined ? options.duration : 400;

    /**
     * @private
     * @type {number|undefined}
     */
    this.lastDistance_ = undefined;

    /**
     * @private
     * @type {number}
     */
    this.lastScaleDelta_ = 1;
  }

  /**
   * Handle pointer drag events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   */
  handleDragEvent(mapBrowserEvent) {
    let scaleDelta = 1.0;

    const touch0 = this.targetPointers[0];
    const touch1 = this.targetPointers[1];
    const dx = touch0.clientX - touch1.clientX;
    const dy = touch0.clientY - touch1.clientY;

    // distance between touches
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (this.lastDistance_ !== undefined) {
      scaleDelta = this.lastDistance_ / distance;
    }
    this.lastDistance_ = distance;

    const map = mapBrowserEvent.map;
    const view = map.getView();

    if (scaleDelta != 1.0) {
      this.lastScaleDelta_ = scaleDelta;
    }

    // scale anchor point.
    this.anchor_ = map.getCoordinateFromPixelInternal(
      map.getEventPixel(centroid(this.targetPointers))
    );

    // scale, bypass the resolution constraint
    map.render();
    view.adjustResolutionInternal(scaleDelta, this.anchor_);
  }

  /**
   * Handle pointer up events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean} If the event was consumed.
   */
  handleUpEvent(mapBrowserEvent) {
    if (this.targetPointers.length < 2) {
      const map = mapBrowserEvent.map;
      const view = map.getView();
      const direction = this.lastScaleDelta_ > 1 ? 1 : -1;
      view.endInteraction(this.duration_, direction);
      return false;
    }
    return true;
  }

  /**
   * Handle pointer down events.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean} If the event was consumed.
   */
  handleDownEvent(mapBrowserEvent) {
    if (this.targetPointers.length >= 2) {
      const map = mapBrowserEvent.map;
      this.anchor_ = null;
      this.lastDistance_ = undefined;
      this.lastScaleDelta_ = 1;
      if (!this.handlingDownUpSequence) {
        map.getView().beginInteraction();
      }
      return true;
    }
    return false;
  }
}

var PinchZoom$1 = PinchZoom;

/**
 * @module ol/interaction/defaults
 */

/**
 * @typedef {Object} DefaultsOptions
 * @property {boolean} [altShiftDragRotate=true] Whether Alt-Shift-drag rotate is
 * desired.
 * @property {boolean} [onFocusOnly=false] Interact only when the map has the
 * focus. This affects the `MouseWheelZoom` and `DragPan` interactions and is
 * useful when page scroll is desired for maps that do not have the browser's
 * focus.
 * @property {boolean} [doubleClickZoom=true] Whether double click zoom is
 * desired.
 * @property {boolean} [keyboard=true] Whether keyboard interaction is desired.
 * @property {boolean} [mouseWheelZoom=true] Whether mousewheel zoom is desired.
 * @property {boolean} [shiftDragZoom=true] Whether Shift-drag zoom is desired.
 * @property {boolean} [dragPan=true] Whether drag pan is desired.
 * @property {boolean} [pinchRotate=true] Whether pinch rotate is desired.
 * @property {boolean} [pinchZoom=true] Whether pinch zoom is desired.
 * @property {number} [zoomDelta] Zoom level delta when using keyboard or double click zoom.
 * @property {number} [zoomDuration] Duration of the zoom animation in
 * milliseconds.
 */

/**
 * Set of interactions included in maps by default. Specific interactions can be
 * excluded by setting the appropriate option to false in the constructor
 * options, but the order of the interactions is fixed.  If you want to specify
 * a different order for interactions, you will need to create your own
 * {@link module:ol/interaction/Interaction~Interaction} instances and insert
 * them into a {@link module:ol/Collection~Collection} in the order you want
 * before creating your {@link module:ol/Map~Map} instance. Changing the order can
 * be of interest if the event propagation needs to be stopped at a point.
 * The default set of interactions, in sequence, is:
 * * {@link module:ol/interaction/DragRotate~DragRotate}
 * * {@link module:ol/interaction/DoubleClickZoom~DoubleClickZoom}
 * * {@link module:ol/interaction/DragPan~DragPan}
 * * {@link module:ol/interaction/PinchRotate~PinchRotate}
 * * {@link module:ol/interaction/PinchZoom~PinchZoom}
 * * {@link module:ol/interaction/KeyboardPan~KeyboardPan}
 * * {@link module:ol/interaction/KeyboardZoom~KeyboardZoom}
 * * {@link module:ol/interaction/MouseWheelZoom~MouseWheelZoom}
 * * {@link module:ol/interaction/DragZoom~DragZoom}
 *
 * @param {DefaultsOptions} [options] Defaults options.
 * @return {Collection<import("./Interaction.js").default>}
 * A collection of interactions to be used with the {@link module:ol/Map~Map}
 * constructor's `interactions` option.
 * @api
 */
function defaults(options) {
  options = options ? options : {};

  /** @type {Collection<import("./Interaction.js").default>} */
  const interactions = new Collection$1();

  const kinetic = new Kinetic$1(-0.005, 0.05, 100);

  const altShiftDragRotate =
    options.altShiftDragRotate !== undefined
      ? options.altShiftDragRotate
      : true;
  if (altShiftDragRotate) {
    interactions.push(new DragRotate$1());
  }

  const doubleClickZoom =
    options.doubleClickZoom !== undefined ? options.doubleClickZoom : true;
  if (doubleClickZoom) {
    interactions.push(
      new DoubleClickZoom$1({
        delta: options.zoomDelta,
        duration: options.zoomDuration,
      })
    );
  }

  const dragPan = options.dragPan !== undefined ? options.dragPan : true;
  if (dragPan) {
    interactions.push(
      new DragPan$1({
        onFocusOnly: options.onFocusOnly,
        kinetic: kinetic,
      })
    );
  }

  const pinchRotate =
    options.pinchRotate !== undefined ? options.pinchRotate : true;
  if (pinchRotate) {
    interactions.push(new PinchRotate$1());
  }

  const pinchZoom = options.pinchZoom !== undefined ? options.pinchZoom : true;
  if (pinchZoom) {
    interactions.push(
      new PinchZoom$1({
        duration: options.zoomDuration,
      })
    );
  }

  const keyboard = options.keyboard !== undefined ? options.keyboard : true;
  if (keyboard) {
    interactions.push(new KeyboardPan$1());
    interactions.push(
      new KeyboardZoom$1({
        delta: options.zoomDelta,
        duration: options.zoomDuration,
      })
    );
  }

  const mouseWheelZoom =
    options.mouseWheelZoom !== undefined ? options.mouseWheelZoom : true;
  if (mouseWheelZoom) {
    interactions.push(
      new MouseWheelZoom$1({
        onFocusOnly: options.onFocusOnly,
        duration: options.zoomDuration,
      })
    );
  }

  const shiftDragZoom =
    options.shiftDragZoom !== undefined ? options.shiftDragZoom : true;
  if (shiftDragZoom) {
    interactions.push(
      new DragZoom$1({
        duration: options.zoomDuration,
      })
    );
  }

  return interactions;
}

/**
 * @module ol/size
 */

/**
 * Determines if a size has a positive area.
 * @param {Size} size The size to test.
 * @return {boolean} The size has a positive area.
 */
function hasArea(size) {
  return size[0] > 0 && size[1] > 0;
}

/**
 * Returns a size scaled by a ratio. The result will be an array of integers.
 * @param {Size} size Size.
 * @param {number} ratio Ratio.
 * @param {Size} [dest] Optional reusable size array.
 * @return {Size} The scaled size.
 */
function scale(size, ratio, dest) {
  if (dest === undefined) {
    dest = [0, 0];
  }
  dest[0] = (size[0] * ratio + 0.5) | 0;
  dest[1] = (size[1] * ratio + 0.5) | 0;
  return dest;
}

/**
 * Returns an `Size` array for the passed in number (meaning: square) or
 * `Size` array.
 * (meaning: non-square),
 * @param {number|Size} size Width and height.
 * @param {Size} [dest] Optional reusable size array.
 * @return {Size} Size.
 * @api
 */
function toSize(size, dest) {
  if (Array.isArray(size)) {
    return size;
  }
  if (dest === undefined) {
    dest = [size, size];
  } else {
    dest[0] = size;
    dest[1] = size;
  }
  return dest;
}

/**
 * @module ol/Map
 */

/**
 * State of the current frame. Only `pixelRatio`, `time` and `viewState` should
 * be used in applications.
 * @typedef {Object} FrameState
 * @property {number} pixelRatio The pixel ratio of the frame.
 * @property {number} time The time when rendering of the frame was requested.
 * @property {import("./View.js").State} viewState The state of the current view.
 * @property {boolean} animate Animate.
 * @property {import("./transform.js").Transform} coordinateToPixelTransform CoordinateToPixelTransform.
 * @property {import("rbush").default} declutterTree DeclutterTree.
 * @property {null|import("./extent.js").Extent} extent Extent.
 * @property {import("./extent.js").Extent} [nextExtent] Next extent during an animation series.
 * @property {number} index Index.
 * @property {Array<import("./layer/Layer.js").State>} layerStatesArray LayerStatesArray.
 * @property {number} layerIndex LayerIndex.
 * @property {import("./transform.js").Transform} pixelToCoordinateTransform PixelToCoordinateTransform.
 * @property {Array<PostRenderFunction>} postRenderFunctions PostRenderFunctions.
 * @property {import("./size.js").Size} size Size.
 * @property {TileQueue} tileQueue TileQueue.
 * @property {!Object<string, Object<string, boolean>>} usedTiles UsedTiles.
 * @property {Array<number>} viewHints ViewHints.
 * @property {!Object<string, Object<string, boolean>>} wantedTiles WantedTiles.
 * @property {string} mapId The id of the map.
 * @property {Object<string, boolean>} renderTargets Identifiers of previously rendered elements.
 */

/**
 * @typedef {function(Map, ?FrameState): any} PostRenderFunction
 */

/**
 * @typedef {Object} AtPixelOptions
 * @property {undefined|function(import("./layer/Layer.js").default<import("./source/Source").default>): boolean} [layerFilter] Layer filter
 * function. The filter function will receive one argument, the
 * {@link module:ol/layer/Layer~Layer layer-candidate} and it should return a boolean value.
 * Only layers which are visible and for which this function returns `true`
 * will be tested for features. By default, all visible layers will be tested.
 * @property {number} [hitTolerance=0] Hit-detection tolerance in css pixels. Pixels
 * inside the radius around the given position will be checked for features.
 * @property {boolean} [checkWrapped=true] Check-Wrapped Will check for wrapped geometries inside the range of
 *   +/- 1 world width. Works only if a projection is used that can be wrapped.
 */

/**
 * @typedef {Object} MapOptionsInternal
 * @property {Collection<import("./control/Control.js").default>} [controls] Controls.
 * @property {Collection<import("./interaction/Interaction.js").default>} [interactions] Interactions.
 * @property {HTMLElement|Document} keyboardEventTarget KeyboardEventTarget.
 * @property {Collection<import("./Overlay.js").default>} overlays Overlays.
 * @property {Object<string, *>} values Values.
 */

/**
 * @typedef {import("./ObjectEventType").Types|'change:layergroup'|'change:size'|'change:target'|'change:view'} MapObjectEventTypes
 */

/***
 * @template Return
 * @typedef {import("./Observable").OnSignature<import("./Observable").EventTypes, import("./events/Event.js").default, Return> &
 *    import("./Observable").OnSignature<MapObjectEventTypes, import("./Object").ObjectEvent, Return> &
 *    import("./Observable").OnSignature<import("./MapBrowserEventType").Types, import("./MapBrowserEvent").default, Return> &
 *    import("./Observable").OnSignature<import("./MapEventType").Types, import("./MapEvent").default, Return> &
 *    import("./Observable").OnSignature<import("./render/EventType").MapRenderEventTypes, import("./render/Event").default, Return> &
 *    import("./Observable").CombinedOnSignature<import("./Observable").EventTypes|MapObjectEventTypes|
 *      import("./MapBrowserEventType").Types|import("./MapEventType").Types|
 *      import("./render/EventType").MapRenderEventTypes, Return>} MapEventHandler
 */

/**
 * Object literal with config options for the map.
 * @typedef {Object} MapOptions
 * @property {Collection<import("./control/Control.js").default>|Array<import("./control/Control.js").default>} [controls]
 * Controls initially added to the map. If not specified,
 * {@link module:ol/control/defaults.defaults} is used.
 * @property {number} [pixelRatio=window.devicePixelRatio] The ratio between
 * physical pixels and device-independent pixels (dips) on the device.
 * @property {Collection<import("./interaction/Interaction.js").default>|Array<import("./interaction/Interaction.js").default>} [interactions]
 * Interactions that are initially added to the map. If not specified,
 * {@link module:ol/interaction/defaults.defaults} is used.
 * @property {HTMLElement|Document|string} [keyboardEventTarget] The element to
 * listen to keyboard events on. This determines when the `KeyboardPan` and
 * `KeyboardZoom` interactions trigger. For example, if this option is set to
 * `document` the keyboard interactions will always trigger. If this option is
 * not specified, the element the library listens to keyboard events on is the
 * map target (i.e. the user-provided div for the map). If this is not
 * `document`, the target element needs to be focused for key events to be
 * emitted, requiring that the target element has a `tabindex` attribute.
 * @property {Array<import("./layer/Base.js").default>|Collection<import("./layer/Base.js").default>|LayerGroup} [layers]
 * Layers. If this is not defined, a map with no layers will be rendered. Note
 * that layers are rendered in the order supplied, so if you want, for example,
 * a vector layer to appear on top of a tile layer, it must come after the tile
 * layer.
 * @property {number} [maxTilesLoading=16] Maximum number tiles to load
 * simultaneously.
 * @property {number} [moveTolerance=1] The minimum distance in pixels the
 * cursor must move to be detected as a map move event instead of a click.
 * Increasing this value can make it easier to click on the map.
 * @property {Collection<import("./Overlay.js").default>|Array<import("./Overlay.js").default>} [overlays]
 * Overlays initially added to the map. By default, no overlays are added.
 * @property {HTMLElement|string} [target] The container for the map, either the
 * element itself or the `id` of the element. If not specified at construction
 * time, {@link module:ol/Map~Map#setTarget} must be called for the map to be
 * rendered. If passed by element, the container can be in a secondary document.
 * **Note:** CSS `transform` support for the target element is limited to `scale`.
 * @property {View|Promise<import("./View.js").ViewOptions>} [view] The map's view.  No layer sources will be
 * fetched unless this is specified at construction time or through
 * {@link module:ol/Map~Map#setView}.
 */

/**
 * @param {import("./layer/Base.js").default} layer Layer.
 */
function removeLayerMapProperty(layer) {
  if (layer instanceof Layer$1) {
    layer.setMapInternal(null);
    return;
  }
  if (layer instanceof LayerGroup$1) {
    layer.getLayers().forEach(removeLayerMapProperty);
  }
}

/**
 * @param {import("./layer/Base.js").default} layer Layer.
 * @param {Map} map Map.
 */
function setLayerMapProperty(layer, map) {
  if (layer instanceof Layer$1) {
    layer.setMapInternal(map);
    return;
  }
  if (layer instanceof LayerGroup$1) {
    const layers = layer.getLayers().getArray();
    for (let i = 0, ii = layers.length; i < ii; ++i) {
      setLayerMapProperty(layers[i], map);
    }
  }
}

/**
 * @classdesc
 * The map is the core component of OpenLayers. For a map to render, a view,
 * one or more layers, and a target container are needed:
 *
 *     import Map from 'ol/Map.js';
 *     import View from 'ol/View.js';
 *     import TileLayer from 'ol/layer/Tile.js';
 *     import OSM from 'ol/source/OSM.js';
 *
 *     const map = new Map({
 *       view: new View({
 *         center: [0, 0],
 *         zoom: 1,
 *       }),
 *       layers: [
 *         new TileLayer({
 *           source: new OSM(),
 *         }),
 *       ],
 *       target: 'map',
 *     });
 *
 * The above snippet creates a map using a {@link module:ol/layer/Tile~TileLayer} to
 * display {@link module:ol/source/OSM~OSM} OSM data and render it to a DOM
 * element with the id `map`.
 *
 * The constructor places a viewport container (with CSS class name
 * `ol-viewport`) in the target element (see `getViewport()`), and then two
 * further elements within the viewport: one with CSS class name
 * `ol-overlaycontainer-stopevent` for controls and some overlays, and one with
 * CSS class name `ol-overlaycontainer` for other overlays (see the `stopEvent`
 * option of {@link module:ol/Overlay~Overlay} for the difference). The map
 * itself is placed in a further element within the viewport.
 *
 * Layers are stored as a {@link module:ol/Collection~Collection} in
 * layerGroups. A top-level group is provided by the library. This is what is
 * accessed by `getLayerGroup` and `setLayerGroup`. Layers entered in the
 * options are added to this group, and `addLayer` and `removeLayer` change the
 * layer collection in the group. `getLayers` is a convenience function for
 * `getLayerGroup().getLayers()`. Note that {@link module:ol/layer/Group~LayerGroup}
 * is a subclass of {@link module:ol/layer/Base~BaseLayer}, so layers entered in the
 * options or added with `addLayer` can be groups, which can contain further
 * groups, and so on.
 *
 * @fires import("./MapBrowserEvent.js").MapBrowserEvent
 * @fires import("./MapEvent.js").MapEvent
 * @fires import("./render/Event.js").default#precompose
 * @fires import("./render/Event.js").default#postcompose
 * @fires import("./render/Event.js").default#rendercomplete
 * @api
 */
class Map extends BaseObject$1 {
  /**
   * @param {MapOptions} [options] Map options.
   */
  constructor(options) {
    super();

    options = options || {};

    /***
     * @type {MapEventHandler<import("./events").EventsKey>}
     */
    this.on;

    /***
     * @type {MapEventHandler<import("./events").EventsKey>}
     */
    this.once;

    /***
     * @type {MapEventHandler<void>}
     */
    this.un;

    const optionsInternal = createOptionsInternal(options);

    /**
     * @private
     * @type {boolean|undefined}
     */
    this.renderComplete_;

    /**
     * @private
     * @type {boolean}
     */
    this.loaded_ = true;

    /** @private */
    this.boundHandleBrowserEvent_ = this.handleBrowserEvent.bind(this);

    /**
     * @type {number}
     * @private
     */
    this.maxTilesLoading_ =
      options.maxTilesLoading !== undefined ? options.maxTilesLoading : 16;

    /**
     * @private
     * @type {number}
     */
    this.pixelRatio_ =
      options.pixelRatio !== undefined
        ? options.pixelRatio
        : DEVICE_PIXEL_RATIO;

    /**
     * @private
     * @type {*}
     */
    this.postRenderTimeoutHandle_;

    /**
     * @private
     * @type {number|undefined}
     */
    this.animationDelayKey_;

    /**
     * @private
     */
    this.animationDelay_ = this.animationDelay_.bind(this);

    /**
     * @private
     * @type {import("./transform.js").Transform}
     */
    this.coordinateToPixelTransform_ = create();

    /**
     * @private
     * @type {import("./transform.js").Transform}
     */
    this.pixelToCoordinateTransform_ = create();

    /**
     * @private
     * @type {number}
     */
    this.frameIndex_ = 0;

    /**
     * @private
     * @type {?FrameState}
     */
    this.frameState_ = null;

    /**
     * The extent at the previous 'moveend' event.
     * @private
     * @type {import("./extent.js").Extent}
     */
    this.previousExtent_ = null;

    /**
     * @private
     * @type {?import("./events.js").EventsKey}
     */
    this.viewPropertyListenerKey_ = null;

    /**
     * @private
     * @type {?import("./events.js").EventsKey}
     */
    this.viewChangeListenerKey_ = null;

    /**
     * @private
     * @type {?Array<import("./events.js").EventsKey>}
     */
    this.layerGroupPropertyListenerKeys_ = null;

    /**
     * @private
     * @type {!HTMLElement}
     */
    this.viewport_ = document.createElement('div');
    this.viewport_.className =
      'ol-viewport' + ('ontouchstart' in window ? ' ol-touch' : '');
    this.viewport_.style.position = 'relative';
    this.viewport_.style.overflow = 'hidden';
    this.viewport_.style.width = '100%';
    this.viewport_.style.height = '100%';

    /**
     * @private
     * @type {!HTMLElement}
     */
    this.overlayContainer_ = document.createElement('div');
    this.overlayContainer_.style.position = 'absolute';
    this.overlayContainer_.style.zIndex = '0';
    this.overlayContainer_.style.width = '100%';
    this.overlayContainer_.style.height = '100%';
    this.overlayContainer_.style.pointerEvents = 'none';
    this.overlayContainer_.className = 'ol-overlaycontainer';
    this.viewport_.appendChild(this.overlayContainer_);

    /**
     * @private
     * @type {!HTMLElement}
     */
    this.overlayContainerStopEvent_ = document.createElement('div');
    this.overlayContainerStopEvent_.style.position = 'absolute';
    this.overlayContainerStopEvent_.style.zIndex = '0';
    this.overlayContainerStopEvent_.style.width = '100%';
    this.overlayContainerStopEvent_.style.height = '100%';
    this.overlayContainerStopEvent_.style.pointerEvents = 'none';
    this.overlayContainerStopEvent_.className = 'ol-overlaycontainer-stopevent';
    this.viewport_.appendChild(this.overlayContainerStopEvent_);

    /**
     * @private
     * @type {MapBrowserEventHandler}
     */
    this.mapBrowserEventHandler_ = null;

    /**
     * @private
     * @type {number}
     */
    this.moveTolerance_ = options.moveTolerance;

    /**
     * @private
     * @type {HTMLElement|Document}
     */
    this.keyboardEventTarget_ = optionsInternal.keyboardEventTarget;

    /**
     * @private
     * @type {?Array<import("./events.js").EventsKey>}
     */
    this.targetChangeHandlerKeys_ = null;

    /**
     * @private
     * @type {HTMLElement|null}
     */
    this.targetElement_ = null;

    /**
     * @type {ResizeObserver}
     */
    this.resizeObserver_ = new ResizeObserver(() => this.updateSize());

    /**
     * @type {Collection<import("./control/Control.js").default>}
     * @protected
     */
    this.controls = optionsInternal.controls || defaults$1();

    /**
     * @type {Collection<import("./interaction/Interaction.js").default>}
     * @protected
     */
    this.interactions =
      optionsInternal.interactions ||
      defaults({
        onFocusOnly: true,
      });

    /**
     * @type {Collection<import("./Overlay.js").default>}
     * @private
     */
    this.overlays_ = optionsInternal.overlays;

    /**
     * A lookup of overlays by id.
     * @private
     * @type {Object<string, import("./Overlay.js").default>}
     */
    this.overlayIdIndex_ = {};

    /**
     * @type {import("./renderer/Map.js").default|null}
     * @private
     */
    this.renderer_ = null;

    /**
     * @private
     * @type {!Array<PostRenderFunction>}
     */
    this.postRenderFunctions_ = [];

    /**
     * @private
     * @type {TileQueue}
     */
    this.tileQueue_ = new TileQueue$1(
      this.getTilePriority.bind(this),
      this.handleTileChange_.bind(this)
    );

    this.addChangeListener(
      MapProperty.LAYERGROUP,
      this.handleLayerGroupChanged_
    );
    this.addChangeListener(MapProperty.VIEW, this.handleViewChanged_);
    this.addChangeListener(MapProperty.SIZE, this.handleSizeChanged_);
    this.addChangeListener(MapProperty.TARGET, this.handleTargetChanged_);

    // setProperties will trigger the rendering of the map if the map
    // is "defined" already.
    this.setProperties(optionsInternal.values);

    const map = this;
    if (options.view && !(options.view instanceof View$1)) {
      options.view.then(function (viewOptions) {
        map.setView(new View$1(viewOptions));
      });
    }

    this.controls.addEventListener(
      CollectionEventType.ADD,
      /**
       * @param {import("./Collection.js").CollectionEvent<import("./control/Control.js").default>} event CollectionEvent
       */
      (event) => {
        event.element.setMap(this);
      }
    );

    this.controls.addEventListener(
      CollectionEventType.REMOVE,
      /**
       * @param {import("./Collection.js").CollectionEvent<import("./control/Control.js").default>} event CollectionEvent.
       */
      (event) => {
        event.element.setMap(null);
      }
    );

    this.interactions.addEventListener(
      CollectionEventType.ADD,
      /**
       * @param {import("./Collection.js").CollectionEvent<import("./interaction/Interaction.js").default>} event CollectionEvent.
       */
      (event) => {
        event.element.setMap(this);
      }
    );

    this.interactions.addEventListener(
      CollectionEventType.REMOVE,
      /**
       * @param {import("./Collection.js").CollectionEvent<import("./interaction/Interaction.js").default>} event CollectionEvent.
       */
      (event) => {
        event.element.setMap(null);
      }
    );

    this.overlays_.addEventListener(
      CollectionEventType.ADD,
      /**
       * @param {import("./Collection.js").CollectionEvent<import("./Overlay.js").default>} event CollectionEvent.
       */
      (event) => {
        this.addOverlayInternal_(event.element);
      }
    );

    this.overlays_.addEventListener(
      CollectionEventType.REMOVE,
      /**
       * @param {import("./Collection.js").CollectionEvent<import("./Overlay.js").default>} event CollectionEvent.
       */
      (event) => {
        const id = event.element.getId();
        if (id !== undefined) {
          delete this.overlayIdIndex_[id.toString()];
        }
        event.element.setMap(null);
      }
    );

    this.controls.forEach(
      /**
       * @param {import("./control/Control.js").default} control Control.
       */
      (control) => {
        control.setMap(this);
      }
    );

    this.interactions.forEach(
      /**
       * @param {import("./interaction/Interaction.js").default} interaction Interaction.
       */
      (interaction) => {
        interaction.setMap(this);
      }
    );

    this.overlays_.forEach(this.addOverlayInternal_.bind(this));
  }

  /**
   * Add the given control to the map.
   * @param {import("./control/Control.js").default} control Control.
   * @api
   */
  addControl(control) {
    this.getControls().push(control);
  }

  /**
   * Add the given interaction to the map. If you want to add an interaction
   * at another point of the collection use `getInteractions()` and the methods
   * available on {@link module:ol/Collection~Collection}. This can be used to
   * stop the event propagation from the handleEvent function. The interactions
   * get to handle the events in the reverse order of this collection.
   * @param {import("./interaction/Interaction.js").default} interaction Interaction to add.
   * @api
   */
  addInteraction(interaction) {
    this.getInteractions().push(interaction);
  }

  /**
   * Adds the given layer to the top of this map. If you want to add a layer
   * elsewhere in the stack, use `getLayers()` and the methods available on
   * {@link module:ol/Collection~Collection}.
   * @param {import("./layer/Base.js").default} layer Layer.
   * @api
   */
  addLayer(layer) {
    const layers = this.getLayerGroup().getLayers();
    layers.push(layer);
  }

  /**
   * @param {import("./layer/Group.js").GroupEvent} event The layer add event.
   * @private
   */
  handleLayerAdd_(event) {
    setLayerMapProperty(event.layer, this);
  }

  /**
   * Add the given overlay to the map.
   * @param {import("./Overlay.js").default} overlay Overlay.
   * @api
   */
  addOverlay(overlay) {
    this.getOverlays().push(overlay);
  }

  /**
   * This deals with map's overlay collection changes.
   * @param {import("./Overlay.js").default} overlay Overlay.
   * @private
   */
  addOverlayInternal_(overlay) {
    const id = overlay.getId();
    if (id !== undefined) {
      this.overlayIdIndex_[id.toString()] = overlay;
    }
    overlay.setMap(this);
  }

  /**
   *
   * Clean up.
   */
  disposeInternal() {
    this.controls.clear();
    this.interactions.clear();
    this.overlays_.clear();
    this.resizeObserver_.disconnect();
    this.setTarget(null);
    super.disposeInternal();
  }

  /**
   * Detect features that intersect a pixel on the viewport, and execute a
   * callback with each intersecting feature. Layers included in the detection can
   * be configured through the `layerFilter` option in `options`.
   * @param {import("./pixel.js").Pixel} pixel Pixel.
   * @param {function(import("./Feature.js").FeatureLike, import("./layer/Layer.js").default<import("./source/Source").default>, import("./geom/SimpleGeometry.js").default): T} callback Feature callback. The callback will be
   *     called with two arguments. The first argument is one
   *     {@link module:ol/Feature~Feature feature} or
   *     {@link module:ol/render/Feature~RenderFeature render feature} at the pixel, the second is
   *     the {@link module:ol/layer/Layer~Layer layer} of the feature and will be null for
   *     unmanaged layers. To stop detection, callback functions can return a
   *     truthy value.
   * @param {AtPixelOptions} [options] Optional options.
   * @return {T|undefined} Callback result, i.e. the return value of last
   * callback execution, or the first truthy callback return value.
   * @template T
   * @api
   */
  forEachFeatureAtPixel(pixel, callback, options) {
    if (!this.frameState_ || !this.renderer_) {
      return;
    }
    const coordinate = this.getCoordinateFromPixelInternal(pixel);
    options = options !== undefined ? options : {};
    const hitTolerance =
      options.hitTolerance !== undefined ? options.hitTolerance : 0;
    const layerFilter =
      options.layerFilter !== undefined ? options.layerFilter : TRUE;
    const checkWrapped = options.checkWrapped !== false;
    return this.renderer_.forEachFeatureAtCoordinate(
      coordinate,
      this.frameState_,
      hitTolerance,
      checkWrapped,
      callback,
      null,
      layerFilter,
      null
    );
  }

  /**
   * Get all features that intersect a pixel on the viewport.
   * @param {import("./pixel.js").Pixel} pixel Pixel.
   * @param {AtPixelOptions} [options] Optional options.
   * @return {Array<import("./Feature.js").FeatureLike>} The detected features or
   * an empty array if none were found.
   * @api
   */
  getFeaturesAtPixel(pixel, options) {
    const features = [];
    this.forEachFeatureAtPixel(
      pixel,
      function (feature) {
        features.push(feature);
      },
      options
    );
    return features;
  }

  /**
   * Get all layers from all layer groups.
   * @return {Array<import("./layer/Layer.js").default>} Layers.
   * @api
   */
  getAllLayers() {
    const layers = [];
    function addLayersFrom(layerGroup) {
      layerGroup.forEach(function (layer) {
        if (layer instanceof LayerGroup$1) {
          addLayersFrom(layer.getLayers());
        } else {
          layers.push(layer);
        }
      });
    }
    addLayersFrom(this.getLayers());
    return layers;
  }

  /**
   * Detect if features intersect a pixel on the viewport. Layers included in the
   * detection can be configured through the `layerFilter` option.
   * @param {import("./pixel.js").Pixel} pixel Pixel.
   * @param {AtPixelOptions} [options] Optional options.
   * @return {boolean} Is there a feature at the given pixel?
   * @api
   */
  hasFeatureAtPixel(pixel, options) {
    if (!this.frameState_ || !this.renderer_) {
      return false;
    }
    const coordinate = this.getCoordinateFromPixelInternal(pixel);
    options = options !== undefined ? options : {};
    const layerFilter =
      options.layerFilter !== undefined ? options.layerFilter : TRUE;
    const hitTolerance =
      options.hitTolerance !== undefined ? options.hitTolerance : 0;
    const checkWrapped = options.checkWrapped !== false;
    return this.renderer_.hasFeatureAtCoordinate(
      coordinate,
      this.frameState_,
      hitTolerance,
      checkWrapped,
      layerFilter,
      null
    );
  }

  /**
   * Returns the coordinate in user projection for a browser event.
   * @param {MouseEvent} event Event.
   * @return {import("./coordinate.js").Coordinate} Coordinate.
   * @api
   */
  getEventCoordinate(event) {
    return this.getCoordinateFromPixel(this.getEventPixel(event));
  }

  /**
   * Returns the coordinate in view projection for a browser event.
   * @param {MouseEvent} event Event.
   * @return {import("./coordinate.js").Coordinate} Coordinate.
   */
  getEventCoordinateInternal(event) {
    return this.getCoordinateFromPixelInternal(this.getEventPixel(event));
  }

  /**
   * Returns the map pixel position for a browser event relative to the viewport.
   * @param {UIEvent|{clientX: number, clientY: number}} event Event.
   * @return {import("./pixel.js").Pixel} Pixel.
   * @api
   */
  getEventPixel(event) {
    const viewport = this.viewport_;
    const viewportPosition = viewport.getBoundingClientRect();
    const viewportSize = this.getSize();
    const scaleX = viewportPosition.width / viewportSize[0];
    const scaleY = viewportPosition.height / viewportSize[1];
    const eventPosition =
      //FIXME Are we really calling this with a TouchEvent anywhere?
      'changedTouches' in event
        ? /** @type {TouchEvent} */ (event).changedTouches[0]
        : /** @type {MouseEvent} */ (event);

    return [
      (eventPosition.clientX - viewportPosition.left) / scaleX,
      (eventPosition.clientY - viewportPosition.top) / scaleY,
    ];
  }

  /**
   * Get the target in which this map is rendered.
   * Note that this returns what is entered as an option or in setTarget:
   * if that was an element, it returns an element; if a string, it returns that.
   * @return {HTMLElement|string|undefined} The Element or id of the Element that the
   *     map is rendered in.
   * @observable
   * @api
   */
  getTarget() {
    return /** @type {HTMLElement|string|undefined} */ (
      this.get(MapProperty.TARGET)
    );
  }

  /**
   * Get the DOM element into which this map is rendered. In contrast to
   * `getTarget` this method always return an `Element`, or `null` if the
   * map has no target.
   * @return {HTMLElement} The element that the map is rendered in.
   * @api
   */
  getTargetElement() {
    return this.targetElement_;
  }

  /**
   * Get the coordinate for a given pixel.  This returns a coordinate in the
   * user projection.
   * @param {import("./pixel.js").Pixel} pixel Pixel position in the map viewport.
   * @return {import("./coordinate.js").Coordinate} The coordinate for the pixel position.
   * @api
   */
  getCoordinateFromPixel(pixel) {
    return toUserCoordinate(
      this.getCoordinateFromPixelInternal(pixel),
      this.getView().getProjection()
    );
  }

  /**
   * Get the coordinate for a given pixel.  This returns a coordinate in the
   * map view projection.
   * @param {import("./pixel.js").Pixel} pixel Pixel position in the map viewport.
   * @return {import("./coordinate.js").Coordinate} The coordinate for the pixel position.
   */
  getCoordinateFromPixelInternal(pixel) {
    const frameState = this.frameState_;
    if (!frameState) {
      return null;
    }
    return apply(frameState.pixelToCoordinateTransform, pixel.slice());
  }

  /**
   * Get the map controls. Modifying this collection changes the controls
   * associated with the map.
   * @return {Collection<import("./control/Control.js").default>} Controls.
   * @api
   */
  getControls() {
    return this.controls;
  }

  /**
   * Get the map overlays. Modifying this collection changes the overlays
   * associated with the map.
   * @return {Collection<import("./Overlay.js").default>} Overlays.
   * @api
   */
  getOverlays() {
    return this.overlays_;
  }

  /**
   * Get an overlay by its identifier (the value returned by overlay.getId()).
   * Note that the index treats string and numeric identifiers as the same. So
   * `map.getOverlayById(2)` will return an overlay with id `'2'` or `2`.
   * @param {string|number} id Overlay identifier.
   * @return {import("./Overlay.js").default} Overlay.
   * @api
   */
  getOverlayById(id) {
    const overlay = this.overlayIdIndex_[id.toString()];
    return overlay !== undefined ? overlay : null;
  }

  /**
   * Get the map interactions. Modifying this collection changes the interactions
   * associated with the map.
   *
   * Interactions are used for e.g. pan, zoom and rotate.
   * @return {Collection<import("./interaction/Interaction.js").default>} Interactions.
   * @api
   */
  getInteractions() {
    return this.interactions;
  }

  /**
   * Get the layergroup associated with this map.
   * @return {LayerGroup} A layer group containing the layers in this map.
   * @observable
   * @api
   */
  getLayerGroup() {
    return /** @type {LayerGroup} */ (this.get(MapProperty.LAYERGROUP));
  }

  /**
   * Clear any existing layers and add layers to the map.
   * @param {Array<import("./layer/Base.js").default>|Collection<import("./layer/Base.js").default>} layers The layers to be added to the map.
   * @api
   */
  setLayers(layers) {
    const group = this.getLayerGroup();
    if (layers instanceof Collection$1) {
      group.setLayers(layers);
      return;
    }

    const collection = group.getLayers();
    collection.clear();
    collection.extend(layers);
  }

  /**
   * Get the collection of layers associated with this map.
   * @return {!Collection<import("./layer/Base.js").default>} Layers.
   * @api
   */
  getLayers() {
    const layers = this.getLayerGroup().getLayers();
    return layers;
  }

  /**
   * @return {boolean} Layers have sources that are still loading.
   */
  getLoadingOrNotReady() {
    const layerStatesArray = this.getLayerGroup().getLayerStatesArray();
    for (let i = 0, ii = layerStatesArray.length; i < ii; ++i) {
      const state = layerStatesArray[i];
      if (!state.visible) {
        continue;
      }
      const renderer = state.layer.getRenderer();
      if (renderer && !renderer.ready) {
        return true;
      }
      const source = state.layer.getSource();
      if (source && source.loading) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get the pixel for a coordinate.  This takes a coordinate in the user
   * projection and returns the corresponding pixel.
   * @param {import("./coordinate.js").Coordinate} coordinate A map coordinate.
   * @return {import("./pixel.js").Pixel} A pixel position in the map viewport.
   * @api
   */
  getPixelFromCoordinate(coordinate) {
    const viewCoordinate = fromUserCoordinate(
      coordinate,
      this.getView().getProjection()
    );
    return this.getPixelFromCoordinateInternal(viewCoordinate);
  }

  /**
   * Get the pixel for a coordinate.  This takes a coordinate in the map view
   * projection and returns the corresponding pixel.
   * @param {import("./coordinate.js").Coordinate} coordinate A map coordinate.
   * @return {import("./pixel.js").Pixel} A pixel position in the map viewport.
   */
  getPixelFromCoordinateInternal(coordinate) {
    const frameState = this.frameState_;
    if (!frameState) {
      return null;
    }
    return apply(
      frameState.coordinateToPixelTransform,
      coordinate.slice(0, 2)
    );
  }

  /**
   * Get the map renderer.
   * @return {import("./renderer/Map.js").default|null} Renderer
   */
  getRenderer() {
    return this.renderer_;
  }

  /**
   * Get the size of this map.
   * @return {import("./size.js").Size|undefined} The size in pixels of the map in the DOM.
   * @observable
   * @api
   */
  getSize() {
    return /** @type {import("./size.js").Size|undefined} */ (
      this.get(MapProperty.SIZE)
    );
  }

  /**
   * Get the view associated with this map. A view manages properties such as
   * center and resolution.
   * @return {View} The view that controls this map.
   * @observable
   * @api
   */
  getView() {
    return /** @type {View} */ (this.get(MapProperty.VIEW));
  }

  /**
   * Get the element that serves as the map viewport.
   * @return {HTMLElement} Viewport.
   * @api
   */
  getViewport() {
    return this.viewport_;
  }

  /**
   * Get the element that serves as the container for overlays.  Elements added to
   * this container will let mousedown and touchstart events through to the map,
   * so clicks and gestures on an overlay will trigger {@link module:ol/MapBrowserEvent~MapBrowserEvent}
   * events.
   * @return {!HTMLElement} The map's overlay container.
   */
  getOverlayContainer() {
    return this.overlayContainer_;
  }

  /**
   * Get the element that serves as a container for overlays that don't allow
   * event propagation. Elements added to this container won't let mousedown and
   * touchstart events through to the map, so clicks and gestures on an overlay
   * don't trigger any {@link module:ol/MapBrowserEvent~MapBrowserEvent}.
   * @return {!HTMLElement} The map's overlay container that stops events.
   */
  getOverlayContainerStopEvent() {
    return this.overlayContainerStopEvent_;
  }

  /**
   * @return {!Document} The document where the map is displayed.
   */
  getOwnerDocument() {
    const targetElement = this.getTargetElement();
    return targetElement ? targetElement.ownerDocument : document;
  }

  /**
   * @param {import("./Tile.js").default} tile Tile.
   * @param {string} tileSourceKey Tile source key.
   * @param {import("./coordinate.js").Coordinate} tileCenter Tile center.
   * @param {number} tileResolution Tile resolution.
   * @return {number} Tile priority.
   */
  getTilePriority(tile, tileSourceKey, tileCenter, tileResolution) {
    return getTilePriority(
      this.frameState_,
      tile,
      tileSourceKey,
      tileCenter,
      tileResolution
    );
  }

  /**
   * @param {UIEvent} browserEvent Browser event.
   * @param {string} [type] Type.
   */
  handleBrowserEvent(browserEvent, type) {
    type = type || browserEvent.type;
    const mapBrowserEvent = new MapBrowserEvent$1(type, this, browserEvent);
    this.handleMapBrowserEvent(mapBrowserEvent);
  }

  /**
   * @param {MapBrowserEvent} mapBrowserEvent The event to handle.
   */
  handleMapBrowserEvent(mapBrowserEvent) {
    if (!this.frameState_) {
      // With no view defined, we cannot translate pixels into geographical
      // coordinates so interactions cannot be used.
      return;
    }
    const originalEvent = /** @type {PointerEvent} */ (
      mapBrowserEvent.originalEvent
    );
    const eventType = originalEvent.type;
    if (
      eventType === PointerEventType.POINTERDOWN ||
      eventType === EventType.WHEEL ||
      eventType === EventType.KEYDOWN
    ) {
      const doc = this.getOwnerDocument();
      const rootNode = this.viewport_.getRootNode
        ? this.viewport_.getRootNode()
        : doc;
      const target = /** @type {Node} */ (originalEvent.target);
      if (
        // Abort if the target is a child of the container for elements whose events are not meant
        // to be handled by map interactions.
        this.overlayContainerStopEvent_.contains(target) ||
        // Abort if the event target is a child of the container that is no longer in the page.
        // It's possible for the target to no longer be in the page if it has been removed in an
        // event listener, this might happen in a Control that recreates it's content based on
        // user interaction either manually or via a render in something like https://reactjs.org/
        !(rootNode === doc ? doc.documentElement : rootNode).contains(target)
      ) {
        return;
      }
    }
    mapBrowserEvent.frameState = this.frameState_;
    if (this.dispatchEvent(mapBrowserEvent) !== false) {
      const interactionsArray = this.getInteractions().getArray().slice();
      for (let i = interactionsArray.length - 1; i >= 0; i--) {
        const interaction = interactionsArray[i];
        if (
          interaction.getMap() !== this ||
          !interaction.getActive() ||
          !this.getTargetElement()
        ) {
          continue;
        }
        const cont = interaction.handleEvent(mapBrowserEvent);
        if (!cont || mapBrowserEvent.propagationStopped) {
          break;
        }
      }
    }
  }

  /**
   * @protected
   */
  handlePostRender() {
    const frameState = this.frameState_;

    // Manage the tile queue
    // Image loads are expensive and a limited resource, so try to use them
    // efficiently:
    // * When the view is static we allow a large number of parallel tile loads
    //   to complete the frame as quickly as possible.
    // * When animating or interacting, image loads can cause janks, so we reduce
    //   the maximum number of loads per frame and limit the number of parallel
    //   tile loads to remain reactive to view changes and to reduce the chance of
    //   loading tiles that will quickly disappear from view.
    const tileQueue = this.tileQueue_;
    if (!tileQueue.isEmpty()) {
      let maxTotalLoading = this.maxTilesLoading_;
      let maxNewLoads = maxTotalLoading;
      if (frameState) {
        const hints = frameState.viewHints;
        if (hints[ViewHint.ANIMATING] || hints[ViewHint.INTERACTING]) {
          const lowOnFrameBudget = Date.now() - frameState.time > 8;
          maxTotalLoading = lowOnFrameBudget ? 0 : 8;
          maxNewLoads = lowOnFrameBudget ? 0 : 2;
        }
      }
      if (tileQueue.getTilesLoading() < maxTotalLoading) {
        tileQueue.reprioritize(); // FIXME only call if view has changed
        tileQueue.loadMoreTiles(maxTotalLoading, maxNewLoads);
      }
    }

    if (frameState && this.renderer_ && !frameState.animate) {
      if (this.renderComplete_ === true) {
        if (this.hasListener(RenderEventType.RENDERCOMPLETE)) {
          this.renderer_.dispatchRenderEvent(
            RenderEventType.RENDERCOMPLETE,
            frameState
          );
        }
        if (this.loaded_ === false) {
          this.loaded_ = true;
          this.dispatchEvent(
            new MapEvent$1(MapEventType.LOADEND, this, frameState)
          );
        }
      } else if (this.loaded_ === true) {
        this.loaded_ = false;
        this.dispatchEvent(
          new MapEvent$1(MapEventType.LOADSTART, this, frameState)
        );
      }
    }

    const postRenderFunctions = this.postRenderFunctions_;
    for (let i = 0, ii = postRenderFunctions.length; i < ii; ++i) {
      postRenderFunctions[i](this, frameState);
    }
    postRenderFunctions.length = 0;
  }

  /**
   * @private
   */
  handleSizeChanged_() {
    if (this.getView() && !this.getView().getAnimating()) {
      this.getView().resolveConstraints(0);
    }

    this.render();
  }

  /**
   * @private
   */
  handleTargetChanged_() {
    if (this.mapBrowserEventHandler_) {
      for (let i = 0, ii = this.targetChangeHandlerKeys_.length; i < ii; ++i) {
        unlistenByKey(this.targetChangeHandlerKeys_[i]);
      }
      this.targetChangeHandlerKeys_ = null;
      this.viewport_.removeEventListener(
        EventType.CONTEXTMENU,
        this.boundHandleBrowserEvent_
      );
      this.viewport_.removeEventListener(
        EventType.WHEEL,
        this.boundHandleBrowserEvent_
      );
      this.mapBrowserEventHandler_.dispose();
      this.mapBrowserEventHandler_ = null;
      removeNode(this.viewport_);
    }

    if (this.targetElement_) {
      this.resizeObserver_.unobserve(this.targetElement_);
      const rootNode = this.targetElement_.getRootNode();
      if (rootNode instanceof ShadowRoot) {
        this.resizeObserver_.unobserve(rootNode.host);
      }
    }

    // target may be undefined, null, a string or an Element.
    // If it's a string we convert it to an Element before proceeding.
    // If it's not now an Element we remove the viewport from the DOM.
    // If it's an Element we append the viewport element to it.

    const target = this.getTarget();
    const targetElement =
      typeof target === 'string' ? document.getElementById(target) : target;
    this.targetElement_ = targetElement;
    if (!targetElement) {
      if (this.renderer_) {
        clearTimeout(this.postRenderTimeoutHandle_);
        this.postRenderTimeoutHandle_ = undefined;
        this.postRenderFunctions_.length = 0;
        this.renderer_.dispose();
        this.renderer_ = null;
      }
      if (this.animationDelayKey_) {
        cancelAnimationFrame(this.animationDelayKey_);
        this.animationDelayKey_ = undefined;
      }
    } else {
      targetElement.appendChild(this.viewport_);
      if (!this.renderer_) {
        this.renderer_ = new CompositeMapRenderer$1(this);
      }

      this.mapBrowserEventHandler_ = new MapBrowserEventHandler$1(
        this,
        this.moveTolerance_
      );
      for (const key in MapBrowserEventType) {
        this.mapBrowserEventHandler_.addEventListener(
          MapBrowserEventType[key],
          this.handleMapBrowserEvent.bind(this)
        );
      }
      this.viewport_.addEventListener(
        EventType.CONTEXTMENU,
        this.boundHandleBrowserEvent_,
        false
      );
      this.viewport_.addEventListener(
        EventType.WHEEL,
        this.boundHandleBrowserEvent_,
        PASSIVE_EVENT_LISTENERS ? {passive: false} : false
      );

      const keyboardEventTarget = !this.keyboardEventTarget_
        ? targetElement
        : this.keyboardEventTarget_;
      this.targetChangeHandlerKeys_ = [
        listen(
          keyboardEventTarget,
          EventType.KEYDOWN,
          this.handleBrowserEvent,
          this
        ),
        listen(
          keyboardEventTarget,
          EventType.KEYPRESS,
          this.handleBrowserEvent,
          this
        ),
      ];
      const rootNode = targetElement.getRootNode();
      if (rootNode instanceof ShadowRoot) {
        this.resizeObserver_.observe(rootNode.host);
      }
      this.resizeObserver_.observe(targetElement);
    }

    this.updateSize();
    // updateSize calls setSize, so no need to call this.render
    // ourselves here.
  }

  /**
   * @private
   */
  handleTileChange_() {
    this.render();
  }

  /**
   * @private
   */
  handleViewPropertyChanged_() {
    this.render();
  }

  /**
   * @private
   */
  handleViewChanged_() {
    if (this.viewPropertyListenerKey_) {
      unlistenByKey(this.viewPropertyListenerKey_);
      this.viewPropertyListenerKey_ = null;
    }
    if (this.viewChangeListenerKey_) {
      unlistenByKey(this.viewChangeListenerKey_);
      this.viewChangeListenerKey_ = null;
    }
    const view = this.getView();
    if (view) {
      this.updateViewportSize_();

      this.viewPropertyListenerKey_ = listen(
        view,
        ObjectEventType.PROPERTYCHANGE,
        this.handleViewPropertyChanged_,
        this
      );
      this.viewChangeListenerKey_ = listen(
        view,
        EventType.CHANGE,
        this.handleViewPropertyChanged_,
        this
      );

      view.resolveConstraints(0);
    }
    this.render();
  }

  /**
   * @private
   */
  handleLayerGroupChanged_() {
    if (this.layerGroupPropertyListenerKeys_) {
      this.layerGroupPropertyListenerKeys_.forEach(unlistenByKey);
      this.layerGroupPropertyListenerKeys_ = null;
    }
    const layerGroup = this.getLayerGroup();
    if (layerGroup) {
      this.handleLayerAdd_(new GroupEvent('addlayer', layerGroup));
      this.layerGroupPropertyListenerKeys_ = [
        listen(layerGroup, ObjectEventType.PROPERTYCHANGE, this.render, this),
        listen(layerGroup, EventType.CHANGE, this.render, this),
        listen(layerGroup, 'addlayer', this.handleLayerAdd_, this),
        listen(layerGroup, 'removelayer', this.handleLayerRemove_, this),
      ];
    }
    this.render();
  }

  /**
   * @return {boolean} Is rendered.
   */
  isRendered() {
    return !!this.frameState_;
  }

  /**
   * @private
   */
  animationDelay_() {
    this.animationDelayKey_ = undefined;
    this.renderFrame_(Date.now());
  }

  /**
   * Requests an immediate render in a synchronous manner.
   * @api
   */
  renderSync() {
    if (this.animationDelayKey_) {
      cancelAnimationFrame(this.animationDelayKey_);
    }
    this.animationDelay_();
  }

  /**
   * Redraws all text after new fonts have loaded
   */
  redrawText() {
    const layerStates = this.getLayerGroup().getLayerStatesArray();
    for (let i = 0, ii = layerStates.length; i < ii; ++i) {
      const layer = layerStates[i].layer;
      if (layer.hasRenderer()) {
        layer.getRenderer().handleFontsChanged();
      }
    }
  }

  /**
   * Request a map rendering (at the next animation frame).
   * @api
   */
  render() {
    if (this.renderer_ && this.animationDelayKey_ === undefined) {
      this.animationDelayKey_ = requestAnimationFrame(this.animationDelay_);
    }
  }

  /**
   * Remove the given control from the map.
   * @param {import("./control/Control.js").default} control Control.
   * @return {import("./control/Control.js").default|undefined} The removed control (or undefined
   *     if the control was not found).
   * @api
   */
  removeControl(control) {
    return this.getControls().remove(control);
  }

  /**
   * Remove the given interaction from the map.
   * @param {import("./interaction/Interaction.js").default} interaction Interaction to remove.
   * @return {import("./interaction/Interaction.js").default|undefined} The removed interaction (or
   *     undefined if the interaction was not found).
   * @api
   */
  removeInteraction(interaction) {
    return this.getInteractions().remove(interaction);
  }

  /**
   * Removes the given layer from the map.
   * @param {import("./layer/Base.js").default} layer Layer.
   * @return {import("./layer/Base.js").default|undefined} The removed layer (or undefined if the
   *     layer was not found).
   * @api
   */
  removeLayer(layer) {
    const layers = this.getLayerGroup().getLayers();
    return layers.remove(layer);
  }

  /**
   * @param {import("./layer/Group.js").GroupEvent} event The layer remove event.
   * @private
   */
  handleLayerRemove_(event) {
    removeLayerMapProperty(event.layer);
  }

  /**
   * Remove the given overlay from the map.
   * @param {import("./Overlay.js").default} overlay Overlay.
   * @return {import("./Overlay.js").default|undefined} The removed overlay (or undefined
   *     if the overlay was not found).
   * @api
   */
  removeOverlay(overlay) {
    return this.getOverlays().remove(overlay);
  }

  /**
   * @param {number} time Time.
   * @private
   */
  renderFrame_(time) {
    const size = this.getSize();
    const view = this.getView();
    const previousFrameState = this.frameState_;
    /** @type {?FrameState} */
    let frameState = null;
    if (size !== undefined && hasArea(size) && view && view.isDef()) {
      const viewHints = view.getHints(
        this.frameState_ ? this.frameState_.viewHints : undefined
      );
      const viewState = view.getState();
      frameState = {
        animate: false,
        coordinateToPixelTransform: this.coordinateToPixelTransform_,
        declutterTree: null,
        extent: getForViewAndSize(
          viewState.center,
          viewState.resolution,
          viewState.rotation,
          size
        ),
        index: this.frameIndex_++,
        layerIndex: 0,
        layerStatesArray: this.getLayerGroup().getLayerStatesArray(),
        pixelRatio: this.pixelRatio_,
        pixelToCoordinateTransform: this.pixelToCoordinateTransform_,
        postRenderFunctions: [],
        size: size,
        tileQueue: this.tileQueue_,
        time: time,
        usedTiles: {},
        viewState: viewState,
        viewHints: viewHints,
        wantedTiles: {},
        mapId: getUid(this),
        renderTargets: {},
      };
      if (viewState.nextCenter && viewState.nextResolution) {
        const rotation = isNaN(viewState.nextRotation)
          ? viewState.rotation
          : viewState.nextRotation;

        frameState.nextExtent = getForViewAndSize(
          viewState.nextCenter,
          viewState.nextResolution,
          rotation,
          size
        );
      }
    }

    this.frameState_ = frameState;
    this.renderer_.renderFrame(frameState);

    if (frameState) {
      if (frameState.animate) {
        this.render();
      }
      Array.prototype.push.apply(
        this.postRenderFunctions_,
        frameState.postRenderFunctions
      );

      if (previousFrameState) {
        const moveStart =
          !this.previousExtent_ ||
          (!isEmpty(this.previousExtent_) &&
            !equals$1(frameState.extent, this.previousExtent_));
        if (moveStart) {
          this.dispatchEvent(
            new MapEvent$1(MapEventType.MOVESTART, this, previousFrameState)
          );
          this.previousExtent_ = createOrUpdateEmpty(this.previousExtent_);
        }
      }

      const idle =
        this.previousExtent_ &&
        !frameState.viewHints[ViewHint.ANIMATING] &&
        !frameState.viewHints[ViewHint.INTERACTING] &&
        !equals$1(frameState.extent, this.previousExtent_);

      if (idle) {
        this.dispatchEvent(
          new MapEvent$1(MapEventType.MOVEEND, this, frameState)
        );
        clone(frameState.extent, this.previousExtent_);
      }
    }

    this.dispatchEvent(new MapEvent$1(MapEventType.POSTRENDER, this, frameState));

    this.renderComplete_ =
      this.hasListener(MapEventType.LOADSTART) ||
      this.hasListener(MapEventType.LOADEND) ||
      this.hasListener(RenderEventType.RENDERCOMPLETE)
        ? !this.tileQueue_.getTilesLoading() &&
          !this.tileQueue_.getCount() &&
          !this.getLoadingOrNotReady()
        : undefined;

    if (!this.postRenderTimeoutHandle_) {
      this.postRenderTimeoutHandle_ = setTimeout(() => {
        this.postRenderTimeoutHandle_ = undefined;
        this.handlePostRender();
      }, 0);
    }
  }

  /**
   * Sets the layergroup of this map.
   * @param {LayerGroup} layerGroup A layer group containing the layers in this map.
   * @observable
   * @api
   */
  setLayerGroup(layerGroup) {
    const oldLayerGroup = this.getLayerGroup();
    if (oldLayerGroup) {
      this.handleLayerRemove_(new GroupEvent('removelayer', oldLayerGroup));
    }
    this.set(MapProperty.LAYERGROUP, layerGroup);
  }

  /**
   * Set the size of this map.
   * @param {import("./size.js").Size|undefined} size The size in pixels of the map in the DOM.
   * @observable
   * @api
   */
  setSize(size) {
    this.set(MapProperty.SIZE, size);
  }

  /**
   * Set the target element to render this map into.
   * @param {HTMLElement|string} [target] The Element or id of the Element
   *     that the map is rendered in.
   * @observable
   * @api
   */
  setTarget(target) {
    this.set(MapProperty.TARGET, target);
  }

  /**
   * Set the view for this map.
   * @param {View|Promise<import("./View.js").ViewOptions>} view The view that controls this map.
   * It is also possible to pass a promise that resolves to options for constructing a view.  This
   * alternative allows view properties to be resolved by sources or other components that load
   * view-related metadata.
   * @observable
   * @api
   */
  setView(view) {
    if (!view || view instanceof View$1) {
      this.set(MapProperty.VIEW, view);
      return;
    }
    this.set(MapProperty.VIEW, new View$1());

    const map = this;
    view.then(function (viewOptions) {
      map.setView(new View$1(viewOptions));
    });
  }

  /**
   * Force a recalculation of the map viewport size.  This should be called when
   * third-party code changes the size of the map viewport.
   * @api
   */
  updateSize() {
    const targetElement = this.getTargetElement();

    let size = undefined;
    if (targetElement) {
      const computedStyle = getComputedStyle(targetElement);
      const width =
        targetElement.offsetWidth -
        parseFloat(computedStyle['borderLeftWidth']) -
        parseFloat(computedStyle['paddingLeft']) -
        parseFloat(computedStyle['paddingRight']) -
        parseFloat(computedStyle['borderRightWidth']);
      const height =
        targetElement.offsetHeight -
        parseFloat(computedStyle['borderTopWidth']) -
        parseFloat(computedStyle['paddingTop']) -
        parseFloat(computedStyle['paddingBottom']) -
        parseFloat(computedStyle['borderBottomWidth']);
      if (!isNaN(width) && !isNaN(height)) {
        size = [width, height];
        if (
          !hasArea(size) &&
          !!(
            targetElement.offsetWidth ||
            targetElement.offsetHeight ||
            targetElement.getClientRects().length
          )
        ) {
          warn(
            "No map visible because the map container's width or height are 0."
          );
        }
      }
    }

    const oldSize = this.getSize();
    if (size && (!oldSize || !equals$2(size, oldSize))) {
      this.setSize(size);
      this.updateViewportSize_();
    }
  }

  /**
   * Recomputes the viewport size and save it on the view object (if any)
   * @private
   */
  updateViewportSize_() {
    const view = this.getView();
    if (view) {
      let size = undefined;
      const computedStyle = getComputedStyle(this.viewport_);
      if (computedStyle.width && computedStyle.height) {
        size = [
          parseInt(computedStyle.width, 10),
          parseInt(computedStyle.height, 10),
        ];
      }
      view.setViewportSize(size);
    }
  }
}

/**
 * @param {MapOptions} options Map options.
 * @return {MapOptionsInternal} Internal map options.
 */
function createOptionsInternal(options) {
  /**
   * @type {HTMLElement|Document}
   */
  let keyboardEventTarget = null;
  if (options.keyboardEventTarget !== undefined) {
    keyboardEventTarget =
      typeof options.keyboardEventTarget === 'string'
        ? document.getElementById(options.keyboardEventTarget)
        : options.keyboardEventTarget;
  }

  /**
   * @type {Object<string, *>}
   */
  const values = {};

  const layerGroup =
    options.layers &&
    typeof (/** @type {?} */ (options.layers).getLayers) === 'function'
      ? /** @type {LayerGroup} */ (options.layers)
      : new LayerGroup$1({
          layers:
            /** @type {Collection<import("./layer/Base.js").default>|Array<import("./layer/Base.js").default>} */ (
              options.layers
            ),
        });
  values[MapProperty.LAYERGROUP] = layerGroup;

  values[MapProperty.TARGET] = options.target;

  values[MapProperty.VIEW] =
    options.view instanceof View$1 ? options.view : new View$1();

  /** @type {Collection<import("./control/Control.js").default>} */
  let controls;
  if (options.controls !== undefined) {
    if (Array.isArray(options.controls)) {
      controls = new Collection$1(options.controls.slice());
    } else {
      assert(
        typeof (/** @type {?} */ (options.controls).getArray) === 'function',
        47
      ); // Expected `controls` to be an array or an `import("./Collection.js").Collection`
      controls = options.controls;
    }
  }

  /** @type {Collection<import("./interaction/Interaction").default>} */
  let interactions;
  if (options.interactions !== undefined) {
    if (Array.isArray(options.interactions)) {
      interactions = new Collection$1(options.interactions.slice());
    } else {
      assert(
        typeof (/** @type {?} */ (options.interactions).getArray) ===
          'function',
        48
      ); // Expected `interactions` to be an array or an `import("./Collection.js").Collection`
      interactions = options.interactions;
    }
  }

  /** @type {Collection<import("./Overlay.js").default>} */
  let overlays;
  if (options.overlays !== undefined) {
    if (Array.isArray(options.overlays)) {
      overlays = new Collection$1(options.overlays.slice());
    } else {
      assert(
        typeof (/** @type {?} */ (options.overlays).getArray) === 'function',
        49
      ); // Expected `overlays` to be an array or an `import("./Collection.js").Collection`
      overlays = options.overlays;
    }
  } else {
    overlays = new Collection$1();
  }

  return {
    controls: controls,
    interactions: interactions,
    keyboardEventTarget: keyboardEventTarget,
    overlays: overlays,
    values: values,
  };
}
var Map$1 = Map;

/**
 * @module ol/layer/TileProperty
 */

/**
 * @enum {string}
 */
var TileProperty = {
  PRELOAD: 'preload',
  USE_INTERIM_TILES_ON_ERROR: 'useInterimTilesOnError',
};

/**
 * @module ol/layer/BaseTile
 */

/***
 * @template Return
 * @typedef {import("../Observable").OnSignature<import("../Observable").EventTypes, import("../events/Event.js").default, Return> &
 *   import("../Observable").OnSignature<import("./Base").BaseLayerObjectEventTypes|
 *     import("./Layer.js").LayerEventType|'change:preload'|'change:useInterimTilesOnError', import("../Object").ObjectEvent, Return> &
 *   import("../Observable").OnSignature<import("../render/EventType").LayerRenderEventTypes, import("../render/Event").default, Return> &
 *   import("../Observable").CombinedOnSignature<import("../Observable").EventTypes|import("./Base").BaseLayerObjectEventTypes|
 *   import("./Layer.js").LayerEventType|'change:preload'|'change:useInterimTilesOnError'|import("../render/EventType").LayerRenderEventTypes, Return>} BaseTileLayerOnSignature
 */

/**
 * @template {import("../source/Tile.js").default} TileSourceType
 * @typedef {Object} Options
 * @property {string} [className='ol-layer'] A CSS class name to set to the layer element.
 * @property {number} [opacity=1] Opacity (0, 1).
 * @property {boolean} [visible=true] Visibility.
 * @property {import("../extent.js").Extent} [extent] The bounding extent for layer rendering.  The layer will not be
 * rendered outside of this extent.
 * @property {number} [zIndex] The z-index for layer rendering.  At rendering time, the layers
 * will be ordered, first by Z-index and then by position. When `undefined`, a `zIndex` of 0 is assumed
 * for layers that are added to the map's `layers` collection, or `Infinity` when the layer's `setMap()`
 * method was used.
 * @property {number} [minResolution] The minimum resolution (inclusive) at which this layer will be
 * visible.
 * @property {number} [maxResolution] The maximum resolution (exclusive) below which this layer will
 * be visible.
 * @property {number} [minZoom] The minimum view zoom level (exclusive) above which this layer will be
 * visible.
 * @property {number} [maxZoom] The maximum view zoom level (inclusive) at which this layer will
 * be visible.
 * @property {number} [preload=0] Preload. Load low-resolution tiles up to `preload` levels. `0`
 * means no preloading.
 * @property {TileSourceType} [source] Source for this layer.
 * @property {import("../Map.js").default} [map] Sets the layer as overlay on a map. The map will not manage
 * this layer in its layers collection, and the layer will be rendered on top. This is useful for
 * temporary layers. The standard way to add a layer to a map and have it managed by the map is to
 * use {@link import("../Map.js").default#addLayer map.addLayer()}.
 * @property {boolean} [useInterimTilesOnError=true] Use interim tiles on error.
 * @property {Object<string, *>} [properties] Arbitrary observable properties. Can be accessed with `#get()` and `#set()`.
 */

/**
 * @classdesc
 * For layer sources that provide pre-rendered, tiled images in grids that are
 * organized by zoom levels for specific resolutions.
 * Note that any property set in the options is set as a {@link module:ol/Object~BaseObject}
 * property on the layer object; for example, setting `title: 'My Title'` in the
 * options means that `title` is observable, and has get/set accessors.
 *
 * @template {import("../source/Tile.js").default} TileSourceType
 * @template {import("../renderer/Layer.js").default} RendererType
 * @extends {Layer<TileSourceType, RendererType>}
 * @api
 */
class BaseTileLayer extends Layer$1 {
  /**
   * @param {Options<TileSourceType>} [options] Tile layer options.
   */
  constructor(options) {
    options = options ? options : {};

    const baseOptions = Object.assign({}, options);

    delete baseOptions.preload;
    delete baseOptions.useInterimTilesOnError;
    super(baseOptions);

    /***
     * @type {BaseTileLayerOnSignature<import("../events").EventsKey>}
     */
    this.on;

    /***
     * @type {BaseTileLayerOnSignature<import("../events").EventsKey>}
     */
    this.once;

    /***
     * @type {BaseTileLayerOnSignature<void>}
     */
    this.un;

    this.setPreload(options.preload !== undefined ? options.preload : 0);
    this.setUseInterimTilesOnError(
      options.useInterimTilesOnError !== undefined
        ? options.useInterimTilesOnError
        : true
    );
  }

  /**
   * Return the level as number to which we will preload tiles up to.
   * @return {number} The level to preload tiles up to.
   * @observable
   * @api
   */
  getPreload() {
    return /** @type {number} */ (this.get(TileProperty.PRELOAD));
  }

  /**
   * Set the level as number to which we will preload tiles up to.
   * @param {number} preload The level to preload tiles up to.
   * @observable
   * @api
   */
  setPreload(preload) {
    this.set(TileProperty.PRELOAD, preload);
  }

  /**
   * Whether we use interim tiles on error.
   * @return {boolean} Use interim tiles on error.
   * @observable
   * @api
   */
  getUseInterimTilesOnError() {
    return /** @type {boolean} */ (
      this.get(TileProperty.USE_INTERIM_TILES_ON_ERROR)
    );
  }

  /**
   * Set whether we use interim tiles on error.
   * @param {boolean} useInterimTilesOnError Use interim tiles on error.
   * @observable
   * @api
   */
  setUseInterimTilesOnError(useInterimTilesOnError) {
    this.set(TileProperty.USE_INTERIM_TILES_ON_ERROR, useInterimTilesOnError);
  }

  /**
   * Get data for a pixel location.  The return type depends on the source data.  For image tiles,
   * a four element RGBA array will be returned.  For data tiles, the array length will match the
   * number of bands in the dataset.  For requests outside the layer extent, `null` will be returned.
   * Data for a image tiles can only be retrieved if the source's `crossOrigin` property is set.
   *
   * ```js
   * // display layer data on every pointer move
   * map.on('pointermove', (event) => {
   *   console.log(layer.getData(event.pixel));
   * });
   * ```
   * @param {import("../pixel").Pixel} pixel Pixel.
   * @return {Uint8ClampedArray|Uint8Array|Float32Array|DataView|null} Pixel data.
   * @api
   */
  getData(pixel) {
    return super.getData(pixel);
  }
}

var BaseTileLayer$1 = BaseTileLayer;

/**
 * @module ol/ImageState
 */

/**
 * @enum {number}
 */
var ImageState = {
  IDLE: 0,
  LOADING: 1,
  LOADED: 2,
  ERROR: 3,
  EMPTY: 4,
};

/**
 * @module ol/renderer/Layer
 */

/**
 * @template {import("../layer/Layer.js").default} LayerType
 */
class LayerRenderer extends Observable$1 {
  /**
   * @param {LayerType} layer Layer.
   */
  constructor(layer) {
    super();

    /**
     * The renderer is initialized and ready to render.
     * @type {boolean}
     */
    this.ready = true;

    /** @private */
    this.boundHandleImageChange_ = this.handleImageChange_.bind(this);

    /**
     * @protected
     * @type {LayerType}
     */
    this.layer_ = layer;

    /**
     * @type {import("../render/canvas/ExecutorGroup").default}
     */
    this.declutterExecutorGroup = null;
  }

  /**
   * Asynchronous layer level hit detection.
   * @param {import("../pixel.js").Pixel} pixel Pixel.
   * @return {Promise<Array<import("../Feature").FeatureLike>>} Promise that resolves with
   * an array of features.
   */
  getFeatures(pixel) {
    return abstract();
  }

  /**
   * @param {import("../pixel.js").Pixel} pixel Pixel.
   * @return {Uint8ClampedArray|Uint8Array|Float32Array|DataView|null} Pixel data.
   */
  getData(pixel) {
    return null;
  }

  /**
   * Determine whether render should be called.
   * @abstract
   * @param {import("../Map.js").FrameState} frameState Frame state.
   * @return {boolean} Layer is ready to be rendered.
   */
  prepareFrame(frameState) {
    return abstract();
  }

  /**
   * Render the layer.
   * @abstract
   * @param {import("../Map.js").FrameState} frameState Frame state.
   * @param {HTMLElement} target Target that may be used to render content to.
   * @return {HTMLElement} The rendered element.
   */
  renderFrame(frameState, target) {
    return abstract();
  }

  /**
   * @param {Object<number, Object<string, import("../Tile.js").default>>} tiles Lookup of loaded tiles by zoom level.
   * @param {number} zoom Zoom level.
   * @param {import("../Tile.js").default} tile Tile.
   * @return {boolean|void} If `false`, the tile will not be considered loaded.
   */
  loadedTileCallback(tiles, zoom, tile) {
    if (!tiles[zoom]) {
      tiles[zoom] = {};
    }
    tiles[zoom][tile.tileCoord.toString()] = tile;
    return undefined;
  }

  /**
   * Create a function that adds loaded tiles to the tile lookup.
   * @param {import("../source/Tile.js").default} source Tile source.
   * @param {import("../proj/Projection.js").default} projection Projection of the tiles.
   * @param {Object<number, Object<string, import("../Tile.js").default>>} tiles Lookup of loaded tiles by zoom level.
   * @return {function(number, import("../TileRange.js").default):boolean} A function that can be
   *     called with a zoom level and a tile range to add loaded tiles to the lookup.
   * @protected
   */
  createLoadedTileFinder(source, projection, tiles) {
    return (
      /**
       * @param {number} zoom Zoom level.
       * @param {import("../TileRange.js").default} tileRange Tile range.
       * @return {boolean} The tile range is fully loaded.
       */
      (zoom, tileRange) => {
        const callback = this.loadedTileCallback.bind(this, tiles, zoom);
        return source.forEachLoadedTile(projection, zoom, tileRange, callback);
      }
    );
  }
  /**
   * @abstract
   * @param {import("../coordinate.js").Coordinate} coordinate Coordinate.
   * @param {import("../Map.js").FrameState} frameState Frame state.
   * @param {number} hitTolerance Hit tolerance in pixels.
   * @param {import("./vector.js").FeatureCallback<T>} callback Feature callback.
   * @param {Array<import("./Map.js").HitMatch<T>>} matches The hit detected matches with tolerance.
   * @return {T|undefined} Callback result.
   * @template T
   */
  forEachFeatureAtCoordinate(
    coordinate,
    frameState,
    hitTolerance,
    callback,
    matches
  ) {
    return undefined;
  }

  /**
   * @return {LayerType} Layer.
   */
  getLayer() {
    return this.layer_;
  }

  /**
   * Perform action necessary to get the layer rendered after new fonts have loaded
   * @abstract
   */
  handleFontsChanged() {}

  /**
   * Handle changes in image state.
   * @param {import("../events/Event.js").default} event Image change event.
   * @private
   */
  handleImageChange_(event) {
    const image = /** @type {import("../Image.js").default} */ (event.target);
    if (image.getState() === ImageState.LOADED) {
      this.renderIfReadyAndVisible();
    }
  }

  /**
   * Load the image if not already loaded, and register the image change
   * listener if needed.
   * @param {import("../ImageBase.js").default} image Image.
   * @return {boolean} `true` if the image is already loaded, `false` otherwise.
   * @protected
   */
  loadImage(image) {
    let imageState = image.getState();
    if (imageState != ImageState.LOADED && imageState != ImageState.ERROR) {
      image.addEventListener(EventType.CHANGE, this.boundHandleImageChange_);
    }
    if (imageState == ImageState.IDLE) {
      image.load();
      imageState = image.getState();
    }
    return imageState == ImageState.LOADED;
  }

  /**
   * @protected
   */
  renderIfReadyAndVisible() {
    const layer = this.getLayer();
    if (layer && layer.getVisible() && layer.getSourceState() === 'ready') {
      layer.changed();
    }
  }

  /**
   * Clean up.
   */
  disposeInternal() {
    delete this.layer_;
    super.disposeInternal();
  }
}

var LayerRenderer$1 = LayerRenderer;

/**
 * @module ol/renderer/canvas/Layer
 */

/**
 * @type {CanvasRenderingContext2D}
 */
let pixelContext = null;

function createPixelContext() {
  pixelContext = createCanvasContext2D(1, 1, undefined, {
    willReadFrequently: true,
  });
}

/**
 * @abstract
 * @template {import("../../layer/Layer.js").default} LayerType
 * @extends {LayerRenderer<LayerType>}
 */
class CanvasLayerRenderer extends LayerRenderer$1 {
  /**
   * @param {LayerType} layer Layer.
   */
  constructor(layer) {
    super(layer);

    /**
     * @protected
     * @type {HTMLElement}
     */
    this.container = null;

    /**
     * @protected
     * @type {number}
     */
    this.renderedResolution;

    /**
     * A temporary transform.  The values in this transform should only be used in a
     * function that sets the values.
     * @protected
     * @type {import("../../transform.js").Transform}
     */
    this.tempTransform = create();

    /**
     * The transform for rendered pixels to viewport CSS pixels.  This transform must
     * be set when rendering a frame and may be used by other functions after rendering.
     * @protected
     * @type {import("../../transform.js").Transform}
     */
    this.pixelTransform = create();

    /**
     * The transform for viewport CSS pixels to rendered pixels.  This transform must
     * be set when rendering a frame and may be used by other functions after rendering.
     * @protected
     * @type {import("../../transform.js").Transform}
     */
    this.inversePixelTransform = create();

    /**
     * @type {CanvasRenderingContext2D}
     */
    this.context = null;

    /**
     * @type {boolean}
     */
    this.containerReused = false;

    /**
     * @private
     * @type {CanvasRenderingContext2D}
     */
    this.pixelContext_ = null;

    /**
     * @protected
     * @type {import("../../Map.js").FrameState|null}
     */
    this.frameState = null;
  }

  /**
   * @param {HTMLCanvasElement|HTMLImageElement|HTMLVideoElement} image Image.
   * @param {number} col The column index.
   * @param {number} row The row index.
   * @return {Uint8ClampedArray|null} The image data.
   */
  getImageData(image, col, row) {
    if (!pixelContext) {
      createPixelContext();
    }
    pixelContext.clearRect(0, 0, 1, 1);

    let data;
    try {
      pixelContext.drawImage(image, col, row, 1, 1, 0, 0, 1, 1);
      data = pixelContext.getImageData(0, 0, 1, 1).data;
    } catch (err) {
      pixelContext = null;
      return null;
    }
    return data;
  }

  /**
   * @param {import('../../Map.js').FrameState} frameState Frame state.
   * @return {string} Background color.
   */
  getBackground(frameState) {
    const layer = this.getLayer();
    let background = layer.getBackground();
    if (typeof background === 'function') {
      background = background(frameState.viewState.resolution);
    }
    return background || undefined;
  }

  /**
   * Get a rendering container from an existing target, if compatible.
   * @param {HTMLElement} target Potential render target.
   * @param {string} transform CSS Transform.
   * @param {string} [backgroundColor] Background color.
   */
  useContainer(target, transform, backgroundColor) {
    const layerClassName = this.getLayer().getClassName();
    let container, context;
    if (
      target &&
      target.className === layerClassName &&
      (!backgroundColor ||
        (target &&
          target.style.backgroundColor &&
          equals$2(
            asArray(target.style.backgroundColor),
            asArray(backgroundColor)
          )))
    ) {
      const canvas = target.firstElementChild;
      if (canvas instanceof HTMLCanvasElement) {
        context = canvas.getContext('2d');
      }
    }
    if (context && context.canvas.style.transform === transform) {
      // Container of the previous layer renderer can be used.
      this.container = target;
      this.context = context;
      this.containerReused = true;
    } else if (this.containerReused) {
      // Previously reused container cannot be used any more.
      this.container = null;
      this.context = null;
      this.containerReused = false;
    }
    if (!this.container) {
      container = document.createElement('div');
      container.className = layerClassName;
      let style = container.style;
      style.position = 'absolute';
      style.width = '100%';
      style.height = '100%';
      context = createCanvasContext2D();
      const canvas = context.canvas;
      container.appendChild(canvas);
      style = canvas.style;
      style.position = 'absolute';
      style.left = '0';
      style.transformOrigin = 'top left';
      this.container = container;
      this.context = context;
    }
    if (
      !this.containerReused &&
      backgroundColor &&
      !this.container.style.backgroundColor
    ) {
      this.container.style.backgroundColor = backgroundColor;
    }
  }

  /**
   * @param {CanvasRenderingContext2D} context Context.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @param {import("../../extent.js").Extent} extent Clip extent.
   * @protected
   */
  clipUnrotated(context, frameState, extent) {
    const topLeft = getTopLeft(extent);
    const topRight = getTopRight(extent);
    const bottomRight = getBottomRight(extent);
    const bottomLeft = getBottomLeft(extent);

    apply(frameState.coordinateToPixelTransform, topLeft);
    apply(frameState.coordinateToPixelTransform, topRight);
    apply(frameState.coordinateToPixelTransform, bottomRight);
    apply(frameState.coordinateToPixelTransform, bottomLeft);

    const inverted = this.inversePixelTransform;
    apply(inverted, topLeft);
    apply(inverted, topRight);
    apply(inverted, bottomRight);
    apply(inverted, bottomLeft);

    context.save();
    context.beginPath();
    context.moveTo(Math.round(topLeft[0]), Math.round(topLeft[1]));
    context.lineTo(Math.round(topRight[0]), Math.round(topRight[1]));
    context.lineTo(Math.round(bottomRight[0]), Math.round(bottomRight[1]));
    context.lineTo(Math.round(bottomLeft[0]), Math.round(bottomLeft[1]));
    context.clip();
  }

  /**
   * @param {import("../../render/EventType.js").default} type Event type.
   * @param {CanvasRenderingContext2D} context Context.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @private
   */
  dispatchRenderEvent_(type, context, frameState) {
    const layer = this.getLayer();
    if (layer.hasListener(type)) {
      const event = new RenderEvent$1(
        type,
        this.inversePixelTransform,
        frameState,
        context
      );
      layer.dispatchEvent(event);
    }
  }

  /**
   * @param {CanvasRenderingContext2D} context Context.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @protected
   */
  preRender(context, frameState) {
    this.frameState = frameState;
    this.dispatchRenderEvent_(RenderEventType.PRERENDER, context, frameState);
  }

  /**
   * @param {CanvasRenderingContext2D} context Context.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @protected
   */
  postRender(context, frameState) {
    this.dispatchRenderEvent_(RenderEventType.POSTRENDER, context, frameState);
  }

  /**
   * Creates a transform for rendering to an element that will be rotated after rendering.
   * @param {import("../../coordinate.js").Coordinate} center Center.
   * @param {number} resolution Resolution.
   * @param {number} rotation Rotation.
   * @param {number} pixelRatio Pixel ratio.
   * @param {number} width Width of the rendered element (in pixels).
   * @param {number} height Height of the rendered element (in pixels).
   * @param {number} offsetX Offset on the x-axis in view coordinates.
   * @protected
   * @return {!import("../../transform.js").Transform} Transform.
   */
  getRenderTransform(
    center,
    resolution,
    rotation,
    pixelRatio,
    width,
    height,
    offsetX
  ) {
    const dx1 = width / 2;
    const dy1 = height / 2;
    const sx = pixelRatio / resolution;
    const sy = -sx;
    const dx2 = -center[0] + offsetX;
    const dy2 = -center[1];
    return compose(
      this.tempTransform,
      dx1,
      dy1,
      sx,
      sy,
      -rotation,
      dx2,
      dy2
    );
  }

  /**
   * Clean up.
   */
  disposeInternal() {
    delete this.frameState;
    super.disposeInternal();
  }
}

var CanvasLayerRenderer$1 = CanvasLayerRenderer;

/**
 * @module ol/Tile
 */

/**
 * A function that takes an {@link module:ol/Tile~Tile} for the tile and a
 * `{string}` for the url as arguments. The default is
 * ```js
 * source.setTileLoadFunction(function(tile, src) {
 *   tile.getImage().src = src;
 * });
 * ```
 * For more fine grained control, the load function can use fetch or XMLHttpRequest and involve
 * error handling:
 *
 * ```js
 * import TileState from 'ol/TileState.js';
 *
 * source.setTileLoadFunction(function(tile, src) {
 *   const xhr = new XMLHttpRequest();
 *   xhr.responseType = 'blob';
 *   xhr.addEventListener('loadend', function (evt) {
 *     const data = this.response;
 *     if (data !== undefined) {
 *       tile.getImage().src = URL.createObjectURL(data);
 *     } else {
 *       tile.setState(TileState.ERROR);
 *     }
 *   });
 *   xhr.addEventListener('error', function () {
 *     tile.setState(TileState.ERROR);
 *   });
 *   xhr.open('GET', src);
 *   xhr.send();
 * });
 * ```
 *
 * @typedef {function(Tile, string): void} LoadFunction
 * @api
 */

/**
 * {@link module:ol/source/Tile~TileSource} sources use a function of this type to get
 * the url that provides a tile for a given tile coordinate.
 *
 * This function takes an {@link module:ol/tilecoord~TileCoord} for the tile
 * coordinate, a `{number}` representing the pixel ratio and a
 * {@link module:ol/proj/Projection~Projection} for the projection  as arguments
 * and returns a `{string}` representing the tile URL, or undefined if no tile
 * should be requested for the passed tile coordinate.
 *
 * @typedef {function(import("./tilecoord.js").TileCoord, number,
 *           import("./proj/Projection.js").default): (string|undefined)} UrlFunction
 * @api
 */

/**
 * @typedef {Object} Options
 * @property {number} [transition=250] A duration for tile opacity
 * transitions in milliseconds. A duration of 0 disables the opacity transition.
 * @property {boolean} [interpolate=false] Use interpolated values when resampling.  By default,
 * the nearest neighbor is used when resampling.
 * @api
 */

/**
 * @classdesc
 * Base class for tiles.
 *
 * @abstract
 */
class Tile extends EventTarget {
  /**
   * @param {import("./tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @param {import("./TileState.js").default} state State.
   * @param {Options} [options] Tile options.
   */
  constructor(tileCoord, state, options) {
    super();

    options = options ? options : {};

    /**
     * @type {import("./tilecoord.js").TileCoord}
     */
    this.tileCoord = tileCoord;

    /**
     * @protected
     * @type {import("./TileState.js").default}
     */
    this.state = state;

    /**
     * An "interim" tile for this tile. The interim tile may be used while this
     * one is loading, for "smooth" transitions when changing params/dimensions
     * on the source.
     * @type {Tile}
     */
    this.interimTile = null;

    /**
     * A key assigned to the tile. This is used by the tile source to determine
     * if this tile can effectively be used, or if a new tile should be created
     * and this one be used as an interim tile for this new tile.
     * @type {string}
     */
    this.key = '';

    /**
     * The duration for the opacity transition.
     * @type {number}
     */
    this.transition_ =
      options.transition === undefined ? 250 : options.transition;

    /**
     * Lookup of start times for rendering transitions.  If the start time is
     * equal to -1, the transition is complete.
     * @type {Object<string, number>}
     */
    this.transitionStarts_ = {};

    /**
     * @type {boolean}
     */
    this.interpolate = !!options.interpolate;
  }

  /**
   * @protected
   */
  changed() {
    this.dispatchEvent(EventType.CHANGE);
  }

  /**
   * Called by the tile cache when the tile is removed from the cache due to expiry
   */
  release() {
    if (this.state === TileState.ERROR) {
      // to remove the `change` listener on this tile in `ol/TileQueue#handleTileChange`
      this.setState(TileState.EMPTY);
    }
  }

  /**
   * @return {string} Key.
   */
  getKey() {
    return this.key + '/' + this.tileCoord;
  }

  /**
   * Get the interim tile most suitable for rendering using the chain of interim
   * tiles. This corresponds to the  most recent tile that has been loaded, if no
   * such tile exists, the original tile is returned.
   * @return {!Tile} Best tile for rendering.
   */
  getInterimTile() {
    if (!this.interimTile) {
      //empty chain
      return this;
    }
    let tile = this.interimTile;

    // find the first loaded tile and return it. Since the chain is sorted in
    // decreasing order of creation time, there is no need to search the remainder
    // of the list (all those tiles correspond to older requests and will be
    // cleaned up by refreshInterimChain)
    do {
      if (tile.getState() == TileState.LOADED) {
        // Show tile immediately instead of fading it in after loading, because
        // the interim tile is in place already
        this.transition_ = 0;
        return tile;
      }
      tile = tile.interimTile;
    } while (tile);

    // we can not find a better tile
    return this;
  }

  /**
   * Goes through the chain of interim tiles and discards sections of the chain
   * that are no longer relevant.
   */
  refreshInterimChain() {
    if (!this.interimTile) {
      return;
    }

    let tile = this.interimTile;

    /**
     * @type {Tile}
     */
    let prev = this;

    do {
      if (tile.getState() == TileState.LOADED) {
        //we have a loaded tile, we can discard the rest of the list
        //we would could abort any LOADING tile request
        //older than this tile (i.e. any LOADING tile following this entry in the chain)
        tile.interimTile = null;
        break;
      } else if (tile.getState() == TileState.LOADING) {
        //keep this LOADING tile any loaded tiles later in the chain are
        //older than this tile, so we're still interested in the request
        prev = tile;
      } else if (tile.getState() == TileState.IDLE) {
        //the head of the list is the most current tile, we don't need
        //to start any other requests for this chain
        prev.interimTile = tile.interimTile;
      } else {
        prev = tile;
      }
      tile = prev.interimTile;
    } while (tile);
  }

  /**
   * Get the tile coordinate for this tile.
   * @return {import("./tilecoord.js").TileCoord} The tile coordinate.
   * @api
   */
  getTileCoord() {
    return this.tileCoord;
  }

  /**
   * @return {import("./TileState.js").default} State.
   */
  getState() {
    return this.state;
  }

  /**
   * Sets the state of this tile. If you write your own {@link module:ol/Tile~LoadFunction tileLoadFunction} ,
   * it is important to set the state correctly to {@link module:ol/TileState~ERROR}
   * when the tile cannot be loaded. Otherwise the tile cannot be removed from
   * the tile queue and will block other requests.
   * @param {import("./TileState.js").default} state State.
   * @api
   */
  setState(state) {
    if (this.state !== TileState.ERROR && this.state > state) {
      throw new Error('Tile load sequence violation');
    }
    this.state = state;
    this.changed();
  }

  /**
   * Load the image or retry if loading previously failed.
   * Loading is taken care of by the tile queue, and calling this method is
   * only needed for preloading or for reloading in case of an error.
   * @abstract
   * @api
   */
  load() {
    abstract();
  }

  /**
   * Get the alpha value for rendering.
   * @param {string} id An id for the renderer.
   * @param {number} time The render frame time.
   * @return {number} A number between 0 and 1.
   */
  getAlpha(id, time) {
    if (!this.transition_) {
      return 1;
    }

    let start = this.transitionStarts_[id];
    if (!start) {
      start = time;
      this.transitionStarts_[id] = start;
    } else if (start === -1) {
      return 1;
    }

    const delta = time - start + 1000 / 60; // avoid rendering at 0
    if (delta >= this.transition_) {
      return 1;
    }
    return easeIn(delta / this.transition_);
  }

  /**
   * Determine if a tile is in an alpha transition.  A tile is considered in
   * transition if tile.getAlpha() has not yet been called or has been called
   * and returned 1.
   * @param {string} id An id for the renderer.
   * @return {boolean} The tile is in transition.
   */
  inTransition(id) {
    if (!this.transition_) {
      return false;
    }
    return this.transitionStarts_[id] !== -1;
  }

  /**
   * Mark a transition as complete.
   * @param {string} id An id for the renderer.
   */
  endTransition(id) {
    if (this.transition_) {
      this.transitionStarts_[id] = -1;
    }
  }
}

var Tile$1 = Tile;

/**
 * @module ol/Image
 */

/**
 * @param {HTMLCanvasElement|HTMLImageElement|HTMLVideoElement} image Image element.
 * @param {function():any} loadHandler Load callback function.
 * @param {function():any} errorHandler Error callback function.
 * @return {function():void} Callback to stop listening.
 */
function listenImage(image, loadHandler, errorHandler) {
  const img = /** @type {HTMLImageElement} */ (image);
  let listening = true;
  let decoding = false;
  let loaded = false;

  const listenerKeys = [
    listenOnce(img, EventType.LOAD, function () {
      loaded = true;
      if (!decoding) {
        loadHandler();
      }
    }),
  ];

  if (img.src && IMAGE_DECODE) {
    decoding = true;
    img
      .decode()
      .then(function () {
        if (listening) {
          loadHandler();
        }
      })
      .catch(function (error) {
        if (listening) {
          if (loaded) {
            loadHandler();
          } else {
            errorHandler();
          }
        }
      });
  } else {
    listenerKeys.push(listenOnce(img, EventType.ERROR, errorHandler));
  }

  return function unlisten() {
    listening = false;
    listenerKeys.forEach(unlistenByKey);
  };
}

/**
 * @module ol/ImageTile
 */

class ImageTile extends Tile$1 {
  /**
   * @param {import("./tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @param {import("./TileState.js").default} state State.
   * @param {string} src Image source URI.
   * @param {?string} crossOrigin Cross origin.
   * @param {import("./Tile.js").LoadFunction} tileLoadFunction Tile load function.
   * @param {import("./Tile.js").Options} [options] Tile options.
   */
  constructor(tileCoord, state, src, crossOrigin, tileLoadFunction, options) {
    super(tileCoord, state, options);

    /**
     * @private
     * @type {?string}
     */
    this.crossOrigin_ = crossOrigin;

    /**
     * Image URI
     *
     * @private
     * @type {string}
     */
    this.src_ = src;

    this.key = src;

    /**
     * @private
     * @type {HTMLImageElement|HTMLCanvasElement}
     */
    this.image_ = new Image();
    if (crossOrigin !== null) {
      this.image_.crossOrigin = crossOrigin;
    }

    /**
     * @private
     * @type {?function():void}
     */
    this.unlisten_ = null;

    /**
     * @private
     * @type {import("./Tile.js").LoadFunction}
     */
    this.tileLoadFunction_ = tileLoadFunction;
  }

  /**
   * Get the HTML image element for this tile (may be a Canvas, Image, or Video).
   * @return {HTMLCanvasElement|HTMLImageElement|HTMLVideoElement} Image.
   * @api
   */
  getImage() {
    return this.image_;
  }

  /**
   * Sets an HTML image element for this tile (may be a Canvas or preloaded Image).
   * @param {HTMLCanvasElement|HTMLImageElement} element Element.
   */
  setImage(element) {
    this.image_ = element;
    this.state = TileState.LOADED;
    this.unlistenImage_();
    this.changed();
  }

  /**
   * Tracks loading or read errors.
   *
   * @private
   */
  handleImageError_() {
    this.state = TileState.ERROR;
    this.unlistenImage_();
    this.image_ = getBlankImage();
    this.changed();
  }

  /**
   * Tracks successful image load.
   *
   * @private
   */
  handleImageLoad_() {
    const image = /** @type {HTMLImageElement} */ (this.image_);
    if (image.naturalWidth && image.naturalHeight) {
      this.state = TileState.LOADED;
    } else {
      this.state = TileState.EMPTY;
    }
    this.unlistenImage_();
    this.changed();
  }

  /**
   * Load the image or retry if loading previously failed.
   * Loading is taken care of by the tile queue, and calling this method is
   * only needed for preloading or for reloading in case of an error.
   *
   * To retry loading tiles on failed requests, use a custom `tileLoadFunction`
   * that checks for error status codes and reloads only when the status code is
   * 408, 429, 500, 502, 503 and 504, and only when not too many retries have been
   * made already:
   *
   * ```js
   * const retryCodes = [408, 429, 500, 502, 503, 504];
   * const retries = {};
   * source.setTileLoadFunction((tile, src) => {
   *   const image = tile.getImage();
   *   fetch(src)
   *     .then((response) => {
   *       if (retryCodes.includes(response.status)) {
   *         retries[src] = (retries[src] || 0) + 1;
   *         if (retries[src] <= 3) {
   *           setTimeout(() => tile.load(), retries[src] * 1000);
   *         }
   *         return Promise.reject();
   *       }
   *       return response.blob();
   *     })
   *     .then((blob) => {
   *       const imageUrl = URL.createObjectURL(blob);
   *       image.src = imageUrl;
   *       setTimeout(() => URL.revokeObjectURL(imageUrl), 5000);
   *     })
   *     .catch(() => tile.setState(3)); // error
   * });
   * ```
   *
   * @api
   */
  load() {
    if (this.state == TileState.ERROR) {
      this.state = TileState.IDLE;
      this.image_ = new Image();
      if (this.crossOrigin_ !== null) {
        this.image_.crossOrigin = this.crossOrigin_;
      }
    }
    if (this.state == TileState.IDLE) {
      this.state = TileState.LOADING;
      this.changed();
      this.tileLoadFunction_(this, this.src_);
      this.unlisten_ = listenImage(
        this.image_,
        this.handleImageLoad_.bind(this),
        this.handleImageError_.bind(this)
      );
    }
  }

  /**
   * Discards event handlers which listen for load completion or errors.
   *
   * @private
   */
  unlistenImage_() {
    if (this.unlisten_) {
      this.unlisten_();
      this.unlisten_ = null;
    }
  }
}

/**
 * Get a 1-pixel blank image.
 * @return {HTMLCanvasElement} Blank image.
 */
function getBlankImage() {
  const ctx = createCanvasContext2D(1, 1);
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, 1, 1);
  return ctx.canvas;
}

var ImageTile$1 = ImageTile;

/**
 * @module ol/reproj/common
 */

/**
 * Default maximum allowed threshold  (in pixels) for reprojection
 * triangulation.
 * @type {number}
 */
const ERROR_THRESHOLD = 0.5;

/**
 * @module ol/reproj/Triangulation
 */

/**
 * Single triangle; consists of 3 source points and 3 target points.
 * @typedef {Object} Triangle
 * @property {Array<import("../coordinate.js").Coordinate>} source Source.
 * @property {Array<import("../coordinate.js").Coordinate>} target Target.
 */

/**
 * Maximum number of subdivision steps during raster reprojection triangulation.
 * Prevents high memory usage and large number of proj4 calls (for certain
 * transformations and areas). At most `2*(2^this)` triangles are created for
 * each triangulated extent (tile/image).
 * @type {number}
 */
const MAX_SUBDIVISION = 10;

/**
 * Maximum allowed size of triangle relative to world width. When transforming
 * corners of world extent between certain projections, the resulting
 * triangulation seems to have zero error and no subdivision is performed. If
 * the triangle width is more than this (relative to world width; 0-1),
 * subdivison is forced (up to `MAX_SUBDIVISION`). Default is `0.25`.
 * @type {number}
 */
const MAX_TRIANGLE_WIDTH = 0.25;

/**
 * @classdesc
 * Class containing triangulation of the given target extent.
 * Used for determining source data and the reprojection itself.
 */
class Triangulation {
  /**
   * @param {import("../proj/Projection.js").default} sourceProj Source projection.
   * @param {import("../proj/Projection.js").default} targetProj Target projection.
   * @param {import("../extent.js").Extent} targetExtent Target extent to triangulate.
   * @param {import("../extent.js").Extent} maxSourceExtent Maximal source extent that can be used.
   * @param {number} errorThreshold Acceptable error (in source units).
   * @param {?number} destinationResolution The (optional) resolution of the destination.
   */
  constructor(
    sourceProj,
    targetProj,
    targetExtent,
    maxSourceExtent,
    errorThreshold,
    destinationResolution
  ) {
    /**
     * @type {import("../proj/Projection.js").default}
     * @private
     */
    this.sourceProj_ = sourceProj;

    /**
     * @type {import("../proj/Projection.js").default}
     * @private
     */
    this.targetProj_ = targetProj;

    /** @type {!Object<string, import("../coordinate.js").Coordinate>} */
    let transformInvCache = {};
    const transformInv = getTransform(this.targetProj_, this.sourceProj_);

    /**
     * @param {import("../coordinate.js").Coordinate} c A coordinate.
     * @return {import("../coordinate.js").Coordinate} Transformed coordinate.
     * @private
     */
    this.transformInv_ = function (c) {
      const key = c[0] + '/' + c[1];
      if (!transformInvCache[key]) {
        transformInvCache[key] = transformInv(c);
      }
      return transformInvCache[key];
    };

    /**
     * @type {import("../extent.js").Extent}
     * @private
     */
    this.maxSourceExtent_ = maxSourceExtent;

    /**
     * @type {number}
     * @private
     */
    this.errorThresholdSquared_ = errorThreshold * errorThreshold;

    /**
     * @type {Array<Triangle>}
     * @private
     */
    this.triangles_ = [];

    /**
     * Indicates that the triangulation crosses edge of the source projection.
     * @type {boolean}
     * @private
     */
    this.wrapsXInSource_ = false;

    /**
     * @type {boolean}
     * @private
     */
    this.canWrapXInSource_ =
      this.sourceProj_.canWrapX() &&
      !!maxSourceExtent &&
      !!this.sourceProj_.getExtent() &&
      getWidth(maxSourceExtent) == getWidth(this.sourceProj_.getExtent());

    /**
     * @type {?number}
     * @private
     */
    this.sourceWorldWidth_ = this.sourceProj_.getExtent()
      ? getWidth(this.sourceProj_.getExtent())
      : null;

    /**
     * @type {?number}
     * @private
     */
    this.targetWorldWidth_ = this.targetProj_.getExtent()
      ? getWidth(this.targetProj_.getExtent())
      : null;

    const destinationTopLeft = getTopLeft(targetExtent);
    const destinationTopRight = getTopRight(targetExtent);
    const destinationBottomRight = getBottomRight(targetExtent);
    const destinationBottomLeft = getBottomLeft(targetExtent);
    const sourceTopLeft = this.transformInv_(destinationTopLeft);
    const sourceTopRight = this.transformInv_(destinationTopRight);
    const sourceBottomRight = this.transformInv_(destinationBottomRight);
    const sourceBottomLeft = this.transformInv_(destinationBottomLeft);

    /*
     * The maxSubdivision controls how many splittings of the target area can
     * be done. The idea here is to do a linear mapping of the target areas
     * but the actual overal reprojection (can be) extremely non-linear. The
     * default value of MAX_SUBDIVISION was chosen based on mapping a 256x256
     * tile size. However this function is also called to remap canvas rendered
     * layers which can be much larger. This calculation increases the maxSubdivision
     * value by the right factor so that each 256x256 pixel area has
     * MAX_SUBDIVISION divisions.
     */
    const maxSubdivision =
      MAX_SUBDIVISION +
      (destinationResolution
        ? Math.max(
            0,
            Math.ceil(
              Math.log2(
                getArea(targetExtent) /
                  (destinationResolution * destinationResolution * 256 * 256)
              )
            )
          )
        : 0);

    this.addQuad_(
      destinationTopLeft,
      destinationTopRight,
      destinationBottomRight,
      destinationBottomLeft,
      sourceTopLeft,
      sourceTopRight,
      sourceBottomRight,
      sourceBottomLeft,
      maxSubdivision
    );

    if (this.wrapsXInSource_) {
      let leftBound = Infinity;
      this.triangles_.forEach(function (triangle, i, arr) {
        leftBound = Math.min(
          leftBound,
          triangle.source[0][0],
          triangle.source[1][0],
          triangle.source[2][0]
        );
      });

      // Shift triangles to be as close to `leftBound` as possible
      // (if the distance is more than `worldWidth / 2` it can be closer.
      this.triangles_.forEach((triangle) => {
        if (
          Math.max(
            triangle.source[0][0],
            triangle.source[1][0],
            triangle.source[2][0]
          ) -
            leftBound >
          this.sourceWorldWidth_ / 2
        ) {
          const newTriangle = [
            [triangle.source[0][0], triangle.source[0][1]],
            [triangle.source[1][0], triangle.source[1][1]],
            [triangle.source[2][0], triangle.source[2][1]],
          ];
          if (newTriangle[0][0] - leftBound > this.sourceWorldWidth_ / 2) {
            newTriangle[0][0] -= this.sourceWorldWidth_;
          }
          if (newTriangle[1][0] - leftBound > this.sourceWorldWidth_ / 2) {
            newTriangle[1][0] -= this.sourceWorldWidth_;
          }
          if (newTriangle[2][0] - leftBound > this.sourceWorldWidth_ / 2) {
            newTriangle[2][0] -= this.sourceWorldWidth_;
          }

          // Rarely (if the extent contains both the dateline and prime meridian)
          // the shift can in turn break some triangles.
          // Detect this here and don't shift in such cases.
          const minX = Math.min(
            newTriangle[0][0],
            newTriangle[1][0],
            newTriangle[2][0]
          );
          const maxX = Math.max(
            newTriangle[0][0],
            newTriangle[1][0],
            newTriangle[2][0]
          );
          if (maxX - minX < this.sourceWorldWidth_ / 2) {
            triangle.source = newTriangle;
          }
        }
      });
    }

    transformInvCache = {};
  }

  /**
   * Adds triangle to the triangulation.
   * @param {import("../coordinate.js").Coordinate} a The target a coordinate.
   * @param {import("../coordinate.js").Coordinate} b The target b coordinate.
   * @param {import("../coordinate.js").Coordinate} c The target c coordinate.
   * @param {import("../coordinate.js").Coordinate} aSrc The source a coordinate.
   * @param {import("../coordinate.js").Coordinate} bSrc The source b coordinate.
   * @param {import("../coordinate.js").Coordinate} cSrc The source c coordinate.
   * @private
   */
  addTriangle_(a, b, c, aSrc, bSrc, cSrc) {
    this.triangles_.push({
      source: [aSrc, bSrc, cSrc],
      target: [a, b, c],
    });
  }

  /**
   * Adds quad (points in clock-wise order) to the triangulation
   * (and reprojects the vertices) if valid.
   * Performs quad subdivision if needed to increase precision.
   *
   * @param {import("../coordinate.js").Coordinate} a The target a coordinate.
   * @param {import("../coordinate.js").Coordinate} b The target b coordinate.
   * @param {import("../coordinate.js").Coordinate} c The target c coordinate.
   * @param {import("../coordinate.js").Coordinate} d The target d coordinate.
   * @param {import("../coordinate.js").Coordinate} aSrc The source a coordinate.
   * @param {import("../coordinate.js").Coordinate} bSrc The source b coordinate.
   * @param {import("../coordinate.js").Coordinate} cSrc The source c coordinate.
   * @param {import("../coordinate.js").Coordinate} dSrc The source d coordinate.
   * @param {number} maxSubdivision Maximal allowed subdivision of the quad.
   * @private
   */
  addQuad_(a, b, c, d, aSrc, bSrc, cSrc, dSrc, maxSubdivision) {
    const sourceQuadExtent = boundingExtent([aSrc, bSrc, cSrc, dSrc]);
    const sourceCoverageX = this.sourceWorldWidth_
      ? getWidth(sourceQuadExtent) / this.sourceWorldWidth_
      : null;
    const sourceWorldWidth = /** @type {number} */ (this.sourceWorldWidth_);

    // when the quad is wrapped in the source projection
    // it covers most of the projection extent, but not fully
    const wrapsX =
      this.sourceProj_.canWrapX() &&
      sourceCoverageX > 0.5 &&
      sourceCoverageX < 1;

    let needsSubdivision = false;

    if (maxSubdivision > 0) {
      if (this.targetProj_.isGlobal() && this.targetWorldWidth_) {
        const targetQuadExtent = boundingExtent([a, b, c, d]);
        const targetCoverageX =
          getWidth(targetQuadExtent) / this.targetWorldWidth_;
        needsSubdivision =
          targetCoverageX > MAX_TRIANGLE_WIDTH || needsSubdivision;
      }
      if (!wrapsX && this.sourceProj_.isGlobal() && sourceCoverageX) {
        needsSubdivision =
          sourceCoverageX > MAX_TRIANGLE_WIDTH || needsSubdivision;
      }
    }

    if (!needsSubdivision && this.maxSourceExtent_) {
      if (
        isFinite(sourceQuadExtent[0]) &&
        isFinite(sourceQuadExtent[1]) &&
        isFinite(sourceQuadExtent[2]) &&
        isFinite(sourceQuadExtent[3])
      ) {
        if (!intersects(sourceQuadExtent, this.maxSourceExtent_)) {
          // whole quad outside source projection extent -> ignore
          return;
        }
      }
    }

    let isNotFinite = 0;

    if (!needsSubdivision) {
      if (
        !isFinite(aSrc[0]) ||
        !isFinite(aSrc[1]) ||
        !isFinite(bSrc[0]) ||
        !isFinite(bSrc[1]) ||
        !isFinite(cSrc[0]) ||
        !isFinite(cSrc[1]) ||
        !isFinite(dSrc[0]) ||
        !isFinite(dSrc[1])
      ) {
        if (maxSubdivision > 0) {
          needsSubdivision = true;
        } else {
          // It might be the case that only 1 of the points is infinite. In this case
          // we can draw a single triangle with the other three points
          isNotFinite =
            (!isFinite(aSrc[0]) || !isFinite(aSrc[1]) ? 8 : 0) +
            (!isFinite(bSrc[0]) || !isFinite(bSrc[1]) ? 4 : 0) +
            (!isFinite(cSrc[0]) || !isFinite(cSrc[1]) ? 2 : 0) +
            (!isFinite(dSrc[0]) || !isFinite(dSrc[1]) ? 1 : 0);
          if (
            isNotFinite != 1 &&
            isNotFinite != 2 &&
            isNotFinite != 4 &&
            isNotFinite != 8
          ) {
            return;
          }
        }
      }
    }

    if (maxSubdivision > 0) {
      if (!needsSubdivision) {
        const center = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2];
        const centerSrc = this.transformInv_(center);

        let dx;
        if (wrapsX) {
          const centerSrcEstimX =
            (modulo(aSrc[0], sourceWorldWidth) +
              modulo(cSrc[0], sourceWorldWidth)) /
            2;
          dx = centerSrcEstimX - modulo(centerSrc[0], sourceWorldWidth);
        } else {
          dx = (aSrc[0] + cSrc[0]) / 2 - centerSrc[0];
        }
        const dy = (aSrc[1] + cSrc[1]) / 2 - centerSrc[1];
        const centerSrcErrorSquared = dx * dx + dy * dy;
        needsSubdivision = centerSrcErrorSquared > this.errorThresholdSquared_;
      }
      if (needsSubdivision) {
        if (Math.abs(a[0] - c[0]) <= Math.abs(a[1] - c[1])) {
          // split horizontally (top & bottom)
          const bc = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];
          const bcSrc = this.transformInv_(bc);
          const da = [(d[0] + a[0]) / 2, (d[1] + a[1]) / 2];
          const daSrc = this.transformInv_(da);

          this.addQuad_(
            a,
            b,
            bc,
            da,
            aSrc,
            bSrc,
            bcSrc,
            daSrc,
            maxSubdivision - 1
          );
          this.addQuad_(
            da,
            bc,
            c,
            d,
            daSrc,
            bcSrc,
            cSrc,
            dSrc,
            maxSubdivision - 1
          );
        } else {
          // split vertically (left & right)
          const ab = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
          const abSrc = this.transformInv_(ab);
          const cd = [(c[0] + d[0]) / 2, (c[1] + d[1]) / 2];
          const cdSrc = this.transformInv_(cd);

          this.addQuad_(
            a,
            ab,
            cd,
            d,
            aSrc,
            abSrc,
            cdSrc,
            dSrc,
            maxSubdivision - 1
          );
          this.addQuad_(
            ab,
            b,
            c,
            cd,
            abSrc,
            bSrc,
            cSrc,
            cdSrc,
            maxSubdivision - 1
          );
        }
        return;
      }
    }

    if (wrapsX) {
      if (!this.canWrapXInSource_) {
        return;
      }
      this.wrapsXInSource_ = true;
    }

    // Exactly zero or one of *Src is not finite
    // The triangles must have the diagonal line as the first side
    // This is to allow easy code in reproj.s to make it straight for broken
    // browsers that can't handle diagonal clipping
    if ((isNotFinite & 0xb) == 0) {
      this.addTriangle_(a, c, d, aSrc, cSrc, dSrc);
    }
    if ((isNotFinite & 0xe) == 0) {
      this.addTriangle_(a, c, b, aSrc, cSrc, bSrc);
    }
    if (isNotFinite) {
      // Try the other two triangles
      if ((isNotFinite & 0xd) == 0) {
        this.addTriangle_(b, d, a, bSrc, dSrc, aSrc);
      }
      if ((isNotFinite & 0x7) == 0) {
        this.addTriangle_(b, d, c, bSrc, dSrc, cSrc);
      }
    }
  }

  /**
   * Calculates extent of the `source` coordinates from all the triangles.
   *
   * @return {import("../extent.js").Extent} Calculated extent.
   */
  calculateSourceExtent() {
    const extent = createEmpty();

    this.triangles_.forEach(function (triangle, i, arr) {
      const src = triangle.source;
      extendCoordinate(extent, src[0]);
      extendCoordinate(extent, src[1]);
      extendCoordinate(extent, src[2]);
    });

    return extent;
  }

  /**
   * @return {Array<Triangle>} Array of the calculated triangles.
   */
  getTriangles() {
    return this.triangles_;
  }
}

var Triangulation$1 = Triangulation;

/**
 * @module ol/reproj
 */

let brokenDiagonalRendering_;

/**
 * @type {Array<HTMLCanvasElement>}
 */
const canvasPool = [];

/**
 * This draws a small triangle into a canvas by setting the triangle as the clip region
 * and then drawing a (too large) rectangle
 *
 * @param {CanvasRenderingContext2D} ctx The context in which to draw the triangle
 * @param {number} u1 The x-coordinate of the second point. The first point is 0,0.
 * @param {number} v1 The y-coordinate of the second point.
 * @param {number} u2 The x-coordinate of the third point.
 * @param {number} v2 The y-coordinate of the third point.
 */
function drawTestTriangle(ctx, u1, v1, u2, v2) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(u1, v1);
  ctx.lineTo(u2, v2);
  ctx.closePath();
  ctx.save();
  ctx.clip();
  ctx.fillRect(0, 0, Math.max(u1, u2) + 1, Math.max(v1, v2));
  ctx.restore();
}

/**
 * Given the data from getImageData, see if the right values appear at the provided offset.
 * Returns true if either the color or transparency is off
 *
 * @param {Uint8ClampedArray} data The data returned from getImageData
 * @param {number} offset The pixel offset from the start of data.
 * @return {boolean} true if the diagonal rendering is broken
 */
function verifyBrokenDiagonalRendering(data, offset) {
  // the values ought to be close to the rgba(210, 0, 0, 0.75)
  return (
    Math.abs(data[offset * 4] - 210) > 2 ||
    Math.abs(data[offset * 4 + 3] - 0.75 * 255) > 2
  );
}

/**
 * Determines if the current browser configuration can render triangular clip regions correctly.
 * This value is cached so the function is only expensive the first time called.
 * Firefox on Windows (as of now) does not if HWA is enabled. See https://bugzilla.mozilla.org/show_bug.cgi?id=1606976
 * Chrome works, and everything seems to work on OSX and Android. This function caches the
 * result. I suppose that it is conceivably possible that a browser might flip modes while the app is
 * running, but lets hope not.
 *
 * @return {boolean} true if the Diagonal Rendering is broken.
 */
function isBrokenDiagonalRendering() {
  if (brokenDiagonalRendering_ === undefined) {
    const ctx = createCanvasContext2D(6, 6, canvasPool);
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(210, 0, 0, 0.75)';
    drawTestTriangle(ctx, 4, 5, 4, 0);
    drawTestTriangle(ctx, 4, 5, 0, 5);
    const data = ctx.getImageData(0, 0, 3, 3).data;
    brokenDiagonalRendering_ =
      verifyBrokenDiagonalRendering(data, 0) ||
      verifyBrokenDiagonalRendering(data, 4) ||
      verifyBrokenDiagonalRendering(data, 8);
    releaseCanvas(ctx);
    canvasPool.push(ctx.canvas);
  }

  return brokenDiagonalRendering_;
}

/**
 * Calculates ideal resolution to use from the source in order to achieve
 * pixel mapping as close as possible to 1:1 during reprojection.
 * The resolution is calculated regardless of what resolutions
 * are actually available in the dataset (TileGrid, Image, ...).
 *
 * @param {import("./proj/Projection.js").default} sourceProj Source projection.
 * @param {import("./proj/Projection.js").default} targetProj Target projection.
 * @param {import("./coordinate.js").Coordinate} targetCenter Target center.
 * @param {number} targetResolution Target resolution.
 * @return {number} The best resolution to use. Can be +-Infinity, NaN or 0.
 */
function calculateSourceResolution(
  sourceProj,
  targetProj,
  targetCenter,
  targetResolution
) {
  const sourceCenter = transform(targetCenter, targetProj, sourceProj);

  // calculate the ideal resolution of the source data
  let sourceResolution = getPointResolution(
    targetProj,
    targetResolution,
    targetCenter
  );

  const targetMetersPerUnit = targetProj.getMetersPerUnit();
  if (targetMetersPerUnit !== undefined) {
    sourceResolution *= targetMetersPerUnit;
  }
  const sourceMetersPerUnit = sourceProj.getMetersPerUnit();
  if (sourceMetersPerUnit !== undefined) {
    sourceResolution /= sourceMetersPerUnit;
  }

  // Based on the projection properties, the point resolution at the specified
  // coordinates may be slightly different. We need to reverse-compensate this
  // in order to achieve optimal results.

  const sourceExtent = sourceProj.getExtent();
  if (!sourceExtent || containsCoordinate(sourceExtent, sourceCenter)) {
    const compensationFactor =
      getPointResolution(sourceProj, sourceResolution, sourceCenter) /
      sourceResolution;
    if (isFinite(compensationFactor) && compensationFactor > 0) {
      sourceResolution /= compensationFactor;
    }
  }

  return sourceResolution;
}

/**
 * Calculates ideal resolution to use from the source in order to achieve
 * pixel mapping as close as possible to 1:1 during reprojection.
 * The resolution is calculated regardless of what resolutions
 * are actually available in the dataset (TileGrid, Image, ...).
 *
 * @param {import("./proj/Projection.js").default} sourceProj Source projection.
 * @param {import("./proj/Projection.js").default} targetProj Target projection.
 * @param {import("./extent.js").Extent} targetExtent Target extent
 * @param {number} targetResolution Target resolution.
 * @return {number} The best resolution to use. Can be +-Infinity, NaN or 0.
 */
function calculateSourceExtentResolution(
  sourceProj,
  targetProj,
  targetExtent,
  targetResolution
) {
  const targetCenter = getCenter(targetExtent);
  let sourceResolution = calculateSourceResolution(
    sourceProj,
    targetProj,
    targetCenter,
    targetResolution
  );

  if (!isFinite(sourceResolution) || sourceResolution <= 0) {
    forEachCorner(targetExtent, function (corner) {
      sourceResolution = calculateSourceResolution(
        sourceProj,
        targetProj,
        corner,
        targetResolution
      );
      return isFinite(sourceResolution) && sourceResolution > 0;
    });
  }

  return sourceResolution;
}

/**
 * @typedef {Object} ImageExtent
 * @property {import("./extent.js").Extent} extent Extent.
 * @property {HTMLCanvasElement|HTMLImageElement|HTMLVideoElement} image Image.
 */

/**
 * Renders the source data into new canvas based on the triangulation.
 *
 * @param {number} width Width of the canvas.
 * @param {number} height Height of the canvas.
 * @param {number} pixelRatio Pixel ratio.
 * @param {number} sourceResolution Source resolution.
 * @param {import("./extent.js").Extent} sourceExtent Extent of the data source.
 * @param {number} targetResolution Target resolution.
 * @param {import("./extent.js").Extent} targetExtent Target extent.
 * @param {import("./reproj/Triangulation.js").default} triangulation Calculated triangulation.
 * @param {Array<ImageExtent>} sources Array of sources.
 * @param {number} gutter Gutter of the sources.
 * @param {boolean} [renderEdges] Render reprojection edges.
 * @param {boolean} [interpolate] Use linear interpolation when resampling.
 * @return {HTMLCanvasElement} Canvas with reprojected data.
 */
function render(
  width,
  height,
  pixelRatio,
  sourceResolution,
  sourceExtent,
  targetResolution,
  targetExtent,
  triangulation,
  sources,
  gutter,
  renderEdges,
  interpolate
) {
  const context = createCanvasContext2D(
    Math.round(pixelRatio * width),
    Math.round(pixelRatio * height),
    canvasPool
  );

  if (!interpolate) {
    context.imageSmoothingEnabled = false;
  }

  if (sources.length === 0) {
    return context.canvas;
  }

  context.scale(pixelRatio, pixelRatio);

  function pixelRound(value) {
    return Math.round(value * pixelRatio) / pixelRatio;
  }

  context.globalCompositeOperation = 'lighter';

  const sourceDataExtent = createEmpty();
  sources.forEach(function (src, i, arr) {
    extend(sourceDataExtent, src.extent);
  });

  const canvasWidthInUnits = getWidth(sourceDataExtent);
  const canvasHeightInUnits = getHeight(sourceDataExtent);
  const stitchContext = createCanvasContext2D(
    Math.round((pixelRatio * canvasWidthInUnits) / sourceResolution),
    Math.round((pixelRatio * canvasHeightInUnits) / sourceResolution),
    canvasPool
  );

  if (!interpolate) {
    stitchContext.imageSmoothingEnabled = false;
  }

  const stitchScale = pixelRatio / sourceResolution;

  sources.forEach(function (src, i, arr) {
    const xPos = src.extent[0] - sourceDataExtent[0];
    const yPos = -(src.extent[3] - sourceDataExtent[3]);
    const srcWidth = getWidth(src.extent);
    const srcHeight = getHeight(src.extent);

    // This test should never fail -- but it does. Need to find a fix the upstream condition
    if (src.image.width > 0 && src.image.height > 0) {
      stitchContext.drawImage(
        src.image,
        gutter,
        gutter,
        src.image.width - 2 * gutter,
        src.image.height - 2 * gutter,
        xPos * stitchScale,
        yPos * stitchScale,
        srcWidth * stitchScale,
        srcHeight * stitchScale
      );
    }
  });

  const targetTopLeft = getTopLeft(targetExtent);

  triangulation.getTriangles().forEach(function (triangle, i, arr) {
    /* Calculate affine transform (src -> dst)
     * Resulting matrix can be used to transform coordinate
     * from `sourceProjection` to destination pixels.
     *
     * To optimize number of context calls and increase numerical stability,
     * we also do the following operations:
     * trans(-topLeftExtentCorner), scale(1 / targetResolution), scale(1, -1)
     * here before solving the linear system so [ui, vi] are pixel coordinates.
     *
     * Src points: xi, yi
     * Dst points: ui, vi
     * Affine coefficients: aij
     *
     * | x0 y0 1  0  0 0 |   |a00|   |u0|
     * | x1 y1 1  0  0 0 |   |a01|   |u1|
     * | x2 y2 1  0  0 0 | x |a02| = |u2|
     * |  0  0 0 x0 y0 1 |   |a10|   |v0|
     * |  0  0 0 x1 y1 1 |   |a11|   |v1|
     * |  0  0 0 x2 y2 1 |   |a12|   |v2|
     */
    const source = triangle.source;
    const target = triangle.target;
    let x0 = source[0][0],
      y0 = source[0][1];
    let x1 = source[1][0],
      y1 = source[1][1];
    let x2 = source[2][0],
      y2 = source[2][1];
    // Make sure that everything is on pixel boundaries
    const u0 = pixelRound((target[0][0] - targetTopLeft[0]) / targetResolution);
    const v0 = pixelRound(
      -(target[0][1] - targetTopLeft[1]) / targetResolution
    );
    const u1 = pixelRound((target[1][0] - targetTopLeft[0]) / targetResolution);
    const v1 = pixelRound(
      -(target[1][1] - targetTopLeft[1]) / targetResolution
    );
    const u2 = pixelRound((target[2][0] - targetTopLeft[0]) / targetResolution);
    const v2 = pixelRound(
      -(target[2][1] - targetTopLeft[1]) / targetResolution
    );

    // Shift all the source points to improve numerical stability
    // of all the subsequent calculations. The [x0, y0] is used here.
    // This is also used to simplify the linear system.
    const sourceNumericalShiftX = x0;
    const sourceNumericalShiftY = y0;
    x0 = 0;
    y0 = 0;
    x1 -= sourceNumericalShiftX;
    y1 -= sourceNumericalShiftY;
    x2 -= sourceNumericalShiftX;
    y2 -= sourceNumericalShiftY;

    const augmentedMatrix = [
      [x1, y1, 0, 0, u1 - u0],
      [x2, y2, 0, 0, u2 - u0],
      [0, 0, x1, y1, v1 - v0],
      [0, 0, x2, y2, v2 - v0],
    ];
    const affineCoefs = solveLinearSystem(augmentedMatrix);
    if (!affineCoefs) {
      return;
    }

    context.save();
    context.beginPath();

    if (isBrokenDiagonalRendering() || !interpolate) {
      // Make sure that all lines are horizontal or vertical
      context.moveTo(u1, v1);
      // This is the diagonal line. Do it in 4 steps
      const steps = 4;
      const ud = u0 - u1;
      const vd = v0 - v1;
      for (let step = 0; step < steps; step++) {
        // Go horizontally
        context.lineTo(
          u1 + pixelRound(((step + 1) * ud) / steps),
          v1 + pixelRound((step * vd) / (steps - 1))
        );
        // Go vertically
        if (step != steps - 1) {
          context.lineTo(
            u1 + pixelRound(((step + 1) * ud) / steps),
            v1 + pixelRound(((step + 1) * vd) / (steps - 1))
          );
        }
      }
      // We are almost at u0r, v0r
      context.lineTo(u2, v2);
    } else {
      context.moveTo(u1, v1);
      context.lineTo(u0, v0);
      context.lineTo(u2, v2);
    }

    context.clip();

    context.transform(
      affineCoefs[0],
      affineCoefs[2],
      affineCoefs[1],
      affineCoefs[3],
      u0,
      v0
    );

    context.translate(
      sourceDataExtent[0] - sourceNumericalShiftX,
      sourceDataExtent[3] - sourceNumericalShiftY
    );

    context.scale(
      sourceResolution / pixelRatio,
      -sourceResolution / pixelRatio
    );

    context.drawImage(stitchContext.canvas, 0, 0);
    context.restore();
  });

  releaseCanvas(stitchContext);
  canvasPool.push(stitchContext.canvas);

  if (renderEdges) {
    context.save();

    context.globalCompositeOperation = 'source-over';
    context.strokeStyle = 'black';
    context.lineWidth = 1;

    triangulation.getTriangles().forEach(function (triangle, i, arr) {
      const target = triangle.target;
      const u0 = (target[0][0] - targetTopLeft[0]) / targetResolution;
      const v0 = -(target[0][1] - targetTopLeft[1]) / targetResolution;
      const u1 = (target[1][0] - targetTopLeft[0]) / targetResolution;
      const v1 = -(target[1][1] - targetTopLeft[1]) / targetResolution;
      const u2 = (target[2][0] - targetTopLeft[0]) / targetResolution;
      const v2 = -(target[2][1] - targetTopLeft[1]) / targetResolution;

      context.beginPath();
      context.moveTo(u1, v1);
      context.lineTo(u0, v0);
      context.lineTo(u2, v2);
      context.closePath();
      context.stroke();
    });

    context.restore();
  }
  return context.canvas;
}

/**
 * @module ol/reproj/Tile
 */

/**
 * @typedef {function(number, number, number, number) : (import("../ImageTile.js").default)} FunctionType
 */

/**
 * @classdesc
 * Class encapsulating single reprojected tile.
 * See {@link module:ol/source/TileImage~TileImage}.
 *
 */
class ReprojTile extends Tile$1 {
  /**
   * @param {import("../proj/Projection.js").default} sourceProj Source projection.
   * @param {import("../tilegrid/TileGrid.js").default} sourceTileGrid Source tile grid.
   * @param {import("../proj/Projection.js").default} targetProj Target projection.
   * @param {import("../tilegrid/TileGrid.js").default} targetTileGrid Target tile grid.
   * @param {import("../tilecoord.js").TileCoord} tileCoord Coordinate of the tile.
   * @param {import("../tilecoord.js").TileCoord} wrappedTileCoord Coordinate of the tile wrapped in X.
   * @param {number} pixelRatio Pixel ratio.
   * @param {number} gutter Gutter of the source tiles.
   * @param {FunctionType} getTileFunction
   *     Function returning source tiles (z, x, y, pixelRatio).
   * @param {number} [errorThreshold] Acceptable reprojection error (in px).
   * @param {boolean} [renderEdges] Render reprojection edges.
   * @param {boolean} [interpolate] Use linear interpolation when resampling.
   */
  constructor(
    sourceProj,
    sourceTileGrid,
    targetProj,
    targetTileGrid,
    tileCoord,
    wrappedTileCoord,
    pixelRatio,
    gutter,
    getTileFunction,
    errorThreshold,
    renderEdges,
    interpolate
  ) {
    super(tileCoord, TileState.IDLE, {interpolate: !!interpolate});

    /**
     * @private
     * @type {boolean}
     */
    this.renderEdges_ = renderEdges !== undefined ? renderEdges : false;

    /**
     * @private
     * @type {number}
     */
    this.pixelRatio_ = pixelRatio;

    /**
     * @private
     * @type {number}
     */
    this.gutter_ = gutter;

    /**
     * @private
     * @type {HTMLCanvasElement}
     */
    this.canvas_ = null;

    /**
     * @private
     * @type {import("../tilegrid/TileGrid.js").default}
     */
    this.sourceTileGrid_ = sourceTileGrid;

    /**
     * @private
     * @type {import("../tilegrid/TileGrid.js").default}
     */
    this.targetTileGrid_ = targetTileGrid;

    /**
     * @private
     * @type {import("../tilecoord.js").TileCoord}
     */
    this.wrappedTileCoord_ = wrappedTileCoord ? wrappedTileCoord : tileCoord;

    /**
     * @private
     * @type {!Array<import("../ImageTile.js").default>}
     */
    this.sourceTiles_ = [];

    /**
     * @private
     * @type {?Array<import("../events.js").EventsKey>}
     */
    this.sourcesListenerKeys_ = null;

    /**
     * @private
     * @type {number}
     */
    this.sourceZ_ = 0;

    const targetExtent = targetTileGrid.getTileCoordExtent(
      this.wrappedTileCoord_
    );
    const maxTargetExtent = this.targetTileGrid_.getExtent();
    let maxSourceExtent = this.sourceTileGrid_.getExtent();

    const limitedTargetExtent = maxTargetExtent
      ? getIntersection(targetExtent, maxTargetExtent)
      : targetExtent;

    if (getArea(limitedTargetExtent) === 0) {
      // Tile is completely outside range -> EMPTY
      // TODO: is it actually correct that the source even creates the tile ?
      this.state = TileState.EMPTY;
      return;
    }

    const sourceProjExtent = sourceProj.getExtent();
    if (sourceProjExtent) {
      if (!maxSourceExtent) {
        maxSourceExtent = sourceProjExtent;
      } else {
        maxSourceExtent = getIntersection(maxSourceExtent, sourceProjExtent);
      }
    }

    const targetResolution = targetTileGrid.getResolution(
      this.wrappedTileCoord_[0]
    );

    const sourceResolution = calculateSourceExtentResolution(
      sourceProj,
      targetProj,
      limitedTargetExtent,
      targetResolution
    );

    if (!isFinite(sourceResolution) || sourceResolution <= 0) {
      // invalid sourceResolution -> EMPTY
      // probably edges of the projections when no extent is defined
      this.state = TileState.EMPTY;
      return;
    }

    const errorThresholdInPixels =
      errorThreshold !== undefined ? errorThreshold : ERROR_THRESHOLD;

    /**
     * @private
     * @type {!import("./Triangulation.js").default}
     */
    this.triangulation_ = new Triangulation$1(
      sourceProj,
      targetProj,
      limitedTargetExtent,
      maxSourceExtent,
      sourceResolution * errorThresholdInPixels,
      targetResolution
    );

    if (this.triangulation_.getTriangles().length === 0) {
      // no valid triangles -> EMPTY
      this.state = TileState.EMPTY;
      return;
    }

    this.sourceZ_ = sourceTileGrid.getZForResolution(sourceResolution);
    let sourceExtent = this.triangulation_.calculateSourceExtent();

    if (maxSourceExtent) {
      if (sourceProj.canWrapX()) {
        sourceExtent[1] = clamp(
          sourceExtent[1],
          maxSourceExtent[1],
          maxSourceExtent[3]
        );
        sourceExtent[3] = clamp(
          sourceExtent[3],
          maxSourceExtent[1],
          maxSourceExtent[3]
        );
      } else {
        sourceExtent = getIntersection(sourceExtent, maxSourceExtent);
      }
    }

    if (!getArea(sourceExtent)) {
      this.state = TileState.EMPTY;
    } else {
      const sourceRange = sourceTileGrid.getTileRangeForExtentAndZ(
        sourceExtent,
        this.sourceZ_
      );

      for (let srcX = sourceRange.minX; srcX <= sourceRange.maxX; srcX++) {
        for (let srcY = sourceRange.minY; srcY <= sourceRange.maxY; srcY++) {
          const tile = getTileFunction(this.sourceZ_, srcX, srcY, pixelRatio);
          if (tile) {
            this.sourceTiles_.push(tile);
          }
        }
      }

      if (this.sourceTiles_.length === 0) {
        this.state = TileState.EMPTY;
      }
    }
  }

  /**
   * Get the HTML Canvas element for this tile.
   * @return {HTMLCanvasElement} Canvas.
   */
  getImage() {
    return this.canvas_;
  }

  /**
   * @private
   */
  reproject_() {
    const sources = [];
    this.sourceTiles_.forEach((tile) => {
      if (tile && tile.getState() == TileState.LOADED) {
        sources.push({
          extent: this.sourceTileGrid_.getTileCoordExtent(tile.tileCoord),
          image: tile.getImage(),
        });
      }
    });
    this.sourceTiles_.length = 0;

    if (sources.length === 0) {
      this.state = TileState.ERROR;
    } else {
      const z = this.wrappedTileCoord_[0];
      const size = this.targetTileGrid_.getTileSize(z);
      const width = typeof size === 'number' ? size : size[0];
      const height = typeof size === 'number' ? size : size[1];
      const targetResolution = this.targetTileGrid_.getResolution(z);
      const sourceResolution = this.sourceTileGrid_.getResolution(
        this.sourceZ_
      );

      const targetExtent = this.targetTileGrid_.getTileCoordExtent(
        this.wrappedTileCoord_
      );

      this.canvas_ = render(
        width,
        height,
        this.pixelRatio_,
        sourceResolution,
        this.sourceTileGrid_.getExtent(),
        targetResolution,
        targetExtent,
        this.triangulation_,
        sources,
        this.gutter_,
        this.renderEdges_,
        this.interpolate
      );

      this.state = TileState.LOADED;
    }
    this.changed();
  }

  /**
   * Load not yet loaded URI.
   */
  load() {
    if (this.state == TileState.IDLE) {
      this.state = TileState.LOADING;
      this.changed();

      let leftToLoad = 0;

      this.sourcesListenerKeys_ = [];
      this.sourceTiles_.forEach((tile) => {
        const state = tile.getState();
        if (state == TileState.IDLE || state == TileState.LOADING) {
          leftToLoad++;

          const sourceListenKey = listen(
            tile,
            EventType.CHANGE,
            function (e) {
              const state = tile.getState();
              if (
                state == TileState.LOADED ||
                state == TileState.ERROR ||
                state == TileState.EMPTY
              ) {
                unlistenByKey(sourceListenKey);
                leftToLoad--;
                if (leftToLoad === 0) {
                  this.unlistenSources_();
                  this.reproject_();
                }
              }
            },
            this
          );
          this.sourcesListenerKeys_.push(sourceListenKey);
        }
      });

      if (leftToLoad === 0) {
        setTimeout(this.reproject_.bind(this), 0);
      } else {
        this.sourceTiles_.forEach(function (tile, i, arr) {
          const state = tile.getState();
          if (state == TileState.IDLE) {
            tile.load();
          }
        });
      }
    }
  }

  /**
   * @private
   */
  unlistenSources_() {
    this.sourcesListenerKeys_.forEach(unlistenByKey);
    this.sourcesListenerKeys_ = null;
  }

  /**
   * Remove from the cache due to expiry
   */
  release() {
    if (this.canvas_) {
      releaseCanvas(this.canvas_.getContext('2d'));
      canvasPool.push(this.canvas_);
      this.canvas_ = null;
    }
    super.release();
  }
}

var ReprojTile$1 = ReprojTile;

/**
 * @module ol/TileRange
 */

/**
 * A representation of a contiguous block of tiles.  A tile range is specified
 * by its min/max tile coordinates and is inclusive of coordinates.
 */
class TileRange {
  /**
   * @param {number} minX Minimum X.
   * @param {number} maxX Maximum X.
   * @param {number} minY Minimum Y.
   * @param {number} maxY Maximum Y.
   */
  constructor(minX, maxX, minY, maxY) {
    /**
     * @type {number}
     */
    this.minX = minX;

    /**
     * @type {number}
     */
    this.maxX = maxX;

    /**
     * @type {number}
     */
    this.minY = minY;

    /**
     * @type {number}
     */
    this.maxY = maxY;
  }

  /**
   * @param {import("./tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @return {boolean} Contains tile coordinate.
   */
  contains(tileCoord) {
    return this.containsXY(tileCoord[1], tileCoord[2]);
  }

  /**
   * @param {TileRange} tileRange Tile range.
   * @return {boolean} Contains.
   */
  containsTileRange(tileRange) {
    return (
      this.minX <= tileRange.minX &&
      tileRange.maxX <= this.maxX &&
      this.minY <= tileRange.minY &&
      tileRange.maxY <= this.maxY
    );
  }

  /**
   * @param {number} x Tile coordinate x.
   * @param {number} y Tile coordinate y.
   * @return {boolean} Contains coordinate.
   */
  containsXY(x, y) {
    return this.minX <= x && x <= this.maxX && this.minY <= y && y <= this.maxY;
  }

  /**
   * @param {TileRange} tileRange Tile range.
   * @return {boolean} Equals.
   */
  equals(tileRange) {
    return (
      this.minX == tileRange.minX &&
      this.minY == tileRange.minY &&
      this.maxX == tileRange.maxX &&
      this.maxY == tileRange.maxY
    );
  }

  /**
   * @param {TileRange} tileRange Tile range.
   */
  extend(tileRange) {
    if (tileRange.minX < this.minX) {
      this.minX = tileRange.minX;
    }
    if (tileRange.maxX > this.maxX) {
      this.maxX = tileRange.maxX;
    }
    if (tileRange.minY < this.minY) {
      this.minY = tileRange.minY;
    }
    if (tileRange.maxY > this.maxY) {
      this.maxY = tileRange.maxY;
    }
  }

  /**
   * @return {number} Height.
   */
  getHeight() {
    return this.maxY - this.minY + 1;
  }

  /**
   * @return {import("./size.js").Size} Size.
   */
  getSize() {
    return [this.getWidth(), this.getHeight()];
  }

  /**
   * @return {number} Width.
   */
  getWidth() {
    return this.maxX - this.minX + 1;
  }

  /**
   * @param {TileRange} tileRange Tile range.
   * @return {boolean} Intersects.
   */
  intersects(tileRange) {
    return (
      this.minX <= tileRange.maxX &&
      this.maxX >= tileRange.minX &&
      this.minY <= tileRange.maxY &&
      this.maxY >= tileRange.minY
    );
  }
}

/**
 * @param {number} minX Minimum X.
 * @param {number} maxX Maximum X.
 * @param {number} minY Minimum Y.
 * @param {number} maxY Maximum Y.
 * @param {TileRange} [tileRange] TileRange.
 * @return {TileRange} Tile range.
 */
function createOrUpdate$1(minX, maxX, minY, maxY, tileRange) {
  if (tileRange !== undefined) {
    tileRange.minX = minX;
    tileRange.maxX = maxX;
    tileRange.minY = minY;
    tileRange.maxY = maxY;
    return tileRange;
  }
  return new TileRange(minX, maxX, minY, maxY);
}

var TileRange$1 = TileRange;

/**
 * @module ol/renderer/canvas/TileLayer
 */

/**
 * @classdesc
 * Canvas renderer for tile layers.
 * @api
 * @template {import("../../layer/Tile.js").default<import("../../source/Tile.js").default>|import("../../layer/VectorTile.js").default} [LayerType=import("../../layer/Tile.js").default<import("../../source/Tile.js").default>|import("../../layer/VectorTile.js").default]
 * @extends {CanvasLayerRenderer<LayerType>}
 */
class CanvasTileLayerRenderer extends CanvasLayerRenderer$1 {
  /**
   * @param {LayerType} tileLayer Tile layer.
   */
  constructor(tileLayer) {
    super(tileLayer);

    /**
     * Rendered extent has changed since the previous `renderFrame()` call
     * @type {boolean}
     */
    this.extentChanged = true;

    /**
     * @private
     * @type {?import("../../extent.js").Extent}
     */
    this.renderedExtent_ = null;

    /**
     * @protected
     * @type {number}
     */
    this.renderedPixelRatio;

    /**
     * @protected
     * @type {import("../../proj/Projection.js").default}
     */
    this.renderedProjection = null;

    /**
     * @protected
     * @type {number}
     */
    this.renderedRevision;

    /**
     * @protected
     * @type {!Array<import("../../Tile.js").default>}
     */
    this.renderedTiles = [];

    /**
     * @private
     * @type {boolean}
     */
    this.newTiles_ = false;

    /**
     * @protected
     * @type {import("../../extent.js").Extent}
     */
    this.tmpExtent = createEmpty();

    /**
     * @private
     * @type {import("../../TileRange.js").default}
     */
    this.tmpTileRange_ = new TileRange$1(0, 0, 0, 0);
  }

  /**
   * @protected
   * @param {import("../../Tile.js").default} tile Tile.
   * @return {boolean} Tile is drawable.
   */
  isDrawableTile(tile) {
    const tileLayer = this.getLayer();
    const tileState = tile.getState();
    const useInterimTilesOnError = tileLayer.getUseInterimTilesOnError();
    return (
      tileState == TileState.LOADED ||
      tileState == TileState.EMPTY ||
      (tileState == TileState.ERROR && !useInterimTilesOnError)
    );
  }

  /**
   * @param {number} z Tile coordinate z.
   * @param {number} x Tile coordinate x.
   * @param {number} y Tile coordinate y.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @return {!import("../../Tile.js").default} Tile.
   */
  getTile(z, x, y, frameState) {
    const pixelRatio = frameState.pixelRatio;
    const projection = frameState.viewState.projection;
    const tileLayer = this.getLayer();
    const tileSource = tileLayer.getSource();
    let tile = tileSource.getTile(z, x, y, pixelRatio, projection);
    if (tile.getState() == TileState.ERROR) {
      if (tileLayer.getUseInterimTilesOnError() && tileLayer.getPreload() > 0) {
        // Preloaded tiles for lower resolutions might have finished loading.
        this.newTiles_ = true;
      }
    }
    if (!this.isDrawableTile(tile)) {
      tile = tile.getInterimTile();
    }
    return tile;
  }

  /**
   * @param {import("../../pixel.js").Pixel} pixel Pixel.
   * @return {Uint8ClampedArray} Data at the pixel location.
   */
  getData(pixel) {
    const frameState = this.frameState;
    if (!frameState) {
      return null;
    }

    const layer = this.getLayer();
    const coordinate = apply(
      frameState.pixelToCoordinateTransform,
      pixel.slice()
    );

    const layerExtent = layer.getExtent();
    if (layerExtent) {
      if (!containsCoordinate(layerExtent, coordinate)) {
        return null;
      }
    }

    const pixelRatio = frameState.pixelRatio;
    const projection = frameState.viewState.projection;
    const viewState = frameState.viewState;
    const source = layer.getRenderSource();
    const tileGrid = source.getTileGridForProjection(viewState.projection);
    const tilePixelRatio = source.getTilePixelRatio(frameState.pixelRatio);

    for (
      let z = tileGrid.getZForResolution(viewState.resolution);
      z >= tileGrid.getMinZoom();
      --z
    ) {
      const tileCoord = tileGrid.getTileCoordForCoordAndZ(coordinate, z);
      const tile = source.getTile(
        z,
        tileCoord[1],
        tileCoord[2],
        pixelRatio,
        projection
      );
      if (
        !(tile instanceof ImageTile$1 || tile instanceof ReprojTile$1) ||
        (tile instanceof ReprojTile$1 && tile.getState() === TileState.EMPTY)
      ) {
        return null;
      }

      if (tile.getState() !== TileState.LOADED) {
        continue;
      }

      const tileOrigin = tileGrid.getOrigin(z);
      const tileSize = toSize(tileGrid.getTileSize(z));
      const tileResolution = tileGrid.getResolution(z);

      const col = Math.floor(
        tilePixelRatio *
          ((coordinate[0] - tileOrigin[0]) / tileResolution -
            tileCoord[1] * tileSize[0])
      );

      const row = Math.floor(
        tilePixelRatio *
          ((tileOrigin[1] - coordinate[1]) / tileResolution -
            tileCoord[2] * tileSize[1])
      );

      const gutter = Math.round(
        tilePixelRatio * source.getGutterForProjection(viewState.projection)
      );

      return this.getImageData(tile.getImage(), col + gutter, row + gutter);
    }

    return null;
  }

  /**
   * @param {Object<number, Object<string, import("../../Tile.js").default>>} tiles Lookup of loaded tiles by zoom level.
   * @param {number} zoom Zoom level.
   * @param {import("../../Tile.js").default} tile Tile.
   * @return {boolean|void} If `false`, the tile will not be considered loaded.
   */
  loadedTileCallback(tiles, zoom, tile) {
    if (this.isDrawableTile(tile)) {
      return super.loadedTileCallback(tiles, zoom, tile);
    }
    return false;
  }

  /**
   * Determine whether render should be called.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @return {boolean} Layer is ready to be rendered.
   */
  prepareFrame(frameState) {
    return !!this.getLayer().getSource();
  }

  /**
   * Render the layer.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @param {HTMLElement} target Target that may be used to render content to.
   * @return {HTMLElement} The rendered element.
   */
  renderFrame(frameState, target) {
    const layerState = frameState.layerStatesArray[frameState.layerIndex];
    const viewState = frameState.viewState;
    const projection = viewState.projection;
    const viewResolution = viewState.resolution;
    const viewCenter = viewState.center;
    const rotation = viewState.rotation;
    const pixelRatio = frameState.pixelRatio;

    const tileLayer = this.getLayer();
    const tileSource = tileLayer.getSource();
    const sourceRevision = tileSource.getRevision();
    const tileGrid = tileSource.getTileGridForProjection(projection);
    const z = tileGrid.getZForResolution(viewResolution, tileSource.zDirection);
    const tileResolution = tileGrid.getResolution(z);

    let extent = frameState.extent;
    const resolution = frameState.viewState.resolution;
    const tilePixelRatio = tileSource.getTilePixelRatio(pixelRatio);
    // desired dimensions of the canvas in pixels
    const width = Math.round((getWidth(extent) / resolution) * pixelRatio);
    const height = Math.round((getHeight(extent) / resolution) * pixelRatio);

    const layerExtent =
      layerState.extent && fromUserExtent(layerState.extent);
    if (layerExtent) {
      extent = getIntersection(
        extent,
        fromUserExtent(layerState.extent)
      );
    }

    const dx = (tileResolution * width) / 2 / tilePixelRatio;
    const dy = (tileResolution * height) / 2 / tilePixelRatio;
    const canvasExtent = [
      viewCenter[0] - dx,
      viewCenter[1] - dy,
      viewCenter[0] + dx,
      viewCenter[1] + dy,
    ];

    const tileRange = tileGrid.getTileRangeForExtentAndZ(extent, z);

    /**
     * @type {Object<number, Object<string, import("../../Tile.js").default>>}
     */
    const tilesToDrawByZ = {};
    tilesToDrawByZ[z] = {};

    const findLoadedTiles = this.createLoadedTileFinder(
      tileSource,
      projection,
      tilesToDrawByZ
    );

    const tmpExtent = this.tmpExtent;
    const tmpTileRange = this.tmpTileRange_;
    this.newTiles_ = false;
    const viewport = rotation
      ? getRotatedViewport(
          viewState.center,
          resolution,
          rotation,
          frameState.size
        )
      : undefined;
    for (let x = tileRange.minX; x <= tileRange.maxX; ++x) {
      for (let y = tileRange.minY; y <= tileRange.maxY; ++y) {
        if (
          rotation &&
          !tileGrid.tileCoordIntersectsViewport([z, x, y], viewport)
        ) {
          continue;
        }
        const tile = this.getTile(z, x, y, frameState);
        if (this.isDrawableTile(tile)) {
          const uid = getUid(this);
          if (tile.getState() == TileState.LOADED) {
            tilesToDrawByZ[z][tile.tileCoord.toString()] = tile;
            let inTransition = tile.inTransition(uid);
            if (inTransition && layerState.opacity !== 1) {
              // Skipping transition when layer is not fully opaque avoids visual artifacts.
              tile.endTransition(uid);
              inTransition = false;
            }
            if (
              !this.newTiles_ &&
              (inTransition || !this.renderedTiles.includes(tile))
            ) {
              this.newTiles_ = true;
            }
          }
          if (tile.getAlpha(uid, frameState.time) === 1) {
            // don't look for alt tiles if alpha is 1
            continue;
          }
        }

        const childTileRange = tileGrid.getTileCoordChildTileRange(
          tile.tileCoord,
          tmpTileRange,
          tmpExtent
        );

        let covered = false;
        if (childTileRange) {
          covered = findLoadedTiles(z + 1, childTileRange);
        }
        if (!covered) {
          tileGrid.forEachTileCoordParentTileRange(
            tile.tileCoord,
            findLoadedTiles,
            tmpTileRange,
            tmpExtent
          );
        }
      }
    }

    const canvasScale =
      ((tileResolution / viewResolution) * pixelRatio) / tilePixelRatio;

    // set forward and inverse pixel transforms
    compose(
      this.pixelTransform,
      frameState.size[0] / 2,
      frameState.size[1] / 2,
      1 / pixelRatio,
      1 / pixelRatio,
      rotation,
      -width / 2,
      -height / 2
    );

    const canvasTransform = toString$1(this.pixelTransform);

    this.useContainer(target, canvasTransform, this.getBackground(frameState));
    const context = this.context;
    const canvas = context.canvas;

    makeInverse(this.inversePixelTransform, this.pixelTransform);

    // set scale transform for calculating tile positions on the canvas
    compose(
      this.tempTransform,
      width / 2,
      height / 2,
      canvasScale,
      canvasScale,
      0,
      -width / 2,
      -height / 2
    );

    if (canvas.width != width || canvas.height != height) {
      canvas.width = width;
      canvas.height = height;
    } else if (!this.containerReused) {
      context.clearRect(0, 0, width, height);
    }

    if (layerExtent) {
      this.clipUnrotated(context, frameState, layerExtent);
    }

    if (!tileSource.getInterpolate()) {
      context.imageSmoothingEnabled = false;
    }

    this.preRender(context, frameState);

    this.renderedTiles.length = 0;
    /** @type {Array<number>} */
    let zs = Object.keys(tilesToDrawByZ).map(Number);
    zs.sort(ascending);

    let clips, clipZs, currentClip;
    if (
      layerState.opacity === 1 &&
      (!this.containerReused ||
        tileSource.getOpaque(frameState.viewState.projection))
    ) {
      zs = zs.reverse();
    } else {
      clips = [];
      clipZs = [];
    }
    for (let i = zs.length - 1; i >= 0; --i) {
      const currentZ = zs[i];
      const currentTilePixelSize = tileSource.getTilePixelSize(
        currentZ,
        pixelRatio,
        projection
      );
      const currentResolution = tileGrid.getResolution(currentZ);
      const currentScale = currentResolution / tileResolution;
      const dx = currentTilePixelSize[0] * currentScale * canvasScale;
      const dy = currentTilePixelSize[1] * currentScale * canvasScale;
      const originTileCoord = tileGrid.getTileCoordForCoordAndZ(
        getTopLeft(canvasExtent),
        currentZ
      );
      const originTileExtent = tileGrid.getTileCoordExtent(originTileCoord);
      const origin = apply(this.tempTransform, [
        (tilePixelRatio * (originTileExtent[0] - canvasExtent[0])) /
          tileResolution,
        (tilePixelRatio * (canvasExtent[3] - originTileExtent[3])) /
          tileResolution,
      ]);
      const tileGutter =
        tilePixelRatio * tileSource.getGutterForProjection(projection);
      const tilesToDraw = tilesToDrawByZ[currentZ];
      for (const tileCoordKey in tilesToDraw) {
        const tile = /** @type {import("../../ImageTile.js").default} */ (
          tilesToDraw[tileCoordKey]
        );
        const tileCoord = tile.tileCoord;

        // Calculate integer positions and sizes so that tiles align
        const xIndex = originTileCoord[1] - tileCoord[1];
        const nextX = Math.round(origin[0] - (xIndex - 1) * dx);
        const yIndex = originTileCoord[2] - tileCoord[2];
        const nextY = Math.round(origin[1] - (yIndex - 1) * dy);
        const x = Math.round(origin[0] - xIndex * dx);
        const y = Math.round(origin[1] - yIndex * dy);
        const w = nextX - x;
        const h = nextY - y;
        const transition = z === currentZ;

        const inTransition =
          transition && tile.getAlpha(getUid(this), frameState.time) !== 1;
        let contextSaved = false;
        if (!inTransition) {
          if (clips) {
            // Clip mask for regions in this tile that already filled by a higher z tile
            currentClip = [x, y, x + w, y, x + w, y + h, x, y + h];
            for (let i = 0, ii = clips.length; i < ii; ++i) {
              if (z !== currentZ && currentZ < clipZs[i]) {
                const clip = clips[i];
                if (
                  intersects(
                    [x, y, x + w, y + h],
                    [clip[0], clip[3], clip[4], clip[7]]
                  )
                ) {
                  if (!contextSaved) {
                    context.save();
                    contextSaved = true;
                  }
                  context.beginPath();
                  // counter-clockwise (outer ring) for current tile
                  context.moveTo(currentClip[0], currentClip[1]);
                  context.lineTo(currentClip[2], currentClip[3]);
                  context.lineTo(currentClip[4], currentClip[5]);
                  context.lineTo(currentClip[6], currentClip[7]);
                  // clockwise (inner ring) for higher z tile
                  context.moveTo(clip[6], clip[7]);
                  context.lineTo(clip[4], clip[5]);
                  context.lineTo(clip[2], clip[3]);
                  context.lineTo(clip[0], clip[1]);
                  context.clip();
                }
              }
            }
            clips.push(currentClip);
            clipZs.push(currentZ);
          } else {
            context.clearRect(x, y, w, h);
          }
        }
        this.drawTileImage(
          tile,
          frameState,
          x,
          y,
          w,
          h,
          tileGutter,
          transition
        );
        if (clips && !inTransition) {
          if (contextSaved) {
            context.restore();
          }
          this.renderedTiles.unshift(tile);
        } else {
          this.renderedTiles.push(tile);
        }
        this.updateUsedTiles(frameState.usedTiles, tileSource, tile);
      }
    }

    this.renderedRevision = sourceRevision;
    this.renderedResolution = tileResolution;
    this.extentChanged =
      !this.renderedExtent_ || !equals$1(this.renderedExtent_, canvasExtent);
    this.renderedExtent_ = canvasExtent;
    this.renderedPixelRatio = pixelRatio;
    this.renderedProjection = projection;

    this.manageTilePyramid(
      frameState,
      tileSource,
      tileGrid,
      pixelRatio,
      projection,
      extent,
      z,
      tileLayer.getPreload()
    );
    this.scheduleExpireCache(frameState, tileSource);

    this.postRender(context, frameState);

    if (layerState.extent) {
      context.restore();
    }
    context.imageSmoothingEnabled = true;

    if (canvasTransform !== canvas.style.transform) {
      canvas.style.transform = canvasTransform;
    }

    return this.container;
  }

  /**
   * @param {import("../../ImageTile.js").default} tile Tile.
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @param {number} x Left of the tile.
   * @param {number} y Top of the tile.
   * @param {number} w Width of the tile.
   * @param {number} h Height of the tile.
   * @param {number} gutter Tile gutter.
   * @param {boolean} transition Apply an alpha transition.
   */
  drawTileImage(tile, frameState, x, y, w, h, gutter, transition) {
    const image = this.getTileImage(tile);
    if (!image) {
      return;
    }
    const uid = getUid(this);
    const layerState = frameState.layerStatesArray[frameState.layerIndex];
    const alpha =
      layerState.opacity *
      (transition ? tile.getAlpha(uid, frameState.time) : 1);
    const alphaChanged = alpha !== this.context.globalAlpha;
    if (alphaChanged) {
      this.context.save();
      this.context.globalAlpha = alpha;
    }
    this.context.drawImage(
      image,
      gutter,
      gutter,
      image.width - 2 * gutter,
      image.height - 2 * gutter,
      x,
      y,
      w,
      h
    );

    if (alphaChanged) {
      this.context.restore();
    }
    if (alpha !== layerState.opacity) {
      frameState.animate = true;
    } else if (transition) {
      tile.endTransition(uid);
    }
  }

  /**
   * @return {HTMLCanvasElement} Image
   */
  getImage() {
    const context = this.context;
    return context ? context.canvas : null;
  }

  /**
   * Get the image from a tile.
   * @param {import("../../ImageTile.js").default} tile Tile.
   * @return {HTMLCanvasElement|HTMLImageElement|HTMLVideoElement} Image.
   * @protected
   */
  getTileImage(tile) {
    return tile.getImage();
  }

  /**
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @param {import("../../source/Tile.js").default} tileSource Tile source.
   * @protected
   */
  scheduleExpireCache(frameState, tileSource) {
    if (tileSource.canExpireCache()) {
      /**
       * @param {import("../../source/Tile.js").default} tileSource Tile source.
       * @param {import("../../Map.js").default} map Map.
       * @param {import("../../Map.js").FrameState} frameState Frame state.
       */
      const postRenderFunction = function (tileSource, map, frameState) {
        const tileSourceKey = getUid(tileSource);
        if (tileSourceKey in frameState.usedTiles) {
          tileSource.expireCache(
            frameState.viewState.projection,
            frameState.usedTiles[tileSourceKey]
          );
        }
      }.bind(null, tileSource);

      frameState.postRenderFunctions.push(
        /** @type {import("../../Map.js").PostRenderFunction} */ (
          postRenderFunction
        )
      );
    }
  }

  /**
   * @param {!Object<string, !Object<string, boolean>>} usedTiles Used tiles.
   * @param {import("../../source/Tile.js").default} tileSource Tile source.
   * @param {import('../../Tile.js').default} tile Tile.
   * @protected
   */
  updateUsedTiles(usedTiles, tileSource, tile) {
    // FIXME should we use tilesToDrawByZ instead?
    const tileSourceKey = getUid(tileSource);
    if (!(tileSourceKey in usedTiles)) {
      usedTiles[tileSourceKey] = {};
    }
    usedTiles[tileSourceKey][tile.getKey()] = true;
  }

  /**
   * Manage tile pyramid.
   * This function performs a number of functions related to the tiles at the
   * current zoom and lower zoom levels:
   * - registers idle tiles in frameState.wantedTiles so that they are not
   *   discarded by the tile queue
   * - enqueues missing tiles
   * @param {import("../../Map.js").FrameState} frameState Frame state.
   * @param {import("../../source/Tile.js").default} tileSource Tile source.
   * @param {import("../../tilegrid/TileGrid.js").default} tileGrid Tile grid.
   * @param {number} pixelRatio Pixel ratio.
   * @param {import("../../proj/Projection.js").default} projection Projection.
   * @param {import("../../extent.js").Extent} extent Extent.
   * @param {number} currentZ Current Z.
   * @param {number} preload Load low resolution tiles up to `preload` levels.
   * @param {function(import("../../Tile.js").default):void} [tileCallback] Tile callback.
   * @protected
   */
  manageTilePyramid(
    frameState,
    tileSource,
    tileGrid,
    pixelRatio,
    projection,
    extent,
    currentZ,
    preload,
    tileCallback
  ) {
    const tileSourceKey = getUid(tileSource);
    if (!(tileSourceKey in frameState.wantedTiles)) {
      frameState.wantedTiles[tileSourceKey] = {};
    }
    const wantedTiles = frameState.wantedTiles[tileSourceKey];
    const tileQueue = frameState.tileQueue;
    const minZoom = tileGrid.getMinZoom();
    const rotation = frameState.viewState.rotation;
    const viewport = rotation
      ? getRotatedViewport(
          frameState.viewState.center,
          frameState.viewState.resolution,
          rotation,
          frameState.size
        )
      : undefined;
    let tileCount = 0;
    let tile, tileRange, tileResolution, x, y, z;
    for (z = minZoom; z <= currentZ; ++z) {
      tileRange = tileGrid.getTileRangeForExtentAndZ(extent, z, tileRange);
      tileResolution = tileGrid.getResolution(z);
      for (x = tileRange.minX; x <= tileRange.maxX; ++x) {
        for (y = tileRange.minY; y <= tileRange.maxY; ++y) {
          if (
            rotation &&
            !tileGrid.tileCoordIntersectsViewport([z, x, y], viewport)
          ) {
            continue;
          }
          if (currentZ - z <= preload) {
            ++tileCount;
            tile = tileSource.getTile(z, x, y, pixelRatio, projection);
            if (tile.getState() == TileState.IDLE) {
              wantedTiles[tile.getKey()] = true;
              if (!tileQueue.isKeyQueued(tile.getKey())) {
                tileQueue.enqueue([
                  tile,
                  tileSourceKey,
                  tileGrid.getTileCoordCenter(tile.tileCoord),
                  tileResolution,
                ]);
              }
            }
            if (tileCallback !== undefined) {
              tileCallback(tile);
            }
          } else {
            tileSource.useTile(z, x, y, projection);
          }
        }
      }
    }
    tileSource.updateCacheSize(tileCount, projection);
  }
}

var CanvasTileLayerRenderer$1 = CanvasTileLayerRenderer;

/**
 * @module ol/layer/Tile
 */

/**
 * @classdesc
 * For layer sources that provide pre-rendered, tiled images in grids that are
 * organized by zoom levels for specific resolutions.
 * Note that any property set in the options is set as a {@link module:ol/Object~BaseObject}
 * property on the layer object; for example, setting `title: 'My Title'` in the
 * options means that `title` is observable, and has get/set accessors.
 *
 * @template {import("../source/Tile.js").default} TileSourceType
 * @extends BaseTileLayer<TileSourceType, CanvasTileLayerRenderer>
 * @api
 */
class TileLayer extends BaseTileLayer$1 {
  /**
   * @param {import("./BaseTile.js").Options<TileSourceType>} [options] Tile layer options.
   */
  constructor(options) {
    super(options);
  }

  createRenderer() {
    return new CanvasTileLayerRenderer$1(this);
  }
}

var TileLayer$1 = TileLayer;

/**
 * @module ol/structs/LRUCache
 */

/**
 * @typedef {Object} Entry
 * @property {string} key_ Key.
 * @property {Object} newer Newer.
 * @property {Object} older Older.
 * @property {*} value_ Value.
 */

/**
 * @classdesc
 * Implements a Least-Recently-Used cache where the keys do not conflict with
 * Object's properties (e.g. 'hasOwnProperty' is not allowed as a key). Expiring
 * items from the cache is the responsibility of the user.
 *
 * @fires import("../events/Event.js").default
 * @template T
 */
class LRUCache {
  /**
   * @param {number} [highWaterMark] High water mark.
   */
  constructor(highWaterMark) {
    /**
     * Desired max cache size after expireCache(). If set to 0, no cache entries
     * will be pruned at all.
     * @type {number}
     */
    this.highWaterMark = highWaterMark !== undefined ? highWaterMark : 2048;

    /**
     * @private
     * @type {number}
     */
    this.count_ = 0;

    /**
     * @private
     * @type {!Object<string, Entry>}
     */
    this.entries_ = {};

    /**
     * @private
     * @type {?Entry}
     */
    this.oldest_ = null;

    /**
     * @private
     * @type {?Entry}
     */
    this.newest_ = null;
  }

  /**
   * @return {boolean} Can expire cache.
   */
  canExpireCache() {
    return this.highWaterMark > 0 && this.getCount() > this.highWaterMark;
  }

  /**
   * Expire the cache.
   * @param {!Object<string, boolean>} [keep] Keys to keep. To be implemented by subclasses.
   */
  expireCache(keep) {
    while (this.canExpireCache()) {
      this.pop();
    }
  }

  /**
   * FIXME empty description for jsdoc
   */
  clear() {
    this.count_ = 0;
    this.entries_ = {};
    this.oldest_ = null;
    this.newest_ = null;
  }

  /**
   * @param {string} key Key.
   * @return {boolean} Contains key.
   */
  containsKey(key) {
    return this.entries_.hasOwnProperty(key);
  }

  /**
   * @param {function(T, string, LRUCache<T>): ?} f The function
   *     to call for every entry from the oldest to the newer. This function takes
   *     3 arguments (the entry value, the entry key and the LRUCache object).
   *     The return value is ignored.
   */
  forEach(f) {
    let entry = this.oldest_;
    while (entry) {
      f(entry.value_, entry.key_, this);
      entry = entry.newer;
    }
  }

  /**
   * @param {string} key Key.
   * @param {*} [options] Options (reserved for subclasses).
   * @return {T} Value.
   */
  get(key, options) {
    const entry = this.entries_[key];
    assert(entry !== undefined, 15); // Tried to get a value for a key that does not exist in the cache
    if (entry === this.newest_) {
      return entry.value_;
    } else if (entry === this.oldest_) {
      this.oldest_ = /** @type {Entry} */ (this.oldest_.newer);
      this.oldest_.older = null;
    } else {
      entry.newer.older = entry.older;
      entry.older.newer = entry.newer;
    }
    entry.newer = null;
    entry.older = this.newest_;
    this.newest_.newer = entry;
    this.newest_ = entry;
    return entry.value_;
  }

  /**
   * Remove an entry from the cache.
   * @param {string} key The entry key.
   * @return {T} The removed entry.
   */
  remove(key) {
    const entry = this.entries_[key];
    assert(entry !== undefined, 15); // Tried to get a value for a key that does not exist in the cache
    if (entry === this.newest_) {
      this.newest_ = /** @type {Entry} */ (entry.older);
      if (this.newest_) {
        this.newest_.newer = null;
      }
    } else if (entry === this.oldest_) {
      this.oldest_ = /** @type {Entry} */ (entry.newer);
      if (this.oldest_) {
        this.oldest_.older = null;
      }
    } else {
      entry.newer.older = entry.older;
      entry.older.newer = entry.newer;
    }
    delete this.entries_[key];
    --this.count_;
    return entry.value_;
  }

  /**
   * @return {number} Count.
   */
  getCount() {
    return this.count_;
  }

  /**
   * @return {Array<string>} Keys.
   */
  getKeys() {
    const keys = new Array(this.count_);
    let i = 0;
    let entry;
    for (entry = this.newest_; entry; entry = entry.older) {
      keys[i++] = entry.key_;
    }
    return keys;
  }

  /**
   * @return {Array<T>} Values.
   */
  getValues() {
    const values = new Array(this.count_);
    let i = 0;
    let entry;
    for (entry = this.newest_; entry; entry = entry.older) {
      values[i++] = entry.value_;
    }
    return values;
  }

  /**
   * @return {T} Last value.
   */
  peekLast() {
    return this.oldest_.value_;
  }

  /**
   * @return {string} Last key.
   */
  peekLastKey() {
    return this.oldest_.key_;
  }

  /**
   * Get the key of the newest item in the cache.  Throws if the cache is empty.
   * @return {string} The newest key.
   */
  peekFirstKey() {
    return this.newest_.key_;
  }

  /**
   * Return an entry without updating least recently used time.
   * @param {string} key Key.
   * @return {T} Value.
   */
  peek(key) {
    if (!this.containsKey(key)) {
      return undefined;
    }
    return this.entries_[key].value_;
  }

  /**
   * @return {T} value Value.
   */
  pop() {
    const entry = this.oldest_;
    delete this.entries_[entry.key_];
    if (entry.newer) {
      entry.newer.older = null;
    }
    this.oldest_ = /** @type {Entry} */ (entry.newer);
    if (!this.oldest_) {
      this.newest_ = null;
    }
    --this.count_;
    return entry.value_;
  }

  /**
   * @param {string} key Key.
   * @param {T} value Value.
   */
  replace(key, value) {
    this.get(key); // update `newest_`
    this.entries_[key].value_ = value;
  }

  /**
   * @param {string} key Key.
   * @param {T} value Value.
   */
  set(key, value) {
    assert(!(key in this.entries_), 16); // Tried to set a value for a key that is used already
    const entry = {
      key_: key,
      newer: null,
      older: this.newest_,
      value_: value,
    };
    if (!this.newest_) {
      this.oldest_ = entry;
    } else {
      this.newest_.newer = entry;
    }
    this.newest_ = entry;
    this.entries_[key] = entry;
    ++this.count_;
  }

  /**
   * Set a maximum number of entries for the cache.
   * @param {number} size Cache size.
   * @api
   */
  setSize(size) {
    this.highWaterMark = size;
  }
}

var LRUCache$1 = LRUCache;

/**
 * @module ol/tilecoord
 */

/**
 * An array of three numbers representing the location of a tile in a tile
 * grid. The order is `z` (zoom level), `x` (column), and `y` (row).
 * @typedef {Array<number>} TileCoord
 * @api
 */

/**
 * @param {number} z Z.
 * @param {number} x X.
 * @param {number} y Y.
 * @param {TileCoord} [tileCoord] Tile coordinate.
 * @return {TileCoord} Tile coordinate.
 */
function createOrUpdate(z, x, y, tileCoord) {
  if (tileCoord !== undefined) {
    tileCoord[0] = z;
    tileCoord[1] = x;
    tileCoord[2] = y;
    return tileCoord;
  }
  return [z, x, y];
}

/**
 * @param {number} z Z.
 * @param {number} x X.
 * @param {number} y Y.
 * @return {string} Key.
 */
function getKeyZXY(z, x, y) {
  return z + '/' + x + '/' + y;
}

/**
 * Get the key for a tile coord.
 * @param {TileCoord} tileCoord The tile coord.
 * @return {string} Key.
 */
function getKey(tileCoord) {
  return getKeyZXY(tileCoord[0], tileCoord[1], tileCoord[2]);
}

/**
 * Get a tile coord given a key.
 * @param {string} key The tile coord key.
 * @return {TileCoord} The tile coord.
 */
function fromKey(key) {
  return key.split('/').map(Number);
}

/**
 * @param {TileCoord} tileCoord Tile coord.
 * @return {number} Hash.
 */
function hash(tileCoord) {
  return (tileCoord[1] << tileCoord[0]) + tileCoord[2];
}

/**
 * @param {TileCoord} tileCoord Tile coordinate.
 * @param {!import("./tilegrid/TileGrid.js").default} tileGrid Tile grid.
 * @return {boolean} Tile coordinate is within extent and zoom level range.
 */
function withinExtentAndZ(tileCoord, tileGrid) {
  const z = tileCoord[0];
  const x = tileCoord[1];
  const y = tileCoord[2];

  if (tileGrid.getMinZoom() > z || z > tileGrid.getMaxZoom()) {
    return false;
  }
  const tileRange = tileGrid.getFullTileRange(z);
  if (!tileRange) {
    return true;
  }
  return tileRange.containsXY(x, y);
}

/**
 * @module ol/TileCache
 */

class TileCache extends LRUCache$1 {
  clear() {
    while (this.getCount() > 0) {
      this.pop().release();
    }
    super.clear();
  }

  /**
   * @param {!Object<string, boolean>} usedTiles Used tiles.
   */
  expireCache(usedTiles) {
    while (this.canExpireCache()) {
      const tile = this.peekLast();
      if (tile.getKey() in usedTiles) {
        break;
      } else {
        this.pop().release();
      }
    }
  }

  /**
   * Prune all tiles from the cache that don't have the same z as the newest tile.
   */
  pruneExceptNewestZ() {
    if (this.getCount() === 0) {
      return;
    }
    const key = this.peekFirstKey();
    const tileCoord = fromKey(key);
    const z = tileCoord[0];
    this.forEach((tile) => {
      if (tile.tileCoord[0] !== z) {
        this.remove(getKey(tile.tileCoord));
        tile.release();
      }
    });
  }
}

var TileCache$1 = TileCache;

/**
 * @module ol/source/TileEventType
 */

/**
 * @enum {string}
 */
var TileEventType = {
  /**
   * Triggered when a tile starts loading.
   * @event module:ol/source/Tile.TileSourceEvent#tileloadstart
   * @api
   */
  TILELOADSTART: 'tileloadstart',

  /**
   * Triggered when a tile finishes loading, either when its data is loaded,
   * or when loading was aborted because the tile is no longer needed.
   * @event module:ol/source/Tile.TileSourceEvent#tileloadend
   * @api
   */
  TILELOADEND: 'tileloadend',

  /**
   * Triggered if tile loading results in an error. Note that this is not the
   * right place to re-fetch tiles. See {@link module:ol/ImageTile~ImageTile#load}
   * for details.
   * @event module:ol/source/Tile.TileSourceEvent#tileloaderror
   * @api
   */
  TILELOADERROR: 'tileloaderror',
};

/**
 * @typedef {'tileloadstart'|'tileloadend'|'tileloaderror'} TileSourceEventTypes
 */

/**
 * @module ol/source/Source
 */

/**
 * @typedef {'undefined' | 'loading' | 'ready' | 'error'} State
 * State of the source, one of 'undefined', 'loading', 'ready' or 'error'.
 */

/**
 * A function that takes a {@link module:ol/Map~FrameState} and returns a string or
 * an array of strings representing source attributions.
 *
 * @typedef {function(import("../Map.js").FrameState): (string|Array<string>)} Attribution
 */

/**
 * A type that can be used to provide attribution information for data sources.
 *
 * It represents either
 * * a simple string (e.g. `'© Acme Inc.'`)
 * * an array of simple strings (e.g. `['© Acme Inc.', '© Bacme Inc.']`)
 * * a function that returns a string or array of strings ({@link module:ol/source/Source~Attribution})
 *
 * @typedef {string|Array<string>|Attribution} AttributionLike
 */

/**
 * @typedef {Object} Options
 * @property {AttributionLike} [attributions] Attributions.
 * @property {boolean} [attributionsCollapsible=true] Attributions are collapsible.
 * @property {import("../proj.js").ProjectionLike} [projection] Projection. Default is the view projection.
 * @property {import("./Source.js").State} [state='ready'] State.
 * @property {boolean} [wrapX=false] WrapX.
 * @property {boolean} [interpolate=false] Use interpolated values when resampling.  By default,
 * the nearest neighbor is used when resampling.
 */

/**
 * @classdesc
 * Abstract base class; normally only used for creating subclasses and not
 * instantiated in apps.
 * Base class for {@link module:ol/layer/Layer~Layer} sources.
 *
 * A generic `change` event is triggered when the state of the source changes.
 * @abstract
 * @api
 */
class Source extends BaseObject$1 {
  /**
   * @param {Options} options Source options.
   */
  constructor(options) {
    super();

    /**
     * @protected
     * @type {import("../proj/Projection.js").default|null}
     */
    this.projection = get(options.projection);

    /**
     * @private
     * @type {?Attribution}
     */
    this.attributions_ = adaptAttributions(options.attributions);

    /**
     * @private
     * @type {boolean}
     */
    this.attributionsCollapsible_ =
      options.attributionsCollapsible !== undefined
        ? options.attributionsCollapsible
        : true;

    /**
     * This source is currently loading data. Sources that defer loading to the
     * map's tile queue never set this to `true`.
     * @type {boolean}
     */
    this.loading = false;

    /**
     * @private
     * @type {import("./Source.js").State}
     */
    this.state_ = options.state !== undefined ? options.state : 'ready';

    /**
     * @private
     * @type {boolean}
     */
    this.wrapX_ = options.wrapX !== undefined ? options.wrapX : false;

    /**
     * @private
     * @type {boolean}
     */
    this.interpolate_ = !!options.interpolate;

    /**
     * @protected
     * @type {function(import("../View.js").ViewOptions):void}
     */
    this.viewResolver = null;

    /**
     * @protected
     * @type {function(Error):void}
     */
    this.viewRejector = null;

    const self = this;
    /**
     * @private
     * @type {Promise<import("../View.js").ViewOptions>}
     */
    this.viewPromise_ = new Promise(function (resolve, reject) {
      self.viewResolver = resolve;
      self.viewRejector = reject;
    });
  }

  /**
   * Get the attribution function for the source.
   * @return {?Attribution} Attribution function.
   * @api
   */
  getAttributions() {
    return this.attributions_;
  }

  /**
   * @return {boolean} Attributions are collapsible.
   * @api
   */
  getAttributionsCollapsible() {
    return this.attributionsCollapsible_;
  }

  /**
   * Get the projection of the source.
   * @return {import("../proj/Projection.js").default|null} Projection.
   * @api
   */
  getProjection() {
    return this.projection;
  }

  /**
   * @param {import("../proj/Projection").default} [projection] Projection.
   * @return {Array<number>|null} Resolutions.
   */
  getResolutions(projection) {
    return null;
  }

  /**
   * @return {Promise<import("../View.js").ViewOptions>} A promise for view-related properties.
   */
  getView() {
    return this.viewPromise_;
  }

  /**
   * Get the state of the source, see {@link import("./Source.js").State} for possible states.
   * @return {import("./Source.js").State} State.
   * @api
   */
  getState() {
    return this.state_;
  }

  /**
   * @return {boolean|undefined} Wrap X.
   */
  getWrapX() {
    return this.wrapX_;
  }

  /**
   * @return {boolean} Use linear interpolation when resampling.
   */
  getInterpolate() {
    return this.interpolate_;
  }

  /**
   * Refreshes the source. The source will be cleared, and data from the server will be reloaded.
   * @api
   */
  refresh() {
    this.changed();
  }

  /**
   * Set the attributions of the source.
   * @param {AttributionLike|undefined} attributions Attributions.
   *     Can be passed as `string`, `Array<string>`, {@link module:ol/source/Source~Attribution},
   *     or `undefined`.
   * @api
   */
  setAttributions(attributions) {
    this.attributions_ = adaptAttributions(attributions);
    this.changed();
  }

  /**
   * Set the state of the source.
   * @param {import("./Source.js").State} state State.
   */
  setState(state) {
    this.state_ = state;
    this.changed();
  }
}

/**
 * Turns the attributions option into an attributions function.
 * @param {AttributionLike|undefined} attributionLike The attribution option.
 * @return {Attribution|null} An attribution function (or null).
 */
function adaptAttributions(attributionLike) {
  if (!attributionLike) {
    return null;
  }
  if (Array.isArray(attributionLike)) {
    return function (frameState) {
      return attributionLike;
    };
  }

  if (typeof attributionLike === 'function') {
    return attributionLike;
  }

  return function (frameState) {
    return [attributionLike];
  };
}

var Source$1 = Source;

/**
 * @module ol/tilegrid/TileGrid
 */

/**
 * @private
 * @type {import("../tilecoord.js").TileCoord}
 */
const tmpTileCoord = [0, 0, 0];

/**
 * Number of decimal digits to consider in integer values when rounding.
 * @type {number}
 */
const DECIMALS = 5;

/**
 * @typedef {Object} Options
 * @property {import("../extent.js").Extent} [extent] Extent for the tile grid. No tiles outside this
 * extent will be requested by {@link module:ol/source/Tile~TileSource} sources. When no `origin` or
 * `origins` are configured, the `origin` will be set to the top-left corner of the extent.
 * @property {number} [minZoom=0] Minimum zoom.
 * @property {import("../coordinate.js").Coordinate} [origin] The tile grid origin, i.e. where the `x`
 * and `y` axes meet (`[z, 0, 0]`). Tile coordinates increase left to right and downwards. If not
 * specified, `extent` or `origins` must be provided.
 * @property {Array<import("../coordinate.js").Coordinate>} [origins] Tile grid origins, i.e. where
 * the `x` and `y` axes meet (`[z, 0, 0]`), for each zoom level. If given, the array length
 * should match the length of the `resolutions` array, i.e. each resolution can have a different
 * origin. Tile coordinates increase left to right and downwards. If not specified, `extent` or
 * `origin` must be provided.
 * @property {!Array<number>} resolutions Resolutions. The array index of each resolution needs
 * to match the zoom level. This means that even if a `minZoom` is configured, the resolutions
 * array will have a length of `maxZoom + 1`.
 * @property {Array<import("../size.js").Size>} [sizes] Number of tile rows and columns
 * of the grid for each zoom level. If specified the values
 * define each zoom level's extent together with the `origin` or `origins`.
 * A grid `extent` can be configured in addition, and will further limit the extent
 * for which tile requests are made by sources. If the bottom-left corner of
 * an extent is used as `origin` or `origins`, then the `y` value must be
 * negative because OpenLayers tile coordinates use the top left as the origin.
 * @property {number|import("../size.js").Size} [tileSize] Tile size.
 * Default is `[256, 256]`.
 * @property {Array<number|import("../size.js").Size>} [tileSizes] Tile sizes. If given, the array length
 * should match the length of the `resolutions` array, i.e. each resolution can have a different
 * tile size.
 */

/**
 * @classdesc
 * Base class for setting the grid pattern for sources accessing tiled-image
 * servers.
 * @api
 */
class TileGrid {
  /**
   * @param {Options} options Tile grid options.
   */
  constructor(options) {
    /**
     * @protected
     * @type {number}
     */
    this.minZoom = options.minZoom !== undefined ? options.minZoom : 0;

    /**
     * @private
     * @type {!Array<number>}
     */
    this.resolutions_ = options.resolutions;
    assert(
      isSorted(
        this.resolutions_,
        function (a, b) {
          return b - a;
        },
        true
      ),
      17
    ); // `resolutions` must be sorted in descending order

    // check if we've got a consistent zoom factor and origin
    let zoomFactor;
    if (!options.origins) {
      for (let i = 0, ii = this.resolutions_.length - 1; i < ii; ++i) {
        if (!zoomFactor) {
          zoomFactor = this.resolutions_[i] / this.resolutions_[i + 1];
        } else {
          if (this.resolutions_[i] / this.resolutions_[i + 1] !== zoomFactor) {
            zoomFactor = undefined;
            break;
          }
        }
      }
    }

    /**
     * @private
     * @type {number|undefined}
     */
    this.zoomFactor_ = zoomFactor;

    /**
     * @protected
     * @type {number}
     */
    this.maxZoom = this.resolutions_.length - 1;

    /**
     * @private
     * @type {import("../coordinate.js").Coordinate|null}
     */
    this.origin_ = options.origin !== undefined ? options.origin : null;

    /**
     * @private
     * @type {Array<import("../coordinate.js").Coordinate>}
     */
    this.origins_ = null;
    if (options.origins !== undefined) {
      this.origins_ = options.origins;
      assert(this.origins_.length == this.resolutions_.length, 20); // Number of `origins` and `resolutions` must be equal
    }

    const extent = options.extent;

    if (extent !== undefined && !this.origin_ && !this.origins_) {
      this.origin_ = getTopLeft(extent);
    }

    assert(
      (!this.origin_ && this.origins_) || (this.origin_ && !this.origins_),
      18
    ); // Either `origin` or `origins` must be configured, never both

    /**
     * @private
     * @type {Array<number|import("../size.js").Size>}
     */
    this.tileSizes_ = null;
    if (options.tileSizes !== undefined) {
      this.tileSizes_ = options.tileSizes;
      assert(this.tileSizes_.length == this.resolutions_.length, 19); // Number of `tileSizes` and `resolutions` must be equal
    }

    /**
     * @private
     * @type {number|import("../size.js").Size}
     */
    this.tileSize_ =
      options.tileSize !== undefined
        ? options.tileSize
        : !this.tileSizes_
        ? DEFAULT_TILE_SIZE
        : null;
    assert(
      (!this.tileSize_ && this.tileSizes_) ||
        (this.tileSize_ && !this.tileSizes_),
      22
    ); // Either `tileSize` or `tileSizes` must be configured, never both

    /**
     * @private
     * @type {import("../extent.js").Extent}
     */
    this.extent_ = extent !== undefined ? extent : null;

    /**
     * @private
     * @type {Array<import("../TileRange.js").default>}
     */
    this.fullTileRanges_ = null;

    /**
     * @private
     * @type {import("../size.js").Size}
     */
    this.tmpSize_ = [0, 0];

    /**
     * @private
     * @type {import("../extent.js").Extent}
     */
    this.tmpExtent_ = [0, 0, 0, 0];

    if (options.sizes !== undefined) {
      this.fullTileRanges_ = options.sizes.map(function (size, z) {
        const tileRange = new TileRange$1(
          Math.min(0, size[0]),
          Math.max(size[0] - 1, -1),
          Math.min(0, size[1]),
          Math.max(size[1] - 1, -1)
        );
        if (extent) {
          const restrictedTileRange = this.getTileRangeForExtentAndZ(extent, z);
          tileRange.minX = Math.max(restrictedTileRange.minX, tileRange.minX);
          tileRange.maxX = Math.min(restrictedTileRange.maxX, tileRange.maxX);
          tileRange.minY = Math.max(restrictedTileRange.minY, tileRange.minY);
          tileRange.maxY = Math.min(restrictedTileRange.maxY, tileRange.maxY);
        }
        return tileRange;
      }, this);
    } else if (extent) {
      this.calculateTileRanges_(extent);
    }
  }

  /**
   * Call a function with each tile coordinate for a given extent and zoom level.
   *
   * @param {import("../extent.js").Extent} extent Extent.
   * @param {number} zoom Integer zoom level.
   * @param {function(import("../tilecoord.js").TileCoord): void} callback Function called with each tile coordinate.
   * @api
   */
  forEachTileCoord(extent, zoom, callback) {
    const tileRange = this.getTileRangeForExtentAndZ(extent, zoom);
    for (let i = tileRange.minX, ii = tileRange.maxX; i <= ii; ++i) {
      for (let j = tileRange.minY, jj = tileRange.maxY; j <= jj; ++j) {
        callback([zoom, i, j]);
      }
    }
  }

  /**
   * @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @param {function(number, import("../TileRange.js").default): boolean} callback Callback.
   * @param {import("../TileRange.js").default} [tempTileRange] Temporary import("../TileRange.js").default object.
   * @param {import("../extent.js").Extent} [tempExtent] Temporary import("../extent.js").Extent object.
   * @return {boolean} Callback succeeded.
   */
  forEachTileCoordParentTileRange(
    tileCoord,
    callback,
    tempTileRange,
    tempExtent
  ) {
    let tileRange, x, y;
    let tileCoordExtent = null;
    let z = tileCoord[0] - 1;
    if (this.zoomFactor_ === 2) {
      x = tileCoord[1];
      y = tileCoord[2];
    } else {
      tileCoordExtent = this.getTileCoordExtent(tileCoord, tempExtent);
    }
    while (z >= this.minZoom) {
      if (this.zoomFactor_ === 2) {
        x = Math.floor(x / 2);
        y = Math.floor(y / 2);
        tileRange = createOrUpdate$1(x, x, y, y, tempTileRange);
      } else {
        tileRange = this.getTileRangeForExtentAndZ(
          tileCoordExtent,
          z,
          tempTileRange
        );
      }
      if (callback(z, tileRange)) {
        return true;
      }
      --z;
    }
    return false;
  }

  /**
   * Get the extent for this tile grid, if it was configured.
   * @return {import("../extent.js").Extent} Extent.
   * @api
   */
  getExtent() {
    return this.extent_;
  }

  /**
   * Get the maximum zoom level for the grid.
   * @return {number} Max zoom.
   * @api
   */
  getMaxZoom() {
    return this.maxZoom;
  }

  /**
   * Get the minimum zoom level for the grid.
   * @return {number} Min zoom.
   * @api
   */
  getMinZoom() {
    return this.minZoom;
  }

  /**
   * Get the origin for the grid at the given zoom level.
   * @param {number} z Integer zoom level.
   * @return {import("../coordinate.js").Coordinate} Origin.
   * @api
   */
  getOrigin(z) {
    if (this.origin_) {
      return this.origin_;
    }
    return this.origins_[z];
  }

  /**
   * Get the resolution for the given zoom level.
   * @param {number} z Integer zoom level.
   * @return {number} Resolution.
   * @api
   */
  getResolution(z) {
    return this.resolutions_[z];
  }

  /**
   * Get the list of resolutions for the tile grid.
   * @return {Array<number>} Resolutions.
   * @api
   */
  getResolutions() {
    return this.resolutions_;
  }

  /**
   * @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @param {import("../TileRange.js").default} [tempTileRange] Temporary import("../TileRange.js").default object.
   * @param {import("../extent.js").Extent} [tempExtent] Temporary import("../extent.js").Extent object.
   * @return {import("../TileRange.js").default|null} Tile range.
   */
  getTileCoordChildTileRange(tileCoord, tempTileRange, tempExtent) {
    if (tileCoord[0] < this.maxZoom) {
      if (this.zoomFactor_ === 2) {
        const minX = tileCoord[1] * 2;
        const minY = tileCoord[2] * 2;
        return createOrUpdate$1(
          minX,
          minX + 1,
          minY,
          minY + 1,
          tempTileRange
        );
      }
      const tileCoordExtent = this.getTileCoordExtent(
        tileCoord,
        tempExtent || this.tmpExtent_
      );
      return this.getTileRangeForExtentAndZ(
        tileCoordExtent,
        tileCoord[0] + 1,
        tempTileRange
      );
    }
    return null;
  }

  /**
   * @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @param {number} z Integer zoom level.
   * @param {import("../TileRange.js").default} [tempTileRange] Temporary import("../TileRange.js").default object.
   * @return {import("../TileRange.js").default|null} Tile range.
   */
  getTileRangeForTileCoordAndZ(tileCoord, z, tempTileRange) {
    if (z > this.maxZoom || z < this.minZoom) {
      return null;
    }

    const tileCoordZ = tileCoord[0];
    const tileCoordX = tileCoord[1];
    const tileCoordY = tileCoord[2];

    if (z === tileCoordZ) {
      return createOrUpdate$1(
        tileCoordX,
        tileCoordY,
        tileCoordX,
        tileCoordY,
        tempTileRange
      );
    }

    if (this.zoomFactor_) {
      const factor = Math.pow(this.zoomFactor_, z - tileCoordZ);
      const minX = Math.floor(tileCoordX * factor);
      const minY = Math.floor(tileCoordY * factor);
      if (z < tileCoordZ) {
        return createOrUpdate$1(minX, minX, minY, minY, tempTileRange);
      }

      const maxX = Math.floor(factor * (tileCoordX + 1)) - 1;
      const maxY = Math.floor(factor * (tileCoordY + 1)) - 1;
      return createOrUpdate$1(minX, maxX, minY, maxY, tempTileRange);
    }

    const tileCoordExtent = this.getTileCoordExtent(tileCoord, this.tmpExtent_);
    return this.getTileRangeForExtentAndZ(tileCoordExtent, z, tempTileRange);
  }

  /**
   * Get the extent for a tile range.
   * @param {number} z Integer zoom level.
   * @param {import("../TileRange.js").default} tileRange Tile range.
   * @param {import("../extent.js").Extent} [tempExtent] Temporary import("../extent.js").Extent object.
   * @return {import("../extent.js").Extent} Extent.
   */
  getTileRangeExtent(z, tileRange, tempExtent) {
    const origin = this.getOrigin(z);
    const resolution = this.getResolution(z);
    const tileSize = toSize(this.getTileSize(z), this.tmpSize_);
    const minX = origin[0] + tileRange.minX * tileSize[0] * resolution;
    const maxX = origin[0] + (tileRange.maxX + 1) * tileSize[0] * resolution;
    const minY = origin[1] + tileRange.minY * tileSize[1] * resolution;
    const maxY = origin[1] + (tileRange.maxY + 1) * tileSize[1] * resolution;
    return createOrUpdate$2(minX, minY, maxX, maxY, tempExtent);
  }

  /**
   * Get a tile range for the given extent and integer zoom level.
   * @param {import("../extent.js").Extent} extent Extent.
   * @param {number} z Integer zoom level.
   * @param {import("../TileRange.js").default} [tempTileRange] Temporary tile range object.
   * @return {import("../TileRange.js").default} Tile range.
   */
  getTileRangeForExtentAndZ(extent, z, tempTileRange) {
    this.getTileCoordForXYAndZ_(extent[0], extent[3], z, false, tmpTileCoord);
    const minX = tmpTileCoord[1];
    const minY = tmpTileCoord[2];
    this.getTileCoordForXYAndZ_(extent[2], extent[1], z, true, tmpTileCoord);
    const maxX = tmpTileCoord[1];
    const maxY = tmpTileCoord[2];
    return createOrUpdate$1(minX, maxX, minY, maxY, tempTileRange);
  }

  /**
   * @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @return {import("../coordinate.js").Coordinate} Tile center.
   */
  getTileCoordCenter(tileCoord) {
    const origin = this.getOrigin(tileCoord[0]);
    const resolution = this.getResolution(tileCoord[0]);
    const tileSize = toSize(this.getTileSize(tileCoord[0]), this.tmpSize_);
    return [
      origin[0] + (tileCoord[1] + 0.5) * tileSize[0] * resolution,
      origin[1] - (tileCoord[2] + 0.5) * tileSize[1] * resolution,
    ];
  }

  /**
   * Get the extent of a tile coordinate.
   *
   * @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @param {import("../extent.js").Extent} [tempExtent] Temporary extent object.
   * @return {import("../extent.js").Extent} Extent.
   * @api
   */
  getTileCoordExtent(tileCoord, tempExtent) {
    const origin = this.getOrigin(tileCoord[0]);
    const resolution = this.getResolution(tileCoord[0]);
    const tileSize = toSize(this.getTileSize(tileCoord[0]), this.tmpSize_);
    const minX = origin[0] + tileCoord[1] * tileSize[0] * resolution;
    const minY = origin[1] - (tileCoord[2] + 1) * tileSize[1] * resolution;
    const maxX = minX + tileSize[0] * resolution;
    const maxY = minY + tileSize[1] * resolution;
    return createOrUpdate$2(minX, minY, maxX, maxY, tempExtent);
  }

  /**
   * Get the tile coordinate for the given map coordinate and resolution.  This
   * method considers that coordinates that intersect tile boundaries should be
   * assigned the higher tile coordinate.
   *
   * @param {import("../coordinate.js").Coordinate} coordinate Coordinate.
   * @param {number} resolution Resolution.
   * @param {import("../tilecoord.js").TileCoord} [opt_tileCoord] Destination import("../tilecoord.js").TileCoord object.
   * @return {import("../tilecoord.js").TileCoord} Tile coordinate.
   * @api
   */
  getTileCoordForCoordAndResolution(coordinate, resolution, opt_tileCoord) {
    return this.getTileCoordForXYAndResolution_(
      coordinate[0],
      coordinate[1],
      resolution,
      false,
      opt_tileCoord
    );
  }

  /**
   * Note that this method should not be called for resolutions that correspond
   * to an integer zoom level.  Instead call the `getTileCoordForXYAndZ_` method.
   * @param {number} x X.
   * @param {number} y Y.
   * @param {number} resolution Resolution (for a non-integer zoom level).
   * @param {boolean} reverseIntersectionPolicy Instead of letting edge
   *     intersections go to the higher tile coordinate, let edge intersections
   *     go to the lower tile coordinate.
   * @param {import("../tilecoord.js").TileCoord} [opt_tileCoord] Temporary import("../tilecoord.js").TileCoord object.
   * @return {import("../tilecoord.js").TileCoord} Tile coordinate.
   * @private
   */
  getTileCoordForXYAndResolution_(
    x,
    y,
    resolution,
    reverseIntersectionPolicy,
    opt_tileCoord
  ) {
    const z = this.getZForResolution(resolution);
    const scale = resolution / this.getResolution(z);
    const origin = this.getOrigin(z);
    const tileSize = toSize(this.getTileSize(z), this.tmpSize_);

    let tileCoordX = (scale * (x - origin[0])) / resolution / tileSize[0];
    let tileCoordY = (scale * (origin[1] - y)) / resolution / tileSize[1];

    if (reverseIntersectionPolicy) {
      tileCoordX = ceil(tileCoordX, DECIMALS) - 1;
      tileCoordY = ceil(tileCoordY, DECIMALS) - 1;
    } else {
      tileCoordX = floor(tileCoordX, DECIMALS);
      tileCoordY = floor(tileCoordY, DECIMALS);
    }

    return createOrUpdate(z, tileCoordX, tileCoordY, opt_tileCoord);
  }

  /**
   * Although there is repetition between this method and `getTileCoordForXYAndResolution_`,
   * they should have separate implementations.  This method is for integer zoom
   * levels.  The other method should only be called for resolutions corresponding
   * to non-integer zoom levels.
   * @param {number} x Map x coordinate.
   * @param {number} y Map y coordinate.
   * @param {number} z Integer zoom level.
   * @param {boolean} reverseIntersectionPolicy Instead of letting edge
   *     intersections go to the higher tile coordinate, let edge intersections
   *     go to the lower tile coordinate.
   * @param {import("../tilecoord.js").TileCoord} [opt_tileCoord] Temporary import("../tilecoord.js").TileCoord object.
   * @return {import("../tilecoord.js").TileCoord} Tile coordinate.
   * @private
   */
  getTileCoordForXYAndZ_(x, y, z, reverseIntersectionPolicy, opt_tileCoord) {
    const origin = this.getOrigin(z);
    const resolution = this.getResolution(z);
    const tileSize = toSize(this.getTileSize(z), this.tmpSize_);

    let tileCoordX = (x - origin[0]) / resolution / tileSize[0];
    let tileCoordY = (origin[1] - y) / resolution / tileSize[1];

    if (reverseIntersectionPolicy) {
      tileCoordX = ceil(tileCoordX, DECIMALS) - 1;
      tileCoordY = ceil(tileCoordY, DECIMALS) - 1;
    } else {
      tileCoordX = floor(tileCoordX, DECIMALS);
      tileCoordY = floor(tileCoordY, DECIMALS);
    }

    return createOrUpdate(z, tileCoordX, tileCoordY, opt_tileCoord);
  }

  /**
   * Get a tile coordinate given a map coordinate and zoom level.
   * @param {import("../coordinate.js").Coordinate} coordinate Coordinate.
   * @param {number} z Zoom level.
   * @param {import("../tilecoord.js").TileCoord} [opt_tileCoord] Destination import("../tilecoord.js").TileCoord object.
   * @return {import("../tilecoord.js").TileCoord} Tile coordinate.
   * @api
   */
  getTileCoordForCoordAndZ(coordinate, z, opt_tileCoord) {
    return this.getTileCoordForXYAndZ_(
      coordinate[0],
      coordinate[1],
      z,
      false,
      opt_tileCoord
    );
  }

  /**
   * @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @return {number} Tile resolution.
   */
  getTileCoordResolution(tileCoord) {
    return this.resolutions_[tileCoord[0]];
  }

  /**
   * Get the tile size for a zoom level. The type of the return value matches the
   * `tileSize` or `tileSizes` that the tile grid was configured with. To always
   * get an {@link import("../size.js").Size}, run the result through {@link module:ol/size.toSize}.
   * @param {number} z Z.
   * @return {number|import("../size.js").Size} Tile size.
   * @api
   */
  getTileSize(z) {
    if (this.tileSize_) {
      return this.tileSize_;
    }
    return this.tileSizes_[z];
  }

  /**
   * @param {number} z Zoom level.
   * @return {import("../TileRange.js").default} Extent tile range for the specified zoom level.
   */
  getFullTileRange(z) {
    if (!this.fullTileRanges_) {
      return this.extent_
        ? this.getTileRangeForExtentAndZ(this.extent_, z)
        : null;
    }
    return this.fullTileRanges_[z];
  }

  /**
   * @param {number} resolution Resolution.
   * @param {number|import("../array.js").NearestDirectionFunction} [opt_direction]
   *     If 0, the nearest resolution will be used.
   *     If 1, the nearest higher resolution (lower Z) will be used. If -1, the
   *     nearest lower resolution (higher Z) will be used. Default is 0.
   *     Use a {@link module:ol/array~NearestDirectionFunction} for more precise control.
   *
   * For example to change tile Z at the midpoint of zoom levels
   * ```js
   * function(value, high, low) {
   *   return value - low * Math.sqrt(high / low);
   * }
   * ```
   * @return {number} Z.
   * @api
   */
  getZForResolution(resolution, opt_direction) {
    const z = linearFindNearest(
      this.resolutions_,
      resolution,
      opt_direction || 0
    );
    return clamp(z, this.minZoom, this.maxZoom);
  }

  /**
   * The tile with the provided tile coordinate intersects the given viewport.
   * @param {import('../tilecoord.js').TileCoord} tileCoord Tile coordinate.
   * @param {Array<number>} viewport Viewport as returned from {@link module:ol/extent.getRotatedViewport}.
   * @return {boolean} The tile with the provided tile coordinate intersects the given viewport.
   */
  tileCoordIntersectsViewport(tileCoord, viewport) {
    return intersectsLinearRing(
      viewport,
      0,
      viewport.length,
      2,
      this.getTileCoordExtent(tileCoord)
    );
  }

  /**
   * @param {!import("../extent.js").Extent} extent Extent for this tile grid.
   * @private
   */
  calculateTileRanges_(extent) {
    const length = this.resolutions_.length;
    const fullTileRanges = new Array(length);
    for (let z = this.minZoom; z < length; ++z) {
      fullTileRanges[z] = this.getTileRangeForExtentAndZ(extent, z);
    }
    this.fullTileRanges_ = fullTileRanges;
  }
}

var TileGrid$1 = TileGrid;

/**
 * @module ol/tilegrid
 */

/**
 * @param {import("./proj/Projection.js").default} projection Projection.
 * @return {!TileGrid} Default tile grid for the
 * passed projection.
 */
function getForProjection(projection) {
  let tileGrid = projection.getDefaultTileGrid();
  if (!tileGrid) {
    tileGrid = createForProjection(projection);
    projection.setDefaultTileGrid(tileGrid);
  }
  return tileGrid;
}

/**
 * @param {TileGrid} tileGrid Tile grid.
 * @param {import("./tilecoord.js").TileCoord} tileCoord Tile coordinate.
 * @param {import("./proj/Projection.js").default} projection Projection.
 * @return {import("./tilecoord.js").TileCoord} Tile coordinate.
 */
function wrapX(tileGrid, tileCoord, projection) {
  const z = tileCoord[0];
  const center = tileGrid.getTileCoordCenter(tileCoord);
  const projectionExtent = extentFromProjection(projection);
  if (!containsCoordinate(projectionExtent, center)) {
    const worldWidth = getWidth(projectionExtent);
    const worldsAway = Math.ceil(
      (projectionExtent[0] - center[0]) / worldWidth
    );
    center[0] += worldWidth * worldsAway;
    return tileGrid.getTileCoordForCoordAndZ(center, z);
  }
  return tileCoord;
}

/**
 * @param {import("./extent.js").Extent} extent Extent.
 * @param {number} [maxZoom] Maximum zoom level (default is
 *     DEFAULT_MAX_ZOOM).
 * @param {number|import("./size.js").Size} [tileSize] Tile size (default uses
 *     DEFAULT_TILE_SIZE).
 * @param {import("./extent.js").Corner} [corner] Extent corner (default is `'top-left'`).
 * @return {!TileGrid} TileGrid instance.
 */
function createForExtent(extent, maxZoom, tileSize, corner) {
  corner = corner !== undefined ? corner : 'top-left';

  const resolutions = resolutionsFromExtent(extent, maxZoom, tileSize);

  return new TileGrid$1({
    extent: extent,
    origin: getCorner(extent, corner),
    resolutions: resolutions,
    tileSize: tileSize,
  });
}

/**
 * @typedef {Object} XYZOptions
 * @property {import("./extent.js").Extent} [extent] Extent for the tile grid. The origin for an XYZ tile grid is the
 * top-left corner of the extent. If `maxResolution` is not provided the zero level of the grid is defined by the resolution
 * at which one tile fits in the provided extent. If not provided, the extent of the EPSG:3857 projection is used.
 * @property {number} [maxResolution] Resolution at level zero.
 * @property {number} [maxZoom] Maximum zoom. The default is `42`. This determines the number of levels
 * in the grid set. For example, a `maxZoom` of 21 means there are 22 levels in the grid set.
 * @property {number} [minZoom=0] Minimum zoom.
 * @property {number|import("./size.js").Size} [tileSize=[256, 256]] Tile size in pixels.
 */

/**
 * Creates a tile grid with a standard XYZ tiling scheme.
 * @param {XYZOptions} [options] Tile grid options.
 * @return {!TileGrid} Tile grid instance.
 * @api
 */
function createXYZ(options) {
  const xyzOptions = options || {};

  const extent = xyzOptions.extent || get('EPSG:3857').getExtent();

  const gridOptions = {
    extent: extent,
    minZoom: xyzOptions.minZoom,
    tileSize: xyzOptions.tileSize,
    resolutions: resolutionsFromExtent(
      extent,
      xyzOptions.maxZoom,
      xyzOptions.tileSize,
      xyzOptions.maxResolution
    ),
  };
  return new TileGrid$1(gridOptions);
}

/**
 * Create a resolutions array from an extent.  A zoom factor of 2 is assumed.
 * @param {import("./extent.js").Extent} extent Extent.
 * @param {number} [maxZoom] Maximum zoom level (default is
 *     DEFAULT_MAX_ZOOM).
 * @param {number|import("./size.js").Size} [tileSize] Tile size (default uses
 *     DEFAULT_TILE_SIZE).
 * @param {number} [maxResolution] Resolution at level zero.
 * @return {!Array<number>} Resolutions array.
 */
function resolutionsFromExtent(extent, maxZoom, tileSize, maxResolution) {
  maxZoom = maxZoom !== undefined ? maxZoom : DEFAULT_MAX_ZOOM;
  tileSize = toSize(tileSize !== undefined ? tileSize : DEFAULT_TILE_SIZE);

  const height = getHeight(extent);
  const width = getWidth(extent);

  maxResolution =
    maxResolution > 0
      ? maxResolution
      : Math.max(width / tileSize[0], height / tileSize[1]);

  const length = maxZoom + 1;
  const resolutions = new Array(length);
  for (let z = 0; z < length; ++z) {
    resolutions[z] = maxResolution / Math.pow(2, z);
  }
  return resolutions;
}

/**
 * @param {import("./proj.js").ProjectionLike} projection Projection.
 * @param {number} [maxZoom] Maximum zoom level (default is
 *     DEFAULT_MAX_ZOOM).
 * @param {number|import("./size.js").Size} [tileSize] Tile size (default uses
 *     DEFAULT_TILE_SIZE).
 * @param {import("./extent.js").Corner} [corner] Extent corner (default is `'top-left'`).
 * @return {!TileGrid} TileGrid instance.
 */
function createForProjection(projection, maxZoom, tileSize, corner) {
  const extent = extentFromProjection(projection);
  return createForExtent(extent, maxZoom, tileSize, corner);
}

/**
 * Generate a tile grid extent from a projection.  If the projection has an
 * extent, it is used.  If not, a global extent is assumed.
 * @param {import("./proj.js").ProjectionLike} projection Projection.
 * @return {import("./extent.js").Extent} Extent.
 */
function extentFromProjection(projection) {
  projection = get(projection);
  let extent = projection.getExtent();
  if (!extent) {
    const half =
      (180 * METERS_PER_UNIT$1.degrees) / projection.getMetersPerUnit();
    extent = createOrUpdate$2(-half, -half, half, half);
  }
  return extent;
}

/**
 * @module ol/source/Tile
 */

/***
 * @template Return
 * @typedef {import("../Observable").OnSignature<import("../Observable").EventTypes, import("../events/Event.js").default, Return> &
 *   import("../Observable").OnSignature<import("../ObjectEventType").Types, import("../Object").ObjectEvent, Return> &
 *   import("../Observable").OnSignature<import("./TileEventType").TileSourceEventTypes, TileSourceEvent, Return> &
 *   import("../Observable").CombinedOnSignature<import("../Observable").EventTypes|import("../ObjectEventType").Types|
 *     import("./TileEventType").TileSourceEventTypes, Return>} TileSourceOnSignature
 */

/**
 * @typedef {Object} Options
 * @property {import("./Source.js").AttributionLike} [attributions] Attributions.
 * @property {boolean} [attributionsCollapsible=true] Attributions are collapsible.
 * @property {number} [cacheSize] CacheSize.
 * @property {boolean} [opaque=false] Whether the layer is opaque.
 * @property {number} [tilePixelRatio] TilePixelRatio.
 * @property {import("../proj.js").ProjectionLike} [projection] Projection.
 * @property {import("./Source.js").State} [state] State.
 * @property {import("../tilegrid/TileGrid.js").default} [tileGrid] TileGrid.
 * @property {boolean} [wrapX=false] WrapX.
 * @property {number} [transition] Transition.
 * @property {string} [key] Key.
 * @property {number|import("../array.js").NearestDirectionFunction} [zDirection=0] ZDirection.
 * @property {boolean} [interpolate=false] Use interpolated values when resampling.  By default,
 * the nearest neighbor is used when resampling.
 */

/**
 * @classdesc
 * Abstract base class; normally only used for creating subclasses and not
 * instantiated in apps.
 * Base class for sources providing images divided into a tile grid.
 * @abstract
 * @api
 */
class TileSource extends Source$1 {
  /**
   * @param {Options} options SourceTile source options.
   */
  constructor(options) {
    super({
      attributions: options.attributions,
      attributionsCollapsible: options.attributionsCollapsible,
      projection: options.projection,
      state: options.state,
      wrapX: options.wrapX,
      interpolate: options.interpolate,
    });

    /***
     * @type {TileSourceOnSignature<import("../events").EventsKey>}
     */
    this.on;

    /***
     * @type {TileSourceOnSignature<import("../events").EventsKey>}
     */
    this.once;

    /***
     * @type {TileSourceOnSignature<void>}
     */
    this.un;

    /**
     * @private
     * @type {boolean}
     */
    this.opaque_ = options.opaque !== undefined ? options.opaque : false;

    /**
     * @private
     * @type {number}
     */
    this.tilePixelRatio_ =
      options.tilePixelRatio !== undefined ? options.tilePixelRatio : 1;

    /**
     * @type {import("../tilegrid/TileGrid.js").default|null}
     */
    this.tileGrid = options.tileGrid !== undefined ? options.tileGrid : null;

    const tileSize = [256, 256];
    if (this.tileGrid) {
      toSize(this.tileGrid.getTileSize(this.tileGrid.getMinZoom()), tileSize);
    }

    /**
     * @protected
     * @type {import("../TileCache.js").default}
     */
    this.tileCache = new TileCache$1(options.cacheSize || 0);

    /**
     * @protected
     * @type {import("../size.js").Size}
     */
    this.tmpSize = [0, 0];

    /**
     * @private
     * @type {string}
     */
    this.key_ = options.key || '';

    /**
     * @protected
     * @type {import("../Tile.js").Options}
     */
    this.tileOptions = {
      transition: options.transition,
      interpolate: options.interpolate,
    };

    /**
     * zDirection hint, read by the renderer. Indicates which resolution should be used
     * by a renderer if the views resolution does not match any resolution of the tile source.
     * If 0, the nearest resolution will be used. If 1, the nearest lower resolution
     * will be used. If -1, the nearest higher resolution will be used.
     * @type {number|import("../array.js").NearestDirectionFunction}
     */
    this.zDirection = options.zDirection ? options.zDirection : 0;
  }

  /**
   * @return {boolean} Can expire cache.
   */
  canExpireCache() {
    return this.tileCache.canExpireCache();
  }

  /**
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @param {!Object<string, boolean>} usedTiles Used tiles.
   */
  expireCache(projection, usedTiles) {
    const tileCache = this.getTileCacheForProjection(projection);
    if (tileCache) {
      tileCache.expireCache(usedTiles);
    }
  }

  /**
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @param {number} z Zoom level.
   * @param {import("../TileRange.js").default} tileRange Tile range.
   * @param {function(import("../Tile.js").default):(boolean|void)} callback Called with each
   *     loaded tile.  If the callback returns `false`, the tile will not be
   *     considered loaded.
   * @return {boolean} The tile range is fully covered with loaded tiles.
   */
  forEachLoadedTile(projection, z, tileRange, callback) {
    const tileCache = this.getTileCacheForProjection(projection);
    if (!tileCache) {
      return false;
    }

    let covered = true;
    let tile, tileCoordKey, loaded;
    for (let x = tileRange.minX; x <= tileRange.maxX; ++x) {
      for (let y = tileRange.minY; y <= tileRange.maxY; ++y) {
        tileCoordKey = getKeyZXY(z, x, y);
        loaded = false;
        if (tileCache.containsKey(tileCoordKey)) {
          tile = /** @type {!import("../Tile.js").default} */ (
            tileCache.get(tileCoordKey)
          );
          loaded = tile.getState() === TileState.LOADED;
          if (loaded) {
            loaded = callback(tile) !== false;
          }
        }
        if (!loaded) {
          covered = false;
        }
      }
    }
    return covered;
  }

  /**
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @return {number} Gutter.
   */
  getGutterForProjection(projection) {
    return 0;
  }

  /**
   * Return the key to be used for all tiles in the source.
   * @return {string} The key for all tiles.
   */
  getKey() {
    return this.key_;
  }

  /**
   * Set the value to be used as the key for all tiles in the source.
   * @param {string} key The key for tiles.
   * @protected
   */
  setKey(key) {
    if (this.key_ !== key) {
      this.key_ = key;
      this.changed();
    }
  }

  /**
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @return {boolean} Opaque.
   */
  getOpaque(projection) {
    return this.opaque_;
  }

  /**
   * @param {import("../proj/Projection").default} [projection] Projection.
   * @return {Array<number>|null} Resolutions.
   */
  getResolutions(projection) {
    const tileGrid = projection
      ? this.getTileGridForProjection(projection)
      : this.tileGrid;
    if (!tileGrid) {
      return null;
    }
    return tileGrid.getResolutions();
  }

  /**
   * @abstract
   * @param {number} z Tile coordinate z.
   * @param {number} x Tile coordinate x.
   * @param {number} y Tile coordinate y.
   * @param {number} pixelRatio Pixel ratio.
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @return {!import("../Tile.js").default} Tile.
   */
  getTile(z, x, y, pixelRatio, projection) {
    return abstract();
  }

  /**
   * Return the tile grid of the tile source.
   * @return {import("../tilegrid/TileGrid.js").default|null} Tile grid.
   * @api
   */
  getTileGrid() {
    return this.tileGrid;
  }

  /**
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @return {!import("../tilegrid/TileGrid.js").default} Tile grid.
   */
  getTileGridForProjection(projection) {
    if (!this.tileGrid) {
      return getForProjection(projection);
    }
    return this.tileGrid;
  }

  /**
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @return {import("../TileCache.js").default} Tile cache.
   * @protected
   */
  getTileCacheForProjection(projection) {
    const sourceProjection = this.getProjection();
    assert(
      sourceProjection === null || equivalent(sourceProjection, projection),
      68 // A VectorTile source can only be rendered if it has a projection compatible with the view projection.
    );
    return this.tileCache;
  }

  /**
   * Get the tile pixel ratio for this source. Subclasses may override this
   * method, which is meant to return a supported pixel ratio that matches the
   * provided `pixelRatio` as close as possible.
   * @param {number} pixelRatio Pixel ratio.
   * @return {number} Tile pixel ratio.
   */
  getTilePixelRatio(pixelRatio) {
    return this.tilePixelRatio_;
  }

  /**
   * @param {number} z Z.
   * @param {number} pixelRatio Pixel ratio.
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @return {import("../size.js").Size} Tile size.
   */
  getTilePixelSize(z, pixelRatio, projection) {
    const tileGrid = this.getTileGridForProjection(projection);
    const tilePixelRatio = this.getTilePixelRatio(pixelRatio);
    const tileSize = toSize(tileGrid.getTileSize(z), this.tmpSize);
    if (tilePixelRatio == 1) {
      return tileSize;
    }
    return scale(tileSize, tilePixelRatio, this.tmpSize);
  }

  /**
   * Returns a tile coordinate wrapped around the x-axis. When the tile coordinate
   * is outside the resolution and extent range of the tile grid, `null` will be
   * returned.
   * @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @param {import("../proj/Projection.js").default} [projection] Projection.
   * @return {import("../tilecoord.js").TileCoord} Tile coordinate to be passed to the tileUrlFunction or
   *     null if no tile URL should be created for the passed `tileCoord`.
   */
  getTileCoordForTileUrlFunction(tileCoord, projection) {
    projection = projection !== undefined ? projection : this.getProjection();
    const tileGrid = this.getTileGridForProjection(projection);
    if (this.getWrapX() && projection.isGlobal()) {
      tileCoord = wrapX(tileGrid, tileCoord, projection);
    }
    return withinExtentAndZ(tileCoord, tileGrid) ? tileCoord : null;
  }

  /**
   * Remove all cached tiles from the source. The next render cycle will fetch new tiles.
   * @api
   */
  clear() {
    this.tileCache.clear();
  }

  refresh() {
    this.clear();
    super.refresh();
  }

  /**
   * Increases the cache size if needed
   * @param {number} tileCount Minimum number of tiles needed.
   * @param {import("../proj/Projection.js").default} projection Projection.
   */
  updateCacheSize(tileCount, projection) {
    const tileCache = this.getTileCacheForProjection(projection);
    if (tileCount > tileCache.highWaterMark) {
      tileCache.highWaterMark = tileCount;
    }
  }

  /**
   * Marks a tile coord as being used, without triggering a load.
   * @abstract
   * @param {number} z Tile coordinate z.
   * @param {number} x Tile coordinate x.
   * @param {number} y Tile coordinate y.
   * @param {import("../proj/Projection.js").default} projection Projection.
   */
  useTile(z, x, y, projection) {}
}

/**
 * @classdesc
 * Events emitted by {@link module:ol/source/Tile~TileSource} instances are instances of this
 * type.
 */
class TileSourceEvent extends Event {
  /**
   * @param {string} type Type.
   * @param {import("../Tile.js").default} tile The tile.
   */
  constructor(type, tile) {
    super(type);

    /**
     * The tile related to the event.
     * @type {import("../Tile.js").default}
     * @api
     */
    this.tile = tile;
  }
}

var TileSource$1 = TileSource;

/**
 * @module ol/tileurlfunction
 */

/**
 * @param {string} template Template.
 * @param {import("./tilegrid/TileGrid.js").default} tileGrid Tile grid.
 * @return {import("./Tile.js").UrlFunction} Tile URL function.
 */
function createFromTemplate(template, tileGrid) {
  const zRegEx = /\{z\}/g;
  const xRegEx = /\{x\}/g;
  const yRegEx = /\{y\}/g;
  const dashYRegEx = /\{-y\}/g;
  return (
    /**
     * @param {import("./tilecoord.js").TileCoord} tileCoord Tile Coordinate.
     * @param {number} pixelRatio Pixel ratio.
     * @param {import("./proj/Projection.js").default} projection Projection.
     * @return {string|undefined} Tile URL.
     */
    function (tileCoord, pixelRatio, projection) {
      if (!tileCoord) {
        return undefined;
      }
      return template
        .replace(zRegEx, tileCoord[0].toString())
        .replace(xRegEx, tileCoord[1].toString())
        .replace(yRegEx, tileCoord[2].toString())
        .replace(dashYRegEx, function () {
          const z = tileCoord[0];
          const range = tileGrid.getFullTileRange(z);
          assert(range, 55); // The {-y} placeholder requires a tile grid with extent
          const y = range.getHeight() - tileCoord[2] - 1;
          return y.toString();
        });
    }
  );
}

/**
 * @param {Array<string>} templates Templates.
 * @param {import("./tilegrid/TileGrid.js").default} tileGrid Tile grid.
 * @return {import("./Tile.js").UrlFunction} Tile URL function.
 */
function createFromTemplates(templates, tileGrid) {
  const len = templates.length;
  const tileUrlFunctions = new Array(len);
  for (let i = 0; i < len; ++i) {
    tileUrlFunctions[i] = createFromTemplate(templates[i], tileGrid);
  }
  return createFromTileUrlFunctions(tileUrlFunctions);
}

/**
 * @param {Array<import("./Tile.js").UrlFunction>} tileUrlFunctions Tile URL Functions.
 * @return {import("./Tile.js").UrlFunction} Tile URL function.
 */
function createFromTileUrlFunctions(tileUrlFunctions) {
  if (tileUrlFunctions.length === 1) {
    return tileUrlFunctions[0];
  }
  return (
    /**
     * @param {import("./tilecoord.js").TileCoord} tileCoord Tile Coordinate.
     * @param {number} pixelRatio Pixel ratio.
     * @param {import("./proj/Projection.js").default} projection Projection.
     * @return {string|undefined} Tile URL.
     */
    function (tileCoord, pixelRatio, projection) {
      if (!tileCoord) {
        return undefined;
      }
      const h = hash(tileCoord);
      const index = modulo(h, tileUrlFunctions.length);
      return tileUrlFunctions[index](tileCoord, pixelRatio, projection);
    }
  );
}

/**
 * @param {string} url URL.
 * @return {Array<string>} Array of urls.
 */
function expandUrl(url) {
  const urls = [];
  let match = /\{([a-z])-([a-z])\}/.exec(url);
  if (match) {
    // char range
    const startCharCode = match[1].charCodeAt(0);
    const stopCharCode = match[2].charCodeAt(0);
    let charCode;
    for (charCode = startCharCode; charCode <= stopCharCode; ++charCode) {
      urls.push(url.replace(match[0], String.fromCharCode(charCode)));
    }
    return urls;
  }
  match = /\{(\d+)-(\d+)\}/.exec(url);
  if (match) {
    // number range
    const stop = parseInt(match[2], 10);
    for (let i = parseInt(match[1], 10); i <= stop; i++) {
      urls.push(url.replace(match[0], i.toString()));
    }
    return urls;
  }
  urls.push(url);
  return urls;
}

/**
 * @module ol/source/UrlTile
 */

/**
 * @typedef {Object} Options
 * @property {import("./Source.js").AttributionLike} [attributions] Attributions.
 * @property {boolean} [attributionsCollapsible=true] Attributions are collapsible.
 * @property {number} [cacheSize] Cache size.
 * @property {boolean} [opaque=false] Whether the layer is opaque.
 * @property {import("../proj.js").ProjectionLike} [projection] Projection.
 * @property {import("./Source.js").State} [state] State.
 * @property {import("../tilegrid/TileGrid.js").default} [tileGrid] TileGrid.
 * @property {import("../Tile.js").LoadFunction} tileLoadFunction TileLoadFunction.
 * @property {number} [tilePixelRatio] TilePixelRatio.
 * @property {import("../Tile.js").UrlFunction} [tileUrlFunction] TileUrlFunction.
 * @property {string} [url] Url.
 * @property {Array<string>} [urls] Urls.
 * @property {boolean} [wrapX=true] WrapX.
 * @property {number} [transition] Transition.
 * @property {string} [key] Key.
 * @property {number|import("../array.js").NearestDirectionFunction} [zDirection=0] ZDirection.
 * @property {boolean} [interpolate=false] Use interpolated values when resampling.  By default,
 * the nearest neighbor is used when resampling.
 */

/**
 * @classdesc
 * Base class for sources providing tiles divided into a tile grid over http.
 *
 * @fires import("./Tile.js").TileSourceEvent
 */
class UrlTile extends TileSource$1 {
  /**
   * @param {Options} options Image tile options.
   */
  constructor(options) {
    super({
      attributions: options.attributions,
      cacheSize: options.cacheSize,
      opaque: options.opaque,
      projection: options.projection,
      state: options.state,
      tileGrid: options.tileGrid,
      tilePixelRatio: options.tilePixelRatio,
      wrapX: options.wrapX,
      transition: options.transition,
      interpolate: options.interpolate,
      key: options.key,
      attributionsCollapsible: options.attributionsCollapsible,
      zDirection: options.zDirection,
    });

    /**
     * @private
     * @type {boolean}
     */
    this.generateTileUrlFunction_ =
      this.tileUrlFunction === UrlTile.prototype.tileUrlFunction;

    /**
     * @protected
     * @type {import("../Tile.js").LoadFunction}
     */
    this.tileLoadFunction = options.tileLoadFunction;

    if (options.tileUrlFunction) {
      this.tileUrlFunction = options.tileUrlFunction;
    }

    /**
     * @protected
     * @type {!Array<string>|null}
     */
    this.urls = null;

    if (options.urls) {
      this.setUrls(options.urls);
    } else if (options.url) {
      this.setUrl(options.url);
    }

    /**
     * @private
     * @type {!Object<string, boolean>}
     */
    this.tileLoadingKeys_ = {};
  }

  /**
   * Return the tile load function of the source.
   * @return {import("../Tile.js").LoadFunction} TileLoadFunction
   * @api
   */
  getTileLoadFunction() {
    return this.tileLoadFunction;
  }

  /**
   * Return the tile URL function of the source.
   * @return {import("../Tile.js").UrlFunction} TileUrlFunction
   * @api
   */
  getTileUrlFunction() {
    return Object.getPrototypeOf(this).tileUrlFunction === this.tileUrlFunction
      ? this.tileUrlFunction.bind(this)
      : this.tileUrlFunction;
  }

  /**
   * Return the URLs used for this source.
   * When a tileUrlFunction is used instead of url or urls,
   * null will be returned.
   * @return {!Array<string>|null} URLs.
   * @api
   */
  getUrls() {
    return this.urls;
  }

  /**
   * Handle tile change events.
   * @param {import("../events/Event.js").default} event Event.
   * @protected
   */
  handleTileChange(event) {
    const tile = /** @type {import("../Tile.js").default} */ (event.target);
    const uid = getUid(tile);
    const tileState = tile.getState();
    let type;
    if (tileState == TileState.LOADING) {
      this.tileLoadingKeys_[uid] = true;
      type = TileEventType.TILELOADSTART;
    } else if (uid in this.tileLoadingKeys_) {
      delete this.tileLoadingKeys_[uid];
      type =
        tileState == TileState.ERROR
          ? TileEventType.TILELOADERROR
          : tileState == TileState.LOADED
          ? TileEventType.TILELOADEND
          : undefined;
    }
    if (type != undefined) {
      this.dispatchEvent(new TileSourceEvent(type, tile));
    }
  }

  /**
   * Set the tile load function of the source.
   * @param {import("../Tile.js").LoadFunction} tileLoadFunction Tile load function.
   * @api
   */
  setTileLoadFunction(tileLoadFunction) {
    this.tileCache.clear();
    this.tileLoadFunction = tileLoadFunction;
    this.changed();
  }

  /**
   * Set the tile URL function of the source.
   * @param {import("../Tile.js").UrlFunction} tileUrlFunction Tile URL function.
   * @param {string} [key] Optional new tile key for the source.
   * @api
   */
  setTileUrlFunction(tileUrlFunction, key) {
    this.tileUrlFunction = tileUrlFunction;
    this.tileCache.pruneExceptNewestZ();
    if (typeof key !== 'undefined') {
      this.setKey(key);
    } else {
      this.changed();
    }
  }

  /**
   * Set the URL to use for requests.
   * @param {string} url URL.
   * @api
   */
  setUrl(url) {
    const urls = expandUrl(url);
    this.urls = urls;
    this.setUrls(urls);
  }

  /**
   * Set the URLs to use for requests.
   * @param {Array<string>} urls URLs.
   * @api
   */
  setUrls(urls) {
    this.urls = urls;
    const key = urls.join('\n');
    if (this.generateTileUrlFunction_) {
      this.setTileUrlFunction(createFromTemplates(urls, this.tileGrid), key);
    } else {
      this.setKey(key);
    }
  }

  /**
   * @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @param {number} pixelRatio Pixel ratio.
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @return {string|undefined} Tile URL.
   */
  tileUrlFunction(tileCoord, pixelRatio, projection) {
    return undefined;
  }

  /**
   * Marks a tile coord as being used, without triggering a load.
   * @param {number} z Tile coordinate z.
   * @param {number} x Tile coordinate x.
   * @param {number} y Tile coordinate y.
   */
  useTile(z, x, y) {
    const tileCoordKey = getKeyZXY(z, x, y);
    if (this.tileCache.containsKey(tileCoordKey)) {
      this.tileCache.get(tileCoordKey);
    }
  }
}

var UrlTile$1 = UrlTile;

/**
 * @module ol/source/TileImage
 */

/**
 * @typedef {Object} Options
 * @property {import("./Source.js").AttributionLike} [attributions] Attributions.
 * @property {boolean} [attributionsCollapsible=true] Attributions are collapsible.
 * @property {number} [cacheSize] Initial tile cache size. Will auto-grow to hold at least the number of tiles in the viewport.
 * @property {null|string} [crossOrigin] The `crossOrigin` attribute for loaded images.  Note that
 * you must provide a `crossOrigin` value if you want to access pixel data with the Canvas renderer.
 * See https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image for more detail.
 * @property {boolean} [interpolate=true] Use interpolated values when resampling.  By default,
 * linear interpolation is used when resampling.  Set to false to use the nearest neighbor instead.
 * @property {boolean} [opaque=false] Whether the layer is opaque.
 * @property {import("../proj.js").ProjectionLike} [projection] Projection. Default is the view projection.
 * @property {number} [reprojectionErrorThreshold=0.5] Maximum allowed reprojection error (in pixels).
 * Higher values can increase reprojection performance, but decrease precision.
 * @property {import("./Source.js").State} [state] Source state.
 * @property {typeof import("../ImageTile.js").default} [tileClass] Class used to instantiate image tiles.
 * Default is {@link module:ol/ImageTile~ImageTile}.
 * @property {import("../tilegrid/TileGrid.js").default} [tileGrid] Tile grid.
 * @property {import("../Tile.js").LoadFunction} [tileLoadFunction] Optional function to load a tile given a URL. The default is
 * ```js
 * function(imageTile, src) {
 *   imageTile.getImage().src = src;
 * };
 * ```
 * @property {number} [tilePixelRatio=1] The pixel ratio used by the tile service. For example, if the tile
 * service advertizes 256px by 256px tiles but actually sends 512px
 * by 512px images (for retina/hidpi devices) then `tilePixelRatio`
 * should be set to `2`.
 * @property {import("../Tile.js").UrlFunction} [tileUrlFunction] Optional function to get tile URL given a tile coordinate and the projection.
 * @property {string} [url] URL template. Must include `{x}`, `{y}` or `{-y}`, and `{z}` placeholders.
 * A `{?-?}` template pattern, for example `subdomain{a-f}.domain.com`, may be
 * used instead of defining each one separately in the `urls` option.
 * @property {Array<string>} [urls] An array of URL templates.
 * @property {boolean} [wrapX] Whether to wrap the world horizontally. The default, is to
 * request out-of-bounds tiles from the server. When set to `false`, only one
 * world will be rendered. When set to `true`, tiles will be requested for one
 * world only, but they will be wrapped horizontally to render multiple worlds.
 * @property {number} [transition] Duration of the opacity transition for rendering.
 * To disable the opacity transition, pass `transition: 0`.
 * @property {string} [key] Optional tile key for proper cache fetching
 * @property {number|import("../array.js").NearestDirectionFunction} [zDirection=0]
 * Choose whether to use tiles with a higher or lower zoom level when between integer
 * zoom levels. See {@link module:ol/tilegrid/TileGrid~TileGrid#getZForResolution}.
 */

/**
 * @classdesc
 * Base class for sources providing images divided into a tile grid.
 *
 * @fires import("./Tile.js").TileSourceEvent
 * @api
 */
class TileImage extends UrlTile$1 {
  /**
   * @param {!Options} options Image tile options.
   */
  constructor(options) {
    super({
      attributions: options.attributions,
      cacheSize: options.cacheSize,
      opaque: options.opaque,
      projection: options.projection,
      state: options.state,
      tileGrid: options.tileGrid,
      tileLoadFunction: options.tileLoadFunction
        ? options.tileLoadFunction
        : defaultTileLoadFunction,
      tilePixelRatio: options.tilePixelRatio,
      tileUrlFunction: options.tileUrlFunction,
      url: options.url,
      urls: options.urls,
      wrapX: options.wrapX,
      transition: options.transition,
      interpolate:
        options.interpolate !== undefined ? options.interpolate : true,
      key: options.key,
      attributionsCollapsible: options.attributionsCollapsible,
      zDirection: options.zDirection,
    });

    /**
     * @protected
     * @type {?string}
     */
    this.crossOrigin =
      options.crossOrigin !== undefined ? options.crossOrigin : null;

    /**
     * @protected
     * @type {typeof ImageTile}
     */
    this.tileClass =
      options.tileClass !== undefined ? options.tileClass : ImageTile$1;

    /**
     * @protected
     * @type {!Object<string, TileCache>}
     */
    this.tileCacheForProjection = {};

    /**
     * @protected
     * @type {!Object<string, import("../tilegrid/TileGrid.js").default>}
     */
    this.tileGridForProjection = {};

    /**
     * @private
     * @type {number|undefined}
     */
    this.reprojectionErrorThreshold_ = options.reprojectionErrorThreshold;

    /**
     * @private
     * @type {boolean}
     */
    this.renderReprojectionEdges_ = false;
  }

  /**
   * @return {boolean} Can expire cache.
   */
  canExpireCache() {
    if (this.tileCache.canExpireCache()) {
      return true;
    }
    for (const key in this.tileCacheForProjection) {
      if (this.tileCacheForProjection[key].canExpireCache()) {
        return true;
      }
    }

    return false;
  }

  /**
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @param {!Object<string, boolean>} usedTiles Used tiles.
   */
  expireCache(projection, usedTiles) {
    const usedTileCache = this.getTileCacheForProjection(projection);

    this.tileCache.expireCache(
      this.tileCache == usedTileCache ? usedTiles : {}
    );
    for (const id in this.tileCacheForProjection) {
      const tileCache = this.tileCacheForProjection[id];
      tileCache.expireCache(tileCache == usedTileCache ? usedTiles : {});
    }
  }

  /**
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @return {number} Gutter.
   */
  getGutterForProjection(projection) {
    if (
      this.getProjection() &&
      projection &&
      !equivalent(this.getProjection(), projection)
    ) {
      return 0;
    }
    return this.getGutter();
  }

  /**
   * @return {number} Gutter.
   */
  getGutter() {
    return 0;
  }

  /**
   * Return the key to be used for all tiles in the source.
   * @return {string} The key for all tiles.
   */
  getKey() {
    let key = super.getKey();
    if (!this.getInterpolate()) {
      key += ':disable-interpolation';
    }
    return key;
  }

  /**
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @return {boolean} Opaque.
   */
  getOpaque(projection) {
    if (
      this.getProjection() &&
      projection &&
      !equivalent(this.getProjection(), projection)
    ) {
      return false;
    }
    return super.getOpaque(projection);
  }

  /**
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @return {!import("../tilegrid/TileGrid.js").default} Tile grid.
   */
  getTileGridForProjection(projection) {
    const thisProj = this.getProjection();
    if (this.tileGrid && (!thisProj || equivalent(thisProj, projection))) {
      return this.tileGrid;
    }
    const projKey = getUid(projection);
    if (!(projKey in this.tileGridForProjection)) {
      this.tileGridForProjection[projKey] =
        getForProjection(projection);
    }
    return this.tileGridForProjection[projKey];
  }

  /**
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @return {import("../TileCache.js").default} Tile cache.
   */
  getTileCacheForProjection(projection) {
    const thisProj = this.getProjection();
    if (!thisProj || equivalent(thisProj, projection)) {
      return this.tileCache;
    }
    const projKey = getUid(projection);
    if (!(projKey in this.tileCacheForProjection)) {
      this.tileCacheForProjection[projKey] = new TileCache$1(
        this.tileCache.highWaterMark
      );
    }
    return this.tileCacheForProjection[projKey];
  }

  /**
   * @param {number} z Tile coordinate z.
   * @param {number} x Tile coordinate x.
   * @param {number} y Tile coordinate y.
   * @param {number} pixelRatio Pixel ratio.
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @param {string} key The key set on the tile.
   * @return {!ImageTile} Tile.
   * @private
   */
  createTile_(z, x, y, pixelRatio, projection, key) {
    const tileCoord = [z, x, y];
    const urlTileCoord = this.getTileCoordForTileUrlFunction(
      tileCoord,
      projection
    );
    const tileUrl = urlTileCoord
      ? this.tileUrlFunction(urlTileCoord, pixelRatio, projection)
      : undefined;
    const tile = new this.tileClass(
      tileCoord,
      tileUrl !== undefined ? TileState.IDLE : TileState.EMPTY,
      tileUrl !== undefined ? tileUrl : '',
      this.crossOrigin,
      this.tileLoadFunction,
      this.tileOptions
    );
    tile.key = key;
    tile.addEventListener(EventType.CHANGE, this.handleTileChange.bind(this));
    return tile;
  }

  /**
   * @param {number} z Tile coordinate z.
   * @param {number} x Tile coordinate x.
   * @param {number} y Tile coordinate y.
   * @param {number} pixelRatio Pixel ratio.
   * @param {import("../proj/Projection.js").default} projection Projection.
   * @return {!(ImageTile|ReprojTile)} Tile.
   */
  getTile(z, x, y, pixelRatio, projection) {
    const sourceProjection = this.getProjection();
    if (
      !sourceProjection ||
      !projection ||
      equivalent(sourceProjection, projection)
    ) {
      return this.getTileInternal(
        z,
        x,
        y,
        pixelRatio,
        sourceProjection || projection
      );
    }
    const cache = this.getTileCacheForProjection(projection);
    const tileCoord = [z, x, y];
    let tile;
    const tileCoordKey = getKey(tileCoord);
    if (cache.containsKey(tileCoordKey)) {
      tile = cache.get(tileCoordKey);
    }
    const key = this.getKey();
    if (tile && tile.key == key) {
      return tile;
    }
    const sourceTileGrid = this.getTileGridForProjection(sourceProjection);
    const targetTileGrid = this.getTileGridForProjection(projection);
    const wrappedTileCoord = this.getTileCoordForTileUrlFunction(
      tileCoord,
      projection
    );
    const newTile = new ReprojTile$1(
      sourceProjection,
      sourceTileGrid,
      projection,
      targetTileGrid,
      tileCoord,
      wrappedTileCoord,
      this.getTilePixelRatio(pixelRatio),
      this.getGutter(),
      (z, x, y, pixelRatio) =>
        this.getTileInternal(z, x, y, pixelRatio, sourceProjection),
      this.reprojectionErrorThreshold_,
      this.renderReprojectionEdges_,
      this.getInterpolate()
    );
    newTile.key = key;

    if (tile) {
      newTile.interimTile = tile;
      newTile.refreshInterimChain();
      cache.replace(tileCoordKey, newTile);
    } else {
      cache.set(tileCoordKey, newTile);
    }
    return newTile;
  }

  /**
   * @param {number} z Tile coordinate z.
   * @param {number} x Tile coordinate x.
   * @param {number} y Tile coordinate y.
   * @param {number} pixelRatio Pixel ratio.
   * @param {!import("../proj/Projection.js").default} projection Projection.
   * @return {!ImageTile} Tile.
   * @protected
   */
  getTileInternal(z, x, y, pixelRatio, projection) {
    let tile = null;
    const tileCoordKey = getKeyZXY(z, x, y);
    const key = this.getKey();
    if (!this.tileCache.containsKey(tileCoordKey)) {
      tile = this.createTile_(z, x, y, pixelRatio, projection, key);
      this.tileCache.set(tileCoordKey, tile);
    } else {
      tile = this.tileCache.get(tileCoordKey);
      if (tile.key != key) {
        // The source's params changed. If the tile has an interim tile and if we
        // can use it then we use it. Otherwise we create a new tile.  In both
        // cases we attempt to assign an interim tile to the new tile.
        const interimTile = tile;
        tile = this.createTile_(z, x, y, pixelRatio, projection, key);

        //make the new tile the head of the list,
        if (interimTile.getState() == TileState.IDLE) {
          //the old tile hasn't begun loading yet, and is now outdated, so we can simply discard it
          tile.interimTile = interimTile.interimTile;
        } else {
          tile.interimTile = interimTile;
        }
        tile.refreshInterimChain();
        this.tileCache.replace(tileCoordKey, tile);
      }
    }
    return tile;
  }

  /**
   * Sets whether to render reprojection edges or not (usually for debugging).
   * @param {boolean} render Render the edges.
   * @api
   */
  setRenderReprojectionEdges(render) {
    if (this.renderReprojectionEdges_ == render) {
      return;
    }
    this.renderReprojectionEdges_ = render;
    for (const id in this.tileCacheForProjection) {
      this.tileCacheForProjection[id].clear();
    }
    this.changed();
  }

  /**
   * Sets the tile grid to use when reprojecting the tiles to the given
   * projection instead of the default tile grid for the projection.
   *
   * This can be useful when the default tile grid cannot be created
   * (e.g. projection has no extent defined) or
   * for optimization reasons (custom tile size, resolutions, ...).
   *
   * @param {import("../proj.js").ProjectionLike} projection Projection.
   * @param {import("../tilegrid/TileGrid.js").default} tilegrid Tile grid to use for the projection.
   * @api
   */
  setTileGridForProjection(projection, tilegrid) {
    const proj = get(projection);
    if (proj) {
      const projKey = getUid(proj);
      if (!(projKey in this.tileGridForProjection)) {
        this.tileGridForProjection[projKey] = tilegrid;
      }
    }
  }

  clear() {
    super.clear();
    for (const id in this.tileCacheForProjection) {
      this.tileCacheForProjection[id].clear();
    }
  }
}

/**
 * @param {ImageTile} imageTile Image tile.
 * @param {string} src Source.
 */
function defaultTileLoadFunction(imageTile, src) {
  /** @type {HTMLImageElement|HTMLVideoElement} */ (imageTile.getImage()).src =
    src;
}

var TileImage$1 = TileImage;

/**
 * @module ol/source/XYZ
 */

/**
 * @typedef {Object} Options
 * @property {import("./Source.js").AttributionLike} [attributions] Attributions.
 * @property {boolean} [attributionsCollapsible=true] Attributions are collapsible.
 * @property {number} [cacheSize] Initial tile cache size. Will auto-grow to hold at least the number of tiles in the viewport.
 * @property {null|string} [crossOrigin] The `crossOrigin` attribute for loaded images.  Note that
 * you must provide a `crossOrigin` value if you want to access pixel data with the Canvas renderer.
 * See https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image for more detail.
 * @property {boolean} [interpolate=true] Use interpolated values when resampling.  By default,
 * linear interpolation is used when resampling.  Set to false to use the nearest neighbor instead.
 * @property {boolean} [opaque=false] Whether the layer is opaque.
 * @property {import("../proj.js").ProjectionLike} [projection='EPSG:3857'] Projection.
 * @property {number} [reprojectionErrorThreshold=0.5] Maximum allowed reprojection error (in pixels).
 * Higher values can increase reprojection performance, but decrease precision.
 * @property {number} [maxZoom=42] Optional max zoom level. Not used if `tileGrid` is provided.
 * @property {number} [minZoom=0] Optional min zoom level. Not used if `tileGrid` is provided.
 * @property {number} [maxResolution] Optional tile grid resolution at level zero. Not used if `tileGrid` is provided.
 * @property {import("../tilegrid/TileGrid.js").default} [tileGrid] Tile grid.
 * @property {import("../Tile.js").LoadFunction} [tileLoadFunction] Optional function to load a tile given a URL. The default is
 * ```js
 * function(imageTile, src) {
 *   imageTile.getImage().src = src;
 * };
 * ```
 * @property {number} [tilePixelRatio=1] The pixel ratio used by the tile service.
 * For example, if the tile service advertizes 256px by 256px tiles but actually sends 512px
 * by 512px images (for retina/hidpi devices) then `tilePixelRatio`
 * should be set to `2`.
 * @property {number|import("../size.js").Size} [tileSize=[256, 256]] The tile size used by the tile service.
 * Not used if `tileGrid` is provided.
 * @property {number} [gutter=0] The size in pixels of the gutter around image tiles to ignore.
 * This allows artifacts of rendering at tile edges to be ignored.
 * Supported images should be wider and taller than the tile size by a value of `2 x gutter`.
 * @property {import("../Tile.js").UrlFunction} [tileUrlFunction] Optional function to get
 * tile URL given a tile coordinate and the projection.
 * Required if `url` or `urls` are not provided.
 * @property {string} [url] URL template. Must include `{x}`, `{y}` or `{-y}`,
 * and `{z}` placeholders. A `{?-?}` template pattern, for example `subdomain{a-f}.domain.com`,
 * may be used instead of defining each one separately in the `urls` option.
 * @property {Array<string>} [urls] An array of URL templates.
 * @property {boolean} [wrapX=true] Whether to wrap the world horizontally.
 * @property {number} [transition=250] Duration of the opacity transition for rendering.
 * To disable the opacity transition, pass `transition: 0`.
 * @property {number|import("../array.js").NearestDirectionFunction} [zDirection=0]
 * Choose whether to use tiles with a higher or lower zoom level when between integer
 * zoom levels. See {@link module:ol/tilegrid/TileGrid~TileGrid#getZForResolution}.
 */

/**
 * @classdesc
 * Layer source for tile data with URLs in a set XYZ format that are
 * defined in a URL template. By default, this follows the widely-used
 * Google grid where `x` 0 and `y` 0 are in the top left. Grids like
 * TMS where `x` 0 and `y` 0 are in the bottom left can be used by
 * using the `{-y}` placeholder in the URL template, so long as the
 * source does not have a custom tile grid. In this case
 * a `tileUrlFunction` can be used, such as:
 * ```js
 *  tileUrlFunction: function(coordinate) {
 *    return 'http://mapserver.com/' + coordinate[0] + '/' +
 *      coordinate[1] + '/' + (-coordinate[2] - 1) + '.png';
 *  }
 * ```
 * @api
 */
class XYZ extends TileImage$1 {
  /**
   * @param {Options} [options] XYZ options.
   */
  constructor(options) {
    options = options || {};

    const projection =
      options.projection !== undefined ? options.projection : 'EPSG:3857';

    const tileGrid =
      options.tileGrid !== undefined
        ? options.tileGrid
        : createXYZ({
            extent: extentFromProjection(projection),
            maxResolution: options.maxResolution,
            maxZoom: options.maxZoom,
            minZoom: options.minZoom,
            tileSize: options.tileSize,
          });

    super({
      attributions: options.attributions,
      cacheSize: options.cacheSize,
      crossOrigin: options.crossOrigin,
      interpolate: options.interpolate,
      opaque: options.opaque,
      projection: projection,
      reprojectionErrorThreshold: options.reprojectionErrorThreshold,
      tileGrid: tileGrid,
      tileLoadFunction: options.tileLoadFunction,
      tilePixelRatio: options.tilePixelRatio,
      tileUrlFunction: options.tileUrlFunction,
      url: options.url,
      urls: options.urls,
      wrapX: options.wrapX !== undefined ? options.wrapX : true,
      transition: options.transition,
      attributionsCollapsible: options.attributionsCollapsible,
      zDirection: options.zDirection,
    });

    /**
     * @private
     * @type {number}
     */
    this.gutter_ = options.gutter !== undefined ? options.gutter : 0;
  }

  /**
   * @return {number} Gutter.
   */
  getGutter() {
    return this.gutter_;
  }
}

var XYZ$1 = XYZ;

const options = {
  runSelector: "1", //hex string
  basemap: LayerType.Road,
  outputFormat: 0,
  rasterType: RasterType.PNG,
  streetViewOverlay: false,
  svLayers: new Message(1, [
    new Message(1, [
      new Field(1, "e", 2),
      new Field(2, "b", 1),
      new Field(3, "e", 2),
    ]),
    new Field(2, "b", 1),
    new Field(4, "b", 1),
  ]),
  showPhotoPaths: 0,
  thinLines: 1,
  _showOfficial: true,
  _showAri: false,
  terrainOverlay: false,
  trafficOverlay: false,
  language: "en",
  regionCode: "us",
  noLabels: false,
  satOverlay: false,
  highDpi: false,
  labelsAndIconsOnly: false,
  mapStyle: null,
};

// TODO maybe use dict style instead of this
function createUrl(options) {
  const endpoint = "https://www.google.com/maps/vt?pb=";

  const layers = [];
  const toggles = [];

  if (options.basemap !== LayerType.None) {
    layers.push(new Layer$2(options.basemap, "m"));
  }
  if (options.streetViewOverlay) {
    const svOverlayLayer = new Layer$2(LayerType.Overlay, "svv", [
      new Message(4, [
        new Field(1, "s", "cc"),
        new Field(2, "s", options.svLayers.toString(true).replaceAll("!", "*21")),
      ]),
      new Message(4, [
        new Field(1, "s", "svl"),
        new Field(2, "s", `*211b${options.showPhotoPaths}*212b${options.thinLines}`),
      ]),
    ]);
    layers.push(svOverlayLayer);
    if (options.basemap !== LayerType.Road) {
      toggles.push(new Toggle(ToggleType.SomeSortOfOverlayThing));
    }
  }
  if (options.terrainOverlay) {
      layers.push(new Layer$2(LayerType.TerrainAll));
      toggles.push(new Toggle(ToggleType.Terrain));
  }
  
  if (options.trafficOverlay) {
    layers.push(new Layer$2(LayerType.Overlay, "traffic", [
      new Message(4, [
        new Field(1, "s", "incidents"),
        new Field(2, "s", "1"),
      ]),
      new Message(4, [
        new Field(1, "s", "incidents_text"),
        new Field(2, "s", "1"),
      ]),
    ]));
  }

  if (options.noLabels) {
    toggles.push(new Toggle(ToggleType.NoLabels));
  }
  if (options.satOverlay) {
    toggles.push(new Toggle(ToggleType.SatelliteOverlay));
  }
  if (options.highDpi) {
    toggles.push(new Toggle(ToggleType.HighDpi));
  }
  if (options.labelsAndIconsOnly) {
    toggles.push(new Toggle(ToggleType.LabelsAndIconsOnly));
  }

  if (options.mapStyle) {
   toggles.push(new Toggle(ToggleType.MapStyle, [
     new Message(2, [
       new Field(1, "s", "styles"),
       new Field(2, "z", options.mapStyle.trim()),
     ])
   ]));
 }

  const message = buildMessage(options, layers, toggles);
  return endpoint + message.toString(true);
}


function buildMessage(options, layers, toggles) {
  return new Message(1, [
    new Message(1, [
      new Message(8, [
        new Message(1, [
          new Field(1, "i", "{z}"),
          new Field(2, "i", "{x}"),
          new Field(3, "i", "{y}"),
        ]),
        new Field(2, "i", 9), // these two are only used for the stream endpoint; ignore this
        new Field(3, "x", options.runSelector),
      ])
    ]),

    ...layers.map(x => x.toMessage()),

    new Message(3, [
      new Field(2, "s", options.language),
      new Field(3, "s", options.regionCode),
      new Field(5, "e", 1105),

      ...toggles.map(x => x.toMessage()),
    ]),

    new Field(4, "e", options.outputFormat),

    new Message(5, [
      new Field(1, "e", options.rasterType),
      new Message(8, [
        new Field(1, "e", 1),
        new Field(1, "e", 1)
      ]),
      new Field(8, "i", 47083502)
    ]),

    new Message(6, [
      new Field(1, "e", 12),
      new Field(2, "i", 2),
      new Field(11, "e", 0),
      new Field(39, "b", false),
      new Field(44, "e", 0),
      new Field(50, "e", 0),
    ]),
  ]);
}

function refreshUrl() {
  const url = createUrl(options);
  svTileLayer.getSource().setUrl(url);
  document.querySelector("#url").innerText = url;
}

function rebuildSvLayers() {
  const svLayers = new Message(1, [
    new Field(2, "b", 1),
    new Field(4, "b", 1),
  ]);

  if (options.thinLines) {
    if (options._showOfficial) {
      svLayers.fields.push(new Message(1, [
        new Field(1, "e", 2),
        new Field(2, "b", 1),
        new Field(3, "e", 2),
      ]));
    }
    if (options._showAri) {
      svLayers.fields.push(new Message(1, [
        new Field(1, "e", 3),
        new Field(2, "b", 1),
        new Field(3, "e", 2),
      ]));
    }
  } else {
    if (options._showAri) {
      svLayers.fields.push(new Message(1, [
        new Field(1, "e", 3),
        new Field(2, "b", 1),
        new Field(3, "e", 2),
      ]));
    } 
  }
  
  options.svLayers = svLayers;
}


const svTileLayer = new TileLayer$1({
  source: new XYZ$1({
    url: "", // set below
  }),
});
refreshUrl();

new Map$1({
  target: 'map',
  layers: [ svTileLayer ],
  view: new View$1({
    center: [0, 0],
    zoom: 2,
    constrainResolution: true,
  }),
});


createRadioSelector("raster-type-container", "raster-type",
  [
    { value: RasterType.PNG, description: "PNG", checked: true }, 
    { value: RasterType.JPG, description: "JPG" }, 
    { value: RasterType.GIF, description: "GIF" }, 
    { value: RasterType.WEBP, description: "WEBP" },
    { value: RasterType.DDS, description: "DDS" }, 

  ], 
  (selected) => { 
    options.rasterType = selected;
    refreshUrl();
  },
  false
);

createRadioSelector("base-layer-container", "base-layer",
  [
    { value: LayerType.None, description: "None" }, 
    { value: LayerType.Road, description: "Road", checked: true }, 
    { value: LayerType.Satellite, description: "Satellite" },
  ], 
  (selected) => { 
    options.basemap = selected;
    refreshUrl();
  },
  false
);

createCheckBox("overlays-container", "streetview", "Street View", options.streetViewOverlay,
  (checked) => {
    options.streetViewOverlay = +checked;
    rebuildSvLayers();
    refreshUrl();
  }
);
createCheckBox("overlays-container", "terrain", "Terrain", options.terrainOverlay,
  (checked) => {
    options.terrainOverlay = +checked;
    refreshUrl();
  }
);
createCheckBox("overlays-container", "traffic", "Live traffic", options.trafficOverlay,
  (checked) => {
    options.trafficOverlay = +checked;
    refreshUrl();
  }
);

createCheckBox("toggles-container", "high-dpi", "2x scale (High DPI)", options.highDpi,
  (checked) => {
    options.highDpi = +checked;
    refreshUrl();
  }
);
createCheckBox("toggles-container", "no-labels", "No labels", options.noLabels,
  (checked) => {
    options.noLabels = +checked;
    refreshUrl();
  }
);
createCheckBox("toggles-container", "sat-overlay", "Hybrid overlay", options.satOverlay,
  (checked) => {
    options.satOverlay = +checked;
    refreshUrl();
  }
);
createCheckBox("toggles-container", "labels-and-icons-only", "Labels and icons only", options.labelsAndIconsOnly,
  (checked) => {
    options.labelsAndIconsOnly = +checked;
    refreshUrl();
  }
);

createCheckBox("streetview-container", "thin-lines", "Thin lines", true, 
  (checked) => {
    options.thinLines = +checked;
    rebuildSvLayers();
    refreshUrl();
  }
);
createCheckBox("streetview-container", "official", 'Show official coverage ("outdoor" only for thick lines)', true, 
  (checked) => {
    options._showOfficial = checked;
    rebuildSvLayers();
    refreshUrl();
  }
);
createCheckBox("streetview-container", "ari", "Show third party coverage", false, 
  (checked) => {
    options._showAri = checked;
    rebuildSvLayers();
    refreshUrl();
  }
);
createCheckBox("streetview-container", "photo-paths", "Show photo paths (thin lines only)", false, 
  (checked) => {
    options.showPhotoPaths = +checked;
    refreshUrl();
  }
);

document.querySelector("#map-style").addEventListener("change", (e) => {
  options.mapStyle = e.target.value;
  refreshUrl();
});
