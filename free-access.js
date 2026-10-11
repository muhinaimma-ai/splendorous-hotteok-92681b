/* Local free-access rules for the standalone ChatSite app. */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.ChatsiteFreeAccess = api; api.install(root); }
})(typeof window !== 'undefined' ? window : globalThis, function() {
  'use strict';
  const LIMIT = 4;
  const KEY = 'blogchat_free_chat_people_v1';
  const REGISTER = 'https://adsblog.app/page/reg.php?reg=MHINA99';
  const WARNING = 'Onyo: namba yako haijasajiliwa kikamilifu kupokea malipo. Tafadhali JISAJILI Sasa na uweke namba ya kupokea miamala.';
  function norm(v) { return String(v || '').trim().toLowerCase(); }
  function createPolicy(storage) {
    function people() {
      try {
        const value = JSON.parse(storage.getItem(KEY) || '[]');
        return Array.isArray(value) ? [...new Set(value.map(norm).filter(Boolean))] : [];
      } catch(e) { return []; }
    }
    function canOpen(person) {
      const id = norm(person), list = people();
      return !!id && (list.includes(id) || list.length < LIMIT);
    }
    function record(person) {
      if (!canOpen(person)) return false;
      const id = norm(person), list = people();
      if (!list.includes(id)) { list.push(id); storage.setItem(KEY, JSON.stringify(list)); }
      return true;
    }
    return {people, canOpen, record};
  }
  function install(w) {
    const policy = createPolicy(w.localStorage);
    function blocked(person) {
      if (policy.canOpen(person)) return false;
      if (w.__freeChatLimitShow) w.__freeChatLimitShow();
      return true;
    }
    w.__freeChatLimitReached = function(person) { return person ? !policy.canOpen(person) : policy.people().length >= LIMIT; };
    w.__freeChatRecordPerson = policy.record;
    const oldStart = w.startChat;
    if (typeof oldStart === 'function') w.startChat = function(person) {
      if (blocked(person)) return false;
      return oldStart.apply(this, arguments);
    };
    const oldCasual = w.startCasualChat;
    if (typeof oldCasual === 'function') w.startCasualChat = function(person) {
      if (blocked(person)) return false;
      const result = oldCasual.apply(this, arguments);
      if (result !== false) policy.record(person);
      return result;
    };
    const oldConfirm = w.confirmAndStartChat;
    if (typeof oldConfirm === 'function') w.confirmAndStartChat = function() {
      const person = typeof videoChatState !== 'undefined' ? videoChatState.person : '';
      if (blocked(person)) return false;
      // Tiketi inahesabika tu baada ya mteja kuthibitisha malipo chat ikiisha.
      return oldConfirm.apply(this, arguments);
    };
    function warn() {
      const status = w.document.getElementById('videoWithdrawStatus');
      if (!status) return;
      status.textContent = WARNING;
      status.classList.add('show');
      status.classList.remove('is-pending');
      const link = w.document.createElement('a');
      link.href = REGISTER;
      link.className = 'withdraw-registration-link';
      link.textContent = 'JISAJILI Sasa';
      status.appendChild(link);
    }
    const oldOpen = w.openWithdrawAccountModal;
    if (typeof oldOpen === 'function') w.openWithdrawAccountModal = function() {
      const result = oldOpen.apply(this, arguments);
      warn();
      return result;
    };
    w.submitVideoWithdrawal = function() { warn(); return false; };
    w.confirmPayout = function() { w.openWithdrawAccountModal(); return false; };
    return policy;
  }
  return {LIMIT, KEY, WARNING, createPolicy, install};
});