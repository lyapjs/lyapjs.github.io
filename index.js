/**
 * Mini-Lyap Engine (Alpha Simulator)
 * A lightweight parser (< 50 lines) demonstrating how Lyapjs
 * enhances HTML with declarative state and bindings directly in the browser.
 */
class MiniLyap {
  constructor(el) {
    this.el = el;
    this.state = {};
    this.init();
  }

  init() {
    const stateStr = this.el.getAttribute('ly-state');
    if (stateStr) {
      // Parse key-value strings e.g. "count: 0"
      const pairs = stateStr.split(',');
      pairs.forEach(pair => {
        const parts = pair.split(':');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const val = parts.slice(1).join(':').trim();
          
          if (val === 'true') this.state[key] = true;
          else if (val === 'false') this.state[key] = false;
          else if (!isNaN(val)) this.state[key] = Number(val);
          else if (val.startsWith("'") && val.endsWith("'")) this.state[key] = val.slice(1, -1);
          else if (val.startsWith('"') && val.endsWith('"')) this.state[key] = val.slice(1, -1);
          else this.state[key] = val;
        }
      });
    }

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    // Bind click events
    this.el.querySelectorAll('[ly-click]').forEach(el => {
      if (el.dataset.lyapBoundClick) return;
      el.dataset.lyapBoundClick = "true";

      el.addEventListener('click', () => {
        const action = el.getAttribute('ly-click');
        this.evaluate(action);
        this.render();
      });
    });
  }

  evaluate(expression) {
    // Simple state mutation parser (e.g. count++)
    expression = expression.trim();
    if (expression.endsWith('++')) {
      const key = expression.slice(0, -2).trim();
      if (typeof this.state[key] === 'number') this.state[key]++;
    } else if (expression.endsWith('--')) {
      const key = expression.slice(0, -2).trim();
      if (typeof this.state[key] === 'number') this.state[key]--;
    } else if (expression.includes('=')) {
      const [key, expr] = expression.split('=').map(s => s.trim());
      if (expr === '!' + key) {
        this.state[key] = !this.state[key];
      } else if (!isNaN(expr)) {
        this.state[key] = Number(expr);
      }
    }
  }

  render() {
    // Render text bindings
    this.el.querySelectorAll('[ly-bind]').forEach(el => {
      const key = el.getAttribute('ly-bind');
      if (this.state[key] !== undefined) {
        el.textContent = this.state[key];
      }
    });
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Mini-Lyap compiler on state elements
  document.querySelectorAll('[ly-state]').forEach(el => new MiniLyap(el));

  // Copy code snippet to clipboard
  const copyBtn = document.querySelector('#copy-code-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const codeText = `<div ly-state="count: 0">\n  <button ly-click="count++" class="action-btn">\n    Count: <span ly-bind="count">0</span>\n  </button>\n</div>`;
      navigator.clipboard.writeText(codeText).then(() => {
        const textSpan = copyBtn.querySelector('.btn-text');
        const originalText = textSpan.textContent;
        textSpan.textContent = 'Copied!';
        copyBtn.style.color = '#f59e0b'; // Highlight color golden yellow on copy success
        
        setTimeout(() => {
          textSpan.textContent = originalText;
          copyBtn.style.color = '';
        }, 1500);
      }).catch(err => {
        console.error('Copy failure: ', err);
      });
    });
  }

  // Theme Toggle Event Listener
  const themeToggleBtn = document.querySelector('#theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }
});
