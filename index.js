var split   = require('split')
  , through = require('through')
  , base64  = require('base64-stream');

function header(name, fields) {
  fields = (fields || {});
  return [
    "-----BEGIN "+ name +"MESSAGE-----",
    "Version: ascii-armor-stream v"+ require('./package.json').version,
    Object.keys(fields).map(function (k) {
      return k.charAt(0).toUpperCase() + k.slice(1) +": "+ fields[k]
    })
  ].join("\n");
}

function footer(name) {
  return "-----END "+ name +"MESSAGE-----";
}

module.exports = {
  encode: function (name, fields) {
    var idx = 0;
    var encoder = base64.encode();
    name = (name ?  name.toUpperCase()+" " : "");

    var stream = through(function (d) {
      if (idx++ === 0)
        this.queue(header(name, fields) +"\n\n");
      encoder.write(d);
    }, function () {
      encoder.end();
      this.queue("\n"+ footer(name) +"\n");
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
    var first = true;
    var parsedHeaders = false;
    spl.on('data', function (ln) {
      if (first && ln[0] !== '-') {
        stream.emit('error', new Error("Invalid ascii armor message format"));
        return stream.end();
      }
      first = false;
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
