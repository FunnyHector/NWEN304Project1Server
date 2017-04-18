'use strict';

$(document).ready(function () {






  // Make the button for adding a task
  $("#add-todo").button({
    icons: { primary: "ui-icon-circle-plus" }
  }).click(function () {
    let $taskTitle = $("#task-title");
    let $taskDescription = $("#task-description");

    // clear the task title and description
    $taskTitle.val("");
    $taskDescription.val("");

    // open the dialog for adding new task
    $("#new-todo").dialog({
      modal: true,
      autoOpen: false,
      width: "fit-content",
      buttons: {
        "Add task": function () {
          let title = $.trim($taskTitle.val());

          // do not allow empty title
          if (title.length === 0) {
            $taskTitle.val("").effect("bounce", 1000);
            return {};
          }

          // make a task row
          let $newTask = $("<li class='task-item'></li>")  // TODO add id="todo-**"
              .append("<span class='done'>%</span>")
              .append(`<span class='title'>${title}</span>`)
              .append("<div class='edit-n-delete'></div>");

          $newTask.children(".edit-n-delete")
              .append("<span class='edit'>r</span>")
              .append("<span class='delete'>x</span>");

          // add the toggling functionality
          let description = $.trim($taskDescription.val());

          // if there is a description, enable the toggle button. otherwise disable it.
          if (description.length > 0) {
            $newTask.children(".edit-n-delete").prepend("<span class='toggle-description'>&gt;</span>");
          } else {
            $newTask.children(".edit-n-delete").prepend("<span class='toggle-description-disabled'>&gt;</span>");
          }

          $newTask.append(`<div class='description'><p>${description}</p></div>`);
          $newTask.children(".description").hide();

          // add the task in the list
          $("#todo-list").prepend($newTask);
          $newTask.hide().show("clip", 250).effect("highlight", 1000);

          $(this).dialog("close");
        },
        "Cancel": function () {
          $(this).dialog("close");
        }
      }
    }).dialog("open");
  });

  // add listeners to buttons on to-be-done list
  $("#todo-list").on("click", ".done", function () {
    // the event listener on done button
    let $taskItem = $(this).parent("li");
    $taskItem.slideUp(250, function () {
      let $this = $(this);
      $this.detach();
      $("#completed-list").prepend($this);
      $this.slideDown();
    });

  }).on("click", ".edit", function () {
    // the event listener on edit button
    let $taskItem = $(this).parents("li");

    // preset the text in title and description
    let $newTodo = $("#new-todo");
    let title = $.trim($taskItem.children(".title").text());
    let description = $.trim($taskItem.children(".description").text());
    $("#task-title").val(title);
    $("#task-description").val(description);

    // open the dialog for updating the task
    $newTodo.dialog({
      modal: true,
      autoOpen: false,
      width: "fit-content",
      title: "Update task",
      buttons: {
        "Update": function () {
          let $taskTitle = $("#task-title");
          let title = $.trim($taskTitle.val());

          if (title.length === 0) {
            $taskTitle.val("").effect("bounce", 1000);
            return {};
          }

          // update the title
          $taskItem.children(".title").text(title).effect("highlight", 1000);

          // update the description
          let $taskDescription = $("#task-description");
          let description = $.trim($taskDescription.val());
          let $description = $taskItem.children(".description");
          $description.text(description);

          if (description.length === 0) {
            $description.hide();
            $taskItem.find(".toggle-description").text(">").attr("class", "toggle-description-disabled");
          } else if (description.length > 0) {
            $description.slideDown().effect("highlight", 1000);
            $taskItem.find(".toggle-description").text("/");
            $taskItem.find(".toggle-description-disabled").text("/").attr("class", "toggle-description");
          }

          $(this).dialog("close");
        },
        "Cancel": function () {
          $(this).dialog("close");
        }
      }
    }).dialog("open");
  });

  // make all tasks sortable
  $(".sortable").sortable({
    connectWith: ".sortable",
    cursor: "pointer",
    placeholder: "ui-state-highlight",
    cancel: ".toggle-description, .delete, .done, .edit"

  }).on("click", ".toggle-description", function () {
    // the event listener on toggle-description button
    let $this = $(this);
    let $description = $this.parents("li").children(".description");

    if ($description.is(":hidden")) {
      $this.text("/");
    } else {
      $this.text(">");
    }

    $description.slideToggle();

  }).on("click", ".delete", function () {
    // the event listener on delete button
    let $taskItem = $(this).parents("li");
    let title = $.trim($taskItem.children(".title").text());

    // open the dialog for confirming the deletion
    $("<div id='confirm-deletion' title='Confirm deletion'>")
        .append(`<p><span class='ui-icon ui-icon-alert'></span>Do you want to delete "${title}"</span></p>`)
        .dialog({
          modal: true,
          autoOpen: false,
          width: "fit-content",
          buttons: {
            "Confirm": function () {
              $(this).dialog("close");

              $taskItem.effect("puff", function () {
                $(this).remove();
              });
            },
            "Cancel": function () {
              $(this).dialog("close");
            }
          }
        }).dialog("open");
  });
});
