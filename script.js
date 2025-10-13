(function () {
  'use strict';

  // Demo data by branch
  const BOOKS = {
    CSE: [
      { id: 'ai', title: 'AI', author: 'S. Russel', publisher: 'Prentice Hall', price: 63.0, img: 'https://picsum.photos/seed/ai/80/100' },
      { id: 'java-2', title: 'Java 2', author: 'Watson', publisher: 'BPB Publications', price: 35.5, img: 'https://picsum.photos/seed/java/80/100' },
      { id: 'html-24', title: 'HTML in 24 Hours', author: 'Sam Peter', publisher: 'Sam Publication', price: 50.0, img: 'https://picsum.photos/seed/html/80/100' },
      { id: 'xml-bible', title: 'XML Bible', author: 'Winston', publisher: 'Wiley', price: 40.5, img: 'https://picsum.photos/seed/xml/80/100' }
    ],
    ECE: [
      { id: 'dsp', title: 'Digital Signal Processing', author: 'Proakis', publisher: 'McGraw-Hill', price: 48.0, img: 'https://picsum.photos/seed/dsp/80/100' },
      { id: 'vlsi', title: 'VLSI Design', author: 'S. Kang', publisher: 'Tata McGraw-Hill', price: 45.0, img: 'https://picsum.photos/seed/vlsi/80/100' }
    ],
    EEE: [
      { id: 'machines', title: 'Electrical Machines', author: 'P. S. Bimbhra', publisher: 'Khanna', price: 50.0, img: 'https://picsum.photos/seed/machines/80/100' },
      { id: 'power', title: 'Power Systems', author: 'C. L. Wadhwa', publisher: 'New Age', price: 55.0, img: 'https://picsum.photos/seed/power/80/100' }
    ],
    CIVIL: [
      { id: 'struct', title: 'Structural Analysis', author: 'R. C. Hibbeler', publisher: 'Pearson', price: 60.0, img: 'https://picsum.photos/seed/struct/80/100' },
      { id: 'concrete', title: 'Concrete Technology', author: 'M. S. Shetty', publisher: 'S. Chand', price: 40.0, img: 'https://picsum.photos/seed/concrete/80/100' }
    ]
  };

  const TAX_RATE = 0.05;

  // State (persisting only the cart)
  function getCart() {
    try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; }
  }
  function setCart(cart) { localStorage.setItem('cart', JSON.stringify(cart)); }

  // Helpers
  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return Array.from(document.querySelectorAll(sel)); }
  function money(n) { return '$' + (Number(n) || 0).toFixed(2); }
  function show(el) { el.classList.remove('hidden'); }
  function hide(el) { el.classList.add('hidden'); }

  // Login flow
  function handleLoginSubmit(e) {
    e.preventDefault();
    clearLoginErrors();

    const username = $('#username').value.trim();
    const password = $('#password').value;
    const branch = $('#branch').value;

    let ok = true;
    if (username.length < 3) { $('#username-error').textContent = 'Username must be at least 3 characters.'; ok = false; }
    if (password.length < 3) { $('#password-error').textContent = 'Password must be at least 3 characters.'; ok = false; }
    if (!branch) { $('#branch-error').textContent = 'Please select your branch.'; ok = false; }
    if (!ok) return;

    // Simulate successful login
    $('#greeting-username').textContent = username;
    $('#current-branch').textContent = branch;
    $('#branch-select').value = branch;

    hide($('#login-section'));
    show($('#catalogue-section'));
    show($('#cart-section'));

    // Enable nav
    enableNavLinks();

    renderCatalogue(branch);
    renderCart();
  }

  function enableNavLinks() {
    ['#nav-catalogue', '#nav-cart'].forEach(sel => {
      const link = $(sel);
      link.classList.remove('disabled');
      link.removeAttribute('aria-disabled');
    });
  }

  function clearLoginErrors() {
    ['#username-error', '#password-error', '#branch-error'].forEach(sel => { $(sel).textContent = ''; });
  }

  // Catalogue rendering
  function renderCatalogue(branch) {
    const tbody = $('#catalogue-body');
    const data = BOOKS[branch] || [];
    tbody.innerHTML = '';
    data.forEach(book => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><img src="${book.img}" alt="${book.title}" width="48" height="64"></td>
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.publisher}</td>
        <td class="price">${money(book.price)}</td>
        <td><button class="btn btn-primary add-btn" data-id="${book.id}" data-branch="${branch}">Add to cart</button></td>
      `;
      tbody.appendChild(tr);
    });

    // Attach add-to-cart handlers
    $all('.add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const br = btn.getAttribute('data-branch');
        const book = (BOOKS[br] || []).find(b => b.id === id);
        if (book) {
          addToCart({ ...book, branch: br });
        }
      });
    });

    $('#current-branch').textContent = branch;
  }

  // Cart operations
  function addToCart(item) {
    const cart = getCart();
    const idx = cart.findIndex(x => x.id === item.id && x.branch === item.branch);
    if (idx >= 0) {
      cart[idx].qty = (cart[idx].qty || 1) + 1;
    } else {
      cart.push({ id: item.id, title: item.title, price: item.price, qty: 1, author: item.author, publisher: item.publisher, img: item.img, branch: item.branch });
    }
    setCart(cart);
    renderCart();
  }

  function changeQty(id, branch, delta) {
    const cart = getCart();
    const idx = cart.findIndex(x => x.id === id && x.branch === branch);
    if (idx >= 0) {
      cart[idx].qty = Math.max(1, (cart[idx].qty || 1) + delta);
      setCart(cart);
      renderCart();
    }
  }

  function removeItem(id, branch) {
    const cart = getCart().filter(x => !(x.id === id && x.branch === branch));
    setCart(cart);
    renderCart();
  }

  function clearCart() {
    setCart([]);
    renderCart();
  }

  function renderCart() {
    const cart = getCart();
    const tbody = $('#cart-items');
    const empty = $('#cart-empty');
    tbody.innerHTML = '';

    if (cart.length === 0) {
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
    }

    let subtotal = 0;
    cart.forEach(item => {
      const line = (item.qty || 1) * (Number(item.price) || 0);
      subtotal += line;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="cart-item">
            <img src="${item.img}" alt="${item.title}" width="40" height="54">
            <div>
              <div class="cart-title">${item.title}</div>
              <div class="muted small">${item.author} — ${item.publisher}</div>
            </div>
          </div>
        </td>
        <td>${item.branch}</td>
        <td class="qty-cell">
          <button class="btn btn-compact" data-action="dec" data-id="${item.id}" data-branch="${item.branch}">−</button>
          <span class="qty">${item.qty || 1}</span>
          <button class="btn btn-compact" data-action="inc" data-id="${item.id}" data-branch="${item.branch}">+</button>
        </td>
        <td class="price">${money(item.price)}</td>
        <td class="price">${money(line)}</td>
        <td><button class="btn btn-danger btn-compact" data-action="remove" data-id="${item.id}" data-branch="${item.branch}">Remove</button></td>
      `;
      tbody.appendChild(tr);
    });

    // Totals
    const tax = subtotal * TAX_RATE;
    const grand = subtotal + tax;
    $('#subtotal').textContent = money(subtotal);
    $('#tax').textContent = money(tax);
    $('#grand-total').textContent = money(grand);

    // Delegated handlers for qty/change/remove
    tbody.querySelectorAll('button[data-action]').forEach(btn => {
      const id = btn.getAttribute('data-id');
      const branch = btn.getAttribute('data-branch');
      const action = btn.getAttribute('data-action');

      if (action === 'inc') btn.addEventListener('click', () => changeQty(id, branch, +1));
      if (action === 'dec') btn.addEventListener('click', () => changeQty(id, branch, -1));
      if (action === 'remove') btn.addEventListener('click', () => removeItem(id, branch));
    });
  }

  // Forgot password modal
  function openForgot() {
    $('#forgot-identifier').value = '';
    $('#forgot-error').textContent = '';
    show($('#forgot-modal'));
  }
  function closeForgot() {
    hide($('#forgot-modal'));
  }
  function handleForgotSubmit(e) {
    e.preventDefault();
    const value = $('#forgot-identifier').value.trim();
    if (!value) {
      $('#forgot-error').textContent = 'Please enter your email or username.';
      return;
    }
    closeForgot();
    alert('If this were connected to a server, a reset link would be sent to: ' + value);
  }

  // Events
  function wireEvents() {
    $('#login-form').addEventListener('submit', handleLoginSubmit);
    $('#branch-select').addEventListener('change', e => renderCatalogue(e.target.value));
    $('#clear-cart').addEventListener('click', clearCart);
    $('#checkout').addEventListener('click', () => {
      const total = $('#grand-total').textContent;
      alert('Checkout successful.\nTotal billed: ' + total + '\n\n(This is a demo; no payment is processed.)');
      clearCart();
    });

    // Forgot modal open/close
    $('#forgot-link').addEventListener('click', openForgot);
    $('#forgot-form').addEventListener('submit', handleForgotSubmit);
    // Backdrop and cancel buttons
    document.addEventListener('click', (e) => {
      const tgt = e.target;
      if (tgt && (tgt.getAttribute('data-close') === 'true')) {
        closeForgot();
      }
    });

    // Footer year
    const y = new Date().getFullYear();
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = y;
  }

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    wireEvents();
    // Not logged in initially; catalogue/cart hidden. Nothing else to do here.
  });
})();