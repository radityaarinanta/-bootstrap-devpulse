/**
 * DevPulse Utility Parser & Formatter Engine
 * Powers JSON, Regex, Cron, and Base64 workbench tools.
 */

export function formatJson(rawString) {
  try {
    const parsed = JSON.parse(rawString);
    return { success: true, result: JSON.stringify(parsed, null, 2), error: null };
  } catch (err) {
    return { success: false, result: null, error: err.message };
  }
}

export function minifyJson(rawString) {
  try {
    const parsed = JSON.parse(rawString);
    return { success: true, result: JSON.stringify(parsed), error: null };
  } catch (err) {
    return { success: false, result: null, error: err.message };
  }
}

export function testRegex(patternStr, flagsStr, testText) {
  try {
    if (!patternStr) return { matches: [], html: escapeHtml(testText), count: 0 };
    const regex = new RegExp(patternStr, flagsStr);
    const matches = [];
    let match;
    
    if (flagsStr.includes('g')) {
      let lastIndex = 0;
      let html = '';
      while ((match = regex.exec(testText)) !== null) {
        if (match.index === regex.lastIndex) regex.lastIndex++;
        matches.push({ index: match.index, text: match[0] });
        
        html += escapeHtml(testText.slice(lastIndex, match.index));
        html += `<span class="regex-highlight">${escapeHtml(match[0])}</span>`;
        lastIndex = regex.lastIndex;
      }
      html += escapeHtml(testText.slice(lastIndex));
      return { matches, html, count: matches.length };
    } else {
      match = regex.exec(testText);
      if (match) {
        matches.push({ index: match.index, text: match[0] });
        const before = escapeHtml(testText.slice(0, match.index));
        const highlighted = `<span class="regex-highlight">${escapeHtml(match[0])}</span>`;
        const after = escapeHtml(testText.slice(match.index + match[0].length));
        return { matches, html: before + highlighted + after, count: 1 };
      }
      return { matches: [], html: escapeHtml(testText), count: 0 };
    }
  } catch (err) {
    return { error: err.message, matches: [], html: escapeHtml(testText), count: 0 };
  }
}

export function encodeBase64(str) {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    return 'ENCODE_ERROR: ' + e.message;
  }
}

export function decodeBase64(str) {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch (e) {
    return 'DECODE_ERROR: Invalid Base64 input string';
  }
}

export function explainCron(minute, hour, dom, month, dow) {
  let desc = 'Runs ';
  if (minute === '*' && hour === '*') desc += 'every minute';
  else if (minute.startsWith('*/')) desc += `every ${minute.replace('*/', '')} minutes`;
  else if (hour === '*' && minute !== '*') desc += `at minute ${minute} of every hour`;
  else if (hour !== '*' && minute !== '*') desc += `daily at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')} UTC`;
  
  if (dow === '1-5') desc += ' (Monday through Friday)';
  else if (dow === '0,6') desc += ' (Weekends only)';
  else if (dow !== '*') desc += ` on day-of-week: ${dow}`;
  
  return desc;
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
