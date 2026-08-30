(function () {
  const equalizeGroupCards = (grid) => {
    const cards = [...grid.querySelectorAll('.collection-design-groups__card')].filter(
      (card) => card.offsetParent !== null
    );

    cards.forEach((card) => {
      card.style.minHeight = '';
    });

    const maxHeight = cards.reduce(
      (max, card) => Math.max(max, card.getBoundingClientRect().height),
      0
    );

    if (maxHeight <= 0) return;

    cards.forEach((card) => {
      card.style.minHeight = `${Math.ceil(maxHeight)}px`;
    });
  };

  const setupSection = (section) => {
    const grid = section.querySelector('.collection-design-groups__grid');
    if (!grid) return;

    const equalize = () => equalizeGroupCards(grid);

    const toggle = section.querySelector('.collection-design-groups__toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const expanded = section.classList.toggle('is-expanded');
        grid.classList.toggle('is-expanded', expanded);
        toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        requestAnimationFrame(equalize);
      });
    }

    equalize();

    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(() => equalize());
      observer.observe(grid);
      return;
    }

    window.addEventListener('resize', equalize);
  };

  document.querySelectorAll('.collection-design-groups').forEach(setupSection);
})();
