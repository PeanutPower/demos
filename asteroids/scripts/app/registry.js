/*global define:true, my:true */

define(['myclass'],
function(my) {

  var Registry = my.Class({

    objects : {},

    constructor : function() {
      if(!(this instanceof Registry)) {
        return new Registry();
      }

    },

    set : function(name, obj) {
      this.objects[name] = obj;
    },

    get : function(name) {
      if(!(name in this.objects)) {
        throw new Error('Registry does not contain object by name ' + name);
        return;
      }

      return this.objects[name];
    }

  });

  return Registry;

});
