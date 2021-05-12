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

    template.querySelector('.listitem').setAttribute('data-metadata', JSON.stringify(metadata[i]))

    listitems.appendChild(template)
  }
  //Do filesizes seperately so it doesn't take forever to fetch each file

  initCheckboxes()
  
  {
    const listitems = document.getElementsByClassName('listitem')
    for (var i = 0; i < listitems.length; i++) {
      const metadata = JSON.parse(listitems[i].getAttribute('data-metadata'))
      const filesizeUrl = 'https://cdn.unusannusarchive.tk/filesize.php?path='
      var filesize
      if (metadata.sources) {
        //V2 metadata
        filesize = (await axios.get(`${filesizeUrl}/${metadata.season.toString().padStart(2, '0')}/${metadata.episode.toString().padStart(3, '0')}/${metadata.sources[0].size}.mp4`)).data.filesize
      } else {
        //V1 metadata
        filesize = (await axios.get(`${filesizeUrl}/${metadata.season.toString().padStart(2, '0')}/${metadata.episode.toString().padStart(3, '0')}.mp4`)).data.filesize
      }
      listitems[i].querySelector('#filesize').innerText = Math.round(filesize.mb*100)/100 + ' MB'
    }
  }
}

loadMetadata()