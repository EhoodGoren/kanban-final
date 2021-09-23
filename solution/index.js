function handleSubmitClick(event){
    const clickedElement = event.target;
    if(clickedElement.classList.contains("submit-buttons")){
        addTask(clickedElement);
    }
}

function generateTasks(){
    // Checks if tasks is empty.
    let localStorageTasks = JSON.parse(localStorage.getItem("tasks"));
    if(localStorageTasks===null){
        localStorageTasks={"todo":[], "in-progress":[], "done":[]}
        localStorage.setItem("tasks", JSON.stringify(localStorageTasks));
    }

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

function addTask(button){
    // Clears all existing tasks
    clearExistingTasks();
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
    document.addEventListener("keydown", keyPress);
    currentTask.addEventListener("mouseleave", () =>{
        document.removeEventListener("keydown", keyPress);
    })
}
function keyPress(event){
    if(!event.altKey){
        return;
    }
    else{
        event.preventDefault();
    }
    switch(event.key){
        case "1":
            console.log("1");
            break;
        case "2":
            console.log("2");
            break;
        case "3":
            console.log("3");
            break;
    }
}

generateTasks();
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