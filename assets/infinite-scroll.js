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
    this.observer = new IntersectionObserver(this.handleIntersect.bind(this));
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
    const nextUrl = this.trigger.querySelector('a').href;
    if (!nextUrl) return;

    this.loading = true;
    this.trigger.classList.add('loading');

    try {
      const response = await fetch(nextUrl);
      const text = await response.text();
      const html = new DOMParser().parseFromString(text, 'text/html');
      
      // Get new products
      const newProducts = html.querySelector('[data-infinite-scroll-container]').innerHTML;
      this.productsContainer.insertAdjacentHTML('beforeend', newProducts);

      // Update trigger with new "next" link or remove if no more pages
      const newTrigger = html.querySelector('[data-infinite-scroll-trigger]');
      if (newTrigger) {
        this.trigger.innerHTML = newTrigger.innerHTML;
      } else {
        this.trigger.remove();
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