function InitializeDropdown() {
    var mainDropdown = document.getElementById('dropdown-menu');
    var subDropdowns = document.querySelectorAll('.sub-dropdown');

    document.getElementById('foreignLanguagesDropdownBtn').addEventListener('click', function() {
        mainDropdown.classList.toggle('hidden');
    });

    for (var i = 0; i < subDropdowns.length; i++) {
        var item = subDropdowns[i].parentNode;

        item.addEventListener('mouseenter', function() {
            this.querySelector('.sub-dropdown').classList.remove('hidden');
        });

        item.addEventListener('mouseleave', function() {
            this.querySelector('.sub-dropdown').classList.add('hidden');
        });
    }
}

function DropDownFlipper()
{
    var menu = document.getElementById('masterDropDownMenu');
    if (menu.style.display === 'none')
    {
        menu.style.display = 'block';
    }
    else
    {
        menu.style.display = 'none';
    }
}