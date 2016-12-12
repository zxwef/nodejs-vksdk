var assert  = require('chai').assert,
    should  = require('chai').should(),
    VK      = require('../sdk');



// small tests workaround
var done = function(_o) {
};

describe('basicSdk', function() {
  var vk = new VK({
     'appId'     : 2807970,
     'appSecret' : 'L14ZKpgQPalJdumI6vFK',
     'language' : 'ru'
  });

  this.timeout(20000);

  it('Should test getters and setters', function(done) {

    assert.doesNotThrow(function() {
        assert.equal(vk.getVersion(), '5.58');
    });

    assert.doesNotThrow(function() {
        assert.isTrue(vk.setVersion('5.60'));
        assert.equal(vk.getVersion(), '5.60');
    });

    assert.doesNotThrow(function() {
        assert.isFalse(vk.getToken());
    });

    assert.doesNotThrow(function() {
        assert.isTrue(vk.setToken('abcd'));
        assert.equal(vk.getToken(), 'abcd');
    });

    assert.doesNotThrow(function() {
        assert.isFalse(vk.getHttps());
        assert.isTrue(vk.setHttps(true));
        assert.isTrue(vk.getHttps());
    });

    done();
  });

  it('Should get server access token', function(done) {
    assert.doesNotThrow(function() {
      vk.requestServerToken().then(function(obj) {
        assert.isTrue('access_token' in obj);
        assert.isTrue('expires_in' in obj);
        assert.isTrue(obj.expires_in === 0);
          done();
      });
    });
  });

  it('Should get Durov\'s profile with callback in insecure mode', function(done) {
    assert.doesNotThrow(function() {
      vk.setSecureRequests(false);
      vk.request('users.get', {'user_id' : 1}).then(function(obj) {
          assert.equal(obj.response[0].id,  1);
          assert.ok(['Павел', 'Pavel'].indexOf(obj.response[0].first_name) !== -1);
          assert.ok(['Дуров', 'Durov'].indexOf(obj.response[0].last_name) !== -1);
          done();
      });
    });
  });

  it('Should get error on server request', function(done) {
    assert.doesNotThrow(function() {
      vk.setSecureRequests(true);
      vk.request('secure.getAppBalance', {}).then(function(obj) {
        assert.equal(obj.error.error_code,  500);
        done();
      });
    });
  });

  it('Should request server method with server token', function(done) {
    assert.doesNotThrow(function() {
      vk
      .requestServerToken()
      .then(function() {
        vk.setVersion('5.27');
        return vk.request('secure.getSMSHistory', {});
      })
      .then(function(_dd) {
        assert.deepEqual(_dd,  { response: [] });
        done();
      });
    });
  });

});


describe('systemStuff', function() {
  var vk = new VK({
     'appId'     : 2807970,
     'appSecret' : 'L14ZKpgQPalJdumI6vFK'
  });

  this.timeout(20000);

  it('Should correctly identify non-empty objects', function(done) {
    assert.doesNotThrow(function() {
      assert.isFalse(vk.isEmpty("Hello"));
      assert.isFalse(vk.isEmpty([1,2,3]));
      assert.isFalse(vk.isEmpty({test: 1}));
      assert.isFalse(vk.isEmpty({length: 3, custom_property: [1,2,3]}));
      done();
    });
  });

  it('Should correctly identify empty objects', function(done) {
    assert.doesNotThrow(function() {
      assert.isTrue(vk.isEmpty(""));
      assert.isTrue(vk.isEmpty({}));
      assert.isTrue(vk.isEmpty([]));
      assert.isTrue(vk.isEmpty({length: 0, custom_property: []}));
      done();
    });
  });


  it('Should correctly merge objects', function(done) {
    assert.doesNotThrow(function() {
      assert.deepEqual(vk.extend({}), {});
      assert.deepEqual(vk.extend({}, {'t' : 1}), {'t' : 1});
      assert.deepEqual(vk.extend({'a' : 1}, {'t' : 1}, {'t' : 2}), {'t' : 2, 'a' : 1});
      done();
    });
  });

    it('Should create equal sig', function () {
        var rightSid = 'expire=1271238742&mid=100172&secret=97c1e8933e&sid=549b550f608e4a4d247734941debb5e68df50a66c58dc6ee2a4f60a2&sig=372df9795fe8dd29684a2f996872457c',
            rightSessionData = vk._parseSessionData(rightSid),
            wrongSid;

        assert.deepEqual(rightSessionData, {
            expire: '1271238742',
            mid: '100172',
            secret: '97c1e8933e',
            sid: '549b550f608e4a4d247734941debb5e68df50a66c58dc6ee2a4f60a2',
            sig: '372df9795fe8dd29684a2f996872457c'
        });
        wrongSid = 'test=here&expire=1271238742&mid=100172&secret=97c1e8933e&sid=549b550f608e4a4d247734941debb5e68df50a66c58dc6ee2a4f60a2&sig=372df9795fe8dd29684a2f996872457c';
        assert.isUndefined(vk._parseSessionData(wrongSid));
        wrongSid = 'mid=100172&secret=97c1e8933e&sid=549b550f608e4a4d247734941debb5e68df50a66c58dc6ee2a4f60a2&sig=372df9795fe8dd29684a2f996872457c';
        assert.isUndefined(vk._parseSessionData(wrongSid));

        var testVk = new VK({ appId: 1, appSecret: '6FF1PUlZfEyutJxctvtd'});
        assert.equal(testVk._createSig(rightSessionData), '372df9795fe8dd29684a2f996872457c');

        // It will be ok, if disable check by data.expire
        //assert.ok(testVk.isAuthOpenAPIMember(rightSid));
    });

});
