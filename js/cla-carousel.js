
Carousel = {
	DURATION_DEFAULT: 12000,
	DURATION_STATIC_IMG_DEFAULT: 8000,
	SlideType: {
		IMAGE: 'image',
		IMAGE_SEQUENCE: 'image-sequence',
		SWF: 'swf'
	},
	StateType: {
		PLAYING: 'playing',
		PAUSED: 'paused'
	},
	Slide: function () {
		this.src;
		this.duration;
		this.imageSequence = [];
		this.guid = guidGenerator();
		this.pagerIcon;
		this.vars;
		this.x;
		this.y;
		this.type;
		this.width;
		this.height;
	}		
}

define(["dojo/_base/declare", "dojo/query", "dojo/on", "dojo/_base/lang", "dojo/_base/array", "dojo/dom-class", "dojo/dom-style", "dojox/embed/Flash", "dojox/xml/parser", "dojo/has", "dojo/_base/xhr", "dojo/_base/json", "dojo/dom-construct", "dojo/_base/fx", "dojo/_base/sniff", "dojo/NodeList-traverse"],
function(declare, query, on, lang, arrayUtils, domClass, domStyle, Flash, xmlParser, has, xhr, dojoJson, domConstruct, fx){
    declare("canon.carousel", null, {
		configXml: "",
		groupId: "",
		slides: [],
		timer: null,
		currentSlide: null,
		currentSlideNumber: 0,
		currentImageSequence: null,
		state: null,
		counter: 1,
		offsetTopDefault: -2,
		offsetLeftDefault: -2,
		needsFlash: false,
		isTouchDevice: false,	
		constructor: function(sConfigXml, sGroupId) {
			// update parameters
			//this.configXml = sConfigXml;
			if(sGroupId.indexOf('es') == -1)
				this.configXml = "/cla/en/banner";
			else
				this.configXml = "/cla/es/banner";	
			this.groupId = sGroupId;		
	        // check for browser detect
			var userAgent = navigator.userAgent.toLowerCase();
			this.isTouchDevice = (userAgent.match(/android/) || userAgent.match(/iphone/) || userAgent.match(/ipad/) || userAgent.match(/ipod/)) != null;
			if ((has("ie") == 7 || has("ie") == 8) && this.getFlashVersion().split(',').shift() < 11) {
				console.log('Please update to Flash Player 11');
				this.needsFlash = true;
			}
			this.slides = new Array();
			// get config info
			xhr.get({
				url: this.configXml,
				error: function(response, ioArgs) {
					console.error(response);
					return response;
				},
				load: lang.hitch(this, function(xml, ioArgs) {
					this.parseXml(xml);
				})
			});
			// prepare for real data
			query("#carousel-container")[0].innerHTML = '';				
			//create DOM elements inside the carousel div
			domConstruct.create('div', { "id": "carousel-content" }, 'carousel-container', 'first');
			domConstruct.create('div', { "id": "controls-container" }, 'carousel-container', 'first');
			domConstruct.create('p', { "id": "pager-numbers" }, 'controls-container', 'first');
			var pagerControls = domConstruct.create('div', { "id": "pager-controls" }, 'controls-container', 'first');
			var top = domConstruct.create('p', { "class": "ptop" }, 'carousel-container', 'last');
			domConstruct.create('img', { "src": "/sys/images/tleft.png", "width": 5, "height": 5, "style": "display:block;" }, top, 'first');
			var bottom = domConstruct.create('p', { "class": "pbottom" }, 'carousel-container', 'last');
			domConstruct.create('img', { "src": "/sys/images/bleft.png", "width": 5, "height": 5, "style": "display:block;" }, bottom, 'first');
			//connect click to buttons
			var that = this;
			on(domConstruct.create('a', { "class": "leftBtn", "href": "javascript:void(0);" }, pagerControls, 'last'), 'click', function () { that.prevSlide() });
			on(domConstruct.create('a', { "id": "playPause", "class": "pauseBtn", "href": "javascript:void(0);" }, pagerControls, 'last'), 'click', function () { that.togglePlay() });
			on(domConstruct.create('a', { "class": "rightBtn", "href": "javascript:void(0);" }, pagerControls, 'last'), 'click', function () { that.nextSlide() });
			//update style
			domStyle.set(query("#carousel-content")[0], 'position', 'absolute');
		},
		parseXml: function(xml) {
			if (!xml) {
				return;
			}
			var group;
			// parse file as xml
			var data = xmlParser.parse(xml);
			// make sure group is contained in file
			var groupId = this.groupId.toLowerCase();
			arrayUtils.forEach(data.getElementsByTagName('group'), function (entry, i) {
				if (entry.getAttribute('id').toLowerCase() == groupId) {
					group = entry;
				}
			});
			if (!group) {
				this.warning('XML Group ID not found');
				return;
			}
			// build slides for the desired group
			var that = this;
			arrayUtils.forEach(group.getElementsByTagName('slide'), function (entry, i) {
				var slide = new Carousel.Slide();
				slide.src = that.tokenizer(that, entry.getAttribute('src'));
				that.preloadImg(slide.src);
				slide.duration = entry.getAttribute('duration');
				slide.duration = (slide.duration) ? slide.duration : Carousel.DURATION_DEFAULT;
				slide.width = entry.getAttribute('width');
				slide.height = entry.getAttribute('height');
				slide.vars = dojoJson.fromJson(that.tokenizer(that, entry.getElementsByTagName('vars')[0].childNodes[0].nodeValue));
				slide.type = entry.getAttribute('type');
				slide.x = (entry.getAttribute('x')) ? entry.getAttribute('x') : group.getAttribute('defaultX');
				slide.y = (entry.getAttribute('y')) ? entry.getAttribute('y') : group.getAttribute('defaultY');
				slide.backUpImage = that.tokenizer(that, entry.getAttribute('backUpImage'));
				if (that.isTouchDevice && slide.type == Carousel.SlideType.SWF) {
					if (entry.getElementsByTagName('img').length > 0) {
						slide.type = Carousel.SlideType.IMAGE_SEQUENCE;
					}
				}
				if (that.isTouchDevice && slide.backUpImage && slide.type == Carousel.SlideType.SWF) {
					that.preloadImg(slide.backUpImage);
					slide.src = slide.backUpImage;
					slide.type = Carousel.SlideType.IMAGE;
					slide.duration = Carousel.DURATION_STATIC_IMG_DEFAULT;
				}
				if (that.isTouchDevice && slide.type == Carousel.SlideType.SWF) {
					return;
				}
				switch (slide.type) {
					case Carousel.SlideType.IMAGE:
					case Carousel.SlideType.SWF:
						that.slides.push(slide);
						break;
					case Carousel.SlideType.IMAGE_SEQUENCE:
						slide.duration = 0;
						arrayUtils.forEach(entry.getElementsByTagName('img'), function (entryImg, i) {
							var imageSequenceSlide = new Carousel.Slide();
							imageSequenceSlide.vars = slide.vars;
							imageSequenceSlide.duration = Number(entryImg.getAttribute('duration'));
							imageSequenceSlide.src = that.tokenizer(that, entryImg.childNodes[0].nodeValue);
							that.preloadImg(imageSequenceSlide.src);
							slide.duration += (imageSequenceSlide.duration) ? imageSequenceSlide.duration : Carousel.DURATION_DEFAULT;
							slide.imageSequence.push(imageSequenceSlide);
						});
						that.slides.push(slide);
						break;
				}
			});			
			that.currentSlideNumber = Math.round(Math.random() * that.slides.length - 1);
			that.nextSlide();
			that.state = Carousel.StateType.PLAYING;
		},
		nextSlide: function() {
			this.currentSlideNumber++;
			if (this.currentSlideNumber > this.slides.length - 1) {
				this.currentSlideNumber = 0;
			}
			this.load(this.slides[this.currentSlideNumber]);
		},
		prevSlide: function() {
			this.currentSlideNumber--;
			if (this.currentSlideNumber < 0) {
				this.currentSlideNumber = this.slides.length - 1;
			}
			this.load(this.slides[this.currentSlideNumber]);
		},
		togglePlay: function() {
			if (!this.state || this.state == Carousel.StateType.PAUSED) {
				this.play();
			} else {
				this.pause();
			}
		},
		pause: function() {
			domClass.remove(query('#playPause')[0], 'pauseBtn');
			domClass.add(query('#playPause')[0], 'playBtn');
			this.stopTimer();
			this.state = Carousel.StateType.PAUSE;
			if (query('#flash-Carousel').length > 0) {
				query('#flash-Carousel')[0].StopPlay();
			}
		},
		startTimer: function() {
			var self = this;
			this.timer = setInterval(function() { self.nextSlide(); }, this.currentSlide.duration);
		},
		stopTimer: function() {
			clearInterval(this.timer);
		},
		play: function() {
			domClass.remove(query('#playPause')[0], 'playBtn');
			domClass.add(query('#playPause')[0], 'pauseBtn');
			this.state = Carousel.StateType.PLAYING;
			if (this.currentSlide) {
				this.stopTimer();
				if (this.currentSlide.type == Carousel.SlideType.IMAGE_SEQUENCE && this.currentImageSequence.length != 0) {
					var self = this;
					this.timer = setInterval(function() { self.nextImageSequence(); }, this.currentImageSequence[this.currentImageSequence.length - 1].duration);
				} else {
					//animated flash images should still rotate
					//if (this.currentSlide.type != Carousel.SlideType.SWF)
						this.startTimer();
				}
			}
			if (query('#flash-Carousel').length > 0) {
				query('#flash-Carousel')[0].Play();
			}
		},
		updateNav: function (slide) {
			query('#pager-numbers')[0].innerHTML = (this.currentSlideNumber + 1) + '/' + this.slides.length;
		},		
		nextImageSequence: function() {
			this.stopTimer();
			if (this.currentImageSequence.length == 0) {
				this.nextSlide();
				return;
			}
			this.loadImageSequence(this.currentImageSequence.pop());
		},
		loadImageSequence: function(slide) {
			if (!slide) {
				return;
			}
			domStyle.set(query("#carousel-content")[0], 'top', '0px');
			domStyle.set(query("#carousel-content")[0], 'left', '0px');
			var content = "";
			this.stopTimer();
			// do browser detect to decide on what content to show.
			if (!slide.vars || !slide.vars.url || !slide.vars.target)  {
				this.warning('missing vars \'target\' or \'url\'');
			}
			if (has("ie" == 7)) {
				content = domConstruct.create('a', { 'style': 'position:absolute;', id: guidGenerator(), href: slide.vars.url, 'target': slide.vars.target }, 'carousel-content', 'first');
			} else {
				content = domConstruct.create('a', { 'style': 'position:absolute;', id: guidGenerator(), href: slide.vars.url, 'target': slide.vars.target }, 'carousel-content', 'last');
			}
			domStyle.set(content, 'opacity', '0');
			domConstruct.create('img', { 'board': '0', 'src': slide.src }, content);
			fx.fadeIn({ node: content }).play();
			// dojo position fix
			var offsetTop = 0;
			var offsetLeft = 0;
			if (has("ie") || has("ff") == 3.6) {
				offsetTop = this.offsetTopDefault;
				offsetLeft = this.offsetLeftDefault;
			}
			domStyle.set(query("#carousel-content")[0], 'top', offsetTop + 'px');
			domStyle.set(query("#carousel-content")[0], 'left', offsetLeft + 'px');
			domStyle.set(query("#carousel-content")[0], 'position', 'absolute');
			this.timer = setInterval("this.nextImageSequence()", slide.duration);
		},
		load: function(slide) {
			this.play();
			if (this.onSwitch != null) {
				this.onSwitch
			}
			if (!slide) {
				return;
			}
			this.updateNav(slide);
			domStyle.set(query("#carousel-content")[0], 'top', '0px');
			domStyle.set(query("#carousel-content")[0], 'left', '0px');
			var content = "";
			this.stopTimer();
			this.currentSlide = slide;
			// browser detect
			switch (slide.type) {
				case Carousel.SlideType.SWF:
					var flashDivName = "flash-Carousel-holder";
					query("#carousel-content")[0].innerHTML = '';
					domConstruct.create("div", { "id": flashDivName }, "carousel-content", "first");
					//var myObject = domConstruct.create("object", { "type": "image/gif" }, flashDivName);
					//domConstruct.create("img", { "src": "/sys/images/spacer.gif", "width": "100%", "height": "100%" }, myObject);
					if (this.needsFlash) {
						var adobeLink = domConstruct.create("a", { "href": "http://www.adobe.com/go/getflashplayer" }, flashDivName, "first");
						domConstruct.create("div", { "class": "download-flash", "alt": "Download Flash Player" }, adobeLink, "first");					
					}
					if (!this.needsFlash) {
						domStyle.set(query("#" + flashDivName)[0], 'cursor', 'pointer');
						var myUrl = slide.vars.url;
						on(query("#" + flashDivName)[0], 'click', function () { location.href = myUrl; });
						var flash = new Flash({
							path: slide.src,
							width: slide.width,
							height: slide.height,
							params: { "menu": "false", "wmode": "transparent" },
							vars: slide.vars,
							id: 'flash-Carousel'
						}, flashDivName);
						flash.onReady = function () {
							//IE7 Fix
							if (has("ie") == 7) {
								query('#flash-Carousel')[0].outerHTML = query('#flash-Carousel')[0].outerHTML;
							}
						};
						flash.onLoad = function () { };
					}
					break;
				case Carousel.SlideType.IMAGE:
					if (!slide.vars || !slide.vars.url || !slide.vars.target) {
						this.warning('missing vars \'target\' or \'url\'');
					}			
					content =  slide.vars.divInfo;					
					//console.log('content >>>>' + content);					
					query("#carousel-content")[0].innerHTML = content;	
					//console.log(query("#carousel-content")[0].innerHTML);					
					break;
				case Carousel.SlideType.IMAGE_SEQUENCE:
					this.currentImageSequence = this.currentSlide.imageSequence.clone().reverse();
					this.counter = 1;
					query("#carousel-content")[0].innerHTML = '';
					this.nextImageSequence();
					return;
					break;
				}
			// dojo position fix
			var offsetTop = 0;
			var offsetLeft = 0;
			if (has("ie") || has("ff") == 3.6) {
				offsetTop = Carousel.offsetTopDefault;
				offsetLeft = Carousel.offsetLeftDefault;
			}
			if (has("ie") != 7 && has("ie") != 8) {
				domStyle.set(query("#carousel-content")[0], 'top', slide.y + offsetTop + 'px');
				domStyle.set(query("#carousel-content")[0], 'left', slide.x + offsetLeft + 'px');
				domStyle.set(query("#carousel-content")[0], 'position', 'absolute');
			}
//			if (slide.type != Carousel.SlideType.SWF)
				this.startTimer();
		},
		tokenizer: function(object, content) {
			if (!object || !content) {
				return;
			}
			for (var token in object) {
				content = content.replaceAll("^^" + token.toString() + "^^", object[token]);
			}
			return content;
		},
		preloadImg: function(src) {
			if (src == undefined) {
				return;
			}
			new Image().src = src;
		},
		log: function (message) {
			if (typeof (console) == 'object') {
				console.log(message);
			}
		},
		warning: function (message) {
			this.log('!!! ' + message + ' !!!');
		},
		getFlashVersion: function() {
			// ie
			try {
				try {
					// avoid fp6 minor version lookup issues
					// see: http://blog.deconcept.com/2006/01/11/getvariable-setvariable-crash-internet-explorer-flash-6/
					var axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
					try { axo.AllowScriptAccess = 'always'; }
					catch (e) { return '6,0,0'; }
				} catch (e) { }
				return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
				// other browsers
			} catch (e) {
				try {
					if (navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin) {
						return (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1];
					}
				} catch (e) { }
			}
			return '0,0,0';
		}
    });
    return{
        homeCarousel: function(sConfigXml, sGroupId){
			return new canon.carousel(sConfigXml, sGroupId);
		}
    };
});

function guidGenerator() {
	var S4 = function() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	};
	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

String.prototype.replaceAll = function (s1, s2) { return this.split(s1).join(s2) }

Array.prototype.clone = function () { return this.slice(0); }
