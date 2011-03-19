(function($){
  
  var Spine;
  if (typeof exports !== 'undefined') {
    Spine = exports;
  } else {
    Spine = this.Spine = {};
  }
  
  // PubSub

  var PubSub = Spine.PubSub = {
    setup: function(){
      this.o = $({});
    },

    subscribe: function() {
      this.o.bind.apply( this.o, arguments );
    },

    publish: function() {
      this.o.trigger.apply( this.o, arguments );
    }
  };
  
  // Classes (or prototypial inheritors)
  
  if (typeof Object.create !== "function")
      Object.create = function(o) {
        function F() {}
        F.prototype = o;
        return new F();
      };

  var Klass = Spine.Klass = {
    init: function(){},

    prototype: {
      init: function(){}
    },

    create: function(){
      var object = Object.create(this);
      object.parent    = this;
      object.prototype = object.fn = Object.create(this.prototype);
      object.fn.proxy  = object.proxy;
      
      object.init.apply(object, arguments);
      return object;
    },

    inst: function(){
      var instance = Object.create(this.prototype);
      instance.parent = this;
      instance.init.apply(instance, arguments);
      return instance;
    },

    proxy: function(func){
      var thisObject = this;
      return(function(){ 
        return func.apply(thisObject, arguments); 
      });
    },

    include: function(obj){
      var included = obj.included || obj.setup;

      delete obj.included;
      delete obj.extended;
      delete obj.setup;

      for(var i in obj)
        this.fn[i] = obj[i];
      if (included) included.apply(this);
    },

    extend: function(obj){
      var extended = obj.extended || obj.setup;

      delete obj.included;
      delete obj.extended;
      delete obj.setup;

      for(var i in obj)
        this[i] = obj[i];
      if (extended) extended.apply(this);
      delete extended;
    }
  };
  
  // Models
  
  Spine.guid = function(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    }).toUpperCase();      
  };

  var Model = Spine.Model = Klass.create();
  
  Model.extend(PubSub);

  // Alias create
  Model.createSub = Model.create;
  Model.setup = function(name, atts){
    var model = Model.createSub();
    if (name) model.name = name;
    if (atts) model.attributes = atts;
    return model;
  };

  Model.extend({
   init: function(){
     this.records = {};
     this.attributes = [];
   },

   find: function(id){
     var record = this.records[id];
     if ( !record ) throw("Unknown record");
     return record.dup();
   },

   exists: function(id){
     try {
       return this.find(id);
     } catch (e) {
       return false;
     }
   },

   populate: function(values){
     // Reset model & records
     this.records = {};

     for (var i=0, il = values.length; i < il; i++) {    
       var record = this.inst(values[i]);
       record.newRecord = false;
       this.records[record.id] = record;
     }
   },

   select: function(callback){
     var result = [];

     for (var key in this.records)
       if (callback(this.records[key]))
         result.push(this.records[key]);

     return this.dupArray(result);
   },

   findByAttribute: function(name, value){
     for (var key in this.records)
       if (this.records[key][name] == value)
         return this.records[key].dup();
   },

   findAllByAttribute: function(name, value){
     return(this.select(function(item){
       return(item[name] == value);
     }));
   },

   each: function(callback){
     for (var key in this.records) {
       callback(this.records[key]);
     }
   },

   all: function(){
     return this.dupArray(this.recordsValues());
   },

   first: function(){
     var record = this.recordsValues()[0];
     return(record && record.dup());
   },

   last: function(){
     var values = this.recordsValues()
     var record = values[values.length - 1];
     return(record && record.dup());
   },

   count: function(){
     return this.recordsValues().length;
   },

   deleteAll: function(){
     for (var key in this.records)
       delete this.records[key];
   },

   destroyAll: function(){
     for (var key in this.records)
       this.records[key].destroy();
   },

   update: function(id, atts){
     this.find(id).updateAttributes(atts);
   },

   create: function(atts){
     var record = this.inst(atts);
     record.save();
     return record;
   },

   destroy: function(id){
     this.find(id).destroy();
   },

   // Private

   recordsValues: function(){
     var result = []
     for (var key in this.records)
       result.push(this.records[key])
     return result;
   },

   dupArray: function(array){
     return array.map(function(item){
       return item.dup();
     });
   }
  });
  
  Model.extend({
    extended: function() {
      this.subscribe("create update destroy", this.proxy(function(e, record){
        this.publish("change", record);
      }));
    },

    change: function(callback){
      if (typeof callback == "function")
        this.subscribe("change", callback);
      else
        this.publish("change", callback);
    }
  });

  Model.include({
    newRecord: true,

    init: function(atts){
      if (atts) this.load(atts);
    },

    isNew: function(){
      return this.newRecord;
    },

    validate: function(){ },

    load: function(atts){
      for(var name in atts)
        this[name] = atts[name];
    },

    attributes: function(){
      var result = {};
      for(var i in this.parent.attributes) {
        var attr = this.parent.attributes[i];
        result[attr] = this[attr];
      }
      result.id = this.id;
      return result;
    },

    eql: function(rec){
      return(rec && rec.id === this.id && 
             rec.parent === this.parent);
    },

    save: function(){
      if (this.validate() == false) return false;
      this.publish("beforeSave");
      this.newRecord ? this.create() : this.update();
      this.publish("afterSave");
      this.publish("save");
    },

    updateAttribute: function(name, value){
      this[name] = value;
      return this.save();
    },

    updateAttributes: function(atts){
      this.load(atts);
      return this.save();
    },

    destroy: function(){
      this.publish("beforeDestroy");
      delete this.parent.records[this.id];
      this.publish("afterDestroy");
      this.publish("destroy");
    },

    dup: function(){
      return Object.create(this);
    },

    reload: function(){
      return(this.parent.find(this.id));
    },

    toJSON: function(){
      return(this.attributes());
    },
    
    change: function(callback){
      if (typeof callback == "function")
        this.parent.change(this.proxy(function(e, record){
          if (this.eql(record)) callback(record);
        }));
      else
        this.parent.change(this);
    },

    // Private

    update: function(){
      this.publish("beforeUpdate");
      this.parent.records[this.id] = this.dup();
      this.publish("afterUpdate");
      this.publish("update");
    },

    generateID: function(){
      return Spine.guid();
    },

    create: function(){
      this.publish("beforeCreate");
      if ( !this.id ) this.id = this.generateID();
      this.newRecord = false;
      this.parent.records[this.id] = this.dup();
      this.publish("afterCreate");
      this.publish("create");
    },

    publish: function(channel){
      this.parent.publish(channel, this);
    }
  });
  
  // Controllers
  
  var Controller = Spine.Controller = Klass.create();
    
  Controller.include({    
    init: function(sel){
      sel = sel || this.sel || this.parent.sel;
      
      if (sel)
        this.el = $(sel);
      else
        this.el = $("<div />");
      
      if (this.parent.events) this.delegateEvents();
      if (this.parent.elements) this.findElements();
      this.render();
    },
    
    render: function(){},
    
    eventSplitter: /^(\w+)\s*(.*)$/,
    
    delegateEvents: function(){
      for (var key in this.parent.events) {
        var methodName = this.parent.events[key];
        var method     = this.proxy(this[methodName]);

        var match      = key.match(this.eventSplitter);
        var eventName  = match[1], selector = match[2];

        if (selector === '') {
          this.el.bind(eventName, method);
        } else {
          this.el.delegate(selector, eventName, method);
        }
      }
    },
    
    findElements: function(){
      for (var key in this.parent.elements) {
        this[this.parent.elements[key]] = this.el.find(key);
      }
    }
  });
})(jQuery);