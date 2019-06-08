$(document).ready(function () {
        if (window.location.href.indexOf('Post') > 0) {
            $("#postbtn").removeClass("post");
            $("#postbtn").addClass("messages");
            $("#postbtn").text("Messages");
            $("#postbtn").attr("href", "/");
        }
    });