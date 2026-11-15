/* Kebab Express: gallery page (photo grid, "Show more", lightbox).
   To add your own pictures, push more entries into PHOTOS below ({ cap, src }). */
(function () {
	'use strict';
	var $ = KE.$,
		$$ = KE.$$,
		esc = KE.esc;

	var PHOTOS = [
		{ cap: 'Adana on lavash', src: 'assets/img/adana-kebab.jpg' },
		{ cap: 'Kofta shish plate', src: 'assets/img/kofta-shish.jpg' },
		{ cap: 'Hummus & falafel', src: 'assets/img/hummus-falafel.jpg' },
		{ cap: 'Künefe', src: 'assets/img/kunefe.jpg' },
		{ cap: 'Döner wrap', src: 'assets/img/doner-wrap.jpg' },
		{ cap: 'Baklava', src: 'assets/img/baklava.jpg' },
		{ cap: 'Iskender kebab', src: 'assets/img/iskender.jpg' },
		{ cap: 'Grilled king prawns', src: 'assets/img/grilled-prawns.jpg' },
		{ cap: 'Classic cheeseburger', src: 'assets/img/dishes/burger.jpg' },
		{ cap: 'Calzone, fresh from the oven', src: 'assets/img/dishes/calzone.jpg' },
		{ cap: 'Chili cheese fries', src: 'assets/img/dishes/cheese-fries.jpg' },
		{ cap: 'Döner in pita', src: 'assets/img/dishes/doner-pita.jpg' },
		{ cap: 'Crispy drumsticks', src: 'assets/img/dishes/drumstick.jpg' },
		{ cap: 'Dürüm with ayran', src: 'assets/img/dishes/durum.jpg' },
		{ cap: 'Frankfurter plate', src: 'assets/img/dishes/frankfurt.jpg' },
		{ cap: 'Golden fries', src: 'assets/img/dishes/fries.jpg' },
		{ cap: 'Kids meal', src: 'assets/img/dishes/kids-meal.jpg' },
		{ cap: 'Crunchy nuggets', src: 'assets/img/dishes/nuggets.jpg' },
		{ cap: 'Onion rings', src: 'assets/img/dishes/onion-rings.jpg' },
		{ cap: 'Four-cheese pizza', src: 'assets/img/dishes/pizza-4cheese.jpg' },
		{ cap: 'BBQ chicken pizza', src: 'assets/img/dishes/pizza-bbq.jpg' },
		{ cap: 'Pizza carbonara', src: 'assets/img/dishes/pizza-carbonara.jpg' },
		{ cap: 'Döner pizza', src: 'assets/img/dishes/pizza-doner.jpg' },
		{ cap: 'Hawaiian pizza', src: 'assets/img/dishes/pizza-hawaiian.jpg' },
		{ cap: 'Margherita pizza', src: 'assets/img/dishes/pizza-margherita.jpg' },
		{ cap: 'Salami pizza', src: 'assets/img/dishes/pizza-salami.jpg' },
		{ cap: 'Spicy rollo', src: 'assets/img/dishes/rollo.jpg' },
		{ cap: 'Street tacos', src: 'assets/img/dishes/taco.jpg' },
	];

	/* one tile per menu dish that has an illustration, so the grid grows with the menu */
	var seen = {};
	KE.MENU.items.forEach(function (it) {
		if (seen[it.name] || it.img.indexOf('data:') !== 0) return;
		seen[it.name] = 1;
		PHOTOS.push({ cap: it.name + ' · ' + KE.MENU.catTitle(it.cat), src: it.img, art: true });
	});

	var PATTERN = ['w2 h2', '', '', 'h2', '', 'w2', '', '', 'h2', '', '', 'w2'];
	var STEP = 12;
	var shown = 0;
	var mosaic = $('#mosaic'),
		more = $('#galMore'),
		count = $('#galCount');

	function tile(p, i) {
		var cls = PATTERN[i % PATTERN.length];
		return (
			'<button class="tile ' + cls + '" type="button" data-i="' + i + '" aria-label="Open photo: ' + esc(p.cap) + '">' +
			'<div class="plate' + (p.art ? ' art' : '') + '"><img class="ph" src="' + p.src + '" alt="" loading="lazy"></div>' +
			'<div class="ov"><span>' + esc(p.cap) + '</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></div></button>'
		);
	}
	function showMore() {
		var next = Math.min(shown + STEP, PHOTOS.length);
		var html = '';
		for (var i = shown; i < next; i++) html += tile(PHOTOS[i], i);
		mosaic.insertAdjacentHTML('beforeend', html);
		shown = next;
		count.textContent = 'Showing ' + shown + ' of ' + PHOTOS.length + ' pictures';
		more.hidden = shown >= PHOTOS.length;
	}
	more.addEventListener('click', showMore);
	showMore();

	/* lightbox */
	var lb = $('#lightbox'),
		img = $('#lbImg'),
		cap = $('#lbCap');
	var idx = 0,
		opener = null;
	function show(i) {
		idx = (i + PHOTOS.length) % PHOTOS.length;
		img.src = PHOTOS[idx].src;
		img.alt = PHOTOS[idx].cap;
		cap.textContent = PHOTOS[idx].cap + ' · ' + (idx + 1) + ' / ' + PHOTOS.length;
	}
	function open(i, from) {
		opener = from;
		show(i);
		lb.hidden = false;
		document.body.style.overflow = 'hidden';
		$('#lbClose').focus();
	}
	function close() {
		lb.hidden = true;
		document.body.style.overflow = '';
		if (opener) opener.focus();
	}
	mosaic.addEventListener('click', function (e) {
		var t = e.target.closest('.tile');
		if (t) open(+t.getAttribute('data-i'), t);
	});
	$('#lbClose').addEventListener('click', close);
	$('#lbPrev').addEventListener('click', function () {
		show(idx - 1);
	});
	$('#lbNext').addEventListener('click', function () {
		show(idx + 1);
	});
	lb.addEventListener('click', function (e) {
		if (e.target === lb) close();
	});
	document.addEventListener('keydown', function (e) {
		if (lb.hidden) return;
		if (e.key === 'Escape') close();
		else if (e.key === 'ArrowLeft') show(idx - 1);
		else if (e.key === 'ArrowRight') show(idx + 1);
		else if (e.key === 'Tab') {
			var f = $$('button', lb),
				first = f[0],
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
})();
