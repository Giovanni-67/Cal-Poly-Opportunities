'use strict';

(function () {
  const form = document.getElementById('bug-form');
  if (!form) return;
  const status = document.getElementById('bug-status');
  const fields = [...form.querySelectorAll('[required]')];
  function validate(field) {
    const value = field.value.trim();
    field.setCustomValidity(!value ? 'Please fill out this field.' : value.length > field.maxLength ? `Use no more than ${field.maxLength} characters.` : field.minLength > 0 && value.length < field.minLength ? `Please include at least ${field.minLength} characters.` : '');
  }
  fields.forEach(field => {
    field.addEventListener('input', () => { field.setCustomValidity(''); status.textContent = ''; });
    field.addEventListener('invalid', () => { status.textContent = 'Please check the highlighted field before sending.'; });
  });
  form.addEventListener('submit', event => {
    fields.forEach(validate);
    if (!form.reportValidity()) { event.preventDefault(); return; }
    fields.forEach(field => { field.value = field.value.trim(); });
    // Native POST keeps FormSubmit's spam checks and requires no browser API key.
    // Keep the draft here if its new tab is blocked or the service is unavailable.
    status.textContent = 'Finish sending in the FormSubmit tab, including any spam check. Your report stays here until you clear it. If the tab did not open, use the direct email link below.';
  });
  form.addEventListener('reset', () => { fields.forEach(field => field.setCustomValidity('')); status.textContent = ''; });
})();
