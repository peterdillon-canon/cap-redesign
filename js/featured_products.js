define(["dojo/_base/declare", "dojo/query", "dojo/on", "dojo/_base/lang", "dojo/_base/array", 
"dojo/dom-class", "dojo/dom", "dojo/dom-style", "dojo/dom-attr", "dojo/NodeList-traverse"],
function(declare, query, on, lang, arrayUtils, domClass, dom, domStyle, domAttr){
    declare("canon.featuredProducts", null, {
		curSlideIndex:0,
		eventTargets:[],
        prevTarget:"left_arrow",
        nextTarget:"right_arrow",
		slides:[],
		totalSlides:0,
        constructor: function(){
			this.slides = query(".prod_slideshow");
			this.totalSlides = this.slides.length;
			this.eventTargets.push(query(".right_arrow"));
			this.eventTargets.push(query(".left_arrow"));
			var that = this;
			arrayUtils.forEach(this.eventTargets, function(target){
				on(target, "click", lang.hitch(that, function(evt){					
					this.clickEvent(target);
				}));
			});
			arrayUtils.forEach(query("#caption>ul>li"), function(node){
				on(node, "click", lang.hitch(that, function(evt){
					this.updateFeaturedProd(node);
				}));
			});
        },
		clickEvent: function(node){
			var isNodeList = true;
			if(node.length === undefined)
				isNodeList = false;
			if(isNodeList && node.length === 1){
				if(domClass.contains(node[0], this.nextTarget)){
					this.nextLink(node[0]);
					
				}
				if(domClass.contains(node[0], this.prevTarget)){
					this.previousLink(node[0]);
				}
				this.updateImg(this.curSlideIndex);
			}
		},
        nextLink: function(linkNode){	
			if(this.curSlideIndex >= 0 && this.curSlideIndex < this.totalSlides - 1){
				this.curSlideIndex++;
				dom.byId("slideShowDiv").innerHTML = this.slides[this.curSlideIndex].innerHTML;	
				if(this.curSlideIndex == this.totalSlides-1)
					domStyle.set(query("." + this.nextTarget + " a img")[0], "display", "none");
				}	
				domStyle.set(query("." + this.prevTarget + " a img")[0], "display", "");
        },
		previousLink: function(linkNode){
			if(this.curSlideIndex <= this.totalSlides && this.curSlideIndex > 0){
				this.curSlideIndex--;					
				dom.byId("slideShowDiv").innerHTML = this.slides[this.curSlideIndex].innerHTML;				
				if(this.curSlideIndex == 0)
					domStyle.set(query("." + this.prevTarget + " a img")[0], "display", "none");
			}
			domStyle.set(query("." + this.nextTarget + " a img")[0], "display", "");
		},
		updateFeaturedProd: function(node){
			var index = domAttr.get(node,"slideIndex");
			if(index < 0 && index >> this.totalSlides)
				return;
			var nl = dojo.NodeList(node).children().children().first();
			this.curSlideIndex = index;
			dom.byId("slideShowDiv").innerHTML = this.slides[this.curSlideIndex].innerHTML;				
			if(this.curSlideIndex == 0){
				domStyle.set(query("." + this.prevTarget + " a img")[0], "display", "none");
				if(domStyle.get(query("." + this.nextTarget + " a img")[0], "display") == "none")
					domStyle.set(query("." + this.nextTarget + " a img")[0], "display", "");
			}else if(this.curSlideIndex == this.totalSlides-1){
				domStyle.set(query("." + this.nextTarget + " a img")[0], "display", "none");
				if(domStyle.get(query("." + this.prevTarget + " a img")[0], "display") == "none")
					domStyle.set(query("." + this.prevTarget + " a img")[0], "display", "");
			}else{
				domStyle.set(query("." + this.nextTarget + " a img")[0], "display", "");
				domStyle.set(query("." + this.prevTarget + " a img")[0], "display", "");
			}
			this.updateImg(index);
		},
		updateImg: function(index){
			var imgList = query("#caption ul li a img");
			for(var i = 0; i < imgList.length; i++){
				domAttr.set(imgList[i], "src", "/sys/images/icons/page.gif");
				if(i == index)
					domAttr.set(imgList[i], "src", "/sys/images/icons/page_selected.gif");
			}
		}
    });
    return{
        fProducts: function(){
			return new canon.featuredProducts();
		}
    };
});