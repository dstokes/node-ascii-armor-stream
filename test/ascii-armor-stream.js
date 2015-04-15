var test = require('tape')
  , armor = require('../');

var version = require('../package').version;

test('encodes ascii armor format', function (t) {
  var buf = ''
    , msg = 'ohai'
    , e = armor.encode('test', { test: 1 });
  e.on('data', function (d) { buf += d });
  e.write(msg);
  e.end();

  t.equals(
    buf,
    [ "-----BEGIN TEST MESSAGE-----"
    , "Version: ascii-armor-stream v"+ version
    , "Test: 1"
    , ""
    , new Buffer(msg).toString('base64')
    , "-----END TEST MESSAGE-----\n" ].join("\n"),
    "should print armor format"
  );
  t.end();
});


test('decodes ascii armor format', function (t) {
  var buf = ''
    , msg = 'ohai'
    , e = armor.encode('test', { test: 1 });

  t.plan(2);

  e.pipe(armor.decode())
    .on('header', function (key, value) {
      if (key == 'Test') t.pass('parses headers');
    })
    .on('data', function (d) { buf += d })

  e.write(msg);
  e.end();

  t.equals(buf, msg, "decodes the msg payload");
});
