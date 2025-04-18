class CollectionSort {
  constructor() {
    this.container = document.querySelector('[data-infinite-scroll-container]');
    if (!this.container) return;
    
    // Keep track of all products, including those loaded via infinite scroll
    this.allProducts = new Map(); // Use Map to maintain unique products by their URL
    this.initialSort();
    this.observeNewProducts();
  }

  initialSort() {
    const products = Array.from(this.container.children);
    products.forEach(product => {
      if (!product.hasAttribute('data-infinite-scroll-trigger')) {
        const productUrl = product.querySelector('a').href;
        if (!this.allProducts.has(productUrl)) {
          this.allProducts.set(productUrl, product);
        }
      }
    });
    this.sortAndRenderProducts();
  }

  sortAndRenderProducts() {
    const trigger = this.container.querySelector('[data-infinite-scroll-trigger]');
    
    // Convert Map values to array for sorting
    const products = Array.from(this.allProducts.values());
    
    const available = products.filter(product => !product.querySelector('.product-item__badge--sold-out'));
    const unavailable = products.filter(product => product.querySelector('.product-item__badge--sold-out'));
    
    // Clear container
    this.container.innerHTML = '';
    
    // Add all available products first
    available.forEach(product => {
      this.container.appendChild(product.cloneNode(true));
    });
    
    // Then add all unavailable products
    unavailable.forEach(product => {
      this.container.appendChild(product.cloneNode(true));
    });
    
    // Re-append trigger if it existed
    if (trigger) {
      this.container.appendChild(trigger);
    }
  }

  observeNewProducts() {
    const observer = new MutationObserver((mutations) => {
      let hasNewProducts = false;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE && !node.hasAttribute('data-infinite-scroll-trigger')) {
            const productUrl = node.querySelector('a').href;
            if (!this.allProducts.has(productUrl)) {
              this.allProducts.set(productUrl, node);
              hasNewProducts = true;
            }
          }
        });
      });
      
      if (hasNewProducts) {
        this.sortAndRenderProducts();
      }
    });

    observer.observe(this.container, {
      childList: true
    });
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  new CollectionSort();
});

// Re-initialize after facets update
document.addEventListener('facets:updated', () => {
  new CollectionSort();
}); 