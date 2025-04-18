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
      rootMargin: '200px' // Start loading before the trigger is visible
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

  async loadNextPage() {
    if (this.loading) return;
    
    const currentPage = new URL(window.location.href);
    const pageParam = currentPage.searchParams.get('page');
    const nextPage = pageParam ? parseInt(pageParam) + 1 : 2;
    
    const url = new URL(window.location.href);
    url.searchParams.set('page', nextPage);
    
    this.loading = true;
    this.trigger.classList.add('loading');

    try {
      const response = await fetch(url.toString());
      const text = await response.text();
      const html = new DOMParser().parseFromString(text, 'text/html');
      
      const newContainer = html.querySelector('[data-infinite-scroll-container]');
      const hasNextPage = html.querySelector('[data-infinite-scroll-trigger]');

      if (newContainer) {
        // Get all products from the new page
        const newProducts = Array.from(newContainer.children);
        
        // Sort them by availability
        const available = newProducts.filter(product => !product.querySelector('.product-item__badge--sold-out'));
        const unavailable = newProducts.filter(product => product.querySelector('.product-item__badge--sold-out'));
        
        // Add available products first
        available.forEach(product => {
          this.productsContainer.appendChild(product.cloneNode(true));
        });
        
        // Then add unavailable products
        unavailable.forEach(product => {
          this.productsContainer.appendChild(product.cloneNode(true));
        });
      }

      if (!hasNextPage) {
        // No more pages to load
        this.trigger.remove();
        this.observer.disconnect();
      }
    } catch (error) {
      console.error('Error loading next page:', error);
    }

    this.loading = false;
    this.trigger.classList.remove('loading');
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