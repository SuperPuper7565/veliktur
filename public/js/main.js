(() => {
  const products = Array.isArray(window.__PRODUCTS__) ? window.__PRODUCTS__ : [];
  const grid = document.getElementById('catalogGrid');
  const searchInput = document.getElementById('searchInput');
  const categoryButtons = Array.from(document.querySelectorAll('.category-btn'));
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
  let selectedCategory = 'all';
  let selectedGender = 'all';
  let selectedAge = 'all';

  if (
    !grid ||
    !searchInput ||
    !categoryButtons.length ||
    !priceRange ||
    !priceValue ||
    !brandFilter ||
    !wheelFilter ||
    !speedsFilter ||
    !frameFilter ||
    !brakeFilter ||
    !categoryAdvancedTitle ||
    !categoryAdvancedDescription ||
    !genderButtonsWrap ||
    !ageButtonsWrap ||
    !advancedSeparator ||
    !resultCount
  ) {
    return;
  }

  const categoryMeta = {
    kids: {
      title: 'Для юных чемпионов',
      description: 'Поможем выбрать первый велосипед.',
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
      description: 'Подбор комфортной городской модели на каждый день.',
      genderOptions: [
        { value: 'men', label: 'Мужские' },
        { value: 'women', label: 'Женские' }
      ],
      ageOptions: []
    },
    mountain: {
      title: 'Для покорителей трасс и склонов',
      description: 'Надежные горные велосипеды под ваш стиль катания.',
      genderOptions: [
        { value: 'men', label: 'Мужские' },
        { value: 'women', label: 'Женские' }
      ],
      ageOptions: []
    },
    hybrid: {
      title: 'Для универсальных маршрутов',
      description: 'Гибридные модели для города и загородных поездок.',
      genderOptions: [
        { value: 'men', label: 'Мужские' },
        { value: 'women', label: 'Женские' }
      ],
      ageOptions: []
    },
    all: {
      title: 'Для каждого райдера',
      description: 'Выберите категорию выше, чтобы открыть дополнительные фильтры.',
      genderOptions: [],
      ageOptions: []
    }
  };

  const formatPrice = (value) =>
    new Intl.NumberFormat('ru-RU').format(Number(value || 0));

  const cardTemplate = (product) => `
    <article class="product-card" data-id="${product.id}">
      <img src="${product.image}" alt="${product.name}" loading="lazy" />
      <div class="product-body">
        <h3>${product.name}</h3>
        <p class="product-meta">${product.frame} · ${product.wheel} · ${product.speed} скоростей</p>
        <div class="product-row">
          <span class="price">${formatPrice(product.price)} ₽</span>
        </div>
        <button class="btn btn-dark" type="button">Выбрать</button>
      </div>
    </article>
  `;

  const maxProductPrice = products.reduce(
    (acc, product) => Math.max(acc, Number(product.price || 0)),
    0
  );

  priceRange.max = String(maxProductPrice);
  priceRange.value = String(maxProductPrice);
  priceValue.textContent = `${formatPrice(maxProductPrice)} ₽`;

  const setActiveCategory = (category) => {
    selectedCategory = category;
    selectedGender = 'all';
    selectedAge = 'all';
    categoryButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.category === category);
    });
    renderAdvancedFilters(category);
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
      renderAdvancedFilters(selectedCategory);
      applyFilters();
    });

    if (meta.ageOptions.length) {
      ageButtonsWrap.style.display = 'flex';
      advancedSeparator.style.display = 'inline';
      createFilterButtons(ageButtonsWrap, meta.ageOptions, selectedAge, (value) => {
        selectedAge = value;
        renderAdvancedFilters(selectedCategory);
        applyFilters();
      });
      return;
    }

    ageButtonsWrap.innerHTML = '';
    ageButtonsWrap.style.display = 'none';
    advancedSeparator.style.display = 'none';
  };

  const applyFilters = () => {
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

    filtered.sort((a, b) => Number(a.price) - Number(b.price));

    if (filtered.length === 0) {
      grid.innerHTML = '<p>По вашему запросу ничего не найдено.</p>';
    } else {
      grid.innerHTML = filtered.map(cardTemplate).join('');
    }

    resultCount.textContent = `Найдено: ${filtered.length}`;
    priceValue.textContent = `${formatPrice(maxPrice)} ₽`;
  };

  categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setActiveCategory(button.dataset.category || 'all');
      applyFilters();
    });
  });

  searchInput.addEventListener('input', applyFilters);
  priceRange.addEventListener('input', applyFilters);
  brandFilter.addEventListener('change', applyFilters);
  wheelFilter.addEventListener('change', applyFilters);
  speedsFilter.addEventListener('change', applyFilters);
  frameFilter.addEventListener('change', applyFilters);
  brakeFilter.addEventListener('change', applyFilters);
  renderAdvancedFilters(selectedCategory);
  applyFilters();
})();

