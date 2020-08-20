/// <reference path="../dist/index.d.ts" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// tsc -t es5 -w demo.ts
(function b() {
    return __awaiter(this, void 0, void 0, function () {
        var m;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, x$.getJSON({
                        url: 'https://jsonplaceholder.typicode.com/posts/1',
                        method: 'GET',
                        params: {
                            beginTime: '2020-08-06 00:00:00',
                            endTime: '2020-08-06 23:59:59',
                        },
                    })];
                case 1:
                    m = _a.sent();
                    console.log(m);
                    return [2 /*return*/];
            }
        });
    });
})();
var overCount = 0;
var menuBar = x$.dom.byId('menu');
var fullIemList = x$.dom.select('#menu>li');
var menu = x$.grid('#menu>.show', {
    name: 'menu',
    grid: { cols: 6 },
    forceRec: 'strict',
    hoverClass: 'hover',
    edgeRule: {
        right: function () {
            if (menu.selectedIndex + overCount + 1 < fullIemList.length) {
                overCount++;
                menu.items[0].className = '';
                menu.items[5].className = 'show';
                menuBar.style.marginLeft = -overCount * 185 + 'px';
                fullIemList[menu.selectedIndex + overCount].className = 'show';
                menu.reset(5, 'right');
            }
            else {
                overCount = 0;
                menu.items[5].className = '';
                menu.items[4].className = '';
                menu.items[3].className = '';
                menu.items[2].className = '';
                menu.items[1].className = '';
                menu.items[0].className = '';
                fullIemList[0].className = 'show';
                fullIemList[1].className = 'show';
                fullIemList[2].className = 'show';
                fullIemList[3].className = 'show';
                fullIemList[4].className = 'show';
                fullIemList[5].className = 'show';
                menu.reset(0, 'left');
                menuBar.style.marginLeft = '0px';
            }
        },
        left: function () {
            if (menu.selectedIndex + overCount - 1 > -1) {
                overCount--;
                menu.items[0].className = 'show';
                menu.items[5].className = '';
                menuBar.style.marginLeft = -overCount * 185 + 'px';
                fullIemList[menu.selectedIndex + overCount].className = 'show';
                menu.reset(0, 'left');
            }
            else {
                var c = fullIemList.length;
                overCount = c - 6;
                menu.items[5].className = '';
                menu.items[4].className = '';
                menu.items[3].className = '';
                menu.items[2].className = '';
                menu.items[1].className = '';
                menu.items[0].className = '';
                fullIemList[c - 1].className = 'show';
                fullIemList[c - 2].className = 'show';
                fullIemList[c - 3].className = 'show';
                fullIemList[c - 4].className = 'show';
                fullIemList[c - 5].className = 'show';
                fullIemList[c - 6].className = 'show';
                menu.reset(5, 'right');
                menuBar.style.marginLeft = -overCount * 185 + 'px';
            }
        },
        up: function () {
            if (menu.selectedIndex > 4) {
                menu.jumpToBox(topBtns);
            }
            // else this.jumpToBox(topNumber);
        },
    },
});
//top btn
var topBtns = x$.grid('.navBtn', {
    name: 'topBtns',
    frameId: 'frame0',
    grid: { cols: 2 },
    edgeRule: {
        // left: function () {
        // 	topBtns.jumpToBox(topNumber);
        // },
        down: function () {
            topBtns.jumpToBox(menu);
        },
    },
    onOk: function () {
        // switch (this.selectedIndex) {
        // 	case 0: {
        // 		//go to category index page
        // 		location.assign(x$.on.homepage);
        // 		break;
        // 	}
        // 	case 1: {
        // 		//go to main home page
        // 		location.assign(x$.on.homepage);
        // 		break;
        // 	}
        // }
    },
});
x$.box.addGrid(menu, topBtns).active();
