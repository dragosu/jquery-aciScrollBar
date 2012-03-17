
/*
 * aciScrollBar jQuery Plugin v2.1
 * http://acoderinsights.ro
 *
 * Copyright (c) 2012 Dragos Ursu
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Require jQuery Library http://jquery.com
 * + (optional) MouseWheel Plugin (for mouse wheel support) https://github.com/brandonaaron/jquery-mousewheel
 * + (optional) TouchSwipe Plugin (for touch based devices) https://github.com/mattbryson/TouchSwipe-Jquery-Plugin
 *
 * Date: Fri Feb 24 20:25 2012 +0200
 */

(function($){

    // keep current control index
    $.aciScrollBar = {
        nameSpace: '.aciScrollBar',
        index: 0
    };

    $.fn.aciScrollBar = function(options, data){
        if (typeof options == 'string')
        {
            return $(this)._aciScrollBar(options, data);
        }
        return this.each(function(){
            return $(this)._aciScrollBar(options, data);
        });
    };

    // default options
    $.fn.aciScrollBar.defaults = {
            delta: 40,                        // the height of a virtual line (in pixels)
            lineDelay: 400,                   // the delay in milliseconds between the scroll of the first line and the rest (when scrolling by lines)
            lineTimer: 40,                    // the delay in milliseconds when scrolling to a new line in the same scrolling sequence (except the first line)
            pageDelay: 400,                   // the delay in milliseconds between the scroll of the first page and the rest (when scrolling by pages)
            pageTimer: 200,                   // the delay in milliseconds when scrolling to a new page in the same scrolling sequence (except the first page)
            bindMouse: true,                  // should we handle mouse events? (only for 'mousewheel', the scrollbar buttons will always work with the mouse!)
			bindTouch: false,				  // should we handle touch events? (only for content, the bars will always work with the touch!)
            bindKeyboard: true,               // should we handle keyboard events? (scrolling by keyboard)
            resizable: false,                 // it is a resisable control? (the 'resize' event must be implemented to actually apply the resize)
            position: 'bottom-right',         // where we should have the scrollbars? (combination of two words: 'top/left/bottom/right')
            verticalBar: 'up-bar-down',       // what is the button order for the vertical bar? (combination of 'up/bar/down' or 'none' to hide the vertical scrollbar)
            horizontalBar: 'left-bar-right',  // what is the button order for the horizontal bar? (combination of 'left/bar/right' or 'none' to hide the horizontal scrollbar)
            smoothScroll: false,              // should we use smooth scrolling?
            skin: 'desk'                      // the skin name (.css  must be loaded before initialization)
    };

    $.fn._aciScrollBar = function(options, data){

        var $this = this;

        var _options = $.extend({}, $.fn.aciScrollBar.defaults, options);

        // get grip size (if fixed size)
        var _gripSize = function (skin)
        {
			// use a dummy element to get sizes from css
            var dummy = $('.aciSb_dummy');
            if (dummy.length == 0)
            {
                dummy = $(document.createElement('div'));
                dummy.addClass('aciSb_dummy').css({
                    width:0,
                    height:0,
                    position:'relative',
                    overflow:'hidden'
                });
                $(document.body).append(dummy);
                var tmp = $(document.createElement('div'));
                tmp.addClass('aciSb_grip ' + skin);
                dummy.append(tmp);
            }
            else
            {
                var tmp = dummy.find('div');
                tmp.attr('class', 'aciSb_grip ' + skin);
            }
            $this.data('_grip_w', tmp.width());
            $this.data('_grip_h', tmp.height());
        };

        // init control based on options
        var _initUi = function(){
            if ((typeof options == 'undefined') || (typeof options == 'object'))
            {
                _customUi();
                // remember options
                $this.data('options' + $.aciScrollBar.nameSpace, _options);
            }
            // process custom request
            if (typeof options == 'string')
            {
                if ($this.data('customUi' + $.aciScrollBar.nameSpace))
                {
                    // we get here is this was skinned
                    switch (options)
                    {
                        case 'skinned':
                            // is this skinned?
                            return true;
                        case 'container':
                            // return content element
                            return $this.find('.aciSb_cnt:first');
                        case 'vertical':
                            // return the vertical bar element
                            return $this.find('.aciSb_bar_v:last');
                        case 'horizontal':
                            // return the horizontal bar element
                            return $this.find('.aciSb_bar_h:last');
                        case 'resizer':
                            // return the resizer element
                            return $this.find('.aciSb_resize:last');
                        case 'skin':
                            // set/get the skin
                            if (typeof data == 'string')
                            {
								var initOpts = $this.data('options' + $.aciScrollBar.nameSpace);
								if (initOpts.skin != data)
								{
									_gripSize(data);
									_setClass(initOpts.skin, data);
									$this.trigger('update', true);
									initOpts.skin = data;
									$this.data('options' + $.aciScrollBar.nameSpace, initOpts);
								}
								break;
                            }
							else
							{
								var initOpts = $this.data('options' + $.aciScrollBar.nameSpace);
								return initOpts.skin;
							}
                        case 'options':
                            // get options
                            return $this.data('options' + $.aciScrollBar.nameSpace);
                        case 'destroy':
                            // destroy the control
                            _destroyUi();
                    }
                }
                else
                {
                    switch (options)
                    {
                        case 'skinned':
                            // is this skinned?
                            return false;
                        case 'vertical':
                            // we do not have one
                            return $([]);
                        case 'horizontal':
                            // we do not have one
                            return $([]);
                        case 'resizer':
                            // we do not have one
                            return $([]);
						case 'skin':	
                            // set/get the skin
                            if (typeof data == 'string')
                            {
								// nothing to do
								break;
                            }
							else
							{
								var initOpts = $this.data('options' + $.aciScrollBar.nameSpace);
								return initOpts ? initOpts.skin : null;
							}
                        case 'options':
                            // get options
							var initOpts = $this.data('options' + $.aciScrollBar.nameSpace);
							return initOpts ? initOpts : _options;
                    }
                }
            }
            // return this object
            return $this;
        };

        var _replaceClass = function (obj, oldClass, newClass)
        {
            obj.each(function(){
                $(this).attr('class', $(this).attr('class').replace(oldClass, newClass));
            });
        };

        var _setClass = function (oldClass, newClass)
        {
            _replaceClass($this, oldClass, newClass);
            _replaceClass($this.find('.aciSb_bar_v:last, .aciSb_bar_v:last *'), oldClass, newClass);
            _replaceClass($this.find('.aciSb_bar_h:last, .aciSb_bar_h:last *'), oldClass, newClass);
            _replaceClass($this.find('.aciSb_resize:last'), oldClass, newClass);
            _replaceClass($this.find('.aciSb_cnt:first'), oldClass, newClass);
        };

        // destroy control
        var _destroyUi = function(){
            if ($this.data('customUi' + $.aciScrollBar.nameSpace))
            {
	            // destroy if initialized
                var cnt = $this.find('.aciSb_cnt:first');
                // to compute new position
                var height = cnt.get(0).scrollHeight;
                var width = cnt.get(0).scrollWidth;
                var top = cnt.scrollTop();
                var left = cnt.scrollLeft();
                $this.data('customUi' + $.aciScrollBar.nameSpace, false);
                var index = $this.data('index' + $.aciScrollBar.nameSpace);
                $('html').unbind($.aciScrollBar.nameSpace + '-' + index);
                $this.unbind($.aciScrollBar.nameSpace);
                $this.find('.aciSb_bar_v:last').remove();
                $this.find('.aciSb_bar_h:last').remove();
                $this.find('.aciSb_resize:last').remove();
                cnt.children().unwrap();
                $this.removeClass('aciScrollBar ' + _options.skin).css('overflow', $this.data('overflow' + $.aciScrollBar.nameSpace));
                // reposition where it was
                $this.get(0).scrollTop = Math.round($this.get(0).scrollHeight * top / height);
                $this.get(0).scrollLeft = Math.round($this.get(0).scrollWidth * left / width);
            }
        }; // end _destroyUi

        // init custom UI
        var _customUi = function(){
            if ($this.data('customUi' + $.aciScrollBar.nameSpace))
            {
                // return if already initialised
                return;
            }

            // only init for the right elements
            if (($this.css('overflow') != 'auto') && ($this.css('overflow') != 'scroll'))
            {
                // return if overflow is not 'auto' or 'scroll'
                return;
            }

            $this.data('customUi' + $.aciScrollBar.nameSpace, true);

            // update control index so we can unbind window events later
            var _index = $this.data('index' + $.aciScrollBar.nameSpace);

            if (!_index)
            {
                $.aciScrollBar.index++;
                $this.data('index' + $.aciScrollBar.nameSpace, $.aciScrollBar.index);
                _index = $.aciScrollBar.index;
            }

            // trigger init event
            $this.trigger('init');

            $this.data('overflow' + $.aciScrollBar.nameSpace, $this.css('overflow'));

            // should we hide the scrollbars if they are not required?
            var _hide = ($this.css('overflow') == 'auto') && !_options.resizable;

            // save for later
            var _scroll = {
                height: $this.get(0).scrollHeight,
                width: $this.get(0).scrollWidth,
                top: $this.scrollTop(),
                left: $this.scrollLeft()
            };

            $this.get(0).scrollLeft = 0;
            $this.get(0).scrollTop = 0;

            _gripSize(_options.skin);

            $this.css('overflow', 'hidden').addClass('aciScrollBar ' + _options.skin);

            // wrap content in extra container
            $this.wrapInner('<div class="aciSb_cnt ' + _options.skin + '" unselectable="on"></div>');
            var _container = $this.find('.aciSb_cnt:first');

            // init position
            _container.get(0).scrollLeft = 0;
            _container.get(0).scrollTop = 0;

            var _setElement = function(tag, style, parent){
                var obj = $(document.createElement(tag));
                obj.addClass(style + ' ' + _options.skin).attr('unselectable', 'on').css({
                    '-moz-user-select':'none',
                    '-webkit-user-select':'none'
                });
                parent.append(obj);
                return obj;
            };

            // add all bars elements (resizer too)

            var _bar_v = _setElement('div', 'aciSb_bar_v', $this);
            var _arrow_t = _setElement('div', 'aciSb_arrow_t', _bar_v);
            var _space_t = _setElement('div', 'aciSb_space_t', _bar_v);
            var _track_v = _setElement('div', 'aciSb_track_v', _bar_v);
            var _track_t = _setElement('div', 'aciSb_track_t', _track_v);
            var _drag_vc = _setElement('div', 'aciSb_drag_vc', _track_v);
            var _drag_t = _setElement('div', 'aciSb_drag_t', _drag_vc);
            var _drag_v = _setElement('div', 'aciSb_drag_v', _drag_vc);
            var _drag_vg = _setElement('div', 'aciSb_drag_vg', _drag_v);
            var _drag_b = _setElement('div', 'aciSb_drag_b', _drag_vc);
            var _track_b = _setElement('div', 'aciSb_track_b', _track_v);
            var _space_b = _setElement('div', 'aciSb_space_b', _bar_v);
            var _arrow_b = _setElement('div', 'aciSb_arrow_b', _bar_v);

            var _bar_h = _setElement('div', 'aciSb_bar_h', $this);
            var _arrow_l = _setElement('div', 'aciSb_arrow_l', _bar_h);
            var _space_l = _setElement('div', 'aciSb_space_l', _bar_h);
            var _track_h = _setElement('div', 'aciSb_track_h', _bar_h);
            var _track_l = _setElement('div', 'aciSb_track_l', _track_h);
            var _drag_hc = _setElement('div', 'aciSb_drag_hc', _track_h);
            var _drag_l = _setElement('div', 'aciSb_drag_l', _drag_hc);
            var _drag_h = _setElement('div', 'aciSb_drag_h', _drag_hc);
            var _drag_hg = _setElement('div', 'aciSb_drag_hg', _drag_h);
            var _drag_r = _setElement('div', 'aciSb_drag_r', _drag_hc);
            var _track_r = _setElement('div', 'aciSb_track_r', _track_h);
            var _space_r = _setElement('div', 'aciSb_space_r', _bar_h);
            var _arrow_r = _setElement('div', 'aciSb_arrow_r', _bar_h);

            var _resize = _setElement('div', 'aciSb_resize', $this);

            _bar_v.css('position', 'absolute').find('*').css({
                'position':'absolute',
                'width':_bar_v.width() + 'px'
            });
            _bar_h.css('position', 'absolute').find('*').css({
                'position':'absolute',
                'height':_bar_h.height() + 'px'
            });
            _resize.css({
                'position':'absolute',
                'width':_bar_v.width() + 'px',
                'height':_bar_h.height() + 'px'
            });

            // get vertical bar width
            _bar_v.width = function(){
                if (_bar_v.is(':hidden'))
                {
                    return 0;
                }
                else
                {
                    return $(_bar_v).width();
                }
            };

            // get horizontal bar height
            _bar_h.height = function(){
                if (_bar_h.is(':hidden'))
                {
                    return 0;
                }
                else
                {
                    return $(_bar_h).height();
                }
            };

            var _contentWidth = function(){
                return _container.get(0).scrollWidth;
            };

            var _contentHeight = function(){
                return _container.get(0).scrollHeight;
            };

            // show/hide the bars as required
            var _initBars = function (){
                if (!_options.resizable && (_options.horizontalBar == 'none'))
                {
                    _bar_h.hide();
                }
                else
                {
                    if (_contentWidth() <= $this.width() - _bar_v.width())
                    {
                        if (!_options.resizable && _hide)
                        {
                            _bar_h.hide();
                        }
                        else
                        {
                            _bar_h.show();
                        }
                    }
                    else
                    {
                        _bar_h.show();
                    }
                }
                if (!_options.resizable && (_options.verticalBar == 'none'))
                {
                    _bar_v.hide();
                }
                else
                {
                    if (_contentHeight() <= $this.height() - _bar_h.height())
                    {
                        if (!_options.resizable && _hide)
                        {
                            _bar_v.hide();
                        }
                        else
                        {
                            _bar_v.show();
                        }
                    }
                    else
                    {
                        _bar_v.show();
                    }
                }
            };

            // get bar position (+1 bottom/right, -1 top/left)

            var _vert = 1;
            var _horz = 1;

            switch (_options.position.replace(/[^a-z]/g, ''))
            {
                case 'topleft':
                case 'lefttop':
                    _vert = -1;
                    _horz = -1;
                    break;
                case 'topright':
                case 'righttop':
                    _vert = 1;
                    _horz = -1;
                    break;
                case 'bottomleft':
                case 'leftbottom':
                    _vert = -1;
                    _horz = 1;
                    break;
            }

            // (re)init the container (and the bars)
            var _initContainer = function(){
                _container.css('width', $this.width() + 'px').css('height', $this.height() + 'px');
                _initBars();
                _container.css('width', $this.width() - _bar_v.width() + 'px').css('height', $this.height() - _bar_h.height() + 'px');
                _initBars();
                _container.css('width', $this.width() - _bar_v.width() + 'px').css('height', $this.height() - _bar_h.height() + 'px');
                _bar_v.find('*').css('width', _bar_v.width() + 'px');
                _bar_h.find('*').css('height', _bar_h.height() + 'px');
                _resize.css({
                    'width':_bar_v.width() + 'px',
                    'height':_bar_h.height() + 'px'
                });
                var hsize = $this.width() - _bar_v.width();
                var vsize = $this.height() - _bar_h.height();
                var hpadd = parseInt($this.css('padding-left'));
                var vpadd = parseInt($this.css('padding-top'));
                _bar_v.css('height', vsize + 'px').css('left', ((_vert == 1) ? hsize : 0) + hpadd + 'px').css('top', ((_horz == 1) ? 0 : _bar_h.height()) + vpadd + 'px');
                _bar_h.css('width', hsize + 'px').css('top', ((_horz == 1) ? vsize : 0) + vpadd + 'px').css('left', ((_vert == 1) ? 0 : _bar_v.width()) + hpadd + 'px');
                // vertical bar
                switch (_options.verticalBar.replace(/[^a-z]/g, ''))
                {
                    case 'bar':
                        _arrow_t.hide();
                        _space_t.css('top', '0px');
                        _track_v.css('height', vsize - _space_t.height() - _space_b.height() + 'px').css('top', _space_t.height() + 'px');
                        _space_b.css('top', _bar_v.height() - _space_b.height() + 'px');
                        _arrow_b.hide();
                        break;
                    case 'updownbar':
                        _arrow_t.css('top', '0px');
                        _arrow_b.css('top', _arrow_t.height() + 'px');
                        _space_t.css('top', _arrow_t.height() + _arrow_b.height() + 'px');
                        _track_v.css('height', vsize - _arrow_t.height() - _space_t.height() - _space_b.height() - _arrow_b.height() + 'px').css('top', _arrow_t.height() + _arrow_b.height() + _space_t.height() + 'px');
                        _space_b.css('top', _bar_v.height() - _space_b.height() + 'px');
                        break;
                    case 'barupdown':
                        _space_t.css('top', '0px');
                        _track_v.css('height', vsize - _arrow_t.height() - _space_t.height() - _space_b.height() - _arrow_b.height() + 'px').css('top', _space_t.height() + 'px');
                        _space_b.css('top', _bar_v.height() - _arrow_t.height() - _arrow_b.height() - _space_b.height() + 'px');
                        _arrow_t.css('top', _bar_v.height() - _arrow_t.height() - _arrow_b.height() + 'px');
                        _arrow_b.css('top', _bar_v.height() - _arrow_b.height() + 'px');
                        break;
                    default:
                        _arrow_t.css('top', '0px');
                        _space_t.css('top', _arrow_t.height() + 'px');
                        _track_v.css('height', vsize - _arrow_t.height() - _space_t.height() - _space_b.height() - _arrow_b.height() + 'px').css('top', _arrow_t.height() + _space_t.height() + 'px');
                        _space_b.css('top', _bar_v.height() - _arrow_b.height() - _space_b.height() + 'px');
                        _arrow_b.css('top', _bar_v.height() - _arrow_b.height() + 'px');
                }
                // horizontal bar
                switch (_options.horizontalBar.replace(/[^a-z]/g, ''))
                {
                    case 'bar':
                        _arrow_l.hide();
                        _space_l.css('left', '0px');
                        _track_h.css('width', hsize - _space_l.width() - _space_r.width() + 'px').css('left', _space_l.width() + 'px');
                        _space_r.css('left', _bar_h.width() - _space_r.width() + 'px');
                        _arrow_r.hide();
                        break;
                    case 'leftrightbar':
                        _arrow_l.css('left', '0px');
                        _arrow_r.css('left', _arrow_l.width() + 'px');
                        _space_l.css('left', _arrow_l.width() + _arrow_r.width() + 'px');
                        _track_h.css('width', hsize - _arrow_l.width() - _space_l.width() - _space_r.width() - _arrow_r.width() + 'px').css('left', _arrow_l.width() + _arrow_r.width() + _space_l.width() + 'px');
                        _space_r.css('left', _bar_h.width() - _space_r.width() + 'px');
                        break;
                    case 'barleftright':
                        _space_l.css('left', '0px');
                        _track_h.css('width', hsize - _arrow_l.width() - _space_l.width() - _space_r.width() - _arrow_r.width() + 'px').css('left', _space_l.width() + 'px');
                        _space_r.css('left', _bar_h.width() - _arrow_l.width() - _arrow_r.width() - _space_r.width() + 'px');
                        _arrow_l.css('left', _bar_h.width() - _arrow_l.width() - _arrow_r.width() + 'px');
                        _arrow_r.css('left', _bar_h.width() - _arrow_r.width() + 'px');
                        break;
                    default:
                        _arrow_l.css('left', '0px');
                        _space_l.css('left', _arrow_l.width() + 'px');
                        _track_h.css('width', hsize - _arrow_l.width() - _space_l.width() - _space_r.width() - _arrow_r.width() + 'px').css('left', _arrow_l.width() + _space_l.width() + 'px');
                        _space_r.css('left', _bar_h.width() - _arrow_r.width() - _space_r.width() + 'px');
                        _arrow_r.css('left', _bar_h.width() - _arrow_r.width() + 'px');
                }
                _resize.css('left', ((_vert == 1) ? hsize : 0) + hpadd + 'px').css('top', ((_horz == 1) ? vsize : 0) + vpadd + 'px');
                if (_bar_v.is(':visible') && _bar_h.is(':visible'))
                {
                    if (_options.resizable)
                    {
                        _resize.addClass('aciSb_on' + ((_horz == 1) ? 'b' : 't') + ((_vert == 1) ? 'r' : 'l'));
                    }
                    else
                    {
                        _resize.addClass('aciSb_gray');
                    }
                    _resize.show();
                }
                else
                {
                    _resize.hide();
                }
                _container.css('margin-left', ((_vert == 1) ? 0 : _bar_v.width()) + 'px').css('margin-top', ((_horz == 1) ? 0 : _bar_h.height()) + 'px');
                $this.data('width' + $.aciScrollBar.nameSpace, $this.width());
                $this.data('height' + $.aciScrollBar.nameSpace, $this.height());
                $this.data('scrollWidth' + $.aciScrollBar.nameSpace, _contentWidth());
                $this.data('scrollHeight' + $.aciScrollBar.nameSpace, _contentHeight());
                $this.data('paddingLeft' + $.aciScrollBar.nameSpace, $this.css('padding-left'));
                $this.data('paddingTop' + $.aciScrollBar.nameSpace, $this.css('padding-top'));
            };

            // for the initial size
            _initContainer();

            // get the ratio, bar size vs. scroll dimension

            var _verticalRatio = function(){
                var _grip_h = $this.data('_grip_h');
                if (_grip_h)
                {
                    return (_track_v.height() - _grip_h) / (_contentHeight() - _container.height());
                }
                return Math.min(_track_v.height() / _contentHeight(), 1);
            };

            var _horizontalRatio = function(){
                var _grip_w = $this.data('_grip_w');
                if (_grip_w)
                {
                    return (_track_h.width() - _grip_w) / (_contentWidth() - _container.width());
                }
                return Math.min(_track_h.width() / _contentWidth(), 1);
            };

            // (re)init vertical bar
            var _initVerticals = function (){
                // check if should not be visible
                if (_container.get(0).scrollHeight <= $this.height() - _bar_h.height())
                {
                    _bar_v.addClass('aciSb_gray');
                    _track_t.hide();
                    _drag_vc.hide();
                    _track_b.hide();
                    return;
                }
                _bar_v.removeClass('aciSb_gray');
                var ratio = _verticalRatio();
                var top = $(_container).scrollTop() * ratio;
                var _grip_h = $this.data('_grip_h');
                var min = _drag_t.height() + _grip_h + _drag_b.height();
                var size = _grip_h ? min : Math.max(Math.min(Math.round(_bar_v.height() * ratio), _track_v.height()), min);
                if (top + size > _track_v.height())
                {
                    top = _track_v.height() - size;
                }
                if (top > 0)
                {
                    _track_t.css('height', top + 'px').show();
                }
                else
                {
                    _track_t.hide();
                }
                if (size > 0)
                {
                    _drag_vc.css('height', size + 'px').css('top', top + 'px').show();
                    if (size > _drag_t.height() + _drag_b.height())
                    {
                        _drag_v.css('height', size - min + 'px').css('top', _drag_t.height() + 'px').show();
                        if ((_drag_vg.height() <= size - min) || _grip_h)
                        {
                            _drag_vg.css('top', Math.round(size / 2 - _drag_vg.height() / 2) - _drag_t.height() + 'px').show();
                        }
                        else
                        {
                            _drag_vg.hide();
                        }
                    }
                    else
                    {
                        _drag_v.hide();
                    }
                    _drag_b.css('top', size - _drag_b.height() + 'px');
                }
                else
                {
                    _drag_vc.hide();
                }
                if (top + size < _track_v.height())
                {
                    _track_b.css('height', _track_v.height() - (top + size)).css('top', top + size + 'px').show();
                }
                else
                {
                    _track_b.hide();
                }
            };

            // (re)init horizontal bar
            var _initHorizontals = function (){
                // check if should not be visible
                if (_container.get(0).scrollWidth <= $this.width() - _bar_v.width())
                {
                    _bar_h.addClass('aciSb_gray');
                    _track_l.hide();
                    _drag_hc.hide();
                    _track_r.hide();
                    return;
                }
                _bar_h.removeClass('aciSb_gray');
                var ratio = _horizontalRatio();
                var left = $(_container).scrollLeft() * ratio;
                var _grip_w = $this.data('_grip_w');
                var min = _drag_l.width() + _grip_w + _drag_r.width();
                var size = _grip_w ? min : Math.max(Math.min(Math.round(_bar_h.width() * ratio), _track_h.width()), min);
                if (left + size > _track_h.width())
                {
                    left = _track_h.width() - size;
                }
                if (left > 0)
                {
                    _track_l.css('width', left + 'px').show();
                }
                else
                {
                    _track_l.hide();
                }
                if (size > 0)
                {
                    _drag_hc.css('width', left + 'px').css('left', left + 'px').show();
                    if (size > _drag_l.width() + _drag_r.width())
                    {
                        _drag_h.css('width', size - min + 'px').css('left', _drag_l.width() + 'px').show();
                        if ((_drag_hg.width() <= size - min) || _grip_w)
                        {
                            _drag_hg.css('left', Math.round(size / 2 - _drag_hg.width() / 2) - _drag_l.width() + 'px').show();
                        }
                        else
                        {
                            _drag_hg.hide();
                        }
                    }
                    else
                    {
                        _drag_h.hide();
                    }
                    _drag_r.css('left', size - _drag_r.width() + 'px');
                }
                else
                {
                    _drag_hc.hide();
                }
                if (left + size < _track_h.width())
                {
                    _track_r.css('width', _track_h.width() - (left + size)).css('left', left + size + 'px').show();
                }
                else
                {
                    _track_r.hide();
                }
            };

            // for the initial position
            _initVerticals();
            _initHorizontals();

            // scroll vertically
            var _scrollVertically = function(delta){
                if (_contentHeight() > $this.height() - _bar_h.height())
                {
                    var pos, timed;
                    if (typeof delta == 'object')
                    {
                        pos = Math.max($(_container).scrollTop() + -delta.delta * _options.delta, 0);
                        timed = delta.timed;
                    }
                    else
                    {
                        pos = delta;
                        timed = _options.lineTimer;
                    }
                    if (_options.smoothScroll && !_inSwipe)
                    {
                        $(_container).stop(false, true).animate({
                            'scrollTop':pos
                        }, {
                            duration:timed,
                            easing:'linear',
                            complete:function(){
                                $this.trigger('scroll');
                                _initVerticals();
                            },
                            step:function(){
                                _initVerticals();
                            },
                            queue:true
                        });
                    }
                    else
                    {
                        _container.get(0).scrollTop = pos;
                    }
                }
                else
                {
                    _container.get(0).scrollTop = 0;
                }
                $this.trigger('scroll');
                _initVerticals();
            };

            // scroll horizontally
            var _scrollHorizontally = function(delta){
                if (_contentWidth() > $this.width() - _bar_v.width())
                {
                    var pos, timed;
                    if (typeof delta == 'object')
                    {
                        pos = Math.max($(_container).scrollLeft() + -delta.delta * _options.delta, 0);
                        timed = delta.timed;
                    }
                    else
                    {
                        pos = delta;
                        timed = _options.lineTimer;
                    }
                    if (_options.smoothScroll && !_inSwipe)
                    {
                        $(_container).stop(false, true).animate({
                            'scrollLeft':pos
                        }, {
                            duration:timed,
                            easing:'linear',
                            complete:function(){
                                $this.trigger('scroll');
                                _initHorizontals();
                            },
                            step:function(){
                                _initHorizontals();
                            },
                            queue:true
                        });
                    }
                    else
                    {
                        _container.get(0).scrollLeft = pos;
                    }
                }
                else
                {
                    _container.get(0).scrollLeft = 0;
                }
                $this.trigger('scroll');
                _initHorizontals();
            };

            // bind mouse wheel on content
            if (_options.bindMouse)
            {
                $this.bind('mousewheel' + $.aciScrollBar.nameSpace, function(e, delta){
                    if (typeof delta == 'object')
                    {
                        _scrollVertically(delta);
                    }
                    else
                    {
                        _scrollVertically({
                            'delta':delta * 2,
                            'timed':_options.lineTimer
                        });
                    }
                    return false;
                });
            }
			
			// process content swipe
			var _contentSwipe = function (e, phase, direction, distance){
				if (!e.touches)
				{
					return;
				}
				switch (phase)
				{
					case 'start':
     					_inSwipe = true;
						_delayFinish();
						break;
					case 'move':
						var now = new Date().getTime();
						if (!_swipeMove || (_swipeMove < now - 250))
						{
							_swipeMove = now;
							_inSwipe = true;
							switch (direction)
							{
								case 'up':
									_scrollVertically($(_container).scrollTop() + distance);
									break;
								case 'down':
									_scrollVertically($(_container).scrollTop() - distance);
									break;
								case 'left':
									_scrollHorizontally($(_container).scrollLeft() + distance);
									break;
								case 'right':
									_scrollHorizontally($(_container).scrollLeft() - distance);
									break;
							}							
						}
						break;
					case 'end':
					case 'cancel':
						_inSwipe = false;
						_swipeMove = false;
						break;
				}
			};

			// enable swipe on content
            if (_options.bindTouch && (typeof $.fn.swipe != 'undefined'))
            {
				$this.swipe({ swipeStatus: _contentSwipe, threshold: 5, fingers: 1, allowPageScroll: 'none' });
            }

            // vertical scrollbar
            _bar_v.bind('mousewheel' + $.aciScrollBar.nameSpace, function(e, delta){
                if (typeof delta == 'object')
                {
                    _scrollVertically(delta);
                }
                else
                {
                    _scrollVertically({
                        'delta':delta * 2,
                        'timed':_options.lineTimer
                    });
                }
                return false;
            }).bind('selectstart' + $.aciScrollBar.nameSpace, function(){
                return false;
            }).bind('mousedown' + $.aciScrollBar.nameSpace, function(){
                $this.focus();
                return false;
            }).bind('mouseup' + $.aciScrollBar.nameSpace, function(){
                _unselect();
                _gripEnd();				
            }).bind('click' + $.aciScrollBar.nameSpace, function(){
                return false;
            });

            // horizontal scrollbar
            _bar_h.bind('mousewheel' + $.aciScrollBar.nameSpace, function(e, delta){
                if (typeof delta == 'object')
                {
                    _scrollHorizontally(delta);
                }
                else
                {
                    _scrollHorizontally({
                        'delta':delta * 2,
                        'timed':_options.lineTimer
                    });
                }
                return false;
            }).bind('selectstart' + $.aciScrollBar.nameSpace, function(){
                return false;
            }).bind('mousedown' + $.aciScrollBar.nameSpace, function(){
                $this.focus();
                return false;
            }).bind('mouseup' + $.aciScrollBar.nameSpace, function(){
                _unselect();
                _gripEnd();				
            }).bind('click' + $.aciScrollBar.nameSpace, function(){
                return false;
            });

            // keep current mouse coords (with the start value from a click for example)
            var _coords = {
                'curr':{
                    'x':null,
                    'y':null
                },
                'start':{
                    'x':null,
                    'y':null
                },
                'ref':{
                    'x':null,
                    'y':null
                }
            };

            // keep starting values
            var _resizeStart = function(){
                _coords.start.x = _coords.curr.x;
                _coords.start.y = _coords.curr.y;
                _coords.ref.x = $this.width();
                _coords.ref.y = $this.height();
            };

            // called on mousemove (when in resize)
            var _resizeMove = function(){
                if (_resize.get(0) == _lastSelected)
                {
                    var width = Math.max(_coords.ref.x + _coords.curr.x - _coords.start.x, _resize.width() * 4);
                    var height = Math.max(_coords.ref.y + _coords.curr.y - _coords.start.y, _resize.height() * 4);
                    $this.trigger('resize', {
                        'width':width,
                        'height':height
                    });
                }
            };

            // bind events on the resizer
            _resize.bind('selectstart' + $.aciScrollBar.nameSpace, function(){
                return false;
            }).bind('mousedown' + $.aciScrollBar.nameSpace, function(){
                $this.focus();
                _lastSelected = this;
                _delayFinish();
                _resizeStart();
                return false;
            }).bind('mouseup' + $.aciScrollBar.nameSpace, function(){
                _unselect();
                return false;
            }).bind('click' + $.aciScrollBar.nameSpace, function(){
                _unselect();
                return false;
            });

            // keep current selected element (arrows, track, grip etc)
            var _lastSelected = null;

            var _unselect = function (){
                $(_lastSelected).removeClass('aciSb_sel');
                _lastSelected = null;
                _delayFinish();
            };

            // used for event delay
            var _delayTimer = null;

            // finish current operation
            var _delayFinish = function(){
                if (_delayTimer)
                {
                    window.clearInterval(_delayTimer);
                    _delayTimer = null;
                }
            };

            // execute operation with a delay
            var _delayExec = function(obj, delta, timed)
            {
                _delayFinish();
                _delayTimer = window.setInterval(function(){
                    obj.trigger('mousewheel', {
                        'delta':delta,
                        'timed':timed
                    });
                }, timed);
            };

            // start a delayed operation
            var _delayStart = function (obj, delta, timed, pause)
            {
                _delayFinish();
                _delayTimer = window.setInterval(function(){
                    _delayExec(obj, delta, timed);
                }, pause);
            };

            // handle hover event
            var _hover = function(obj, hover){
                if (hover)
                {
                    $(obj).addClass('aciSb_over');
                    if (_lastSelected == obj)
                    {
                        $(obj).addClass('aciSb_sel');
                    }
                    // add aciSb_eover class for the parent bar
                    var parent = $(obj).parent();
                    if (parent.hasClass('aciSb_bar_v') || parent.hasClass('aciSb_bar_h'))
                    {
                        parent.addClass('aciSb_eover');
                    }
                    else
                    {
                        parent = parent.parent();
                        parent.addClass('aciSb_eover');
                    }
                }
                else
                {
                    $(obj).removeClass('aciSb_over').removeClass('aciSb_sel');
                    // remove aciSb_eover class for the parent bar
                    var parent = $(obj).parent();
                    if (parent.hasClass('aciSb_bar_v') || parent.hasClass('aciSb_bar_h'))
                    {
                        parent.removeClass('aciSb_eover');
                    }
                    else
                    {
                        parent = parent.parent();
                        parent.removeClass('aciSb_eover');
                    }
                }
            };

            // register arrow events
            var _initArrow = function(obj, delta){
                obj.bind('mouseover' + $.aciScrollBar.nameSpace, function(){
                    _hover(this, true);
                }).bind('mousemove' + $.aciScrollBar.nameSpace, function(){
                    _hover(this, true);
                }).bind('mouseout' + $.aciScrollBar.nameSpace, function(){
                    _delayFinish();
                    _hover(this, false);
                }).bind('mousedown' + $.aciScrollBar.nameSpace, function(){
                    _lastSelected = this;
                    $(this).trigger('mousewheel', {
                        'delta':delta,
                        'timer':_options.lineTimer
                    });
                    _delayStart($(this), delta, _options.lineTimer, _options.lineDelay);
                    $(this).addClass('aciSb_sel');
                }).bind('mouseup' + $.aciScrollBar.nameSpace, function(){
                    _unselect();
                }).bind('click' + $.aciScrollBar.nameSpace, function(){
                    _unselect();
                    return false;
                });
            };

            // bind arrow events for all bars
            _initArrow(_arrow_t, 1);
            _initArrow(_arrow_b, -1);
            _initArrow(_arrow_l, 1);
            _initArrow(_arrow_r, -1);

            // register track events
            var _initTrack = function(obj, delta)
            {
                obj.bind('mouseover' + $.aciScrollBar.nameSpace, function(){
                    _hover(this, true);
                }).bind('mousemove' + $.aciScrollBar.nameSpace, function(){
                    _hover(this, true);
                }).bind('mouseout' + $.aciScrollBar.nameSpace, function(){
                    _delayFinish();
                    _hover(this, false);
                }).bind('mousedown' + $.aciScrollBar.nameSpace, function(){
                    _lastSelected = this;
                    $(this).trigger('mousewheel', {
                        'delta':delta * ($this.height() / (_options.delta * 2)),
                        'timer':_options.lineTimer
                    });
                    _delayStart($(this).parent().parent(), delta * ($this.height() / _options.delta), _options.pageTimer, _options.pageDelay);
                    $(this).addClass('aciSb_sel');
                }).bind('mouseup' + $.aciScrollBar.nameSpace, function(){
                    _unselect();
                }).bind('click' + $.aciScrollBar.nameSpace, function(){
                    _unselect();
                    return false;
                });
            };

            // bind track events for all bars
            _initTrack(_track_t, 1);
            _initTrack(_track_b, -1);
            _initTrack(_track_l, 1);
            _initTrack(_track_r, -1);

            // register bar-space events
            var _initSpace = function(obj)
            {
                obj.bind('mouseover' + $.aciScrollBar.nameSpace, function(){
                    _hover(this, true);
                }).bind('mousemove' + $.aciScrollBar.nameSpace, function(){
                    _hover(this, true);
                }).bind('mouseout' + $.aciScrollBar.nameSpace, function(){
                    _delayFinish();
                    _hover(this, false);
                }).bind('mouseup' + $.aciScrollBar.nameSpace, function(){
                    _unselect();
                }).bind('click' + $.aciScrollBar.nameSpace, function(){
                    _unselect();
                    return false;
                });
            };

            // bind bar-space events for all bars
            _initSpace(_space_t);
            _initSpace(_space_b);
            _initSpace(_space_l);
            _initSpace(_space_r);

            // keep starting values
            var _gripStart = function(){
                _coords.start.x = _coords.curr.x;
                _coords.start.y = _coords.curr.y;
                _coords.ref.x = $(_container).scrollLeft();
                _coords.ref.y = $(_container).scrollTop();
            };

            // called when in scroll (with the mouse)
            var _gripScroll = function(){
                // check if it's the vertical bar
                if (_drag_vc.get(0) == _lastSelected)
                {
                    _bar_v.addClass('aciSb_eover');
                    _drag_vc.addClass('aciSb_sel');
                    var ref = _coords.ref.y;
                    var diff =  _coords.curr.y - _coords.start.y;
                    var ratio = _verticalRatio();
                    var top = (Math.abs(_coords.ref.y * ratio) + diff) / ratio;
                    _scrollVertically(top);
                }
                // check if it's the horizontal bar
                if (_drag_hc.get(0) == _lastSelected)
                {
                    _bar_h.addClass('aciSb_eover');
                    _drag_hc.addClass('aciSb_sel');
                    var ref = _coords.ref.x;
                    var diff =  _coords.curr.x - _coords.start.x;
                    var ratio = _horizontalRatio();
                    var left = (Math.abs(_coords.ref.x * ratio) + diff) / ratio;
                    _scrollHorizontally(left);
                }
            };

            // called after the scroll
            var _gripEnd = function(){
                _bar_v.removeClass('aciSb_eover');
                _drag_vc.removeClass('aciSb_sel');
                _bar_h.removeClass('aciSb_eover');
                _drag_hc.removeClass('aciSb_sel');
            };

            // register grip events
            var _initGrip = function(obj){
                obj.bind('mouseover' + $.aciScrollBar.nameSpace, function(){
                    _hover(this, true);
                }).bind('mousemove' + $.aciScrollBar.nameSpace, function(){
                    _hover(this, true);
                }).bind('mouseout' + $.aciScrollBar.nameSpace, function(){
                    _delayFinish();
                    _hover(this, false);
                }).bind('mousedown' + $.aciScrollBar.nameSpace, function(){
                    _lastSelected = this;
                    _delayFinish();
                    _gripStart();
                    $(this).addClass('aciSb_sel');
                }).bind('mouseup' + $.aciScrollBar.nameSpace, function(){
                    _unselect();
                }).bind('click' + $.aciScrollBar.nameSpace, function(){
                    _unselect();
                    return false;
                });
            };

            // bind grip events for all bars
            _initGrip(_drag_vc);
            _initGrip(_drag_hc);
			
			// keep track of swipe
			var _inSwipe = false;
			var _swipeMove = false;

			var _trackVswipe = function (e, phase){
				if (!e.touches)
				{
					return;
				}				
				switch (phase)
				{
					case 'start':
						_inSwipe = true;
						_delayFinish();
		                _coords.curr.x = e.touches[0].pageX;
    		            _coords.curr.y = e.touches[0].pageY;				
						_gripStart();
						break;
					case 'move':
						var now = new Date().getTime();
						if (!_swipeMove || (_swipeMove < now - 250))
						{
							_swipeMove = now;
							_inSwipe = true;
							_lastSelected = _drag_vc.get(0);
							_coords.curr.x = e.touches[0].pageX;
							_coords.curr.y = e.touches[0].pageY;
							_gripScroll();
						}
						break;
					case 'end':
					case 'cancel':
						_unselect();
  						_gripEnd();
						_inSwipe = false;
						_swipeMove = false;
						break;
				}
			};

			var _trackHswipe = function (e, phase){
				if (!e.touches)
				{
					return;
				}
				switch (phase)
				{
					case 'start':
     					_inSwipe = true;
						_delayFinish();
		                _coords.curr.x = e.touches[0].pageX;
    		            _coords.curr.y = e.touches[0].pageY;				
						_gripStart();
						break;
					case 'move':
						var now = new Date().getTime();
						if (!_swipeMove || (_swipeMove < now - 250))
						{
							_swipeMove = now;
							_inSwipe = true;
							_lastSelected = _drag_hc.get(0);
							_coords.curr.x = e.touches[0].pageX;
							_coords.curr.y = e.touches[0].pageY;
							_gripScroll();
						}
						break;
					case 'end':
					case 'cancel':
						_unselect();
  						_gripEnd();
						_inSwipe = false;
						_swipeMove = false;
						break;
				}
			};			
			
			var _resizeSwipe = function (e, phase){
				if (!e.touches)
				{
					return;
				}
				switch (phase)
				{
					case 'start':
     					_inSwipe = true;
						_delayFinish();
		                _coords.curr.x = e.touches[0].pageX;
    		            _coords.curr.y = e.touches[0].pageY;				
						_resizeStart();
						break;
					case 'move':
						var now = new Date().getTime();
						if (!_swipeMove || (_swipeMove < now - 250))
						{
							_swipeMove = now;
							_inSwipe = true;
							_lastSelected = _resize.get(0);
							_coords.curr.x = e.touches[0].pageX;
							_coords.curr.y = e.touches[0].pageY;
							_resizeMove();
						}
						break;
					case 'end':
					case 'cancel':
						_unselect();
						_inSwipe = false;
						_swipeMove = false;
						break;
				}
			};					

			if (typeof $.fn.swipe != 'undefined')
			{
				// bind bar & resizer swipe events
				_track_v.swipe({ swipeStatus: _trackVswipe, threshold: 5, fingers: 1, allowPageScroll: 'none' });
				_track_h.swipe({ swipeStatus: _trackHswipe, threshold: 5, fingers: 1, allowPageScroll: 'none' });
				_resize.swipe({ swipeStatus: _resizeSwipe, threshold: 5, fingers: 1, allowPageScroll: 'none' });
			}

            // keep focus state
            var _focus = false;

            if (_options.bindKeyboard)
            {
                // keyboard handling
                $this.bind('keydown' + $.aciScrollBar.nameSpace, function(e){
                    if (!_focus)
                    {
                        // do not handle if we do not have focus
                        return;
                    }
                    switch (e.which)
                    {
                        case 38: // up
                            _arrow_t.trigger('mousedown').trigger('mouseup');
                            return false;
                        case 40: // down
                            _arrow_b.trigger('mousedown').trigger('mouseup');
                            return false;
                        case 37: // left
                            _arrow_l.trigger('mousedown').trigger('mouseup');
                            return false;
                        case 39: // right
                            _arrow_r.trigger('mousedown').trigger('mouseup');
                            return false;
                        case 33: // pgup
                            _track_t.trigger('mousedown').trigger('mouseup');
                            return false;
                        case 34: // pgdown
                            _track_b.trigger('mousedown').trigger('mouseup');
                            return false;
                        case 36: // home
                            _scrollVertically(0);
                            _scrollHorizontally(0);
                            return false;
                        case 35: // end
                            _scrollVertically(_contentHeight());
                            _scrollHorizontally(0);
                            return false;
                    }
                });
            }

            // just make sure we are done with the mouse
            $('html').bind('mouseup' + $.aciScrollBar.nameSpace + '-' + _index, function(){
                _unselect();
                _gripEnd();
            }).bind('mousemove' + $.aciScrollBar.nameSpace + '-' + _index, function(e){
                _coords.curr.x = e.pageX;
                _coords.curr.y = e.pageY;
                if (_lastSelected)
                {
                    _gripScroll();
                    _resizeMove();
                }
            }).bind('mouseout' + $.aciScrollBar.nameSpace + '-' + _index, function(e){
                if (!e.relatedTarget)
                {
                    _unselect();
                    _gripEnd();
                }
            });

            // get contained element position
            var _elementPos = function(obj){
                var pos = obj.position();
                var top = $(_container).scrollTop() + pos.top;
                var left = $(_container).scrollLeft() + pos.left;
                return {
                    'top':top,
                    'left':left
                };
            };

            // get numeric value
            var _getNumeric = function (value, from){
                if (typeof value == 'string')
                {
                    var ret = null;
                    var rex = new RegExp('^([0-9]+)%$');
                    if (ret = rex.exec(value))
                    {
                        value = Math.round(from * parseFloat(ret[1]) / 100);
                    }
                    else
                    {
                        rex = new RegExp('^([0-9]+)$');
                        if (ret = rex.exec(value))
                        {
                            value = Math.abs(parseInt(ret[1]));
                        }
                    }
                }
                return value;
            }

            // keep timer reference
		    var _update = null;
			var _inUpdate = false;

            // bind event handlers to respond to
            $this.bind('focus' + $.aciScrollBar.nameSpace, function(){
                _focus = true;
            }).bind('blur' + $.aciScrollBar.nameSpace, function(){
                _focus = false;
            }).bind('lineup' + $.aciScrollBar.nameSpace, function(){
                _arrow_t.trigger('mousedown').trigger('mouseup');
                return false;
            }).bind('pageup' + $.aciScrollBar.nameSpace, function(){
                _track_t.trigger('mousedown').trigger('mouseup');
                return false;
            }).bind('linedown' + $.aciScrollBar.nameSpace, function(){
                _arrow_b.trigger('mousedown').trigger('mouseup');
                return false;
            }).bind('pagedown' + $.aciScrollBar.nameSpace, function(){
                _track_b.trigger('mousedown').trigger('mouseup');
                return false;
            }).bind('lineleft' + $.aciScrollBar.nameSpace, function(){
                _arrow_l.trigger('mousedown').trigger('mouseup');
                return false;
            }).bind('pageleft' + $.aciScrollBar.nameSpace, function(){
                _track_l.trigger('mousedown').trigger('mouseup');
                return false;
            }).bind('lineright' + $.aciScrollBar.nameSpace, function(){
                _arrow_r.trigger('mousedown').trigger('mouseup');
                return false;
            }).bind('pageright' + $.aciScrollBar.nameSpace, function(){
                _track_r.trigger('mousedown').trigger('mouseup');
                return false;
            }).bind('scroll' + $.aciScrollBar.nameSpace, function(e, data){
                if (typeof data != 'object')
                {
                    return false;
                }
				if (typeof data.element != 'undefined')
				{
				   // scroll to element inside the content with animation
				   var obj = $(data.element);
					if (obj.get(0) && $this.has(obj.get(0)))
					{
						var pos = _elementPos(obj);
						var center = ((typeof data.center != 'boolean') ? true : data.center);
						if (center)
						{
							if (obj.width() < $this.width() - _bar_v.width())
							{
								pos.left -= Math.round($this.width() / 2 - obj.width() / 2);
							}
							if (obj.height() < $this.height() - _bar_h.height())
							{
								pos.top -= Math.round($this.height() / 2 - obj.height() / 2);
							}
						}
						var offsety = (data.offsety ? parseInt(data.offsety) : 0);
						if (Math.abs($(_container).scrollTop() - Math.abs(pos.top)) >= offsety)
						{
							if (data.animate)
							{
								$(_container).animate({
									'scrollTop': pos.top
								}, {
									duration: _getNumeric(data.duration),
									easing: data.animate,
									complete: function(){
										$this.trigger('scroll');
										_initVerticals();
									},
									step: function(){
										_initVerticals();
									}
								});
							}
							else
							{
								_scrollVertically(pos.top);
							}
						}
						var offsetx = (data.offsetx ? parseInt(data.offsetx) : 0);
						if (Math.abs($(_container).scrollLeft() - Math.abs(pos.left)) >= offsetx)
						{
							if (data.animate)
							{
								$(_container).animate({
									'scrollLeft': pos.left
								}, {
									duration: _getNumeric(data.duration),
									easing: data.animate,
									complete: function(){
										$this.trigger('scroll');
										_initHorizontals();
									},
									step: function(){
										_initHorizontals();
									}
								});
							}
							else
							{
								_scrollHorizontally(pos.left);
							}
						}
					}					
					return false;
				}
                if (typeof data.top != 'undefined')
                {
	                // scroll to top with animation
                    var top = _getNumeric(data.top, _contentHeight() - $this.height() + _bar_h.height());
                    if (data.animate)
                    {
                        $(_container).animate({
                            'scrollTop': top
                        }, {
                            duration: _getNumeric(data.duration),
                            easing: data.animate,
                            complete: function(){
                                $this.trigger('scroll');
                                _initVerticals();
                            },
                            step: function(){
                                _initVerticals();
                            }
                        });
                    }
                    else
                    {
                        _scrollVertically(top);
                    }
                }
                if (typeof data.left != 'undefined')
                {
					// scroll to left with animation
                    var left = _getNumeric(data.left, _contentWidth() - $this.width() + _bar_v.width());
                    if (data.animate)
                    {
                        $(_container).animate({
                            'scrollLeft': left
                        }, {
                            duration: _getNumeric(data.duration),
                            easing: data.animate,
                            complete: function(){
                                $this.trigger('scroll');
                                _initHorizontals();
                            },
                            step: function(){
                                _initHorizontals();
                            }
                        });
                    }
                    else
                    {
                        _scrollHorizontally(left);
                    }
                }
                return false;
            }).bind('update' + $.aciScrollBar.nameSpace, function(e, force){
				if (_inUpdate)
				{
					return false;
				}
				if (_inSwipe)
				{
					_doUpdate(500);
					return false;
				}
				_inUpdate = true;
                var sized = ($this.data('width' + $.aciScrollBar.nameSpace) != $this.width()) || ($this.data('height' + $.aciScrollBar.nameSpace) != $this.height());
                var width = $this.data('scrollWidth' + $.aciScrollBar.nameSpace);
                var height = $this.data('scrollHeight' + $.aciScrollBar.nameSpace);
                if (sized || (width != _contentWidth()) || (height != _contentHeight()) ||
                    ($this.data('paddingLeft' + $.aciScrollBar.nameSpace) != $this.css('padding-left')) || ($this.data('paddingTop' + $.aciScrollBar.nameSpace) != $this.css('padding-top')) || force)
                    {
                    var top = $(_container).scrollTop();
                    var left = $(_container).scrollLeft();
                    _initContainer();
                    // check if we should reposition to keep in view
                    if (sized && ((_contentHeight() != height) || (_contentWidth() != width)))
                    {
                        _container.get(0).scrollTop = Math.round(_contentHeight() * top / height);
                        _container.get(0).scrollLeft = Math.round(_contentWidth() * left / width);
                        $this.trigger('scroll');
                    }
					_doUpdate(10);
                }
				else
				{
					_doUpdate(200);
				}
				_initVerticals();
  				_initHorizontals();
				_inUpdate = false;
                return false;
            });
			
			var _doUpdate = function(timeout){
				if (_update)
				{
					window.clearTimeout(_update);
				}
				_update = window.setTimeout(function(){
					if ($this.data('customUi' + $.aciScrollBar.nameSpace))
					{
						if (_inUpdate)
						{
							return;
						}
						$this.trigger('update');
						return;
					}
				}, timeout);
			};

			_doUpdate(200);

            // set initial position
            $this.trigger('scroll', {
                top: Math.round(_contentHeight() * _scroll.top / _scroll.height),
                left: Math.round(_contentWidth() * _scroll.left / _scroll.width),
				animate: true,
				duration: 0
            });

            // trigger ready event
            $this.trigger('ready');

        }; // end _customUi

        // init the control
        return _initUi();

    };

    // unbind all events
    $(window).bind('unload' + $.aciScrollBar.nameSpace, function(){
        $('*').unbind($.aciScrollBar.nameSpace);
        for (var i = 1; i <= $.aciScrollBar.index; i++)
        {
            $('*').unbind($.aciScrollBar.nameSpace + '-' + i);
        }
    });

})(jQuery);
