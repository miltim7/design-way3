(() => {
  const forms = [...document.querySelectorAll('.auth-form')];
  const account = document.querySelector('[data-account-content]');
  const clear = form => {
    form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    form.querySelectorAll('.field-error').forEach(el => { el.textContent = ''; });
    const status = form.querySelector('.form-status');
    status.textContent = '';
    status.classList.remove('success');
  };
  function errorField(form, name, message) {
    const input = form.elements[name];
    if (!input) return;
    input.setAttribute('aria-invalid', 'true');
    const messageNode = input.closest('.field')?.querySelector('.field-error');
    if (messageNode) messageNode.textContent = message;
  }
  function validate(form, container = form) {
    clear(form);
    let first;
    for (const input of container.querySelectorAll('input, select')) {
      if (input.closest('[hidden]')) continue;
      let error = '';
      if (input.required && (input.type === 'checkbox' ? !input.checked : !input.value.trim())) error = input.type === 'checkbox' ? 'Подтвердите согласие с условиями и обработкой данных.' : 'Заполните это поле.';
      else if (input.type === 'email' && !input.validity.valid) error = 'Проверьте email: например, name@company.ru.';
      else if (input.minLength > 0 && input.value.length < input.minLength) error = `Минимум ${input.minLength} символов.`;
      else if (input.name === 'passwordConfirm' && input.value !== form.elements.password.value) error = 'Пароли не совпадают.';
      if (error) {
        errorField(form, input.name, error);
        if (input.type === 'checkbox') form.querySelector('.form-status').textContent = error;
        first ||= input;
      }
    }
    first?.focus();
    return !first;
  }
  async function request(route, data) {
    let response;
    try {
      response = await fetch(`/api/auth/${route}`, {
        ...(data ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : {}),
        credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(15000)
      });
    } catch {
      throw Error('Не удалось связаться с сервером. Проверьте соединение и повторите.');
    }
    if (response.status === 404 || response.status === 405) {
      throw Object.assign(Error('Вход и регистрация пока недоступны. Попробуйте позже.'), { status: response.status, unavailable: true });
    }
    let result;
    try { result = await response.json(); } catch { throw Error('Не удалось прочитать ответ сервера. Повторите попытку.'); }
    if (!response.ok || result.ok !== true) throw Object.assign(Error(result.message || 'Не удалось выполнить действие.'), { field: result.field, status: response.status });
    return result;
  }
  function fillProfile(user) {
    document.querySelector('[data-account-greeting]').textContent = `Здравствуйте, ${user.name}.`;
    const form = document.querySelector('[data-auth="profile"]');
    for (const name of ['name', 'email', 'phone', 'company', 'timezone']) form.elements[name].value = user[name] || '';
  }
  document.querySelectorAll('[data-password-toggle]').forEach(button => button.addEventListener('click', () => {
    const input = document.getElementById(button.getAttribute('aria-controls'));
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    button.setAttribute('aria-pressed', String(show));
    button.setAttribute('aria-label', show ? 'Скрыть пароль' : 'Показать пароль');
  }));
  const registration = document.querySelector('[data-auth="register"]');
  function registrationStep(password) {
    swapContent(registration, () => {
      registration.querySelector('[data-register-details]').hidden = password;
      registration.querySelector('[data-register-password]').hidden = !password;
      document.querySelectorAll('[data-registration-step]').forEach((step,index)=>{
        if(index===Number(password))step.setAttribute('aria-current','step');
        else step.removeAttribute('aria-current');
        step.classList.toggle('is-complete',password&&index===0);
      });
      document.querySelector('[data-registration-status]').textContent=password?'Шаг 2 из 2: создайте пароль.':'Шаг 1 из 2: контактные данные.';
    });
    registration.querySelector(password ? '[name=password]' : '[name=name]').focus({ preventScroll: true });
  }
  registration?.querySelector('[data-register-next]').addEventListener('click', () => {
    if (validate(registration, registration.querySelector('[data-register-details]'))) registrationStep(true);
  });
  registration?.querySelector('[data-register-back]').addEventListener('click', () => {
    clear(registration);
    registrationStep(false);
  });
  for (const form of forms) {
    let busy = false;
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (busy) return;
      const route = form.dataset.auth;
      if (route === 'register' && !form.querySelector('[data-register-details]').hidden) {
        if (validate(form, form.querySelector('[data-register-details]'))) registrationStep(true);
        return;
      }
      if (!validate(form)) return;
      const data = Object.fromEntries(new FormData(form));
      if (route === 'register') { data.consent = form.elements.consent.checked; data.agreement = form.elements.agreement.checked; }
      delete data.passwordConfirm;
      busy = true;
      const button = form.querySelector('[type=submit]'), original = button.textContent;
      const status = form.querySelector('.form-status');
      button.disabled = true; button.textContent = 'Сохраняем…'; form.setAttribute('aria-busy', 'true');
      if (route === 'login') button.textContent = 'Входим…';
      try {
        const result = await request(route, data);
        if (route === 'register' || route === 'login') { window.location.assign('/account/'); return; }
        if (route === 'profile') fillProfile(result.user);
        if (route === 'password') {
          form.reset();
          form.querySelectorAll('[data-password-toggle][aria-pressed=true]').forEach(b => b.click());
        }
        status.classList.add('success');
        status.textContent = route === 'profile' ? 'Изменения сохранены.' : 'Пароль изменён. Остальные сеансы завершены.';
      } catch (error) {
        if (route === 'register' && ['email', 'name', 'phone', 'company', 'timezone'].includes(error.field)) registrationStep(false);
        if (error.field) { errorField(form, error.field, error.message); form.elements[error.field]?.focus(); }
        status.textContent = error.message;
        if (account && error.status === 401) window.location.assign('/sign-in/');
      } finally {
        busy = false; button.disabled = false; button.textContent = original; form.removeAttribute('aria-busy');
      }
    });
  }
  document.querySelector('[data-logout]')?.addEventListener('click', async event => {
    event.currentTarget.disabled = true;
    try { await request('logout', {}); window.location.assign('/sign-in/'); }
    catch (error) { document.querySelector('[data-account-status]').textContent = error.message; event.target.disabled = false; }
  });
  if (account) {
    request('me').then(({ user }) => { fillProfile(user); account.hidden = false; animateUI(account,[{opacity:0},{opacity:1}]); }).catch(error => {
      if (error.status === 401 || error.unavailable) { window.location.replace('/sign-in/'); return; }
      document.querySelector('[data-account-greeting]').textContent = 'Профиль пока не загрузился.';
      const status = document.querySelector('[data-account-status]');
      status.textContent = error.message + ' ';
      const reload = document.createElement('button');
      reload.className = 'text-link'; reload.textContent = 'Попробовать снова';
      reload.addEventListener('click', () => window.location.reload()); status.append(reload);
    });
    // Back/forward cache must not reveal a profile after logout in another tab.
    window.addEventListener('pageshow', event => { if (event.persisted) window.location.reload(); });
  }
})();
