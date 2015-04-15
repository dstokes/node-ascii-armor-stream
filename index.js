var through = require('through')
  , split   = require('split')
  , base64  = require('base64-stream');

function header(name, fields) {
  fields = (fields || {});
  return [
    "-----BEGIN "+ name +"MESSAGE-----",
    "Version: ascii-armor-stream v"+ require('./package.json').version,
    Object.keys(fields).map(function (k) {
      return k.charAt(0).toUpperCase() + k.slice(1) +": "+ fields[k]
    })
  ].join("\n") + "\n\n";
}

function footer(name) {
  return "\n-----END "+ name +"MESSAGE-----\n";
}

module.exports = {
  encode: function (name, fields) {
    var idx = 0;
    var encoder = base64.encode(64);
    name = (name ?  name.toUpperCase()+" " : "");

    var stream = through(function (d) {
      if (idx++ === 0)
        this.queue(header(name, fields));
      encoder.write(d);
    }, function () {
      encoder.end();
      this.queue(footer(name));
      this.queue(null);
    });
    encoder.on('data', stream.queue);
    return stream;
  },
  decode: function () {
    var spl = split();
    var decoder = base64.decode();
    var stream = through(function (d) {
      spl.write(d);
    }, function () {
      this.queue(null);
    });
    var parsedHeaders = false;
    spl.on('data', function (ln) {
      if (/^-----/.test(ln)) return;
      if (ln && !parsedHeaders) {
        var parts = ln.split(': ')
        return stream.emit('header', parts[0], parts[1]);
      }
      if (ln === '') {
        parsedHeaders = true;
        return;
      }
      return decoder.write(ln);
    });
    decoder.on('data', function (d) {
      stream.queue(d);
    });
    return stream;
  }
}
