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
