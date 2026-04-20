(() => {
  const products = Array.isArray(window.__PRODUCTS__) ? window.__PRODUCTS__ : [];
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
    !resultCount ||
    !prevPageBtn ||
    !nextPageBtn ||
    !paginationInfo ||
    !sizeGuideHead ||
    !sizeGuideBody
  ) {
    return;
  }

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

  const renderSizeGuide = (category) => {
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
        <p class="product-meta">${product.frame} · ${product.wheel} · ${product.speed} скоростей · ${product.brakeType}</p>
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
    currentPage = 1;
    categoryButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.category === category);
    });
    renderAdvancedFilters(category);
    renderSizeGuide(category);
  };

  const renderPagination = (totalItems) => {
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    currentPage = Math.min(currentPage, totalPages);
    paginationInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
  };

  const renderCatalog = (filtered) => {
    if (filtered.length === 0) {
      grid.innerHTML = '<p>По вашему запросу ничего не найдено.</p>';
      renderPagination(0);
      return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);
    grid.innerHTML = paginated.map(cardTemplate).join('');
    renderPagination(filtered.length);
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

    lastFilteredTotal = filtered.length;

    renderCatalog(filtered);

    resultCount.textContent = `Найдено: ${filtered.length}`;
    priceValue.textContent = `${formatPrice(maxPrice)} ₽`;
  };

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
})();

