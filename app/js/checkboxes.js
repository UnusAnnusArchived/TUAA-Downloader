function initCheckboxes() {
  const checkboxes = document.getElementsByClassName('episodecheckbox')
  for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].addEventListener('change', function() {
      const id = this.parentElement.querySelector('#id').innerText
      if (this.checked) {
        queue.push(id)
      } else {
        queue.splice(queue.indexOf(id), 1)
      }
    })
  }
}

function toggleAll() {
  const checkboxes = document.getElementsByClassName('episodecheckbox')
  const checked = document.getElementById('toggleallchecks').checked
  for (var i = 0; i < checkboxes.length; i++) {
    if (!checkboxes[i].checked && checked) {
      checkboxes[i].click()
    } else if (checkboxes[i].checked && !checked) {
      checkboxes[i].click()
    }
  }
}