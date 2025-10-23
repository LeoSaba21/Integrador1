(function (){
  'use strict';

  // new cart stores items as array of {id,name,price,qty}
  const STORAGE_KEY = 'green-go-cart';
  const BADGE_SELECTOR = '.cart-badge';
  const ADD_BTN_SELECTOR = '.btn-add';

  function readCart(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    }catch(e){ return []; }
  }

  function writeCart(cart){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      updateBadgeFromCart(cart);
    }catch(e){ console.error('writeCart', e); }
  }

  function getTotalCount(cart){
    cart = cart || readCart();
    return cart.reduce((s,i)=> s + (i.qty||0), 0);
  }

  function updateBadgeFromCart(cart){
    const el = document.querySelector(BADGE_SELECTOR);
    if(!el) return;
    const n = getTotalCount(cart);
    if(n > 0){
      el.textContent = n;
      el.style.display = 'inline-block';
      el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
    } else {
      el.style.display = 'none';
      el.textContent = '0';
    }
  }

  function slugify(text){
    return String(text).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  }

  function parsePrice(priceText){
    if(!priceText) return 0;
    // remove currency symbols and commas, accept dot as decimal
    const cleaned = priceText.replace(/[€$S\.\s,]/g, m => (m === '.' ? '.' : '')).replace(/[^0-9.\-]/g,'');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  function addProductFromButton(btn){
    const card = btn.closest('.product-card');
    if(!card) return;
    const nameEl = card.querySelector('.product-info h4') || card.querySelector('h3') || card.querySelector('h4');
    const priceEl = card.querySelector('.price');
    const name = nameEl ? nameEl.textContent.trim() : 'Producto';
    const price = priceEl ? parsePrice(priceEl.textContent) : 0;
    const id = slugify(name);

    const cart = readCart();
    const existing = cart.find(i => i.id === id);
    if(existing){ existing.qty = (existing.qty || 0) + 1; }
    else { cart.push({ id, name, price, qty: 1 }); }
    writeCart(cart);
  }

  function initAddButtons(){
    const buttons = Array.from(document.querySelectorAll(ADD_BTN_SELECTOR));
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        addProductFromButton(btn);
        // small visual feedback
        btn.classList.add('added');
        setTimeout(()=> btn.classList.remove('added'), 220);
      });
    });
  }

  function initCartButton(){
    const cartBtn = document.querySelector('.cart-btn');
    if(!cartBtn) return;
    cartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // go to cart page
      window.location.href = 'cart.html';
    });
  }

  /* Cart page render & interactions */
  function renderCartPage(){
    if(!document.querySelector('.cart-page')) return;
    const cart = readCart();
    const listEl = document.querySelector('.cart-list');
    const totalEl = document.querySelector('.cart-total');
    const emptyEl = document.querySelector('.cart-empty');
    if(!listEl || !totalEl) return;
    listEl.innerHTML = '';
    if(cart.length === 0){
      emptyEl.style.display = 'block';
      totalEl.textContent = '0.00';
      updateBadgeFromCart(cart);
      return;
    }
    emptyEl.style.display = 'none';
    let total = 0;
    cart.forEach(item => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.dataset.id = item.id;
      row.innerHTML = `
        <div class="ci-name">${item.name}</div>
        <div class="ci-qty">
          <button class="ci-dec" aria-label="Disminuir">−</button>
          <span class="ci-count">${item.qty}</span>
          <button class="ci-inc" aria-label="Aumentar">+</button>
        </div>
        <div class="ci-price">${item.price.toFixed(2)}</div>
        <button class="ci-remove" aria-label="Eliminar">✕</button>
      `;
      listEl.appendChild(row);
      total += item.price * item.qty;
    });
    totalEl.textContent = total.toFixed(2);
    updateBadgeFromCart(cart);

    // wire up controls
    listEl.querySelectorAll('.ci-inc').forEach(btn => btn.addEventListener('click', (e)=>{
      const row = btn.closest('.cart-item');
      const id = row.dataset.id; const cart = readCart();
      const it = cart.find(i=>i.id===id); if(it){ it.qty++; writeCart(cart); renderCartPage(); }
    }));
    listEl.querySelectorAll('.ci-dec').forEach(btn => btn.addEventListener('click', (e)=>{
      const row = btn.closest('.cart-item');
      const id = row.dataset.id; const cart = readCart();
      const it = cart.find(i=>i.id===id); if(it){ it.qty = Math.max(0, (it.qty||1)-1); if(it.qty===0){ const idx = cart.indexOf(it); cart.splice(idx,1);} writeCart(cart); renderCartPage(); }
    }));
    listEl.querySelectorAll('.ci-remove').forEach(btn => btn.addEventListener('click', (e)=>{
      const row = btn.closest('.cart-item');
      const id = row.dataset.id; let cart = readCart(); cart = cart.filter(i=>i.id!==id); writeCart(cart); renderCartPage();
    }));
  }

  document.addEventListener('DOMContentLoaded', () => {
    try{
      const initialCart = readCart();
      updateBadgeFromCart(initialCart);
      initAddButtons();
      initCartButton();
      renderCartPage();
    }catch(err){
      console.error('Cart init error', err);
    }
  });
})();

