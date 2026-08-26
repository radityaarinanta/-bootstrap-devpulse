/**
 * Guide Modal Component (GitHub Actions Setup Manual)
 */

import { $, showToast } from '../utils/dom.js';

export function initGuideModal() {
  const modal = $('#guide-modal-backdrop');
  const btnOpen = $('#btn-open-manual');
  const btnClose = $('#btn-close-manual');

  if (btnOpen && modal) {
    btnOpen.addEventListener('click', () => {
      modal.classList.add('open');
    });
  }

  if (btnClose && modal) {
    btnClose.addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  }
}
