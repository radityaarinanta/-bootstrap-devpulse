/**
 * Workbench Component (P1-P4 Tools: JSON, Regex, Cron, Base64)
 */

import { $, $$, showToast, copyToClipboard } from '../utils/dom.js';
import { formatJson, minifyJson, testRegex, encodeBase64, decodeBase64, explainCron } from '../utils/parser.js';

export function initWorkbench() {
  const subPads = $$('.sub-pad-item');
  const toolStages = $$('.tool-stage');

  // Switch between tools (JSON, Regex, Cron, Base64)
  subPads.forEach(pad => {
    pad.addEventListener('click', () => {
      const tool = pad.getAttribute('data-tool');
      subPads.forEach(p => p.classList.remove('active'));
      toolStages.forEach(s => s.classList.remove('active'));

      pad.classList.add('active');
      const targetStage = $(`#stage-${tool}`);
      if (targetStage) targetStage.classList.add('active');
    });
  });

  // --- 1. JSON TOOL ---
  const jsonInput = $('#json-input');
  const jsonOutput = $('#json-output');
  const btnFormatJson = $('#btn-format-json');
  const btnMinifyJson = $('#btn-minify-json');
  const btnClearJson = $('#btn-clear-json');
  const btnCopyJson = $('#btn-copy-json');

  if (btnFormatJson) {
    btnFormatJson.addEventListener('click', () => {
      const res = formatJson(jsonInput.value);
      if (res.success) {
        jsonOutput.value = res.result;
        showToast('JSON_FORMATTED_OK');
      } else {
        jsonOutput.value = `[SYNTAX_ERROR] ${res.error}`;
        showToast('ERR_INVALID_JSON');
      }
    });
  }

  if (btnMinifyJson) {
    btnMinifyJson.addEventListener('click', () => {
      const res = minifyJson(jsonInput.value);
      if (res.success) {
        jsonOutput.value = res.result;
        showToast('JSON_MINIFIED_OK');
      } else {
        jsonOutput.value = `[SYNTAX_ERROR] ${res.error}`;
        showToast('ERR_INVALID_JSON');
      }
    });
  }

  if (btnClearJson) {
    btnClearJson.addEventListener('click', () => {
      jsonInput.value = '';
      jsonOutput.value = '';
      showToast('BUFFER_CLEARED');
    });
  }

  if (btnCopyJson) {
    btnCopyJson.addEventListener('click', () => {
      if (!jsonOutput.value) return showToast('NOTHING_TO_COPY');
      copyToClipboard(jsonOutput.value, 'JSON_COPIED');
    });
  }

  // --- 2. REGEX TOOL ---
  const regexPattern = $('#regex-pattern');
  const regexFlags = $('#regex-flags');
  const regexTestText = $('#regex-test-text');
  const regexResultView = $('#regex-result-view');
  const regexCountBadge = $('#regex-count-badge');

  function updateRegex() {
    if (!regexPattern || !regexTestText) return;
    const res = testRegex(regexPattern.value, regexFlags ? regexFlags.value : 'g', regexTestText.value);
    if (res.error) {
      regexResultView.innerHTML = `<span style="color: var(--signal-orange);">[REGEX_ERROR] ${res.error}</span>`;
      if (regexCountBadge) regexCountBadge.textContent = 'ERR';
    } else {
      regexResultView.innerHTML = res.html;
      if (regexCountBadge) regexCountBadge.textContent = `${res.count} MATCH(ES)`;
    }
  }

  if (regexPattern && regexTestText) {
    regexPattern.addEventListener('input', updateRegex);
    if (regexFlags) regexFlags.addEventListener('input', updateRegex);
    regexTestText.addEventListener('input', updateRegex);
    updateRegex();
  }

  // --- 3. CRON SEQUENCER ---
  const cronMin = $('#cron-min');
  const cronHour = $('#cron-hour');
  const cronDow = $('#cron-dow');
  const cronDisplay = $('#cron-expression-display');
  const cronExplain = $('#cron-explain-output');
  const btnCopyCron = $('#btn-copy-cron');

  function updateCron() {
    if (!cronMin || !cronHour || !cronDow) return;
    const expr = `${cronMin.value} ${cronHour.value} * * ${cronDow.value}`;
    if (cronDisplay) cronDisplay.textContent = expr;
    if (cronExplain) cronExplain.textContent = explainCron(cronMin.value, cronHour.value, '*', '*', cronDow.value);
  }

  if (cronMin && cronHour && cronDow) {
    cronMin.addEventListener('change', updateCron);
    cronHour.addEventListener('change', updateCron);
    cronDow.addEventListener('change', updateCron);
    updateCron();
  }

  if (btnCopyCron) {
    btnCopyCron.addEventListener('click', () => {
      if (cronDisplay) copyToClipboard(cronDisplay.textContent, 'CRON_COPIED');
    });
  }

  // --- 4. BASE64 CONVERTER ---
  const b64Input = $('#b64-input');
  const b64Output = $('#b64-output');
  const btnB64Encode = $('#btn-b64-encode');
  const btnB64Decode = $('#btn-b64-decode');
  const btnB64Copy = $('#btn-b64-copy');

  if (btnB64Encode) {
    btnB64Encode.addEventListener('click', () => {
      if (!b64Input.value) return;
      b64Output.value = encodeBase64(b64Input.value);
      showToast('BASE64_ENCODED');
    });
  }

  if (btnB64Decode) {
    btnB64Decode.addEventListener('click', () => {
      if (!b64Input.value) return;
      b64Output.value = decodeBase64(b64Input.value);
      showToast('BASE64_DECODED');
    });
  }

  if (btnB64Copy) {
    btnB64Copy.addEventListener('click', () => {
      if (b64Output.value) copyToClipboard(b64Output.value, 'OUTPUT_COPIED');
    });
  }
}
