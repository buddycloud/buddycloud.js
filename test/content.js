$(document).ready(function() {

  module('buddycloud.Content', {
    setup: function() {
      buddycloud.init(apiUrl);
      buddycloud.Auth.login(user);
      sinon.spy($, 'ajax');
    },
    teardown: function() {
      buddycloud.reset();
      $.ajax.restore();
    }
  });

  test('fetch all content', function() {
    
  });

});