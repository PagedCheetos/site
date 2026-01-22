$.fn.extend({
	visible: function( data ) {
		var docViewTop = $(window).scrollTop();
		var docViewBottom = docViewTop + $(window).height();
		var elemTop = $(this).offset().top;
		var elemBottom = elemTop + $(this).outerHeight();
		return ((docViewBottom >= elemTop) && (elemBottom >= docViewTop));
	}
});

(function($) {
	var $event = $.event;
	var $special;
	var resizeTimeout;
	$special = $event.special.debouncedresize = {
		setup: function() {
			$( this ).on( 'resize', $special.handler );
		},
		teardown: function() {
			$( this ).off( 'resize', $special.handler );
		},
		handler: function( event, execAsap ) {
			var context = this;
			var args = arguments;
			var dispatch = function() {
				event.type = 'debouncedresize';
				$event.dispatch.apply( context, args );
			};
			if ( resizeTimeout ) { clearTimeout( resizeTimeout ); }
			execAsap ? dispatch() : resizeTimeout = setTimeout( dispatch, $special.threshold );
		},
		threshold: 150
	};
})(jQuery);

function recalcParallax($item, rules) {
	var cssScroll = $(window).scrollTop();
	for (i = 0; i < (rules.length - 1); i++) {
		var cssRule = rules[i].split(':');
		var cssAttr = cssRule[0];
		var cssVal = cssRule[1];
		if (cssVal.indexOf('px') > 0) {
			cssVal = cssVal.replace('px', '') * cssScroll + 'px';
			$item.css(cssAttr, cssVal);
		} else {
			cssVal = cssVal * cssScroll;
			if ( cssAttr === 'opacity' && cssVal >= 1 ) cssVal = 1;
			if ( cssAttr === 'opacity' && cssVal <= 0 ) cssVal = 0;
			$item.css(cssAttr, cssVal);
		}
	}
}

function retestVisibility($targ) {
	var args = $targ.attr('data-visible').split('--');
	var $item = $( args[0] );
	var itemVis = args[0].replace('.', '') + '--' + args[1];
	var itemHid = (args.length > 2) ? args[0].replace('.', '') + '--' + args[2] : false;
	var blnVis = $targ.visible();
	if (blnVis && !$item.hasClass( itemVis )) { $item.addClass(itemVis); if (itemHid) $item.removeClass(itemHid); }
	else if (!blnVis && $item.hasClass( itemVis )) { $item.removeClass(itemVis); if (itemHid) $item.addClass(itemHid); }
	else if (itemHid && !blnVis && !$item.hasClass( itemHid )) { $item.removeClass(itemVis).addClass(itemHid); }
}

function resizeImage($img, $fill) {
	if ($img.attr('src') !== undefined) {
		var $clone = new Image();
		$clone.onload = function() {
			var imgRatio = $clone.width / $clone.height;
			var imgWidth = $fill.width() + 10;
			var imgHeight = $fill.height() + 10;
			$clone = null;
			if ((parseInt(imgWidth / imgRatio)) < imgHeight) {
				$img.css({
					'width' : parseInt(imgHeight * imgRatio) + 'px',
					'height' : parseInt(imgHeight) + 'px',
					'opacity' : 1,
					'position' : 'absolute',
					'top' : '50%',
					'left' : '50%',
					'margin-top' : '-' + parseInt(imgHeight / 2) + 'px',
					'margin-left' : '-' + parseInt((imgHeight * imgRatio) / 2) + 'px'
				});
			} else {
				$img.css({
					'width' : parseInt(imgWidth) + 'px',
					'height' : parseInt(imgWidth / imgRatio) + 'px',
					'opacity' : 1,
					'position' : 'absolute',
					'top' : '50%',
					'left' : '50%',
					'margin-top' : '-' + parseInt((imgWidth / imgRatio) / 2) + 'px',
					'margin-left' : '-' + parseInt(imgWidth / 2) + 'px'
				});
			}
		}
		$clone.src = $img.attr('src');
	}
}

$(window).on('load debouncedresize scroll', function( event ) {
	$('*[data-parallax]').each(function() { recalcParallax( $(this), $(this).attr('data-parallax').split(';') ) });
	$('*[data-visible]').each(function() { retestVisibility( $(this) ) });
});

$(document).on('load', 'img[data-fill]', function( event ) {
	resizeImage( $(this), $( $(this).attr('data-fill') ) );
});

$(window).on('load resize', function( event ) {
	$('img[data-fill]').each(function() {
		resizeImage( $(this), $( $(this).attr('data-fill') ) );
		$(document).off('load', $(this));
	});
});

var $viewport = $('html, body');

$viewport.on('scroll mousedown DOMMouseScroll mousewheel keyup', function( event ) {
	if (event.which > 0 || event.type === 'mousedown' || event.type === 'mousewheel') {
		$viewport.stop();
	}
});

$('a[data-scroll]').on('click', function( event ) {
	// TODO : Introduce Mason settings to define scroll offsets.
	event.preventDefault();
	var $btn = $(this);
	var $anchor = ($( $btn.attr('data-scroll') ).length > 0) ? $( $btn.attr('data-scroll') ) : $('a[name=' + $btn.attr('data-scroll').replace('#', '') + ']');
	var intScroll = $anchor.offset().top;
	var intSpeed = intScroll - $(document).scrollTop();
	if (intSpeed < 0) intSpeed = -(intSpeed);
	$viewport.animate({ 'scrollTop': intScroll + 'px' }, { duration: intSpeed });
});

$('button[data-toggle]').on('click', function( event ) {
	var args = $(this).attr('data-toggle').split('--');
	var $block = $( args[0] + (args.length > 2 ? '--' + args[1] : '') );
	$block.toggleClass( args[0].replace('.', '') + '--' + args[ args.length - 1 ] );
});

$('button[data-add]').on('click', function( event ) {
	var args = $(this).attr('data-add').split('--');
	var $block = $( args[0] + (args.length > 2 ? '--' + args[1] : '') );
	$block.addClass( args[0].replace('.', '') + '--' + args[ args.length - 1 ] );
});

$('button[data-remove]').on('click', function( event ) {
	var args = $(this).attr('data-remove').split('--');
	var $block = $( args[0] + (args.length > 2 ? '--' + args[1] : '') );
	$block.removeClass( args[0].replace('.', '') + '--' + args[ args.length - 1 ] );
});

$('button[data-tab]').on('click', function( event ) {
	var args = $(this).attr('data-tab').split('--');
	if ($( args[0] + '--' + args[1] ).hasClass( args[0].replace('.', '') + '--' + args[ args.length - 1 ] )) {
		$( args[0] ).removeClass( args[0].replace('.', '') + '--' + args[ args.length - 1 ] );
	} else {
		$( args[0] ).removeClass( args[0].replace('.', '') + '--' + args[ args.length - 1 ] );
		$( args[0] + '--' + args[1] ).addClass( args[0].replace('.', '') + '--' + args[ args.length - 1 ] );
	}
});

$('body').on('click', 'menu[data-select]>ul', function( event ) {
	event.stopPropagation();
});

$('body').on('click', 'menu[data-select]>div', function( event ) {
	event.stopPropagation();
	var select = $(this).parent('menu');
	var openSelect = function() { select.addClass('ui_select--selected'); $('body').on( 'click', closeSelect ); }
	var closeSelect = function() { select.removeClass('ui_select--selected'); $('body').off( 'click', closeSelect ); }
	select.hasClass('ui_select--selected') ? closeSelect() : openSelect();
});

addScript = function(url, callback) {
	var newScript = document.createElement('script'),
		loaded;

	if (callback) {
		newScript.onload = function() {
			if (!loaded) {
				callback();
			}
			loaded = true;
		};
	}

	if (document.getElementById(simpleHash(url)) == null) {
		document.body.appendChild(newScript);
		newScript.setAttribute('src', url);
		newScript.setAttribute('id', simpleHash(url));
	} else {
		if (callback) {
			callback();
		}
	}
};

simpleHash = function(strData) {
	var tmp = 0;
	for (var i = 0; i < strData.length; i++) {
		tmp = tmp + (strData.charCodeAt(i) * ((i + 1) + 255) + (i + 1));
	}

	return tmp.toString(16).toUpperCase();
};

String.prototype.ucwords = function() {
    return this.replace(/\w\S*/g, function(txt) {
       return txt.ucfirst();
    });
};

String.prototype.ucfirst = function() {
    return this.charAt(0).toUpperCase() + this.substr(1).toLowerCase();
};

lightOrDark = function(testColour) {
	if (typeof testColour === 'string' && testColour.match(/^#/)) {
		testColour = hexToRgb(testColour);
	} else if (typeof testColour === 'string' && testColour.match(/^rgb/)) {
		var rgb = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/i.exec(testColour);

		testColour = {
			red: parseInt(rgb[1]),
			green: parseInt(rgb[2]),
			blue: parseInt(rgb[3])
		};
	}

	var brightness = (testColour.red * 299 + testColour.green * 587 + testColour.blue * 114) / 1000;

	if (brightness > 180) {
		return 'light';
	}

	return 'dark';

};

contrastRatio = function(strColor1, strColor2) {
	var objColours = {};
	objColours[1] = hexToRgb(strColor1);
	objColours[2] = hexToRgb(strColor2);
	
	for (const color in objColours){
		var a = [objColours[color]['red'], objColours[color]['green'], objColours[color]['blue']].map(function (v) {
			v /= 255;
			return v <= 0.03928
				? v / 12.92
				: Math.pow( (v + 0.055) / 1.055, 2.4 );
		});
		objColours[color] = a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
	}
	
	var brightest = Math.max(objColours[1], objColours[2]),
		darkest = Math.min(objColours[1], objColours[2]);
	
	return (brightest + 0.05) / (darkest + 0.05);
};

hexToRgb = function(hex) {
	var shorthangRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthangRegex, function(m, r, g, b) {
		return r + r + g + g + b + b;
	});

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

	return result ? {
		red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16)
	} : null;
};

mt = function(name, domain, subject, body) {
	var href = 'mailto:' + name + '@' + domain;
	body = body.replace(/<br>/g, '%0A');
	if (subject) {
		href += '?subject=' + subject;
	}

	if (body) {
		if (subject) {
			href += '&';
		} else {
			href += '?';
		}

		href += 'body=' + body;
	}
	location.href = href;
};

getDayName = function(intDay, abbrev) {
	var dayNames = ['','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday','Sunday'],
		shortDayNames = ['','Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ];
	return abbrev ? shortDayNames[intDay] : dayNames[intDay];
};

Number.prototype.padding = function(size) {
	var s = String(this);
	while (s.length < (size || 2 )) {
		s = '0' + s;
	}

	return s;
};

if (!Array.prototype.findIndex) {
	Object.defineProperty(Array.prototype, 'findIndex', {
		value: function(predicate) {
			// 1. Let O be ? ToObject(this value).
			if (this == null) {
				throw new TypeError('"this" is null or not defined');
			}

			var o = Object(this);

			// 2. Let len be ? ToLength(? Get(O, "length")).
			var len = o.length >>> 0;

			// 3. If IsCallable(predicate) is false, throw a TypeError exception.
			if (typeof predicate !== 'function') {
				throw new TypeError('predicate must be a function');
			}

			// 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
			var thisArg = arguments[1];

			// 5. Let k be 0.
			var k = 0;

			// 6. Repeat, while k < len
			while (k < len) {
			// a. Let Pk be ! ToString(k).
			// b. Let kValue be ? Get(O, Pk).
			// c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
			// d. If testResult is true, return k.
				var kValue = o[k];
				if (predicate.call(thisArg, kValue, k, o)) {
					return k;
				}
			// e. Increase k by 1.
				k++;
			}

			// 7. Return -1.
			return -1;
		},
		configurable: true,
		writable: true
	});
}

var DateDiff = {
	inDays: function(startDate, endDate) {
		var startTime = startDate.getTime(),
			endTime = endDate.getTime();

		return parseInt((endTime - startTime) / (24 * 3600 * 1000));
	},

	inWeeks: function(startDate, endDate) {
		var startTime = startDate.getTime(),
			endTime = endDate.getTime();

		return parseInt((endTime - startTime) / (24 * 3600 * 1000 * 7));
	},

	inMonths: function(startDate, endDate) {
		var startYear = startDate.getFullYear(),
			endYear = endDate.getFullYear(),
			startMonth = startDate.getMonth(),
			endMonth = endDate.getMonth();

		return (endMonth + 12 * endYear) - (startMonth + 12 * startYear);
	},

	inYears: function(startDate, endDate) {
		return endDate.getFullYear() - startDate.getFullYear();
	}
}

function printElement(element, printCss) {
	var strHtml = '';
	if (typeof (element) === 'string') {
		strHtml = element;
	} else {
		strHtml = $(element).clone()[0].outerHTML;
	}
	var blnAfterPrint = typeof (window.onafterprint) === 'function' || typeof (window.onafterprint) === 'object',
		blnIos = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
	if (blnAfterPrint || blnIos) {
		if ($('#print_me').length < 1) $('body').append('<div id="print_me"></div>');
		$('#print_me').append(strHtml);
		$('body').addClass('printing');
		window.print();
		if (blnIos) {
			setTimeout(function() {
				printElementAfter();
			}, 1000);
		}
	} else {
		var newWindow = window.open();
		newWindow.document.write('<html><head><title>Printing</title><link rel="stylesheet" href="' + printCss + '"></head><body class="printing"><div id="print_me">' + strHtml + '</div></body>');
		newWindow.print();
		setTimeout(function () {
			newWindow.close();
		}, 300);
	}
}
if (typeof (window.onafterprint) === 'function' || typeof (window.onafterprint) === 'object') {
	window.addEventListener("afterprint", printElementAfter);
}
function printElementAfter() {
	$('body').removeClass('printing');
	$('#print_me').empty();
}

function loadJSFile(strJSPath, callback) {
	var i,
		src;
	if (!strJSPath) {
		return;
	}

	if (!Array.isArray(strJSPath)) {
		strJSPath = [strJSPath];
	}
	for (i = 0; i < strJSPath.length; i++) {
		src = strJSPath[i];
		if (loadedJS[src]) {
			return;
		} else if (document.querySelectorAll('script[src*="' + src.replace(/\?.*?$/, '') + '"]').length > 0) {
			loadedJS[src] = true;
			return;
		}

		var scriptTag = document.createElement("script");
		scriptTag.setAttribute("src", src);
		if (callback) {
			scriptTag.onload = function() {
				callback();
			}
		}
		document.getElementsByTagName("head")[0].appendChild(scriptTag);
		loadedJS[src] = true;
	}
}
function loadCSSFile(strCSSPath) {
	var i,
		src;
	if (!strCSSPath) {
		return;
	}

	if (!Array.isArray(strCSSPath)) {
		strCSSPath = [strCSSPath];
	}

	for (i = 0; i < strCSSPath.length; i++) {
		src = strCSSPath[i]
		if (loadedCSS[src]) {
			return;
		}

		var linkTag = document.createElement("link")
		linkTag.setAttribute("rel", "stylesheet")
		linkTag.setAttribute("href", src)

		document.getElementsByTagName("head")[0].appendChild(linkTag);
		loadedCSS[src] = true;
	}
}

var strYouTubeIframeAPI = "https://www.youtube.com/iframe_api",
	strVimeoPlayerAPI = "https://player.vimeo.com/api/player.js";

// Youtube functions for MASON feed
// Custom youtube function used so it does not affect already built sites
var objYoutubeApi, objYoutubeApiMap;
function onYouTubeMasonAPIReady() {
	setTimeout(function() {
		if (loadedJS[strYouTubeIframeAPI] === undefined) {
			loadJSFile(strYouTubeIframeAPI, function() {
				YT.ready(function() {
					onYouTubeMasonAPIReadyRun();
				});
			});
		} else {
			onYouTubeMasonAPIReadyRun();
		}
	}, 1);
}
function onYouTubeMasonAPIReadyRun() {
	objYoutubeApi = {
		items: [],
		onReady: function() {},
		onStateChange: function(event, data) {
			if (event.data === 1) {
				for (var i = 0; i < objYoutubeApi.items.length; i++) {
					if (objYoutubeApi.items[i].youtube.pauseVideo && data.videoID !== objYoutubeApi.items[i].videoID) {
						objYoutubeApi.items[i].youtube.pauseVideo();
					}
				}
			}
		},
		onPageChange: function() {}
	};
	objYoutubeApiMap = {};
	var arrNew = [];
	for(var i = 0; i< objYoutubeApi.items.length; i++) {
		if ($('#' + objYoutubeApi.items[i].id).length > 0) {
			arrNew.push(objYoutubeApi.items[i]);
		} else {
			delete objYoutubeApiMap[objYoutubeApi.items[i].id];
		}
	}
	objYoutubeApi.items = arrNew;
	
	$('*[data-youtube-pagination]').off('click').on('click', function(event) {
		event.preventDefault();
		var objPrev = $('#' + $(this).attr('data-youtube-id') + '-button-prev'),
			objNext = $('#' + $(this).attr('data-youtube-id') + '-button-next'),
			objDummy = $('#' + $(this).attr('data-youtube-id') + '-dummy'),
			objList = $('#' + $(this).attr('data-youtube-id') + '-list'),
			objData = objDummy.data();

		objList.html('<p style="text-align:center;">Loading</p>');
		objPrev.css('display', 'none');
		objNext.css('display', 'none');
		$.get('/_includes/code/scripts/get_youtube.asp', {
			elementID: $(this).attr('data-youtube-id'),
			type: objData.type,
			api: objData.api,
			page: $(this).attr('data-youtube-pagination'),
			channelid: objData.channelid,
			playlistid: objData.playlistid,
			order: objData.order,
			limit: objData.limit,
			sortlogic: objData.sortlogic,
			order: objData.order,
			orderdirection: objData.orderdirection,

		}, function(data) {
			if (typeof data === 'string') data = JSON.parse(data);
			var strReturn = '';
			for(var iData = 0; iData < data.length; iData++) {
				var strHtml = objDummy.html();
				var arrKeys = Object.keys(data[iData]);
				for(var iKey = 0; iKey < arrKeys.length; iKey++) {
					var strReplace = '{' + arrKeys[iKey] + '}',
						objReplace = new RegExp(strReplace,'g');
					strHtml = strHtml.replace(objReplace, data[iData][arrKeys[iKey]]);
					strReplace = '{' + arrKeys[iKey] + ':safe}';
					objReplace = new RegExp(strReplace,'g');
					strHtml = strHtml.replace(objReplace, String(data[iData][arrKeys[iKey]]).replace(/\"/g, '\"'));
				}
				strHtml = strHtml.replace(/\{item_youtube_id\}/g, data[iData]['item_youtube_id']);
				strReturn += strHtml;
			}
			objList.html(strReturn);
			if (data[0].item_prev_button) {
				objPrev.after(data[0].item_prev_button).remove();
			}
			if (data[0].item_next_button) {
				objNext.after(data[0].item_next_button).remove();
			}
			onYouTubeMasonAPIReadyRun();
		});
	});

	loadVideoAll($('*[data-youtube-lazy]'));
	
	function loadVideoAll(objLoop) {
		objLoop.each(function() {
			var objTop = $(this),
				objClick = objTop.find('*[data-video]'),
				blnLazy = objTop.attr('data-youtube-lazy') === 'true';

			objTop.find('*[data-youtube-iframe]').each(function() {
				var objThis = $(this),
					objCookie = objThis.find('.youtube_no_cookie');
					
				if (!objYoutubeApiMap[objThis.attr('id')]) {
					objYoutubeApiMap[objThis.attr('id')] = objYoutubeApi.items.length;
					var objPush = {
						id: objThis.attr('id'),
						videoID: objThis.attr('data-youtube-iframe'),
						loaded: false,
						youtube: {
							playVideo: function() {
								loadVideo(objThis.attr('id'), blnLazy);
							},
						},
						forceLoad: function() {
							loadVideo(objThis.attr('id'), blnLazy);
						}
					};
					objYoutubeApi.items.push(objPush);
				}
				if (!blnLazy && !objYoutubeApi.items[objYoutubeApiMap[objThis.attr('id')]].loaded) {
					if (objCookie.length > 0 && !$.cookie.allowed()) {
						objCookie.addClass('active').find('.youtube_no_cookie_button').on('click', function(event) {
							event.preventDefault();
							$('.youtube_no_cookie').remove();
							loadVideoAll($('*[data-youtube-lazy="false"]'));
						});
					} else {
						$('.youtube_no_cookie').remove();
						loadVideo(objThis.attr('id'), blnLazy);
					}
				}
			});

			if (blnLazy) {
				objTop.find('.youtube_no_cookie').hide();
				objClick.on('click', function(event) {
					event.preventDefault();
					var objPlay = $(this),
						objVideo = objTop.find('#' + $(this).attr('data-video')),
						objCookie = objTop.find('.youtube_no_cookie');
					if (objVideo.length > 0) {
						if (objCookie.length > 0 && !$.cookie.allowed()) {
							objCookie.show().addClass('active').find('.youtube_no_cookie_button').on('click', function(event) {
								event.preventDefault();
								$('.youtube_no_cookie').remove();
								loadVideo($('#' + objPlay.attr('data-video')).attr('id'), blnLazy);
							});
						} else {	
							$('.youtube_no_cookie').remove();
							loadVideo($('#' + objPlay.attr('data-video')).attr('id'), blnLazy);
						}
					} else {
						console.error('Unable to find data attribute [data-video]');
					}
				});
			}
		});

	}
	
	function loadVideo(strID, blnLazy) {
		var objItem = objYoutubeApi.items[objYoutubeApiMap[strID]];
		if (objItem.loaded) {
			objItem.youtube.playVideo();
		} else {
			objItem.youtube = new YT.Player(strID, {
				videoId: objItem.videoID,
				playerVars: {
					autoplay: blnLazy ? 1 : 0,
					allow: 'autoplay; encrypted-media',
					allowfullscreen: 1,
					showinfo: 0,
					modestbranding: 1,
					rel: 0
				},
				events: {
					onReady: function(event) {
						objItem.loaded = true;
						objYoutubeApi.onReady(event, objItem);
					},
					onStateChange: function(event) {
						objYoutubeApi.onStateChange(event, objItem);
					},
				}
			});
		}
	}
}

// Used in conjunction with MasonVideoController
var masonVideos = {
		mason: document.querySelector('.mason'),
		arrVideos: [],
		blnResizeObs: 'ResizeObserver' in window,
		blnIntersectObs: 'IntersectionObserver' in window,
		initYTPlayers: function(objVideo, callback){
			// we can't use the onYouTubeIframeAPIReady callback as this may clash with custom video work, so we must check if API script exists and wait for load
			if ($('script[src="' + strYouTubeIframeAPI + '"]').length == 0) {
				loadJSFile(strYouTubeIframeAPI);
			}
			var checkApiReady = setInterval(function(){
					if (typeof YT == 'object'){
						if (YT.loaded == 1){
							setTimeout(function(){
								clearInterval(checkApiReady);
								createYouTubePlayer(objVideo);
							}, 0)
						}
					}
				}, 50);

			function createYouTubePlayer(objVideo) {
				var strFormattedVideoSource = masonVideos.formatYouTubeURL(objVideo.opts.source),
					objYtDefaults = {
						'color': 'white',
						'playlist': strFormattedVideoSource, // required for looping to work
						'modestbranding': 1,
						'rel': 0 // works for unlisted videos
					}
				objVideo.opts.autoplay = objVideo.opts.autoplay ? 1 : 0;
				objVideo.opts.controls = objVideo.opts.controls ? 1 : 0;
				objVideo.opts.loop = objVideo.opts.loop ? 1 : 0;
				objVideo.opts.mute = objVideo.opts.mute ? 1 : 0;
				objVideo.opts = {...objVideo.opts, ...objYtDefaults};
				
				objVideo.element.insertAdjacentHTML("beforeend", "<div id='ytplayer_" + objVideo.id + "'></div>");
				objVideo.player = new YT.Player("ytplayer_" + objVideo.id, {
					videoId: strFormattedVideoSource,
					height: "100%",
					width: "100%",
					playerVars: objVideo.opts,
					events: {
						'onReady': function(event){
							callback({
								'state': 'ready',
								'video': objVideo
							});
							masonVideos.setVideoVisibility(objVideo);
						},
						'onStateChange': function(event){
							event.data == YT.PlayerState.ENDED && callback({
								'state': 'end',
								'video': objVideo
							});
						}
					}
				});
				masonVideos.setVideoFill(objVideo);
				masonVideos.setVideoCustomControls(objVideo);
				masonVideos.arrVideos.push(objVideo);
			}
		},
		formatYouTubeURL: function(strURL) {
			var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/,
				strMatch = strURL.match(regExp);
			if (strMatch && strMatch[7].length == 11){
				strMatch = strMatch[7];
			} else {
				console.info('Warning YouTube Link is incorrect on player: ' + strURL);
				strMatch = false;
			}
			return strMatch;
		},
		initVimeoPlayers: function(objVideo, callback){
			if ($('script[src="' + strVimeoPlayerAPI + '"]').length == 0) {
				loadJSFile(strVimeoPlayerAPI);
			}
			var checkApiReady = setInterval(function(){
				if (typeof Vimeo == 'object'){
					setTimeout(function(){
						clearInterval(checkApiReady);
						createVimeoPlayer(objVideo);
					}, 0)
				}
			}, 50);

			function createVimeoPlayer(objVideo) {
				var objVimeoDefaults = {
					'byline': false,
					'playsinline': objVideo.opts.mute,
					'portrait': false,
					'title': false
				}
				objVideo.opts.url = objVideo.opts.source;
				objVideo.opts.muted = objVideo.opts.mute;
				objVideo.opts = {...objVideo.opts, ...objVimeoDefaults};

				objVideo.element.setAttribute('id', 'vimeoplayer_' + objVideo.id);
				objVideo.player = new Vimeo.Player('vimeoplayer_' + objVideo.id, objVideo.opts);

				// fix for volume retrieval
				objVideo.opts.mute && (objVideo.player.setVolume(0));

				// state callbacks
				objVideo.player.on('loaded', function() {
					callback({
						'state': 'ready',
						'video': objVideo
					});
				});
				objVideo.player.on('ended', function() {
					callback({
						'state': 'end',
						'video': objVideo
					});
				});
				masonVideos.setVideoFill(objVideo);
				masonVideos.setVideoCustomControls(objVideo);
				masonVideos.setVideoVisibility(objVideo);
				masonVideos.arrVideos.push(objVideo);
			}
		},
		initFilePlayers: function(objVideo, callback){
			objVideo.element.insertAdjacentHTML('beforeend', '<video ' + (objVideo.opts.controls ? 'controls' : '') + ' ' + (objVideo.opts.autoplay ? 'autoplay' : '') + ' ' + (objVideo.opts.loop ? 'loop': '') + ' ' + (objVideo.opts.mute ? 'muted' : '') + ' playsinline><source src="' + objVideo.opts.source + '">Your browser does not support the video tag.</video>');
			objVideo.player = objVideo.element.childNodes[0];
			
			objVideo.player.onloadstart = function(e) {
				callback({
					'state': 'ready',
					'video': objVideo
				});
			}
			objVideo.player.onended = function(e) {
				callback({
					'state': 'end',
					'video': objVideo
				});
			}
			masonVideos.setVideoFill(objVideo);
			masonVideos.setVideoCustomControls(objVideo);
			masonVideos.setVideoVisibility(objVideo);
			masonVideos.arrVideos.push(objVideo);
		},
		setVideoVisibility: function(objVideo){
			if (masonVideos.blnIntersectObs && objVideo.opts.visibility && objVideo.opts.autoplay){
				var videoObserver = new IntersectionObserver(function(entries) {
					switch (objVideo.type) {
						case 'youtube':
							if (objVideo.player.isMuted()){
								var playerState = objVideo.player.getPlayerState();
								if (playerState == 2){
									entries[0].isIntersecting && objVideo.player.playVideo();
								} else if (playerState == 1) {
									!entries[0].isIntersecting && objVideo.player.pauseVideo();
								}
							}
							break;

						case 'vimeo':
							objVideo.player.getVolume().then(function(volume) {
								if (volume == 0){
									objVideo.player.getPaused().then(function(blnPaused) {
										if (blnPaused){
											entries[0].isIntersecting && objVideo.player.play();
										} else {
											!entries[0].isIntersecting && objVideo.player.pause();
										}
									});
								}
							});
							break;
							
						case 'native':
							if (objVideo.player.muted){
								if (objVideo.player.paused){
									entries[0].isIntersecting && objVideo.player.play();
								} else {
									!entries[0].isIntersecting && objVideo.player.pause();
								}
							}
							break;
					}
				}, { rootMargin: '0px 0px 0px 0px' });
				videoObserver.observe(objVideo.element);
			}
		},
		setVideoFill: function(objVideo){
			if (objVideo.opts.videofill != undefined){
				var videoFillTo = document.querySelector(objVideo.opts.videofill);
				if (videoFillTo != null){
					if (masonVideos.blnResizeObs){
						var obsResizeVideo = new ResizeObserver(function(entries) {
							videoFillResize();
						});
						obsResizeVideo.observe(videoFillTo);
					}
					videoFillResize();
					window.addEventListener('resize', function () {
						videoFillResize();
					});
				}

				function videoFillResize(){
					var ratio = (16/9),
						fillW = videoFillTo.clientWidth,
						fillH = videoFillTo.clientHeight,
						playerW, playerH;
					
					if (fillW / ratio < fillH) {
						playerW = Math.ceil(fillH * ratio);
						objVideo.element.style.width = playerW + 'px';
						objVideo.element.style.height = fillH + 'px';
					} else {
						playerH = Math.ceil(fillW / ratio);
						objVideo.element.style.width = fillW + 'px';
						objVideo.element.style.height = playerH + 'px';
					}
					objVideo.element.style.position = 'absolute';
					objVideo.element.style.top = '50%';
					objVideo.element.style.left = '50%';
					objVideo.element.style.bottom = 'auto';
					objVideo.element.style.right = 'auto';
					objVideo.element.style.transform = 'translate(-50%, -50%)';
				}
			}
		},
		setVideoCustomControls: function(objVideo){
			// toggle playback
			var videoControlPlayback = document.querySelector('[data-mason-video-playback="' + objVideo.id + '"]');
			if (videoControlPlayback != null){
				videoControlPlayback.addEventListener('click', masonVideos.videoPlayback);
				objVideo.opts.autoplay ? videoControlPlayback.classList.remove('active') : videoControlPlayback.classList.add('active');
				objVideo.customControls.playback = videoControlPlayback;
			}

			// toggle audio
			var videoControlAudio = document.querySelector('[data-mason-video-audio="' + objVideo.id + '"]');
			if (videoControlAudio != null){
				videoControlAudio.addEventListener('click', masonVideos.videoAudio);
				objVideo.opts.mute ? videoControlAudio.classList.remove('active') : videoControlAudio.classList.add('active');
				objVideo.customControls.audio = videoControlAudio;
			}

			// toggle popout
			var videoControlPopout = document.querySelector('[data-mason-video-popout="' + objVideo.id + '"]');
			if (videoControlPopout != null){
				videoControlPopout.addEventListener('click', masonVideos.videoPopoutOpen);
				videoControlPopout.classList.remove('active')
				objVideo.customControls.popout = videoControlPopout;
			}
		},
		videoAudio: function(){
			var id = this.getAttribute('data-mason-video-audio');
			masonVideos.arrVideos.forEach(function(vid){
				if (id == vid.id){
					var element = vid.element.offsetParent ? vid.element.offsetParent : vid.element.parentNode;
					var blnMuted;
					switch (vid.type) {
					case 'vimeo':
						vid.player.getVolume().then(function(volume) {
							if (volume == 0){
								vid.player.setVolume(1);
								vid.customControls.audio.classList.add('active');
								element.classList.add('unmuted')
							} else {
								vid.player.setVolume(0);
								vid.customControls.audio.classList.remove('active');
								element.classList.remove('unmuted')
							}
						});
						break;
					
					case 'youtube':
						blnMuted = (vid.player.isMuted());
						if (blnMuted) {
							vid.player.unMute()
							element.classList.add('unmuted')
						} else {
							vid.player.mute()
							element.classList.remove('unmuted')
						}
						break;

					case 'native':
						blnMuted = (vid.player.muted);
						blnMuted ? element.classList.add('unmuted') : element.classList.remove('unmuted')
						vid.player.muted = !blnMuted;
						break;
					}
					if (blnMuted != null){
						if (blnMuted){
							vid.customControls.audio.classList.add('active');
						} else {
							vid.customControls.audio.classList.remove('active');
						}
					}
				}
			});
		},
		videoPlayback: function(){
			var id = this.getAttribute('data-mason-video-playback');
			masonVideos.arrVideos.forEach(function(vid){
				if (id == vid.id){
					var element = vid.element.offsetParent ? vid.element.offsetParent : vid.element.parentNode;
					switch (vid.type) {
						case 'vimeo':
							vid.player.getPaused().then(function(blnPaused) {
								if (blnPaused) {
									vid.player.play();
									element.classList.add('playing')
								} else {
									vid.player.pause();
									element.classList.remove('playing')
								}
							});
							break;
						
						case 'youtube':
							vid.player.pauseVideo();
							var playerState = vid.player.getPlayerState();
							if (playerState == 2 || playerState == 5) {
								vid.player.playVideo();
								element.classList.add('playing')
							} else {
								vid.player.pauseVideo();
								element.classList.remove('playing')
							}
							break;
						
						case 'native':
							if (vid.player.paused) {
								vid.player.play();
								element.classList.add('playing');
							} else {
								vid.player.pause();
								element.classList.remove('playing');
							}
							break;
					}
					vid.customControls.playback.classList.toggle('active');
				}
			});
		},
		videoPopoutOpen: function(){
			var id = this.getAttribute('data-mason-video-popout');
			masonVideos.arrVideos.forEach(function(vid){
				if (id == vid.id){
					var $videoPopWindow = $('<div>',  {
						id: 'mason-video-popout'
					}),
					$videoPopPlayer = $('<div>',  {
						id: 'mason-video-popout-player',
						'data-mason-video': JSON.stringify({
							'source': vid.opts.source,
							'autoplay': true,
							'mute': false,
							'controls': true
						})
					}),
					$videoClose = $('<div>',  {
						id: "mason-video-popout-close"
					}),
					blnMouseOver = false;
		
					$videoPopWindow.append($videoPopPlayer).append($videoClose).appendTo('.mason');
					$videoPopWindow.on('mousemove', function(event) {
						if (event.target == this) {
							!blnMouseOver && (blnMouseOver = true);
							var x = event.clientX,
								y = event.clientY;
							$videoClose[0].style.opacity = 1;
							$videoClose[0].style.transform = `translate3d(calc(${event.clientX}px - 50%), calc(${event.clientY}px - 50%), 0)`;
							$(this).on('click', function() {
								$videoClose.addClass('clicked');
								masonVideos.videoPopoutClose(vid, $videoPopWindow);
							});
						} else {
							blnMouseOver && (blnMouseOver = false);
						}        
					});
			
					masonVideos.loadPlayers('#mason-video-popout-player', (objData) => {
						switch(objData.state){
							case 'ready':
								masonVideos.mason.classList.add('mason--video-popout');
								switch (vid.type) {
									case 'vimeo':
									case 'native':
										vid.player.pause();
										break;
									
									case 'youtube':
										vid.player.pauseVideo();
										break;
								}
								break;
							
							case 'end':
								masonVideos.videoPopoutClose(vid, $videoPopWindow);
								break;
						}
					});
				} else {
					// mute other videos
					switch (vid.type) {
						case 'vimeo':
							vid.player.setVolume(0);
							break;
						
						case 'youtube':
							vid.player.mute();
							break;

						case 'native':
							vid.player.muted = true;
							break;
					}
					vid.customControls.audio && vid.customControls.audio.classList.remove('active');
				}
			});
		},
		videoPopoutClose: function(objVideo, $videoPopWindow){
			masonVideos.mason.classList.remove('mason--video-popout');
			$videoPopWindow.fadeOut(function() {
				$videoPopWindow.remove();
				if (objVideo.opts.autoplay == 1) {
					switch (objVideo.type) {
						case 'vimeo':
						case 'native':
							objVideo.player.play();
							break;
	
						case 'youtube':
							objVideo.player.playVideo();
							break;
					}
				}
				masonVideos.arrVideos.pop();
			});
		},
		loadPlayers: function(targ, callback){
			var vids = document.querySelectorAll(targ),
				intVids = vids.length,
				arrVideoFormats = ['mov','mpg','avi','mp4','wmv','mpeg','webm','ogg'];
			for (var i=0; i<intVids; i++){
				if (!vids[i].children.length){
					var strVideoJSON = vids[i].getAttribute('data-mason-video'),
						objVideoJSON = JSON.parse(strVideoJSON),
						objVideo = {
							id: vids[i].getAttribute('data-mason-id'),
							element: vids[i],
							opts: objVideoJSON,
							customControls: {}
						};
					objVideo.opts.visibility = objVideo.opts.visibility || true;
					if (objVideoJSON.source.indexOf('youtu') > -1){
						objVideo.type = 'youtube';
						masonVideos.initYTPlayers(objVideo, function(data){
							callback(data);
						});
					} else if (objVideoJSON.source.indexOf('vimeo') > -1){
						objVideo.type = 'vimeo';
						masonVideos.initVimeoPlayers(objVideo, function(data){
							callback(data);
						});
					} else {
						var regex = new RegExp('.[0-9a-z]+$'),
							arrVideoSrc = [];
						if (objVideoJSON.source != ""){
							arrVideoSrc = objVideoJSON.source.match(regex);
							if (arrVideoSrc.length){
								if (arrVideoFormats.includes(arrVideoSrc[0].replace('.', ''))){
									objVideo.type = 'native';
									masonVideos.initFilePlayers(objVideo, function(data){
										callback(data);
									});
								} else {
									console.log('Video source is not supported');
								}
							}
						}
					}
				}
			}
		},
		init: function(){
			// initialize videos
			masonVideos.loadPlayers('[data-mason-video]', (objData) => {
				if (objData.state == 'ready'){
					for (key in objData.video.customControls){
						objData.video.customControls[key].classList.add('ready');
					}
				}
			});
		}
	}


///////////////////
// ENHANCED POPUP
///////////////////
function fnEnhancedPopup() {}
fnEnhancedPopup.prototype = (function() {
	return {
		constructor: fnEnhancedPopup,
		container: null, 
		cycle: null, 
		ctrlPrev: null, 
		ctrlNext: null, 
		ctrlPager: null, 
		ctrlClose: null, 
		intCount: 0,
		blnPreview: false,
		_: null,
		init: function(){
			_ = this;
			_.container = document.querySelector('.enhanced__pop__container');
			_.cycle = document.querySelector('.enhanced__pop__container__cycle');
			_.ctrlPrev = document.getElementsByClassName('enhanced__pop__btn--prev')[0];
			_.ctrlNext = document.getElementsByClassName('enhanced__pop__btn--next')[0];
			_.ctrlPager = document.getElementsByClassName('enhanced__pop__pager')[0];
			_.ctrlClose = document.getElementsByClassName('enhanced__pop__close');
			_.intCount = _.cycle.childElementCount;
			_.blnPreview = _.cycle.getAttribute('data-preview') == 'true';
			if (_.intCount > 0) {
				_.buildPopPager(_.intCount)
				_.ctrlPager.addEventListener('click', (event)=> {
					if (event.target.tagName == 'SPAN' && !event.target.classList.contains('active')) {
						let newPagerItem = event.target			
						let pagerIndex = newPagerItem.getAttribute('data-count')
						_.setActiveItem(undefined, _.cycle.childNodes.item(pagerIndex))
						_.ctrlPager.querySelector('.active').classList.remove('active')
						newPagerItem.classList.add('active')
			
					}
				})
			}
			_.ctrlNext.addEventListener('click', ()=> {
				_.setActiveItem(true) 
			})
			_.ctrlPrev.addEventListener('click', ()=> {
				_.setActiveItem(false) 
			})
			Array.from(_.ctrlClose).forEach(function(ctrlClose) {
				ctrlClose.addEventListener('click', _.closePopup);
			});
			document.addEventListener('keydown', function(e){
				switch(e.which) {
					case 27:
						_.closePopup();
						break;
					case 37:
						_.setActiveItem(false) 
						break;
					case 39:
						_.setActiveItem(true) 
						break;
					default: return;
				}
				e.preventDefault();
			});
		
			_.container.showModal();
			_.checkNext(_.cycle.querySelector('.active'))
			_.cycle.classList.add('loaded')
		},
		buildPopPager: function(intPopCount) {
			for (var i = 0; i < intPopCount; i++) {
				let pagerItem = document.createElement('span')
				pagerItem.dataset.count = i
				if (i == 0) {
					pagerItem.classList.add('active')
				}
				_.ctrlPager.append(pagerItem)
			}
			_.ctrlPager.classList.add('loaded')
		},
		checkNext: function(nextActive) {
			_.loadActiveImage(nextActive)
			if (nextActive.nextElementSibling == null) {
				_.ctrlNext.disabled = true;
			} else {
				_.ctrlNext.disabled = false;
			}
			if (nextActive.previousElementSibling == null) {
				_.ctrlPrev.disabled = true;
			} else {
				_.ctrlPrev.disabled = false;
			}
		},
		setPagerActive: function(newPagerActive) {
			_.ctrlPager.querySelector('.active').classList.remove('active')
			_.ctrlPager.childNodes.item(newPagerActive).classList.add('active')
		},
		setActiveItem: function(blnNext, elem) {
			let currentActive, nextActive
			if (blnNext === true) {
				currentActive = _.cycle.querySelector('.active')
				nextActive = currentActive.nextElementSibling
			} else if (blnNext === false) {
				currentActive = _.cycle.querySelector('.active')
				nextActive = currentActive.previousElementSibling
			} else if (elem) {
				currentActive = _.cycle.querySelector('.active')
				nextActive = elem
			}
			if (nextActive == null){
				return
			}
			currentActive.classList.remove('active')
			nextActive.classList.add('active')
			_.checkNext(nextActive)
			if (elem == undefined && _.intCount > 0) {
				let newPagerActive = Array.from(nextActive.parentNode.children).indexOf(nextActive)
				_.setPagerActive(newPagerActive)
			}
		},
		loadActiveImage: function(activeItem) {
			let activeImage = activeItem.querySelector('[data-enhancedpopupimg]')
			
			if (activeImage !== null && !activeImage.classList.contains('enhanced__pop__lazy--prep')) {
				activeImage.classList.add('enhanced__pop__lazy--prep');
				let activeImageContainer = activeImage.querySelector('.enhanced__pop__item__image--lazy');
				if (activeImageContainer == null) {
					activeImageContainer = document.createElement('div');
					activeImageContainer.className = 'enhanced__pop__item__image--lazy';
					activeImage.appendChild(activeImageContainer)
				} 
				let activeImageSource = activeImage.getAttribute('data-enhancedpopupimg')
				let activeImg = new Image();
				activeImg.src = activeImageSource;
				if (activeImage.hasAttribute('data-alt')) {
					activeImg.alt = activeImage.getAttribute('data-alt');
				} else {
					activeImg.alt = "";
				}
				activeImg.onload = () => {
					activeItem.classList.add('enhanced__pop__item--image--loaded')
					if (activeImage.hasAttribute('data-bg')) {
						activeImageContainer.style.backgroundImage = 'url(' + activeImageSource + ')';
					} else {
						activeImageContainer.appendChild(activeImg);				
					}
					setTimeout(function(){
						activeImage.classList.add('enhanced__pop__lazy--loaded');
					}, 300)

					_.closeButtonPosition(activeItem, activeImg);
					window.addEventListener('resize', function () {
						_.closeButtonPosition(activeItem, activeImg);
					});
				}
				activeImg.onerror = () => {
					let activeFallback = strFallbackPath || "/_site/images/design/thumbnail.jpg"
					if (activeImage.hasAttribute('data-bg')) {
						activeImageContainer.style.backgroundImage = 'url(' + activeFallback + ')';
					} else {
						activeImg.src = activeFallback
						activeImageContainer.appendChild(activeImg);				
					}
					setTimeout(function(){
						activeImage.classList.add('enhanced__pop__lazy--loaded');
					}, 300)
					
				}
			}
		},
		closeButtonPosition(activeItem, activeImg) {
			// adjust close button position for image-only popups, as wasn't achievable in CSS cross-browser
			if (activeItem.getAttribute('data-type') == 'image'){
				var closeButton = activeItem.querySelector('.enhanced__pop__container__btn__close');
				closeButton.style.left = 'calc(50% + ' + (activeImg.offsetWidth/2) + 'px)'
				closeButton.style.transform = 'translateX(-100%)';
			}
		},
		closePopup: function() {
			_.container.close();
			if (_.blnPreview){
				$('#admin_dialog').show();
				setTimeout(function(){
					$('.enhanced__pop__container, script#enhanced_popup_script, link[href*="enhanced-popup.css"]').remove();
				}, 400)
			}
		}
	}
})();

$(function(){
	if (typeof HTMLDialogElement === 'function' && document.querySelector('.enhanced__pop__container')){
		var masonEnhancedPopup = new fnEnhancedPopup();
		masonEnhancedPopup.init();
	}
});