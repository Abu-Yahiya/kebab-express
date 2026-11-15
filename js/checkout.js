/* Kebab Express: checkout page (details -> payment -> review -> confirmation).
   Front-end only: nothing is sent or charged. Card details are validated for format
   (including a Luhn check) and are never stored. The cart comes from js/cart.js. */
(function () {
	'use strict';
	var $ = KE.$,
		$$ = KE.$$,
		esc = KE.esc,
		money = KE.eur;

	var SERVICE_FEE = 1.5,
		DELIVERY_FEE = 2.5;
	var BRANCHES = [
		{ name: 'Old Town', addr: '12 Ember Lane, Old Town', hours: '11:00 – 01:00' },
		{ name: 'City Centre', addr: '78/31 Market Square, City Centre', hours: '11:00 – 02:00' },
		{ name: 'Riverside', addr: '4 Quay Road, Riverside', hours: '12:00 – 00:00' },
		{ name: 'Station Place', addr: '210 Platform Street, Station Place', hours: '10:00 – 01:00' },
	];
	var SKEY = 'kebabExpress.checkout.v1',
		OKEY = 'kebabExpress.lastOrder.v1';

	/* ---------- state (form values survive a reload; card data never does) ---------- */
	function fresh() {
		return {
			step: 1,
			f: {
				fulfil: 'pickup', branch: 0, name: '', phone: '', email: '',
				addr: '', city: '', zip: '', when: 'asap', slot: '', notes: '',
				pay: 'card', cn: '', cname: '', exp: '', cvc: '',
			},
		};
	}
	function loadState() {
		try {
			var s = JSON.parse(sessionStorage.getItem(SKEY));
			if (s && s.f) {
				var b = fresh();
				for (var k in s.f) if (k in b.f) b.f[k] = s.f[k];
				return { step: s.step === 'done' ? 'done' : Math.min(3, Math.max(1, +s.step || 1)), f: b.f };
			}
		} catch (e) {}
		return fresh();
	}
	function saveState() {
		try {
			var c = JSON.parse(JSON.stringify(st));
			c.f.cn = c.f.exp = c.f.cvc = '';
			sessionStorage.setItem(SKEY, JSON.stringify(c));
		} catch (e) {}
	}
	function loadOrder() {
		try {
			return JSON.parse(localStorage.getItem(OKEY));
		} catch (e) {
			return null;
		}
	}
	var st = loadState();
	var errs = {};
	var placing = false;
	var order = null;
	var trkTimer = 0;

	/* ---------- helpers ---------- */
	function lines() {
		var c = KE.cart.get();
		return Object.keys(c).map(function (k) {
			var it = KE.MENU.byKey[k];
			return { key: k, n: c[k].n, l: c[k].l, p: c[k].p, q: c[k].q, img: it ? it.img : '' };
		});
	}
	function totals(f, ls) {
		var sub = ls.reduce(function (n, l) {
			return n + l.p * l.q;
		}, 0);
		var del = f.fulfil === 'delivery' ? DELIVERY_FEE : 0;
		return { sub: sub, service: SERVICE_FEE, del: del, total: sub + SERVICE_FEE + del };
	}
	function eta(f) {
		return f.fulfil === 'delivery' ? 'about 35 minutes' : 'about 15 minutes';
	}
	function slotsToday() {
		var now = new Date();
		var min = now.getHours() * 60 + now.getMinutes() + (st.f.fulfil === 'delivery' ? 45 : 30);
		var out = [];
		for (var m = 11 * 60; m <= 23 * 60 + 30; m += 30) {
			if (m >= min) out.push(('0' + Math.floor(m / 60)).slice(-2) + ':' + (m % 60 ? '30' : '00'));
		}
		return out;
	}
	function luhn(num) {
		var sum = 0,
			alt = false;
		for (var i = num.length - 1; i >= 0; i--) {
			var d = +num.charAt(i);
			if (alt) {
				d *= 2;
				if (d > 9) d -= 9;
			}
			sum += d;
			alt = !alt;
		}
		return sum % 10 === 0;
	}
	function expOk(v) {
		var m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(v);
		if (!m) return false;
		var now = new Date(),
			y = 2000 + +m[2];
		return y > now.getFullYear() || (y === now.getFullYear() && +m[1] >= now.getMonth() + 1);
	}

	/* ---------- validation ---------- */
	function validate(step) {
		var f = st.f,
			e = {};
		if (step === 1) {
			if (!f.name.trim()) e.name = 'Please enter your name.';
			if (f.phone.replace(/\D/g, '').length < 7 || f.phone.replace(/\D/g, '').length > 15) e.phone = 'Enter a phone number with 7 to 15 digits.';
			if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) e.email = 'Enter a valid email address.';
			if (f.fulfil === 'delivery') {
				if (f.addr.trim().length < 5) e.addr = 'Enter the street and number.';
				if (!f.city.trim()) e.city = 'Enter the city.';
				if (f.zip.trim().length < 3) e.zip = 'Enter the postcode.';
			}
			if (f.when === 'later' && slotsToday().indexOf(f.slot) < 0) e.slot = 'Choose a time that is still available today.';
		} else if (step === 2 && f.pay === 'card') {
			var n = f.cn.replace(/\s/g, '');
			if (n.length !== 16 || !luhn(n)) e.cn = 'Enter a valid 16-digit card number.';
			if (!f.cname.trim()) e.cname = 'Enter the name on the card.';
			if (!expOk(f.exp)) e.exp = 'Use a future date as MM/YY.';
			if (!/^\d{3,4}$/.test(f.cvc)) e.cvc = 'Enter the 3 or 4 digit code.';
		}
		errs = e;
		return Object.keys(e).length === 0;
	}

	/* ---------- field builders ---------- */
	function fld(id, label, key, o) {
		o = o || {};
		var bad = errs[key];
		return (
			'<div class="ff"><label for="' + id + '">' + label + '</label><input id="' + id + '" class="fi' + (bad ? ' bad' : '') +
			'" data-key="' + key + '" type="' + (o.type || 'text') + '"' +
			(o.auto ? ' autocomplete="' + o.auto + '"' : '') + (o.mode ? ' inputmode="' + o.mode + '"' : '') +
			' placeholder="' + esc(o.ph || '') + '" value="' + esc(st.f[key]) + '"' +
			(bad ? ' aria-invalid="true" aria-describedby="' + id + '-e"' : '') + '>' +
			(bad ? '<span class="er" id="' + id + '-e">' + esc(bad) + '</span>' : '') + '</div>'
		);
	}
	function opt(key, val, title, sub) {
		var on = st.f[key] === val;
		return (
			'<button class="opt' + (on ? ' on' : '') + '" type="button" data-opt="' + key + ':' + val + '" aria-pressed="' + on +
			'"><b>' + title + '</b><small>' + sub + '</small></button>'
		);
	}

	/* ---------- step bodies ---------- */
	function step1() {
		var f = st.f,
			del = f.fulfil === 'delivery',
			sl = slotsToday(),
			br = BRANCHES[f.branch] || BRANCHES[0];
		if (f.when === 'later' && sl.indexOf(f.slot) < 0) f.slot = sl[0] || '';
		return (
			'<h2 class="disp" tabindex="-1" id="cxH">How would you like it?</h2>' +
			'<div class="opts" role="group" aria-label="Pickup or delivery">' +
			opt('fulfil', 'pickup', 'Pickup', 'Collect at a branch · free · ready in about 15 min') +
			opt('fulfil', 'delivery', 'Delivery', 'To your door · ' + money(DELIVERY_FEE) + ' · about 35 min') + '</div>' +
			(del
				? fld('c-addr', 'Street and number', 'addr', { auto: 'street-address', ph: 'Street, number, flat' }) +
					'<div class="ff2">' + fld('c-city', 'City', 'city', { auto: 'address-level2', ph: 'City' }) +
					fld('c-zip', 'Postcode', 'zip', { auto: 'postal-code', ph: 'Postcode' }) + '</div>'
				: '<div class="ff"><label for="c-branch">Pickup branch</label><select id="c-branch" class="fi" data-key="branch">' +
					BRANCHES.map(function (b, i) {
						return '<option value="' + i + '"' + (i === +f.branch ? ' selected' : '') + '>' + esc(b.name) + '</option>';
					}).join('') + '</select><small class="cx-hint">' + esc(br.addr) + ' · open ' + esc(br.hours) + '</small></div>') +
			'<div class="ff2">' + fld('c-name', 'Full name', 'name', { auto: 'name', ph: 'Sara Rahman' }) +
			fld('c-phone', 'Phone', 'phone', { type: 'tel', auto: 'tel', ph: '+44 7700 900123' }) + '</div>' +
			fld('c-mail', 'Email for your receipt', 'email', { type: 'email', auto: 'email', ph: 'you@example.com' }) +
			'<div class="opts" role="group" aria-label="When">' +
			opt('when', 'asap', 'As soon as possible', 'Ready in ' + eta(f)) +
			(sl.length
				? opt('when', 'later', 'Schedule for later', 'Pick a time today')
				: '<button class="opt" type="button" disabled><b>Schedule for later</b><small>No more slots today</small></button>') + '</div>' +
			(f.when === 'later'
				? '<div class="ff"><label for="c-slot">Time today</label><select id="c-slot" class="fi' + (errs.slot ? ' bad' : '') + '" data-key="slot">' +
					sl.map(function (s) {
						return '<option' + (s === f.slot ? ' selected' : '') + '>' + s + '</option>';
					}).join('') + '</select>' + (errs.slot ? '<span class="er">' + esc(errs.slot) + '</span>' : '') + '</div>'
				: '') +
			'<div class="ff"><label for="c-note">Notes for the kitchen <small class="cx-opt">(optional)</small></label>' +
			'<textarea id="c-note" class="fi" data-key="notes" placeholder="Allergies, no onions, extra sauce…">' + esc(f.notes) + '</textarea></div>' +
			'<div class="acts"><a class="btn btn-line" href="shop.html">Back to the shop</a><button class="btn btn-red" type="submit">Continue to payment</button></div>'
		);
	}
	function step2() {
		var f = st.f,
			card = f.pay === 'card',
			del = f.fulfil === 'delivery';
		return (
			'<h2 class="disp" tabindex="-1" id="cxH">Payment</h2>' +
			'<div class="opts" role="group" aria-label="Payment method">' +
			opt('pay', 'card', 'Card', 'Pay now') +
			opt('pay', 'cash', del ? 'Cash on delivery' : 'Pay at pickup', 'Pay when you ' + (del ? 'receive' : 'collect') + ' your order') + '</div>' +
			(card
				? fld('c-cn', 'Card number', 'cn', { mode: 'numeric', auto: 'cc-number', ph: '1234 5678 9012 3456' }) +
					fld('c-cname', 'Name on card', 'cname', { auto: 'cc-name', ph: 'As shown on the card' }) +
					'<div class="ff2">' + fld('c-exp', 'Expiry', 'exp', { mode: 'numeric', auto: 'cc-exp', ph: 'MM/YY' }) +
					fld('c-cvc', 'CVC', 'cvc', { mode: 'numeric', auto: 'cc-csc', ph: '123' }) + '</div>' +
					'<p class="cx-note">Demo site: no payment is taken and card details are never stored or sent. Try 4242 4242 4242 4242 with any future date.</p>'
				: '<p class="cx-note">No payment is taken now. Please have ' + money(totals(f, lines()).total) + ' ready when you ' + (del ? 'receive' : 'collect') + ' your order.</p>') +
			'<div class="acts"><button class="btn btn-line" type="button" data-act="back">Back</button><button class="btn btn-red" type="submit">Review order</button></div>'
		);
	}
	function whenText(f) {
		return f.when === 'asap' ? 'As soon as possible (' + eta(f) + ')' : 'Today at ' + f.slot;
	}
	function whereRows(f) {
		var br = BRANCHES[f.branch] || BRANCHES[0];
		return f.fulfil === 'delivery'
			? ['Deliver to', esc(f.addr) + '<br>' + esc(f.city) + ', ' + esc(f.zip)]
			: ['Pick up at', esc(br.name) + '<br>' + esc(br.addr)];
	}
	function step3() {
		var f = st.f,
			last4 = f.cn.replace(/\s/g, '').slice(-4),
			w = whereRows(f);
		function row(label, val, goto) {
			return '<div class="rv"><span>' + label + '</span><b>' + val + '</b>' + (goto ? '<button class="cx-edit" type="button" data-goto="' + goto + '">Edit</button>' : '') + '</div>';
		}
		return (
			'<h2 class="disp" tabindex="-1" id="cxH">Review and place order</h2><div>' +
			row('Contact', esc(f.name) + '<br>' + esc(f.phone) + '<br>' + esc(f.email), 1) +
			row(w[0], w[1], 1) + row('When', esc(whenText(f)), 1) +
			row('Payment', f.pay === 'card' ? 'Card ending ' + (last4 || '----') : f.fulfil === 'delivery' ? 'Cash on delivery' : 'Pay at pickup', 2) +
			(f.notes.trim() ? row('Notes', esc(f.notes), 1) : '') + '</div>' +
			'<div class="acts"><button class="btn btn-line" type="button" data-act="back"' + (placing ? ' disabled' : '') + '>Back</button>' +
			'<button class="btn btn-red" type="submit"' + (placing ? ' disabled' : '') + '>' +
			(placing ? 'Placing order…' : 'Place order · ' + money(totals(f, lines()).total)) + '</button></div>'
		);
	}
	function trkIndex(o) {
		var s = (Date.now() - o.placedAt) / 1000;
		return s < 2.5 ? 0 : s < 6 ? 1 : s < 9.5 ? 2 : 3;
	}
	function trkHTML(o) {
		var del = o.f.fulfil === 'delivery',
			n = trkIndex(o);
		var steps = [
			['Order received', 'We have your order'],
			['On the grill', 'Your food is being cooked'],
			[del ? 'On its way' : 'Ready for pickup', del ? 'A rider is heading to you' : 'Collect it at ' + (BRANCHES[o.f.branch] || BRANCHES[0]).addr],
		];
		return steps.map(function (s, i) {
			var cls = i < n ? 'dn' : i === n ? 'now' : '';
			var tick = i < n ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>' : '';
			return '<div class="tn ' + cls + '"><i>' + tick + '</i><div><b>' + s[0] + '</b><small>' + s[1] + '</small></div></div>';
		}).join('');
	}
	function done() {
		var o = order,
			f = o.f,
			w = whereRows(f);
		return (
			'<div class="cx-done"><div class="tick"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg></div>' +
			'<h2 class="disp" tabindex="-1" id="cxH" style="font-size:56px">Order confirmed</h2>' +
			'<p class="cx-note" style="max-width:440px">Thanks, ' + esc(f.name) + '. Your reference is <b style="color:var(--ink)">' + esc(o.ref) +
			'</b>. A receipt is on its way to ' + esc(f.email) + '. Estimated ' + eta(f) + '.</p>' +
			'<div class="trk" id="cxTrk" aria-live="polite">' + trkHTML(o) + '</div>' +
			'<div class="cx-recap"><div class="rv"><span>' + w[0] + '</span><b>' + w[1] + '</b></div><div class="rv"><span>When</span><b>' + esc(whenText(f)) + '</b></div>' +
			'<div class="rv"><span>Payment</span><b>' + (f.pay === 'card' ? 'Card ending ' + esc(o.last4 || '----') : f.fulfil === 'delivery' ? 'Cash on delivery' : 'Pay at pickup') + '</b></div></div>' +
			'<div class="acts" style="justify-content:center"><a class="btn btn-red" href="track.html?ref=' + encodeURIComponent(o.ref) + '">Track order</a><a class="btn btn-line" href="shop.html" data-act="newOrder">Back to the shop</a><a class="btn btn-line" href="index.html">Home</a></div></div>'
		);
	}

	/* ---------- summary column ---------- */
	function summary() {
		var done_ = st.step === 'done',
			ls = done_ ? order.lines : lines(),
			t = done_ ? order.t : totals(st.f, ls);
		return (
			'<h3 class="disp">' + (done_ ? 'Your receipt' : 'Your order') + '</h3>' +
			ls.map(function (l) {
				return (
					'<div class="cx-line"><img src="' + l.img + '" alt=""><div class="cx-li"><b>' + esc(l.n) + '</b><small>' + (l.l ? esc(l.l) + ' · ' : '') + money(l.p) + ' each</small>' +
					(done_ ? '<small>Qty ' + l.q + '</small>' :
						'<div class="cx-q"><button type="button" data-q="dec" data-k="' + esc(l.key) + '" aria-label="Remove one ' + esc(l.n) + '">−</button><b>' + l.q +
						'</b><button type="button" data-q="inc" data-k="' + esc(l.key) + '" aria-label="Add one more ' + esc(l.n) + '">+</button>' +
						'<button type="button" class="cx-rm" data-q="rm" data-k="' + esc(l.key) + '">Remove</button></div>') +
					'</div><b>' + money(l.p * l.q) + '</b></div>'
				);
			}).join('') +
			'<div class="sum"><span>Subtotal</span><span>' + money(t.sub) + '</span></div>' +
			'<div class="sum"><span>Service fee</span><span>' + money(t.service) + '</span></div>' +
			(t.del ? '<div class="sum"><span>Delivery</span><span>' + money(t.del) + '</span></div>' : '') +
			'<div class="sum t"><span>Total</span><span>' + money(t.total) + '</span></div>'
		);
	}

	/* ---------- render ---------- */
	function renderSteps() {
		var el = $('#cxSteps'),
			labels = ['Details', 'Payment', 'Review'];
		el.hidden = st.step === 'done' || !lines().length;
		el.innerHTML = labels.map(function (l, i) {
			var n = i + 1,
				on = st.step === n,
				dn = st.step > n;
			var inner = '<i>' + (dn ? '✓' : n) + '</i>' + l;
			return (dn && !placing ? '<button type="button" class="' + 'dn' + '" data-goto="' + n + '">' + inner + '</button>' : '<span class="' + (on ? 'on' : '') + '"' + (on ? ' aria-current="step"' : '') + '>' + inner + '</span>') + (i < 2 ? '<em></em>' : '');
		}).join('');
	}
	function render(focus) {
		var body = $('#cxBody'),
			aside = $('#cxSum'),
			grid = $('.co-g');
		if (st.step === 'done' && !order) {
			st = fresh();
			saveState();
		}
		if (st.step !== 'done' && !lines().length) {
			renderSteps();
			grid.classList.add('solo');
			aside.hidden = true;
			body.innerHTML = '<div class="empty"><h3 class="disp">Your cart is empty</h3><p>Add a few dishes before checking out.</p><a class="btn btn-red" href="shop.html">Browse the shop</a></div>';
			return;
		}
		grid.classList.remove('solo');
		aside.hidden = false;
		renderSteps();
		if (st.step === 'done') body.innerHTML = '<div class="card">' + done() + '</div>';
		else {
			var alert = Object.keys(errs).length ? '<div class="cx-alert" role="alert" tabindex="-1" id="cxAlert">Please check the highlighted fields.</div>' : '';
			body.innerHTML =
				'<form class="card" id="cxForm" novalidate>' + (st.step === 1 ? step1() : st.step === 2 ? step2() : step3()).replace('</h2>', '</h2>' + alert) + '</form>';
		}
		aside.innerHTML = summary();
		if (focus === 'top') {
			var h = $('#cxH');
			if (h) h.focus({ preventScroll: true });
			$('#cxRoot').scrollIntoView({ block: 'start' });
		} else if (focus === 'error') {
			var b = $('.fi.bad') || $('#cxAlert');
			if (b) b.focus();
		}
	}

	/* ---------- navigation ---------- */
	function go(step, push) {
		st.step = step;
		errs = {};
		saveState();
		if (push !== false) {
			try {
				if (step === 'done') history.replaceState({ s: step }, '', '#confirmed');
				else history.pushState({ s: step }, '', '#step-' + step);
			} catch (e) {}
		}
		render('top');
	}
	function place() {
		if (placing) return;
		placing = true;
		render();
		setTimeout(function () {
			var ls = lines();
			var f = JSON.parse(JSON.stringify(st.f));
			var o = {
				ref: 'KE-' + (4000 + Math.floor(Math.random() * 5000)),
				placedAt: Date.now(),
				last4: f.cn.replace(/\s/g, '').slice(-4),
				f: (function () { f.cn = f.exp = f.cvc = ''; return f; })(),
				lines: ls,
				t: totals(f, ls),
			};
			try {
				localStorage.setItem(OKEY, JSON.stringify(o));
			} catch (e) {}
			order = o;
			placing = false;
			st.step = 'done';
			saveState();
			KE.cart.clear(); /* the order is placed, so the cart empties */
			go('done', false);
			try { history.replaceState({ s: 'done' }, '', '#confirmed'); } catch (e) {}
			startTracker();
		}, 1300);
	}
	function startTracker() {
		clearInterval(trkTimer);
		if (!order || trkIndex(order) >= 3) return;
		trkTimer = setInterval(function () {
			var el = $('#cxTrk');
			if (!el || !order) return clearInterval(trkTimer);
			el.innerHTML = trkHTML(order);
			if (trkIndex(order) >= 3) clearInterval(trkTimer);
		}, 1000);
	}

	/* ---------- events ---------- */
	function init() {
		if (st.step === 'done') {
			order = loadOrder();
			if (lines().length) {
				/* items were added after the last order: start a new checkout */
				st = fresh();
				order = null;
				saveState();
			}
		}
		var root = $('#cxRoot');

		root.addEventListener('input', function (e) {
			var k = e.target.getAttribute && e.target.getAttribute('data-key');
			if (!k) return;
			var v = e.target.value;
			if (k === 'cn') v = e.target.value = v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
			if (k === 'exp') {
				var d = v.replace(/\D/g, '').slice(0, 4);
				v = e.target.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
			}
			if (k === 'cvc') v = e.target.value = v.replace(/\D/g, '').slice(0, 4);
			if (k === 'branch') return;
			st.f[k] = v;
			if (errs[k]) {
				delete errs[k];
				e.target.classList.remove('bad');
				e.target.removeAttribute('aria-invalid');
				var er = e.target.parentNode.querySelector('.er');
				if (er) er.remove();
			}
			saveState();
		});
		root.addEventListener('change', function (e) {
			var k = e.target.getAttribute && e.target.getAttribute('data-key');
			if (k === 'branch') {
				st.f.branch = +e.target.value;
				saveState();
				var br = BRANCHES[st.f.branch];
				var h = e.target.parentNode.querySelector('.cx-hint');
				if (h) h.textContent = br.addr + ' · open ' + br.hours;
			} else if (k === 'slot') {
				st.f.slot = e.target.value;
				delete errs.slot;
				saveState();
			}
		});
		root.addEventListener('click', function (e) {
			var o = e.target.closest('[data-opt]');
			if (o) {
				var p = o.getAttribute('data-opt').split(':');
				st.f[p[0]] = p[1];
				errs = {};
				saveState();
				render();
				return;
			}
			var g = e.target.closest('[data-goto]');
			if (g && !placing) return go(+g.getAttribute('data-goto'));
			var a = e.target.closest('[data-act]');
			if (a && a.getAttribute('data-act') === 'back' && !placing) return go(st.step - 1);
			if (a && a.getAttribute('data-act') === 'newOrder') {
				try { sessionStorage.removeItem(SKEY); localStorage.removeItem(OKEY); } catch (er) {}
				return; /* the link then leaves for the shop */
			}
			var q = e.target.closest('[data-q]');
			if (q) {
				var k = q.getAttribute('data-k'),
					act = q.getAttribute('data-q');
				if (act === 'inc') KE.cart.setQty(k, KE.cart.qty(k) + 1);
				else if (act === 'dec') KE.cart.setQty(k, KE.cart.qty(k) - 1);
				else KE.cart.setQty(k, 0);
			}
		});
		root.addEventListener('submit', function (e) {
			e.preventDefault();
			if (placing) return;
			if (st.step === 3) return place();
			if (validate(st.step)) go(st.step + 1);
			else render('error');
		});

		/* cart changes (summary steppers, the drawer, another tab) */
		KE.cart.subscribe(function () {
			if (st.step === 'done' || placing) return;
			var ae = document.activeElement,
				typing = ae && ae.matches && ae.matches('.fi');
			if (!lines().length || !typing) render();
			else $('#cxSum').innerHTML = summary();
		});

		/* browser back / forward move between steps */
		window.addEventListener('popstate', function (e) {
			var s = e.state && e.state.s;
			if (!s || s === 'done' || st.step === 'done' || placing) return;
			st.step = s;
			errs = {};
			saveState();
			render('top');
		});
		try {
			if (st.step !== 'done') history.replaceState({ s: st.step }, '', '#step-' + st.step);
		} catch (e) {}

		render();
		startTracker();
	}

	document.addEventListener('DOMContentLoaded', init);
})();
