
!(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'js-cookie'], function($, jsCookie) {
      return factory(root, $);
    });
  } else if (typeof exports === 'object') {
    factory(root, require('jquery'), require('js-cookie'));
  } else {
    factory(root, root.jQuery || root.Zepto);
  }
})(this, function(global, $) {
	
  /**
   * Debugging mode
   * @private
   * @const
   * @type {String}
   */
  var DEBUG = false;	
  //global.AUTOMODAL_GLOBALS = {'NAMESPACE':'autosupermodal'};

  /**
   * Name of the plugin
   * @private
   * @const
   * @type {String}
   */
  var PLUGIN_NAME = 'automodal';
  
  
  /**
   * Namespace for CSS and events
   * @private
   * @const
   * @type {String}
   */
  var NAMESPACE = global.AUTOMODAL_GLOBALS && global.AUTOMODAL_GLOBALS.NAMESPACE || PLUGIN_NAME;

  
  /**
   * Time (miliseconds) to check if there is a modal to be fired, make it bigger to improve performance but also increase minimal time to fireup
   * @private
   * @const
   * @type {Number}
   */
  var INTERVAL = 2000;
  
  /**
   * Animationstart event with vendor prefixes
   * @private
   * @const
   * @type {String}
   */
  var ANIMATIONSTART_EVENTS = $.map(
    ['animationstart', 'webkitAnimationStart', 'MSAnimationStart', 'oAnimationStart'],

    function(eventName) {
      return eventName + '.' + NAMESPACE;
    }

  ).join(' ');

  /**
   * Animationend event with vendor prefixes
   * @private
   * @const
   * @type {String}
   */
  var ANIMATIONEND_EVENTS = $.map(
    ['animationend', 'webkitAnimationEnd', 'MSAnimationEnd', 'oAnimationEnd'],

    function(eventName) {
      return eventName + '.' + NAMESPACE;
    }

  ).join(' ');

  /**
   * Default settings
   * @private
   * @const
   * @type {Object}
   */
  var DEFAULTS = $.extend({
    autoDelay: false,  //In miliseconds. Value false will disable auto open of modal.s
    autoReset: false,  //In minutes for the modalbox to appear again(expiration of the cookie). 60*24*X to set expiration in X days, set to false to do not send a cookie. It will then become a really annoying pop-up.
    closeOnConfirm: true,
    closeOnCancel: true,
    closeOnEscape: true,
    closeOnOutsideClick: true,
	hashTracking: true,
    modifier: '',
    appendTo: null
  }, global.AUTOMODAL_GLOBALS && global.AUTOMODAL_GLOBALS.DEFAULTS);
  
  
  /**
   * States of the Remodal
   * @private
   * @const
   * @enum {String}
   */
  var STATES = {
    CLOSING: 'closing',
    CLOSED: 'closed',
    OPENING: 'opening',
    OPENED: 'opened'
  };
  
  /**
   * Reasons of the state change.
   * @private
   * @const
   * @enum {String}
   */
  var STATE_CHANGE_REASONS = {
    ICON: 'icon',
    ESCAPE: 'escape',
    CONFIRMATION: 'confirmation',
    CANCELLATION: 'cancellation'
  };
  
  /**
   * Is animation supported?
   * @private
   * @const
   * @type {Boolean}
   */
  var IS_ANIMATION = (function() {
    var style = document.createElement('div').style;

    return style.animationName !== undefined ||
      style.WebkitAnimationName !== undefined ||
      style.MozAnimationName !== undefined ||
      style.msAnimationName !== undefined ||
      style.OAnimationName !== undefined;
  })();

    /**
   * Is iOS?
   * @private
   * @const
   * @type {Boolean}
   */
  var IS_IOS = /iPad|iPhone|iPod/.test(navigator.platform);

  /**
   * Current modal
   * @private
   * @type {Remodal}
   */
  var current;

  /**
   * Scrollbar position
   * @private
   * @type {Number}
   */
  var scrollTop;

  /**
   * Returns an animation duration
   * @private
   * @param {jQuery} $elem
   * @returns {Number}
   */
  function getAnimationDuration($elem) {
    if (
      IS_ANIMATION &&
      $elem.css('animation-name') === 'none' &&
      $elem.css('-webkit-animation-name') === 'none' &&
      $elem.css('-moz-animation-name') === 'none' &&
      $elem.css('-o-animation-name') === 'none' &&
      $elem.css('-ms-animation-name') === 'none'
    ) {
      return 0;
    }

    var duration = $elem.css('animation-duration') ||
      $elem.css('-webkit-animation-duration') ||
      $elem.css('-moz-animation-duration') ||
      $elem.css('-o-animation-duration') ||
      $elem.css('-ms-animation-duration') ||
      '0s';

    var delay = $elem.css('animation-delay') ||
      $elem.css('-webkit-animation-delay') ||
      $elem.css('-moz-animation-delay') ||
      $elem.css('-o-animation-delay') ||
      $elem.css('-ms-animation-delay') ||
      '0s';

    var iterationCount = $elem.css('animation-iteration-count') ||
      $elem.css('-webkit-animation-iteration-count') ||
      $elem.css('-moz-animation-iteration-count') ||
      $elem.css('-o-animation-iteration-count') ||
      $elem.css('-ms-animation-iteration-count') ||
      '1';

    var max;
    var len;
    var num;
    var i;

    duration = duration.split(', ');
    delay = delay.split(', ');
    iterationCount = iterationCount.split(', ');

    // The 'duration' size is the same as the 'delay' size
    for (i = 0, len = duration.length, max = Number.NEGATIVE_INFINITY; i < len; i++) {
      num = parseFloat(duration[i]) * parseInt(iterationCount[i], 10) + parseFloat(delay[i]);

      if (num > max) {
        max = num;
      }
    }

    return max;
  }

  /**
   * Returns a scrollbar width
   * @private
   * @returns {Number}
   */
  function getScrollbarWidth() {
    if ($(document.body).height() <= $(window).height()) {
      return 0;
    }

    var outer = document.createElement('div');
    var inner = document.createElement('div');
    var widthNoScroll;
    var widthWithScroll;

    outer.style.visibility = 'hidden';
    outer.style.width = '100px';
    document.body.appendChild(outer);

    widthNoScroll = outer.offsetWidth;

    // Force scrollbars
    outer.style.overflow = 'scroll';

    // Add inner div
    inner.style.width = '100%';
    outer.appendChild(inner);

    widthWithScroll = inner.offsetWidth;

    // Remove divs
    outer.parentNode.removeChild(outer);

    return widthNoScroll - widthWithScroll;
  }

  /**
   * Locks the screen
   * @private
   */
  function lockScreen() {
    if (IS_IOS) {
      return;
    }

    var $html = $('html');
    var lockedClass = namespacify('is-locked');
    var paddingRight;
    var $body;

    if (!$html.hasClass(lockedClass)) {
      $body = $(document.body);

      // Zepto does not support '-=', '+=' in the `css` method
      paddingRight = parseInt($body.css('padding-right'), 10) + getScrollbarWidth();

      $body.css('padding-right', paddingRight + 'px');
      $html.addClass(lockedClass);
    }
  }

  /**
   * Unlocks the screen
   * @private
   */
  function unlockScreen() {
    if (IS_IOS) {
      return;
    }

    var $html = $('html');
    var lockedClass = namespacify('is-locked');
    var paddingRight;
    var $body;

    if ($html.hasClass(lockedClass)) {
      $body = $(document.body);

      // Zepto does not support '-=', '+=' in the `css` method
      paddingRight = parseInt($body.css('padding-right'), 10) - getScrollbarWidth();

      $body.css('padding-right', paddingRight + 'px');
      $html.removeClass(lockedClass);
    }
  }

  /**
   * Sets a state for an instance
   * @private
   * @param {Remodal} instance
   * @param {STATES} state
   * @param {Boolean} isSilent If true, Remodal does not trigger events
   * @param {String} Reason of a state change.
   */
  function setState(instance, state, isSilent, reason) {

    var newState = namespacify('is', state);
    var allStates = [namespacify('is', STATES.CLOSING),
                     namespacify('is', STATES.OPENING),
                     namespacify('is', STATES.CLOSED),
                     namespacify('is', STATES.OPENED)].join(' ');

    instance.$bg
      .removeClass(allStates)
      .addClass(newState);

    instance.$overlay
      .removeClass(allStates)
      .addClass(newState);

    instance.$wrapper
      .removeClass(allStates)
      .addClass(newState);

    instance.$modal
      .removeClass(allStates)
      .addClass(newState);

    instance.state = state;
    !isSilent && instance.$modal.trigger({
      type: state,
      reason: reason
    }, [{ reason: reason }]);
  }

  /**
   * Synchronizes with the animation
   * @param {Function} doBeforeAnimation
   * @param {Function} doAfterAnimation
   * @param {Remodal} instance
   */
  function syncWithAnimation(doBeforeAnimation, doAfterAnimation, instance) {
    var runningAnimationsCount = 0;

    var handleAnimationStart = function(e) {
      if (e.target !== this) {
        return;
      }

      runningAnimationsCount++;
    };

    var handleAnimationEnd = function(e) {
      if (e.target !== this) {
        return;
      }

      if (--runningAnimationsCount === 0) {

        // Remove event listeners
        $.each(['$bg', '$overlay', '$wrapper', '$modal'], function(index, elemName) {
          instance[elemName].off(ANIMATIONSTART_EVENTS + ' ' + ANIMATIONEND_EVENTS);
        });

        doAfterAnimation();
      }
    };

    $.each(['$bg', '$overlay', '$wrapper', '$modal'], function(index, elemName) {
      instance[elemName]
        .on(ANIMATIONSTART_EVENTS, handleAnimationStart)
        .on(ANIMATIONEND_EVENTS, handleAnimationEnd);
    });

    doBeforeAnimation();

    // If the animation is not supported by a browser or its duration is 0
    if (
      getAnimationDuration(instance.$bg) === 0 &&
      getAnimationDuration(instance.$overlay) === 0 &&
      getAnimationDuration(instance.$wrapper) === 0 &&
      getAnimationDuration(instance.$modal) === 0
    ) {

      // Remove event listeners
      $.each(['$bg', '$overlay', '$wrapper', '$modal'], function(index, elemName) {
        instance[elemName].off(ANIMATIONSTART_EVENTS + ' ' + ANIMATIONEND_EVENTS);
      });

      doAfterAnimation();
    }
  }

  /**
   * Closes immediately
   * @private
   * @param {Remodal} instance
   */
  function halt(instance) {
    if (instance.state === STATES.CLOSED) {
      return;
    }

    $.each(['$bg', '$overlay', '$wrapper', '$modal'], function(index, elemName) {
      instance[elemName].off(ANIMATIONSTART_EVENTS + ' ' + ANIMATIONEND_EVENTS);
    });

    instance.$bg.removeClass(instance.settings.modifier);
    instance.$overlay.removeClass(instance.settings.modifier).hide();
    instance.$wrapper.hide();
    unlockScreen();
    setState(instance, STATES.CLOSED, true);
  }
 

  /**
   * Start the timer to automatically launch modal boxes
   * @private
   * @param {Object}
   */
    var modalRegistry = [];
	function startTimer(){
		if(modalRegistry.length < 1) return;
		var counter = 0;
		var timer = setInterval(function(){
			counter++;
			if(DEBUG) {
				console.log('Seconds since startTimer = '+counter*INTERVAL);
				console.log(modalRegistry[0]);
				console.log(modalRegistry[0].autoDelay);
			}
			
			if(typeof current === 'object' && current.state === STATES.OPENED || modalRegistry.length < 1) {
				clearInterval(timer); // we exit the loop if a modal is opened or if the modalRegistry queue is empty.
			}
			if( typeof current !== 'object' || current.state === STATES.CLOSED && modalRegistry[0].autoDelay <= INTERVAL*counter){
				if(DEBUG) console.log('trying to open');
				$('[data-'+PLUGIN_NAME+'-id='+modalRegistry[0].id+']').automodal().open();
				modalRegistry.shift();
				clearInterval(timer);
			}
		}, INTERVAL);
	}
	
  /**
   * Start the timer to automatically launch modal boxes
   * @private
   * @param {Object}
   */
	function getRegistry(){
		// Initialization of auto modal registry
		// For increased precission you can reduce the INTERVAL value 
		$('[data-' + PLUGIN_NAME + '-id]').each(function(i, modalItem){
			var id;
			$modalItem = $(modalItem);
			id = $(modalItem).attr('data-' + PLUGIN_NAME + '-id');
			var options = $modalItem.attr('data-'+PLUGIN_NAME + '-options');
			
			if (!options) {
				options = {};
			} else if (typeof options === 'string' || options instanceof String) {
				options = parseOptions(options);
			}
			
			var modal = $(modalItem).automodal(options);
			if(modal && modal.settings.autoDelay && id && modal.readCookie() === null && modal.settings.autoDelay !== false ) {
				modalRegistry.push({'id': id, 'autoDelay': modal.settings.autoDelay});
			}
				
		});
		modalRegistry = modalRegistry.sort(function(a, b){
			return a.autoDelay - b.autoDelay;
		});
		
		return modalRegistry;
	}
	
  /**
   * Parses a string with options
   * @private
   * @param str
   * @returns {Object}
   */
  function parseOptions(str) {
    var obj = {};
    var arr;
    var len;
    var val;
    var i;

    // Remove spaces before and after delimiters
    str = str.replace(/\s*:\s*/g, ':').replace(/\s*,\s*/g, ',');

    // Parse a string
    arr = str.split(',');
    for (i = 0, len = arr.length; i < len; i++) {
      arr[i] = arr[i].split(':');
      val = arr[i][1];

      // Convert a string value if it is like a boolean
      if (typeof val === 'string' || val instanceof String) {
        val = val === 'true' || (val === 'false' ? false : val);
      }

      // Convert a string value if it is like a number
      if (typeof val === 'string' || val instanceof String) {
        val = !isNaN(val) ? +val : val;
      }

      obj[arr[i][0]] = val;
    }

    return obj;
  }

  /**
   * Generates a string separated by dashes and prefixed with NAMESPACE
   * @private
   * @param {...String}
   * @returns {String}
   */
  function namespacify() {
    var result = NAMESPACE;

    for (var i = 0; i < arguments.length; ++i) {
      result += '-' + arguments[i];
    }

    return result;
  }

  /**
   * Handles the hashchange event
   * @private
   * @listens hashchange
   */
  function handleHashChangeEvent() {
    var id = location.hash.replace('#', '');
    var instance;
    var $elem;

    if (!id) {

      // Check if we have currently opened modal and animation was completed
      if (current && current.state === STATES.OPENED && current.settings.hashTracking) {
        current.close();
      }
    } else {

      // Catch syntax error if your hash is bad
      try {
        $elem = $(
          '[data-' + PLUGIN_NAME + '-id="' + id + '"]'
        );
      } catch (err) {}

      if ($elem && $elem.length) {
        instance = $[PLUGIN_NAME].lookup[$elem.data(PLUGIN_NAME)];

        if (instance && instance.settings.hashTracking) {
          instance.open();
        }
      }

    }
  }

  /**
   * Automodal constructor
   * @constructor
   * @param {jQuery} $modal
   * @param {Object} options
   */
   
  function Automodal($modal, options) {
    var $body = $(document.body);
    var $appendTo = $body;
    var automodal = this;

    automodal.settings = $.extend({}, DEFAULTS, options);
    automodal.index = $[PLUGIN_NAME].lookup.push(automodal) - 1;
    automodal.state = STATES.CLOSED;

    automodal.$overlay = $('.' + namespacify('overlay'));

    if (automodal.settings.appendTo !== null && automodal.settings.appendTo.length) {
      $appendTo = $(automodal.settings.appendTo);
    }

    if (!automodal.$overlay.length) {
      automodal.$overlay = $('<div>').addClass(namespacify('overlay') + ' ' + namespacify('is', STATES.CLOSED)).hide();
      $appendTo.append(automodal.$overlay);
    }

    automodal.$bg = $('.' + namespacify('bg')).addClass(namespacify('is', STATES.CLOSED));

    automodal.$modal = $modal
      .addClass(
        NAMESPACE + ' ' +
        namespacify('is-initialized') + ' ' +
        automodal.settings.modifier + ' ' +
        namespacify('is', STATES.CLOSED))
      .attr('tabindex', '-1');

    automodal.$wrapper = $('<div>')
      .addClass(
        namespacify('wrapper') + ' ' +
        automodal.settings.modifier + ' ' +
        namespacify('is', STATES.CLOSED))
      .hide()
      .append(automodal.$modal);
    $appendTo.append(automodal.$wrapper);

    // Add the event listener for the close button
    automodal.$wrapper.on('click.' + NAMESPACE, '[data-' + PLUGIN_NAME + '-action="close"]', function(e) {
      e.preventDefault();

      automodal.close();
    });

    // Add the event listener for the cancel button
    automodal.$wrapper.on('click.' + NAMESPACE, '[data-' + PLUGIN_NAME + '-action="cancel"]', function(e) {
      e.preventDefault();

      automodal.$modal.trigger(STATE_CHANGE_REASONS.CANCELLATION);

      if (automodal.settings.closeOnCancel) {
        automodal.close(STATE_CHANGE_REASONS.CANCELLATION);
      }
    });

    // Add the event listener for the confirm button
    automodal.$wrapper.on('click.' + NAMESPACE, '[data-' + PLUGIN_NAME + '-action="confirm"]', function(e) {
      e.preventDefault();

      automodal.$modal.trigger(STATE_CHANGE_REASONS.CONFIRMATION);

      if (automodal.settings.closeOnConfirm) {
        automodal.close(STATE_CHANGE_REASONS.CONFIRMATION);
      }
    });

    // Add the event listener for the overlay
    automodal.$wrapper.on('click.' + NAMESPACE, function(e) {
      var $target = $(e.target);

      if (!$target.hasClass(namespacify('wrapper'))) {
        return;
      }

      if (automodal.settings.closeOnOutsideClick) {
        automodal.close();
      }
    });
  }
  
  /**
   * Opens a modal window
   * @public
   */
  Automodal.prototype.open = function() {
    var automodal = this;
    var id;

    // Check if the animation was completed
    if (automodal.state === STATES.OPENING || automodal.state === STATES.CLOSING) {
      return;
    }
	
    id = automodal.$modal.attr('data-' + PLUGIN_NAME + '-id');

    if (id && automodal.settings.hashTracking) {
      scrollTop = $(window).scrollTop();
      location.hash = id;
    }

    if (current && current !== automodal) {
      halt(current);
    }

    current = automodal;
    lockScreen();
    automodal.$bg.addClass(automodal.settings.modifier);
    automodal.$overlay.addClass(automodal.settings.modifier).show();
    automodal.$wrapper.show().scrollTop(0);
    automodal.$modal.focus();

	if(DEBUG) console.log(automodal);
    syncWithAnimation(
      function() {
        setState(automodal, STATES.OPENING);
      },

      function() {
        setState(automodal, STATES.OPENED);
      },

      automodal);
  };

  /**
   * Closes a modal window
   * @public
   * @param {String} reason
   */
  Automodal.prototype.close = function(reason) {
    var automodal = this;

    // Check if the animation was completed
    if (automodal.state === STATES.OPENING || automodal.state === STATES.CLOSING) {
      return;
    }

    if (
      automodal.settings.hashTracking &&
      automodal.$modal.attr('data-' + PLUGIN_NAME + '-id') === location.hash.substr(1)
    ) {
      location.hash = '';
      $(window).scrollTop(scrollTop);
    }

    syncWithAnimation(
      function() {
        setState(automodal, STATES.CLOSING, false, reason);
      },

      function() {
        automodal.$bg.removeClass(automodal.settings.modifier);
        automodal.$overlay.removeClass(automodal.settings.modifier).hide();
        automodal.$wrapper.hide();
        unlockScreen();

        setState(automodal, STATES.CLOSED, false, reason);
		if(automodal.settings.autoReset !== false) automodal.createCookie();
      },

      automodal);
	  
	  startTimer();
	  
  };	

  /**
   * Returns a current state of a modal
   * @public
   * @returns {STATES}
   */
  Automodal.prototype.getState = function() {
    return this.state;
  };

  /**
   * Destroys a modal
   * @public
   */
  Automodal.prototype.destroy = function() {
    var lookup = $[PLUGIN_NAME].lookup;
    var instanceCount;

    halt(this);
    this.$wrapper.remove();

    delete lookup[this.index];
    instanceCount = $.grep(lookup, function(instance) {
      return !!instance;
    }).length;

    if (instanceCount === 0) {
      this.$overlay.remove();
      this.$bg.removeClass(
        namespacify('is', STATES.CLOSING) + ' ' +
        namespacify('is', STATES.OPENING) + ' ' +
        namespacify('is', STATES.CLOSED) + ' ' +
        namespacify('is', STATES.OPENED));
    }
  };

  /**
   * Send a cookie to the browser indicating the modal has already been opened
   * @public
   */
	Automodal.prototype.createCookie = function() {
		var id;
		id = this.$modal.attr('data-' + PLUGIN_NAME + '-id');
		
		var name = PLUGIN_NAME +'-'+id;
		var value = Date.now();
		
		if(DEBUG){
		  console.log('Creating cookie of automodal id: ' + id);	
		}
		
		if (this.settings.autoReset) {
			var date = new Date();
			date.setTime(date.getTime() + (this.settings.autoReset*60*1000));
			var expires = "; expires=" + date.toUTCString();
		}
		else {
			var expires = "";
		}
		if(DEBUG){
			console.log('Cookie name = ' + name + ' for automodal ' + id);	
			console.log('Cookie value = ' + value + ' for automodal ' + id);	
			console.log('Cookie expiring date = ' + expires + ' for automodal ' + id);	
		}
		var cookieContent = name + "=" + value + expires + "; path=/";
		
		document.cookie = cookieContent;
	}

  /**
   * Read a cookie from the browser to check if the modal has already been opened.
   * @public
   * @returns {String}
   */
	Automodal.prototype.readCookie = function() {
		var id;
		id = this.$modal.attr('data-' + PLUGIN_NAME + '-id');
		var name = PLUGIN_NAME +'-'+id;
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}
	
  /**
   * Destroy the automodal cookie from the browser.
   * @public
   */
	Automodal.prototype.eraseCookie = function() {
		var id;
		id = automodal.$modal.attr('data-' + PLUGIN_NAME + '-id');
		var name = PLUGIN_NAME +'-'+id;
		document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}
	
	
  /**
   * Special plugin object for instances
   * @public
   * @type {Object}
   */
  $[PLUGIN_NAME] = {
    lookup: []
  };

  /**
   * Plugin constructor
   * @constructor
   * @param {Object} options
   * @returns {JQuery}
   */
  $.fn[PLUGIN_NAME] = function(opts) {
    var instance;
    var $elem;

    this.each(function(index, elem) {
      $elem = $(elem);

      if ($elem.data(PLUGIN_NAME) == null) {
        instance = new Automodal($elem, opts);
        $elem.data(PLUGIN_NAME, instance.index);

        if (
          instance.settings.hashTracking &&
          $elem.attr('data-' + PLUGIN_NAME + '-id') === location.hash.substr(1)
        ) {
          instance.open();
        }
      } else {
        instance = $[PLUGIN_NAME].lookup[$elem.data(PLUGIN_NAME)];
      }
    });
	
    return instance;
  };

   
  $(document).ready(function() {
	if(DEBUG){
	  console.log('global:');
	  console.log(global);
	  console.log('AUTOMODAL_GLOBALS');
	  console.log(global.AUTOMODAL_GLOBALS);
	  console.log('PLUGIN_NAME: '+PLUGIN_NAME);
	  console.log('NAMESPACE: '+NAMESPACE);
	}

	
    $('[data-automodal-id=modal]').automodal();
	
    // data-automodal-target opens a modal window with the special Id
    $(document).on('click', '[data-' + PLUGIN_NAME + '-target]', function(e) {
      e.preventDefault();

      var elem = e.currentTarget;
      var id = elem.getAttribute('data-' + PLUGIN_NAME + '-target');
      var $target = $('[data-' + PLUGIN_NAME + '-id="' + id + '"]');

      $[PLUGIN_NAME].lookup[$target.data(PLUGIN_NAME)].open();
    });


    // They should have the 'automodal' class attribute
    // Also you can write the `data-automodal-options` attribute to pass params into the modal
    $(document).find('.' + NAMESPACE).each(function(i, container) {
      var $container = $(container);
      var options = $container.data(PLUGIN_NAME + '-options');

      if (!options) {
        options = {};
      } else if (typeof options === 'string' || options instanceof String) {
        options = parseOptions(options);
      }

      $container[PLUGIN_NAME](options);
    });

    // Handles the keydown event
    $(document).on('keydown.' + NAMESPACE, function(e) {
      if (current && current.settings.closeOnEscape && current.state === STATES.OPENED && e.keyCode === 27) {
        current.close();
      }
    });

    // Handles the hashchange event
    $(window).on('hashchange.' + NAMESPACE, handleHashChangeEvent);
	getRegistry();
	startTimer();
	
  });
});