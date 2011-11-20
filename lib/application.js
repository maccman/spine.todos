(function() {
  var $, Task, TaskApp, Tasks;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $ = jQuery;

  Task = (function() {

    __extends(Task, Spine.Model);

    function Task() {
      Task.__super__.constructor.apply(this, arguments);
    }

    Task.configure("Task", "name", "done");

    Task.extend(Spine.Model.Local);

    Task.active = function() {
      return this.select(function(item) {
        return !item.done;
      });
    };

    Task.done = function() {
      return this.select(function(item) {
        return !!item.done;
      });
    };

    Task.destroyDone = function() {
      var rec, _i, _len, _ref, _results;
      _ref = this.done();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rec = _ref[_i];
        _results.push(rec.destroy());
      }
      return _results;
    };

    return Task;

  })();

  Tasks = (function() {

    __extends(Tasks, Spine.Controller);

    Tasks.prototype.events = {
      "change   input[type=checkbox]": "toggle",
      "click    .destroy": "remove",
      "dblclick .view": "edit",
      "keypress input[type=text]": "blurOnEnter",
      "blur     input[type=text]": "close"
    };

    Tasks.prototype.elements = {
      "input[type=text]": "input"
    };

    function Tasks() {
      this.render = __bind(this.render, this);      Tasks.__super__.constructor.apply(this, arguments);
      this.item.bind("update", this.render);
      this.item.bind("destroy", this.release);
    }

    Tasks.prototype.render = function() {
      this.replace($("#taskTemplate").tmpl(this.item));
      return this;
    };

    Tasks.prototype.toggle = function() {
      this.item.done = !this.item.done;
      return this.item.save();
    };

    Tasks.prototype.remove = function() {
      return this.item.destroy();
    };

    Tasks.prototype.edit = function() {
      this.el.addClass("editing");
      return this.input.focus();
    };

    Tasks.prototype.blurOnEnter = function(e) {
      if (e.keyCode === 13) return e.target.blur();
    };

    Tasks.prototype.close = function() {
      this.el.removeClass("editing");
      return this.item.updateAttributes({
        name: this.input.val()
      });
    };

    return Tasks;

  })();

  TaskApp = (function() {

    __extends(TaskApp, Spine.Controller);

    TaskApp.prototype.events = {
      "submit form": "create",
      "click  .clear": "clear"
    };

    TaskApp.prototype.elements = {
      ".items": "items",
      ".countVal": "count",
      ".clear": "clear",
      "form input": "input"
    };

    function TaskApp() {
      this.renderCount = __bind(this.renderCount, this);
      this.addAll = __bind(this.addAll, this);
      this.addOne = __bind(this.addOne, this);      TaskApp.__super__.constructor.apply(this, arguments);
      Task.bind("create", this.addOne);
      Task.bind("refresh", this.addAll);
      Task.bind("refresh change", this.renderCount);
      Task.fetch();
    }

    TaskApp.prototype.addOne = function(task) {
      var view;
      view = new Tasks({
        item: task
      });
      return this.items.append(view.render().el);
    };

    TaskApp.prototype.addAll = function() {
      return Task.each(this.addOne);
    };

    TaskApp.prototype.create = function(e) {
      e.preventDefault();
      Task.create({
        name: this.input.val()
      });
      return this.input.val("");
    };

    TaskApp.prototype.clear = function() {
      return Task.destroyDone();
    };

    TaskApp.prototype.renderCount = function() {
      var active, inactive;
      active = Task.active().length;
      this.count.text(active);
      inactive = Task.done().length;
      if (inactive) {
        return this.clear.show();
      } else {
        return this.clear.hide();
      }
    };

    return TaskApp;

  })();

  $(function() {
    return new TaskApp({
      el: $("#tasks")
    });
  });

}).call(this);
