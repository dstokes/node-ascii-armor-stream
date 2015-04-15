ascii-armor-stream
==================

Create ascii armor messages

example
=======
```js
var armor = require('ascii-armor-stream');

var stream = armor.encode();
stream.pipe(process.stdout);
stream.write('ohai');
stream.end();

/**
 * -----BEGIN MESSAGE-----
 * Version: 1.0
 *
 * b2hhaQo=
 * -----END MESSAGE-----
 */
```

install
=======
With [npm](http://npmjs.org) do:

```
npm install ascii-armor-stream
```
