const axios = remote.require('axios')

const apiURL = 'https://unusannusarchive.tk/api'

async function loadMetadata() {
  var metadata = (await axios.get(`${apiURL}/v2/metadata/video/all`)).data
  metadata = [...metadata[0], ...metadata[1]]
  document.getElementById('loading').remove()

  const listitems = document.getElementById('listitems')
  for (var i = 0; i < metadata.length; i++) {
    const template = document.getElementById('listtemplate').content.cloneNode(true)
    template.getElementById('title').innerText = metadata[i].title
    template.getElementById('season').innerText = metadata[i].season
    template.getElementById('episode').innerText = metadata[i].episode
    template.getElementById('id').innerText = `s${metadata[i].season.toString().padStart(2, '0')}.e${metadata[i].episode.toString().padStart(3, '0')}`

    listitems.appendChild(template)
  }
  initCheckboxes()
}

loadMetadata()