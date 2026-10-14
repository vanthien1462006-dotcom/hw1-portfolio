const form = document.querySelector('#contact-form');

const FIELD_IDS = ['name', 'email', 'message'];

const getFields = () => FIELD_IDS.map((id) => form.querySelector(`#${id}`));

const getErrorElement = (field) => form.querySelector(`#${field.id}-error`);

const getStatusElement = () => form.querySelector('#form-status');

const getErrorMessage = (field) => {
  const { validity } = field;

  if (validity.valueMissing) {
    return `Please enter your ${field.id}.`;
  }
  if (validity.typeMismatch) {
    return 'Please enter a valid email address, like name@example.com.';
  }
  if (validity.tooShort) {
    return `Please use at least ${field.minLength} characters.`;
  }
  if (validity.tooLong) {
    return `Please keep it under ${field.maxLength} characters.`;
  }
  return field.validationMessage;
};

const showError = (field) => {
  getErrorElement(field).textContent = getErrorMessage(field);
  field.setAttribute('aria-invalid', 'true');
};

const clearError = (field) => {
  getErrorElement(field).textContent = '';
  field.removeAttribute('aria-invalid');
};

const clearStatus = () => {
  const status = getStatusElement();
  status.textContent = '';
  status.removeAttribute('data-state');
};

const validateForm = () => {
  const fields = getFields();
  let firstInvalid = null;

  fields.forEach((field) => {
    field.value = field.value.trim();
    if (field.checkValidity()) {
      clearError(field);
      return;
    }
    showError(field);
    firstInvalid ??= field;
  });

  if (firstInvalid) {
    firstInvalid.focus();
  }
  return firstInvalid === null;
};

const showSuccess = (senderName) => {
  const status = getStatusElement();
  status.textContent = `Thank you, ${senderName}! Your message is ready to send.`;
  status.dataset.state = 'success';
  status.tabIndex = -1;
  status.focus();
};

const handleSubmit = (event) => {
  event.preventDefault();
  clearStatus();

  if (!validateForm()) {
    return;
  }

  const senderName = form.querySelector('#name').value;
  form.reset();
  showSuccess(senderName);
};

const handleInput = (event) => {
  if (FIELD_IDS.includes(event.target.id)) {
    clearError(event.target);
  }
};

if (form) {
  // Take over validation from the browser so errors appear in the page, not in native bubbles.
  form.noValidate = true;
  form.addEventListener('submit', handleSubmit);
  form.addEventListener('input', handleInput);
}
