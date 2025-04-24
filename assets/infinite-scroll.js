class InfiniteScroll {
  constructor() {
    // Clean up any existing observers
    if (window.currentInfiniteScroll) {
      window.currentInfiniteScroll.cleanup();
    }
    
    this.container = document.querySelector('[data-infinite-scroll]');
    if (!this.container) return;
    
    this.productsContainer = this.container.querySelector('[data-infinite-scroll-container]');
    this.trigger = this.container.querySelector('[data-infinite-scroll-trigger]');
    if (!this.trigger) return;

    this.loading = false;
    this.observer = new IntersectionObserver(this.handleIntersect.bind(this), {
      rootMargin: '200px'
    });
    this.observer.observe(this.trigger);
    
    // Store the current instance
    window.currentInfiniteScroll = this;
  }

  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  handleIntersect(entries) {
    if (entries[0].isIntersecting && !this.loading) {
      this.loadNextPage();
    }
  }

  isProductOutOfStock(productElement) {
    // Check for the sold-out badge
    return productElement.querySelector('.product-item__badge--sold') !== null;
  }

  sortProducts() {
    // Get all products except the trigger
    const products = Array.from(this.productsContainer.children).filter(
      el => !el.hasAttribute('data-infinite-scroll-trigger')
    );

    // Remove trigger temporarily
    if (this.trigger) {
      this.trigger.remove();
    }

    // Sort products into in-stock and out-of-stock
    const inStock = products.filter(product => !this.isProductOutOfStock(product));
    const outOfStock = products.filter(product => this.isProductOutOfStock(product));

    // Clear container
    this.productsContainer.innerHTML = '';

    // Add in-stock products first
    inStock.forEach(product => {
      this.productsContainer.appendChild(product);
    });

    // Then add out-of-stock products
    outOfStock.forEach(product => {
      this.productsContainer.appendChild(product);
    });

    // Re-append trigger
    if (this.trigger) {
      this.productsContainer.appendChild(this.trigger);
    }
  }

  async loadNextPage() {
    if (this.loading) return;

    const nextUrl = this.trigger.getAttribute('data-next-url');
    if (!nextUrl) return;

    this.loading = true;

    try {
      const response = await fetch(nextUrl);
      const text = await response.text();
      const html = new DOMParser().parseFromString(text, 'text/html');
      
      const newContainer = html.querySelector('[data-infinite-scroll-container]');
      const newTrigger = html.querySelector('[data-infinite-scroll-trigger]');

      if (newContainer) {
        // Get new products
        const newProducts = Array.from(newContainer.children).filter(
          el => !el.hasAttribute('data-infinite-scroll-trigger')
        );

        // Remove trigger temporarily
        if (this.trigger) {
          this.trigger.remove();
        }

        // Add new products
        newProducts.forEach(product => {
          this.productsContainer.appendChild(product.cloneNode(true));
        });

        // Update trigger
        if (newTrigger) {
          this.trigger.setAttribute('data-next-url', newTrigger.getAttribute('data-next-url'));
          this.productsContainer.appendChild(this.trigger);
        } else {
          this.observer.disconnect();
        }
      }
    } catch (error) {
      console.error('Error loading next page:', error);
    }

    this.loading = false;
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  new InfiniteScroll();
});

// Re-initialize after facets update
document.addEventListener('facets:updated', () => {
  new InfiniteScroll();
});