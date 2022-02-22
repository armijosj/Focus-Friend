let reportButton = document.querySelector(".navBar__item--report");
let shopButton = document.querySelector(".navBar__item--shop");
let inventoryButton = document.querySelector(".navBar__item--inventory");
let settingsButton = document.querySelector(".navBar__item--settings");
let goalsButton = document.querySelector(".navBar__item--goals");

let mainMenuDisplay = document.querySelector(".main__item--menu");
let reportDisplay = document.querySelector(".main__item--report");
let shopDisplay = document.querySelector(".main__item--shop");
let inventoryDisplay = document.querySelector(".main__item--inventory");
let settingsDisplay = document.querySelector(".main__item--settings");
let goalsDisplay = document.querySelector(".main__item--goals");

let appName = document.querySelector(".navBar__sectionA h3");
let navBar = document.querySelector(".navBar");
let mainMenu = document.querySelector(".main__items");
let sectionB = document.querySelector(".navBar__sectionB");
var state = 10000;

// used by the appName and backButton buttons
function returnHome() {
	if(state !== 10000) {
        navBar.style.marginBottom = "0%";
        mainMenuDisplay.style.display = "flex";
        appName.style.backgroundColor = "black";
        document.body.style.backgroundColor = "rgba(0, 0, 0, 0.735)";
        hideTabsExcept(0);
        state = 10000;
    }
};

appName.onclick = function() {
    returnHome();
};

// selecting every page__backButton element and giving it the returnHome onclick functionality.
document.querySelectorAll(".page__backButton").forEach(item => item.addEventListener("click", () => {
	returnHome();
}));

goalsButton.onclick = function () {
    if(state !== 01000) {
        navBar.style.marginBottom = "1.5%";
        goalsDisplay.style.display = "block";
        goalsButton.style.backgroundColor = "black";
        document.body.style.backgroundColor = "rgba(0, 0, 0, 0.735)";
        hideTabsExcept(1);
        state = 01000;
    }
};

reportButton.onclick = function () {
    if(state !== 00100) {
        navBar.style.marginBottom = "1.5%";
        reportDisplay.style.display = "block";
        reportButton.style.backgroundColor = "black";
        document.body.style.backgroundColor = "rgba(0, 0, 0, 0.735)";
        hideTabsExcept(2);
        state = 00100;
    }
};

inventoryButton.onclick = function () {
    if(state !== 00010) {
        navBar.style.marginBottom = "1.5%";
        inventoryDisplay.style.display = "block";
        inventoryButton.style.backgroundColor = "black";
        document.body.style.backgroundColor = "rgba(0, 0, 0, 0.735)";
        hideTabsExcept(3);
        state = 00010;
    }
};

settingsButton.onclick = function () {
    if(state !== 00001) {
        navBar.style.marginBottom = "1.5%";
        settingsDisplay.style.display = "block";
        settingsButton.style.backgroundColor = "black";
        document.body.style.backgroundColor = "rgba(0, 0, 0, 0.735)";
        hideTabsExcept(4);
        state = 00001;
    }
};

function hideTabsExcept(openedTabNumber) {
    let tabs = mainMenu.children;
    let navButtons = sectionB.children;
    for(var i = 0; i < tabs.length; i++) {
        if(i != openedTabNumber) {
            tabs[i].style.display = "none";
            if( i === 0) {
                appName.style.backgroundColor = "rgb(97, 97, 97)";
            } else {
                var j = i - 1;
                navButtons[j].style.backgroundColor = "rgb(97, 97, 97)";
            }
        }
    }   
}
