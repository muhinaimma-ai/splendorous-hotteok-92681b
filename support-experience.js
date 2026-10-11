/* Reuse the uploaded, deterministic support rules; no model or payment verification claims. */
(function () {
  'use strict';
  var stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = './support-experience.css';
  document.head.appendChild(stylesheet);
  var overlay = document.getElementById('helpOv');
  var choice = document.getElementById('helpChoice');
  var chat = document.getElementById('helpChat');
  var messages = document.getElementById('hMsgs');
  var input = document.getElementById('hIn');
  if (!overlay || !choice || !chat || !messages || !input) return;
  var language = window.ChatsiteSupportLanguage;
  var started = false, unlocked = false, menu = null, focusBefore = null;
  var topicToggle = overlay.querySelector('.topics');
  var closeButton = overlay.querySelector('.x');
  if (closeButton) closeButton.setAttribute('aria-label', 'Funga msaada');
  input.setAttribute('aria-label', 'Andika swali lako');
  var sendButton = overlay.querySelector('.send');
  if (sendButton) sendButton.setAttribute('aria-label', 'Tuma ujumbe');
  function expand() { overlay.classList.add('fullscreen'); input.focus(); }
  function reply(result) {
    if (result.text) window.addMsg('hMsgs', 'them', result.text);
  }
  function select(id) {
    expand();
    if (menu) { menu.remove(); menu = null; }
    var topic = language.helpTopics.find(function (item) { return item.id === id; });
    if (!topic) return;
    window.addMsg('hMsgs', 'me', topic.title);
    reply(language.selectTopic(id, 'support-main'));
  }
  window.showTopics = function () {
    if (!unlocked || menu) return;
    menu = document.createElement('div');
    menu.className = 'support-channels';
    var quick = document.createElement('button');
    quick.type = 'button'; quick.className = 'chip'; quick.textContent = '🎧 Msaada wa haraka';
    quick.onclick = function () { expand(); quick.remove(); input.focus(); };
    menu.appendChild(quick);
    language.helpTopics.forEach(function (topic) {
      var button = document.createElement('button');
      button.type = 'button'; button.className = 'chip'; button.textContent = topic.title;
      button.onclick = function () { select(topic.id); };
      menu.appendChild(button);
    });
    var originalLink = choice.querySelector('a');
    if (originalLink) {
      var group = originalLink.cloneNode(true); group.className = 'chip';
      menu.appendChild(group);
    }
    messages.appendChild(menu);
    menu.scrollIntoView({block: 'nearest'});
  };
  var picker = document.createElement('div');
  picker.className = 'support-picker'; picker.id = 'supportPicker'; picker.hidden = true;
  picker.setAttribute('role', 'dialog'); picker.setAttribute('aria-label', 'Chagua msaada');
  var groupLink = (choice.querySelector('a') || {}).href || '#';
  var icons = {
    support: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="5" aria-hidden="true"><path d="M12 35v-7a20 20 0 0 1 40 0v7"/><rect x="9" y="31" width="10" height="19" rx="4"/><rect x="45" y="31" width="10" height="19" rx="4"/><path d="M49 49v4H35"/><rect x="28" y="49" width="10" height="7" rx="3"/></svg>',
    group: '<svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true"><circle cx="23" cy="22" r="11"/><circle cx="46" cy="22" r="10" opacity=".65"/><path d="M5 54v-7a18 18 0 0 1 36 0v7Z"/><path d="M39 37a15 15 0 0 1 21 14v3H44v-7Z" opacity=".65"/></svg>',
    sms: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" aria-hidden="true"><rect x="7" y="15" width="50" height="35" rx="4"/><path d="m8 18 24 20 24-20M8 48l16-15m32 15L40 33"/></svg>'
  };
  var cards = [
    {icon: 'support', t: 'Customer Service', s: 'Msaada', go: function () { openChat(); }},
    {icon: 'group', t: 'Jiunge na Group', s: 'Group', href: groupLink},
    {icon: 'sms', t: 'Tuma ujumbe wa kawaida', s: 'SMS', href: 'sms:0614456925'}
  ];
  function hidePicker(restore) {
    picker.hidden = true;
    var trigger = document.querySelector('.fab');
    if (trigger) { trigger.setAttribute('aria-expanded', 'false'); if (restore) trigger.focus(); }
  }
  cards.forEach(function (c) {
    var el = document.createElement(c.href ? 'a' : 'button');
    el.className = 'support-card support-card-' + c.icon;
    if (c.href) { el.href = c.href; if (c.href.indexOf('http') === 0) { el.target = '_blank'; el.rel = 'noopener'; } el.onclick = function () { hidePicker(true); }; }
    else { el.type = 'button'; el.onclick = function () { hidePicker(false); c.go(); }; }
    el.innerHTML = '<span class="support-icon">' + icons[c.icon] + '</span><span>' + c.t + '</span><b>' + c.s + '</b>';
    picker.appendChild(el);
  });
  var pickerClose = document.createElement('button');
  pickerClose.type = 'button'; pickerClose.className = 'support-picker-x'; pickerClose.setAttribute('aria-label', 'Funga'); pickerClose.textContent = '×';
  pickerClose.onclick = function () { hidePicker(true); };
  picker.insertBefore(pickerClose, picker.firstChild);
  document.body.appendChild(picker);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !picker.hidden) hidePicker(true); });
  document.addEventListener('click', function (e) { if (!picker.hidden && !picker.contains(e.target) && !e.target.closest('.fab')) hidePicker(false); });
  picker.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var controls = picker.querySelectorAll('button, a'), first = controls[0], last = controls[controls.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  window.openHelp = function () {
    if (!picker.hidden) { hidePicker(true); return; }
    picker.hidden = false;
    var trigger = document.querySelector('.fab'); if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (!picker.hidden) { var f = picker.querySelector('.support-card'); if (f) f.focus(); }
  };
  function openChat() {
    focusBefore = document.activeElement;
    if (!started) {
      started = true;
      window.addMsg('hMsgs', 'them', 'Karibu! Nipo hapa kukusaidia.');
    }
    choice.style.display = 'none'; chat.style.display = 'flex';
    if (topicToggle) topicToggle.hidden = !unlocked;
    window.openOv('helpOv'); expand();
  }
  window.startHelpChat = function () { openChat(); };
  window.answer = function (question) {
    return language.respond(question, 'support-main', function (normalized) {
      if (/tiketi/.test(normalized)) return TOP['Tiketi za bure'];
      if (/sajili|usajili|akaunti|jiunga/.test(normalized)) return language.selectTopic('registration', 'support-main').text;
      if (/kuchat|chat|watu|mwanafunzi/.test(normalized)) return TOP['Chat na watu'];
      if (/chatsite|tovuti|jukwaa/.test(normalized)) return TOP['Chatsite ni nini?'];
      return null;
    });
  };
  window.ask = function (question) {
    window.addMsg('hMsgs', 'me', question);
    var result = window.answer(question);
    if (result.intent === 'abusive' || result.intent === 'empty') return;
    var isQuestion = /\?|\b(?:je|vipi|nini|gani|wapi|lini|kwa nini|kwanini|jinsi|namna|nawezaje|naomba|nahitaji|nisaidie|nashindwa|how|what|where|why)\b/i.test(question);
    var relevant = !['unknown', 'acknowledgement', 'farewell'].includes(result.intent);
    if (relevant || isQuestion) {
      unlocked = true;
      if (topicToggle) topicToggle.hidden = false;
    }
    if (menu) { menu.remove(); menu = null; }
    if (!result.text) result.text = 'Niambie tatizo lako kwa maelezo zaidi ili nikusaidie. Usitume nenosiri, PIN au OTP.';
    reply(result);
    if (result.helpTopics || (unlocked && !overlay.classList.contains('fullscreen'))) window.showTopics();
    input.focus();
  };
  var originalClose = window.closeOv;
  window.closeOv = function (id) {
    originalClose(id);
    if (id === 'helpOv' && focusBefore && typeof focusBefore.focus === 'function') focusBefore.focus();
  };
  overlay.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') { window.closeOv('helpOv'); return; }
    if (event.key !== 'Tab') return;
    var controls = Array.from(overlay.querySelectorAll('button, a, input')).filter(function (element) { return element.getClientRects().length > 0; });
    var first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first && last) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last && first) { event.preventDefault(); first.focus(); }
  });
  choice.style.display = 'none';
  if (topicToggle) topicToggle.hidden = true;
})();