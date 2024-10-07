const listItems = document.querySelectorAll(".sidebar-list li");

listItems.forEach((item) => {
  item.addEventListener("click", () => {
    let isActive = item.classList.contains("active");

    listItems.forEach((el) => {
      el.classList.remove("active");
    });

    if (isActive) item.classList.remove("active");
    else item.classList.add("active");
  });
});

const toggleSidebar = document.querySelector(".toggle-sidebar");
const logo = document.querySelector(".logo-box");
const sidebar = document.querySelector(".sidebar");

toggleSidebar.addEventListener("click", () => {
  sidebar.classList.toggle("close");
});

logo.addEventListener("click", () => {
  sidebar.classList.toggle("close");
});

function showContent(contentId) {
  var contents = document.getElementsByClassName('content');
  for (var i = 0; i < contents.length; i++) {
    contents[i].style.display = 'none';
  }

  var selectedContent = document.getElementById(contentId);
  if (selectedContent) {
    selectedContent.style.display = 'block';
    if (contentId === 'map') {
      if (!map) {
        initMap();
      }
      google.maps.event.trigger(map, 'resize');
    }
  }
}

function printReport(areaID) {
  var printContent = document.getElementById(areaID).innerHTML;
  document.body.innerHTML = printContent;
  window.print();
  window.location.href = 'dashboard.html';
}

const searchFunction = (searchInputId, tableId) => {
  // Get the value from the specific search bar
  let filter = document.getElementById(searchInputId).value.toUpperCase();

  // Get the table body by its ID
  let table = document.getElementById(tableId);
  let tr = table.getElementsByTagName('tr'); // Get all rows in the table

  // Loop through all table rows
  for (let i = 0; i < tr.length; i++) {
    let tdArray = tr[i].getElementsByTagName('td'); // Get all <td> elements in the row
    let rowContainsSearchTerm = false; // Flag to determine if a row contains the search term

    // Loop through all <td> elements in the row
    for (let j = 0; j < tdArray.length; j++) {
      let td = tdArray[j];
      if (td) {
        let textvalue = td.textContent || td.innerHTML;

        // Check if the search term is found in the cell
        if (textvalue.toUpperCase().indexOf(filter) > -1) {
          rowContainsSearchTerm = true; // If found, set flag to true
          break; // Stop checking other columns if one matches
        }
      }
    }

    // Show the row if a match is found, otherwise hide it
    tr[i].style.display = rowContainsSearchTerm ? "" : "none";
  }
}

const currentDate = new Date();
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentMonth = monthNames[currentDate.getMonth()];
const currentYear = currentDate.getFullYear();

document.getElementById('currentMonth').textContent = currentMonth;
document.getElementById('currentYear').textContent = currentYear.toString();

function stopAudio() {
  const audio = document.getElementById('notificationSound');
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

function createPopupToggle(buttonId, popupId) {
  document.addEventListener('DOMContentLoaded', function () {
    const notificationButton = document.getElementById(buttonId);
    const popupCard = document.getElementById(popupId);

    notificationButton.addEventListener('click', function (event) {
      event.preventDefault();
      if (popupCard.style.display === 'none' || popupCard.style.display === '') {
        popupCard.style.display = 'block';
      } else {
        popupCard.style.display = 'none';
      }
    });

    document.addEventListener('click', function (event) {
      if (!popupCard.contains(event.target) && !notificationButton.contains(event.target)) {
        popupCard.style.display = 'none';
      }
    });
  });
}

createPopupToggle('notificationButton', 'popupCard');
createPopupToggle('messageButton', 'popupCardmessage');

function createCustomDropdown(inputFieldId, dropdownId, indicatorClass, containerClass, appendMultiple = false) {
  const inputField = document.getElementById(inputFieldId);
  const dropdown = document.getElementById(dropdownId);
  const dropdownIndicator = document.querySelector(`.${indicatorClass}`);

  dropdownIndicator.addEventListener('click', function () {
    dropdown.style.display = dropdown.style.display === 'none' || dropdown.style.display === '' ? 'block' : 'none';
  });

  dropdown.addEventListener('click', function (e) {
    if (e.target.tagName === 'LI') {
      const selectedOption = e.target.textContent;

      if (appendMultiple) {
        inputField.value += (inputField.value ? ', ' : '') + selectedOption;
      } else {
        inputField.value = selectedOption;
      }

      dropdown.style.display = 'none';
    }
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest(`.${containerClass}`)) {
      dropdown.style.display = 'none';
    }
  });

  inputField.addEventListener('input', function () {
    const filter = inputField.value.toLowerCase();
    const options = dropdown.querySelectorAll('li');
    options.forEach(function (option) {
      const text = option.textContent.toLowerCase();
      option.style.display = text.includes(filter) ? '' : 'none';
    });
  });
}

createCustomDropdown('LocationMod', 'locationOptions', 'dropdown-indicator', 'custom-select-container');
createCustomDropdown('EditLocationMod', 'locationOptions2', 'dropdown-indicator2', 'custom-select-container2');
createCustomDropdown('TypeMod', 'typeOptions', 'dropdown-indicator3', 'custom-select-container3');
createCustomDropdown('EditResponderMod', 'editresponderOptions', 'dropdown-indicator4', 'custom-select-container4', true);
createCustomDropdown('ResponderMod', 'responderOptions', 'dropdown-indicator5', 'custom-select-container5', true);
createCustomDropdown('EditTypeMod', 'edittypeOptions', 'dropdown-indicator6', 'custom-select-container6');


function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return { year, month };
}

function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

document.getElementById('DateMod').addEventListener('change', function () {
  var input = this.value;
  if (input) {
    var date = new Date(input);
    var options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    var FormattedDate = date.toLocaleString('en-US', options);

    document.getElementById('formattedDate').value = FormattedDate;
  } else {
    document.getElementById('formattedDate').value = '';
  }
});

document.getElementById('DateMod').addEventListener('change', function () {

  var input = this.value;

  if (input) {

    this.value = '';
  }
});

function createAgeValidator(inputId, errorMessageId) {
  const inputField = document.getElementById(inputId);
  const errorMessage = document.getElementById(errorMessageId);

  inputField.addEventListener('input', function () {
    const value = this.value;

    if (/^\d*$/.test(value)) {
      errorMessage.textContent = '';
    } else {
      errorMessage.textContent = 'Invalid age';
      this.value = value.replace(/[^0-9]/g, '');
    }
  });
}

createAgeValidator('AgeMod', 'error-message');
createAgeValidator('EditAgeMod', 'error-message1');

function capitalizeFirstLetter(input) {
  let words = input.value.split(' ');
  input.value = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

function capitalizeAfterPeriod(input) {
  let sentences = input.value.split('. ');
  input.value = sentences.map(sentence => {
    return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
  }).join('. ');
}











