window.onload = function () {
    initSearchCombo(uniqueId, searchComboContents, DefaultText);
}

function initSearchCombo(uniqueId, searchComboContents, dropdownDefaultText) {
    const parentDropdown = document.getElementById(`parent-dropdown-${uniqueId}`);
    const childDropdown = document.getElementById(`child-dropdown-${uniqueId}`);
    const thirdDropdown = document.getElementById(`third-dropdown-${uniqueId}`);
    const searchIcon = document.getElementById(`search-icon-${uniqueId}`);
    parentDropdown.selectedIndex = 0;
    childDropdown.selectedIndex = 0;
    thirdDropdown.selectedIndex = 0;
    searchIcon.href = '#';

    parentDropdown.addEventListener('change', function () {
        const selectedParentValue = parentDropdown.selectedIndex - 1;
        populateChildOptions(selectedParentValue, childDropdown, searchComboContents);
    });

    childDropdown.addEventListener('change', function () {
        const selectedChildIndex = childDropdown.selectedIndex - 1;
        populateThirdOptions(selectedChildIndex, selectedParentValue, thirdDropdown, searchComboContents);
    });

    thirdDropdown.addEventListener('change', function () {
        searchIcon.href = this.value; // Update the href of the search icon
    });

    function populateChildOptions(selectedParentIndex, childDropdown, searchComboContents) {
        childDropdown.innerHTML = `<option value="" selected>${dropdownDefaultText}</option>`;
        if (selectedParentIndex <= -1) return;
        const parentItem = searchComboContents.blocksList[selectedParentIndex];
        if (parentItem && parentItem.content.comboBoxUserName) {
            parentItem.content.comboBoxUserMatches.forEach(childItem => {
                const option = document.createElement('option');
                option.value = childItem.comboBoxMatchElementText;
                option.text = childItem.comboBoxMatchElementText;
                childDropdown.add(option);
            });
        }
    }

    function populateThirdOptions(selectedChildIndex, selectedParentIndex, thirdDropdown, searchComboContents) {
        thirdDropdown.innerHTML = `<option value="" selected>${dropdownDefaultText}</option>`;
        if (selectedChildIndex <= -1) return;
        const parentItem = searchComboContents.blocksList[selectedParentIndex];
        const childItem = parentItem.content.comboBoxUserMatches[selectedChildIndex];
        if (childItem && childItem.comboBoxMatchElementUrl) {
            childItem.comboBoxMatchElementUrl.forEach(thirdItem => {
                const option = document.createElement('option');
                option.value = thirdItem.ComboBoxThirdUrl;
                option.text = thirdItem.ComboBoxThirdTitle; // Display the title
                thirdDropdown.add(option);
            });
        }
    }
}
