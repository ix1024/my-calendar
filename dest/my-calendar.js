(function(window, undefied) {
	"use strict";
	var doc = document,
		doe = doc.documentElement,
		kingwell, kw, KW,
		fn,
		userAgent = navigator.userAgent.toLowerCase(),
		isIE = /msie/.test(userAgent),
		deepCopy = function(source) {
			var result = {};
			for (var key in source) {
				result[key] = typeof source[key] === 'object' ? deepCopy(source[key]) : source[key];
			}
			return result;
		},
		extend = function(tagert, source, deep) {
			var subObj = tagert || {};
			var parentObj = source || {};
			parentObj = deepCopy(parentObj);
			for (var key in parentObj) {
				subObj[key] = parentObj[key];
			}
			return subObj;
		};

	//时间
	function MyDate() {}
	MyDate.prototype = {
		fixZero: function(num) {
			return num < 10 ? '0' + num : num;
		},
		isLeapYear: function(year) {
			return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
		},
		getMaxDates: function(year, month) {
			var m = month + 1,
				result;
			if (m === 4 || m === 6 || m === 9 || m === 11) {
				result = 30;
			} else if (m === 2) {
				result = this.isLeapYear(year) ? 29 : 28;
			} else {
				result = 31;
			}
			return result;
		},
		getDateAll: function(dateObj) {
			var date = dateObj || new Date();
			return {
				year: date.getFullYear(),
				month: date.getMonth(),
				date: date.getDate()
			};
		},
		getDate: function(date) {
			var dateObj = null;
			if (this.isString(date)) {
				dateObj = new Date(date);
			} else if (date) {
				dateObj = date;
			} else {
				dateObj = new Date();
			}
			return dateObj;
		},
		getCurrentDate: function(dateObj, format) {
			var formats = ['yyyy-mm-dd', 'yyyy/mm/dd', 'yyyy.mm.dd'],
				date = dateObj || this.getDate(),
				line = '-',
				status = false;
			for (var i = 0; i < formats.length; i++) {
				if (formats[i].toLowerCase() === format) {
					status = true;
					line = formats[i].slice(4, 5);
				}
			}
			return date.getFullYear() + line + this.fixZero(date.getMonth() + 1) + line + this.fixZero(date.getDate());
		},
		compatibleDateFormat: function(dateString) {
			var date = dateString || '';
			return date.replace(/-/g, '/');
		},
		getDates: function(start, end) {
			var _start, _end,
				argStart, argEnd,
				result = 0;
			if (arguments.length === 1) {
				argStart = new Date();
				argEnd = start;
			} else {
				argStart = this.compatibleDateFormat(start);
				argEnd = this.compatibleDateFormat(end);
			}
			_start = new Date(argStart);
			_end = new Date(argEnd);
			result = Math.floor((_end.getTime() - _start.getTime()) / (1000 * 60 * 60 * 24));
			return isNaN(result) ? 0 : result;
		},
		isValidDate: function(date) {
			return date !== '' && (new Date(date) + '') !== 'Invalid Date';
		}
	};
	//判断是否某种类型
	function MyType() {}
	MyType.prototype = {
		is: function(o, type) {
			var obj = Object.prototype.toString.call(o);
			if (arguments.length === 2) {
				return obj === '[object ' + type + ']';
			} else {
				return obj.slice(7, -1).toLowerCase();
			}
		},
		isArray: function(o) {
			return this.is(o, 'Array');
		},
		isObject: function(o) {
			return this.is(o, 'Object');
		},
		isFunction: function(o) {
			return this.is(o, 'Function');
		},
		isNumber: function(o) {
			return this.is(o, 'Number');
		},
		isString: function(o) {
			return this.is(o, 'String');
		},
		isElement: function(o) {
			return (o && o.nodeName) ? true : false;
		},
		isForm: function(obj) {
			var o = this.MyDom.getId(obj);
			return this.isElement(o) && (o.tagName.toLowerCase() === 'input' || o.tagName.toLowerCase() === 'textarea');
		}
	};
	//MyDom Edit
	function MyDom() {}
	MyDom.prototype = {
		getId: function(id) {
			return this.isString(id) ? doc.getElementById(id) : id;
		},
		swapNode: function(node1, node2) {
			var n1 = this.getId(node1),
				n2 = this.getId(node2),
				next, parent;
			if (this.isElement(n1) && this.isElement(n2)) {
				if (doc.swapNode) {
					n1.swapNode(n2);
				} else {
					next = n1.nextSibling;
					parent = n1.parentNode;
					n2.parentNode.replaceChild(n1, n2);
					parent.insertBefore(n2, next);
				}
				return true;
			}
		},
		createElement: function(elem, obj) {
			var element = doc.createElement(elem);
			for (var pro in obj) {
				if (pro === 'class' || pro === 'className') {
					element.className = obj[pro];
				} else {
					element.setAttribute(pro, obj[pro]);
				}
			}
			return element;
		},
		html: function(node, html) {
			var elem = this.getId(node);
			if (!this.isElement(elem)) {
				return '';
			}
			if (arguments.length > 1) {
				elem.innerHTML = html;
			} else {
				return elem.innerHTML;
			}
			return elem;
		},
		text: function(node, text) {
			var result,
				_text = function(node) {
					var result = [],
						chilrens = node.childNodes,
						len = chilrens.length,
						i, element;
					for (i = 0; i < len; i++) {
						element = chilrens[i];
						if (element.nodeType === 3) {
							result.push(element.nodeValue);
						} else {
							result.push(_text(element));
						}
					}
					return result.join('');
				};
			if (!this.isElement(node)) {
				result = node;
			} else {
				if (arguments.length === 1) {
					result = _text(node);
				} else {
					if (node.textContent) {
						node.textContent = text;
					} else if (node.innerHTML) {
						node.innerHTML = text;
					}
					result = node;
				}
			}
			return result;
		},
		val: function(elem, value) {
			if (this.isForm(elem)) {
				if (arguments.length === 2) {
					elem.value = value;
				} else {
					return elem.value;
				}
			} else {
				return null;
			}
		},
		append: function(child, parent) {
			var sonElem = this.isString(child) ? this.getId(child) : child,
				par = this.isString(parent) ? this.getId(parent) : parent;
			if (!this.isElement(par)) {
				par = doc.body;
			}
			if (!this.isElement(sonElem) || !this.isElement(par)) {
				return;
			}
			par.appendChild(sonElem);
		},
		insertBefore: function(newNode, oldNode) {
			if (this.isElement(newNode) && this.isElement(oldNode) && oldNode.parentNode) {
				oldNode.parentNode.insertBefore(newNode, oldNode);
			}
		},
		insertAfter: function() {},
		nextNode: function(node) {
			var nextNode;
			node = this.isString(node) ? this.getId(node) : node;
			if (!this.isElement(node)) {
				return null;
			}
			nextNode = node.nextSibling;
			if (!nextNode) {
				return null;
			}
			while (true) {
				if (nextNode.nodeType === 1) {
					break;
				} else {
					if (nextNode.nextSibling) {
						nextNode = nextNode.nextSibling;
					} else {
						break;
					}
				}
			}
			return nextNode.nodeType === 1 ? nextNode : null;
		},
		empty: function(node) {
			if (this.isElement(node)) {
				while (node.firstChild) {
					node.removeChild(node.firstChild);
				}
			}
			return node;
		},
		setAttribute: function(o, obj) {
			if (this.isElement(o) && this.isPlainObject(obj)) {
				for (var i in obj) {
					if (i.toLowerCase() === 'class' || i.toLowerCase() === 'for') {
						o.setAttribute(i, obj[i]);
					} else {
						o[i] = obj[i];
					}
				}
			}
		},
		getAttribute: function(o, obj) {
			if (this.isElement(o) && this.isString(obj)) {
				if (obj.toLowerCase() === 'class' || obj.toLowerCase() === 'for') {
					return o.getAttribute(obj);
				} else {
					return o.obj;
				}
			}
		},
		remove: function(o) {
			if (o && o.parentNode) {
				o.parentNode.removeChild(o);
			}
		},
		addClass: function(o, str) {
			if (!this.isElement(o)) {
				return;
			}
			var className = o.className,
				reg = eval("/^" + str + "$ | " + str + "$|^" + str + " | " + str + " /");
			if (reg.test(className)) {
				return;
			}
			if (className !== '') {
				o.className = className + " " + str;
			} else {
				o.className = str;
			}
		},
		removeClass: function(o, str) {
			if (!this.isElement(o)) {
				return;
			}
			var className = o.className;
			if (this.isEmpty(className)) {
				var reg = new RegExp(str, "g"),
					n = className.replace(reg, "");
				o.className = n;
			}
		},
		hasClass: function(o, str) {
			if (!this.isElement(o)) {
				return;
			}
			var className = o.className,
				reg = eval("/^" + str + "$| " + str + "$|^" + str + " | " + str + " /");
			if (reg.test(className)) {
				return true;
			} else {
				return false;
			}
		}
	};
	//MyCss
	function MyCss() {}
	MyCss.prototype = {
		getComputedStyle: function(element, styleName) {
			var style = '';
			if (window.getComputedStyle) {
				style = element.ownerDocument.defaultView.getComputedStyle(element, null).getPropertyValue(styleName);
			} else if (element.currentStyle) {
				style = element.currentStyle[styleName];
			}
			return style;
		},
		setStyle: function(o, obj) {
			if (this.isElement(o) && this.isPlainObject(obj)) {
				for (var i in obj) {
					o.style[i] = obj[i];
				}
			}
		},
		setCss: function(tar, obj) {
			var o = this.getId(tar);
			if (this.isElement(o) && this.isPlainObject(obj)) {
				var str = '';
				for (var i in obj) {
					str += i + ':' + obj[i] + '; ';
				}
				o.style.cssText += (' ;' + str);
			}
			return o;
		},
		setOpacity: function(obj, val) {
			if (!this.isElement(obj)) {
				return;
			}
			var num = (val && val >= 0 && val <= 100) ? val : 100;
			if (d.addEventListener) {
				obj.style.opacity = num / 100;
			} else {
				obj.style.filter = 'alpha(opacity=' + num + ')';
			}
		},
		getMaxZindex: function(o) {
			var maxZindex = 0,
				obj = o ? o : '*',
				divs = d.getElementsByTagName(obj);
			for (var z = 0, len = divs.length; z < len; z++) {
				maxZindex = Math.max(maxZindex, divs[z].style.zIndex);
			}
			return maxZindex;
		}
	};
	//MyBox
	function MyBox() {}
	MyBox.prototype = {
		getBox: function(o) {
			var obj = o;
			return {
				left: parseInt(obj.offsetLeft, 10),
				top: parseInt(obj.offsetTop, 10),
				width: parseInt(obj.offsetWidth, 10),
				height: parseInt(obj.offsetHeight, 10)
			};
		},
		getPosition: function(obj) {
			var o = this.getId(obj);
			if (!this.isElement(o)) {
				return null;
			}
			var t = parseInt(o.offsetTop, 10),
				l = parseInt(o.offsetLeft, 10),
				w = parseInt(o.offsetWidth, 10),
				h = parseInt(o.offsetHeight, 10);
			while (o = o.offsetParent) {
				t += parseInt(o.offsetTop, 10);
				l += parseInt(o.offsetLeft, 10);
			}
			return {
				left: l,
				top: t,
				width: w,
				height: h
			};
		},
		getQueryString: function(name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"),
				r = location.search.substr(1).match(reg);
			if (r !== null)
				return unescape(r[2]);
			return null;
		},
		isPlainObject: function(obj) {
			return (!obj || !this.isObject(obj) || obj.nodeType || obj.setInterval) ? false : true;
		}
	};
	//MyEvent
	function MyEvent() {}
	MyEvent.prototype = {
		on: function() {},
		off: function() {},
		getEvent: function(ev) {
			return ev || window.event;
		},
		getTarget: function(ev) {
			return this.getEvent(ev).target || this.getEvent(ev).srcElement;
		},
		stopPropagation: function(ev) {
			if (window.event) {
				return this.getEvent(ev).cancelBubble = true;
			} else {
				return this.getEvent(ev).stopPropagation();
			}
		},
		stopDefault: function(ev) {
			if (window.event) {
				return this.getEvent().returnValue = false;
			} else {
				return this.getEvent(ev).preventDefault();
			}
		},
		which: function(ev) {
			return this.getEvent(ev).keyCode;
		}
	};

	function Kingwell() {}
	Kingwell.prototype = fn = {
		extend: extend,
		trim: function(str) { //Trim String
			var result = '',
				reg = /^\s*(.*?)\s*$/;
			if (this.isString(str)) {
				if (this.isFunction(result.tirm)) {
					result = str.trim();
				} else {
					result = str.replace(reg, '$1');
				}
			} else {
				result = str;
			}
			return result;
		},
		escape: function(str) {
			var result = "";
			if (str.length === 0) {
				return result;
			}
			result = str.replace(/&/g, "&amp;");
			result = resulteplace(/</g, "&lt;");
			result = resulteplace(/>/g, "&gt;");
			result = resulteplace(/ /g, "&nbsp;");
			result = resulteplace(/\'/g, "&#39;");
			result = resulteplace(/\"/g, "&quot;");
			return result;
		}
	};

	KW = {
		extend: extend,
		Type: MyType,
		Dom: MyDom,
		Css: MyCss,
		Event: MyEvent,
		Date: MyDate,
		Box: MyBox,
		Kingwell: Kingwell
	};

	//继承
	for (var key in KW) {
		extend(fn, new KW[key]);
	}
	window.kw = new Kingwell();
	window.KW = KW;

})(this);
(function(window, undefined) {
	var fn;

	function MyCalendarDefault() {}
	MyCalendarDefault.prototype = {
		weekStart: 0,
		error: function() {}, //出错回调
		callback: function() {}, //回调，this为实例，第一个参数为date string，第二个参数为一个对象
		selected: function() {},
		top: 5, //左边距离
		left: 0, //上边距离 
		skin: '', //皮肤样式
		minDate: '', //最小日期
		maxDate: '', //最大日期
		readOnly: true, //插件只读
		showAllDate: false, //显示所有日期，包括上月，下月的日期
		showWeek: false,
		weekText: ['日', '一', '二', '三', '四', '五', '六'],
		headerUnit: ['年', '月', '日'],
		monthUnit: ['月']
	};

	function MyCalendar(options) {
		var ops = options || {};
		this.el = ops.el;
		for (var key in options) {
			this[key] = options[key];
		}
		this.maxDate = this.compatibleDateFormat(this.maxDate);
		this.minDate = this.compatibleDateFormat(this.minDate);
		this.init();
	}
	MyCalendar.prototype = fn = {
		name: 'calendar',
		setValue: function() {
			var _this = this;
			if (!_this.defaultValue) {
				_this.defaultValue = _this.el.value;
			}

			if (_this.readOnly) {
				_this.el.readOnly = true;
			}
		},
		setPostion: function() {
			var _this = this,
				pos = _this.getPosition(_this.el);
			_this.setCss(_this.box, {
				top: pos.top + pos.height + _this.top + 'px',
				left: pos.left + _this.left + 'px'
			});
		},
		initDate: function() {
			var date = null,
				value = this.defaultValue || this.el.value;
			if (this.isValidDate(value)) {
				this.el.value = value;
				this.text(this.el, value);
				date = this.compatibleDateFormat(value);
			}
			this.DATE = this.getDate(date); /*new Date('2016-03-25');*/
			this.Y = this.DATE.getFullYear();
			this.M = this.DATE.getMonth();
			this.D = this.DATE.getDate();
		},
		init: function() {
			this.el.tabIndex = 0;
			this.initDate();
			this.create();
			this.events();
			this.addClass(this.box, this.skin);
		},
		events: function() {
			var _this = this;
			_this.el.onfocus = function() {
				_this.open();
			};
			_this.el.onblur = function() {
				clearTimeout(_this.timer);
				_this.timer = setTimeout(function() {
					if (!_this.editStatus) {
						_this.close();
					}
				}, 100);
			};
			_this.box.onmousedown = function() {
				_this.editStatus = true;
			};
			_this.box.onmouseout = function() {
				_this.editStatus = false;
				_this.el.focus();
			};
			_this.box.onclick = function() {};
			_this.yearPrev.onclick = function() {
				_this.yearNum -= 10;
				_this.updateYear({
					year: _this.yearNum
				});
			};
			_this.yearNext.onclick = function() {
				_this.yearNum += 10;
				_this.updateYear({
					year: _this.yearNum
				});
			};
		},
		getDateStatus: function() { //判断最小日期是否大于最大日历
			var status = true;
			if (this.minDate && this.maxDate) {
				if (this.getDates(this.minDate, this.maxDate) < 0) {
					status = false;
				}
			}
			return status;
		},
		select: function() {
			var _this = this,
				args = arguments[0],
				date = this.getNewDate(this.Y, this.M, this.D),
				dateString = _this.getCurrentDate(date);
			try {

				_this.el.value = dateString;
				_this.text(_this.el, dateString);
				_this.editStatus = false;
				_this.callback.call(_this, dateString, args);
			} catch (e) {}
			if (args.type === 'date') {
				_this.close();
			}
		},
		log: function() {
			try {
				console.log.apply(console, arguments);
			} catch (e) {}
			return this;
		},
		__createYear: function() {
			var _this = this;
			_this.box = _this.createElement('div', {
				className: _this.name + '-box'
			});
			//年份
			_this.yearHeader = _this.createElement('div', {
				className: _this.name + '-year-header'
			});
			_this.yearBox = _this.createElement('div', {
				className: _this.name + '-year-box'
			});
			_this.yearTableBox = _this.createElement('div', {
				className: _this.name + '-year-table-box'
			});
			_this.yearTable = _this.createElement('table', {
				className: _this.name + '-year-table'
			});
			_this.yearThead = _this.createElement('thead', {
				className: _this.name + '-year-thead'
			});
			_this.yearTbody = _this.createElement('tbody', {
				className: _this.name + '-year-body'
			});
			_this.yearPage = _this.createElement('div', {
				className: _this.name + '-year-page'
			});
			_this.yearPrev = _this.createElement('div', {
				className: _this.name + '-year-prev'
			});
			_this.yearNext = _this.createElement('div', {
				className: _this.name + '-year-next'
			});
			_this.append(_this.yearThead, _this.yearTable);
			_this.append(_this.yearTbody, _this.yearTable);
			_this.append(_this.yearHeader, _this.yearBox);
			_this.append(_this.yearTable, _this.yearTableBox);
			_this.append(_this.yearTableBox, _this.yearBox);
			_this.yearPrev.innerHTML = '<span>＜</span>';
			_this.yearNext.innerHTML = '<span>＞</span>';
			_this.append(_this.yearPrev, _this.yearPage);
			_this.append(_this.yearNext, _this.yearPage);
			_this.append(_this.yearPage, _this.yearBox);
			_this.append(_this.yearBox, _this.box);
		},
		__createMonth: function() {
			var _this = this;
			//月份
			this.monthBox = _this.createElement('div', {
				className: _this.name + '-month-box'
			});
			this.monthHeader = _this.createElement('div', {
				className: _this.name + '-month-header'
			});
			this.monthTableBox = _this.createElement('div', {
				className: _this.name + '-month-table-box'
			});
			this.monthTable = _this.createElement('table');
			this.monthThead = _this.createElement('thead');
			this.monthTbody = _this.createElement('tbody');
			this.monthTfoot = _this.createElement('tfoot');
			_this.append(_this.monthThead, _this.monthTable);
			_this.append(_this.monthTfoot, _this.monthTable);
			_this.append(_this.monthTbody, _this.monthTable);
			_this.append(_this.monthHeader, _this.monthBox);
			_this.append(_this.monthTable, _this.monthTableBox);
			_this.append(_this.monthTableBox, _this.monthBox);
			_this.append(_this.monthBox, _this.box);
		},
		__createDate: function() {
			var _this = this;
			//天数
			_this.dateBox = _this.createElement('div', {
				className: _this.name + '-date-box'
			});
			_this.dateHeader = _this.createElement('div', {
				className: _this.name + '-date-header'
			});
			_this.dateTableBox = _this.createElement('div', {
				className: _this.name + '-date-table-box'
			});
			_this.dateTable = _this.createElement('table', {
				className: _this.name
			});
			_this.dateThead = _this.createElement('thead', {
				className: _this.name
			});
			_this.dateTbody = _this.createElement('tbody', {
				className: _this.name
			});
			_this.dateTfoot = _this.createElement('tfoot', {
				className: _this.name
			});
			_this.append(_this.dateThead, _this.dateTable);
			_this.append(_this.dateTfoot, _this.dateTable);
			_this.append(_this.dateTbody, _this.dateTable);
			_this.append(_this.dateHeader, _this.dateBox);
			_this.append(_this.dateTable, _this.dateTableBox);
			_this.append(_this.dateTableBox, _this.dateBox);
			_this.append(_this.dateBox, _this.box);
		},
		create: function() {
			this.__createYear();
			this.__createMonth();
			this.__createDate();
		},
		update: function() {
			this.updateYear();
			this.updateMonth();
			this.updateDate();
		},
		open: function() {
			if (!this.lock) {
				this.lock = true;
				this.update();
				this.append(this.box);
				this.initDate();
				this.setPostion();
				this.setValue();
				this.dateError = this.getDateStatus();
				this.yearNum = 0;
				if (!this.dateError) {
					this.error.call(this, '最小日期不能大于最大日期');
				}
			}
		},
		close: function() {
			var _this = this;
			_this.lock = false;
			_this.remove(_this.box);
		},
		getEnableStatus: function(value, type) { //获取日期范围
			var _this = this,
				status = true,
				minStatus, maxStatus,
				date,
				minDate = new Date(_this.minDate),
				maxDate = new Date(_this.maxDate);
			switch (type) {
				case 'year':
					minStatus = value < minDate.getFullYear();
					maxStatus = value > maxDate.getFullYear();
					break;
				case 'month':
					date = new Date();
					date.setYear(_this.Y);
					date.setMonth(value);
					if (_this.minDate) {
						date.setDate(_this.getMaxDates(_this.Y, value));
						minStatus = _this.getDates(_this.minDate, _this.getCurrentDate(date)) < 0;
					}
					if (_this.maxDate) {
						date.setDate(1);
						maxStatus = _this.getDates(_this.maxDate, _this.getCurrentDate(date)) > 0;
					}
					break;
				case 'date':

					if (_this.minDate) {
						minStatus = _this.getDates(_this.minDate, _this.getCurrentDate(value)) < 0;
					}
					if (_this.maxDate) {
						maxStatus = _this.getDates(_this.maxDate, _this.getCurrentDate(value)) > 0;
					}
					break;
			}
			//最小日期
			if (_this.minDate) {
				if (minStatus) {
					status = false;
				} else {
					status = true;
				}
			}
			//最大日期
			if (_this.maxDate) {
				if (maxStatus) {
					status = false;
				} else {
					status = true;
				}
			}
			//两个都存在
			if (_this.minDate && _this.maxDate) {
				if (minStatus || maxStatus) {
					status = false;
				} else {
					status = true;
				}
			}
			if (status) {
				status = _this.getDateStatus();
			}
			return status;
		},
		getNewDate: function(year, month, date) {
			var _date = new Date();
			_date.setYear(year);
			_date.setMonth(month);
			_date.setDate(date);
			return _date;
		},
		updateYear: function(options) {
			var _this = this,
				ops = options || {},
				dateObj = ops.date || _this.DATE,
				year = ops.year || 0,
				grid = ops.grid || 2,
				_year = dateObj.getFullYear() + year,
				fra = document.createDocumentFragment(),
				theadTr, th,
				tbodyTr, td, i = 0;
			_this.empty(_this.yearTbody);
			_this.yearHeader.innerHTML = _this.Y + _this.headerUnit[0];
			for (var y = _year - 5; y < _year + 5; y++) {
				var status = true;
				if (i % grid === 0) {
					tbodyTr = _this.createElement('tr');
				}
				td = _this.createElement('td');
				td.innerHTML = y;
				if (y === _this.Y) {
					_this.addClass(td, _this.name + '-this-year');
				}
				status = _this.getEnableStatus(y, 'year');
				if (status) {
					(function(year) {
						td.onclick = function() {
							_this.Y = year;
							_this.updateYear({
								year: _this.yearNum
							});
							_this.updateMonth();
							_this.updateDate();
							_this.select({
								type: 'year'
							});
						};
					})(y);
					_this.addClass(td, _this.name + '-enabled');
				} else {
					_this.addClass(td, _this.name + '-disabled');
				}
				_this.append(td, tbodyTr);
				_this.append(tbodyTr, fra);
				i++;
			}
			_this.append(fra, _this.yearTbody);
		},
		updateMonth: function(options) {
			var _this = this,
				ops = options || {},
				month = ops.month,
				frg = document.createDocumentFragment(),
				tBodyTr, th, i = 0;
			_this.monthHeader.innerHTML = _this.M + 1 + _this.headerUnit[1];
			_this.empty(_this.monthTbody);
			for (var m = 0; m < 12; m++) {
				var status = true;
				td = _this.createElement('td');
				td.innerHTML = m + 1 + _this.monthUnit[0];
				if (i % 2 === 0) {
					tBodyTr = _this.createElement('tr');
				}
				i++;
				if (m === _this.M) {
					_this.addClass(td, _this.name + '-this-month');
				}
				status = _this.getEnableStatus(m, 'month');

				if (status) {
					(function(month) {

						td.onclick = function() {
							var date = new Date();
							_this.M = month;
							_this.updateMonth();
							date.setYear(_this.Y);
							date.setMonth(_this.M);
							_this.updateDate({
								date: date
							});
							_this.select({
								type: 'month'
							});
						};
					})(m);
				}
				if (!status) {
					_this.addClass(td, _this.name + '-disabled');
				} else {
					_this.addClass(td, _this.name + '-enabled');
				}
				_this.append(td, tBodyTr);
				_this.append(tBodyTr, frg);
			}
			_this.append(frg, _this.monthTbody);
		},

		updateDate: function(options) {
			var _this = this,
				ops = options || {},
				dateObj = ops.date || _this.DATE,
				_year, _month, _date,
				days, firstDay,
				nowMonthDate, prevMonthDate, nextMonthDate = 1,
				currentDate,
				dateObj, frg = document.createDocumentFragment();

			_year = _this.Y || dateObj.getFullYear();
			_month = _this.M || dateObj.getMonth();
			_date = _this.D || dateObj.getDate();
			days = _this.getMaxDates(_year, _month);

			firstDay = new Date(_year, _month, 1).getDay(), showMonth = _month + 1;
			_this.dateHeader.innerHTML = _this.D + _this.headerUnit[2];

			if (_this.showWeek) { //Clear Table
				_this.empty(_this.dateThead);
			}

			_this.empty(_this.dateTbody);

			for (var i = 0; i < 6; i++) {
				var tr = _this.createElement('tr'); //this.dateTbody.insertRow(i);				
				for (var j = 0; j < 7; j++) {
					var th,
						td = _this.createElement('td'), //td = this.dateTbody.rows[i].insertCell(j),
						num = i * 7 + j,
						status = true,
						current, month = 0,
						showAllDate = true;

					nowMonthDate = num - firstDay + 1;
					prevMonthDate = Math.abs(firstDay - j - _this.getMaxDates(_year, _month - 1) - 1);
					if (_this.showWeek) {
						if (!i && !j) { //插件头部-星期
							this.dateThead.insertRow(i);
						}
						if (!i) {
							th = this.dateThead.rows[i].insertCell(j);
							th.innerHTML = _this.weekText[j];
							//设置样式
							if (j === 5 || j === 6) { //周末
								_this.addClass(th, _this.name + '-weekend');
							}
						}
					}

					//设置文本内容
					if (num < firstDay) { //上个月
						current = prevMonthDate;
						month = -1;
						currentDate = _this.getNewDate(_year, _month - 1, prevMonthDate);
						showAllDate = _this.showAllDate;
						if (showAllDate) {
							td.innerHTML = prevMonthDate;
						}
					} else if (num >= days + firstDay) { //下个月
						current = nextMonthDate;
						currentDate = _this.getNewDate(_year, _month, nowMonthDate);
						showAllDate = _this.showAllDate;
						if (showAllDate) {
							td.innerHTML = nextMonthDate;
						}
						nextMonthDate++;
					} else { //本月
						td.innerHTML = nowMonthDate;
						current = nowMonthDate;
						month = 1;
						currentDate = _this.getNewDate(_year, _month, nowMonthDate);
					}
					status = _this.getEnableStatus(currentDate, 'date');

					if (status) {
						(function(date, month, currentDate, showAllDate) {
							td.title = _this.getCurrentDate(currentDate);
							if (!showAllDate) {
								return;
							}
							td.onclick = function() {
								var result;
								result = _this.getDateAll(currentDate);
								_this.Y = result.year;
								_this.M = result.month;
								_this.D = result.date;
								_this.updateYear({
									year: _this.yearNum
								});
								_this.updateMonth({
									date: currentDate
								});
								_this.updateDate({
									date: currentDate
								});
								_this.select({
									type: 'date'
								});
							};
						})(current, month, currentDate, showAllDate);
					}

					//设置样式
					if (j === 0 || j === 6) { //周末
						_this.addClass(td, _this.name + '-weekend');
					}
					if (nowMonthDate === _date) {
						_this.addClass(td, _this.name + '-today');
					}
					if (num < firstDay || num >= days + firstDay) {
						_this.addClass(td, _this.name + '-non-current');
					} else {
						_this.addClass(td, _this.name + '-current');
					}
					if (!status) {
						_this.addClass(td, _this.name + '-disabled');
					} else {
						if (showAllDate) {
							_this.addClass(td, _this.name + '-enabled');
						}
					}
					_this.append(td, tr);
				}
				_this.append(tr, frg);
			}
			_this.append(frg, _this.dateTbody);
		}
	};

	KW.extend(fn, new KW.Type());
	KW.extend(fn, new KW.Dom());
	KW.extend(fn, new KW.Css());
	KW.extend(fn, new KW.Date());
	KW.extend(fn, new KW.Event());
	KW.extend(fn, new KW.Box());
	KW.extend(fn, new KW.Kingwell());
	KW.extend(fn, new MyCalendarDefault());
	MyCalendar.toString = function() {
		return '日历插件';
	};
	window.MyCalendar = MyCalendar;
})(this);