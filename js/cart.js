/* Kebab Express: shared cart (store + navbar total + "View cart" bar + drawer).
   Every page loads this file, so the cart survives navigation between pages.
   Front-end only: items are kept in localStorage under one key. */
(function () {
	'use strict';
	var KE = (window.KE = window.KE || {});
	var $ = KE.$,
		$$ = KE.$$,
		esc = KE.esc;

	var KEY = 'kebabExpress.menuCart.v1';
	var lines = {};
	var listeners = [];

	function load() {
		try {
			lines = JSON.parse(localStorage.getItem(KEY)) || {};
		} catch (e) {
			lines = {};
		}
	}
	function save() {
		try {
			localStorage.setItem(KEY, JSON.stringify(lines));
		} catch (e) {
			/* storage blocked: the cart lives for this page view only */
		}
	}
	function eur(n) {
		return '€' + n.toFixed(2);
	}
	function changed() {
		save();
		render();
		listeners.forEach(function (fn) {
			fn();
		});
	}

	KE.eur = eur;
	KE.money = eur; /* the menu is priced in euros, so checkout shows euros too */
	KE.cart = {
		/* { key: { n: name, l: label, p: unit price, q: quantity } } */
		get: function () {
			return lines;
		},
		qty: function (key) {
			return lines[key] ? lines[key].q : 0;
		},
		count: function () {
			return Object.keys(lines).reduce(function (n, k) {
				return n + lines[k].q;
			}, 0);
		},
		total: function () {
			return Object.keys(lines).reduce(function (n, k) {
				return n + lines[k].q * lines[k].p;
			}, 0);
		},
		/* add `d` of one menu item variant (item from KE.MENU.items, v = variant index) */
		add: function (item, v, d) {
			var vr = item.variants[v || 0];
			if (!vr) return;
			var q = Math.min((lines[vr.key] ? lines[vr.key].q : 0) + (d || 1), 99);
			if (q <= 0) delete lines[vr.key];
			else lines[vr.key] = { n: item.name, l: vr.label, p: vr.value, q: q };
			changed();
		},
		setQty: function (key, q) {
			if (!lines[key]) return;
			if (q <= 0) delete lines[key];
			else lines[key].q = Math.min(q, 99);
			changed();
		},
		clear: function () {
			lines = {};
			changed();
		},
		subscribe: function (fn) {
			listeners.push(fn);
		},
		open: function (from) {
			openDrawer(from);
		},
	};

	/* ---------- UI (injected, so every page gets the same cart) ---------- */
	var ov, wrap, opener;

	function build() {
		var root = document.getElementById('app') || document.body;
		var tpl = document.createElement('div');
		tpl.innerHTML =
			'<div class="vc-wrap" id="viewCartWrap" hidden><button class="vc" type="button" id="viewCart">' +
			'<span class="vc-n" id="vcCount">0</span><span class="vc-t">View cart</span><span class="vc-p" id="vcTotal">€0.00</span></button></div>' +
			'<div class="cov" id="cartOv" hidden><aside class="cdr" role="dialog" aria-modal="true" aria-labelledby="cdrTitle">' +
			'<div class="cdr-h"><h2 class="disp" id="cdrTitle">Your cart</h2>' +
			'<button class="cdr-x" type="button" id="cartClose" aria-label="Close cart"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div>' +
			'<div class="cdr-b" id="cartBody"></div></aside></div>';
		while (tpl.firstChild) root.appendChild(tpl.firstChild);
		wrap = $('#viewCartWrap');
		ov = $('#cartOv');
	}

	function render() {
		if (!ov) return;
		var n = KE.cart.count(),
			t = KE.cart.total();
		var amt = $('#cartAmt'),
			badge = $('#cartCount'),
			btn = $('#cartOpen');
		if (amt) amt.textContent = eur(t);
		if (badge) {
			badge.textContent = n;
			badge.hidden = n === 0;
		}
		if (btn)
			btn.setAttribute(
				'aria-label',
				'Open your cart, ' + n + (n === 1 ? ' item, ' : ' items, ') + eur(t),
			);
		$('#vcCount').textContent = n;
		$('#vcTotal').textContent = eur(t);
		wrap.hidden = n === 0;
		if (!ov.hidden) renderDrawer();
	}

	function renderDrawer() {
		var body = $('#cartBody');
		var keys = Object.keys(lines);
		if (!keys.length) {
			body.innerHTML =
				'<div class="cdr-empty"><h3 class="disp">Your cart is empty</h3><p>Add a dish from the menu to start your order.</p><button class="btn btn-red" type="button" data-c="close">Browse the menu</button></div>';
			return;
		}
		body.innerHTML =
			'<div class="cdr-l">' +
			keys
				.map(function (k) {
					var l = lines[k],
						it = KE.MENU && KE.MENU.byKey[k],
						ek = esc(k);
					return (
						'<div class="cl">' +
						(it ? '<img class="cl-img" src="' + it.img + '" alt="">' : '') +
						'<div class="cl-i"><b>' + esc(l.n) + '</b><small>' +
						(l.l ? esc(l.l) + ' · ' : '') + eur(l.p) +
						' each</small><button class="cl-rm" type="button" data-c="rm" data-k="' + ek + '">Remove</button></div>' +
						'<div class="cl-s"><button type="button" data-c="dec" data-k="' + ek + '" aria-label="Remove one ' + esc(l.n) + '">−</button><b>' + l.q +
						'</b><button type="button" data-c="inc" data-k="' + ek + '" aria-label="Add one more ' + esc(l.n) + '">+</button></div>' +
						'<span class="cl-p">' + eur(l.p * l.q) + '</span></div>'
					);
				})
				.join('') +
			'</div><div class="cdr-f"><div class="cdr-t"><span>Total</span><span>' + eur(KE.cart.total()) + '</span></div>' +
			'<button class="btn btn-red" type="button" data-c="checkout">Checkout</button>' +
			'<button class="cl-rm cdr-clear" type="button" data-c="clear">Clear cart</button></div>';
	}

	function openDrawer(from) {
		opener = from || document.activeElement;
		renderDrawer();
		ov.hidden = false;
		document.body.style.overflow = 'hidden';
		$('#cartClose').focus();
	}
	function closeDrawer() {
		ov.hidden = true;
		document.body.style.overflow = '';
		if (opener && opener.focus && document.contains(opener)) opener.focus();
	}

	function bind() {
		['#cartOpen', '#viewCart'].forEach(function (s) {
			var b = $(s);
			if (b)
				b.addEventListener('click', function () {
					openDrawer(this);
				});
		});
		$('#cartClose').addEventListener('click', closeDrawer);
		ov.addEventListener('click', function (e) {
			if (e.target === ov) return closeDrawer();
			var b = e.target.closest('[data-c]');
			if (!b) return;
			var act = b.getAttribute('data-c'),
				k = b.getAttribute('data-k');
			if (act === 'close') closeDrawer();
			else if (act === 'inc') KE.cart.setQty(k, KE.cart.qty(k) + 1);
			else if (act === 'dec') KE.cart.setQty(k, KE.cart.qty(k) - 1);
			else if (act === 'rm') KE.cart.setQty(k, 0);
			else if (act === 'clear') KE.cart.clear();
			else if (act === 'checkout') {
				if ($('[data-checkout-page]')) closeDrawer();
				else location.href = 'checkout.html';
			}
		});
		document.addEventListener('keydown', function (e) {
			if (ov.hidden) return;
			if (e.key === 'Escape') closeDrawer();
			else if (e.key === 'Tab') {
				var f = $$('button', ov).filter(function (n) {
					return n.offsetParent !== null;
				});
				if (!f.length) return;
				var first = f[0],
					last = f[f.length - 1];
				if (e.shiftKey && document.activeElement === first) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		});
		window.addEventListener('storage', function (e) {
			if (e.key === KEY) {
				load();
				render();
				listeners.forEach(function (fn) {
					fn();
				});
			}
		});
	}

	load();
	document.addEventListener('DOMContentLoaded', function () {
		build();
		bind();
		render();
		if (new URLSearchParams(location.search).get('cart') === '1') openDrawer($('#cartOpen'));
	});
})();
