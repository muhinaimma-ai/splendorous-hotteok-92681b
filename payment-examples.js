/* Display examples only. This module neither fetches nor verifies transactions. */
(function (root) {
  'use strict';
  var HOUR = 3600000;
  var firstNames = ['Juma', 'Asha', 'Fatuma', 'Rehema', 'Kelvin', 'Mariam', 'Baraka', 'Neema', 'Hamisi', 'Zawadi', 'Daudi', 'Rahma', 'Salim', 'Grace', 'Peter', 'Agnes'];
  var surnames = ['Mashauri', 'Kileo', 'Mwakalinga', 'Mushi', 'Kombe'];
  var towns = ['Dodoma', 'Mbeya', 'Zanzibar', 'Morogoro', 'Tanga', 'Iringa', 'Arusha', 'Mwanza', 'Kigoma', 'Moshi'];
  var networks = ['M-Pesa', 'Airtel', 'Mixx', 'Halopesa'];
  var people = [];
  firstNames.forEach(function (first) {
    surnames.forEach(function (last) {
      var id = people.length;
      people.push({ id: 'example-' + id, name: first + ' ' + last, town: towns[id % towns.length], network: networks[id % 4], amount: 20000 + ((id * 13771) % 60) * 1000 });
    });
  });
  function getWindow(timestamp) {
    var local = timestamp + 3 * HOUR;
    var day = Math.floor(local / (24 * HOUR));
    var slot = Math.floor((local - day * 24 * HOUR) / (3 * HOUR));
    var order = people.slice();
    var seed = (day ^ 0x6d2b79f5) >>> 0;
    for (var i = order.length - 1; i > 0; i--) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      var j = seed % (i + 1), current = order[i];
      order[i] = order[j]; order[j] = current;
    }
    return { day: day, slot: slot, entries: order.slice(slot * 10, slot * 10 + 10), nextChange: (day * 24 + (slot + 1) * 3) * HOUR - 3 * HOUR };
  }
  root.ChatSitePaymentExamples = { getWindow: getWindow };
})(globalThis);