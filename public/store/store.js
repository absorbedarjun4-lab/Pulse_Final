/* ═══════════════════════════════════════════════════
   Rewards Store — Logic (3D Zigzag + INR pricing)
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    /* ─── INR conversion helper ────────────────────── */
    // 1 USD ≈ 83 INR (approximate)
    const USD_TO_INR = 83;

    function toINR(usd) {
        return Math.round(usd * USD_TO_INR);
    }

    function formatINR(amount) {
        return '₹' + amount.toLocaleString('en-IN');
    }

    /* ─── Product Data ─────────────────────────────── */
    const PRODUCTS = [
        {
            id: 1, name: 'Wireless Headphones', category: 'Audio',
            price: 129, credits: 320, discount: 45,
            image: 'headphones.png',
            gradient: 'linear-gradient(135deg,#1a1a2e,#0f3460)',
        },
        {
            id: 2, name: 'Smart Watch', category: 'Tech',
            price: 249, credits: 580, discount: 40,
            image: 'watch.jpg',
            gradient: 'linear-gradient(135deg,#0d1b2a,#2a3f54)',
        },
        {
            id: 3, name: 'Premium Hoodie', category: 'Apparel',
            price: 89, credits: 180, discount: 50,
            image: 'hoodie.png',
            gradient: 'linear-gradient(135deg,#1a1423,#1e1233)',
        },
        {
            id: 4, name: 'Running Sneakers', category: 'Apparel',
            price: 159, credits: 390, discount: 35,
            image: 'sneakers.png',
            gradient: 'linear-gradient(135deg,#0c1821,#1b3a4b)',
        },
        {
            id: 5, name: 'Portable Speaker', category: 'Audio',
            price: 79, credits: 150, discount: 55,
            image: 'speaker.png',
            gradient: 'linear-gradient(135deg,#141e30,#243b55)',
        },
        {
            id: 6, name: 'Ceramic Coffee Mug', category: 'Lifestyle',
            price: 35, credits: 60, discount: 60,
            image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800',
            gradient: 'linear-gradient(135deg,#1a1a1a,#3d2c1e)',
        },
        {
            id: 7, name: 'Travel Backpack', category: 'Lifestyle',
            price: 119, credits: 270, discount: 42,
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
            gradient: 'linear-gradient(135deg,#0b1a2a,#1f344a)',
        },
        {
            id: 8, name: 'Gift Card Bundle', category: 'Lifestyle',
            price: 100, credits: 200, discount: 50,
            image: 'giftcard.png',
            gradient: 'linear-gradient(135deg,#1c1024,#381e40)',
        },
        {
            id: 9, name: 'Wireless Earbuds', category: 'Audio',
            price: 69, credits: 140, discount: 48,
            image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800',
            gradient: 'linear-gradient(135deg,#111827,#263545)',
        },
        {
            id: 10, name: 'LED Desk Lamp', category: 'Tech',
            price: 55, credits: 110, discount: 52,
            image: 'lamp.jpg',
            gradient: 'linear-gradient(135deg,#0f172a,#253040)',
        },
    ];

    /* ─── Helpers ──────────────────────────────────── */
    function discountedPrice(product) {
        return Math.round(toINR(product.price) * (1 - product.discount / 100));
    }

    function originalPrice(product) {
        return toINR(product.price);
    }

    function savingsAmount(product) {
        return originalPrice(product) - discountedPrice(product);
    }

    /* ─── State ────────────────────────────────────── */
    let cart = [];
    let credits = 2450;
    let activeFilter = 'all';

    /* ─── DOM Refs ─────────────────────────────────── */
    const grid = document.getElementById('product-grid');
    const cartBadge = document.getElementById('cart-badge');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartBack = document.getElementById('cart-backdrop');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartToggle = document.getElementById('cart-toggle');
    const cartClose = document.getElementById('cart-close');
    const creditsEl = document.getElementById('credits-value');
    const heroCredits = document.getElementById('hero-credits');
    const checkoutBtn = document.getElementById('btn-checkout');
    const filterBtns = document.querySelectorAll('.filter-pill');

    /* ─── Render Products (Zigzag) ─────────────────── */
    function renderProducts() {
        const filtered = activeFilter === 'all'
            ? PRODUCTS
            : PRODUCTS.filter(p => p.category === activeFilter);

        grid.innerHTML = filtered.map((p, idx) => `
      <article class="product-card" data-id="${p.id}">

        <!-- IMAGE SIDE -->
        <div class="product-card__image-wrap">
          <span class="product-card__badge">-${p.discount}%</span>
          <span class="product-card__category-chip">${p.category}</span>
          <div class="product-card__image"
               style="${p.image
                ? `background-image:url('${p.image}');background-size:cover;background-position:center;`
                : `background:${p.gradient};`
            }">
          </div>
        </div>

        <!-- BODY SIDE -->
        <div class="product-card__body">
          <span class="product-card__number">/ ${String(idx + 1).padStart(2, '0')}</span>
          <h3 class="product-card__name">${p.name}</h3>

          <div class="product-card__pricing">
            <span class="product-card__original">${formatINR(originalPrice(p))}</span>
            <span class="product-card__credits">⬡ ${p.credits} cr</span>
          </div>

          <div class="product-card__final-row">
            <span class="product-card__pay-label">You pay</span>
            <span class="product-card__pay-price">
              <span class="currency">₹</span>${discountedPrice(p).toLocaleString('en-IN')}
            </span>
            <span class="product-card__savings">Save ${formatINR(savingsAmount(p))}</span>
          </div>

          <div class="product-card__actions" data-id="${p.id}">
            <button class="product-card__btn product-card__btn--add" data-id="${p.id}" type="button">
              Apply Credits &amp; Redeem →
            </button>
            <div class="product-card__stepper" style="display:none;">
              <button class="stepper__btn stepper__btn--minus" data-id="${p.id}" type="button">−</button>
              <span class="stepper__qty" data-id="${p.id}">0</span>
              <button class="stepper__btn stepper__btn--plus" data-id="${p.id}" type="button">+</button>
            </div>
          </div>
        </div>
      </article>
    `).join('');

        // Append "Coming Soon" card
        if (activeFilter === 'all' || (filtered && filtered.length > 0)) {
            const comingSoonHTML = `
      <article class="product-card product-card--coming-soon">
        <div class="product-card__image-wrap">
          <div class="product-card__image" style="background: linear-gradient(135deg, #0f172a, #1e293b); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.1); font-size: 5rem;">
            ?
          </div>
        </div>
        <div class="product-card__body">
          <span class="product-card__number">/ ++</span>
          <h3 class="product-card__name">Next Drop <em>Incoming...</em></h3>
          <p style="color: rgba(255,255,255,0.5); font-size: 0.9rem; margin: 1rem 0; line-height: 1.5;">
            We're curating more elite gear. Your rescues make them possible. Keep earning credits to unlock the next level.
          </p>
          <div class="product-card__actions">
            <button class="product-card__btn" type="button" style="width: 100%;">Stay Alert →</button>
          </div>
        </div>
      </article>
    `;
            grid.insertAdjacentHTML('beforeend', comingSoonHTML);
        }

        /* ── Event listeners ── */
        grid.querySelectorAll('.product-card__btn--add').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const id = Number(btn.dataset.id);
                const product = PRODUCTS.find(p => p.id === id);
                if (product.credits > credits) {
                    btn.textContent = '✕ Not enough credits';
                    btn.style.opacity = '.6';
                    setTimeout(() => {
                        btn.textContent = 'Apply Credits & Redeem →';
                        btn.style.opacity = '';
                    }, 1500);
                    return;
                }
                addToCart(id);
            });
        });

        grid.querySelectorAll('.stepper__btn--minus').forEach(btn => {
            btn.addEventListener('click', e => { e.stopPropagation(); decrementCart(Number(btn.dataset.id)); });
        });

        grid.querySelectorAll('.stepper__btn--plus').forEach(btn => {
            btn.addEventListener('click', e => { e.stopPropagation(); addToCart(Number(btn.dataset.id)); });
        });

        /* 3D tilt effect */
        grid.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = (e.clientX - cx) / (rect.width / 2);
                const dy = (e.clientY - cy) / (rect.height / 2);
                const rotY = dx * 6;
                const rotX = -dy * 4;
                card.style.transform =
                    `translateY(-10px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.01)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.transition = 'transform .6s cubic-bezier(0.16,1,0.3,1)';
            });
        });

        syncButtonStates();
    }

    /* ─── Filter ───────────────────────────────────── */
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.filter;
            renderProducts();
        });
    });

    /* ─── Cart Logic ───────────────────────────────── */
    function addToCart(productId) {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return;
        const existing = cart.find(i => i.id === productId);
        if (existing) existing.qty += 1;
        else cart.push({ ...product, qty: 1 });
        updateCartUI();
    }

    function removeFromCart(productId) {
        cart = cart.filter(i => i.id !== productId);
        updateCartUI();
    }

    function decrementCart(productId) {
        const existing = cart.find(i => i.id === productId);
        if (!existing) return;
        existing.qty -= 1;
        if (existing.qty <= 0) cart = cart.filter(i => i.id !== productId);
        updateCartUI();
    }

    function getCartCount() { return cart.reduce((s, i) => s + i.qty, 0); }
    function getCartCreditsTotal() { return cart.reduce((s, i) => s + i.credits * i.qty, 0); }
    function getCartMoneyTotal() { return cart.reduce((s, i) => s + discountedPrice(i) * i.qty, 0); }

    function updateCartUI() {
        const count = getCartCount();
        const moneyTotal = getCartMoneyTotal();
        const creditsTotal = getCartCreditsTotal();

        /* Badge */
        cartBadge.textContent = count;
        if (count > 0) {
            cartBadge.classList.add('is-visible');
            cartBadge.classList.remove('is-bumped');
            void cartBadge.offsetWidth;
            cartBadge.classList.add('is-bumped');
        } else {
            cartBadge.classList.remove('is-visible');
        }

        /* Total */
        cartTotal.innerHTML =
            `${formatINR(moneyTotal)} <span class="cart-credits-note">+ ${creditsTotal.toLocaleString('en-IN')} cr</span>`;

        /* Empty state */
        cartDrawer.classList.toggle('is-empty', count === 0);

        /* Items */
        cartItems.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item__img"
             style="${item.image
                ? `background-image:url('${item.image}');background-size:cover;background-position:center;`
                : `background:${item.gradient};`
            }">
        </div>
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}${item.qty > 1 ? ' ×' + item.qty : ''}</div>
          <div class="cart-item__price">
            ${formatINR(discountedPrice(item) * item.qty)}
            <span class="cart-item__credit-cost">&nbsp;${(item.credits * item.qty).toLocaleString('en-IN')} cr</span>
          </div>
        </div>
        <button class="cart-item__remove" data-id="${item.id}" type="button" aria-label="Remove ${item.name}">✕</button>
      </div>
    `).join('');

        cartItems.querySelectorAll('.cart-item__remove').forEach(btn => {
            btn.addEventListener('click', () => removeFromCart(Number(btn.dataset.id)));
        });

        syncButtonStates();
    }

    /* ─── Sync Card Buttons ─────────────────────────── */
    function syncButtonStates() {
        grid.querySelectorAll('.product-card__actions').forEach(wrapper => {
            const id = Number(wrapper.dataset.id);
            const item = cart.find(i => i.id === id);
            const addBtn = wrapper.querySelector('.product-card__btn--add');
            const stepper = wrapper.querySelector('.product-card__stepper');
            const qtyEl = wrapper.querySelector('.stepper__qty');

            if (item && item.qty > 0) {
                addBtn.style.display = 'none';
                stepper.style.display = 'flex';
                qtyEl.textContent = item.qty;
            } else {
                addBtn.style.display = '';
                stepper.style.display = 'none';
                qtyEl.textContent = '0';
            }
        });
    }

    /* ─── Cart Drawer ──────────────────────────────── */
    function openCart() { cartDrawer.classList.add('is-open'); cartBack.classList.add('is-open'); }
    function closeCart() { cartDrawer.classList.remove('is-open'); cartBack.classList.remove('is-open'); }

    cartToggle.addEventListener('click', openCart);
    cartClose.addEventListener('click', closeCart);
    cartBack.addEventListener('click', closeCart);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

    /* ─── Checkout ─────────────────────────────────── */
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;
        const creditsNeeded = getCartCreditsTotal();
        const moneyTotal = getCartMoneyTotal();

        if (creditsNeeded > credits) {
            checkoutBtn.textContent = '✕ Not enough credits!';
            checkoutBtn.style.opacity = '.7';
            setTimeout(() => {
                checkoutBtn.textContent = 'Redeem & Checkout →';
                checkoutBtn.style.opacity = '';
            }, 1600);
            return;
        }

        credits -= creditsNeeded;
        creditsEl.textContent = credits.toLocaleString('en-IN');
        if (heroCredits) heroCredits.textContent = credits.toLocaleString('en-IN');

        cart = [];
        updateCartUI();
        checkoutBtn.textContent = `✓ Paid ${formatINR(moneyTotal)}!`;
        setTimeout(() => {
            checkoutBtn.textContent = 'Redeem & Checkout →';
            closeCart();
        }, 1800);
    });

    /* ─── Init ─────────────────────────────────────── */
    renderProducts();
    updateCartUI();
});
