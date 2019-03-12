var isEditSearch = false;
var isEditSentence = false;

$("#editbutton").click(function(){
    console.log($(this).html());
    if($(this).html() == "Edit")
    {
        $("#editbutton").text("Cancel");
        $("#addbutton").attr("style","display:none"); 
        $("#editCaption").attr("style","display:block");
        $("#deleteButton").attr("style","display:inline-block");
        $(".input").attr("style","display:inline-block");
        isEditSearch = true;
    }
    else if($(this).html() == "Cancel")
    {
        $("#editbutton").text("Edit");
        $("#addbutton").attr("style","display:inline-block"); 
        $("#editCaption").attr("style","display:none");
        $("#deleteButton").attr("style","display:none");
        $(".input").attr("style","display:none");
        isEditSearch = false;
    } 
});

$("#editbutton1").click(function(){
 
    console.log($(this).html());
    if($(this).html() == "Edit")
    {
        
        $("#editbutton1").text("Cancel")       
        $("#addbutton1").attr("style","display:none"); 
        $("#editCaption1").attr("style","display:block");
        $("#deleteButton1").attr("style","display:inline-block");
        $(".input1").attr("style","display:inline-block");
        isEditSentence = true;
    }
    else if($(this).html() == "Cancel")
    {
        $("#editbutton1").text("Edit");
        $("#addbutton1").attr("style","display:inline-block");
        $("#editCaption1").attr("style","display:none");
        $("#deleteButton1").attr("style","display:none");
        $(".input1").attr("style","display:none");
        isEditSentence = false;
    }     
});

$('#deleteButton').click(function(){
    copyText($(this));
})
        
$('#deleteButton1').click(function(){
    copyText($(this));
})
  
/* delete the item */
function copyText(butt){
    swal({
            title: "Are you sure?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
    .then((willDelete) => {
            if (willDelete) 
            {
                butt.parent().next().children().children().each(function(){
                    if($(this).find(":checked").length) {
                        var node = $(this).closest("a");
                        db.remove({"_id":node.attr("id"), "_rev":node.attr("rev")});
                    }
                });
                swal("Successfully Deleted!", {
                icon: "success",
                });
            } else 
            {
                swal("Your Bookmark is safe!");
            }
        });
}

/* update content */
$('#list-sentences').on("click", "a", function(){
    if(isEditSentence){
        inText(this.id, this.rev, $(this).children(':first').text(), 'sentence');
    }
})

$('#list-searches').on("click", "a", function(){
    if(isEditSearch){
        inText(this.id, this.rev, $(this).children(':first').text(), 'search');
    }
})

var db = new PouchDB('ibm-communication');  //create the database
db.changes({ 
    live: true,
    include_docs: true
}).on('change', function (change) {
    if(change.deleted){
        var deleteItem = $('#'+change.id);
        if(deleteItem.length) {
            deleteItem.remove();
        }
    } else if($('#'+change.id).length) {
        $('#'+change.id).children(':first').text(change.doc.term);
        $('#'+change.id).attr('rev', change.doc._rev);
    }
    else {
        var boxType = null;
        var listType = null;
        if(change.doc.type == "sentence"){
            boxType = "input1";
            listType = "#list-sentences";
        }
        else if(change.doc.type == "search"){
            boxType = "input";
            listType = "#list-searches";
        }
        var HTMLString = 
            '<a id="' + change.doc._id + '" rev="' + change.doc._rev + '" class="list-group-item' +
            ' d-flex justify-content-between align-items-center draggable="true" " href="#list-item-1">' +
                '<div>' + change.doc.term + '</div>' +
                '<span class="'+ boxType +'" style = "display:none">' +
                    '<div class="form-check">' + 
                        '<label class="form-check-label">' + 
                            '<input class="form-check-input" type="checkbox" value=""\>' + 
                            '<span class="form-check-sign"></span>' + 
                        '</label>' +
                    '</div>' +
                '</span>' +
            '</a>';
        var item = $.parseHTML(HTMLString);
        $(listType).append(item);
        $('#'+change.id).find('label').click(function(e){
            e.stopPropagation();
        });
        $(listType+"1").append(item);
    }
});

$('#savebookmark1').click(function(){
   
    if($("#inputsentence").val() != '')
    {
        db.post({
            user: $("#userEmail").val(),
            term: $("#inputsentence").val(), 
            type: 'sentence',
        }, function (err, res) {
            if (err) {
                throw new Error(err)
            }
        })
        $(".modal-backdrop").remove();
        $("#addSentence").hide();
    }
    else
    {
        $("#warninginput1").css("visibility", "visible");
    }
})

$("#inputsentence").focus(function() {
    $("#warninginput1").css("visibility", "hidden");
})

$('#savebookmark2').click(function(){
   
    if($("#inputsearch").val() != '')
    {
        db.post({
            user: $("#userEmail").val(),
            term: $("#inputsearch").val(), 
            type: 'search',
        }, function (err, res) {
            if (err) {
            throw new Error(err)
            }
        })
        $(".modal-backdrop").remove();
        $("#addSearch").hide();
    }
    else
    {
        $("#warninginput2").css("visibility", "visible");
    }
})

$("#inputsearch").focus(function() {
    $("#warninginput2").css("visibility", "hidden");
})

/* Update content */
function inText(getId, rev, text,type){
    swal("Enter what you want to update:", {
        content: {
            element: "input",
            attributes: {
              value: text,
            },
          },
        buttons: true,
        dangerMode: true,
   
      })
      .then((value) => {
        if(value)
        {
            db.get(getId).then(function(doc) {
                return db.put({
                  _id:  getId,
                  user: $("#userEmail").val(),
                  _rev: rev,
                  term: value,
                  type: type,
                });
              }).then(function(response) {
                // handle response
              }).catch(function (err) {
                console.log(err);
              });
            
            swal("Successfully Added");
        }
      });
}

var iosDragDropShim = { enableEnterLeave: true } 
var dragElement = null;
function bindDrag(source) {
    source.on('dragstart', function (event) {
        dragElement = $(this);
        $(this).css("background-color","#f8f8f8");
    });

    source.on('dragend', function (event) {
        $(event.target).css("background-color","#fff");
        event.preventDefault();
    });

    source.on('dragenter', function (event) {
        if($(this).prev().is(dragElement)){
            dragElement.insertAfter($(this)); 
        } else if($(this).next().is(dragElement)){
            dragElement.insertBefore($(this)); 
        }
    });
}
document.ondragover = function(e){e.preventDefault();}        
document.ondrop = function(e){e.preventDefault();}

var source = $('.list-group-item');
source.each(function(){
    bindDrag($(this));
});

/* log out jump function*/
$('#logout').click(function(){
    swal({
            title: "Do you want to log out??",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
    .then((willDelete) => {
            if (willDelete) 
            {
                window.location.href = "/logout";
                swal("Logging out", {
                icon: "success",
                });
            }
        });
})



