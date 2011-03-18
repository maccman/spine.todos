Spine.Model.Local = {
  extended: function(){
    this.loadLocal();
    jQuery(window).unload(this.proxy(function(){ this.saveLocal(); }))
  },
  
  saveLocal: function(){
    var result = JSON.stringify(this.recordsValues());
    localStorage[this.name] = result;
  },

  loadLocal: function(){
    var result = localStorage[this.name];
    if ( !result ) return;
    var result = JSON.parse(result);
    this.populate(result);
  }
};