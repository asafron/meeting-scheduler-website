var DEBUG = false;
var API_Base_URL = DEBUG ? "http://localhost:4000" : "http://35.156.9.219";

function getAllMeetings(password, callback) {
    $.ajax({
        url: API_Base_URL + "/ws/admin/getAllMeetingStatus",
        type: 'POST',
        data: JSON.stringify({
            auth: password
        }),
        success: function (res) {
            callback(res);
        },
        error: function (res) {
            callback(res.responseJSON);
        }
    });
}

function minutesToString(minutesFromMidnight) {
    var hour = (Math.floor(minutesFromMidnight / 60)).toString();
    var minutes = (minutesFromMidnight % 60).toString();
    if (hour.length === 1) {
        hour = "0" + hour;
    }
    if (minutes.length === 1) {
        minutes = "0" + minutes;
    }
    return hour + ":" + minutes;
}

function meetingStringToReadable(dateString) {
    var dt = new Date(dateString);
    var str = $.format.date(dt, "dd-MM-yyyy HH:mm");
    return str;
}

function createMeetingsTable(meetings) {
    var tableDiv = $("#meetings-details");
    tableDiv.empty();

    var table = "<table class='table meetings-table'>" +
            "<tr class='active'>" +
            "<td class='meetings-table-content'>מראיין</td>" +
        "<td class='meetings-table-content'>תאריך</td>" +
        "<td class='meetings-table-content'>שעה</td>" +
        "<td class='meetings-table-content'>שם</td>" +
        "<td class='meetings-table-content'>דואר אלקטרוני</td>" +
        "<td class='meetings-table-content'>טלפון</td>" +
        "<td class='meetings-table-content'>בית ספר יסודי</td>" +
        "<td class='meetings-table-content'>זמן עדכון אחרון</td>" +
        "</tr>";

    for (var i = 0; i < meetings.length; i++) {
        var mtg = meetings[i];
        var classString = "class='info'";
        if (mtg.user_name.length > 0) {
            classString = "class='danger'";
        }
        var row = "<tr " + classString + ">" +
            "<td class='meetings-table-content'>" + mtg.representative + "</td>" +
            "<td class='meetings-table-content'>" + mtg.day + "-" + mtg.month + "-" + mtg.year + "</td>" +
            "<td class='meetings-table-content'>" + minutesToString(mtg.start_time) + "</td>" +
            "<td class='meetings-table-content'>" + mtg.user_name + "</td>" +
            "<td class='meetings-table-content'>" + mtg.user_email + "</td>" +
            "<td class='meetings-table-content'>" + mtg.user_phone + "</td>" +
            "<td class='meetings-table-content'>" + mtg.user_school + "</td>" +
            "<td class='meetings-table-content'>" + meetingStringToReadable(mtg.updated_at) + "</td>" +
            "</tr>";
        table = table + row;
    }

    table = table + "</table>";

    tableDiv.html(table);

    $("#password-div").hide();
    $("#meetings-outer").show();
}

jQuery(document).ready(function () {

    // submit
    $('.f2').on('submit', function (e) {

        e.preventDefault();

        var auth = $("#auth-input").val();

        getAllMeetings(auth, function (res) {
            if (res["meetings"]) {
                createMeetingsTable(res["meetings"]);
            } else {
                alert(res["message"]);
            }
        });

        $("#refresh-meetings").on('click', function () {
            getAllMeetings(auth, function (res) {
                if (res["meetings"]) {
                    createMeetingsTable(res["meetings"]);
                } else {
                    alert(res["message"]);
                }
            });
        });

        $("#print-meetings").on('click', function () {
            window.print();
        });

    });

});