(function() {
  var Task, TaskApp, Tasks;
  Task = Spine.Model.setup("Task", ["name", "done"]);
  Task.extend(Spine.Model.Local);
  Task.extend({
    active: function() {
      return this.select(function(item) {
        return !item.done;
      });
    },
    done: function() {
      return this.select(function(item) {
        return !!item.done;
      });
    },
    destroyDone: function() {
      var rec, _i, _len, _ref, _results;
      _ref = this.done();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rec = _ref[_i];
        _results.push(rec.destroy());
      }
      return _results;
    }
  });
  Tasks = Spine.Controller.create({
    tag: "li",
    proxied: ["render", "remove"],
    events: {
      "change   input[type=checkbox]": "toggle",
      "click    .destroy": "destroy",
      "dblclick .view": "edit",
      "keypress input[type=text]": "blurOnEnter",
      "blur     input[type=text]": "close"
    },
    elements: {
      "input[type=text]": "input",
      ".item": "wrapper"
    },
    init: function() {
      this.item.bind("update", this.render);
      return this.item.bind("destroy", this.remove);
    },
    render: function() {
      var elements;
      elements = $("#taskTemplate").tmpl(this.item);
      this.el.html(elements);
      this.refreshElements();
      return this;
    },
    toggle: function() {
      this.item.done = !this.item.done;
      return this.item.save();
    },
    destroy: function() {
      return this.item.destroy();
    },
    edit: function() {
      this.wrapper.addClass("editing");
      return this.input.focus();
    },
    blurOnEnter: function(e) {
      if (e.keyCode === 13) {
        return e.target.blur();
      }
    },
    close: function() {
      this.wrapper.removeClass("editing");
      return this.item.updateAttributes({
        name: this.input.val()
      });
    },
    remove: function() {
      return this.el.remove();
    }
  });
  TaskApp = Spine.Controller.create({
    proxied: ["addOne", "addAll", "renderCount"],
    events: {
      "submit form": "create",
      "click  .clear": "clear"
    },
    elements: {
      ".items": "items",
      ".countVal": "count",
      ".clear": "clear",
      "form input": "input"
    },
    init: function() {
      Task.bind("create", this.addOne);
      Task.bind("refresh", this.addAll);
      Task.bind("refresh change", this.renderCount);
      return Task.fetch();
    },
    addOne: function(task) {
      var view;
      view = Tasks.init({
        item: task
      });
      return this.items.append(view.render().el);
    },
    addAll: function() {
      return Task.each(this.addOne);
    },
    create: function(e) {
      e.preventDefault();
      Task.create({
        name: this.input.val()
      });
      return this.input.val("");
    },
    clear: function() {
      return Task.destroyDone();
    },
    renderCount: function() {
      var active, inactive;
      active = Task.active().length;
      this.count.text(active);
      inactive = Task.done().length;
      if (inactive) {
        return this.clear.show();
      } else {
        return this.clear.hide();
      }
    }
  });
  jQuery(function() {
    return TaskApp.init({
      el: $("#tasks")
    });
  });
}).call(this);
