(function($){

var getUrl = function(object){
  if (!(object && object.url)) return null;
  return $.isFunction(object.url) ? object.url() : object.url;
};

var methodMap = {
  "create": "POST",
  "update": "PUT",
  "delete": "DELETE",
  "read"  : "GET"
};

var urlError = function() {
  throw new Error("A 'url' property or function must be specified");
};

var ajaxSync = function(e, method, record){
  var type = methodMap[method];

  var params = {
    type:         type,
    contentType:  "application/json",
    dataType:     "json",
    processData:  false
  };
  
  params.url = getUrl(record) || throw("Invalid URL");
  
  if (model && (method == "create" || method == "update"))
    params.data = JSON.stringify(record);
  
  $.ajax(params);
};

var ajaxFetch = function(e){
  syncAjax(e, "read");
};

Spine.Model.Ajax = {
  extended: function(){
    this.sync(ajaxSync);
    this.fetch(ajaxFetch);
  },
  
  url : function() {
    var base = this.urlRoot || urlError();
    if (this.isNew()) return base;
    base += (base.charAt(base.length - 1) == "/" ? "" : "/");
    base += encodeURIComponent(this.id);
    return base;
  }
};

})(jQuery);