var DEBUG = false;
var API_Base_URL = DEBUG ? "http://localhost:4000" : "http://35.156.9.219";

var allMeetings = [];

var user_details = {
    name: "",
    email: "",
    phone: "",
    school: "",
    id_number: "",
    day: 0,
    month: 0,
    year: 0,
    start_time: 0,
    end_time: 0
};

function scroll_to_class(element_class, removed_height) {
    var scroll_to = $(element_class).offset().top - removed_height;
    if ($(window).scrollTop() != scroll_to) {
        $('html, body').stop().animate({scrollTop: scroll_to}, 0);
    }
}

function bar_progress(progress_line_object, direction) {
    var number_of_steps = progress_line_object.data('number-of-steps');
    var now_value = progress_line_object.data('now-value');
    var new_value = 0;
    if (direction == 'right') {
        new_value = now_value - ( 100 / number_of_steps );
    }
    else if (direction == 'left') {
        new_value = now_value + ( 100 / number_of_steps );
    }
    progress_line_object.attr('style', 'width: ' + new_value + '%;').data('now-value', new_value);
}

function getAvailableMeetingsTime(callback) {
    $.ajax({
        url: API_Base_URL + "/ws/meetings/getAvailableMeetings",
        type: 'GET',
        success: function (res) {
            callback(res);
        }
    });
}

function scheduleMeeting(callback) {
    $.ajax({
        url: API_Base_URL + "/ws/meetings/schedule",
        type: 'POST',
        data: JSON.stringify({
            day: user_details.day,
            month: user_details.month,
            year: user_details.year,
            start_time: user_details.start_time,
            end_time: user_details.end_time,
            name: user_details.name,
            email: user_details.email,
            phone: user_details.phone,
            school: user_details.school,
            id_number: user_details.id_number
        }),
        success: function (res) {
            callback(res);
        },
        error: function (res) {
            callback(res.responseJSON);
        }
    });
}

function displayAvailableHours(selectedDate) {
    var availableHoursDiv = $("#available-hours");
    availableHoursDiv.empty();

    var startTimeArray = [];
    var availableHours = [];
    var currentSelectedDate = selectedDate;
    for (var i = 0; i < allMeetings.length; i++) {
        var mtg = allMeetings[i];
        var mtgDate = new Date(mtg["year"], mtg["month"] - 1, mtg["day"]);
        if (mtgDate.toDateString() === currentSelectedDate.toDateString()) {
            if ($.inArray(mtg["start_time"], startTimeArray) > -1) {
                continue;
            }
            startTimeArray.push(mtg["start_time"]);
            if (availableHours.length === 0) {
                user_details.start_time = mtg["start_time"];
                user_details.end_time = user_details.start_time + 10;
                availableHours.push("<div data-start-time='" + mtg["start_time"] + "' class='selected-hour'>" + minutesToHourString(mtg["start_time"]) + "</div>");
            } else {
                availableHours.push("<div data-start-time='" + mtg["start_time"] + "' class='available-hour'>" + minutesToHourString(mtg["start_time"]) + "</div>");
            }
        }
    }

    if (availableHours.length === 0) {
        return;
    } else {
        if (availableHours.length === 1) {
            availableHoursDiv.append("<div class='row hours-row'><div class='col-sm-6'>" + availableHours[availableHours.length - 1] + "</div><div class='col-sm-6'></div></div>");
        } else {
            for (var j = 0; j < availableHours.length / 2; j++) {
                var hrsStr = "";
                if (availableHours[(j * 2) + 1] !== undefined) {
                    hrsStr = "<div class='row hours-row'><div class='col-sm-6'>" + availableHours[j * 2] + "</div><div class='col-sm-6'>" + availableHours[(j * 2) + 1] + "</div></div>";
                } else {
                    hrsStr = "<div class='row hours-row'><div class='col-sm-6'>" + availableHours[j * 2] + "</div><div class='col-sm-6'></div></div>";
                }
                availableHoursDiv.append(hrsStr);
            }
        }
    }
}

function minutesToHourString(time) {
    console.log("time: " + time);
    var hours = parseInt(time / 60) + "";
    var minutes = parseInt(time % 60) + "";
    if (hours.length === 1) {
        hours = "0" + hours;
    }
    if (minutes.length === 1) {
        minutes = "0" + minutes;
    }
    console.log("time as string: " + hours + ":" + minutes);
    return hours + ":" + minutes;
}

function validateName(name) {
    return name.length > 0;
}

function validateEmail(email) {
    return email.length > 0;
}

function validatePhone(phone) {
    return /^\d+$/.test(phone);
}

function validateSchool(school) {
    return school.length > 0;
}

function validateIdNumber(idNumber) {
    return idNumber.length > 0;
}

jQuery(document).ready(function () {

    /*
     Form
     */
    $('.f1 fieldset:first').fadeIn('slow');

    $('.f1 input[type="text"], .f1 input[type="tel"], .f1 input[type="email"], .f1 input[type="number"]').on('focus', function () {
        $(this).removeClass('input-error');
    });

    // next step
    $('.f1 .btn-next').on('click', function () {
        var parent_fieldset = $(this).parents('fieldset');
        var next_step = true;
        // navigation steps / progress steps
        var current_active_step = $(this).parents('.f1').find('.f1-step.active');
        var progress_line = $(this).parents('.f1').find('.f1-progress-line');

        // fields validation
        parent_fieldset.find('input[type="text"], input[type="email"], input[type="tel"], input[type="number"]').each(function () {
            if ($(this).val() == "") {
                $(this).addClass('input-error');
                next_step = false;
            }
            else {
                $(this).removeClass('input-error');
            }
        });

        if (!validateName($("#f1-full-name").val())) {
            $("#f1-full-name").addClass('input-error');
            return;
        }
        if (!validateIdNumber($("#f1-id-number").val())) {
            $("#f1-id-number").addClass('input-error');
            return;
        }
        if (!validateEmail($("#f1-email").val())) {
            $("#f1-email").addClass('input-error');
            return;
        }
        if (!validatePhone($("#f1-phone").val())) {
            $("#f1-phone").addClass('input-error');
            return;
        }
        if (!validateSchool($("#f1-school").val())) {
            $("#f1-school").addClass('input-error');
            return;
        }
        // fields validation

        if (next_step) {
            var current_step_id = $(current_active_step).attr("id");
            if (current_step_id === "f1-step-1") {
                user_details.name = $("#f1-full-name").val();
                user_details.id_number = $("#f1-id-number").val();
                user_details.email = $("#f1-email").val();
                user_details.phone = $("#f1-phone").val();
                user_details.school = $("#f1-school").val();
            } else if (current_step_id === "f1-step-2") {
                $("#confirm-name").text(user_details.name);
                $("#confirm-id-number").text(user_details.id_number);
                $("#confirm-email").text(user_details.email);
                $("#confirm-phone").text(user_details.phone);
                $("#confirm-school").text(user_details.school);

                var dateString = "" + user_details.day + "/" + user_details.month + "/" + user_details.year;
                dateString = dateString + "   " + minutesToHourString(user_details.start_time);
                $("#confirm-date").text(dateString);
            } else if (current_step_id === "f1-step-3") {

            }

            parent_fieldset.fadeOut(400, function () {
                // change icons
                current_active_step.removeClass('active').addClass('activated').prev().addClass('active');
                // progress bar
                bar_progress(progress_line, 'right');
                // show next step
                $(this).next().fadeIn();
                // scroll window to beginning of the form
                scroll_to_class($('.f1'), 20);
            });
        }

    });

    // previous step
    $('.f1 .btn-previous').on('click', function () {
        // navigation steps / progress steps
        var current_active_step = $(this).parents('.f1').find('.f1-step.active');
        var progress_line = $(this).parents('.f1').find('.f1-progress-line');

        $(this).parents('fieldset').fadeOut(400, function () {
            // change icons
            current_active_step.removeClass('active').next().removeClass('activated').addClass('active');
            // progress bar
            bar_progress(progress_line, 'left');
            // show previous step
            $(this).prev().fadeIn();
            // scroll window to beginning of the form
            scroll_to_class($('.f1'), 20);
        });
    });

    // submit
    $('.f1').on('submit', function (e) {

        e.preventDefault();

        // fields validation
        $(this).find('input[type="text"], input[type="tel"], input[type="email"], input[type="number"], textarea').each(function () {
            if ($(this).val() == "") {
                e.preventDefault();
                $(this).addClass('input-error');
            }
            else {
                $(this).removeClass('input-error');
            }
        });
        if (!$("#confirm-checkbox").is(':checked')) {
            $("#confirm-checkbox-div").css("border", "1px solid red");
            return;
        } else {
            $("#confirm-checkbox-div").css("border", "");
        }
        // fields validation

        scheduleMeeting(function (res) {
            if (res["success"] === true) {
                $("#main-form").hide();
                $("#thank-you").show();
            } else {
                var errorMsg = res["message"];
                if (errorMsg === "a meeting with the following id number already exists") {
                    alert("לא ניתן לקבוע שתי פגישות לאותו התלמיד. אם ברצונכם לשנות את מועד הפגישה, יש תחילה לבטל את הרישום לפגישה המקורית, באמצעות הקישור המופיע במייל האישור שקיבלתם.");
                } else {
                    alert(errorMsg);
                }
            }
        });
    });

    // handle clicks on available hours
    $("#available-hours").on('click', '.available-hour, .selected-hour', function () {
        if ($(this).hasClass("available-hour")) {
            $(".selected-hour").each(function () {
                $(this).removeClass("selected-hour");
                $(this).addClass("available-hour");
            });

            $(this).addClass("selected-hour");
            $(this).removeClass("available-hour");

            user_details.start_time = parseInt($(this).attr("data-start-time"));
            user_details.end_time = user_details.start_time + 10;
        }
    });

    // initialization
    getAvailableMeetingsTime(function (res) {
        allMeetings = res["meetings"];
        var allAvailableDates = [];
        for (var i = 0; i < allMeetings.length; i++) {
            var mtg = allMeetings[i];
            var mtgDate = new Date(mtg["year"], mtg["month"] - 1, mtg["day"]);
            if ($.inArray(mtgDate, allAvailableDates) > -1) {
                continue;
            } else {
                allAvailableDates.push(mtgDate);
            }
        }

        // date picker
        var dpOpts = {
            numberOfMonths: 1,
            beforeShowDay: function (date) {
                var dayAvailable = false;
                for (var j = 0; j < allAvailableDates.length; j++) {
                    if (date >= allAvailableDates[j] && date <= allAvailableDates[j]) {
                        dayAvailable = true;
                        break;
                    }
                }
                return [dayAvailable, ''];
            },
            defaultDate: allAvailableDates[0],
            onSelect: function (dateText, inst) {
                var date = $(this).datepicker('getDate'),
                    day = date.getDate(),
                    month = date.getMonth(),
                    year = date.getFullYear();

                user_details.day = day;
                user_details.month = month + 1;
                user_details.year = year;

                displayAvailableHours(new Date(year, month, day));
            }
        };
        $("#datepicker").datepicker(dpOpts);

        displayAvailableHours(allAvailableDates[0]);

        user_details.day = allAvailableDates[0].getDate();
        user_details.month = allAvailableDates[0].getMonth() + 1;
        user_details.year = allAvailableDates[0].getFullYear();
    });

    // disable enter for form
    $(document).keypress(
        function (event) {
            if (event.which == '13') {
                event.preventDefault();
            }
        });

});