/* Kebab Express: shared behaviour (cursor follower, header, cart storage) */
(function () {
	'use strict';

	var KE = (window.KE = window.KE || {});

	/* ---------- tiny helpers ---------- */
	KE.$ = function (sel, root) {
		return (root || document).querySelector(sel);
	};
	KE.$$ = function (sel, root) {
		return Array.prototype.slice.call((root || document).querySelectorAll(sel));
	};
	KE.money = function (n) {
		return '$' + n.toFixed(2);
	};
	KE.esc = function (s) {
		return String(s).replace(/[&<>"']/g, function (c) {
			return {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#39;',
			}[c];
		});
	};
	KE.debounce = function (fn, ms) {
		var t;
		return function () {
			var a = arguments,
				ctx = this;
			clearTimeout(t);
			t = setTimeout(function () {
				fn.apply(ctx, a);
			}, ms);
		};
	};


	/* ---------- scroll reveal: cards animate in AND out as they enter/leave the viewport,
	   sliding up when scrolling down and down when scrolling up ---------- */
	var rvObs, lastY = window.pageYOffset, dirDown = true;
	window.addEventListener(
		'scroll',
		function () {
			var y = window.pageYOffset;
			if (y !== lastY) dirDown = y > lastY;
			lastY = y;
		},
		{ passive: true },
	);
	KE.reveal = function (root, selector) {
		var els = KE.$$(selector, root);
		if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			els.forEach(function (el) { el.classList.add('sr', 'in'); });
			return;
		}
		if (!rvObs) {
			rvObs = new IntersectionObserver(
				function (entries) {
					entries.forEach(function (en) {
						var el = en.target;
						if (en.isIntersecting) {
							el.classList.add('in');
						} else {
							/* leaving: park it on the side it left from so it re-enters smoothly */
							var above = en.boundingClientRect.top < 0;
							el.style.setProperty('--rvy', (above ? -36 : 36) + 'px');
							el.style.setProperty('--d', '0ms');
							el.classList.remove('in');
						}
					});
				},
				{ threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
			);
		}
		els.forEach(function (el, i) {
			el.classList.add('sr');
			el.style.setProperty('--rvy', (dirDown ? 36 : -36) + 'px');
			el.style.setProperty('--d', (i % 4) * 70 + 'ms');
			rvObs.observe(el);
		});
	};

	/* animate every section: headings, cards, forms, footer columns */
	KE.revealSections = function () {
		KE.reveal(document, [
			'.sec-h', '.about .wrap > *', '.how-c', '.how-cta', '.loc-g > *', '.book .wrap > *',
			'.gpg-banner .wrap > *', '.gpg-count', '.gal-more', '.rv', '.ft-g > div', '.ft-b',
			'.gal .mosaic'
		].join(','));
	};
	document.addEventListener('DOMContentLoaded', KE.revealSections);

	/* ---------- header: mobile drawer ---------- */
	function initHeader() {
		var burger = KE.$('#burger');
		var drawer = KE.$('#drawer');
		if (!burger || !drawer) return;
		function setOpen(open) {
			drawer.hidden = !open;
			burger.setAttribute('aria-expanded', String(open));
			burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
		}
		burger.addEventListener('click', function () {
			setOpen(drawer.hidden);
		});
		drawer.addEventListener('click', function (e) {
			if (e.target.closest('a')) setOpen(false);
		});
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && !drawer.hidden) {
				setOpen(false);
				burger.focus();
			}
		});
		window.addEventListener(
			'resize',
			KE.debounce(function () {
				if (window.innerWidth > 1080) setOpen(false);
			}, 100),
		);
	}

	/* ---------- cursor follower (dot + lagging ring + glow) ---------- */
	function initCursor() {
		var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
		var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!fine || calm) return;
		var root = document.documentElement;
		var raf = 0,
			x = 0,
			y = 0;
		window.addEventListener(
			'mousemove',
			function (e) {
				x = e.clientX;
				y = e.clientY;
				if (!raf) {
					raf = requestAnimationFrame(function () {
						root.style.setProperty('--mx', x + 'px');
						root.style.setProperty('--my', y + 'px');
						raf = 0;
					});
				}
			},
			{ passive: true },
		);
	}

	document.addEventListener('DOMContentLoaded', function () {
		initHeader();
		initCursor();
	});
})();
