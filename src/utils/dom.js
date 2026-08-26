/**
 * DOM & Toast Helpers (Industrial UI)
 */

export function $(selector, scope = document) {
  return scope.querySelector(selector);
}

export function $$(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

export function showToast(message, duration = 2500) {
  let toast = $('#hw-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'hw-toast';
    toast.className = 'hw-toast';
    document.body.appendChild(toast);
  }
  
  toast.textContent = `[SYS] ${message}`;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

export function copyToClipboard(text, successMessage = 'COPIED_TO_CLIPBOARD') {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMessage);
    }).catch(() => {
      fallbackCopy(text, successMessage);
    });
  } else {
    fallbackCopy(text, successMessage);
  }
}

function fallbackCopy(text, successMessage) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(successMessage);
  } catch (err) {
    showToast('COPY_FAILED');
  }
  document.body.removeChild(textArea);
}
