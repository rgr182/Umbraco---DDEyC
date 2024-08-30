function initSearchCombo(uniqueId, searchComboContents, dropdownDefaultText) {
    console.log('Initializing SearchCombo with:', { uniqueId, searchComboContents, dropdownDefaultText });

    const parentDropdown = document.getElementById(`parent-dropdown-${uniqueId}`);
    const childDropdown = document.getElementById(`child-dropdown-${uniqueId}`);
    const grandchildDropdown = document.getElementById(`grandchild-dropdown-${uniqueId}`);
    const searchIcon = document.getElementById(`search-icon-${uniqueId}`);

    console.log('Dropdowns:', { parentDropdown, childDropdown, grandchildDropdown, searchIcon });

    parentDropdown.selectedIndex = 0;
    childDropdown.selectedIndex = 0;
    grandchildDropdown.selectedIndex = 0;
    searchIcon.href = '#';

    function populateChildDropdown() {
        console.log('Setting up parent dropdown change event');
        parentDropdown.addEventListener('change', function () {
            const selectedParentValue = parentDropdown.value;
            console.log('Parent dropdown changed:', selectedParentValue);
            populateChildOptions(selectedParentValue, childDropdown, searchComboContents);
            resetGrandchildDropdown();
        });
    }

    function populateGrandchildDropdown() {
        console.log('Setting up child dropdown change event');
        childDropdown.addEventListener('change', function () {
            const selectedParentValue = parentDropdown.value;
            const selectedChildValue = childDropdown.value;
            console.log('Child dropdown changed:', { selectedParentValue, selectedChildValue });
            populateGrandchildOptions(selectedParentValue, selectedChildValue, grandchildDropdown, searchComboContents);
        });
    }

    function populateChildOptions(selectedParentValue, childDropdown, searchComboContents) {
        console.log('Populating child options for:', selectedParentValue);
        childDropdown.innerHTML = `<option value="" selected>${dropdownDefaultText}</option>`;
        const parentItem = searchComboContents.find(item => item.ComboBoxUserName === selectedParentValue);
        console.log('Found parent item:', parentItem);
        
        if (parentItem && parentItem.ComboBoxUserMatches) {
            parentItem.ComboBoxUserMatches.forEach(childItem => {
                const option = document.createElement('option');
                option.value = childItem.ComboBoxMatchElementText;
                option.text = childItem.ComboBoxMatchElementText;
                childDropdown.add(option);
                console.log('Added child option:', childItem.ComboBoxMatchElementText);
            });
        } else {
            console.log('No matches found for parent item');
        }
    }

    function populateGrandchildOptions(selectedParentValue, selectedChildValue, grandchildDropdown, searchComboContents) {
        console.log('Populating grandchild options for:', { selectedParentValue, selectedChildValue });
        grandchildDropdown.innerHTML = `<option value="" selected>${dropdownDefaultText}</option>`;
        const parentItem = searchComboContents.find(item => item.ComboBoxUserName === selectedParentValue);
        console.log('Found parent item:', parentItem);
        
        if (parentItem && parentItem.ComboBoxUserMatches) {
            const childItem = parentItem.ComboBoxUserMatches.find(item => item.ComboBoxMatchElementText === selectedChildValue);
            console.log('Found child item:', childItem);
            
            if (childItem && childItem.ComboBoxMatchElementUrl) {
                childItem.ComboBoxMatchElementUrl.forEach(grandchildItem => {
                    const option = document.createElement('option');
                    option.value = grandchildItem.ComboBoxThirdUrl;
                    option.text = grandchildItem.ComboBoxThirdText;
                    grandchildDropdown.add(option);
                    console.log('Added grandchild option:', grandchildItem.ComboBoxThirdText);
                });
            } else {
                console.log('No URLs found for child item');
            }
        } else {
            console.log('No matches found for parent item');
        }
    }

    function resetGrandchildDropdown() {
        console.log('Resetting grandchild dropdown');
        grandchildDropdown.innerHTML = `<option value="" selected>${dropdownDefaultText}</option>`;
    }

    function updateSearchIconUrl() {
        console.log('Setting up grandchild dropdown change event');
        grandchildDropdown.addEventListener('change', function () {
            searchIcon.href = this.value;
            console.log('Updated search icon URL:', this.value);
        });
    }

    populateChildDropdown();
    populateGrandchildDropdown();
    updateSearchIconUrl();

    console.log('SearchCombo initialization complete');
}