$(document).ready(function() {

  apiUrl = 'https://api.TEST.COM';
  bc = buddycloud;

  module('buddycloud.Auth');

  test('init()', function() {
    bc.init({'apiUrl': apiUrl});
    equal(false, bc.ready(), 'should not be ready yet');
  });
});