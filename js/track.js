/* Kebab Express: track order page.
   Front-end only: reads the last order saved by checkout (localStorage) and
   shows its progress. Looking up another reference is not possible without a server. */
(function () {
	'use strict';
	var KE = window.KE,
		$ = KE.$,
		esc = KE.esc,
		money = KE.money;
	var OKEY = 'kebabExpress.lastOrder.v1';
	var BRANCHES = [
		{ name: 'City Centre', addr: '78/31 Market Square, City Centre' },
		{ name: 'Riverside', addr: '4 Quay Road, Riverside' },
		{ name: 'Station Place', addr: '210 Platform Street, Station Place' },
	];
	var timer = 0,
		order = null;

	function load() {
		try {
			return JSON.parse(localStorage.getItem(OKEY));
		} catch (e) {
			return null;
		}
	}
	function idx(o) {
		var s = (Date.now() - o.placedAt) / 1000;
		return s < 2.5 ? 0 : s < 6 ? 1 : s < 9.5 ? 2 : 3;
	}
	function steps(o) {
		var del = o.f.fulfil === 'delivery',
			n = idx(o),
			br = BRANCHES[o.f.branch] || BRANCHES[0];
		var list = [
			['Order received', 'We have your order'],
			['On the grill', 'Your food is being cooked over charcoal'],
			[del ? 'On its way' : 'Ready for pickup', del ? 'A rider is heading to you' : 'Collect it at ' + br.addr],
		];
		var tick = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
		return list
			.map(function (s, i) {
				var cls = i < n ? 'dn' : i === n ? 'now' : '';
				return '<div class="tn ' + cls + '"><i>' + (i < n ? tick : '') + '</i><div><b>' + s[0] + '</b><small>' + s[1] + '</small></div></div>';
			})
			.join('');
	}
	function view(o) {
		var f = o.f,
			del = f.fulfil === 'delivery',
			br = BRANCHES[f.branch] || BRANCHES[0],
			ready = idx(o) >= 3;
		var items = o.lines
			.map(function (l) {
				return '<div class="rv"><span>' + l.q + ' &times;</span><b>' + esc(l.n) + (l.l ? ' <small>(' + esc(l.l) + ')</small>' : '') + '</b></div>';
			})
			.join('');
		return (
			'<div class="tk-card"><div class="tk-head"><div><span class="script" style="font-size:24px">Reference</span><h2 class="disp">' + esc(o.ref) + '</h2></div>' +
			'<span class="tk-pill' + (ready ? ' ok' : '') + '" id="tkPill">' + (ready ? (del ? 'Out for delivery' : 'Ready') : 'In progress') + '</span></div>' +
			'<div class="trk" id="tkTrk" aria-live="polite">' + steps(o) + '</div>' +
			'<div><div class="rv"><span>' + (del ? 'Deliver to' : 'Pick up at') + '</span><b>' +
			(del ? esc(f.addr) + '<br>' + esc(f.city) + ', ' + esc(f.zip) : esc(br.name) + '<br>' + esc(br.addr)) + '</b></div>' +
			'<div class="rv"><span>Estimate</span><b>' + (del ? 'about 35 minutes' : 'about 15 minutes') + '</b></div></div>' +
			'<h3 class="disp">Your items</h3><div>' + items + '<div class="rv"><span>Total</span><b>' + money(o.t.total) + '</b></div></div>' +
			'<div class="tk-actions"><a class="btn btn-red" href="shop.html">Order again</a><a class="btn btn-line" style="border-color:var(--ink);color:var(--ink)" href="index.html">Home</a></div></div>'
		);
	}
	function show(o) {
		order = o;
		$('#tkOut').innerHTML = view(o);
		clearInterval(timer);
		if (idx(o) < 3) {
			timer = setInterval(function () {
				var t = $('#tkTrk');
				if (!t) return clearInterval(timer);
				t.innerHTML = steps(o);
				if (idx(o) >= 3) {
					clearInterval(timer);
					$('#tkOut').innerHTML = view(o);
				}
			}, 1000);
		}
	}
	function msg(text, bad) {
		$('#tkMsg').textContent = text;
		$('#tkForm').classList.toggle('err', !!bad);
	}
	document.addEventListener('DOMContentLoaded', function () {
		var saved = load();
		var input = $('#tkRef');
		var q = new URLSearchParams(location.search).get('ref');
		if (q) input.value = q;
		else if (saved) input.value = saved.ref;
		function lookup() {
			var ref = input.value.trim().toUpperCase();
			var o = load();
			if (!ref) return msg('Please enter your order reference.', true);
			if (o && o.ref === ref) {
				msg('Showing the latest status for ' + ref + '.');
				show(o);
			} else {
				clearInterval(timer);
				$('#tkOut').innerHTML = '';
				msg("We couldn't find " + ref + ' on this device. Check the reference in your confirmation and try again.', true);
			}
		}
		$('#tkForm').addEventListener('submit', function (e) {
			e.preventDefault();
			lookup();
		});
		if (saved) lookup();
	});
})();
