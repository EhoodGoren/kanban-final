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
    const currentSectionInput = currentSection.querySelector("input");
    const newTaskValue = currentSectionInput.value;
    if(newTaskValue.length === 0){
        alert("Dont submit an empty task!")
        currentSectionInput.focus()
    }
    else{
        const taskList = currentSection.querySelector("ul");
        addToLocalStorage(taskList, newTaskValue);
        currentSectionInput.value=null;
        generateTasks();
    }
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
    const currentListIndex = currentList.getAttribute("data-list");
    if(currentListIndex === (parseInt(newList)-1).toString()){
        return "same";
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
            localStorageTasks["in-progress"][taskIndex] = newValue;
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

function addIndexToTasks(task){
    const lists = document.querySelectorAll(".sections > ul");
    for(let list of lists){
        let index = 0;
        for(let task of list.children){
            task.setAttribute("data-task-index", index);
            index++;
        }
    }
}

function searchBarTyping(event){
    const searchBar = event.target;
    searchBar.addEventListener("keyup", newSearch);

    function newSearch(event){
        const newInput = searchBar.value;
        if(newInput === ""){
            generateTasks();
            return;
        }
        const localStorageTasks = JSON.parse(localStorage.getItem("tasks"));
        clearExistingTasks();
        const matchingTasks = [];
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

        const mappedLists = document.querySelectorAll("ul[data-list]");
        let listCounter = 0;
        for(let list of mappedLists){
            for(let task of matchingTasks[listCounter]){
                const matchingTaskLi = createElement("li", [task], ["task"]);
                list.appendChild(matchingTaskLi);
            }
            listCounter++;
        }

        const allTasks = document.querySelectorAll(".task");
        for(let task of allTasks){
            task.style.border = "2px solid";
        }
    }

    searchBar.addEventListener("blur", () => searchBar.removeEventListener("keydown", newSearch));
}

async function loadData(event){
    const header = document.querySelector("header")
    const loader = createElement("img", [], ["loader"], {src:"./loader.webp", style:"height: 200px; width: 200px"})
    header.appendChild(loader);

    const response = await fetch ("https://json-bins.herokuapp.com/bin/614b049a4021ac0e6c080ccf", {
        method: "GET"
    });
    header.removeChild(loader);

    if(!response.ok){
        alert ("Error " + status + ", Try again...");
    }
    const status=response.status;
    let result = await response.json();
    if(typeof(result.tasks) === "object"){
        const emptyObjResult = result.tasks;
        localStorage.setItem("tasks", JSON.stringify(emptyObjResult));
    }
    else{
        localStorage.setItem("tasks", result.tasks);
    }
    clearExistingTasks();
    generateTasks();
}

async function saveData(event){
    const header = document.querySelector("header")
    const loader = createElement("img", [], ["loader"], {src:"./loader.webp", style:"height: 200px; width: 200px"})
    header.appendChild(loader);

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
    header.removeChild(loader);
    const status=response.status;
    if(!response.ok){
        alert ("Error " + status + ", Try again...");
    }
}

function deleteAllTasks(event){
    const deleteAllButton = document.getElementById("remove-all-btn");
    if(event.target === deleteAllButton){
        const question = createElement("div", ["Are you sure?"], [], {style: "font-size:25px"});
        deleteAllButton.appendChild(question);
        const yesButton = createElement("button",["Yes"], [], {id:"yes-btn" ,style:"font-size: 20px; margin:5px; width:40%"});
        const noButton = createElement("button",["No"],  [], {id:"no-btn", style:"font-size: 20px; margin:5px; width:40%"});
        deleteAllButton.appendChild(yesButton);
        deleteAllButton.appendChild(noButton);
    }
    else{
        const yesButton = document.querySelector("#yes-btn");
        if(event.target === yesButton){
            clearExistingTasks();
        }
        const deleteAllButtonChildren = deleteAllButton.querySelectorAll("*");
        for(let child of deleteAllButtonChildren){
            child.remove();
        }
    }
}



document.body.style.backgroundImage = 
"url('https://images.pexels.com/photos/1631677/pexels-photo-1631677.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500')";
document.body.style.backgroundSize = "100vw 100vh";

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
