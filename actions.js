let timer;
let timerStatus = false;
let newPeriod = true;
let minutes = 12;
let seconds = 0;
let shotClock;
let shotClockStatus = false;
let shotClockSeconds = 0;
let team1Points = 0;
let team2Points = 0;
let team1Timeouts = 2;
let team2Timeouts = 2;
let team1Fouls = 0;
let team2Fouls = 0;
let period = 1;
let scoreboard;
let scoreboardWindow;
let remoteStatus = false;
let showButtons = false;

init();

function init() {
    // main
    updateText("titleDisplay", "titleInput");
    resetTimer(); resetShotClock(); checkButtonVisibility();
    initValueByElement('period', 1);
    // team 1
    updateText("team1NameDisplay", "team1Name");
    initValueByElement('team1Points', 0);
    initValueByElement('team1Timeouts', 2);
    initValueByElement('team1Fouls', 0);
    // team 2
    updateText("team2NameDisplay", "team2Name");
    initValueByElement('team2Points', 0);
    initValueByElement('team2Timeouts', 2);
    initValueByElement('team2Fouls', 0);
}

function checkButtonVisibility() {
    if (showButtons) {
        $(".sb-controls").show();
        $('#sbControlOff').show();
        $('#sbControlOn').hide();
    } else {
        $(".sb-controls").hide();
        $('#sbControlOff').hide();
        $('#sbControlOn').show();
    }
}

function reset() {
    init();
}

function initValueByElement(elementId, val) {
    const element = $("#" + elementId);
    if (element) {
        element.text(parseInt(val));
    }
}

function startTimer() {
    if (!timerStatus) {
        if (newPeriod) {
            newPeriod = false;
            getInputValues();
        }
        startShotClock();
        timer = setInterval(updateTimer, 1000);
        timerStatus = true;
    }
}

function getInputValues() {
    minutes = parseInt($("#minutesInput").val(), 10);
    seconds = parseInt($("#secondsInput").val()) || 0;
}

function pauseTimer() {
    timerStatus = false;
    clearInterval(timer);
    pauseShotClock();
}

function resetTimer() {
    timerStatus = false;
    newPeriod = true;
    clearInterval(timer);
    getInputValues();
    updateTimerDisplay();
}

function updateTimer() {
    if (seconds > 0) {
        seconds--;
    } else if (minutes > 0) {
        minutes--;
        seconds = 59;
    } else {
        clearInterval(timer);
    }
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const timerDisplay = $("#timer");
    timerDisplay.text(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    if (minutes === 0 && seconds === 0) {
        clearInterval(timer);
        playSound('buzzer');
    }
}

function startShotClock(resume) {
    if (!shotClockStatus) {
        if (shotClockSeconds === 0) shotClockSeconds = returnRefreshShotClockValue();
        shotClock = setInterval(updateShotClock, 1000);
        shotClockStatus = true;
    }
}

function pauseShotClock() {
    shotClockStatus = false;
    clearInterval(shotClock);
}

function resetShotClock() {
    shotClockStatus = false;
    clearInterval(shotClock);
    // shotClockSeconds = parseInt($("#shotClockInput").val()) || 24;
    shotClockSeconds = returnRefreshShotClockValue();
    updateShotClockDisplay();
}

function refreshShotClock() {
    shotClockSeconds = returnRefreshShotClockValue();
    updateShotClockDisplay();
    if (timerStatus) {
        if (shotClockStatus) {
            updateShotClock();
        } else {
            shotClock = setInterval(updateShotClock, 1000);
            shotClockStatus = true;
        }
    }
}

function updateShotClock() {
    if (shotClockSeconds > 0) shotClockSeconds--;
    updateShotClockDisplay();
}

function updateShotClockDisplay() {
    const shotClockDisplay = $("#shotClock");
    shotClockDisplay.text(`${shotClockSeconds}`);
    if (shotClockSeconds === 0) {
        clearInterval(shotClock);
        setTimeout(function() {
            // playSound('buzzer');
        }, 700);
        shotClockStatus = false;
    }
}

function timerLessThanShotClockSettings() {
    const curShotClockSettings = parseInt($("#shotClockInput").val()) || 24;
    return minutes === 0 && (seconds < curShotClockSettings);
}

function returnRefreshShotClockValue() {
    const curShotClockSettings = parseInt($("#shotClockInput").val()) || 24;
    if (timerLessThanShotClockSettings()) {
        return timerStatus ? seconds + 1 : seconds;
        // return seconds;
    } else {
        return timerStatus ? curShotClockSettings + 1 : curShotClockSettings;
        // return curShotClockSettings;
    }
}

function updatePoints(elementId, points) {
    const element = $("#" + elementId);
    if (element) {
        if (points === -1 && parseInt(element.text()) === 0) {
            // Avoid negative points
            return;
        }
        element.text(parseInt(element.text()) + points);
    }
}

function updateTimeout(elementId, value) {
    const element = $("#" + elementId);
    if (element) {
        const newValue = parseInt(element.text()) + value;
        if (newValue >= 0) {
            element.text(newValue);
        }
    }
}

function updateTeamFoul(elementId, value) {
    const element = $("#" + elementId);
    if (element) {
        const newValue = parseInt(element.text()) + value;
        if (newValue >= 0) {
            element.text(newValue);
        }
    }
}

function updatePeriod(value) {
    if (period > 0) {
        period += value;
        if (period < 1) period = 1;
        $("#period").text(period);
    }
}

function openScoreboard() {
   return scoreboardWindow = window.open('scoreboard.html', 'secondary');
}

function startScoreboard() {
    if (scoreboardWindow) {
        scoreboard = setInterval(updateScoreboard, 250);
    }
    else alert('Scoreboard is not up yet');
}

function updateScoreboard() {
    if (scoreboardWindow) {
        const titleDisplay = $("#titleDisplay").text();
        const timerDisplay = $("#timer").text();
        const shotClockDisplay = $("#shotClock").text();
        const periodDisplay = $("#period").text();
        const team1 = {
            name: $("#team1NameDisplay").text(),
            score: $("#team1Points").text(),
            timeouts: $("#team1Timeouts").text(),
            fouls: $("#team1Fouls").text()
        }
        const team2 = {
            name: $("#team2NameDisplay").text(),
            score: $("#team2Points").text(),
            timeouts: $("#team2Timeouts").text(),
            fouls: $("#team2Fouls").text()
        }
        const myCurVals = {titleDisplay, timerDisplay, shotClockDisplay, periodDisplay, team1, team2};
        scoreboardWindow.postMessage(myCurVals, '*');
    } else {
        alert('Scoreboard is not up yet')
    }
}

function updateText(elementId, inputId) {
    const element = $("#" + elementId);
    const inputElement = $("#" + inputId);
    if (element && inputElement) {
        element.text(inputElement.val());
    }
}

// Update title & team names on input change
$("#titleInput").on("input", function() {
    updateText("titleDisplay", "titleInput");
});

$("#team1Name").on("input", function () {
    updateText("team1NameDisplay", "team1Name");
});

$("#team2Name").on("input", function () {
    updateText("team2NameDisplay", "team2Name");
});

function playSound(who) {
    const audio = $("#" + who)[0];
    audio.play();
}

function turnOnRemote() {
    $('#remoteOn').hide();
    $('#remoteOnIcon').show();
    $('#remoteOff').show();
    $('#remoteOffIcon').hide();
    remoteStatus = true;
}

function turnOffRemote() {
    $('#remoteOn').show();
    $('#remoteOnIcon').hide();
    $('#remoteOff').hide();
    $('#remoteOffIcon').show();
    remoteStatus = false;
}

function showSbControls() {
    showButtons = true;
    checkButtonVisibility();
}

function hideSbControls() {
    showButtons = false;
    checkButtonVisibility();
}

$(document).ready(function() {
    $('#remoteOff').hide();
    $('#remoteOnIcon').hide();
    $(document).keypress(function(e) {
        const pressed = e.which;
        if (remoteStatus) {
            // MAIN CONTROLS
            if (pressed === 48) { refreshShotClock(); } // refresh shot clock
            if (pressed === 46) { pauseTimer(); } // pause timer
            if (pressed === 45) { startTimer(); } // start timer
            if (pressed === 53) { updatePeriod(1); } // period +1
            if (pressed === 54) { resetTimer(); } // reset timer
            if (pressed === 52) { playSound('buzzer'); } // play sound buzzer
            // SECONDARY WINDOW CONTROLS
            if (pressed === 47) { openScoreboard(); } // open scoreboard
            if (pressed === 42) { startScoreboard(); } // update scoreboard
            // START OF TEAM 1 CONTROLS
            if (pressed === 13) { updatePoints('team1Points', 1); } // team1 points +1
            if (pressed === 51) { updatePoints('team1Points', -1) } // team1 points -1
            if (pressed === 49) { updateTeamFoul('team1Fouls', 1); } // team1 fouls +1
            if (pressed === 50) { updateTimeout('team1Timeouts', -1); } // team1 timeouts -1
            // START OF TEAM 2 CONTROLS
            if (pressed === 43) { updatePoints('team2Points', 1); } // team2 points +1
            if (pressed === 57) { updatePoints('team2Points', -1); } // team2 points -1
            if (pressed === 55) { updateTeamFoul('team2Fouls', 1); } // team2 fouls +1
            if (pressed === 56) { updateTimeout('team2Timeouts', -1); } // team2 timeouts -1
        }
    })
})
