(() => {
  const products = Array.isArray(window.__PRODUCTS__) ? window.__PRODUCTS__ : [];
  const productMap = new Map(products.map((product) => [String(product.id), product]));
  const CART_STORAGE_KEY = 'veliktur-cart';
  const categoryLabels = {
    all: 'Все велосипеды',
    kids: 'Детские',
    city: 'Городские',
    mountain: 'Горные',
    hybrid: 'Гибридные',
    road: 'Шоссейные'
  };

  const escapeHtml = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (char) => {
      const symbols = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };

      return symbols[char] || char;
    });

  const formatPrice = (value) =>
    `${new Intl.NumberFormat('ru-RU').format(Number(value || 0))} ₽`;

  const getCategoryLabel = (product) =>
    product.categoryName || categoryLabels[product.category] || 'Велосипед';

  const getAudienceLabel = (value) => {
    const audienceMap = {
      men: 'Мужская модель',
      women: 'Женская модель',
      boys: 'Для мальчиков',
      girls: 'Для девочек'
    };

    return audienceMap[value] || 'Универсальная модель';
  };

  const sanitizeCart = (value) => {
    if (!value || typeof value !== 'object') {
      return {};
    }

    return Object.entries(value).reduce((accumulator, [id, quantity]) => {
      const normalizedQuantity = Number(quantity);

      if (productMap.has(String(id)) && Number.isFinite(normalizedQuantity) && normalizedQuantity > 0) {
        accumulator[String(id)] = Math.floor(normalizedQuantity);
      }

      return accumulator;
    }, {});
  };

  const loadCart = () => {
    try {
      const storedValue = window.localStorage.getItem(CART_STORAGE_KEY);
      return sanitizeCart(storedValue ? JSON.parse(storedValue) : {});
    } catch (error) {
      return {};
    }
  };

  let cart = loadCart();
  let currentProductId = null;
  let isCartDropdownOpen = false;
  let galleryIndex = 0;

  const cartToggle = document.getElementById('cartToggle');
  const cartDropdown = document.getElementById('cartDropdown');
  const cartPreview = document.getElementById('cartPreview');
  const cartCount = document.getElementById('cartCount');
  const cartSummaryText = document.getElementById('cartSummaryText');
  const cartCheckoutLink = document.getElementById('cartCheckoutLink');
  const orderCartList = document.getElementById('orderCartList');
  const orderCartTotal = document.getElementById('orderCartTotal');
  const orderForm = document.getElementById('orderForm');
  const orderItemsInput = document.getElementById('orderItemsInput');
  const orderSubmitBtn = document.getElementById('orderSubmitBtn');
  const productModal = document.getElementById('productModal');
  const productModalBody = document.getElementById('productModalBody');
  const successMessage = document.getElementById('orderSuccessMessage');
  const galleryTrack = document.getElementById('galleryTrack');
  const galleryPrevBtn = document.getElementById('galleryPrevBtn');
  const galleryNextBtn = document.getElementById('galleryNextBtn');
  const galleryCounter = document.getElementById('galleryCounter');

  const getQuantity = (productId) => Number(cart[String(productId)] || 0);

  const getCartEntries = () =>
    Object.entries(cart)
      .map(([id, quantity]) => {
        const product = productMap.get(String(id));

        if (!product) {
          return null;
        }

        return {
          product,
          quantity,
          total: Number(product.price || 0) * Number(quantity || 0)
        };
      })
      .filter(Boolean)
      .sort((first, second) => first.product.id - second.product.id);

  const persistCart = () => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      // Ignore storage failures so the UI keeps working.
    }
  };

  const clearCart = () => {
    cart = {};
    persistCart();
  };

  const setQuantity = (productId, quantity) => {
    const normalizedId = String(productId);
    const normalizedQuantity = Math.max(0, Math.floor(Number(quantity) || 0));

    if (!productMap.has(normalizedId)) {
      return;
    }

    if (normalizedQuantity === 0) {
      delete cart[normalizedId];
    } else {
      cart[normalizedId] = normalizedQuantity;
    }

    persistCart();
    renderCommerce();
  };

  const addToCart = (productId) => {
    setQuantity(productId, getQuantity(productId) + 1);
  };

  const changeQuantity = (productId, delta) => {
    setQuantity(productId, getQuantity(productId) + delta);
  };

  const renderActionMarkup = (productId, variant = 'card') => {
    const quantity = getQuantity(productId);
    const variantClass =
      variant === 'modal'
        ? 'quantity-control--modal'
        : variant === 'inline'
          ? 'quantity-control--inline'
          : '';

    if (quantity < 1) {
      const buttonClassByVariant = {
        card: 'btn btn-dark',
        best: 'btn',
        modal: 'btn'
      };

      return `
        <button
          class="${buttonClassByVariant[variant] || 'btn'}"
          type="button"
          data-action="add-to-cart"
          data-product-id="${productId}"
        >
          В корзину
        </button>
      `;
    }

    return `
      <div class="quantity-control ${variantClass}" data-cart-controls>
        <button
          class="quantity-btn"
          type="button"
          data-action="decrease-qty"
          data-product-id="${productId}"
          aria-label="Уменьшить количество"
        >
          -
        </button>
        <span class="quantity-value" aria-live="polite">${quantity}</span>
        <button
          class="quantity-btn"
          type="button"
          data-action="increase-qty"
          data-product-id="${productId}"
          aria-label="Увеличить количество"
        >
          +
        </button>
      </div>
    `;
  };

  const renderCartItem = (entry, compact = false) => {
    const { product, quantity, total } = entry;
    const cardClass = compact ? 'cart-item cart-item--compact' : 'cart-item';

    return `
      <article class="${cardClass}" data-product-id="${product.id}">
        <img class="cart-item__image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" />
        <div class="cart-item__content">
          <p class="cart-item__title">${escapeHtml(product.name)}</p>
          <p class="cart-item__meta">
            ${escapeHtml(product.brand)} • ${escapeHtml(product.frame)} • ${escapeHtml(product.wheel)}
          </p>
          <p class="cart-item__price-row">
            <span>${formatPrice(product.price)} × ${quantity}</span>
            <span class="cart-item__subtotal">${formatPrice(total)}</span>
          </p>
          <div class="cart-item__controls">
            ${renderActionMarkup(product.id, 'inline')}
          </div>
        </div>
      </article>
    `;
  };

  const renderEmptyState = (message) => `
    <div class="empty-state">
      <p>${message}</p>
      <a class="btn btn-ghost" href="#catalog">Перейти в каталог</a>
    </div>
  `;

  const renderActionHolders = () => {
    document.querySelectorAll('[data-product-actions]').forEach((holder) => {
      const productId = holder.dataset.productId;
      const variant = holder.dataset.variant || 'card';
      holder.innerHTML = renderActionMarkup(productId, variant);
    });
  };

  const renderCartBadge = () => {
    const items = getCartEntries();
    const totalQuantity = items.reduce((sum, entry) => sum + entry.quantity, 0);

    if (cartCount) {
      cartCount.textContent = String(totalQuantity);
    }

    if (cartSummaryText) {
      cartSummaryText.textContent = `Товаров: ${totalQuantity}`;
    }

    if (cartCheckoutLink) {
      cartCheckoutLink.classList.toggle('is-disabled', items.length === 0);
      cartCheckoutLink.setAttribute('aria-disabled', String(items.length === 0));
    }
  };

  const renderCartPreview = () => {
    if (!cartPreview) {
      return;
    }

    const items = getCartEntries();

    if (!items.length) {
      cartPreview.innerHTML = renderEmptyState('Корзина пока пуста. Добавьте товары из каталога или бестселлеров.');
      return;
    }

    cartPreview.innerHTML = items.map((entry) => renderCartItem(entry, true)).join('');
  };

  const renderOrderSummary = () => {
    if (!orderCartList || !orderCartTotal || !orderItemsInput || !orderSubmitBtn) {
      return;
    }

    const items = getCartEntries();
    const totalPrice = items.reduce((sum, entry) => sum + entry.total, 0);

    if (!items.length) {
      orderCartList.innerHTML = renderEmptyState('В корзине нет товаров. Выберите велосипед, и он сразу появится здесь.');
    } else {
      orderCartList.innerHTML = items.map((entry) => renderCartItem(entry)).join('');
    }

    orderCartTotal.textContent = formatPrice(totalPrice);
    orderItemsInput.value = JSON.stringify(
      items.map((entry) => ({
        id: entry.product.id,
        name: entry.product.name,
        quantity: entry.quantity,
        price: entry.product.price
      }))
    );
    orderSubmitBtn.disabled = items.length === 0;
  };

  const renderProductModal = () => {
    if (!productModalBody || !currentProductId) {
      return;
    }

    const product = productMap.get(String(currentProductId));

    if (!product) {
      return;
    }

    const specs = [
      ['Бренд', product.brand],
      ['Категория', getCategoryLabel(product)],
      ['Материал рамы', product.frame],
      ['Диаметр колес', product.wheel],
      ['Скоростей', `${product.speed}`],
      ['Тип тормоза', product.brakeType],
      ['Для кого', getAudienceLabel(product.targetGender)],
      ['Возраст', product.ageGroup ? product.ageGroup : 'Взрослые']
    ];

    productModalBody.innerHTML = `
      <div class="product-modal__layout">
        <div class="product-modal__media">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" />
        </div>

        <div class="product-modal__content">
          <p class="product-modal__brand">${escapeHtml(product.brand)} • ${escapeHtml(getCategoryLabel(product))}</p>
          <h2 class="product-modal__title" id="productModalTitle">${escapeHtml(product.name)}</h2>
          <p class="product-modal__lead">
            ${escapeHtml(product.name)} — ${escapeHtml(getAudienceLabel(product.targetGender).toLowerCase())} для городских маршрутов,
            тренировок и прогулок. Велосипед поставляется полностью подготовленным к поездке.
          </p>

          <div class="product-modal__price-row">
            <span class="product-modal__price">${formatPrice(product.price)}</span>
            <span class="product-modal__rating">Рейтинг ${Number(product.rating || 0).toFixed(1)} / 5</span>
          </div>

          <div class="product-actions product-modal__actions" data-product-actions data-product-id="${product.id}" data-variant="modal">
            ${renderActionMarkup(product.id, 'modal')}
          </div>

          <div class="product-modal__specs">
            ${specs
              .map(
                ([label, value]) => `
                  <article class="product-modal__spec">
                    <p class="product-modal__spec-label">${escapeHtml(label)}</p>
                    <p class="product-modal__spec-value">${escapeHtml(value)}</p>
                  </article>
                `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;
  };

  const openProductModal = (productId) => {
    if (!productModal || !productMap.has(String(productId))) {
      return;
    }

    currentProductId = String(productId);
    renderProductModal();
    productModal.hidden = false;
    document.body.classList.add('has-modal-open');
  };

  const closeProductModal = () => {
    if (!productModal) {
      return;
    }

    productModal.hidden = true;
    currentProductId = null;
    document.body.classList.remove('has-modal-open');
  };

  const openCartDropdown = () => {
    if (!cartDropdown || !cartToggle) {
      return;
    }

    cartDropdown.hidden = false;
    cartToggle.setAttribute('aria-expanded', 'true');
    isCartDropdownOpen = true;
  };

  const closeCartDropdown = () => {
    if (!cartDropdown || !cartToggle) {
      return;
    }

    cartDropdown.hidden = true;
    cartToggle.setAttribute('aria-expanded', 'false');
    isCartDropdownOpen = false;
  };

  const toggleCartDropdown = () => {
    if (isCartDropdownOpen) {
      closeCartDropdown();
      return;
    }

    openCartDropdown();
  };

  const renderCommerce = () => {
    renderCartBadge();
    renderActionHolders();
    renderCartPreview();
    renderOrderSummary();

    if (currentProductId) {
      renderProductModal();
    }
  };

  const slides = galleryTrack ? Array.from(galleryTrack.children) : [];

  const renderGallery = () => {
    if (!galleryTrack || !slides.length || !galleryCounter || !galleryPrevBtn || !galleryNextBtn) {
      return;
    }

    galleryTrack.style.transform = `translateX(-${galleryIndex * 100}%)`;
    galleryCounter.textContent = `${galleryIndex + 1} / ${slides.length}`;
    galleryPrevBtn.disabled = galleryIndex === 0;
    galleryNextBtn.disabled = galleryIndex === slides.length - 1;
  };

  const cleanSuccessState = () => {
    if (!successMessage) {
      return;
    }

    clearCart();

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('sent');
    const cleanUrl = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
    window.history.replaceState({}, document.title, cleanUrl);
  };

  if (window.location.search.includes('sent=1')) {
    cleanSuccessState();
  }

  if (cartToggle) {
    cartToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleCartDropdown();
    });
  }

  if (galleryPrevBtn) {
    galleryPrevBtn.addEventListener('click', () => {
      galleryIndex = Math.max(0, galleryIndex - 1);
      renderGallery();
    });
  }

  if (galleryNextBtn) {
    galleryNextBtn.addEventListener('click', () => {
      galleryIndex = Math.min(slides.length - 1, galleryIndex + 1);
      renderGallery();
    });
  }

  if (orderForm) {
    orderForm.addEventListener('submit', (event) => {
      if (!getCartEntries().length) {
        event.preventDefault();
      }
    });
  }

  document.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-action]');

    if (actionTarget) {
      const { action, productId } = actionTarget.dataset;

      if (action === 'add-to-cart') {
        event.preventDefault();
        addToCart(productId);
        return;
      }

      if (action === 'increase-qty') {
        event.preventDefault();
        changeQuantity(productId, 1);
        return;
      }

      if (action === 'decrease-qty') {
        event.preventDefault();
        changeQuantity(productId, -1);
        return;
      }

      if (action === 'close-product-modal') {
        event.preventDefault();
        closeProductModal();
        return;
      }

      if (action === 'go-to-checkout') {
        closeCartDropdown();
      }
    }

    if (event.target.closest('.cart-menu')) {
      return;
    }

    closeCartDropdown();

    if (event.target.closest('[data-cart-controls]')) {
      return;
    }

    const productCard = event.target.closest('[data-product-card]');

    if (productCard) {
      openProductModal(productCard.dataset.id);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeCartDropdown();
      closeProductModal();
      return;
    }

    const productCard = event.target.closest?.('[data-product-card]');

    if (
      productCard &&
      (event.key === 'Enter' || event.key === ' ') &&
      !event.target.closest('[data-cart-controls]')
    ) {
      event.preventDefault();
      openProductModal(productCard.dataset.id);
    }
  });

  const grid = document.getElementById('catalogGrid');
  const searchInput = document.getElementById('searchInput');
  const categoryButtons = Array.from(
    document.querySelectorAll('#categoryButtons .category-btn')
  );
  const priceRange = document.getElementById('priceRange');
  const priceValue = document.getElementById('priceValue');
  const brandFilter = document.getElementById('brandFilter');
  const wheelFilter = document.getElementById('wheelFilter');
  const speedsFilter = document.getElementById('speedsFilter');
  const frameFilter = document.getElementById('frameFilter');
  const brakeFilter = document.getElementById('brakeFilter');
  const categoryAdvancedTitle = document.getElementById('categoryAdvancedTitle');
  const categoryAdvancedDescription = document.getElementById(
    'categoryAdvancedDescription'
  );
  const genderButtonsWrap = document.getElementById('genderButtons');
  const ageButtonsWrap = document.getElementById('ageButtons');
  const advancedSeparator = document.getElementById('advancedSeparator');
  const resultCount = document.getElementById('resultCount');
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  const paginationInfo = document.getElementById('paginationInfo');
  const sizeGuideHead = document.getElementById('sizeGuideHead');
  const sizeGuideBody = document.getElementById('sizeGuideBody');

  let selectedCategory = 'all';
  let selectedGender = 'all';
  let selectedAge = 'all';
  let currentPage = 1;
  let lastFilteredTotal = 0;
  const itemsPerPage = 3;

  const sizeData = {
    all: [
      { height: '145-160', frame: 'S', wheel: '26" / 27.5"' },
      { height: '160-175', frame: 'M', wheel: '27.5" / 28"' },
      { height: '175-185', frame: 'L', wheel: '28" / 29"' },
      { height: '185-195', frame: 'XL', wheel: '29"' }
    ],
    kids: [
      { age: '2-4 года', height: '85-105', wheel: '12" / 14"' },
      { age: '4-6 лет', height: '105-120', wheel: '16"' },
      { age: '6-9 лет', height: '120-135', wheel: '20"' },
      { age: '9-12 лет', height: '135-150', wheel: '24"' }
    ],
    mountain: [
      { height: '150-165', frame: 'S', wheel: '26"' },
      { height: '165-175', frame: 'M', wheel: '27.5"' },
      { height: '175-185', frame: 'L', wheel: '29"' }
    ],
    city: [
      { height: '155-170', frame: 'M', wheel: '28"' },
      { height: '170-185', frame: 'L', wheel: '28"' }
    ],
    hybrid: [
      { height: '160-175', frame: 'M', wheel: '28"' },
      { height: '175-190', frame: 'L', wheel: '28"' }
    ]
  };

  const categoryMeta = {
    kids: {
      title: 'Для юных чемпионов',
      description: 'Поможем выбрать первый велосипед и подходящий размер.',
      genderOptions: [
        { value: 'boys', label: 'Для мальчиков' },
        { value: 'girls', label: 'Для девочек' }
      ],
      ageOptions: [
        { value: '3-5', label: '3-5 лет' },
        { value: '6-8', label: '6-8 лет' },
        { value: '9-12', label: '9-12 лет' }
      ]
    },
    city: {
      title: 'Для уверенного ритма города',
      description: 'Подбор комфортной модели для ежедневных поездок по Перми.',
      genderOptions: [
        { value: 'men', label: 'Мужские' },
        { value: 'women', label: 'Женские' }
      ],
      ageOptions: []
    },
    mountain: {
      title: 'Для покорителей трасс и склонов',
      description: 'Надежные горные велосипеды для тренировок и поездок по пересеченной местности.',
      genderOptions: [
        { value: 'men', label: 'Мужские' },
        { value: 'women', label: 'Женские' }
      ],
      ageOptions: []
    },
    hybrid: {
      title: 'Для универсальных маршрутов',
      description: 'Гибридные модели для города и загородных прогулок.',
      genderOptions: [
        { value: 'men', label: 'Мужские' },
        { value: 'women', label: 'Женские' }
      ],
      ageOptions: []
    },
    all: {
      title: 'Подберем велосипед под ваши задачи',
      description: 'Выберите категорию выше, и мы покажем подходящие фильтры.',
      genderOptions: [],
      ageOptions: []
    }
  };

  const cardTemplate = (product) => `
    <article
      class="product-card"
      data-id="${product.id}"
      data-product-card
      tabindex="0"
      role="button"
      aria-label="Открыть карточку товара ${escapeHtml(product.name)}"
    >
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" />
      <div class="product-body">
        <p class="product-category">${escapeHtml(product.brand)} • ${escapeHtml(getCategoryLabel(product))}</p>
        <h3>${escapeHtml(product.name)}</h3>
        <p class="product-meta">
          ${escapeHtml(product.frame)} • ${escapeHtml(product.wheel)} • ${escapeHtml(product.speed)} скоростей •
          ${escapeHtml(product.brakeType)}
        </p>
        <div class="product-row">
          <span class="price">${formatPrice(product.price)}</span>
          <span class="product-rating">${Number(product.rating || 0).toFixed(1)} / 5</span>
        </div>
        <div class="product-actions" data-product-actions data-product-id="${product.id}" data-variant="card">
          ${renderActionMarkup(product.id, 'card')}
        </div>
      </div>
    </article>
  `;

  const renderSizeGuide = (category) => {
    if (!sizeGuideHead || !sizeGuideBody) {
      return;
    }

    const normalizedCategory = sizeData[category] ? category : 'all';
    const rows = sizeData[normalizedCategory] || sizeData.all;
    const isKids = normalizedCategory === 'kids';
    const headCells = isKids
      ? ['Возраст', 'Рост (см)', 'Диаметр колес (″)']
      : ['Рост (см)', 'Рама', 'Диаметр колес (″)'];

    sizeGuideHead.innerHTML = `
      <tr>
        <th>${headCells[0]}</th>
        <th>${headCells[1]}</th>
        <th>${headCells[2]}</th>
      </tr>
    `;

    sizeGuideBody.innerHTML = rows
      .map((row) => {
        if (isKids) {
          return `<tr><td>${row.age}</td><td>${row.height}</td><td>${row.wheel}</td></tr>`;
        }

        return `<tr><td>${row.height}</td><td>${row.frame}</td><td>${row.wheel}</td></tr>`;
      })
      .join('');
  };

  const createFilterButtons = (target, options, selectedValue, onPick) => {
    const allButton = `<button class="category-btn ${
      selectedValue === 'all' ? 'is-active' : ''
    }" type="button" data-value="all">Все</button>`;

    const optionButtons = options
      .map(
        (option) => `<button class="category-btn ${
          selectedValue === option.value ? 'is-active' : ''
        }" type="button" data-value="${option.value}">${option.label}</button>`
      )
      .join('');

    target.innerHTML = allButton + optionButtons;
    target.querySelectorAll('.category-btn').forEach((button) => {
      button.addEventListener('click', () => {
        onPick(button.dataset.value || 'all');
      });
    });
  };

  const renderAdvancedFilters = (category) => {
    if (
      !categoryAdvancedTitle ||
      !categoryAdvancedDescription ||
      !genderButtonsWrap ||
      !ageButtonsWrap ||
      !advancedSeparator
    ) {
      return;
    }

    const meta = categoryMeta[category] || categoryMeta.all;
    categoryAdvancedTitle.textContent = meta.title;
    categoryAdvancedDescription.textContent = meta.description;

    if (!meta.genderOptions.length) {
      genderButtonsWrap.innerHTML = '';
      ageButtonsWrap.innerHTML = '';
      advancedSeparator.style.display = 'none';
      return;
    }

    createFilterButtons(genderButtonsWrap, meta.genderOptions, selectedGender, (value) => {
      selectedGender = value;
      currentPage = 1;
      renderAdvancedFilters(selectedCategory);
      applyFilters();
    });

    if (meta.ageOptions.length) {
      ageButtonsWrap.style.display = 'flex';
      advancedSeparator.style.display = 'inline';
      createFilterButtons(ageButtonsWrap, meta.ageOptions, selectedAge, (value) => {
        selectedAge = value;
        currentPage = 1;
        renderAdvancedFilters(selectedCategory);
        applyFilters();
      });
      return;
    }

    ageButtonsWrap.innerHTML = '';
    ageButtonsWrap.style.display = 'none';
    advancedSeparator.style.display = 'none';
  };

  const renderPagination = (totalItems) => {
    if (!paginationInfo || !prevPageBtn || !nextPageBtn) {
      return;
    }

    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    currentPage = Math.min(currentPage, totalPages);
    paginationInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
  };

  const renderCatalog = (filtered) => {
    if (!grid) {
      return;
    }

    if (!filtered.length) {
      grid.innerHTML = '<p>По вашему запросу ничего не найдено.</p>';
      renderPagination(0);
      return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);
    grid.innerHTML = paginated.map(cardTemplate).join('');
    renderPagination(filtered.length);
  };

  const setActiveCategory = (category) => {
    selectedCategory = category;
    selectedGender = 'all';
    selectedAge = 'all';
    currentPage = 1;

    categoryButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.category === category);
    });

    renderAdvancedFilters(category);
    renderSizeGuide(category);
  };

  const applyFilters = () => {
    if (
      !searchInput ||
      !priceRange ||
      !brandFilter ||
      !wheelFilter ||
      !speedsFilter ||
      !frameFilter ||
      !brakeFilter ||
      !resultCount ||
      !priceValue
    ) {
      return;
    }

    const searchValue = searchInput.value.toLowerCase().trim();
    const maxPrice = Number(priceRange.value || 0);
    const brandValue = brandFilter.value;
    const wheelValue = wheelFilter.value;
    const speedsValue = speedsFilter.value;
    const frameValue = frameFilter.value;
    const brakeValue = brakeFilter.value;

    const filtered = products.filter((item) => {
      const byCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const byName = item.name.toLowerCase().includes(searchValue);
      const byPrice = Number(item.price) <= maxPrice;
      const byBrand = brandValue === 'all' || item.brand === brandValue;
      const byWheel = wheelValue === 'all' || item.wheel === wheelValue;
      const bySpeeds = speedsValue === 'all' || item.speed === speedsValue;
      const byFrame = frameValue === 'all' || item.frame === frameValue;
      const byBrake = brakeValue === 'all' || item.brakeType === brakeValue;
      const byGender = selectedGender === 'all' || item.targetGender === selectedGender;
      const byAge = selectedAge === 'all' || item.ageGroup === selectedAge;

      return (
        byCategory &&
        byName &&
        byPrice &&
        byBrand &&
        byWheel &&
        bySpeeds &&
        byFrame &&
        byBrake &&
        byGender &&
        byAge
      );
    });

    filtered.sort((first, second) => Number(first.price) - Number(second.price));

    lastFilteredTotal = filtered.length;
    renderCatalog(filtered);
    renderActionHolders();
    resultCount.textContent = `Найдено: ${filtered.length}`;
    priceValue.textContent = formatPrice(maxPrice);
  };

  if (
    grid &&
    searchInput &&
    categoryButtons.length &&
    priceRange &&
    priceValue &&
    brandFilter &&
    wheelFilter &&
    speedsFilter &&
    frameFilter &&
    brakeFilter &&
    prevPageBtn &&
    nextPageBtn &&
    paginationInfo
  ) {
    const maxProductPrice = products.reduce(
      (accumulator, product) => Math.max(accumulator, Number(product.price || 0)),
      0
    );

    priceRange.max = String(maxProductPrice);
    priceRange.value = String(maxProductPrice);
    priceValue.textContent = formatPrice(maxProductPrice);

    categoryButtons.forEach((button) => {
      button.addEventListener('click', () => {
        setActiveCategory(button.dataset.category || 'all');
        applyFilters();
      });
    });

    searchInput.addEventListener('input', () => {
      currentPage = 1;
      applyFilters();
    });

    priceRange.addEventListener('input', () => {
      currentPage = 1;
      applyFilters();
    });

    brandFilter.addEventListener('change', () => {
      currentPage = 1;
      applyFilters();
    });

    wheelFilter.addEventListener('change', () => {
      currentPage = 1;
      applyFilters();
    });

    speedsFilter.addEventListener('change', () => {
      currentPage = 1;
      applyFilters();
    });

    frameFilter.addEventListener('change', () => {
      currentPage = 1;
      applyFilters();
    });

    brakeFilter.addEventListener('change', () => {
      currentPage = 1;
      applyFilters();
    });

    prevPageBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage -= 1;
        applyFilters();
      }
    });

    nextPageBtn.addEventListener('click', () => {
      const totalPages = Math.max(1, Math.ceil(lastFilteredTotal / itemsPerPage));

      if (currentPage < totalPages) {
        currentPage += 1;
        applyFilters();
      }
    });

    renderAdvancedFilters(selectedCategory);
    renderSizeGuide(selectedCategory);
    applyFilters();
  }

  renderCommerce();
  renderGallery();
})();
