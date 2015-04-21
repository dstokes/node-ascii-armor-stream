var split   = require('split')
  , pipe    = require('multipipe')
  , duplexer= require('duplexer')
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

function chunker(size) {
  var buf = [];
  return through(
    function (bytes) {
      for (var i = 0, l = bytes.length; i < l; i++) {
        buf.push(bytes[i]);
        if (buf.length >= size) {
          this.queue(Buffer.concat(
            [new Buffer(buf.splice(0, buf.length)), new Buffer("\n")]
          ));
        }
      }
    },
    function () { this.queue(new Buffer(buf)); this.queue(null); }
  );
}

module.exports = {
  encode: function (name, fields) {
    name = (name ?  name.toUpperCase()+" " : "");
    var ct = 0
      , input = base64.encode();

    function write(d) {
      if (ct++ === 0) this.queue(header(name, fields) +"\n\n");
      this.queue(d);
    }

    function end() {
      this.queue("\n"+ footer(name) +"\n");
      this.queue(null);
    }

    return duplexer(input, input.pipe(chunker(64)).pipe(through(write, end)));
  },
  decode: function () {
    var ct = 0
      , parsedHeaders = false
      , stream;

    var input = split();
    var filter = through(function (ln) {
      if(ct++ === 0 && ln[0] !== '-') {
        stream.emit('error', new Error("Invalid ascii armor message format"));
        return;
      }
      if (/^-----/.test(ln)) return;
      if (ln && !parsedHeaders) {
        var parts = ln.split(': ')
        return stream.emit('header', parts[0], parts[1]);
      }
      if (ln === '') {
        parsedHeaders = true;
        return;
      }
      this.queue(ln);
    });

    var output = input.pipe(filter).pipe(base64.decode());
    stream = duplexer(input, output);

    return stream;
  }
}
