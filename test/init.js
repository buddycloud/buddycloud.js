$(document).ready(function() {
  'use strict';

  var apiUrl = 'https://api.TEST.COM';
  var domain = 'TEST.COM';

  module('buddycloud');

  test(
    '.init(): initialize buddycloud lib',

    function() {
      buddycloud.init({'apiUrl': apiUrl, 'domain': domain});
      equal(false, buddycloud.ready(), 'should not be ready yet');
    }
  );
});