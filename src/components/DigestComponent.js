/**
 * Digest Component (Technical Insights & Code Pattern Feed)
 */

import { $, showToast, copyToClipboard } from '../utils/dom.js';

export function renderDigest(digestItems = []) {
  const container = $('#digest-feed-container');
  if (!container) return;

  container.innerHTML = '';

  digestItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'digest-card';

    card.innerHTML = `
      <div class="digest-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="digest-id-tag">${item.id}</span>
          <span class="micro-label">${item.category} // ${item.tag}</span>
        </div>
        <span class="micro-label">${item.readTime || '2 MIN'}</span>
      </div>
      <h3 class="digest-title">${item.title}</h3>
      <p class="digest-summary">${item.summary}</p>
      
      <div class="code-display-block">
        <button class="code-copy-btn" data-code="${encodeURIComponent(item.code)}">[COPY CODE]</button>
        <pre class="code-pre"><code>${escapeHtml(item.code)}</code></pre>
      </div>
    `;

    container.appendChild(card);
  });

  // Attach copy listeners
  container.querySelectorAll('.code-copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const code = decodeURIComponent(btn.getAttribute('data-code'));
      copyToClipboard(code, 'CODE_SNIPPET_COPIED');
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
