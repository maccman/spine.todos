(function($, Spine){
  
  var con = Spine.Controller.create()
  
  con.sel = "#tasks";
    
  con.events = {
    "change   .item input[type=checkbox]": "toggle",
    "click    .item .destroy":             "destroy",
    "dblclick .item .view":                "edit",
    "keypress .item input[type=text]":     "closeEdit",
    
    "submit   form":                       "create",
    "click    .clear":                     "clear",
    "render   .items":                     "renderCount"
  };
  
  con.elements = {
    ".items":     "tasks",
    ".countVal":  "count",
    "form input": "input"
  };
        
  con.include({
    render: function(){
      this.tasks.link(Task, function(){
        var elements = $("#taskTemplate").tmpl(Task.all());
      
        $(this).empty();
        $(this).append(elements);
      });
      this.tasks.render();
    },
    
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
      $(e.target).parents(".item").removeClass("editing");
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
    
    renderCount: function(){
      this.count.text(Task.active().length);
    }
  });
  
  $(function(){
    con.inst();
  });
  
})(jQuery, Spine);