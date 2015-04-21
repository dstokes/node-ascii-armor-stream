var test = require('tape')
  , through = require('through')
  , armor = require('../');

var version = require('../package').version;

test('encodes ascii armor format', function (t) {
  var buf = ''
    , msg = 'ohai'
    , writer = through();

  function done() {
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
    this.queue(null);
  }

  writer.pipe(
    armor.encode('test', { test: 1 })
  ).pipe(
    through(function (d) { buf += d }, done)
  )
  writer.end(msg);
});


test('decodes ascii armor format', function (t) {
  t.plan(2);

  var buf = ''
    , msg = 'ohai'
    , writer = through();

  function done() {
    t.equals(buf, msg, "decodes the msg payload");
    this.queue(null);
  }

  writer.pipe(
    armor.encode('test', { test: 1 })
  ).pipe(armor.decode())
    .on('header', function (key, value) {
      if (key == 'Test') t.pass('parses headers');
    })
    .pipe(through(function (d) { buf += d }, done))

  writer.end(msg);
});

test('errors on invalid input', function (t) {
  t.plan(1);

  var msg = 'ohai'
    , writer = through();

  function done() { t.pass('threw error'); }
  writer.pipe(armor.decode().on('error', done));
  writer.end(msg);
});
