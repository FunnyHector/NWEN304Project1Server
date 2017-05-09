'use strict';

$(document).ready(function () {
  // load all existing to-do items from server
  $.get("/todos/", function (data, status) {
    if (status === "success") {
      // load all to-do items and make each into a row
      for (let item of data) {
        // make a task row
        let $newTask = $(`<li class='task-item' id='todo-${item.id}' data-is-finished='${item.is_finished}'></li>`)
            .append("<span class='done'>%</span>")
            .append(`<span class='title'>${item.title}</span>`)
            .append("<div class='edit-n-delete'></div>");

        $newTask.children(".edit-n-delete")
            .append("<span class='edit'>r</span>")
            .append("<span class='delete'>x</span>");

        // if there is a description, enable the toggle button. otherwise disable it.
        let description = item.description;
        if (description) {
          $newTask.children(".edit-n-delete").prepend("<span class='toggle-description'>&gt;</span>");
        } else {
          $newTask.children(".edit-n-delete").prepend("<span class='toggle-description-disabled'>&gt;</span>");
        }

        $newTask.append(`<div class='description'><p>${description}</p></div>`);
        $newTask.children(".description").hide();

        // add the task in the list
        console.log(item.is_finished);
        console.log(typeof item.is_finished);

        if (item.is_finished) {
          $("#completed-list").prepend($newTask);
        } else {
          $("#todo-list").prepend($newTask);
        }
      }
    } else {
      // TODO: need proper error handling
      // some debugging logs
      console.log("failed");
      console.log(typeof status);
      console.log(status);
      console.log(typeof data);
      console.log(data);
    }
  });

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
          let description = $.trim($taskDescription.val());

          // do not allow empty title
          if (title.length === 0) {
            $taskTitle.val("").effect("bounce", 1000);
            return {};
          }

          // post to server, create a new to-do item
          let todoItem = {
            title: title,
            description: description
          };

          $.post("/todos/", todoItem, function (data, status) {
            if (status === "success") {
              // make a task row
              let $newTask = $(`<li class='task-item' id='todo-${data.id}' data-is-finished='false'></li>`)
                  .append("<span class='done'>%</span>")
                  .append(`<span class='title'>${title}</span>`)
                  .append("<div class='edit-n-delete'></div>");

              $newTask.children(".edit-n-delete")
                  .append("<span class='edit'>r</span>")
                  .append("<span class='delete'>x</span>");

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

            } else {
              // TODO: need proper error handling
              // some debugging logs
              console.log("failed");
              console.log(typeof status);
              console.log(status);
              console.log(typeof data);
              console.log(data);
            }
          });

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
    let $taskItem = $(this).parents("li");
    let id = $taskItem.attr("id").slice(5);
    let updates = { is_finished: true };

    $.post(`/todos/${id}`, updates, function (data, status) {
      if (status === "success") {
        $taskItem.attr("data-is-finished", true).slideUp(250, function () {
          let $this = $(this);
          $this.detach();
          $("#completed-list").prepend($this);
          $this.slideDown();
        });
      } else {
        // TODO: need proper error handling
        // some debugging logs
        console.log("failed");
        console.log(typeof status);
        console.log(status);
        console.log(typeof data);
        console.log(data);
      }
    });

  }).on("click", ".edit", function () {
    let $taskItem = $(this).parents("li");
    let $newTodo = $("#new-todo");
    let id = $taskItem.attr("id").slice(5);
    let title = $.trim($taskItem.children(".title").text());
    let description = $.trim($taskItem.children(".description").text());
    let isFinished = $taskItem.attr("data-is-finished");

    // pre-set the text in title and description
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
          // get title and description from the dialog
          let $taskTitle = $("#task-title");
          let title = $.trim($taskTitle.val());
          let $taskDescription = $("#task-description");
          let description = $.trim($taskDescription.val());

          // do not allow empty title
          if (title.length === 0) {
            $taskTitle.val("").effect("bounce", 1000);
            return {};
          }

          // ajax data for updating
          let updates = {
            title: title,
            description: description,
            is_finished: isFinished
          };

          $.post(`/todos/${id}`, updates, function (data, status) {
            if (status === "success") {
              // update the title
              $taskItem.children(".title").text(title).effect("highlight", 1000);

              // update the description
              let $description = $taskItem.children(".description");
              $description.html(`<p>${description}</p>`);

              // some logic for description toggling
              if (description.length === 0) {
                $description.hide();
                $taskItem.find(".toggle-description").text(">").attr("class", "toggle-description-disabled");
              } else if (description.length > 0) {
                $description.slideDown().effect("highlight", 1000);
                $taskItem.find(".toggle-description").text("/");
                $taskItem.find(".toggle-description-disabled").text("/").attr("class", "toggle-description");
              }

            } else {
              // TODO: need proper error handling
              // some debugging logs
              console.log("failed");
              console.log(typeof status);
              console.log(status);
              console.log(typeof data);
              console.log(data);
            }
          });

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
    cancel: ".toggle-description, .delete, .done, .edit",
    stop: function (event, ui) {
      let $taskItem = ui.item;
      let id = $taskItem.attr("id").slice(5);

      // check whether it's done or not after the drag.
      let isFinishedNew;
      if ($taskItem.parents("#todo-list").length === 0) {
        isFinishedNew = true;
      } else {
        isFinishedNew = false;
      }

      $.post(`/todos/${id}`, { is_finished: isFinishedNew }, function (data, status) {
        if (status === "success") {
          $taskItem.attr("data-is-finished", isFinishedNew);
        } else {
          // TODO: need proper error handling
          // some debugging logs
          console.log("failed");
          console.log(typeof status);
          console.log(status);
          console.log(typeof data);
          console.log(data);
        }
      });
    }

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
              let id = $taskItem.attr("id").slice(5);

              $.ajax({
                url: `/todos/${id}`,
                type: 'DELETE',
                success: function () {
                  $taskItem.effect("puff", function () {
                    $(this).remove();
                  });
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                  // TODO: need proper error handling
                  // some debugging logs
                  console.log("failed");
                  console.log(XMLHttpRequest.status);
                  console.log(XMLHttpRequest.readyState);
                  console.log(textStatus);
                  console.log(errorThrown);
                }
              });

              $(this).dialog("close");
            },
            "Cancel": function () {
              $(this).dialog("close");
            }
          }
        }).dialog("open");
  });
});
