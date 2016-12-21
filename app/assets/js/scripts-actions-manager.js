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

function createMeetingsTable(meetings, repsFilter) {
    var tableDiv = $("#meetings-details");
    tableDiv.empty();

    var table = "<table id='meetings-table' class='table meetings-table'><thead>" +
            "<tr class='active'>" +
            "<td class='meetings-table-content'>מראיין</td>" +
        "<td class='meetings-table-content'>תאריך</td>" +
        "<td class='meetings-table-content'>שעה</td>" +
        "<td class='meetings-table-content'>שם</td>" +
        "<td class='meetings-table-content'>ת.ז</td>" +
        "<td class='meetings-table-content'>דואר אלקטרוני</td>" +
        "<td class='meetings-table-content'>טלפון</td>" +
        "<td class='meetings-table-content'>בית ספר יסודי</td>" +
        "<td class='meetings-table-content'>יום מועדף</td>" +
        "<td class='meetings-table-content'>זמן עדכון אחרון</td>" +
        "</tr></thead><tbody>";

    for (var i = 0; i < meetings.length; i++) {
        var mtg = meetings[i];
        var classString = "class='info'";
        if (mtg.user_name.length > 0) {
            classString = "class='danger'";
        }

        if (repsFilter !== "all") {
            if (mtg.representative !== repsFilter) {
                continue;
            }
        }

        var row = "<tr " + classString + ">" +
            "<td class='meetings-table-content'>" + mtg.representative + "</td>" +
            "<td class='meetings-table-content'>" + mtg.day + "-" + mtg.month + "-" + mtg.year + "</td>" +
            "<td class='meetings-table-content'>" + minutesToString(mtg.start_time) + "</td>" +
            "<td class='meetings-table-content'>" + mtg.user_name + "</td>" +
            "<td class='meetings-table-content'>" + mtg.user_id_number + "</td>" +
            "<td class='meetings-table-content'>" + mtg.user_email + "</td>" +
            "<td class='meetings-table-content'>" + mtg.user_phone + "</td>" +
            "<td class='meetings-table-content'>" + mtg.user_school + "</td>" +
            "<td class='meetings-table-content'>" + mtg.user_preferred_school_day + "</td>" +
            "<td class='meetings-table-content'>" + meetingStringToReadable(mtg.updated_at) + "</td>" +
            "</tr>";
        table = table + row;
    }

    table = table + "</tbody></table>";

    tableDiv.html(table);

    $("#password-div").hide();
    $("#meetings-outer").show();
}

function refreshTable() {
    getAllMeetings($("#auth-input").val(), function (res) {
        window.ms_admin_mtgs = res["meetings"].slice();
        window.ms_admin_mtgs_by_name = res["meetings"].slice();
        window.ms_admin_mtgs_by_name.sort(function(a, b){
            var keyA = a.user_name.replace(" ", ""),
                keyB = b.user_name.replace(" ", "");
            // Compare the 2 dates
            if(keyA < keyB) return -1;
            if(keyA > keyB) return 1;
            return 0;
        });

        window.ms_admin_representatives = [];
        if (window.ms_admin_mtgs) {
            createMeetingsTable(window.ms_admin_mtgs, "all");

            for (var i = 0; i < window.ms_admin_mtgs.length; i++) {
                var mtg = window.ms_admin_mtgs[i];
                if (window.ms_admin_representatives.indexOf(mtg.representative) === -1) {
                    window.ms_admin_representatives.push(mtg.representative);
                }
            }

            $("#reps-drop-down").empty();
            var lines = "<li><a class='reps-option' data-reps='-1'>כולם</a></li>";
            for (var i = 0; i < window.ms_admin_representatives.length; i++) {
                lines += "<li><a class='reps-option' data-reps='" + i + "'>" + window.ms_admin_representatives[i] + "</a></li>"
            }
            $("#reps-drop-down").html(lines);

        } else {
            alert(res["message"]);
        }
    });
}

jQuery(document).ready(function () {

    // submit
    $('.f2').on('submit', function (e) {

        e.preventDefault();

        window.ms_admin_mtgs = [];
        window.ms_admin_mtgs_by_name = [];
        window.ms_admin_representatives = [];
        window.ms_admin_current_rep = "all";
        window.order = "time";

        refreshTable();

        $("#refresh-meetings").on('click', function () {
            refreshTable();
        });

        $("#print-meetings").on('click', function () {
            window.print();
        });

        $("#order-meetings").on('click', function () {
            if (window.order === "time") {
                window.order = "name";
                createMeetingsTable(window.ms_admin_mtgs_by_name, window.ms_admin_current_rep);
                $("#order-meetings").html("<span class='glyphicon glyphicon-sort-by-order'></span> סדר לפי זמן");
            } else {
                window.order = "time";
                createMeetingsTable(window.ms_admin_mtgs, window.ms_admin_current_rep);
                $("#order-meetings").html("<span class='glyphicon glyphicon-sort-by-order'></span> סדר לפי א-ב");
            }
        });

        //<span class='glyphicon glyphicon-sort-by-order'></span> סדר לפי זמן

        $("#reps-drop-down").on('click', '.reps-option', function () {
            var pos = parseInt($(this).attr("data-reps"));
            var rep = "all";
            if (pos !== -1) {
                rep = window.ms_admin_representatives[pos];
            }
            window.ms_admin_current_rep = rep;
            createMeetingsTable(window.ms_admin_mtgs, rep);

            var buttonText = "סנן לפי מראיין <span class='caret'></span>";
            if (rep !== "all") {
                buttonText = rep;
            }
            $("#reps-drop-down-button").html(buttonText);
        });

    });

});