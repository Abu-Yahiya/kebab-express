/* Kebab Express: dish pictures.
   Every dish uses a real photo (assets/img and assets/img/dishes); a drawn illustration is only a fallback
   (returned as an SVG data URI, so it works anywhere an <img src> does).
   To use your own photo for a dish, add it to PHOTO_BY_NAME below or set item.img in menu-data.js. */
(function () {
	'use strict';
	var KE = (window.KE = window.KE || {});

	/* ---------- real photos we already have ---------- */
	var PHOTO_BY_NAME = {
		Durum: 'doner-wrap.jpg',
		'Doner / Pita': 'doner-wrap.jpg',
		'Durum XXL': 'doner-wrap.jpg',
		'Durum al Horno': 'doner-wrap.jpg',
		'Doner Box': 'doner-wrap.jpg',
		'Durum / Doner con Falafel': 'hummus-falafel.jpg',
		'Plato Kebab': 'iskender.jpg',
		'Plato Shish Kebab': 'kofta-shish.jpg',
		'Plato Pincho de Pollo': 'kofta-shish.jpg',
		'Plato Falafel': 'hummus-falafel.jpg',
	};


	/* ---------- real photos in assets/img/dishes (credits listed on the Gallery page) ---------- */
	function dishPhoto(it) {
		var n = it.name.toLowerCase(),
			d = it.desc.toLowerCase(),
			f = null;
		if (it.cat === 'pizzas') {
			f = /margarita/.test(n) ? 'pizza-margherita' : /salami/.test(n) ? 'pizza-salami' : /doner/.test(n) ? 'pizza-doner' :
				/quesos/.test(n) ? 'pizza-4cheese' : /hawai/.test(n) ? 'pizza-hawaiian' : /vegetal/.test(n) ? 'pizza-vegetable' :
				/at[uú]n gamba/.test(n) ? 'pizza-shrimp' : /at[uú]n/.test(n) ? 'pizza-tuna' : /porciones/.test(n) ? 'pizza-generic' :
				/gamba/.test(n) ? 'pizza-shrimp' : /barbacoa/.test(n) ? 'pizza-bbq' : /pavo/.test(n) ? 'pizza-turkey' :
				/carbonara/.test(n) ? 'pizza-carbonara' : /cheese fries/.test(n) ? 'cheese-fries' : /calzone/.test(n) ? 'calzone' : 'pizza-margherita';
		} else if (it.cat === 'burgers') f = 'burger';
		else if (it.cat === 'kids') f = 'kids-meal';
		else if (it.cat === 'durum') f = /taco/.test(n) ? 'taco' : /pita/.test(n) ? 'doner-pita' : n === 'durum' ? 'durum' : null;
		else if (it.cat === 'plates')
			f = /frankfurt/.test(n) ? 'frankfurt' : /alitas/.test(n) ? 'wings' : /nugget/.test(n) ? 'nuggets' : /muslo/.test(n) ? 'drumstick' :
				/aros/.test(n) ? 'onion-rings' : /cheese/.test(n) ? 'cheese-fries' : /huevo/.test(n) ? 'fried-eggs' : /hamburg/.test(n) ? 'burger' : null;
		else if (it.cat === 'offers') {
			if (PHOTO_BY_NAME[it.name]) return null;
			var order = [[/rollo/, 'rollo'], [/taco/, 'taco'], [/hamburg/, 'burger'], [/pizza/, 'pizza-margherita'], [/pita/, 'doner-pita'], [/durum|doner/, 'durum'], [/huevo/, 'fried-eggs']];
			for (var i = 0; i < order.length; i++) if (order[i][0].test(n)) { f = order[i][1]; break; }
			if (!f) f = 'burger';
		}
		return f ? 'assets/img/dishes/' + f + '.jpg' : null;
	}

	/* ---------- tiny SVG helpers ---------- */
	function n1(v) {
		return Math.round(v * 10) / 10;
	}
	function circ(x, y, r, f, st) {
		return (
			'<circle cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + r + '" fill="' + f + '"' +
			(st ? ' stroke="' + st + '" stroke-width="2"' : '') + '/>'
		);
	}
	function ell(x, y, rx, ry, f, rot, st) {
		return (
			'<ellipse cx="' + n1(x) + '" cy="' + n1(y) + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '"' +
			(rot ? ' transform="rotate(' + n1(rot) + ' ' + n1(x) + ' ' + n1(y) + ')"' : '') +
			(st ? ' stroke="' + st + '" stroke-width="2"' : '') + '/>'
		);
	}
	function rect(x, y, w, h, rad, f, rot) {
		return (
			'<rect x="' + n1(x - w / 2) + '" y="' + n1(y - h / 2) + '" width="' + w + '" height="' + h +
			'" rx="' + rad + '" fill="' + f + '"' +
			(rot ? ' transform="rotate(' + n1(rot) + ' ' + n1(x) + ' ' + n1(y) + ')"' : '') + '/>'
		);
	}
	function path(d, f, st, sw) {
		return (
			'<path d="' + d + '" fill="' + (f || 'none') + '"' +
			(st ? ' stroke="' + st + '" stroke-width="' + (sw || 2) + '" stroke-linecap="round"' : '') + '/>'
		);
	}
	function rng(seed) {
		var s = seed >>> 0 || 1;
		return function () {
			s = (s * 1664525 + 1013904223) >>> 0;
			return s / 4294967296;
		};
	}
	function hash(str) {
		var h = 7;
		for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
		return h;
	}

	/* ---------- icons, each drawn in a ±100 box around 0,0 ---------- */
	var PIZZA_TOP = {
		margarita: [['#2f8f3a', 'l', 9, 7], ['#d33a2c', 'c', 7, 5]],
		salami: [['#a8322a', 'c', 11, 9, '#7e1f1a']],
		doner: [['#8a5230', 's', 9, 12], ['#3e9a3a', 's', 7, 6], ['#e2b43a', 'c', 5, 4]],
		hawai: [['#ffd23c', 's', 10, 9], ['#e07a7a', 'c', 9, 6]],
		vegetal: [['#3e9a3a', 's', 8, 6], ['#2b2b2b', 'c', 5, 6], ['#e8d8b5', 'e', 9, 5], ['#ffd23c', 'c', 3.5, 10]],
		porciones: [['#a8322a', 'c', 8, 4], ['#8a5230', 's', 8, 4], ['#e8d8b5', 'e', 8, 4], ['#3e9a3a', 's', 7, 4]],
		gambas: [['#f08a6b', 'c', 9, 7, '#c9573d']],
		barbacoa: [['#8a5230', 's', 9, 9], ['#e8d8b5', 'e', 8, 4]],
		pavo: [['#f0b9b0', 'c', 10, 8, '#d98f86'], ['#fff', 'c', 4, 4]],
		carbonara: [['#b8553f', 's', 6, 12], ['#e8d8b5', 'e', 8, 5]],
		cheese: [['#f3d27a', 's', 6, 14], ['#f7a24a', 'c', 4, 8]],
		def: [['#d33a2c', 'c', 7, 6]],
	};
	function pizzaKey(n) {
		if (/margarita/.test(n)) return 'margarita';
		if (/salami/.test(n)) return 'salami';
		if (/doner/.test(n)) return 'doner';
		if (/hawai/.test(n)) return 'hawai';
		if (/vegetal/.test(n)) return 'vegetal';
		if (/porciones/.test(n)) return 'porciones';
		if (/at[uú]n/.test(n)) return 'atun';
		if (/gamba/.test(n)) return 'gambas';
		if (/barbacoa/.test(n)) return 'barbacoa';
		if (/pavo/.test(n)) return 'pavo';
		if (/carbonara/.test(n)) return 'carbonara';
		if (/cheese/.test(n)) return 'cheese';
		return 'def';
	}
	function pizza(name) {
		var n = name.toLowerCase(),
			k = pizzaKey(n),
			rnd = rng(hash(n));
		var sauce = k === 'barbacoa' ? '#6b2a14' : k === 'carbonara' || k === 'cheese' ? '#f4ead2' : '#c9402b';
		var cheese = k === 'carbonara' || k === 'cheese' ? '#fbf3dc' : k === 'barbacoa' ? '#e9b24a' : '#f7d774';
		var s = circ(0, 0, 92, '#d99a4e') + circ(0, 0, 84, '#e9b369') + circ(0, 0, 78, sauce) + circ(0, 0, 73, cheese);
		if (k === '4 quesos' || /quesos/.test(n)) {
			var cols = ['#fff2b8', '#f3c04c', '#f6a93b', '#e9ecd8'];
			cols.forEach(function (c, i) {
				var a0 = (i * Math.PI) / 2, a1 = a0 + Math.PI / 2, R = 73;
				s += path('M0 0 L' + n1(Math.cos(a0) * R) + ' ' + n1(Math.sin(a0) * R) + ' A' + R + ' ' + R + ' 0 0 1 ' +
					n1(Math.cos(a1) * R) + ' ' + n1(Math.sin(a1) * R) + ' Z', c);
			});
			for (var q = 0; q < 8; q++) s += circ(rnd() * 90 - 45, rnd() * 90 - 45, 4, '#fff', null);
		}
		var tops = k === 'atun' ? PIZZA_TOP.def : PIZZA_TOP[k] || PIZZA_TOP.def;
		if (/at[uú]n/.test(n)) tops = [['#f3b9a0', 'e', 9, 10], ['#f1f1f1', 'c', 4, 6]].concat(/gamba/.test(n) ? PIZZA_TOP.gambas : []);
		if (!/quesos/.test(n))
			tops.forEach(function (t) {
				for (var i = 0; i < t[3]; i++) {
					var a = rnd() * 6.283, d = Math.sqrt(rnd()) * 58, x = Math.cos(a) * d, y = Math.sin(a) * d, rot = rnd() * 180;
					if (t[1] === 'c') s += circ(x, y, t[2], t[0], t[4]);
					else if (t[1] === 'e') s += ell(x, y, t[2], t[2] * 0.6, t[0], rot);
					else if (t[1] === 'l') s += ell(x, y, t[2], t[2] * 0.5, t[0], rot);
					else s += rect(x, y, t[2], t[2], 2, t[0], rot);
				}
			});
		if (k === 'porciones') s += path('M-78 0H78M0 -78V78', null, '#9b5f22', 3);
		s += path('M-60 -60L60 60M60 -60L-60 60M0 -80V80', null, 'rgba(120,60,10,.22)', 2);
		return s;
	}
	function calzone() {
		return (
			path('M-95 30 A95 95 0 0 1 95 30 Q95 55 70 55 H-70 Q-95 55 -95 30Z', '#e0a354', '#b97a2e', 4) +
			path('M-70 25 A70 70 0 0 1 70 25', null, '#f4cf8c', 6) +
			circ(-30, -5, 5, '#c9a15a') + circ(10, -25, 5, '#c9a15a') + circ(40, 5, 5, '#c9a15a') + circ(-5, 15, 5, '#c9a15a') +
			path('M-80 55 L80 55', null, '#b97a2e', 4)
		);
	}
	function burger() {
		var seeds = '';
		[[-30, -42], [-8, -52], [16, -46], [36, -36], [-18, -30], [8, -30]].forEach(function (p) {
			seeds += ell(p[0], p[1], 4, 2, '#fff2d4', 20);
		});
		return (
			path('M-76 -12 C-76 -86 76 -86 76 -12Z', '#e2a24c') + seeds +
			path('M-82 -10 q13 16 27 0 q13 16 27 0 q13 16 27 0 q13 16 27 0 q13 16 27 0 q13 16 27 0 v8 h-162z', '#5fb04a') +
			rect(0, 14, 150, 14, 7, '#d9392b') +
			path('M-76 22 h152 l-14 16 l-14 -9 l-20 16 l-20 -16 l-30 9 l-16 -10 z', '#ffc83d') +
			rect(0, 44, 152, 28, 14, '#6b3b22') +
			path('M-76 62 h152 q0 30 -30 30 h-92 q-30 0 -30 -30z', '#e2a24c')
		);
	}
	function wrap() {
		var s = rect(0, 36, 62, 92, 10, '#c9ccd1', -8) + path('M-28 20 L26 14M-27 40 L27 34M-26 60 L28 54', null, '#aeb2b9', 2);
		s += rect(0, -20, 70, 96, 30, '#f1d9a6', -8) + path('M-30 -30 Q0 -8 28 -34', null, '#d9b877', 3);
		s += circ(-18, -78, 16, '#5fb04a') + circ(8, -82, 13, '#d9392b') + circ(26, -70, 13, '#8a5230') + circ(-4, -68, 10, '#f5ecd8');
		return '<g transform="rotate(-8)">' + s + '</g>';
	}
	function pita() {
		return (
			path('M-95 50 A95 95 0 0 1 95 50 Z', '#f1d9a6', '#d9b877', 4) +
			path('M-72 38 A72 72 0 0 1 72 38', null, '#d9b877', 3) +
			path('M-72 -10 q12 -22 26 -8 q14 -22 28 -6 q14 -22 28 -6 q14 -22 26 -2 q14 -20 22 8 l0 16 h-130z', '#5fb04a') +
			circ(-40, -30, 11, '#d9392b') + circ(-5, -38, 11, '#8a5230') + circ(30, -32, 12, '#8a5230') + circ(52, -22, 9, '#f5ecd8') +
			path('M-95 50 H95', null, '#d9b877', 4)
		);
	}
	function taco() {
		return (
			path('M-95 55 A95 95 0 0 1 95 55 Z', '#f2b84b', '#c98a1f', 4) +
			path('M-80 20 q14 -26 28 -8 q14 -26 28 -8 q14 -26 28 -8 q14 -26 26 -4 q14 -24 24 12 v22 h-134z', '#5fb04a') +
			circ(-44, -20, 11, '#8a5230') + circ(-8, -30, 12, '#8a5230') + circ(30, -22, 12, '#8a5230') +
			circ(-22, -8, 6, '#ffd23c') + circ(10, -12, 6, '#ffd23c') + circ(48, -4, 6, '#ffd23c') +
			path('M-95 55 H95', null, '#c98a1f', 4)
		);
	}
	function fries(cheese) {
		var s = '';
		for (var i = 0; i < 11; i++) s += rect(-48 + i * 9.6, -34 - ((i * 7) % 5) * 7, 8, 80, 2, i % 2 ? '#ffd24a' : '#f7c531', (i - 5) * 3);
		s += path('M-56 6 L56 6 L42 92 H-42 Z', '#d9392b') + path('M-54 22 L54 22', null, '#fff', 4) + path('M-50 6 L50 6', null, '#b3241d', 4);
		if (cheese) s += path('M-40 -10 q12 28 24 0 q14 34 28 -2 q10 20 24 2 v8 h-76z', '#f59a2c');
		return s;
	}
	function cola() {
		return (
			rect(0, 0, 66, 128, 12, '#c8102e') + ell(0, -62, 33, 8, '#cfd3d8') + ell(0, 62, 33, 8, '#9aa0a8') +
			path('M-33 -8 C-12 -34 12 18 33 -8 L33 14 C12 40 -12 -6 -33 14Z', '#fff') + circ(0, -26, 0, '#fff')
		);
	}
	function plate(inner) {
		return circ(0, 0, 98, '#fff', '#e6dfd3') + circ(0, 0, 72, '#f6f1e8') + inner;
	}
	function sausage() {
		return (
			rect(0, -18, 130, 28, 14, '#b4482e', -8) + rect(0, 22, 130, 28, 14, '#c25a38', 6) +
			path('M-40 -26 l8 10M-8 -30 l8 10M24 -34 l8 10M-36 14 l8 10M-4 18 l8 10M28 24 l8 10', null, '#8e3220', 3)
		);
	}
	function wings() {
		var d = function (x, y, r) {
			return ell(x, y, 38, 24, '#c7762b', r, '#a45a1c') + rect(x + Math.cos((r * Math.PI) / 180) * 46, y + Math.sin((r * Math.PI) / 180) * 46, 8, 28, 3, '#fff3e0', r + 90) +
				circ(x + Math.cos((r * Math.PI) / 180) * 58, y + Math.sin((r * Math.PI) / 180) * 58, 7, '#fff3e0');
		};
		return d(-26, -24, -30) + d(-20, 30, 20);
	}
	function drumstick() {
		return ell(-14, -8, 44, 30, '#c7762b', -32, '#a45a1c') + rect(40, 36, 10, 38, 4, '#fff3e0', 58) + circ(58, 52, 8, '#fff3e0') + circ(70, 60, 6, '#fff3e0');
	}
	function nuggets() {
		var s = '';
		[[-34, -22, 14], [26, -26, -10], [-26, 28, -8], [34, 26, 18]].forEach(function (p) {
			s += rect(p[0], p[1], 46, 40, 14, '#d9922f', p[2]) + circ(p[0] - 8, p[1] - 6, 3, '#b8741d') + circ(p[0] + 10, p[1] + 8, 3, '#b8741d');
		});
		return s;
	}
	function rings() {
		var s = '';
		[[-30, -18], [24, -26], [-8, 24], [40, 20]].forEach(function (p, i) {
			s += circ(p[0], p[1], i % 2 ? 22 : 26, 'none', null).replace('fill="none"', 'fill="none" stroke="#d9922f" stroke-width="13"');
		});
		return s;
	}
	function eggs() {
		return (
			path('M-62 -6 q-4 -42 34 -38 q40 -8 36 34 q10 30 -30 34 q-40 10 -40 -30z', '#fff') + circ(-26, -10, 17, '#ffc92b') + circ(-31, -15, 5, '#ffe58a') +
			path('M8 20 q-4 -34 30 -30 q36 -6 34 26 q8 26 -26 28 q-36 8 -38 -24z', '#fff') + circ(40, 10, 15, '#ffc92b') + circ(35, 5, 4, '#ffe58a')
		);
	}
	function kidsbox() {
		return (
			path('M-80 -10 L80 -10 L66 84 H-66 Z', '#ffcf33', '#e0a800', 3) + rect(0, -16, 176, 16, 6, '#ffb400') +
			path('M0 14 l9 20 22 3 -16 15 4 22 -19 -11 -19 11 4 -22 -16 -15 22 -3z', '#e83a3a') +
			rect(-34, -50, 10, 54, 2, '#ffd24a', -8) + rect(-14, -56, 10, 58, 2, '#f7c531', 0) + rect(8, -54, 10, 56, 2, '#ffd24a', 6) + rect(30, -48, 10, 50, 2, '#f7c531', 12)
		);
	}

	function icon(t, name) {
		switch (t) {
			case 'pizza': return pizza(name || '');
			case 'calzone': return calzone();
			case 'burger': return burger();
			case 'wrap': return wrap();
			case 'pita': return pita();
			case 'taco': return taco();
			case 'fries': return fries(false);
			case 'cfries': return fries(true);
			case 'cola': return cola();
			case 'eggs': return plate(eggs());
			case 'sausage': return plate(sausage());
			case 'wings': return plate(wings());
			case 'drum': return plate(drumstick());
			case 'nuggets': return plate(nuggets());
			case 'rings': return plate(rings());
			case 'kids': return kidsbox();
		}
		return plate('');
	}
	function put(t, x, y, s, name) {
		return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' + icon(t, name) + '</g>';
	}

	/* ---------- decide what to draw for a menu item ---------- */
	var BG = { offers: '#fff0b8', pizzas: '#fde3c8', durum: '#ffe9c2', burgers: '#ffe0c0', plates: '#fbe0d6', kids: '#dff0ff' };
	function compose(it) {
		var n = it.name.toLowerCase(), d = it.desc.toLowerCase(), cat = it.cat;
		var mains = [], sides = [], single = null;
		if (cat === 'pizzas') {
			single = /calzone/.test(n) ? 'calzone' : 'pizza';
		} else if (cat === 'burgers') {
			single = 'burger';
			if (/bebida/.test(d)) sides.push('cola');
		} else if (cat === 'kids') {
			single = 'kids';
		} else if (cat === 'durum') {
			single = /taco/.test(n) ? 'taco' : /pita/.test(n) ? 'pita' : 'wrap';
		} else if (cat === 'plates') {
			single = /frankfurt/.test(n) ? 'sausage' : /alitas/.test(n) ? 'wings' : /muslo/.test(n) ? 'drum' : /nugget/.test(n) ? 'nuggets' : /aros/.test(n) ? 'rings' : /cheese/.test(n) ? 'cfries' : /huevo/.test(n) ? 'eggs' : /hamburg/.test(n) ? 'burger' : 'sausage';
			if (/bebida/.test(d)) sides.push('cola');
		} else {
			var order = [[/rollo/, 'wrap'], [/taco/, 'taco'], [/hamburg/, 'burger'], [/pizza/, 'pizza'], [/pita/, 'pita'], [/durum|doner/, 'wrap'], [/huevo/, 'eggs']];
			order.forEach(function (o) {
				if (o[0].test(n) && mains.indexOf(o[1]) < 0) mains.push(o[1]);
			});
			if (!mains.length) mains.push('burger');
			if (/cheese fries/.test(d)) sides.push('cfries');
			else if (/patatas|fries/.test(d)) sides.push('fries');
			if (/cola|bebida/.test(d)) sides.push('cola');
		}
		return { single: single, mains: mains, sides: sides };
	}
	function art(it) {
		var c = compose(it),
			s = '<rect width="400" height="300" fill="' + (BG[it.cat] || '#fde3c8') + '"/>' +
				'<circle cx="340" cy="40" r="90" fill="#fff" opacity=".35"/><circle cx="40" cy="280" r="110" fill="#fff" opacity=".25"/>';
		if (c.single) {
			s += ell(200, 262, 110, 14, 'rgba(60,20,10,.16)');
			var sc = c.single === 'cola' ? 1 : 1.2;
			var cx = c.sides.length ? 175 : 200;
			s += put(c.single, cx, 142, sc, it.name);
			if (c.sides.length) s += put('cola', 328, 190, 0.7);
		} else {
			var m = c.mains, sx = m.length === 1 ? [200] : m.length === 2 ? [135, 265] : [88, 200, 312];
			var ms = m.length === 1 ? 0.95 : m.length === 2 ? 0.78 : 0.62;
			s += ell(200, 262, 150, 12, 'rgba(60,20,10,.14)');
			m.forEach(function (t, i) {
				s += put(t, sx[i], m.length === 1 ? 128 : 138, ms, it.name);
			});
			var sp = c.sides.length === 1 ? [200] : [64, 336];
			c.sides.forEach(function (t, i) {
				s += put(t, c.sides.length === 1 && m.length > 1 ? 200 : sp[i], 246, 0.36);
			});
		}
		return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' + s + '</svg>';
	}

	var cache = {};
	/* returns a URL usable as <img src> for any menu item (or for a name + category pair) */
	KE.dishImage = function (it) {
		if (it.img) return it.img;
		var k = it.cat + '|' + it.name + '|' + it.desc;
		if (cache[k]) return cache[k];
		var url = dishPhoto(it) || (PHOTO_BY_NAME[it.name] && it.cat !== 'pizzas'
			? 'assets/img/' + PHOTO_BY_NAME[it.name]
			: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(art(it)));
		cache[k] = url;
		return url;
	};
	KE.dishIsPhoto = function (it) {
		return KE.dishImage(it).indexOf('data:') !== 0;
	};
})();
