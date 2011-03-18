(function($, Spine){
  
  var con = new Spine.Controller("#tasks");
    
  con.events = {
    "change   .item input[type=checkbox]": "toggle",
    "click    .item .destroy":             "destroy",
    "dblclick .item .view":                "edit",
    "keypress .item input[type=text]":     "closeEdit",
    
    "submit   form":                       "create",
    "click    .clear":                     "clear",
    "render   .items":                     "render"
  };
    
  // Show tasks
  con.load(function(){
    this.tasks    = this.el.find(".items");
    this.count    = this.el.find(".countVal");
    this.input    = this.el.find("form input");
    
    this.tasks.link(Task, function(){
      var elements = $("#taskTemplate").tmpl(Task.all());
      
      $(this).empty();
      $(this).append(elements);
    });
  });
  
  con.extend({
    toggle: function(e){
      var task  = $(e.target).item();
      task.done = !task.done;
      task.save();      
    },
    
    destroy: function(e){
      $(e.target).item().destroy();
    },
    
    edit: function(e){
      var item = $(e.target).parents(".item");
      item.addClass("editing");
      item.find("input").focus();
    },
    
    closeEdit: function(e){
      if ( e.keyCode != 13 ) return;
      $(e.target).parents("li").removeClass("editing");
      $(e.target).item().updateAttributes({name: $(e.target).val()});
    },
    
    create: function(e){
      Task.create({name: this.input.val()});
      this.input.val("");
      return false;
    },
    
    clear: function(){
      Task.destroyDone();
    },
    
    render: function(){
      this.count.text(Task.active().length);
    }
  });

  // Initial render  
  con.load(function(){
    this.tasks.render();
  });
  
})(jQuery, Spine);