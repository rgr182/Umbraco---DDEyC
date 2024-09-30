function initSearchCombo(uniqueId, searchComboContents, dropdownDefaultText) {
    

    const parentDropdown = document.getElementById(`parent-dropdown-${uniqueId}`);
    const childDropdown = document.getElementById(`child-dropdown-${uniqueId}`);
    const grandchildDropdown = document.getElementById(`grandchild-dropdown-${uniqueId}`);
    const searchIcon = document.getElementById(`search-icon-${uniqueId}`);

    

    parentDropdown.selectedIndex = 0;
    childDropdown.selectedIndex = 0;
    grandchildDropdown.selectedIndex = 0;
    searchIcon.href = '#';

    function populateChildDropdown() {
        
        parentDropdown.addEventListener('change', function () {
            const selectedParentValue = parentDropdown.value;
            
            populateChildOptions(selectedParentValue, childDropdown, searchComboContents);
            resetGrandchildDropdown();
        });
    }

    function populateGrandchildDropdown() {
        
        childDropdown.addEventListener('change', function () {
            const selectedParentValue = parentDropdown.value;
            const selectedChildValue = childDropdown.value;
            
            populateGrandchildOptions(selectedParentValue, selectedChildValue, grandchildDropdown, searchComboContents);
        });
    }

    function populateChildOptions(selectedParentValue, childDropdown, searchComboContents) {
        
        childDropdown.innerHTML = `<option value="" selected>${dropdownDefaultText}</option>`;
        const parentItem = searchComboContents.find(item => item.ComboBoxUserName === selectedParentValue);
        
        
        if (parentItem && parentItem.ComboBoxUserMatches) {
            parentItem.ComboBoxUserMatches.forEach(childItem => {
                const option = document.createElement('option');
                option.value = childItem.ComboBoxMatchElementText;
                option.text = childItem.ComboBoxMatchElementText;
                childDropdown.add(option);
                
            });
        } else {
            
        }
    }

    function populateGrandchildOptions(selectedParentValue, selectedChildValue, grandchildDropdown, searchComboContents) {
        
        grandchildDropdown.innerHTML = `<option value="" selected>${dropdownDefaultText}</option>`;
        const parentItem = searchComboContents.find(item => item.ComboBoxUserName === selectedParentValue);
        
        
        if (parentItem && parentItem.ComboBoxUserMatches) {
            const childItem = parentItem.ComboBoxUserMatches.find(item => item.ComboBoxMatchElementText === selectedChildValue);
            
            
            if (childItem && childItem.ComboBoxMatchElementUrl) {
                childItem.ComboBoxMatchElementUrl.forEach(grandchildItem => {
                    const option = document.createElement('option');
                    option.value = grandchildItem.ComboBoxThirdUrl;
                    option.text = grandchildItem.ComboBoxThirdText;
                    grandchildDropdown.add(option);
                    
                });
            } else {
                
            }
        } else {
            
        }
    }

    function resetGrandchildDropdown() {
        
        grandchildDropdown.innerHTML = `<option value="" selected>${dropdownDefaultText}</option>`;
    }

    function updateSearchIconUrl() {
        
        grandchildDropdown.addEventListener('change', function () {
            searchIcon.href = this.value;
            
        });
    }

    populateChildDropdown();
    populateGrandchildDropdown();
    updateSearchIconUrl();

    
}