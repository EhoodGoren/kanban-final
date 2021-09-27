// Checks for a click on a submit button, and handles it.
function handleSubmitClick(event){
    const clickedElement = event.target;
    if(clickedElement.classList.contains("submit-buttons")){
        addNewTask(clickedElement);
    }
}

// Re-generates the DOM elements, from the local storage.
function generateTasks(){
    // Checks if localStorage's tasks object is empty. If it is, inserts suitable empty arrays.
    let localStorageTasks = JSON.parse(localStorage.getItem("tasks"));
    if(localStorageTasks===null){
        localStorageTasks={"todo":[], "in-progress":[], "done":[]}
        localStorage.setItem("tasks", JSON.stringify(localStorageTasks));
    }
    // Removes all exisiting tasks in DOM.
    clearExistingTasks();
    const { todo, "in-progress":inProgress, done } = localStorageTasks;
    // Creates li elements in DOM for each list (by what's in the localStorage arrays).
    const taskLists = document.querySelectorAll(".sections > ul");
    for(let tasks of todo.reverse()){
        const newTask = createElement("li", [tasks], ["task"]);
        taskLists[0].insertBefore(newTask, taskLists[0].firstChild);
    }
    for(let tasks of inProgress.reverse()){
        const newTask = createElement("li", [tasks], ["task"]);
        taskLists[1].insertBefore(newTask, taskLists[1].firstChild);
    }
    for(let tasks of done.reverse()){
        const newTask = createElement("li", [tasks], ["task"]);
        taskLists[2].insertBefore(newTask, taskLists[2].firstChild);
    }

    // Adds an outline for each task generated.
    const allTasks = document.querySelectorAll(".task");
    for(let task of allTasks){
        task.style.border = "2px solid";
    }
    // Adds indexes for the new lists and tasks.
    addIndexToLists();
    addIndexToTasks();
}

// Removes all existing tasks in DOM.
function clearExistingTasks(){
    const existingTasks = document.querySelectorAll(".sections .task");
    for(let tasks of existingTasks){
        tasks.remove();
    }
}

// If the task received is proper, it is added to DOM and displayed.
function addNewTask(button){
    // newTaskValue gets the value of the input field next to the clicked button.
    const currentSection = button.parentElement;
    const currentSectionInput = currentSection.querySelector("input");
    const newTaskValue = currentSectionInput.value;
    // If an empty task was submited.
    if(newTaskValue.length === 0){
        alert("Don't submit an empty task!")
        currentSectionInput.focus()
    }
    else{
        // If the new task was proper, it is added to the locaStorage. DOM is re-generated to display it.
        const taskList = currentSection.querySelector("ul");
        addToLocalStorage(taskList, newTaskValue);
        currentSectionInput.value=null;
        generateTasks();
    }
}

// Adds a new task to the localStorage array that represents the given list.
function addToLocalStorage(taskList, task){
    const localStorageTasks = JSON.parse(localStorage.getItem("tasks"));
    const taskListClasses = taskList.classList;
    if(taskListClasses.contains("to-do-tasks")){
        localStorageTasks.todo.unshift(task);
    } else if(taskListClasses.contains("in-progress-tasks")){
        localStorageTasks["in-progress"].unshift(task);
    } else if(taskListClasses.contains("done-tasks")){
        localStorageTasks.done.unshift(task);
    }
    localStorage.setItem("tasks", JSON.stringify(localStorageTasks));
}

// Covers some events on a task.
function mouseOverList(event){
    // Only handles events when mouse is over a li element.
    const currentTask = event.target;
    if(!(currentTask.tagName === "LI")){
        return;
    }

    // Handles a key press on keyboard.
    function keyPress(event){
        const newListMove = keyPressValidator(event);
        // This will happen when 1/2/3 is pressed with Alt.
        if(newListMove !== undefined){
            const taskParentList = currentTask.parentElement;
            if(taskParentList === null){
                return
            }
            // If an attempt to move a task to a list it's already in, nothing will happen.
            if(checkSameList(taskParentList, newListMove) !== "same"){
                document.removeEventListener("keydown", keyPress);
                moveTask(currentTask, newListMove);
            }
        }
    }

    // Allows editing the task's content, and saves it when enter is pressed or focus is lost.
    function doubleClicked(){
        const oldText = currentTask.innerText;
        currentTask.contentEditable = true;
        currentTask.focus();
        currentTask.addEventListener("keydown", checkEnter);

        // If enter was pressed initiates new task value save.
        function checkEnter(event){
            if(event.key === "Enter"){
                currentTask.blur();
            }
        }
        currentTask.onblur = () => {
            currentTask.removeEventListener("keydown", checkEnter);
            currentTask.contentEditable = false;
            // If trying to set a task to an empty value, old value is restored.
            if(currentTask.innerText===""){
                currentTask.innerText = oldText;
            }
            const parentListIndex = currentTask.parentElement.getAttribute("data-list");
            const taskIndex = taskIndexInList(currentTask);
            editLocalStorage(parentListIndex, taskIndex, currentTask.innerText);
        }
    }

    // Calls for drag and drop on a task.
    currentTask.addEventListener("mousedown", dragNDrop);
    currentTask.addEventListener("mouseup", () => {
        currentTask.removeEventListener("mousedown", dragNDrop);
    })

    // Checks a keyboard key press made (while mouse is on a task).
    document.addEventListener("keydown", keyPress);

    // Enables double clicking a task to change its value (without normal double click effect).
    currentTask.style.userSelect = "none";
    document.addEventListener("dblclick", doubleClicked);

    // Cancel the above tests when mouse leaves the task.
    currentTask.addEventListener("mouseleave", () =>{
        document.removeEventListener("keydown", keyPress);
        document.removeEventListener("dblclick", doubleClicked);
    })
}

// Checks if a list number was clicked with Alt on the keyboard.
function keyPressValidator(event){
    if(!event.altKey){
        return;
    }
    else{
        event.preventDefault();
    }
    const pressedKey = event.key;
    if(pressedKey === "1" || pressedKey === "2" || pressedKey === "3"){
        return pressedKey;
    }
}

// Checks if 2 given lists are the same.
function checkSameList(currentList, newList){
    const currentListIndex = currentList.getAttribute("data-list");
    if(currentListIndex === (parseInt(newList)-1).toString()){
        return "same";
    }
    return "not same";
}

// Removes a task from its list and adds it to another.
function moveTask(task, newListNum){
    // Removes it from localStorage from the previous list.
    removeCurrentTask(task)

    // Adds it to the localStorage to the new list.
    const taskSections = document.querySelectorAll(".sections");
    newListIndex = parseInt(newListNum)-1;
    const newList = taskSections[newListIndex].querySelector("ul");
    addToLocalStorage(newList, task.innerText);
    generateTasks();
}

// Removes a task from localStorage.
function removeCurrentTask(task){
    const listOfTaskNum = task.parentElement.getAttribute("data-list");
    const listOfTask = listAsArray(listOfTaskNum);
    const taskIndexInList = listOfTask.indexOf(task);

    const localStorageTasks = JSON.parse(localStorage.getItem("tasks"));
    switch(listOfTaskNum){
        case "0":
            localStorageTasks.todo.splice(taskIndexInList, 1);
            break;
        case "1":
            localStorageTasks["in-progress"].splice(taskIndexInList, 1);
            break;
        case "2":
            localStorageTasks.done.splice(taskIndexInList, 1);
            break;
    }
    localStorage.setItem("tasks", JSON.stringify(localStorageTasks));
}

// Replaces an existing value in localStorage with the new given value.
function editLocalStorage(listIndex, taskIndex, newValue){
    const localStorageTasks = JSON.parse(localStorage.getItem("tasks"));
    switch(listIndex){
        case "0":
            localStorageTasks.todo[taskIndex] = newValue;
            break;
        case "1":
            localStorageTasks["in-progress"][taskIndex] = newValue;
            break;
        case "2":
            localStorageTasks.done[taskIndex] = newValue;
            break;
    }
    localStorage.setItem("tasks", JSON.stringify(localStorageTasks));
}

// Returns an HTMLCollection with all li elements of a list by a given list index.
function listAsArray(index){
    const taskLists = document.querySelectorAll(".sections > ul");
    const selectedList = taskLists[index].querySelectorAll(".task");
    return [...selectedList];
}

// Returns the task's index in its parent list.
function taskIndexInList(task){
    const parentListIndex = task.parentElement.getAttribute("data-list");
    const parentListArray = listAsArray(parentListIndex);
    return parentListArray.indexOf(task);
}

// Adds a list index attribute for every list.
function addIndexToLists(){
    const taskLists = document.querySelectorAll(".sections > ul");
    let listIndex=0;
    for(let lists of taskLists){
        lists.setAttribute("data-list", listIndex);
        listIndex++;
    }
}

// Adds a task index attribute for every task (count resets for every list).
function addIndexToTasks(){
    const lists = document.querySelectorAll(".sections > ul");
    for(let list of lists){
        let index = 0;
        for(let task of list.children){
            task.setAttribute("data-task-index", index);
            index++;
        }
    }
}

// Handles a new search session in the search bar.
function searchBarTyping(event){
    const searchBar = event.target;
    searchBar.addEventListener("keyup", newSearch);

    // Handles a new search value.
    function newSearch(){
        const newInput = searchBar.value;
        // When the search bar is empty (all chars deleted, or nothing written), displays all the existing tasks again.
        if(newInput === ""){
            generateTasks();
            return;
        }

        const localStorageTasks = JSON.parse(localStorage.getItem("tasks"));
        clearExistingTasks();
        const matchingTasks = [];
        // Searches for values in localStorage that match the searched phrase.
        for(let list in localStorageTasks){
            const currentList = localStorageTasks[list];
            const newList = []
            for(let task of currentList){
                if(task.toLowerCase().includes(newInput.toLowerCase())){
                    newList.push(task);
                }
            }
            matchingTasks.push(newList);
        }

        let noMatches = false;
        for(let list of matchingTasks){
            if(list.length !== 0){
                noMatches = true;
            }
        }

        if(noMatches === true){
            clearExistingTasks;
        }

        // Shows the matching tasks (DOM).
        const mappedLists = document.querySelectorAll("ul[data-list]");
        let listCounter = 0;
        for(let list of mappedLists){
            for(let task of matchingTasks[listCounter]){
                const matchingTaskLi = createElement("li", [task], ["task"]);
                list.appendChild(matchingTaskLi);
            }
            listCounter++;
        }
        // Adds an outline for each task generated.
        const allTasks = document.querySelectorAll(".task");
        for(let task of allTasks){
            task.style.border = "2px solid";
        }
    }

    searchBar.addEventListener("blur", () => searchBar.removeEventListener("keydown", newSearch));
}

// Loads the data from the api, and saves it to localStorage.
async function loadData(){
    // Shows loader.
    const header = document.querySelector("header")
    const loader = createElement("img", [], ["loader"], {src:"./loader.webp", style:"height: 200px; width: 200px"})
    header.appendChild(loader);

    const response = await fetch ("https://json-bins.herokuapp.com/bin/614b049a4021ac0e6c080ccf", {
        method: "GET"
    });
    // Removes loader when fetch is done.
    header.removeChild(loader);

    // If the response has status 400+ (error).
    const status=response.status;
    if(!response.ok){
        alert ("Error " + status + ", Try again...");
    }
    let result = await response.json();
    // If received an empty arrays object from the api.
    if(typeof(result.tasks) === "object"){
        const emptyObjResult = result.tasks;
        localStorage.setItem("tasks", JSON.stringify(emptyObjResult));
    }
    else{
        localStorage.setItem("tasks", result.tasks);
    }
    // Re-generates DOM for the new tasks loaded from the api.
    clearExistingTasks();
    generateTasks();
}

// Saves the tasks from localStorage to the api.
async function saveData(){
    // Shows loader.
    const header = document.querySelector("header")
    const loader = createElement("img", [], ["loader"], {src:"./loader.webp", style:"height: 200px; width: 200px"})
    header.appendChild(loader);

    // Gets the data from localStorage to save to the api. Creates proper empty arrays object if localStorage was empty.
    let dataToSave = JSON.parse(localStorage.getItem("tasks"));
    if(dataToSave === null){
        dataToSave={"todo":[], "in-progress":[], "done":[]}
        localStorage.setItem("tasks", JSON.stringify(dataToSave));
    }
    
    dataToSave = localStorage.getItem("tasks");
    const response = await fetch ("https://json-bins.herokuapp.com/bin/614b049a4021ac0e6c080ccf", {
        method: "PUT",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({"tasks": `${dataToSave}`})
    });
    // Removes loader when fetch is done.
    header.removeChild(loader);

    // If the response has status 400+ (error).
    const status=response.status;
    if(!response.ok){
        alert ("Error " + status + ", Try again...");
    }
}

// Handles a click on the bin.
function deleteAllTasks(event){
    const deleteAllButton = document.getElementById("remove-all-btn");
    // If the bin was clicked, shows a warning, and allows choosing yes or no.
    if(event.target === deleteAllButton){
        const question = createElement("div", ["Are you sure?"], [], {style: "font-size:25px"});
        deleteAllButton.appendChild(question);

        const yesButton = createElement("button",["Yes"], [], {id:"yes-btn" ,style:"font-size: 20px; margin:5px; width:40%"});
        const noButton = createElement("button",["No"],  [], {id:"no-btn", style:"font-size: 20px; margin:5px; width:40%"});
        deleteAllButton.appendChild(yesButton);
        deleteAllButton.appendChild(noButton);
    }
    // If the click was on the yes or no buttons.
    else{
        const yesButton = document.querySelector("#yes-btn");
        // Clicking yes removes all tasks from DOM.
        if(event.target === yesButton){
            clearExistingTasks();
            const emptyStorage = {"todo":[], "in-progress":[], "done":[]}
            localStorage.setItem("tasks", JSON.stringify(emptyStorage));
        }
        // Reverts the bin to its originial state.
        const deleteAllButtonChildren = deleteAllButton.querySelectorAll("*");
        for(let child of deleteAllButtonChildren){
            child.remove();
        }
    }
}

// Handles a drag and drop of a task.
function dragNDrop(event){
    const task=event.target;
    task.draggable = true;
    const parentListIndex = task.parentElement.getAttribute("data-list")
    const parentListArray = listAsArray(parentListIndex);
    const draggables = document.querySelectorAll(".sections > ul > li");
    task.addEventListener("dragstart", dragStart);
    
    let dragStartIndex;
    function dragEnd(){
        task.removeEventListener("dragstart", dragStart);
    }
    function dragOver(event){
        event.preventDefault();
    }
    function dragEnter(){
        this.classList.add("over");
    }
    function dragLeave(){
        this.classList.remove("over");
    }
    function dragStart(){
        draggables.forEach(draggable => {
            draggable.addEventListener("dragover", dragOver);
            draggable.addEventListener("drop", dragDrop);
            draggable.addEventListener("dragenter", dragEnter);
            draggable.addEventListener("dragleave", dragLeave);
        })
        task.addEventListener("dragend", dragEnd);
        dragStartIndex = this.closest("li").getAttribute("data-task-index");
    }
    function dragDrop(){
        const dragEndIndex = this.getAttribute("data-task-index");
        swapItems(dragStartIndex, dragEndIndex);

        this.classList.remove("over");
    }
    // Swaps the task with another task when dropped on one.
    function swapItems(fromIndex, toIndex){
        const itemOne = parentListArray[fromIndex];
        const itemTwo = parentListArray[toIndex];
        editLocalStorage(parentListIndex, fromIndex, itemTwo.innerText)
        editLocalStorage(parentListIndex, toIndex, itemOne.innerText)

        draggables.forEach(draggable => {
            draggable.removeEventListener("dragover", dragOver);
            draggable.removeEventListener("drop", dragDrop);
            draggable.removeEventListener("dragenter", dragEnter);
            draggable.removeEventListener("dragleave", dragLeave);
        })
        task.removeEventListener("dragstart", dragStart);
        clearExistingTasks();
        generateTasks();
    }
    task.addEventListener("mouseleave" , ()=>{
        task.removeEventListener("dragstart", dragStart);
    })
}

// Background for the page.
document.body.style.backgroundImage = "url('background.jpeg')";
document.body.style.backgroundSize = "100vw 100vh";

// First time setup.
generateTasks();
addIndexToLists();
addIndexToTasks();

const taskSections = document.querySelector("#task-sections");
taskSections.addEventListener("click", handleSubmitClick);
taskSections.addEventListener("mouseover", mouseOverList);

const searchBar = document.getElementById("search");
searchBar.addEventListener("focus", searchBarTyping);
searchBar.addEventListener("blur", () => searchBar.removeEventListener("focus", searchBarTyping));

const loadButton = document.getElementById("load-btn");
loadButton.addEventListener("click", loadData);

const saveButton = document.getElementById("save-btn");
saveButton.addEventListener("click", saveData);

const deleteAllButton = document.getElementById("remove-all-btn");
deleteAllButton.addEventListener("click", deleteAllTasks)

/**
 * Creates a new DOM element.
 *
 * Example usage:
 * createElement("div", ["just text", createElement(...)], ["nana", "banana"], {id: "bla"}, {click: (...) => {...}})
 *
 * @param {String} tagName - the type of the element
 * @param {Array} children - the child elements for the new element.
 *                           Each child can be a DOM element, or a string (if you just want a text element).
 * @param {Array} classes - the class list of the new element
 * @param {Object} attributes - the attributes for the new element
 * @param {Object} eventListeners - the event listeners on the element
 */
 function createElement(tagName, children = [], classes = [], attributes = {}, eventListeners = {}) {
    const newElement = document.createElement(tagName);

    // Children
    for(let child of children){
        newElement.append(child);
    }

    // Classes
    for(let className of classes){
        newElement.classList.add(className);
    }

    // Attributes
    for(let trait in attributes){
        newElement.setAttribute(trait, attributes[trait]);
    }

    // Event listeners
    for(let listeners in eventListeners){
        newElement.addEventListener(listeners, eventListeners[listeners]);
    }

    return newElement;
}
