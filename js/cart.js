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
	KE.money =
		eur; /* the menu is priced in euros, so the drawer checkout shows euros too */
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
	var mode = 'cart'; /* what the drawer shows: 'cart' | 'form' | 'done' */
	var form = { name: '', phone: '', email: '', addr: '', zip: '' };
	var errs = {};
	var OKEY = 'kebabExpress.lastOrder.v1';

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
		if (!ov.hidden && mode === 'cart') renderDrawer();
	}

	function setTitle(t) {
		$('#cdrTitle').textContent = t;
	}

	var FIELDS = [
		['name', 'Name', 'text', 'name', 'Your full name'],
		['phone', 'Phone', 'tel', 'tel', 'e.g. 612 345 678'],
		['email', 'Email', 'email', 'email', 'you@example.com'],
		[
			'addr',
			'Address',
			'text',
			'street-address',
			'Street, number, floor / door',
		],
		['zip', 'Post code', 'text', 'postal-code', 'e.g. 28001'],
	];
	function validate() {
		var e = {},
			digits = form.phone.replace(/\D/g, '');
		if (!form.name.trim()) e.name = 'Please enter your name.';
		if (digits.length < 7 || digits.length > 15)
			e.phone = 'Enter a phone number with 7 to 15 digits.';
		if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim()))
			e.email = 'Enter a valid email address.';
		if (form.addr.trim().length < 4) e.addr = 'Please enter your address.';
		if (form.zip.trim().length < 3) e.zip = 'Please enter your post code.';
		errs = e;
		return !Object.keys(e).length;
	}
	function renderForm() {
		setTitle('Checkout');
		$('#cartBody').innerHTML =
			'<form class="cdr-form" id="cdrForm" novalidate><div class="cdr-l cdr-fields">' +
			FIELDS.map(function (f) {
				var k = f[0];
				return (
					'<div class="cdr-ff"><label for="cf-' +
					k +
					'">' +
					f[1] +
					'</label>' +
					'<input class="cdr-in' +
					(errs[k] ? ' bad' : '') +
					'" id="cf-' +
					k +
					'" name="' +
					k +
					'" type="' +
					f[2] +
					'" autocomplete="' +
					f[3] +
					'" placeholder="' +
					esc(f[4]) +
					'" value="' +
					esc(form[k]) +
					'"' +
					(errs[k] ? ' aria-invalid="true"' : '') +
					'>' +
					(errs[k] ? '<span class="cdr-er">' + errs[k] + '</span>' : '') +
					'</div>'
				);
			}).join('') +
			'<p class="cdr-note">Pay in cash when your order arrives.</p></div>' +
			'<div class="cdr-f"><div class="cdr-t"><span>Total</span><span>' +
			eur(KE.cart.total()) +
			'</span></div>' +
			'<button class="btn btn-red" type="submit">Place order</button>' +
			'<button class="cl-rm cdr-clear" type="button" data-c="back">Back to cart</button></div></form>';
	}
	function renderDone(o) {
		setTitle('Order placed');
		$('#cartBody').innerHTML =
			'<div class="cdr-empty"><h3 class="disp">Thank you, ' +
			esc(o.f.name.split(' ')[0]) +
			'!</h3>' +
			'<p>Your order <b>' +
			esc(o.ref) +
			'</b> is on its way to the grill.<br>We will deliver to ' +
			esc(o.f.addr) +
			', ' +
			esc(o.f.zip) +
			'.<br>Total to pay: <b>' +
			eur(o.t.total) +
			'</b></p>' +
			'<a class="btn btn-red" href="track.html?ref=' +
			encodeURIComponent(o.ref) +
			'">Track your order</a>' +
			'<button class="cl-rm cdr-clear" type="button" data-c="close">Close</button></div>';
	}
	function placeOrder() {
		var ls = Object.keys(lines).map(function (k) {
			return { n: lines[k].n, l: lines[k].l, p: lines[k].p, q: lines[k].q };
		});
		if (!ls.length) return;
		var o = {
			ref: 'KE-' + (4000 + Math.floor(Math.random() * 5000)),
			placedAt: Date.now(),
			f: {
				fulfil: 'delivery',
				name: form.name.trim(),
				phone: form.phone.trim(),
				email: form.email.trim(),
				addr: form.addr.trim(),
				city: '',
				zip: form.zip.trim(),
			},
			lines: ls,
			t: { total: KE.cart.total() },
		};
		try {
			localStorage.setItem(OKEY, JSON.stringify(o));
		} catch (e) {}
		mode = 'done';
		KE.cart.clear(); /* the order is placed, so the cart empties */
		form = { name: '', phone: '', email: '', addr: '', zip: '' };
		renderDone(o);
		var a = $('#cartBody a');
		if (a) a.focus();
	}

	function renderDrawer() {
		if (mode === 'form') return renderForm();
		setTitle('Your cart');
		var body = $('#cartBody');
		var keys = Object.keys(lines);
		if (!keys.length) {
			body.innerHTML =
				'<div class="cdr-empty"><h3 class="disp">Your cart is empty</h3><p>Add a dish from the menu to start your order.</p><button class="btn btn-red" type="button" data-c="menu">Browse the menu</button></div>';
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
						'<div class="cl-i"><b>' +
						esc(l.n) +
						'</b><small>' +
						(l.l ? esc(l.l) + ' · ' : '') +
						eur(l.p) +
						' each</small><button class="cl-rm" type="button" data-c="rm" data-k="' +
						ek +
						'">Remove</button></div>' +
						'<div class="cl-s"><button type="button" data-c="dec" data-k="' +
						ek +
						'" aria-label="Remove one ' +
						esc(l.n) +
						'">−</button><b>' +
						l.q +
						'</b><button type="button" data-c="inc" data-k="' +
						ek +
						'" aria-label="Add one more ' +
						esc(l.n) +
						'">+</button></div>' +
						'<span class="cl-p">' +
						eur(l.p * l.q) +
						'</span></div>'
					);
				})
				.join('') +
			'</div><div class="cdr-f"><div class="cdr-t"><span>Total</span><span>' +
			eur(KE.cart.total()) +
			'</span></div>' +
			'<button class="btn btn-red" type="button" data-c="checkout">Checkout</button>' +
			'<button class="cl-rm cdr-clear" type="button" data-c="clear">Clear cart</button></div>';
	}

	function openDrawer(from) {
		opener = from || document.activeElement;
		mode = 'cart';
		errs = {};
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

	function keys0() {
		return Object.keys(lines);
	}

	function bind() {
		/* delegated, so the navbar cart always reopens the cart drawer after it was closed */
		document.addEventListener('click', function (e) {
			var b = e.target.closest('#cartOpen, #viewCart');
			if (b) openDrawer(b);
		});
		window.addEventListener('pageshow', function (e) {
			if (e.persisted && ov && !ov.hidden) closeDrawer();
		});
		$('#cartClose').addEventListener('click', closeDrawer);
		ov.addEventListener('click', function (e) {
			if (e.target === ov) return closeDrawer();
			var b = e.target.closest('[data-c]');
			if (!b) return;
			var act = b.getAttribute('data-c'),
				k = b.getAttribute('data-k');
			if (act === 'close') closeDrawer();
			else if (act === 'menu') {
				closeDrawer();
				var m = document.getElementById('menu');
				if (m) m.scrollIntoView({ behavior: 'smooth' });
				else window.location.href = 'index.html#menu';
			}
			else if (act === 'inc') KE.cart.setQty(k, KE.cart.qty(k) + 1);
			else if (act === 'dec') KE.cart.setQty(k, KE.cart.qty(k) - 1);
			else if (act === 'rm') KE.cart.setQty(k, 0);
			else if (act === 'clear') KE.cart.clear();
			else if (act === 'checkout') {
				if (!keys0().length) return;
				mode = 'form';
				errs = {};
				renderForm();
				var f = $('#cf-name');
				if (f) f.focus();
			} else if (act === 'back') {
				mode = 'cart';
				renderDrawer();
			}
		});
		ov.addEventListener('input', function (e) {
			var n = e.target.name;
			if (n in form) {
				form[n] = e.target.value;
				if (errs[n]) {
					delete errs[n];
					e.target.classList.remove('bad');
					var er = e.target.parentNode.querySelector('.cdr-er');
					if (er) er.remove();
				}
			}
		});
		ov.addEventListener('submit', function (e) {
			e.preventDefault();
			if (mode !== 'form') return;
			if (validate()) return placeOrder();
			renderForm();
			var bad = $('.cdr-in.bad', ov);
			if (bad) bad.focus();
		});
		document.addEventListener('keydown', function (e) {
			if (ov.hidden) return;
			if (e.key === 'Escape') closeDrawer();
			else if (e.key === 'Tab') {
				var f = $$('button, input, a[href]', ov).filter(function (n) {
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
		if (new URLSearchParams(location.search).get('cart') === '1')
			openDrawer($('#cartOpen'));
	});
})();
