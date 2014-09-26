/**
 * 2014-05-06
**/
(function (window , x$ , undefined) {

	x$.Grid = (function () {
		var Grid = function (sets) {
				return new Grid.fn.init(sets);
			} ;


		Grid.fn = Grid.prototype = {
			init: function (config) {

				var sets = x$.extend(true, {}, this.defaults, config);
				
				//cache into this' attributes
				this.edgeRule = sets.edgeRule;
				this.keyMap = config.keyMap || this.defaults.keyMap;
				this.offset = sets.offset;
				this.grid = sets.grid;
				this.focus = sets.focus;
				this.blur = sets.blur;
				this.click = sets.click;
				this.beforeChange = sets.beforeChange;
				this.change = sets.change;
				this.hover = sets.hover;
				this.name = sets.name;
				this.noData = sets.noData;
				this.delayTime = sets.delayTime;
				this.hoverClass = sets.hoverClass ? sets.hoverClass : undefined;
				this.prevIndex = -1;
				this.selectedIndex = -1;
				this.boxIndex = -1;
				this.selector = sets.selector;
				this.frame = x$(sets.frame)[0];
				this.elems(x$(this.selector));
				if (config.forceRec instanceof Array) {
					this.matrix = config.forceRec;
					this.forceRec = false;
				}
				else {
					this.matrix = [];
					this.forceRec = config.forceRec || false;
					var rec = this.forceRec;
					if (rec && typeof rec !== 'boolean') {
						if (rec === 'strict' && this.length) {
							var recagle = this.items[0].getBoundingClientRect();
							rec = {
								x: recagle.left + this.offset.x,
								y: recagle.top + this.offset.y,
								w: recagle.width,
								h: recagle.height
							};
						}
						var x , y , g = this.grid;
						for (var i = 0 , t = g.cols * g.rows; i < t; i++) {
							x = (i % g.cols) * rec.w + rec.x;
							y = (i / g.cols | 0) * rec.h + rec.y;
							this.matrix[i] = {x: x, y: y};
						}
						this.forceRec = false;
					}
				}
				if(this.length) this.setIndex(sets.selectedIndex, 'auto');
				return this;
			},
			reset : function (i, d) {
				/*
				if(this.hoverClass) {
					var sm = this.selectedElem() ;
					if(sm) x$.removeClass(sm , this.hoverClass);
				}
				*/

				this.elems(x$(this.selector));
				this.prevIndex = this.selectedIndex = -1 ;
				if (!isNaN(i) && this.length) this.setIndex(i, d || 'auto');

				return this;
			},
			elems : function (list) {
				this.items = list;
				this.length = list.length;
				if (this.length === 0) {
					if (this.frame) this.frame.style.cssText += ";visibility:hidden;";
					if (this.noData) this.noData();
				}
				//todo: maybe not supported
				else if (this.frame && window.getComputedStyle(this.frame, null).visibility == 'hidden') this.frame.style.cssText += ";visibility:visible;";
				return this;
			},
			jumpToBox: function (i, j) {
				if (i === -1) x$.Box.jumpBack();
				else x$.Box.jumpTo(i, j);
				return this;
			},
			addIntoBox: function (asName) {
				if (asName) this.name = asName;
				x$.Box.addGrid(this);
				return this;
			},
			overRange: function (w) {
				if (this.edgeRule[w] === 'stop') return this;
				switch (w) {
					case 'up':
					case 'left':
						if (this.edgeRule[w] === 'loop') {
							var i = this.selectedIndex - 1;
							this.setIndex(i < 0 ? this.length - 1 : i, w);
						} else {
							this.edgeRule[w].call(this, w);
						}
						break;
					case 'down':
					case 'right':
						if (this.edgeRule[w] === 'loop') {
							var i = this.selectedIndex + 1;
							this.setIndex((i > this.length - 1) ? 0 : i, w);
						} else {
							this.edgeRule[w].call(this, w);
						}
						break;
					default:{}
				}
				return this;
			},
			keyHandler: function (evt) {
				if (this.length !== 0) {
					var keyCode = evt.keyCode ? evt.keyCode : evt.which;
					var keyName = this.keyMap[keyCode];
					if (keyName) {
						if (keyName === 'ok') {
							if(this.click) this.click();
						}
						else {
							//press arrow key
							var c = this.grid.cols,
								r = this.grid.rows;
							if ((keyName === 'left' && this.selectedIndex % c === 0) || (keyName === 'right' && (this.selectedIndex + 1) % c === 0) || (keyName === 'up' && this.selectedIndex < c) || (keyName === 'down' && (this.selectedIndex + c + 1) > Math.min(r * c, this.length))) {
								this.overRange.call(this, keyName);
							}
							else {
								var i = keyName === 'left' ? -1 : keyName === 'right' ? 1 : keyName === 'up' ? -c : c;
								this.setIndex(this.selectedIndex + i, keyName);
							}
						}
					}
				}
				return this;
			},
			setIndex: function (t, direc) {
				if (this.beforeChange) this.beforeChange(direc);
				if (t < 0 || t + 1 > this.length) this.overRange.call(this, direc);
				else {
					clearTimeout(this.timer);
					this.prevIndex = this.selectedIndex;
					this.selectedIndex = t;
					var obj = this.frame, mx;
					if (obj) {
						if (!this.matrix[t] || this.forceRec) {
							//todo: maybe not supported
							var point = this.items[t].getBoundingClientRect();
							mx = {
								x: point.left + this.offset.x,
								y: point.top + this.offset.y
							};
							this.matrix[t] = mx;
						} else {
							mx = this.matrix[t];
						}
						if ((this.grid.rows > 1 && direc) || direc == 'auto') obj.style.cssText += ";top:" + mx.y + "px;";
						if ((this.grid.cols > 1 && direc) || direc == 'auto') obj.style.cssText += ";left:" + mx.x + "px;";
					}
					if (this.hover && direc) this.delay(this, this.hover, this.delayTime, direc);
					if (this.change) this.change(direc);

					//switch hover class
					if (direc != "auto" && this.hoverClass) {
						var sm = this.prevElem();
						if (sm) x$.removeClass(sm, this.hoverClass);

						sm = this.selectedElem();
						x$.addClass(sm, this.hoverClass);
					}
				}
				return this;
			},
			prevElem: function () {
				return this.items[this.prevIndex];
			},
			selectedElem: function () {
				return this.items[this.selectedIndex];
			},
			timer: 0,
			defaults: {
				edgeRule: {
					up: 'stop', down: 'stop', left: 'stop', right: 'stop'
				},
				hover: null,
				focus: function () {
					if (this.frame)  this.frame.style.cssText += ";display:block;";
					if (this.hoverClass) x$.addClass(this.selectedElem(), this.hoverClass);
					return this;
				},
				blur: function () {
					if (this.frame) this.frame.style.cssText += ";display:none;";
					if (this.hoverClass) x$.removeClass(this.selectedElem(), this.hoverClass);
					return this;
				},
				keyMap: {
					"37": "left", "39": "right", "38": "up", "40": "down", "13": "ok"
				},
				offset: { x: 0, y: 0 },
				grid: { cols: 1, rows: 1 },
				selectedIndex: 0,
				delayTime: 1000,
				items: null,
				frame: null
			},
			delay: function (obj, func, time, direc) {
				x$.Grid.delayFunc = function () {
					func.call(obj, direc);
				};
				this.timer = setTimeout(x$.Grid.delayFunc, time);
			}
		};
		Grid.fn.init.prototype = Grid.fn;


		return Grid;
	})();


	//Box Class
	x$.Box = {
		boxes: [],
		current: null,
		currentIndex: -1,
		enable: true,
		eventName: "keydown",
		gridMap: {},
		previous: null,
		previousIndex: -1,
		getGrid: function (i) {
			if (typeof i === 'string') {
				i = this.gridMap[i];
				if (i == undefined) i = -1;
			}
			return this.boxes[i];
		},
		addGrid: function (grid) {
			for (var i = 0, l = arguments.length; i < l; i++) {
				if (arguments[i].name) this.gridMap[arguments[i].name] = this.boxes.length;
				arguments[i].boxIndex = this.boxes.length;
				this.boxes.push(arguments[i]);
			}
			return this;
		},
		removeGrid: function(i){
			if(this.currentIndex === i) {
				this.current = null ;
				this.currentIndex = -1 ;

				if(this.previous){
					this.jumpTo(this.previous) ;
					this.previous = null;
					this.previousIndex = -1 ;
				}
			}
			this.boxes.splice(i,1) ;
			return this;
		} ,
		jumpTo: function (i, j) {
			if (i instanceof x$.Grid) {
				i = i.boxIndex;
			} else if (typeof i === 'string') {
				i = this.gridMap[i];
				if (i == undefined) i = this.currentIndex;
			}
			if (i === -1) i = this.previousIndex;
			var tar = this.boxes[i];
			if (this.current != tar) {
				if (tar.length) {
					if (this.current) {
						this.current.blur();
						this.previous = this.current;
						this.previousIndex = this.currentIndex;
					}
					this.current = tar;
					this.currentIndex = i;
					if (j != undefined) this.current.setIndex(j, 'sync');
					this.current.focus();
				}
			}
			return this;
		},
		jumpBack: function(){
			return this.jumpTo(this.previousIndex);
		},
		keyHolder: function(evt){
			//evt.stopPropagation();
			var xb = x$.Box ;
			if (xb.enable && xb.currentIndex != -1)
				xb.current.keyHandler(evt);
		},
		active: function(evtName){
			if(this.currentIndex === -1 && this.boxes.length) {
				this.jumpTo(0) ;
			}
			this.eventName = evtName || this.eventName;
			x$.on(this.eventName, this.keyHolder);
			return this;
		},
		inactive: function(){
			document.removeEventListener(this.eventName, this.keyHolder);
			return this;
		} ,
		reset : function(blurCurrent , i , j){
			if(blurCurrent && this.current) this.current.blur();
			this.current = this.previous = null ;
			this.currentIndex = this.previousIndex = -1 ;

			if(i !== undefined) this.jumpTo(i , j) ;
		}
	};

	var PageList = function(sets){
		return new PageList.fnc(sets);
	};
	PageList.fnc = function (sets) {
		this.container = x$(sets.container)[0] ;
		this.pageDiv = x$(sets.pageDiv)[0] ;
		this.template = sets.template ;
		this.itemRender = sets.itemRender ;
		this.itemFilter = sets.itemFilter ;
		this.pageSize = sets.pageSize || 5 ;
		this.singlePage = sets.singlePage ;
		this.pagination = sets.pagination ;
		this.noData = sets.noData ;
		this.bound = sets.bound ;
		this.reBind(sets);
		return this;
	};
	PageList.fnc.prototype = {
		selectedItem: function (gridIndex) {
			return this.data[this.pageIndex * this.pageSize + gridIndex];
		},
		reBind: function (sets) {
			this.data = sets.data;
			if (this.data) {
				this.length = sets.data.length;
				var _pageIndex = sets.pageIndex || 0;
				this.pageCount = Math.ceil(this.length / this.pageSize);
				this.pageIndex = Math.min(this.pageCount - 1, _pageIndex);
				if (this.pageCount === 1 && this.singlePage) this.singlePage();

				if (this.length) {
					this.bindPage(this.pageIndex * this.pageSize);
					if (this.bound) this.bound();
				} else {
					this.container[0].innerHTML = '';
					if (this.noData) this.noData();
				}
			}
			return this;
		},
		turnPage: function (i) {
			if (i > 0) {
				this.pageIndex = this.pageIndex + i >= this.pageCount ? 0 : this.pageIndex + i;
			} else {
				this.pageIndex = this.pageIndex - i < 0 ? this.pageCount - 1 : this.pageIndex - i;
			}
			this.bindPage();
		},
		nextPage: function () {
			this.pageIndex = this.pageIndex + 1 === this.pageCount ? 0 : this.pageIndex + 1;
			this.bindPage();
		},
		prevPage: function () {
			this.pageIndex = this.pageIndex === 0 ? this.pageCount - 1 : this.pageIndex - 1;
			this.bindPage();
		},
		bindPage: function () {
			var dataIndex = this.pageIndex * this.pageSize;
			x$.bindList(this.container , {
				template: this.template,
				itemRender: this.itemRender,
				itemFilter: this.itemFilter,
				list: this.pageArray(this.data, dataIndex, this.pageSize)
			});
			if (this.pageDiv) {
				this.pageDiv.style.cssText += ';display:block;';
				if (this.pagination) {
					this.pageDiv.innerHTML = window.formatJSON(this.pagination, {
						current: (this.pageIndex + 1),
						count: this.pageCount
					});
				} else {
					this.pageDiv.innerText = (this.pageIndex + 1) + '/' + this.pageCount + ' ' + unescape('%u9875');
				}
			}
			//if (this.linkedGrid) this.linkedGrid.reset(0 , 'arrSync');
			return this;
		},
		pageArray: function (arr, startIndex, pageSize) {
			var len = arr.length;
			var count = startIndex + pageSize > len ? len % pageSize : pageSize;
			return arr.slice(startIndex, startIndex + count);
		}
	};

	x$.PageList = PageList;

	x$.Grid.fn.extra = x$.Grid.prototype.extra = x$.Grid.fn.init.prototype.extra = PageList.fnc.prototype.extra = function (extras, unsafe) {
		for (var key in extras) {
			if (this[key] === undefined || unsafe) this[key] = extras[key];
		}
		return this;
	};

})(window , x$);
