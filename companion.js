let companionImage = document.getElementById("companion");
let goalButton = document.getElementById("goalButton");
let taskButton = document.getElementById("taskButton");
let breakButton = document.getElementById("breakButton");

//Start waving animation after page loads 
window.addEventListener("load", companionWaving);

//Change animation when buttons are clicked
/*
goalButton.addEventListener("click", companionTalking); 
taskButton.addEventListener("click", companionTalking); 
breakButton.addEventListener("click", companionTalking); 
*/

//Waving animation 
function companionWaving(){
    companionImage.src = "images/waving-fullsize.gif";
    setTimeout(companionIdle, 4000);
}

//Talking animation
function companionTalking(){
    companionImage.src = "images/talking-fullsize.gif";
    setTimeout(companionIdle, 9500);
}

//Idle animation
function companionIdle(){
    companionImage.src = "images/blinking-fullsize.gif";
}
