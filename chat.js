// chat.js
// contains all the chat functionalities

let welcomeBubble = document.getElementById("welcome");

//Show createTask and hide createGoal and startBreak
function createTask(){
	makeVisible("createTask", ["createGoal", "startBreak"]);
}
  
//Show createGoal and hide createTask and startBreak
function createGoal(){
	makeVisible("createGoal", ["createTask", "startBreak"]);
}
  
//Show startBreak and hide createGoal and createTask
function startBreak(){
	makeVisible("startBreak", ["createTask", "createGoal"]);
}
  
//Will make an element visible. Parameter:(Id of the element)
function makeVisible(name, list){
	//hide every element given in the list
	let temp;
	for (var i = 0; i < list.length; i++){ 
	  	temp = document.getElementById(list[i]);
	  	if (getStyle(temp, "display") !== "none")
			temp.style.display = "none";
	}
	//hide or show element given.
	var el = document.getElementById(name)
	if (getStyle(el, "display") === "none")
	  	el.style.display = "block";
	else 
	  	el.style.display = "none";
}

// getStyle will test the style that's active on an element 'el'.
function getStyle(el, name) {
	if ( document.defaultView && document.defaultView.getComputedStyle )
	{
		var style = document.defaultView.getComputedStyle(el, null);
		if ( style )
			return style[name];
	}
	else if ( el.currentStyle )
		return el.currentStyle[name];
	return null;
}
