Task = Spine.Model.setup("Task", ["name", "done"])

Task.extend(Spine.Model.Local)

Task.extend
  active: ->
    this.select (item) -> !item.done

  done: ->
    this.select (item) -> !!item.done

  destroyDone: ->
    rec.destroy() for rec in this.done()

Tasks = Spine.Controller.create
  tag: "li"
  
  proxied: ["render", "remove"]
  
  events:
   "change   input[type=checkbox]": "toggle",
   "click    .destroy":             "destroy",
   "dblclick .view":                "edit",
   "keypress input[type=text]":     "blurOnEnter",
   "blur     input[type=text]":     "close"
 
  elements:
    "input[type=text]": "input",
    ".item": "wrapper"

  init: ->
    this.item.bind("update",  this.render)
    this.item.bind("destroy", this.remove)
  
  render: ->
    elements = $("#taskTemplate").tmpl(this.item)
    this.el.html(elements)
    this.refreshElements()
    this
  
  toggle: ->
    this.item.done = !this.item.done
    this.item.save()
  
  destroy: ->
    this.item.destroy()
  
  edit: ->
    this.wrapper.addClass("editing")
    this.input.focus()
  
  blurOnEnter: (e) ->
    if e.keyCode == 13 then e.target.blur()
  
  close: ->
    this.wrapper.removeClass("editing")
    this.item.updateAttributes({name: this.input.val()})
  
  remove: ->
    this.el.remove()

TaskApp = Spine.Controller.create    
  proxied: ["addOne", "addAll", "renderCount"]

  events:
    "submit form":   "create",
    "click  .clear": "clear"

  elements:
    ".items":     "items",
    ".countVal":  "count",
    ".clear":     "clear",
    "form input": "input"
  
  init: ->
    Task.bind("create",  this.addOne)
    Task.bind("refresh", this.addAll)
    Task.bind("refresh change", this.renderCount)
    Task.fetch()
  
  addOne: (task) ->
    view = Tasks.init({item: task})
    this.items.append(view.render().el)
  
  addAll: ->
    Task.each(this.addOne)

  create: (e) ->
    e.preventDefault()
    Task.create({name: this.input.val()})
    this.input.val("")
  
  clear: ->
    Task.destroyDone()
  
  renderCount: ->
    active = Task.active().length
    this.count.text(active)
    
    inactive = Task.done().length
    if inactive 
      this.clear.show()
    else
      this.clear.hide()

jQuery ->
  TaskApp.init(el: $("#tasks"))