/* Kebab Express: menu data shared by the home page, the shop and the cart.
   Edit prices, descriptions and badges here. A price written as "€6.00 / €9.00 / €12.00" becomes
   three variants (size/price options) everywhere on the site. */
(function () {
	'use strict';
	var KE = (window.KE = window.KE || {});

	var CATS = [
		// { id: 'starters', title: 'Starters' },
		// { id: 'kebabs', title: 'Kebabs' },
		// { id: 'mains', title: 'Grill & Mains' },
		// { id: 'sides', title: 'Sides' },
		// { id: 'sweets', title: 'Sweets & Drinks' },
		{ id: 'offers', title: 'Offers' },
		{ id: 'pizzas', title: 'Pizzas' },
		{
			id: 'durum',
			title: 'Durum',
		},
		{ id: 'burgers', title: 'Burgers' },
		{
			id: 'plates',
			title: 'Plates',
		},
		{
			id: 'kids',
			title: 'Kids',
		},
	];

	function item(cat, name, price, desc, badge, spicy) {
		return {
			cat: cat,
			name: name,
			price: price,
			desc: desc,
			badge: badge || '',
			spicy: !!spicy,
		};
	}
	var ITEMS = [
		// Special Offers (Left Side)

		item(
			'offers',
			'2 Hamburguesas',
			'€12.00',
			'2 Patatas Fritas / 2 Bebidas',
			'13 Oferta',
		),

		item(
			'offers',

			'1 Pizza Pequeña',

			'€9.50',

			'1 Patatas Fritas / 1 Bebida',

			'14 Oferta',
		),

		item(
			'offers',

			'2 Pizzas Familiar',

			'€26.00',

			'Patatas Fritas / Cola 2L',

			'15 Oferta',
		),

		item('offers', 'Taco', '€6.00', 'Pollo / Ternera / Nuggets', '16 Oferta'),

		item(
			'offers',

			'Durum / Doner con Falafel',

			'€5.00',

			'Durum / Doner con Falafel',

			'17 Oferta',
		),

		item(
			'offers',

			'Plato Huevo Fritos 2 und',

			'€6.50',

			'Patatas Fritas / Ensalada',

			'18 Oferta',
		),

		// Special Offers (Right Side)

		item(
			'offers',

			'1 Rollo + 1 Taco + 1 Hamburguesa',

			'€22.00',

			'1 Chees Fries / Cola 2L',

			'1 Oferta',
		),

		item(
			'offers',
			'3 Tacos',
			'€22.00',
			'3 Patatas Fritas / Cola 2L',
			'2 Oferta',
		),

		item(
			'offers',
			'1 Rollo',
			'€12.50',
			'1 Chees Fries / 2 Bebidas',
			'3 Oferta',
		),

		item(
			'offers',
			'4 Tacos',
			'€30.00',
			'4 Patatas Fritas / Cola 2L',
			'4 Oferta',
		),

		item(
			'offers',

			'1 Rollo + 1 Pizza Pequeña',

			'€19.00',

			'Chees Fries / Cola 2L',

			'5 Oferta',
		),

		item(
			'offers',

			'2 Rollo + 1 Pizza Pequeña',

			'€23.50',

			'Chees Fries / Cola 2L',

			'6 Oferta',
		),

		item(
			'offers',
			'2 Tacos',
			'€15.00',
			'Patatas Fritas / 2 Bebidas',
			'7 Oferta',
		),

		item(
			'offers',

			'3 Rollo',

			'€20.00',

			'3 Patatas Fritas / 3 Bebidas',

			'8 Oferta',
		),

		item(
			'offers',

			'2 Pizza Mediana',

			'€21.00',

			'Patatas Fritas / Cola 2L',

			'9 Oferta',
		),

		item(
			'offers',

			'2 Pizza Pequeña',

			'€17.00',

			'Patatas Fritas / Cola 2L',

			'10 Oferta',
		),

		item(
			'offers',

			'4 Rollos',

			'€26.00',

			'4 Patatas Fritas / Cola 2L',

			'11 Oferta',
		),

		item(
			'offers',

			'2 Pitas',

			'€12.00',

			'2 Patatas Fritas / 2 Bebidas',

			'12 Oferta',
		),

		// Pizzas

		item(
			'pizzas',

			'Margarita',

			'€6.00 / €9.00 / €12.00',

			'Salsa Tomate / Queso / Orégano',

			'',
		),

		item(
			'pizzas',

			'Salami',

			'€6.00 / €9.00 / €12.00',

			'Salsa Tomate / Queso / Salami / Orégano',

			'',
		),

		item(
			'pizzas',

			'Doner',

			'€6.00 / €9.00 / €12.00',

			'Salsa Tomate / Queso / Carne de Pollo y Ternera / Cebolla / Pimiento / Orégano',

			'',
		),

		item(
			'pizzas',

			'4 Quesos',

			'€6.00 / €9.00 / €12.00',

			'Salsa Tomate / Especial 4 Quesos / Orégano',

			'',
		),

		item(
			'pizzas',

			'Hawai',

			'€6.00 / €9.00 / €12.00',

			'Salsa Tomate / Queso / Salami / Piña / Orégano',

			'',
		),

		item(
			'pizzas',

			'Vegetal',

			'€6.00 / €9.00 / €12.00',

			'Salsa Tomate / Queso / Champiñones / Pimiento / Aceitunas / Maíz / Cebolla / Espinacas / Orégano',

			'',
		),

		item(
			'pizzas',

			'Atún',

			'€6.00 / €9.00 / €12.00',

			'Salsa Tomate / Queso / Atún / Cebolla / Orégano',

			'',
		),

		item(
			'pizzas',

			'4 Porciones',

			'€6.00 / €9.00 / €12.00',

			'Queso / 1⁄4 Salami / 1⁄4 Doner de Pollo / 1⁄4 Champiñones / 1⁄4 Pimiento',

			'',
		),

		item(
			'pizzas',

			'Gambas',

			'€6.00 / €9.00 / €12.00',

			'Salsa Tomate / Queso / Gambas / Orégano',

			'',
		),

		item(
			'pizzas',

			'Barbacoa',

			'€6.00 / €9.00 / €12.00',

			'Salsa Barbacoa / Queso / Doner de Pollo / Champiñones / Orégano',

			'',
		),

		item(
			'pizzas',

			'Atún Gamba',

			'€6.00 / €9.00 / €12.00',

			'Salsa Tomate / Queso / Atún / Gamba / Cebolla / Orégano',

			'',
		),

		item(
			'pizzas',

			'Pavo',

			'€6.00 / €9.00 / €12.00',

			'Salsa Tomate / Queso / Cebolla / Pavo / Queso / Orégano',

			'',
		),

		item(
			'pizzas',

			'Carbonara',

			'€6.00 / €9.00 / €12.00',

			'Queso / Nata / Pollo / Cebolla / Champiñones',

			'',
		),

		item('pizzas', 'Cheese Fries', '€6.00 / €9.00 / €12.00', '', ''),

		item('pizzas', 'Calzone', '€6.00 / €9.00 / €12.00', '', ''),

		// Special Offers

		item(
			'offers',

			'4 Rollos',

			'€26.00',

			'4 Patatas Fritas / Cola 2L',

			'11 Oferta',
		),

		item(
			'offers',

			'2 Pitas',

			'€12.00',

			'2 Patatas Fritas / 2 Bebidas',

			'12 Oferta',
		),

		item(
			'offers',

			'2 Hamburguesas',

			'€12.00',

			'2 Patatas Fritas / 2 Bebidas',

			'13 Oferta',
		),

		item(
			'offers',

			'1 Pizza (30cm)',

			'€9.50',

			'1 Patatas Fritas / 1 Bebida',

			'14 Oferta',
		),

		item(
			'offers',

			'2 Pizzas Familiar',

			'€29.00',

			'Cheese Fries / Cola 2L',

			'15 Oferta',
		),

		item(
			'offers',

			'3 Pizzas Mediana',

			'€28.50',

			'Patatas Fritas / Cola 2L',

			'16 Oferta',
		),

		item(
			'offers',

			'2 Pizzas Mediana',

			'€20.00',

			'Patatas Fritas / Cola 2L',

			'17 Oferta',
		),

		item(
			'offers',

			'2 Pizzas Pequeña',

			'€17.00',

			'Patatas Fritas / Cola 2L',

			'18 Oferta',
		),

		// Pizzas

		item(
			'pizzas',

			'Margarita',

			'€7.00 / €9.00 / €14.00',

			'Salsa Tomate / Queso / Orégano',

			'',
		),

		item(
			'pizzas',

			'Salami',

			'€7.00 / €9.00 / €14.00',

			'Salsa Tomate / Queso / Salami / Orégano',

			'',
		),

		item(
			'pizzas',

			'Doner',

			'€7.00 / €9.00 / €14.00',

			'Salsa Tomate / Queso / Carne de Pollo y Ternera / Cebolla / Pimiento / Orégano',

			'',
		),

		item(
			'pizzas',

			'4 Quesos',

			'€7.00 / €9.50 / €15.00',

			'Salsa Tomate / Especial 4 Quesos / Orégano',

			'',
		),

		item(
			'pizzas',

			'Hawai',

			'€7.00 / €9.00 / €14.00',

			'Salsa Tomate / Queso / Salami / Piña / Orégano',

			'',
		),

		item(
			'pizzas',

			'Vegetal',

			'€7.00 / €9.00 / €14.00',

			'Salsa Tomate / Queso / Champiñones / Pimiento / Aceitunas / Maíz / Cebolla / Espinacas / Orégano',

			'',
		),

		item(
			'pizzas',

			'Atún',

			'€7.00 / €9.00 / €14.00',

			'Salsa Tomate / Queso / Atún / Cebolla / Orégano',

			'',
		),

		item(
			'pizzas',

			'4 Porciones',

			'€7.00 / €9.00 / €14.00',

			'Queso / ¼ Salami / ¼ Doner de Pollo / ¼ Champiñones / ¼ Pimiento',

			'',
		),

		item(
			'pizzas',

			'Gambas',

			'€7.00 / €9.00 / €14.00',

			'Salsa Tomate / Queso / Gambas / Orégano',

			'',
		),

		item(
			'pizzas',

			'Barbacoa',

			'€7.00 / €9.00 / €14.00',

			'Salsa Barbacoa / Queso / Doner de Pollo / Champiñones / Orégano',

			'',
		),

		item(
			'pizzas',

			'Atún Gamba',

			'€7.00 / €9.50 / €15.00',

			'Salsa Tomate / Queso / Atún / Gamba / Cebolla / Orégano',

			'',
		),

		item(
			'pizzas',

			'Pavo',

			'€7.00 / €9.00 / €14.00',

			'Salsa Tomate / Queso / Cebolla / Pavo / Queso / Orégano',

			'',
		),

		item(
			'pizzas',

			'Carbonara',

			'€7.00 / €9.00 / €14.00',

			'Queso / Nata / Pollo / Cebolla / Champiñones',

			'',
		),

		item(
			'pizzas',

			'Cheese Fries',

			'€7.00 / €9.00 / €14.00',

			'Queso / Salsa Blanca / Pollo / Mozzarella / Patatas / Cheddar / Orégano',

			'',
		),

		// Durum & Kebabs

		item('durum', 'Durum', '€5.00 / €7.00', 'Pollo / Ternera / Mixto', ''),

		item(
			'durum',
			'Doner / Pita',
			'€4.50 / €6.50',
			'Pollo / Ternera / Mixto',
			'',
		),

		item('durum', 'Durum XXL', '€8.00 / €9.50', 'Pollo / Ternera / Mixto', ''),

		item(
			'durum',

			'Durum al Horno',

			'€7.00 / €9.00',

			'Pollo / Ternera / Mixto',

			'',
		),

		item('durum', 'Taco', '€6.00 / €8.00', 'Pollo / Ternera / Mixto', ''),

		item('durum', 'Doner Box', '€5.00 / €7.00', 'Pollo / Ternera / Mixto', ''),

		// Burgers

		item('burgers', 'Hamburguesa', '€5.00 / €7.00', 'Pollo / Ternera', ''),

		item('burgers', 'Plato Hamburguesa', '€8.00', 'Hamburguesa / Bebida', ''),

		// Main Dishes

		item(
			'plates',

			'Plato Kebab',

			'€9.00',

			'Pollo / Ternera / Mixto / Patatas Fritas / Ensalada / Pan / Bebida',

			'',
		),

		item('plates', 'Plato Frankfurt', '€7.00', 'Frankfurt / Bebida', ''),

		item(
			'plates',

			'Plato Alitas de Pollo',

			'€7.00',

			'Alitas de Pollo / Bebida',

			'',
		),

		item('plates', 'Plato Falafel', '€7.00', 'Falafel / Bebida', ''),

		item('plates', 'Plato Cheese Fries', '€7.00', 'Cheese Fries / Bebida', ''),

		item(
			'plates',

			'Plato Nuggets de Pollo',

			'€7.00',

			'Nuggets de Pollo / Bebida',

			'',
		),

		item(
			'plates',

			'Plato Muslo de Pollo',

			'€7.00',

			'Muslo de Pollo / Bebida',

			'',
		),

		item(
			'plates',

			'Plato Pincho de Pollo',

			'€10.00',

			'Cebolla / Pimiento / Champiñones / Patatas Fritas o Arroz / Ensalada o Bebida',

			'',
		),

		item(
			'plates',

			'Plato Shish Kebab',

			'€8.00',

			'2 Kebabs / Arroz / Ensalada / Bebida',

			'',
		),

		item(
			'plates',

			'Plato Aros de Cebolla',

			'€6.50',

			'Aros de Cebolla / Bebida',

			'',
		),

		// Kids Menu

		item(
			'kids',

			'Menú Star Kids',

			'€6.99',

			'Finger de Pollo / Pizza 25cm / Hamburguesa sin o con queso / Hot Dog / Patatas Fritas / Bebida',

			'Kids Menu',
		),

		item(
			'offers',
			'1 Rollo',
			'€12.50',
			'1 Cheese Fries / 2 Bebidas',
			'1 Oferta',
		),

		item(
			'offers',
			'2 Rollo',
			'€17.50',
			'1 Cheese Fries / 2 Bebidas',
			'2 Oferta',
		),

		item(
			'offers',
			'3 Rollo',
			'€22.50',
			'1 Cheese Fries / 3 Bebidas',
			'3 Oferta',
		),

		item(
			'offers',
			'4 Rollos',
			'€30.00',
			'2 Cheese Fries / Cola 2L',
			'4 Oferta',
		),

		item(
			'offers',

			'1 Rollo + 1 Pizza (30cm)',

			'€19.00',

			'Cheese Fries / Cola 2L',

			'5 Oferta',
		),

		item(
			'offers',

			'2 Rollo + 1 Pizza (30cm)',

			'€23.50',

			'Cheese Fries / Cola 2L',

			'6 Oferta',
		),

		item('offers', '2 Tacos', '€18.50', 'Cheese Fries / 2 Bebidas', '7 Oferta'),

		item(
			'offers',

			'3 Rollo',

			'€20.00',

			'3 Patatas Fritas / 3 Bebidas',

			'8 Oferta',
		),

		item(
			'offers',

			'2 Pizza (33cm)',

			'€23.00',

			'Cheese Fries / Cola 2L',

			'9 Oferta',
		),

		item(
			'offers',

			'2 Pizza (30cm)',

			'€19.00',

			'Cheese Fries / Cola 2L',

			'10 Oferta',
		),
	];

	var PIZZA_SIZES = ['Pequeña', 'Mediana', 'Familiar'];
	var byKey = {};
	ITEMS.forEach(function (it, i) {
		it.id = i;
		it.variants = it.price.split('/').map(function (t, k, all) {
			t = t.trim();
			return {
				i: k,
				text: t,
				value: parseFloat(t.replace(/[^0-9.]/g, '')) || 0,
				label: it.cat === 'pizzas' && all.length === 3 ? PIZZA_SIZES[k] : '',
				key: it.cat + '|' + it.name + '|' + t,
			};
		});
		it.min = Math.min.apply(
			null,
			it.variants.map(function (v) {
				return v.value;
			}),
		);
		it.img = KE.dishImage(it);
		it.variants.forEach(function (v) {
			if (!byKey[v.key]) byKey[v.key] = it;
		});
	});

	KE.MENU = {
		cats: CATS,
		items: ITEMS,
		byKey: byKey,
		catTitle: function (id) {
			var c = CATS.filter(function (x) {
				return x.id === id;
			})[0];
			return c ? c.title : '';
		},
	};
})();
