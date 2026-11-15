# Kebab Express (HTML, CSS, JavaScript)

A static, front-end-only website built from the approved UI/UX design. No frameworks and no build step.

## Run it
Open `index.html` in a browser, or serve the folder (recommended, so video and fonts load like production):

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Structure
```
index.html        Home: hero video, menu, how it works, gallery, locations map, table booking, footer
gallery.html      Gallery page (photo grid, Show more, lightbox)
shop.html         Shop: product cards with size chips, details popup
css/home.css      Home styles
css/shop.css      Shop styles
js/menu-data.js   Shared menu data (home menu, shop and cart all read it)
js/dish-art.js    Photos / drawn illustrations for every dish
js/cart.js        Shared cart: storage, navbar total, View cart bar, drawer
js/common.js      Shared: cursor follower, mobile menu
js/cart.js        Cart drawer and its checkout form (name, phone, email, address, post code)
js/gallery.js     Gallery page
js/home.js        Home: menu filters, lightbox, map pins, booking form
js/shop.js        Shop: catalogue and product popup
assets/img        Dish photos and the London map
assets/video      Hero video (slow-motion grill, played at 0.5x)
```

## What works
- Header on both pages, active link highlighting, mobile menu, basket icon with item count
- Menu tabs, search, New/Recommended/Spicy filters, loading and empty states
- Gallery with lightbox (arrow keys and Escape)
- Locations: branch cards and map pins stay in sync, "Get directions" opens OpenStreetMap
- Table booking: date, time, guests, location, validation, confirmation ticket
- Shop: search, sort, category tabs, product modal, basket (saved in the browser), checkout page (details, payment, review, confirmation tracker)
- Responsive layouts (desktop, tablet, mobile), keyboard focus styles, reduced-motion support

## What is simulated
There is no backend. Booking and checkout only show a confirmation screen; nothing is sent, stored on a server or charged. The basket is kept in `localStorage`. To go live, connect the submit handlers in `js/home.js` (`#bookSubmit`) and `js/cart.js` (`placeOrder()`) to your API. Orders are cash on delivery; there is no card payment.

## Sample content to replace
Menu items, prices ($), branch names, addresses, phone numbers, opening hours, the map location and the hero video are placeholders. Menu data (used by home, shop and cart) lives in `js/menu-data.js`; gallery photos in `js/gallery.js`. Dish pictures: add a photo to `assets/img` and map it in `PHOTO_BY_NAME` in `js/dish-art.js`.

## Credits
- Dish photos: Wikimedia Commons (CC0 or public domain; Iskender by Benreis, CC BY 3.0)
- Map: © OpenStreetMap contributors
- Hero video: Mixkit free stock video
# kebab-express
