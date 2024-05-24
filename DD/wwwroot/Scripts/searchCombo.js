window.onload = function () {
initSearchCombo(uniqueId, searchComboContents, DefaultText); 
}

function initSearchCombo(uniqueId, searchComboContents, dropdownDefaultText) {
    const parentDropdown = document.getElementById(`parent-dropdown-${uniqueId}`);
    const childDropdown = document.getElementById(`child-dropdown-${uniqueId}`);
    const searchIcon = document.getElementById(`search-icon-${uniqueId}`);
    parentDropdown.selectedIndex = 0;
    childDropdown.selectedIndex = 0;
    searchIcon.href = '#';
    function populateChildDropdown() {
        parentDropdown.addEventListener('change', function () {
            const selectedParentValue = parentDropdown.selectedIndex - 1;
            populateChildOptions(selectedParentValue, childDropdown, searchComboContents);
        });
        childDropdown.addEventListener('change', function () {
            searchIcon.href = this.value; // Update the href of the search icon
        });
    }

    function populateChildOptions(selectedParentIndex, childDropdown, searchComboContents) {
        // Clear the child dropdown
        childDropdown.innerHTML = `<option value="" selected>${dropdownDefaultText}</option>`;
        
        // If the selected index is -1, then return cus that would mean the default option is selected
        if(selectedParentIndex <= -1) return;
        
        // Get the parent item based on the selected index
        const parentItem = searchComboContents.blocksList[selectedParentIndex];
        
        if (parentItem && parentItem.content.comboBoxUserName) {
            parentItem.content.comboBoxUserMatches.forEach(childItem => {
                const option = document.createElement('option');
                option.value = childItem.comboBoxMatchElementUrl;
                option.text = childItem.comboBoxMatchElementText;
                childDropdown.add(option);
            });
        }
    }

    populateChildDropdown();
}