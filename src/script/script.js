import { DATA } from '../../data/airports.js';
import { DATA_COLUMNS } from '../constants/index.js';
import { getDataOnEvent } from '../utils/index.js';

// Global Vairables
var start = 0;
var end = 3;
var DATA_CLONE = DATA;

// Create and render new list of elements in table based on user input.
function fetchData(event) {
    const inputValue = event.target.value.toLowerCase();    
    const dataColumnsArray = Object.values(DATA_COLUMNS);
    console.log(inputValue); // Check console for which input search is been fired.

    if(inputValue !== null || inputValue !== undefined) {
        const filteredList = DATA.filter((element) => {
            let isValid = false;
            
            for(let i = 0 ; i < dataColumnsArray.length ; i++) {
                let dataValue = element[dataColumnsArray[i]];
                dataValue = String(dataValue).toLowerCase();

                if(dataValue === inputValue) {
                    isValid = true;
                    break;
                }
            }

            return isValid;
        });

        if(filteredList.length > 0) {
            DATA_CLONE = filteredList
            renderData(DATA_CLONE);
        }
    }

    // This is required since when user cleared the input field we need to render the initial data as it is.
    if(inputValue === '') {
        DATA_CLONE = DATA;
        renderData(DATA_CLONE);
    }
}

const getDataFromInput = getDataOnEvent(fetchData, 300); // Note: Here `getDataOnEvent` is a debounced function.

// Event listener for search event.
function inputSearchEvent() {
    const inputElement = document.querySelector('.js-search-input');
    inputElement.addEventListener('keyup', getDataFromInput)
}

// Function to filter data on checked state basis.
function filterDataOnCheck() {
    let checkboxList = document.querySelector('.js-checkbox-list');
    const checkboxListItems = Object.values(checkboxList.children);

    let checkedOptions = {};
    checkboxListItems.forEach(element => {
        const targetElement = element.children[0];
        targetElement.dataset.checked === 'true' ? checkedOptions[targetElement.dataset.label] = true : null})

    const filteredData = DATA.filter(element => checkedOptions.hasOwnProperty(element.type));
    if(Object.keys(checkedOptions).length !== 0)  {
        DATA_CLONE = filteredData;
    } else {
        DATA_CLONE = DATA;
    }

    sessionStorage.setItem("options", JSON.stringify(checkedOptions));

    renderData(DATA_CLONE);
    
    console.log(checkedOptions); // Check console for checked options.
    console.log(filteredData); // Check console for filtered list.
}

// Event listener for check event.
function inputCheckEvent() {
    let checkboxList = document.querySelector('.js-checkbox-list');
    checkboxList.addEventListener('click', function onCheckboxClick(event) {
        const dataset = event.target.dataset;
        if(Object.keys(dataset).length !== 0) {
            dataset.checked === "true" ? dataset.checked = "false" : dataset.checked = "true";
        }

        filterDataOnCheck();
    });
}

// Add elements in table on render.
function setTableData(dataObject) {
    let rowElement = document.createElement('tr');

    for(let i = 0 ; i < 7 ; i++) {
        let dataElement = document.createElement('td');
        dataElement.innerText = dataObject[DATA_COLUMNS[i]];
        rowElement.appendChild(dataElement);
    }

    return rowElement;
}

function setFooterCountData() {
    
    let minCountPagination = document.querySelector('.js-min-count');
    let maxCountPagination = document.querySelector('.js-max-count');
    let totalCountPagination = document.querySelector('.js-total-count');

    const minCount = start + 1;
    const maxCount = end + 1;
    const totalCount = DATA_CLONE.length;

    if(minCountPagination !== null || minCountPagination !== undefined) minCountPagination.innerText = minCount;
    if(maxCountPagination !== null || maxCountPagination !== undefined) maxCountPagination.innerText = maxCount;
    if(totalCountPagination !== null || totalCountPagination !== undefined) totalCountPagination.innerText = totalCount;

    sessionStorage.setItem("start", String(start));
    sessionStorage.setItem("end", String(end));
    sessionStorage.setItem("total", String(DATA_CLONE.length));
}

// Function to render data on input search.
function renderData(dataList) {
    let bodyElement = document.querySelector('.js-table-body');
    bodyElement.innerHTML = '';

    for(let i = start ; i < dataList.length && i <= end ; i++) {
        const rowElement = setTableData(dataList[i]);
        bodyElement.appendChild(rowElement);
    }

    setFooterCountData();
    sessionStorage.setItem("DATA", JSON.stringify(DATA_CLONE));
}

// Function to render data on Initial render.
function renderInitialData(tableData) {

    let bodyElement = document.querySelector('.js-table-body');
    bodyElement.innerHTML = '';

    for(let i = start ; i <= end ; i++) {
        const rowElement = setTableData(tableData[i]);
        bodyElement.appendChild(rowElement);
    }
    
    setFooterCountData();
}

// Function for pagination event and reset start end values.
function paginationEvent() {
    var paginationArrows = document.querySelectorAll('.js-pagination-arrow');
    paginationArrows.forEach(element => element.addEventListener('click', function arrowClick(event) {
        if(event.target.dataset.direction === 'right') {
            if(start <= DATA_CLONE.length - 4) {
                start += 4;
                end += 4;
            }
        } else {
            if(start !== 0) {
                start -= 4;
                end -= 4;
            }
        }

        renderData(DATA_CLONE);
    }));
}

// Function to render current session data.
function renderCurrentSession() {
    // Retrieve session data
    let data = sessionStorage.getItem("DATA");
    data = JSON.parse(data);
    DATA_CLONE = data;
    renderInitialData(DATA_CLONE); // Render against session data to keep ui persistent.

    let options = sessionStorage.getItem("options");
    options = JSON.parse(options);

    let optionsList = document.querySelector('.js-checkbox-list');

    if(Object.keys(options).length !== 0) {
        for (const [key, value] of Object.entries(options)) {
            optionsList.querySelector(`[data-label=${key}]`).dataset.checked = `${value}`;
        }    
    }
    
    start = Number(sessionStorage.getItem("start"));
    end = Number(sessionStorage.getItem("end"));
}

function registerEvents() {
    if(performance.navigation.type === performance.navigation.TYPE_RELOAD) {
        renderCurrentSession();
    } else {
        renderInitialData(DATA);
    }

    inputSearchEvent();
    inputCheckEvent();
    paginationEvent();
}

window.addEventListener('load', registerEvents);
