/* Kebab Express: shop page (catalogue, variant chips, product popup).
   The cart lives in js/cart.js and checkout is its own page (checkout.html). */
(function () {
	'use strict';
	var $ = KE.$,
		$$ = KE.$$,
		esc = KE.esc,
		money = KE.money;

	/* =====================================================
     OVERLAY HELPER (focus, Escape, scroll lock)
     ===================================================== */
	var overlays = [];
	function openOverlay(el, focusSel, opener) {
		el.hidden = false;
		overlays.push({ el: el, opener: opener || document.activeElement });
		document.body.style.overflow = 'hidden';
		var f = focusSel && $(focusSel, el);
		if (f) f.focus();
	}
	function closeOverlay(el) {
		el.hidden = true;
		var i = overlays.findIndex(function (o) {
			return o.el === el;
		});
		if (i > -1) {
			var o = overlays.splice(i, 1)[0];
			if (o.opener && o.opener.focus && document.contains(o.opener))
				o.opener.focus();
		}
		if (!overlays.length) document.body.style.overflow = '';
	}
	document.addEventListener('keydown', function (e) {
		if (!overlays.length) return;
		var top = overlays[overlays.length - 1].el;
		if (e.key === 'Escape') {
			top.dispatchEvent(new CustomEvent('overlay-close'));
			return;
		}
		if (e.key === 'Tab') {
			var f = $$(
				'a[href],button:not([disabled]),input:not([disabled]),select,textarea',
				top,
			).filter(function (n) {
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

	/* =====================================================
     CATALOGUE: tabs, search, sort, cards (data comes from js/menu-data.js)
     Dishes with several prices show size/price chips, so any variant is one tap away.
     ===================================================== */
	var ITEMS = KE.MENU.items;
	var CATS = KE.MENU.cats;
	var shop = { tab: 'all', q: '', sort: 'feat', loading: false };
	var sel = {}; /* selected variant per dish id */
	var loadTimer;

	function visibleProducts() {
		var q = shop.q.trim().toLowerCase();
		var list = ITEMS.filter(function (p) {
			return (
				(shop.tab === 'all' || p.cat === shop.tab) &&
				(!q || (p.name + ' ' + p.desc).toLowerCase().indexOf(q) !== -1)
			);
		});
		if (shop.sort === 'lo')
			list = list.slice().sort(function (a, b) {
				return a.min - b.min;
			});
		if (shop.sort === 'hi')
			list = list.slice().sort(function (a, b) {
				return b.min - a.min;
			});
		return list;
	}

	function renderTabs() {
		$('#shopTabs').innerHTML = [{ id: 'all', title: 'All' }]
			.concat(CATS)
			.map(function (t) {
				var on = shop.tab === t.id;
				return (
					'<button class="tab' + (on ? ' on' : '') + '" type="button" role="tab" aria-selected="' + on +
					'" data-tab="' + t.id + '">' + esc(t.title) + '</button>'
				);
			})
			.join('');
	}

	function chipsHTML(p) {
		if (p.variants.length < 2) return '';
		var v0 = sel[p.id] || 0;
		return (
			'<div class="pc-v" role="group" aria-label="Choose an option for ' + esc(p.name) + '">' +
			p.variants
				.map(function (v) {
					var q = KE.cart.qty(v.key);
					return (
						'<button class="vch' + (v0 === v.i ? ' on' : '') + '" type="button" data-act="var" data-id="' + p.id +
						'" data-v="' + v.i + '" aria-pressed="' + (v0 === v.i) + '">' +
						(v.label ? '<small>' + esc(v.label) + '</small>' : '') +
						'<b>' + esc(v.text) + '</b>' +
						(q ? '<i>' + q + '</i>' : '') +
						'</button>'
					);
				})
				.join('') +
			'</div>'
		);
	}
	function actionHTML(p) {
		var v = p.variants[sel[p.id] || 0];
		var qty = KE.cart.qty(v.key);
		var nm = esc(p.name + (v.label ? ' (' + v.label + ')' : ''));
		return qty
			? '<div class="step"><button type="button" data-act="dec" data-id="' + p.id + '" data-v="' + v.i +
				'" aria-label="Remove one ' + nm + '">−</button><b>' + qty + '</b><button type="button" data-act="inc" data-id="' +
				p.id + '" data-v="' + v.i + '" aria-label="Add one more ' + nm + '">+</button></div>'
			: '<button class="add" type="button" data-act="inc" data-id="' + p.id + '" data-v="' + v.i +
				'" aria-label="Add ' + nm + ' to cart">Add</button>';
	}
	function priceHTML(p) {
		return KE.eur(p.variants[sel[p.id] || 0].value);
	}

	function cardHTML(p, i) {
		var tag = p.badge
			? '<span class="tag' + (p.badge === 'Recommended' ? ' rec' : '') + '">' + esc(p.badge) + '</span>'
			: '';
		var hot = p.spicy ? '<span class="hot">Spicy</span>' : '';
		return (
			'<article class="pc" data-card="' + p.id + '" style="animation-delay:' + Math.min(i, 12) * 60 + 'ms">' +
			'<button class="pc-img" type="button" data-act="view" data-id="' + p.id + '" aria-label="View details: ' + esc(p.name) +
			'"><img src="' + p.img + '" alt="' + esc(p.name) + '" loading="lazy">' + tag + '</button>' +
			'<div class="pc-b"><h3 class="disp">' + esc(p.name) + hot + '</h3><p class="pc-d">' + esc(p.desc) + '</p>' +
			'<div class="pc-vwrap">' + chipsHTML(p) + '</div>' +
			'<div class="pc-f"><span class="pr">' + (p.variants.length > 1 ? '' : '') + priceHTML(p) + '</span>' +
			'<span class="pc-act">' + actionHTML(p) + '</span></div></div></article>'
		);
	}

	function renderShop() {
		renderTabs();
		var out = $('#shopOut');
		if (shop.loading) {
			out.innerHTML = '<div class="grid" aria-busy="true">' + new Array(5).join('<div class="sk"></div>') + '</div>';
			return;
		}
		var list = visibleProducts();
		$('#shopCount').textContent = list.length + (list.length === 1 ? ' dish' : ' dishes');
		if (!list.length) {
			out.innerHTML =
				'<div class="empty"><h3 class="disp">Nothing matches that</h3><p>Try another word or show every dish.</p><button class="btn btn-red" type="button" data-act="clear">Show all dishes</button></div>';
			return;
		}
		out.innerHTML = '<div class="grid">' + list.map(cardHTML).join('') + '</div>';
	}

	/* update only the chips / price / add area of one card so the pop animation does not replay */
	function refreshCard(id) {
		var card = $('[data-card="' + id + '"]');
		if (!card) return;
		var p = ITEMS[id];
		$('.pc-vwrap', card).innerHTML = chipsHTML(p);
		$('.pr', card).textContent = priceHTML(p);
		$('.pc-act', card).innerHTML = actionHTML(p);
	}
	function refreshAllCards() {
		$$('[data-card]').forEach(function (c) {
			refreshCard(+c.getAttribute('data-card'));
		});
	}

	function initCatalogue() {
		renderShop();
		$('#shopTabs').addEventListener('click', function (e) {
			var b = e.target.closest('[data-tab]');
			if (!b) return;
			shop.tab = b.getAttribute('data-tab');
			shop.loading = true;
			renderShop();
			clearTimeout(loadTimer);
			loadTimer = setTimeout(function () {
				shop.loading = false;
				renderShop();
			}, 450);
		});
		$('#shopSearch').addEventListener(
			'input',
			KE.debounce(function (e) {
				shop.q = e.target.value;
				renderShop();
			}, 120),
		);
		$('#shopSort').addEventListener('change', function (e) {
			shop.sort = e.target.value;
			renderShop();
		});
		$('#shopOut').addEventListener('click', function (e) {
			var b = e.target.closest('[data-act]');
			if (!b) return;
			var act = b.getAttribute('data-act'),
				id = +b.getAttribute('data-id'),
				v = +b.getAttribute('data-v');
			if (act === 'inc') KE.cart.add(ITEMS[id], v, 1);
			else if (act === 'dec') KE.cart.add(ITEMS[id], v, -1);
			else if (act === 'var') {
				sel[id] = v;
				refreshCard(id);
			} else if (act === 'view') openProduct(id, b);
			else if (act === 'clear') {
				shop.q = '';
				shop.tab = 'all';
				$('#shopSearch').value = '';
				renderShop();
			}
		});
		/* the shared cart tells us whenever it changes (this page, the drawer or another tab) */
		KE.cart.subscribe(function () {
			refreshAllCards();
			if (pm.id !== '' && !$('#prodOv').hidden) updatePm();
		});
	}

	/* =====================================================
     PRODUCT DETAILS MODAL
     ===================================================== */
	var pm = { id: '', v: 0, qty: 1 };
	function openProduct(id, opener) {
		var p = ITEMS[id];
		pm = { id: id, v: sel[id] || 0, qty: 1 };
		$('#pmImg').src = p.img;
		$('#pmImg').alt = p.name;
		$('#pmCat').textContent = KE.MENU.catTitle(p.cat);
		$('#pmName').textContent = p.name;
		$('#pmLong').textContent = p.desc || 'Made fresh to order.';
		var facts = [];
		if (p.badge) facts.push(p.badge);
		if (p.spicy) facts.push('Spicy');
		if (p.variants.length > 1) facts.push(p.variants.length + ' options');
		$('#pmFacts').innerHTML = facts
			.map(function (f) {
				return '<span>' + esc(f) + '</span>';
			})
			.join('');
		updatePm();
		openOverlay($('#prodOv'), '#pmClose', opener);
	}
	function updatePm() {
		var p = ITEMS[pm.id],
			v = p.variants[pm.v];
		$('#pmVar').innerHTML =
			p.variants.length > 1
				? p.variants
					.map(function (x) {
						return (
							'<button class="vch' + (pm.v === x.i ? ' on' : '') + '" type="button" data-pv="' + x.i + '" aria-pressed="' + (pm.v === x.i) + '">' +
							(x.label ? '<small>' + esc(x.label) + '</small>' : '') + '<b>' + esc(x.text) + '</b></button>'
						);
					})
					.join('')
				: '';
		$('#pmPrice').textContent = KE.eur(v.value);
		$('#pmQty').textContent = pm.qty;
		$('#pmAdd').textContent = 'Add to cart · ' + KE.eur(v.value * pm.qty);
	}
	function initProductModal() {
		var ov = $('#prodOv');
		function close() {
			closeOverlay(ov);
		}
		$('#pmClose').addEventListener('click', close);
		ov.addEventListener('overlay-close', close);
		ov.addEventListener('click', function (e) {
			if (e.target === ov) close();
			var b = e.target.closest('[data-pv]');
			if (b) {
				pm.v = +b.getAttribute('data-pv');
				updatePm();
			}
		});
		$('#pmDown').addEventListener('click', function () {
			pm.qty = Math.max(1, pm.qty - 1);
			updatePm();
		});
		$('#pmUp').addEventListener('click', function () {
			pm.qty = Math.min(20, pm.qty + 1);
			updatePm();
		});
		$('#pmAdd').addEventListener('click', function () {
			sel[pm.id] = pm.v;
			KE.cart.add(ITEMS[pm.id], pm.v, pm.qty);
			close();
		});
	}

	document.addEventListener('DOMContentLoaded', function () {
		initCatalogue();
		initProductModal();
		var tabQ = new URLSearchParams(location.search).get('tab');
		if (tabQ && $('[data-tab="' + tabQ + '"]')) $('[data-tab="' + tabQ + '"]').click();
	});
})();
