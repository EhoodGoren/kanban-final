function handleSubmitClick(event){
    const clickedElement = event.target;
    if(clickedElement.classList.contains("submit-buttons")){
        addTask(clickedElement);
    }
}

function addTask(button){
    const currentSection = button.parentElement;
    const newTaskValue = currentSection.querySelector("input").value;
    const newTask = createElement("div", [newTaskValue], ["task"]);
    const taskList = currentSection.querySelector("ul");
    taskList.appendChild(newTask);
}

const taskSections = document.querySelector("#task-sections");
taskSections.addEventListener("click", handleSubmitClick);

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