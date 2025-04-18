document.addEventListener('DOMContentLoaded', () => {
  const loadMoreBtn = document.querySelector('[data-load-more]');
  if (!loadMoreBtn) return;

  const productsGrid = document.querySelector('[data-products-grid]');
  if (!productsGrid) return;

  loadMoreBtn.addEventListener('click', async () => {
    const nextUrl = loadMoreBtn.dataset.nextUrl;
    if (!nextUrl) return;

    try {
      loadMoreBtn.textContent = 'Loading...';
      
      const response = await fetch(nextUrl);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Get new products and next URL
      const newProducts = doc.querySelector('[data-products-grid]');
      const newLoadMore = doc.querySelector('[data-load-more]');
      
      if (newProducts) {
        // Get all products (existing and new)
        const existingProducts = Array.from(productsGrid.children);
        const newProductElements = Array.from(newProducts.children);
        const allProducts = [...existingProducts, ...newProductElements];
        
        // Sort by availability
        const availableProducts = allProducts.filter(product => !product.querySelector('.product-item__badge--sold-out'));
        const unavailableProducts = allProducts.filter(product => product.querySelector('.product-item__badge--sold-out'));
        
        // Clear the grid
        productsGrid.innerHTML = '';
        
        // Add available products first
        availableProducts.forEach(product => {
          productsGrid.appendChild(product.cloneNode(true));
        });
        
        // Then add unavailable products
        unavailableProducts.forEach(product => {
          productsGrid.appendChild(product.cloneNode(true));
        });
      }
      
      if (newLoadMore) {
        loadMoreBtn.dataset.nextUrl = newLoadMore.dataset.nextUrl;
        loadMoreBtn.textContent = 'Load More Products';
      } else {
        loadMoreBtn.remove();
      }
    } catch (error) {
      console.error('Error loading more products:', error);
      loadMoreBtn.textContent = 'Error loading products';
    }
  });
});
