function handleSubmitClick(event){
    const clickedElement = event.target;
    if(clickedElement.classList.contains("submit-buttons")){
        addNewTask(clickedElement);
    }
}

function generateTasks(){
    // Checks if tasks is empty.
    let localStorageTasks = JSON.parse(localStorage.getItem("tasks"));
    if(localStorageTasks===null){
        localStorageTasks={"todo":[], "in-progress":[], "done":[]}
        localStorage.setItem("tasks", JSON.stringify(localStorageTasks));
    }
    clearExistingTasks();
    const { todo, "in-progress":inProgress, done } = localStorageTasks;
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

    const allTasks = document.querySelectorAll(".task");
    for(let task of allTasks){
        task.style.border = "2px solid";
    }
    /*for(let list in arguments){
        const currentList = taskLists.querySelectorAll("ul")
        for(let tasks of list){
            const 
        }
    }*/
}

function clearExistingTasks(){
    const existingTasks = document.querySelectorAll(".sections .task");
    for(let tasks of existingTasks){
        tasks.remove();
    }
}

function addNewTask(button){
    // Clears all existing tasks
    const currentSection = button.parentElement;
    const newTaskValue = currentSection.querySelector("input").value;
    const taskList = currentSection.querySelector("ul");
    addToLocalStorage(taskList, newTaskValue);
    generateTasks();
}

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

function mouseOverList(event){
    const currentTask = event.target;
    if(!(currentTask.tagName === "LI")){
        return;
    }

    function keyPress(event){
        const newListMove = keyPressValidator(event);
        if(newListMove !== undefined){
            const taskParentList = currentTask.parentElement;
            if(checkSameList(taskParentList, newListMove) !== "same"){
                document.removeEventListener("keydown", keyPress);
                moveTask(currentTask, newListMove);
            }
        }
    }

    function doubleClicked(){
        currentTask.contentEditable = true;
        currentTask.onblur = () => {
            currentTask.contentEditable = false;
            const parentListIndex = currentTask.parentElement.getAttribute("data-list");
            const taskIndex = taskIndexInList(currentTask);
            editLocalStorage(parentListIndex, taskIndex, currentTask.innerText);
        }
    }

    document.addEventListener("keydown", keyPress);

    currentTask.style.userSelect = "none";
    document.addEventListener("dblclick", doubleClicked);

    currentTask.addEventListener("mouseleave", () =>{
        document.removeEventListener("keydown", keyPress);
        document.removeEventListener("dblclick", doubleClicked);
    })
}

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

function checkSameList(currentList, newList){
    const currentListClasses = currentList.classList;
    switch(newList){
        case "1":
            if(currentListClasses.contains("to-do-tasks")){
                return "same";
            }
            break;
        case "2":
            if(currentListClasses.contains("in-progress-tasks")){
                return "same";
            }
            break;
        case "3":
            if(currentListClasses.contains("done-tasks")){
                return "same";
            }
            break;
    }
    return "not same";
}

function moveTask(task, newListNum){
    removeCurrentTask(task)
    const taskSections = document.querySelectorAll(".sections");
    newListIndex = parseInt(newListNum)-1;
    const newList = taskSections[newListIndex].querySelector("ul");
    addToLocalStorage(newList, task.innerText);
    generateTasks();
}

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

function editLocalStorage(listIndex, taskIndex, newValue){
    const localStorageTasks = JSON.parse(localStorage.getItem("tasks"));
    switch(listIndex){
        case "0":
            localStorageTasks.todo[taskIndex] = newValue;
            break;
        case "1":
            console.log(`putting ${newValue} in ${localStorage.tasks} at place ${taskIndex}`);
            localStorageTasks["in-progress"][taskIndex] = newValue;
            console.log(localStorageTasks["in-progress"]);
            break;
        case "2":
            localStorageTasks.done[taskIndex] = newValue;
            break;
    }
    localStorage.setItem("tasks", JSON.stringify(localStorageTasks));
}

function listAsArray(index){
    const taskLists = document.querySelectorAll(".sections > ul");
    const selectedList = taskLists[index].querySelectorAll(".task");
    return [...selectedList];
}

function taskIndexInList(task){
    const parentListIndex = task.parentElement.getAttribute("data-list");
    const parentListArray = listAsArray(parentListIndex);
    return parentListArray.indexOf(task);
}

function addIndexToLists(){
    const taskLists = document.querySelectorAll(".sections > ul");
    let listIndex=0;
    for(let lists of taskLists){
        lists.setAttribute("data-list", listIndex);
        listIndex++;
    }
}

generateTasks();
addIndexToLists();
const taskSections = document.querySelector("#task-sections");
taskSections.addEventListener("click", handleSubmitClick);
taskSections.addEventListener("mouseover", mouseOverList);

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