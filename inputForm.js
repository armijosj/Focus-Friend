class chatBox {
    constructor() {
        this.args = {
            goalButton: document.querySelector("#goalButton"),
            sessionButton: document.querySelector("#taskButton"),
            breakButton: document.querySelector("#breakButton"),

            goalForm: document.querySelector(".chatBox__createGoal"),
            sessionForm: document.querySelector(".chatBox__startSession"),
            breakForm: document.querySelector(".chatBox__break"),

            goalCancelBtn: document.querySelector(".createGoalBtngrp button"),
            sessionCancelBtn: document.querySelector(".startSessionBtnGrp button"),
            breakCancelBtn: document.querySelector(".breakBtnGrp button"),

            goalAddBtn: document.querySelector("#goalFormSubmit"),
            sessionAddBtn: document.querySelector("#sessionFormSubmit"),
            breakAddBtn: document.querySelector("#breakFormSubmit")
        }

        this.eventList = [];
        this.goalsList = [];
        this.sessionList = [];
        this.messageList = [];

        //Add default goals and session
        let defaultGoal = new Goal();
        this.goalsList.push(defaultGoal);
        this.updateGoalSelection(defaultGoal);

        this.breakState = 0;
        this.firstSession = true;

        //set first session to the default session
        let currDate = new Date(); 
        let newSession = new Session("Default", 60*20, this.goalsList[0], currDate);
        defaultGoal.addSession(newSession);
        this.eventList.push(newSession);
        this.sessionList.push(newSession);
        this.currentSessionInProgress = newSession;  // current session user is working on
    }

    display() {
        const startButton = document.getElementById("startStop");
        const skipButton = document.getElementById("skip");
        
        const { goalButton, goalForm,
            sessionButton, sessionForm,
            breakButton, breakForm
            , goalCancelBtn, sessionCancelBtn, breakCancelBtn,
            goalAddBtn, sessionAddBtn, breakAddBtn } = this.args;

        window.addEventListener('load', () => {
            this.addMessageTime();
            this.createMessage("Hi there! I'm your Focus Friend and I'm here to help you stay on track.");
            this.createMessage("<b>Start a session</b> when you need to focus and you'll earn points to unlock items in your <b>inventory</b>!");
            this.createMessage("If you want to track your data, <b>add goals</b> that you can work towards!");
            this.createMessage("...and remember, take regular <b>breaks</b>!");
        })

        goalButton.addEventListener('click', () => {
            this.changeState(goalForm);
            goalButton.disabled = true;

            if(!(breakButton.disabled && statusTimer == "started" && isOnBreak))
                breakButton.disabled = false;
            if(!(sessionButton.disabled && statusTimer == "started" && !isOnBreak))
                sessionButton.disabled = false;
        });

        sessionButton.addEventListener('click', () => {
            this.changeState(sessionForm);
            goalButton.disabled = false;

            if(!(breakButton.disabled && statusTimer == "started" && isOnBreak))
                breakButton.disabled = false;
                
            sessionButton.disabled = true;
        });

        breakButton.addEventListener('click', () => {
            this.changeState(breakForm);
            goalButton.disabled = false;
            breakButton.disabled = true;

            if(!(sessionButton.disabled && statusTimer == "started" && !isOnBreak))
                sessionButton.disabled = false;
        });

        goalCancelBtn.addEventListener('click', () => {
            this.hideAll();
            goalButton.disabled = false;
        });

        sessionCancelBtn.addEventListener('click', () => {
            this.hideAll();
            sessionButton.disabled = false;
        });

        breakCancelBtn.addEventListener('click', () => {
            this.hideAll();
            breakButton.disabled = false;
        });

        goalAddBtn.addEventListener('click', () => {

            let goalFormInfo = $('.chatBox__createGoal form').serializeArray();
            let goalTitle = goalFormInfo[0].value;
            let goalDurationH = Number(goalFormInfo[1].value);
            let goalDurationM = Number(goalFormInfo[2].value);

            if(goalTitle.length <= 0) {
                alert("Please enter a goal name.");
            }
            else if ((goalDurationM < 0 || goalDurationM > 60)) { // if hours = 0 and value for minutes is not valid
                alert("Please enter a value between 1 and 60 for Minutes.");
            }
            else if (goalDurationH <= 0 && goalDurationM <= 0) { // if minutes = 0 and hours = 0
                alert("Please enter a value greater than 0 for Hours or Minutes.");
            }
            else {
                let duplicate = false;  // check if goal name is a duplicate
                for(let x of this.goalsList) {
                    if(x.title === goalTitle) {
                        duplicate = true;
                        break;
                    }
                }
                if(duplicate) {
                    alert('"' + goalTitle + '" is already taken. Please enter an unique goal name.');
                } else {
                    companionTalking(); 
                    this.addMessageTime();
                    
                    this.createMessage(
                        "Your goal, <b>" + goalTitle + "</b>, has been created. You must do <b>" + goalDurationH + " hours and " + goalDurationM + " minutes </b> of sessions to complete your goal.");
                        //"New Goal: " + goalTitle + " Created. Duration: " +
                        //goalDurationH + " H and " + goalDurationM + " M");
                    let newGoal = new Goal(goalTitle, 60*(goalDurationH * 60 + goalDurationM));
                    this.eventList.push(newGoal);
                    this.goalsList.push(newGoal);

                    this.updateGoalSelection(newGoal);

                    goalButton.disabled = false;
                    //hide form after
                    this.hideAll();
                }
            }
        });

        sessionAddBtn.addEventListener('click', () => {
            let sessionFormInfo = $('.chatBox__startSession form').serializeArray();
            let sessionGoalElement = document.querySelector('.chatBox__startSession select');
            let goalIndex = sessionGoalElement[sessionGoalElement.selectedIndex].id;
            let sessionTitle = sessionFormInfo[0].value;
            let sessionDuration = Number(sessionFormInfo[1].value);
            let sessionGoal = this.goalsList[goalIndex];

            if (sessionDuration <= 0 || sessionDuration > 60) {
                alert("Please enter a value between 1 and 60 for Minutes.");
            } else {
                if(sessionTitle.length <= 0) {
                    sessionTitle = "No name";
                }  
                if(this.firstSession || (confirmNewSession())) {
                    companionTalking(); 
                    this.addMessageTime();

                    this.createMessage(
                        "Your session, <b>" + sessionTitle + "</b>, has been set for <b>" + sessionDuration + " minutes</b> under your goal called <b>" + sessionGoal.title + "</b>."

                    // "New Session: " + sessionTitle + " created. Duration: " + sessionDuration +
                    // " min. Relative Goal: " + sessionGoal.title
                    );
                    
                    let currDate = new Date(); 
                    let newSession = new Session(sessionTitle, 60*sessionDuration, sessionGoal, currDate);
                    sessionGoal.addSession(newSession);
                    this.eventList.push(newSession);
                    this.sessionList.push(newSession);
                    this.currentSessionInProgress = newSession;
                    
                    sessionButton.disabled = true;
                    this.hideAll();

                    TSSoverlayEffect.style.width = "0%"; //reset progress bar

                    if (skipButton.disabled) {
                        skipButton.disabled = false;
                        startButton.disabled = false;
                    }

                    if(breakButton.disabled)
                        breakButton.disabled = false; 

                    //update timer
                    //skipTime();
                    updateTimeSession(sessionDuration);
                    startStop("restart");     //automatically start timer (if timer is already running, restart and play the timer)

                    //update left box
                    document.getElementById("currGoal").innerHTML = "Current Goal: "+sessionGoal.title;
                    document.getElementById("currSession").innerHTML = "Current Session: " + sessionTitle;

                    this.firstSession = false;
                }
            }
        });

        breakAddBtn.addEventListener('click', () => {
            let breakFormInfo = $('.chatBox__break form').serializeArray();

            let breakDuration = breakFormInfo[0].value;

            if (breakDuration <= 0 || breakDuration > 60) {
                alert("Please enter a value between 1 and 60 for Minutes.");
            } else {
                companionTalking(); 
                this.addMessageTime();
                this.createMessage(
                    "Your break has started and will last for <b>" + breakDuration + " minutes</b>."
                );
                breakButton.disabled = false;
                this.hideAll();

                TSSoverlayEffect.style.width = "0%"; //reset progress bar

                //update time
                (seconds != 0) ? savedSec = seconds : savedSec = initialSec; //save current pgoress time
                updateTimeBreak(breakDuration);
                startStop("restart");            //automatically start timer (if timer is already running, restart and play the timer)
                
                if (skipButton.disabled) {
                    skipButton.disabled = false;
                    startButton.disabled = false;
                }

                if(sessionButton.disabled)
                    sessionButton.disabled = false; 

                this.createBreakMsg(this.breakState);
                this.breakState = (this.breakState+1)%3;
                
            }
        });
    }

    createBreakMsg(breakState) {

        switch (breakState) {
            //cat video
            case 0: 
                this.createMessage("Need a laugh? Watch this funny cat video on your break!");
                this.createMessage("<iframe width=\"100%\" src=\"https://www.youtube.com/embed/ByH9LuSILxU\"> </iframe>");
                break;

            //breathing/meditation video
            case 1: 
                this.createMessage("Need to relax? Watch this mini meditation video!");
                this.createMessage("<iframe width=\"100%\" src=\"https://www.youtube.com/embed/cEqZthCaMpo\"> </iframe>");
                break;

            //stretching video
            case 2:
                this.createMessage("Take a break and stretch! Watch this short video about stretching at your desk!");
                this.createMessage("<iframe width=\"100%\" src=\"https://www.youtube.com/embed/KBaSGF6kYqw\"> </iframe>");
                break;
        }

    }

    updateGoalSelection(goal) {
        let goalSelection = document.querySelector(".goalRelatedSession select");
        let newOption = document.createElement("option");
        newOption.id = this.goalsList.length - 1;
        newOption.innerHTML = goal.title;
        newOption.value = goal.title;
        goalSelection.appendChild(newOption);
    }

    createMessage(text) {
        let msgBox = document.querySelector(".chatBox__msgBox");
        let message = document.createElement('p');
        message.innerHTML = text;
        msgBox.appendChild(message);
        this.updateMsgColour();
        // Scroll Down with Chat
        $(".chatBox").stop().animate({ scrollTop: $(".chatBox")[0].scrollHeight }, 1000);
    }

    addMessageTime() {
        let msgBox = document.querySelector(".chatBox__msgBox");
        let message = document.createElement('div');
        message.className = 'chatMsgDate';
        let currTime = new Date(); 
        message.innerHTML = currTime.toString().slice(0, 24); 
        msgBox.appendChild(message);
        // Scroll Down with Chat
        $(".chatBox").stop().animate({ scrollTop: $(".chatBox")[0].scrollHeight }, 1000);
    }

    changeState(form) {
        this.hideAll();
        form.style.display = "flex";
        $(".chatBox").stop().animate({ scrollTop: $(".chatBox")[0].scrollHeight }, 1000);
    }

    hideAll() {
        const { goalForm, sessionForm, breakForm } = this.args;
        goalForm.style.display = "none";
        sessionForm.style.display = "none";
        breakForm.style.display = "none";
    }

    updateMsgColour() {
        let messages = document.getElementById("mainChatBox").getElementsByTagName("P");
        let max = 255;  
        let min = 205;
        let msgClr = max;

        for(let i = messages.length - 1; i >= 0; i--) {
            // experiment with this to get diff colours
            // messages[i].style.backgroundColor = "rgb(" + (msgClr - 30) + "," + (msgClr - 4) + "," + (msgClr - 2) + ")"; // blue-ish
            messages[i].style.backgroundColor = "rgb(" + (msgClr - 5) + "," + (msgClr - 5) + "," + (msgClr - 5) + ")"; // grey
            msgClr = min + (i/messages.length) * (max-min);
            console.log(i + " " + msgClr); //debugging
        }
    }
}

const cb = new chatBox();
cb.display();

// Prevent Submitting Form
$(".chatBox__createGoal form").submit(function (e) {
    e.preventDefault();
});

$(".chatBox__startSession form").submit(function (e) {
    e.preventDefault();
});

$(".chatBox__break form").submit(function (e) {
    e.preventDefault();
});

// -------------- Start of Timer Code -------------- //
const TBBtext = document.querySelector('.TBBtext');
const timer = document.querySelector("#timer h1");
let timerSessionState = document.querySelector('.timerSessionState h2');
let TSSoverlayEffect = document.querySelector('.TSSoverlay');
let initialSec = 20 * 60;   //intially at 20 min.
let breakSecond = 5 * 60;   //initially at 5 min.
let seconds = initialSec; //take same initial 20 seconds.
let statusTimer = "stopped";  //initially it will be paused
let isOnBreak = false;        //it will be on task when first opened.
let savedSec = initialSec;    //keep track of the last time set

let interval = null;
displayTime(seconds);

// In this function we will update the time when the user clicks on the timer.
function updateTimeEntered() {
    let str = timer.innerHTML;
    let newMin = parseInt(str.substr(0, str.indexOf(":")));
    let newSec = parseInt(str.substr(str.indexOf(":") + 1));

    if (Number.isNaN(newMin) || Number.isNaN(newSec)) {
        alert("A number is required of the form min:sec");
    } else if (newMin < 0 || newSec < 0 || newMin > 60 || newSec > 60) {
        alert("The numbers should be from 0 to 60.");
    } else {
        //if timer hasn't been changed, don't do anything
        if(seconds != newMin * 60 + newSec) {
            TSSoverlayEffect.style.width = "0%"; //reset progress bar
            seconds = newMin * 60 + newSec;  //calculate seconds
            isOnBreak ? breakSecond = seconds : initialSec = seconds;
        }
    }
    savedSec = seconds;
    displayTime(seconds);
}

function updateTimeSession( min ) {
    isOnBreak = false;
    seconds = min * 60;
    initialSec = seconds;
    displayTime(seconds);
}

function updateTimeBreak( min ) {
    isOnBreak = true;
    seconds = min*60;
    breakSecond = seconds;
    displayTime(seconds);
}

function scale(number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

//Function will be called repeatedly until a pause or skip button is pressed or time is 0.
function startTimer() {
	updateProgressBar();
    seconds--;
    displayTime(seconds);
    if(!isOnBreak)
        if(cb.currentSessionInProgress)
            cb.currentSessionInProgress.incrementElapsedTime();
    if (seconds == 0 || seconds < 1) {  //time runs out
        seconds = 0;
        alarm();
        skipTime();
    }
}

function updateProgressBar() {
    let widthRange = isOnBreak ? scale(breakSecond - seconds, 0, breakSecond, 0, 100) : scale(initialSec - seconds, 0, initialSec, 0, 100);
	isOnBreak ? TBBtext.innerHTML = "Break" : TBBtext.innerHTML = "Session"
    TSSoverlayEffect.style.width = widthRange + "%";
}

function startStop(desiredState) {
    //change timer from stopped to started
    if (statusTimer === "stopped" || desiredState === "restart") {    
        //if timer was already running, restart the interval to prevent it from increasing 
        if(desiredState === "restart")
            window.clearInterval(interval); 
        //Start the timer (by calling the setInterval() function)
        interval = window.setInterval(startTimer, 1000);
        document.querySelector("#startStop i").className = "fas fa-pause";
        statusTimer = "started";
        if(!isOnBreak)
            document.querySelector("#taskButton").disabled = true; // disable session button while timer is running
        else
            breakButton.disabled = true;

        timer.contentEditable = "false";

        //count initial default session as the first session if user hits play
        cb.firstSession = false; 

    //change timer from started to stopped
    } else {
        window.clearInterval(interval); 
        document.querySelector("#startStop i").className = "fas fa-play";
        statusTimer = "stopped";
        if(!isOnBreak)  
            document.querySelector("#taskButton").disabled = false; // re-enable session button if timer is paused
        else
            breakButton.disabled = false;

        timer.contentEditable = "true";     //allow user to edit timer if paused
    }
}

function skipTime() {
    TSSoverlayEffect.style.width = "0%";
    isOnBreak ? isOnBreak = false : isOnBreak = true; //checks if it comes another task or another break.

    if (isOnBreak) {
        (seconds != 0) ? savedSec = seconds : savedSec = initialSec;     //save progress on session so user can return to it after break is done
        seconds = breakSecond; 
        timerSessionState.innerHTML = "On Break";
        document.querySelector("#taskButton").disabled = false; // enable session button again when time is skipped
    } else {
        seconds = savedSec;     //if break is done, return user to previous session progress 
        timerSessionState.innerHTML = "Working";
        breakButton.disabled = false;
    }
    displayTime(seconds);
    updateProgressBar();
    statusTimer = "started";
    startStop();
    timer.contentEditable = "true";
}

// Function to display the time
function displayTime(second) {
    updateProgressBar();
    const min = Math.floor(second / 60);
    const sec = Math.floor(second % 60);
    timer.innerHTML = `
  ${min < 10 ? "0" : ""}${min}:${sec < 10 ? "0" : ""}${sec}
  `;
}

function confirmSkip() {
    if (document.getElementById("toggleAlert").checked) {
        if (confirm("Your remaining progress time will not be saved. Are you sure you want to skip?")) {
            skipTime();
            return true;
        } else {
            //Uncomment this if you want to pause after canceling skip.
            // startStop();
        }
    } else {
        skipTime();
    }
}

function confirmSkipBreak() {
    if (document.getElementById("toggleAlert").checked) {
        if (confirm("Your remaining progress time will not be saved. Are you sure you want to start a new break?")) {
            skipTime();
            return true;
        } else {
            //Uncomment this if you want to pause after canceling skip.
            // startStop();
        }
    } else {
        skipTime();
    }
}

function confirmNewSession() {
    if (document.getElementById("toggleAlert").checked) {
        return (confirm("Your current session will be overwritten if you continue. Are you sure you want to start a new session?"));
    } else {
        return true;
    }
}

function alarm(){
    let alarmSound = new Audio('alarm.mp3');  // play alarm (source: https://freesound.org/people/kwahmah_02/sounds/250629/)
    alarmSound.load();
    alarmSound.volume = document.getElementById("volumeSlider").value/100;   //set volume of the alarm.
    if (document.getElementById("toggleSound").checked){ //checks settings.
        alarmSound.play();
    }
}

// -------------- End of Timer Code -------------- //

// ---- Start of Goal Page Code ---- //

let goals = cb.goalsList;  // list of Goal objects
let events = cb.eventList;

var goalsNavButton = document.querySelector(".navBar__item--goals");
var goalsPage = document.querySelector(".goalsBody");

goalsNavButton.addEventListener("click", setUpGoals);

const arrowDownSymbol = '<i class="fas fa-arrow-down"></i>';
const menuSymbolCircles= '<i class="fas fa-ellipsis-v"></i>';
const menuSymbolBars = '<i class="fas fa-bars"></i>';

// creates some data to show on goal page. feel free to add or change anything.
function createRandomData() {
    let randomGoalNames = ["COMP 3380", "COMP 2080", "MATH 1700", "COMP 3020", "MATH 1300"];
    let randomSessionNames = [["Assignment 1", "Test 1", "Assignment 2"], ["Test 1", "Quiz 2"],
    ["Assignment 1", "Assignment 2"], ["Work on web application :)"], ["Test 1"]];
    let randomGoalDuration = [60, 60, 65, 40, 157];
    let randomSessionDurations = [[25, 28, 35], [37, 20], [20, 60], [40], [35]];
    let randomSessionElapsedTime = [[13, 18, 35], [37, 18], [20, 5], [40], [5]];
    //Date(year, month, date, hour) 
    let randomDates = [[new Date(2021, 10, 10, 13), new Date(2021,10,10,13), new Date(2021,11,9,16)], [new Date(2021,11,9,14), new Date(2021,11,6,9)], [new Date(2021,11,5,20), new Date(2021,11,4,18)], [new Date(2021,11,10,14)], [new Date(2021,11,2,16)]];
    let numGoals = 5, numSessions;
    let newGoal, newSession;

    for (let i = 0; i < numGoals; i++) {
        newGoal = new Goal(randomGoalNames[i], 60*randomGoalDuration[i]);

        numSessions = randomSessionNames[i].length;
        for (let j = 0; j < numSessions; j++) {
            today.setHours(Math.floor(Math.random()*24)); 
            newSession = new Session(randomSessionNames[i][j], 60*randomSessionDurations[i][j], newGoal, randomDates[i][j]);
            newSession.updateSession(60*randomSessionElapsedTime[i][j]);
            newGoal.addSession(newSession);
        }

        goals.push(newGoal);
        events.push(newGoal);
        cb.updateGoalSelection(newGoal);
    }
}
createRandomData(); // insert random data

// builds the list of goals
function setUpGoals() {
    let goalDiv, sessionsList, progress, progressVal, currGoal;
    let goalID, goalButtonID, sessionID;
    
    // start at i = 1 so we avoid creating a div for Default goal
    for (let i = 1; i < goals.length; i++) {

        goalID = 'goal' + i;
        goalDiv = document.getElementById(goalID);          // find div representing a goal on goals page
        currGoal = goals[i];
        sessionID = 'goal' + i + 'sessions';

        if(!goalDiv) { 
            goalDiv = document.createElement("div");        // create new div element to represent that goal
            goalDiv.className = 'goal';
            goalDiv.id = goalID;

            // create goal label
            goalButtonID = 'goalbutton' + i;
            goalDiv.innerHTML = '<input class="goal-button" id="' + goalButtonID + '" type="checkbox"></input>';
            goalDiv.innerHTML += '<label class="goal-label" for="' + goalButtonID + '"><div class="goalname"><p>'
                + currGoal.title + '</p></div>' + '<div class="goalprogress" id="goalprogress' + i + '"></div></label>';
            
            // create progress bar
            goalDiv.innerHTML += '<div class="progressbar-container"><div class="progressbar" id="progressbar' + i + '"></div>' + '</div>';

            sessionsList = document.createElement("ul");   // create unordered list to store sessions
            sessionsList.className = 'sessionlist';
            sessionsList.id = sessionID;
            goalDiv.appendChild(sessionsList);             // add list to goal div
            goalsPage.appendChild(goalDiv);                // add goal div to goals page
        }

        // check if list of sessions for each goal needs to be updated with new values
        sessionsList = document.getElementById(sessionID);   // get list of sessions for current goal
        updateTaskList(currGoal, i, sessionsList);
        updateGoalProgress(currGoal, i);                    // update progress values
    }
}

function updateGoalProgress(currGoal, goalIndex) {
    let progressVal = getGoalProgress(currGoal); // calculate progress of a goal

    // update goal progress and goal percentage in goal label
    document.getElementById('goalprogress' + goalIndex).innerHTML = '<h1>' + convertToTimeFormat(currGoal.calculateElapsedTime(), currGoal.duration) + 
    '&nbsp(' + progressVal + '%)&nbsp</h1>' + menuSymbolBars;

    // update goal progress bar width
    document.getElementById('progressbar' + goalIndex).style.width = progressVal + '%';
}

function updateTaskList(currGoal, currGoalIndex, sessionsList) {
    let listItem, currSession, sessionID, sessionProgress;

    let goalSessions = currGoal.getListOfSessions();      // grab array of sessions associated with current goal

    for (let i = 0; i < goalSessions.length; i++) {  // go through array of sessions
        sessionID = 'goal' + currGoalIndex + 'session' + i;
        currSession = document.getElementById(sessionID);

        if (!currSession) {                                // only create new task if it hasn't been created
            currSession = goalSessions[i];
            listItem = document.createElement("li");      // create list item for new task
            listItem.id = sessionID;
            listItem.className = 'session-items';
            // store name and duration of task in list item
            listItem.innerHTML = '<li class="taskname">' + currSession.title + '</li><li class="timeval" id="' + sessionID + 'progress' 
                + i + '">' + convertToTimeFormat(currSession.elapsedTime, currSession.duration) + '</li>';
            sessionsList.insertBefore(listItem, sessionsList.childNodes[goalSessions.length-1]);
        }
        else {
            sessionProgress = document.getElementById(sessionID + 'progress' + i);
            sessionProgress.innerHTML = convertToTimeFormat(goalSessions[i].elapsedTime, goalSessions[i].duration);
        }
    }
    setUpSummary('goaltimespent', 'Time spent on goal:', currGoalIndex, Number(currGoal.calculateElapsedTime()), sessionsList);
    setUpSummary('goaltimeleft', 'Time remaining:', currGoalIndex, Number(currGoal.calculateTimeRemaining()), sessionsList);
    setUpSummary('goaltotaltime', 'Goal duration:', currGoalIndex, Number(currGoal.duration), sessionsList);
}

function setUpSummary(summaryType, message, currGoalIndex, time, dropDownList) {
    let timeToDisplay = convertSecToFormat(time);
    let listItem = document.getElementById(summaryType + currGoalIndex);

    if (!listItem) {    // create list item if it doesn't exist
        listItem = document.createElement("li");
        listItem.className = 'goalSummary ' + summaryType;  // leave space between
        listItem.innerHTML = '<li>' + message + '</li><li class="timeval" id="' 
            + summaryType + currGoalIndex + '">' + timeToDisplay + '</li>';
        dropDownList.appendChild(listItem);
    }
    else {    // if element exists, update the time value
        document.getElementById(summaryType + currGoalIndex).innerHTML = timeToDisplay;
    }
}

function getGoalProgress(goal) {
    return Math.floor((goal.calculateElapsedTime() / goal.duration) * 100);
}

// takes two times given in minutes and turns it into the format '0:16:00/0:25:00'
function convertToTimeFormat(elapsedTime, totalTime) {
    return convertSecToFormat(elapsedTime) + '/' + convertSecToFormat(totalTime);
}

function convertSecToFormat(timeInSecs) {
    let date = new Date(0);
    let secsIn24hrs = 60*60*24;
    let formattedStr = "";

    if(timeInSecs < secsIn24hrs) {    // less than 24 hours
        date.setSeconds(timeInSecs);
        formattedStr = date.toISOString().substr(11, 8);
    }
    else {  // greater than or equal to 24 hours
        let remainder = timeInSecs - secsIn24hrs;
        let fullDays = 1;
        while(remainder > secsIn24hrs) {
            fullDays++;
            remainder -= secsIn24hrs;
        }
        date.setSeconds(remainder);
        formattedStr = date.toISOString().substr(11, 8);
        formattedStr = ((fullDays * 24) + parseInt(formattedStr.substr(0, 2))) + formattedStr.substr(2, 6);
    }
    return formattedStr;
}

// -------------- Start of Trends Code -------------- //

let dailyChartData = []; 
let weeklyChartData = []; 
let monthlyChartData = []; 

let datePicker = document.querySelector("#trends--datePicker");

$("#datepicker").datepicker({ 
    maxDate: 0, 
    changeMonth: true,
    changeYear: true,
    showButtonPanel: true,
    
    onSelect: function(value, date) { 
        var month = value.toString().substr(0, 2) - 1; 
        var date = value.toString().substr(3, 2); 
        var year = value.toString().substr(6, 4); 

        if(currChart.id == "weeklyChart") {
            currWeek = new Date(year,month,date);
            datePicker_Weekly();
        }
        else if(currChart.id == "dailyChart") {
            currDate = new Date(year,month,date);
            datePicker_Daily();
        }
        else if(currChart.id == "monthlyChart") {
            currMonth = new Date(year,month,date);
            datePicker_Monthly();
        }
    } 
});

var btn = document.getElementById("datePickerButton");
var span = document.getElementsByClassName("close")[0];
var popup = document.getElementById("myPopup");

function toggleCalendar() {
    if(popup.style.visibility == "hidden") {
        popup.style.visibility = "visible";
    } else
        popup.style.visibility = "hidden";
}

function hideCalendar() {
    popup.style.visibility = "hidden";
}

function updateDailyChart() {

    let goals = cb.goalsList;
    let totalStudyTime = 0;
    let count = 0;

    dailyChartData = [];    //empty the chart data 

    goals.forEach(element => {                      
        let sessions = element.listOfSession;      //get the goal's list of sessions 
        let hoursArray = new Array(24);            //each element of the array represents an hour of the day
        let numSessions = 0; 

        //add sessions to the chart if the session's date is the same as the date being viewed on the chart
        sessions.forEach(session => {                
            if(session.date.getDate() == currDate.getDate() && session.date.getMonth() == currDate.getMonth() && session.date.getYear() == currDate.getYear()) {
                let currTime = parseFloat(hoursArray[session.date.getHours()]);
                let sessionElapsedtime = parseFloat((((session.elapsedTime/60)/60)).toFixed(2));

                if(sessionElapsedtime > 0)
                    if(currTime)
                        hoursArray[session.date.getHours()] = currTime + sessionElapsedtime;     //assign the session's elapsed time to the associated hour in the array
                    else {
                        hoursArray[session.date.getHours()] = sessionElapsedtime; 
                        count++;
                        numSessions++;
                    }

                totalStudyTime+=(session.elapsedTime/60);
                
            }
        });
    
        if(numSessions > 0)
            //add goal to the chart 
            dailyChartData.push({label: element.title, backgroundColor: element.color, data: hoursArray}); 
        
    });

    //check for divide by zero error and update the summary box
    if(count!=0)
        updateSummaryBox(totalStudyTime, totalStudyTime/count, "daily");
    else 
        updateSummaryBox(totalStudyTime, 0, "noData");
}

function updateMonthlyChart() {
  
    let goals = cb.goalsList;
    
    let daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31];
    let totalStudyTime = 0;
    let count = 0;

    monthlyChartData = [];  //empty the chart data 

    goals.forEach(element => {
        let sessions = element.listOfSession;                                   //get the goal's list of sessions 
        let monthArray = new Array(daysInMonth[currMonth.getMonth() - 1]);      //each element of the array represents a day of the month
        let numSessions = 0; 

        //add sessions to the chart if the session's month is the same as the month being viewed on the chart
        sessions.forEach(session => {
            if(session.date.getMonth() == currMonth.getMonth() && session.date.getYear() == currMonth.getYear()) {
                let currTime = parseFloat(monthArray[session.date.getDate()-1]);
                let sessionElapsedtime = parseFloat((session.elapsedTime/60)/60);

                if(sessionElapsedtime > 0)
                    if(currTime)
                        monthArray[session.date.getDate()-1] = currTime + sessionElapsedtime; 
                    else {
                        monthArray[session.date.getDate()-1] = sessionElapsedtime;   //assign the session's elapsed time to the associated date in the array
                        count++;
                        numSessions++;
                    }
                    
                totalStudyTime+=sessionElapsedtime;
            }
        });
        
        //add goal to the chart 
        if(numSessions > 0)
            monthlyChartData.push({label: element.title, backgroundColor: element.color, data: monthArray});
    });

    //check for divide by zero error and update the summary box
    if(count!=0)
        updateSummaryBox(totalStudyTime, totalStudyTime/count, "monthly");
    else 
        updateSummaryBox(totalStudyTime, 0, "noData");
}


function updateWeeklyChart() {
  
    let goals = cb.goalsList;
    let totalStudyTime = 0;
    let count = 0;
    let today = new Date();

    weeklyChartData = [];   //empty the chart data 

    goals.forEach(element => {
        let sessions = element.listOfSession;   //get the goal's list of sessions 
        let weekArray = new Array(7);           //each element of the array represents a day of the week
        let numSessions = 0;

        //create a temporary date to compare against and check if the session's date is in the right week
        var tempDateMax = new Date();
        tempDateMax = setDate(tempDateMax, currWeek.getDate(), currWeek.getMonth(), currWeek.getFullYear());
        tempDateMax.setDate(tempDateMax.getDate()+7);

        //add sessions to the chart if the session's date is within the week being viewed on the chart
        sessions.forEach(session => {
            if(session.date >= currWeek && session.date <= tempDateMax) {
                let elementNum = 7 - (tempDateMax.getDate() - session.date.getDate()); 
                let currTime = parseFloat(weekArray[elementNum]);
                let sessionElapsedtime = parseFloat(((session.elapsedTime/60)/60).toFixed(2));

                if(sessionElapsedtime > 0)
                    if(currTime)
                        weekArray[elementNum] = currTime + sessionElapsedtime;   //assign the session's elapsed time to the associated day of the week in the array
                    else {
                        weekArray[elementNum] = sessionElapsedtime;
                        count++;
                        numSessions++;
                    }

                totalStudyTime+=((session.elapsedTime/60)/60); 
            }
        });
        
        //add goal to the chart 
        if(numSessions>0)
            weeklyChartData.push({label: element.title, backgroundColor: element.color, data: weekArray});
    });

    //check for divide by zero error and update the summary box
    if(count!=0)
        updateSummaryBox(totalStudyTime, totalStudyTime/count, "weekly");
    else 
        updateSummaryBox(totalStudyTime, 0, "noData");

}

function updateSummaryBox(totalStudyTime, avgStudyTime, state) {
    var totalStudyTimeTxt = document.getElementById('summaryBox').rows[0].cells[1];
    var avgStudyTimeTxt = document.getElementById('summaryBox').rows[1].cells[1];

    if(state == "weekly" || state == "monthly") {
        totalStudyTimeTxt.innerHTML = Math.floor(totalStudyTime) + " hours and " + Math.floor((totalStudyTime - Math.floor(totalStudyTime))*60) + " minutes";
        avgStudyTimeTxt.innerHTML = Math.floor(avgStudyTime) + " hours and " + Math.floor((avgStudyTime - Math.floor(avgStudyTime))*60) + " minutes";
    } else if(state == "daily"){
        var avgStudyTimeLabel = document.getElementById('summaryBox').rows[1].cells[0];
        avgStudyTimeLabel.innerHTML = "Average Hourly Study Time:"; 
        totalStudyTimeTxt.innerHTML = Math.floor(totalStudyTime) + " minutes";
        avgStudyTimeTxt.innerHTML = Math.floor(avgStudyTime) + " minutes";
    } else {
        totalStudyTimeTxt.innerHTML = "No data available.";
        avgStudyTimeTxt.innerHTML = "No data available.";
    }
}