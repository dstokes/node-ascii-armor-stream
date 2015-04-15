ascii-armor-stream
==================

Create ascii armor messages

[![Build Status](https://travis-ci.org/dstokes/node-ascii-armor-stream.png)](https://travis-ci.org/dstokes/node-ascii-armor-stream)  
[![NPM](https://nodei.co/npm/ascii-armor-stream.png?downloads=true)](https://nodei.co/npm/ascii-armor-stream/)  

example
=======
```js
var armor = require('ascii-armor-stream');

// encode
var encoder = armor.encode('fancy', { food: taco });
encoder.write('ohai');
encoder.end();

/**
 * -----BEGIN FANCY MESSAGE-----
 * Version: ascii-armor-stream v1.0.0
 * Food: taco
 *
 * b2hhaQo=
 * -----END FANCY MESSAGE-----
 */

// decode
var decoder = armor.decode();
myEncodedStream.pipe(decoder);

decoder.on('header', function(key, value) {
  // handle headers
});
```

install
=======
With [npm](http://npmjs.org) do:

```
npm install ascii-armor-stream
```
