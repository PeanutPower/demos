# Verold Air Hockey

  HTML5 web-based air hockey game built on [Verold
API](http://verold.com),
  [THREE.js](https://github.com/mrdoob/three.js/),
[box2dweb](http://code.google.com/p/box2dweb/) and
  [Socket.IO](http://socket.io).

  You can play this game live at:
  [http://airhockey.jit.su](http://airhockey.jit.su)

# Versions

  There are two versions in this folder. 

## airhockey-original

  The original version, with no network optimization at all. This
produces a jittery effect as the client updates itself with physics data
from the server which is likely out of date on receipt.

## airhockey-optimized

  - Uses a shadow puck which constantly tracks the real puck to provide
interpolation between positional updates to produce a smoothing effect
  - Sends updates at a slower rate and immediatley after collisions
