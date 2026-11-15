/* Kebab Express: home page behaviour */
(function () {
	'use strict';
	var $ = KE.$,
		$$ = KE.$$,
		esc = KE.esc;

	/* =====================================================
     DATA (sample content: replace with real data / an API)
     ===================================================== */
	var CATS = KE.MENU.cats,
		ITEMS = KE.MENU.items;

	var PHOTOS = [
		{ cap: 'Adana on lavash', src: 'assets/img/adana-kebab.jpg', cls: 'w2 h2' },
		{ cap: 'Kofta shish plate', src: 'assets/img/kofta-shish.jpg', cls: '' },
		{ cap: 'Hummus & falafel', src: 'assets/img/hummus-falafel.jpg', cls: '' },
		{ cap: 'Künefe', src: 'assets/img/kunefe.jpg', cls: '' },
		{ cap: 'Döner wrap', src: 'assets/img/doner-wrap.jpg', cls: '' },
		{ cap: 'Baklava', src: 'assets/img/baklava.jpg', cls: '' },
		{ cap: 'Iskender kebab', src: 'assets/img/iskender.jpg', cls: 'w2' },
		{
			cap: 'Grilled king prawns',
			src: 'assets/img/grilled-prawns.jpg',
			cls: '',
		},
	];

	/* x / y are pixel positions on the 768 x 512 map image (OpenStreetMap z15 tiles 16371-16373 / 10895-10896) */
	var BRANCHES = [
		{
			name: 'Old Town',
			addr: '12 Ember Lane, Old Town',
			tel: '+44 20 7946 0123',
			hours: '11:00 – 01:00',
			x: 450,
			y: 140,
		},
		{
			name: 'City Centre',
			addr: '78/31 Market Square, City Centre',
			tel: '+44 20 7946 0124',
			hours: '11:00 – 02:00',
			x: 345,
			y: 180,
		},
		{
			name: 'Riverside',
			addr: '4 Quay Road, Riverside',
			tel: '+44 20 7946 0125',
			hours: '12:00 – 00:00',
			x: 505,
			y: 305,
		},
		{
			name: 'Station Place',
			addr: '210 Platform Street, Station Place',
			tel: '+44 20 7946 0126',
			hours: '10:00 – 01:00',
			x: 195,
			y: 225,
		},
	];
	var MAP = { w: 768, h: 512, z: 15, x0: 16371, y0: 10895 };

	function pixelToLatLon(px, py) {
		var n = Math.pow(2, MAP.z);
		var xt = MAP.x0 + px / 256;
		var yt = MAP.y0 + py / 256;
		var lon = (xt / n) * 360 - 180;
		var lat =
			(Math.atan(Math.sinh(Math.PI * (1 - (2 * yt) / n))) * 180) / Math.PI;
		return { lat: lat, lon: lon };
	}

	/* =====================================================
     HERO: video, embers, scroll spy
     ===================================================== */
	function initHero() {
		var hero = $('#top');
		var video = $('#heroVideo');
		var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		/* embers */
		var xs = [8, 17, 26, 34, 43, 52, 60, 68, 75, 83, 90, 12, 47, 71];
		$('#embers').innerHTML = xs
			.map(function (x, i) {
				var dx = (i % 2 ? 1 : -1) * (30 + i * 9);
				var s = 3 + (i % 4);
				var dur = 6 + (i % 5) * 1.7;
				return (
					'<span class="ember" style="left:' +
					x +
					'%;width:' +
					s +
					'px;height:' +
					s +
					'px;--dx:' +
					dx +
					'px;animation-duration:' +
					dur +
					's;animation-delay:' +
					-i * 0.9 +
					's"></span>'
				);
			})
			.join('');

		if (video) {
			video.muted = true;
			video.addEventListener('loadedmetadata', function () {
				video.playbackRate = 0.5;
			});
			video.playbackRate = 0.5;
		}
		if (calm && video) {
			hero.classList.add('paused');
			video.pause();
		}
	}

	function initScrollSpy() {
		var links = $$('[data-nav]');
		var map = {};
		links.forEach(function (a) {
			map[a.getAttribute('data-nav')] = a;
		});
		var ids = ['top', 'menu', 'gallery', 'locations', 'book'];
		if (!('IntersectionObserver' in window)) return;
		var current = 'top';
		var io = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (en) {
					if (en.isIntersecting) current = en.target.id;
				});
				var key = current === 'about' ? 'menu' : current;
				links.forEach(function (a) {
					a.classList.toggle('cur', a.getAttribute('data-nav') === key);
				});
			},
			{ rootMargin: '-45% 0px -50% 0px' },
		);
		ids.concat(['about']).forEach(function (id) {
			var el = document.getElementById(id);
			if (el) io.observe(el);
		});
	}

	/* =====================================================
     MENU: tabs, search, filters, skeleton, empty state
     ===================================================== */
	var menu = { tab: 'all', q: '', flt: '', loading: false };
	var FILTERS = [
		['', 'Everything'],
		['new', 'New'],
		['rec', 'Recommended'],
		['spicy', 'Spicy'],
	];

	function menuMatch(it) {
		var q = menu.q.trim().toLowerCase();
		if (q && (it.name + ' ' + it.desc).toLowerCase().indexOf(q) === -1)
			return false;
		if (menu.flt === 'new') return it.badge === 'New';
		if (menu.flt === 'rec') return it.badge === 'Recommended';
		if (menu.flt === 'spicy') return it.spicy;
		return true;
	}

	function renderMenuControls() {
		var tabs = [{ id: 'all', title: 'All' }].concat(CATS);
		$('#menuTabs').innerHTML = tabs
			.map(function (t) {
				var on = menu.tab === t.id;
				return (
					'<button class="tab' +
					(on ? ' on' : '') +
					'" type="button" role="tab" aria-selected="' +
					on +
					'" data-tab="' +
					t.id +
					'">' +
					esc(t.title) +
					'</button>'
				);
			})
			.join('');
		var count = $('#menuCount');
		$$('.chip', $('#menuFilters')).forEach(function (c) {
			c.remove();
		});
		FILTERS.forEach(function (f) {
			var b = document.createElement('button');
			b.type = 'button';
			b.className = 'chip' + (menu.flt === f[0] ? ' on' : '');
			b.setAttribute('aria-pressed', String(menu.flt === f[0]));
			b.setAttribute('data-flt', f[0]);
			b.textContent = f[1];
			$('#menuFilters').insertBefore(b, count);
		});
	}

	function renderMenu() {
		renderMenuControls();
		var out = $('#menuOut');
		if (menu.loading) {
			out.innerHTML =
				'<div class="mcols" aria-busy="true" aria-label="Loading menu">' +
				new Array(9).join('<div class="sk-row"></div>') +
				'</div>';
			return;
		}
		var groups = CATS.filter(function (c) {
			return menu.tab === 'all' || menu.tab === c.id;
		})
			.map(function (c) {
				return {
					title: c.title,
					items: ITEMS.filter(function (it) {
						return it.cat === c.id && menuMatch(it);
					}),
				};
			})
			.filter(function (g) {
				return g.items.length;
			});
		var total = groups.reduce(function (n, g) {
			return n + g.items.length;
		}, 0);
		$('#menuCount').textContent = total + (total === 1 ? ' dish' : ' dishes');

		if (!total) {
			out.innerHTML =
				'<div class="empty"><svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#6B5B52" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="12" stroke-dasharray="3 6"/><path d="M50 50l8 8"/></svg>' +
				'<h3 class="disp">Nothing on the grill for that</h3><p>No dishes match your search. Try another word or clear the filters.</p>' +
				'<button class="btn btn-red" type="button" id="menuClear">Clear filters</button></div>';
			return;
		}
		out.innerHTML =
			'<div class="mcols">' +
			groups
				.map(function (g) {
					return (
						'<div class="mgrp"><h3 class="disp">' +
						esc(g.title) +
						'</h3>' +
						g.items
							.map(function (it, i) {
								var tag = it.badge
									? '<span class="tag' +
										(it.badge === 'Recommended' ? ' rec' : '') +
										'">' +
										it.badge +
										'</span>'
									: '';
								var hot = it.spicy ? ' <span class="hot">Spicy</span>' : '';
									var vs = it.variants;
									return (
										'<div class="mi" style="animation-delay:' +
										i * 70 +
										'ms">' +
										tag +
										'<div class="mi-r"><span>' +
										esc(it.name) +
										'</span><span class="dots"></span><span class="prs">' +
										vs
											.map(function (v) {
												return (
													'<span class="pv"><span class="pr">' +
													esc(v.text) +
													'</span><button class="madd" type="button" data-add="' +
													it.id +
													'" data-v="' +
													v.i +
													'" aria-label="Add ' +
													esc(it.name + (v.label ? ' (' + v.label + ')' : '') + ', ' + v.text) +
													' to cart"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button></span>'
												);
											})
											.join('') +
										'</span></div>' +
										'<div class="mi-d">' +
										esc(it.desc) +
										hot +
										'</div></div>'
									);
							})
							.join('') +
						'</div>'
					);
				})
				.join('') +
			'</div>';
	}

	function flashAdd(btn) {
		btn.classList.add('pop');
		setTimeout(function () {
			btn.classList.remove('pop');
		}, 350);
	}

	function initMenu() {
		renderMenu();
		var timer;
		$('#menuTabs').addEventListener('click', function (e) {
			var b = e.target.closest('[data-tab]');
			if (!b) return;
			setMenuTab(b.getAttribute('data-tab'));
		});
		$('#menuFilters').addEventListener('click', function (e) {
			var b = e.target.closest('[data-flt]');
			if (!b) return;
			menu.flt = b.getAttribute('data-flt');
			renderMenu();
		});
		$('#menuSearch').addEventListener(
			'input',
			KE.debounce(function (e) {
				menu.q = e.target.value;
				renderMenu();
			}, 120),
		);
		$('#menuOut').addEventListener('click', function (e) {
			var add = e.target.closest('[data-add]');
			if (add) {
				KE.cart.add(ITEMS[+add.getAttribute('data-add')], +add.getAttribute('data-v'), 1);
				flashAdd(add);
				return;
			}
			if (e.target.closest('#menuClear')) {
				menu.q = '';
				menu.flt = '';
				menu.tab = 'all';
				$('#menuSearch').value = '';
				renderMenu();
			}
		});
		function setMenuTab(id) {
			menu.tab = id;
			menu.loading = true;
			renderMenu();
			clearTimeout(timer);
			timer = setTimeout(function () {
				menu.loading = false;
				renderMenu();
			}, 450);
		}
	}



	/* =====================================================
     SPECIAL OFFERS (first offers from the menu data) + REVIEWS CAROUSEL
     ===================================================== */
	function initOffers() {
		var seen = {},
			picks = ITEMS.filter(function (it) {
				if (it.cat !== 'offers' || seen[it.name]) return false;
				return (seen[it.name] = true);
			}).slice(0, 6);
		var grid = $('#offerGrid');
		grid.innerHTML = picks
			.map(function (it) {
				return (
					'<article class="spo-c"><div class="spo-img"><img src="' + it.img + '" alt="' + esc(it.name) + '" loading="lazy">' +
					(it.badge ? '<span class="spo-tag">' + esc(it.badge) + '</span>' : '') + '</div>' +
					'<div class="spo-b"><h3 class="disp">' + esc(it.name) + '</h3><p>' + esc(it.desc) + '</p>' +
					'<div class="spo-f"><span class="pr">' + esc(it.variants[0].text) + '</span>' +
					'<button class="btn btn-red spo-add" type="button" data-offer="' + it.id + '">Add to cart</button></div></div></article>'
				);
			})
			.join('');
		grid.addEventListener('click', function (e) {
			var b = e.target.closest('[data-offer]');
			if (!b) return;
			KE.cart.add(ITEMS[+b.getAttribute('data-offer')], 0, 1);
			b.textContent = 'Added ✓';
			setTimeout(function () {
				b.textContent = 'Add to cart';
			}, 1200);
		});
	}

	/* sample reviews: replace with real guest feedback */
	var REVIEWS = [
		{ n: 'Sara R.', w: 'Old Town', s: 5, t: 'The durum was packed, hot and ready in minutes. Best late-night meal we have found in the city.' },
		{ n: 'Daniel M.', w: 'City Centre', s: 5, t: 'Pizza arrived crisp and generous with toppings. The family size easily fed four of us.' },
		{ n: 'Amira K.', w: 'Riverside', s: 5, t: 'Friendly staff and the kebab plate was properly charcoal-grilled. We booked a table and it was ready on time.' },
		{ n: 'Tom H.', w: 'Station Place', s: 4, t: 'Great value offers. The 2 Rollos deal with cheese fries was more than enough for lunch.' },
		{ n: 'Lucia P.', w: 'Old Town', s: 5, t: 'Ordering online was simple, and picking the pizza size took a single tap. Will order again.' },
		{ n: 'Hamza A.', w: 'City Centre', s: 5, t: 'Fresh bread, juicy meat and the sauces are brilliant. My go-to after work.' },
		{ n: 'Elena V.', w: 'Riverside', s: 4, t: 'The kids menu kept my two happy and the burgers were a hit. Quick service, too.' },
		{ n: 'Omar S.', w: 'Station Place', s: 5, t: 'Hot, fast and tasty every time. The falafel plate is underrated.' },
	];
	function initReviews() {
		var track = $('#rvTrack'),
			dotsEl = $('#rvDots');
		var star = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7L12 17.5 5.7 21l1.5-7L2 9.3l7-.8z"/></svg>';
		track.innerHTML = REVIEWS.map(function (r, i) {
			return (
				'<figure class="rv-c" aria-roledescription="slide" aria-label="Review ' + (i + 1) + ' of ' + REVIEWS.length + '">' +
				'<div class="rv-s" role="img" aria-label="' + r.s + ' out of 5 stars">' +
				new Array(r.s + 1).join(star) + '</div>' +
				'<blockquote>' + esc(r.t) + '</blockquote>' +
				'<figcaption><span class="rv-av" aria-hidden="true">' + esc(r.n.charAt(0)) + '</span><span><b>' + esc(r.n) + '</b><small>' + esc(r.w) + '</small></span></figcaption></figure>'
			);
		}).join('');
		var cards = $$('.rv-c', track);
		var page = 0,
			pages = 1,
			timer = 0;

		function perView() {
			return Math.max(1, Math.round(track.clientWidth / cards[0].getBoundingClientRect().width));
		}
		function buildDots() {
			pages = Math.ceil(cards.length / perView());
			dotsEl.innerHTML = new Array(pages + 1).join('<button class="rv-d" type="button"></button>');
			$$('.rv-d', dotsEl).forEach(function (d, i) {
				d.setAttribute('aria-label', 'Go to reviews page ' + (i + 1));
				d.addEventListener('click', function () {
					goTo(i);
				});
			});
			mark();
		}
		function mark() {
			$$('.rv-d', dotsEl).forEach(function (d, i) {
				d.classList.toggle('on', i === page);
				d.setAttribute('aria-current', i === page ? 'true' : 'false');
			});
		}
		function goTo(p) {
			page = (p + pages) % pages;
			var first = Math.min(page * perView(), cards.length - 1);
			track.scrollTo({ left: cards[first].offsetLeft - cards[0].offsetLeft, behavior: 'smooth' });
			mark();
		}
		track.addEventListener(
			'scroll',
			KE.debounce(function () {
				var w = cards[0].getBoundingClientRect().width + 20;
				var idx = Math.round(track.scrollLeft / w);
				page = Math.min(pages - 1, Math.round(idx / perView()));
				mark();
			}, 80),
		);
		$('#rvPrev').addEventListener('click', function () {
			goTo(page - 1);
		});
		$('#rvNext').addEventListener('click', function () {
			goTo(page + 1);
		});
		/* auto-slide: advances every 4.5s, pauses while hovered, touched or keyboard-focused */
		var paused = false;
		function stop() {
			clearInterval(timer);
			timer = 0;
		}
		function play() {
			stop();
			timer = setInterval(function () {
				if (!paused && !document.hidden) goTo(page + 1);
			}, 4500);
		}
		var box = track.parentNode;
		box.addEventListener('mouseenter', function () { paused = true; });
		box.addEventListener('mouseleave', function () { paused = false; });
		box.addEventListener('touchstart', function () { paused = true; }, { passive: true });
		box.addEventListener('touchend', function () {
			setTimeout(function () { paused = false; }, 4000);
		}, { passive: true });
		box.addEventListener('focusin', function (e) {
			if (e.target.matches && e.target.matches(':focus-visible')) paused = true;
		});
		box.addEventListener('focusout', function () { paused = false; });
		['click'].forEach(function (ev) {
			box.addEventListener(ev, function (e) {
				if (e.target.closest('.rv-b, .rv-d')) play(); /* restart the clock after a manual move */
			});
		});
		window.addEventListener('resize', KE.debounce(buildDots, 150));
		buildDots();
		play();
	}

	/* =====================================================
     GALLERY + LIGHTBOX
     ===================================================== */
	function initGallery() {
		var mosaic = $('#mosaic');
		mosaic.innerHTML = PHOTOS.map(function (p, i) {
			return (
				'<button class="tile ' +
				p.cls +
				'" type="button" data-i="' +
				i +
				'" aria-label="Open photo: ' +
				esc(p.cap) +
				'">' +
				'<div class="plate"><img class="ph" src="' +
				p.src +
				'" alt="" loading="lazy"></div>' +
				'<div class="ov"><span>' +
				esc(p.cap) +
				'</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></div></button>'
			);
		}).join('');

		var lb = $('#lightbox'),
			img = $('#lbImg'),
			cap = $('#lbCap');
		var idx = 0,
			opener = null;
		function show(i) {
			idx = (i + PHOTOS.length) % PHOTOS.length;
			img.src = PHOTOS[idx].src;
			img.alt = PHOTOS[idx].cap;
			cap.textContent =
				PHOTOS[idx].cap + ' · ' + (idx + 1) + ' / ' + PHOTOS.length;
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
				var f = $$('button', lb);
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
	}

	/* =====================================================
     LOCATIONS: branch list, map pins, details card
     ===================================================== */
	var branch = 0;
	var onBranchChange = [];

	function initLocations() {
		var list = $('#branchList');
		var mapIn = $('#mapIn');

		list.innerHTML = BRANCHES.map(function (b, i) {
			return (
				'<button class="bc" type="button" data-i="' +
				i +
				'" aria-pressed="false"><span class="bc-n">' +
				(i + 1) +
				'</span><span><b>' +
				esc(b.name) +
				'</b><small>' +
				esc(b.addr) +
				'</small></span></button>'
			);
		}).join('');

		BRANCHES.forEach(function (b, i) {
			var pin = document.createElement('button');
			pin.type = 'button';
			pin.className = 'pin';
			pin.setAttribute('data-i', i);
			pin.setAttribute('aria-label', 'Select ' + b.name);
			pin.style.left = ((b.x / MAP.w) * 100).toFixed(2) + '%';
			pin.style.top = ((b.y / MAP.h) * 100).toFixed(2) + '%';
			pin.innerHTML =
				'<span class="pin-b"></span><span class="pin-n">' +
				(i + 1) +
				'</span><span class="plbl">' +
				esc(b.name) +
				'</span>';
			mapIn.appendChild(pin);
		});

		function select(i) {
			branch = i;
			var b = BRANCHES[i];
			$$('.bc', list).forEach(function (el, k) {
				el.classList.toggle('on', k === i);
				el.setAttribute('aria-pressed', String(k === i));
			});
			$$('.pin', mapIn).forEach(function (el, k) {
				el.classList.toggle('on', k === i);
			});
			$('#locName').textContent = b.name;
			$('#locAddr').textContent = b.addr;
			$('#locTel').innerHTML =
				'T: <a href="tel:' +
				b.tel.replace(/\s/g, '') +
				'">' +
				esc(b.tel) +
				'</a>';
			$('#locHours').textContent = b.hours;
			var ll = pixelToLatLon(b.x, b.y);
			$('#locDir').href =
				'https://www.openstreetmap.org/?mlat=' +
				ll.lat.toFixed(5) +
				'&mlon=' +
				ll.lon.toFixed(5) +
				'#map=17/' +
				ll.lat.toFixed(5) +
				'/' +
				ll.lon.toFixed(5);
			onBranchChange.forEach(function (fn) {
				fn(i);
			});
		}
		list.addEventListener('click', function (e) {
			var b = e.target.closest('.bc');
			if (b) select(+b.getAttribute('data-i'));
		});
		mapIn.addEventListener('click', function (e) {
			var p = e.target.closest('.pin');
			if (p) select(+p.getAttribute('data-i'));
		});
		select(0);
	}

	/* =====================================================
     BOOKING: date, time, guests, validation, confirmation
     (front-end only: submit shows a confirmation, nothing is sent)
     ===================================================== */
	var DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	var MONTHS = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	];
	var TIMES = [
		'12:00',
		'12:30',
		'13:00',
		'13:30',
		'14:00',
		'18:00',
		'18:30',
		'19:00',
		'19:30',
		'20:00',
		'20:30',
		'21:00',
	];

	function initBooking() {
		var st = { day: 0, time: '', party: 2, branch: 0, sending: false };
		var days = [];
		var today = new Date();
		for (var i = 0; i < 7; i++) {
			var d = new Date(
				today.getFullYear(),
				today.getMonth(),
				today.getDate() + i,
			);
			days.push(d);
		}
		var sel = $('#bk-branch');
		sel.innerHTML = BRANCHES.map(function (b, i) {
			return '<option value="' + i + '">' + esc(b.name) + '</option>';
		}).join('');

		/* deterministic "full" slots per day and branch so the demo is stable */
		function isFull(dayIdx, t) {
			var h = 0,
				s = dayIdx + '|' + st.branch + '|' + t;
			for (var k = 0; k < s.length; k++) h = (h * 31 + s.charCodeAt(k)) % 97;
			return h % 5 === 0;
		}
		function isPast(dayIdx, t) {
			if (dayIdx !== 0) return false;
			var p = t.split(':');
			var slot = new Date();
			slot.setHours(+p[0], +p[1], 0, 0);
			return slot <= new Date();
		}

		function renderDays() {
			$('#days').innerHTML = days
				.map(function (d, i) {
					return (
						'<button class="day' +
						(st.day === i ? ' on' : '') +
						'" type="button" aria-pressed="' +
						(st.day === i) +
						'" data-i="' +
						i +
						'"><small>' +
						(i === 0 ? 'Today' : DAY_NAMES[d.getDay()]) +
						'</small><b>' +
						d.getDate() +
						'</b><small>' +
						MONTHS[d.getMonth()] +
						'</small></button>'
					);
				})
				.join('');
		}
		function renderSlots() {
			if (st.time && (isFull(st.day, st.time) || isPast(st.day, st.time)))
				st.time = '';
			$('#slots').innerHTML = TIMES.map(function (t) {
				var dis = isFull(st.day, t) || isPast(st.day, t);
				return (
					'<button class="slot' +
					(st.time === t ? ' on' : '') +
					'" type="button" data-t="' +
					t +
					'"' +
					(dis ? ' disabled' : '') +
					' aria-pressed="' +
					(st.time === t) +
					'">' +
					t +
					'</button>'
				);
			}).join('');
		}
		function fmtDate() {
			var d = days[st.day];
			return (
				DAY_NAMES[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()]
			);
		}
		function renderTicket() {
			$('#tkBranch').textContent = BRANCHES[st.branch].name;
			$('#tkDate').textContent = fmtDate();
			$('#tkTime').textContent = st.time || 'Pick a time';
			$('#tkParty').textContent = st.party;
			$('#tkName').textContent = $('#bk-name').value.trim() || '—';
			$('#partyText').textContent =
				st.party + (st.party === 1 ? ' guest' : ' guests');
		}
		function renderAll() {
			renderDays();
			renderSlots();
			renderTicket();
		}

		$('#days').addEventListener('click', function (e) {
			var b = e.target.closest('.day');
			if (!b) return;
			st.day = +b.getAttribute('data-i');
			renderAll();
		});
		$('#slots').addEventListener('click', function (e) {
			var b = e.target.closest('.slot');
			if (!b || b.disabled) return;
			st.time = b.getAttribute('data-t');
			$('#errTime').hidden = true;
			renderAll();
		});
		$('#partyDown').addEventListener('click', function () {
			st.party = Math.max(1, st.party - 1);
			renderTicket();
		});
		$('#partyUp').addEventListener('click', function () {
			st.party = Math.min(12, st.party + 1);
			renderTicket();
		});
		sel.addEventListener('change', function () {
			st.branch = +sel.value;
			if (branch !== st.branch) {
				setBranchFromBooking(st.branch);
			}
			renderAll();
		});
		$('#bk-name').addEventListener('input', function () {
			$('#errName').hidden = true;
			this.classList.remove('bad');
			renderTicket();
		});
		$('#bk-phone').addEventListener('input', function () {
			$('#errPhone').hidden = true;
			this.classList.remove('bad');
		});
		$('#bk-mail').addEventListener('input', function () {
			$('#errEmail').hidden = true;
			this.classList.remove('bad');
		});

		/* keep the booking location in step with the map selection */
		onBranchChange.push(function (i) {
			st.branch = i;
			sel.value = String(i);
			renderAll();
		});
		function setBranchFromBooking(i) {
			var b = $('.bc[data-i="' + i + '"]');
			if (b) b.click();
		}
		$('#locBook').addEventListener('click', function () {
			$('#bk-name').focus({ preventScroll: true });
		});

		function flag(id, inputId, bad) {
			$(id).hidden = !bad;
			if (inputId) $(inputId).classList.toggle('bad', bad);
			return bad;
		}
		$('#bookSubmit').addEventListener('click', function () {
			if (st.sending) return;
			var name = $('#bk-name').value.trim();
			var phone = $('#bk-phone').value;
			var mail = $('#bk-mail').value.trim();
			var errs = [
				flag('#errName', '#bk-name', !name),
				flag('#errPhone', '#bk-phone', phone.replace(/\D/g, '').length < 7),
				flag('#errEmail', '#bk-mail', !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)),
				flag('#errTime', null, !st.time),
			];
			if (errs.some(Boolean)) {
				var first = $('.bad') || $('#errTime:not([hidden])');
				if (first && first.scrollIntoView)
					first.scrollIntoView({ block: 'center', behavior: 'smooth' });
				return;
			}
			st.sending = true;
			$('#bookSubmit').disabled = true;
			$('.spin', $('#bookSubmit')).hidden = false;
			$('#bookSubmitText').textContent = 'Reserving…';
			setTimeout(function () {
				var ref = 'KE-' + (4000 + Math.floor(Math.random() * 5000));
				$('#bookOkText').innerHTML =
					'We have saved your table at ' +
					esc(BRANCHES[st.branch].name) +
					' for ' +
					esc(fmtDate()) +
					' at ' +
					st.time +
					'. Your reference is <b style="color:var(--ink)">' +
					ref +
					'</b>. A confirmation will be sent to ' +
					esc(mail) +
					'.';
				$('#bookFields').hidden = true;
				$('#bookOk').hidden = false;
				$('#tkStamp').hidden = false;
				$('#tkDraft').hidden = true;
				st.sending = false;
				$('#bookSubmit').disabled = false;
				$('.spin', $('#bookSubmit')).hidden = true;
				$('#bookSubmitText').textContent = 'Confirm booking';
			}, 1300);
		});
		$('#bookReset').addEventListener('click', function () {
			['#bk-name', '#bk-phone', '#bk-mail', '#bk-note'].forEach(function (s) {
				$(s).value = '';
			});
			st.time = '';
			st.party = 2;
			$('#bookOk').hidden = true;
			$('#bookFields').hidden = false;
			$('#tkStamp').hidden = true;
			$('#tkDraft').hidden = false;
			renderAll();
		});
		renderAll();
	}

	document.addEventListener('DOMContentLoaded', function () {
		initHero();
		initScrollSpy();
		initMenu();
		initOffers();
		initReviews();
		initGallery();
		initLocations();
		initBooking();
		/* allow links like index.html?tab=kebabs#menu */
		var tab = new URLSearchParams(location.search).get('tab');
		if (tab) {
			var b = $('[data-tab="' + tab + '"]');
			if (b) b.click();
		}
	});
})();

// item(
// 	'starters',
// 	'Hummus & Warm Lavash',
// 	'$7.50',
// 	'Chickpea / Tahini / Olive oil',
// 	'New',
// ),
// item(
// 	'starters',
// 	'Spicy Ezme Salad',
// 	'$6.90',
// 	'Tomato / Chilli / Pomegranate',
// 	'',
// 	true,
// ),
// item(
// 	'starters',
// 	'Crispy Lamb Börek',
// 	'$9.50',
// 	'Lamb / Feta / Filo',
// 	'Recommended',
// ),
// item(
// 	'starters',
// 	'Grilled Halloumi Skewer',
// 	'$8.50',
// 	'Halloumi / Honey / Thyme',
// ),
// item('starters', 'Red Lentil Soup', '$6.00', 'Lentil / Mint / Lemon'),
// item(
// 	'kebabs',
// 	'Adana Kebab',
// 	'$16.50',
// 	'Minced lamb / Red pepper / Lavash',
// 	'Recommended',
// 	true,
// ),
// item('kebabs', 'Chicken Shish', '$14.90', 'Chicken thigh / Yogurt / Sumac'),
// item(
// 	'kebabs',
// 	'Lamb Shish',
// 	'$18.50',
// 	'Lamb leg / Onion / Tomato',
// 	'Recommended',
// ),
// item(
// 	'kebabs',
// 	'Urfa Beef Kebab',
// 	'$15.90',
// 	'Beef / Urfa pepper / Garlic',
// 	'New',
// 	true,
// ),
// item(
// 	'kebabs',
// 	'Mixed Grill for Two',
// 	'$36.00',
// 	'Adana / Shish / Ribs / Rice',
// 	'Recommended',
// ),
// item(
// 	'mains',
// 	'Kebab Express Platter',
// 	'$21.00',
// 	'Rice / Grilled veg / Two skewers',
// 	'Recommended',
// ),
// item('mains', 'Iskender', '$17.90', 'Sliced doner / Tomato sauce / Yogurt'),
// item(
// 	'mains',
// 	'Grilled Sea Bass',
// 	'$22.00',
// 	'Sea bass / Lemon / Fennel',
// 	'New',
// ),
// item(
// 	'mains',
// 	'Stuffed Aubergine',
// 	'$15.50',
// 	'Aubergine / Peppers / Walnut',
// ),
// item(
// 	'mains',
// 	'King Prawn Skewers',
// 	'$20.50',
// 	'Prawn / Garlic / Chilli',
// 	'',
// 	true,
// ),
// item('sides', 'Saffron Rice', '$4.50', 'Rice / Saffron / Butter'),
// item('sides', 'Charcoal Vegetables', '$5.50', 'Pepper / Tomato / Onion'),
// item('sides', 'Sumac Fries', '$4.90', 'Potato / Sumac / Sea salt'),
// item('sides', 'Garlic Yogurt', '$3.00', 'Yogurt / Garlic / Dill'),
// item('sides', 'Pickled Chillies', '$2.50', 'Chilli / Vinegar', '', true),
// item(
// 	'sweets',
// 	'Baklava Trio',
// 	'$7.00',
// 	'Pistachio / Honey / Filo',
// 	'Recommended',
// ),
// item('sweets', 'Künefe', '$8.50', 'Cheese / Kadayif / Syrup', 'New'),
// item('sweets', 'Ayran', '$3.00', 'Yogurt / Salt / Mint'),
// item('sweets', 'Turkish Tea', '$2.50', 'Black tea / Sugar cube'),
// item('sweets', 'Mint Lemonade', '$4.00', 'Lemon / Mint / Ice'),
