const Downloader = remote.require('nodejs-file-downloader')
const ProgressBar = remote.require('electron-progressbar')
const fs = remote.require('fs')

const logArea = document.getElementById('log')

var queue = []
var progressLine;
var downloader
var cancel = false;

document.getElementById('download').onclick = () => {
  startDownload()
}

document.getElementById('cancel').onclick = () => {
  cancelDownload()
}

// trigger cancellation of downloads
async function cancelDownload() {
  cancel = true;
  if (downloader) {
    downloader.cancel();
  }
}

async function startDownload() {
  cancel = false;
  logArea.innerHTML = ""

  const getVideo = document.getElementById('videos').checked
  const getThumbnail = document.getElementById('thumbnails').checked
  const getDescription = document.getElementById('description').checked
  const getMetadata = document.getElementById('metadata').checked
  const getSubs = document.getElementById('subs').checked
  const getSkipExisting = document.getElementById('skipExisting').checked
  
  if (queue.length == 0) {
    return alert('Please select at least one video!')
  }

  if (!getVideo && !getThumbnail && !getDescription && !getMetadata && !getSubs) {
    return alert('Please select at least one option!')
  }

  UiInactive(true)

  // interate over checked entries
  for (var i = 0; i < queue.length; i++) {

    // abort if cancel was pressed
    if (cancel) {
      addToLog('Download cancelled.', "WARN")
      UiInactive(false)
      break
    }

    // prepare metadata of item
    const id = queue[i]

    var metadata

    try {
      metadata = (await fetch(`${apiURL}/v2/metadata/episode/${id}`).then(res => res.json()))
      metadata.title = metadata.title.replace(/w\//gi, 'with').replace(/\//g, '').replace(/</g, '').replace(/>/g, '').replace(/:/g, ' -').replace(/"/g, '\'').replace(/\\/g, '').replace(/\|/g, 'l').replace(/\?/g, '').replace(/\*/g, '')
    } catch(err) {
      addToLog(err, "ERROR")
      continue
    }
    
    var filename = document.getElementById('filename').value
      .replace(/{title}/g,    metadata.title)                                                                                         // title
      .replace(/{season}/g,   metadata.season.toString().padStart(2, '0'))                                                            // season
      .replace(/{episode}/g,  metadata.episode.toString().padStart(3, '0'))                                                           // episode
      .replace(/{id}/g,       `s${metadata.season.toString().padStart(2, '0')}.e${metadata.episode.toString().padStart(3, '0')}`)     // id
      .trim()

      
    // Create lines for the progressbars
    var nameLine = addToLog(`Processing '${filename}:`)
    progressLine = addToLog('')
    var subFolder = `${metadata.season == 0 ? 'Specials' : `Season ${metadata.season}`}/`

    if (getVideo) {
      var fileType = '.mp4'
      var type = 'Videos'

      var skippedToEnd = false

      downloader = new Downloader({
        url: 'https:' + (metadata.sources?.[0].src || metadata.video),
        directory: `${dir}/${type}/${subFolder}`,
        filename: `${filename}${fileType}`,
        skipExistingFileName: getSkipExisting,
        onProgress: (percent) => {
          handleProgressUpdate(skippedToEnd, percent)
        }
      })
      try {
        nameLine.innerText += ' V'
        await downloader.download()
      } catch (err) {
        if (err.code !== "ERR_REQUEST_CANCELLED") {
          addToLog(err, "ERROR")
        }
      }
    }

    if (getThumbnail) {
      var fileType = '.jpg'
      var type = 'Thumbnails'
      
      var skippedToEnd = false

      downloader = new Downloader({
        url: 'https:' + (metadata.posters?.[1].src || metadata.thumbnail),
        directory: `${dir}/${type}/${subFolder}`,
        filename: `${filename}${fileType}`,
        skipExistingFileName: getSkipExisting,
        onProgress: (percent) => {
          handleProgressUpdate(skippedToEnd, percent)
        }
      })
      try {
        nameLine.innerText += ' T'
        await downloader.download()
      } catch (err) {
        if (err.code !== "ERR_REQUEST_CANCELLED") {
          addToLog(err, "ERROR")
        }
      }
    }

    if (getDescription) {
      var fileType = '.txt'
      var type = 'Descriptions'

      writeToFile(`${dir}/${type}/${subFolder}`, `${filename}${fileType}`, metadata.description)
      nameLine.innerText += ' D'
    }

    if (getMetadata) {
      var fileType = '.json'
      var type = 'Metadata'

      var skippedToEnd = false

      writeToFile(`${dir}/${type}/${subFolder}`, `${filename}${fileType}`, JSON.stringify(metadata, null, 2))
      nameLine.innerText += ' M'
    }

    if (getSubs) {
      var fileType = '.vtt'
      var type = 'Subtitles'

      for (var s = 0; s < metadata.tracks?.length || 0; s++) {
        if (metadata.tracks[s].kind == 'captions') {

          // Create an empty line for the progressbar
          addToLog('')

          var skippedToEnd = false

          downloader = new Downloader({
            url: 'https:' + metadata.tracks[s].src,
            directory: `${dir}/${type}/${subFolder}`,
            filename: `${filename}${fileType}`,
            onProgress: (percent) => {
              handleProgressUpdate(skippedToEnd, percent)
            }
          })
          try {
            nameLine.innerText += ' S'
            await downloader.download()
          } catch (err) {
            if (err.code !== "ERR_REQUEST_CANCELLED") {
              addToLog(err, "ERROR")
            }
          }
        }
      }
    }

    logArea.removeChild(progressLine)
  }

  addToLog("Download finished.")
  UiInactive(false)
}

/////////
// Helper functions
////////

function handleProgressUpdate(skippedToEnd, percent) {
  progressLine.innerText = getProgressString(percent)
              
  if (!skippedToEnd) {
    skippedToEnd = true
    logArea.scrollTop = logArea.scrollHeight;
  }
}

function UiInactive(active) {
  var elements = new Array()

  elements.push(document.getElementById('videos'))
  elements.push(document.getElementById('thumbnails'))
  elements.push(document.getElementById('description'))
  elements.push(document.getElementById('metadata'))
  elements.push(document.getElementById('subs'))
  elements.push(document.getElementById('skipExisting'))
  elements.push(document.getElementById('listitems'))
  elements.push(document.getElementById('filename'))
  elements.push(document.getElementById('change-path'))
  elements.push(document.getElementById('download'))
  elements.push(document.getElementById('toggleallchecks'))

  document.querySelectorAll('.episodecheckbox').forEach(
    listitem => {
      elements.push(listitem)
    }
  )  
  
  elements.forEach(element => {
    element.disabled = state
  });
}

// add a string into the logging area on screen
function addToLog(message, level) {
  var entry = document.createElement("p")

  if (!level) {
    entry.innerText = `${message}`
  } else {
    entry.innerText = `${level} - ${message}`
  }

  entry.style.fontFamily = "Consolas"

  logArea.appendChild(entry)
  logArea.scrollTop = logArea.scrollHeight;

  return entry
}

function writeToFile(path, file, content) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true })
  }
  fs.writeFileSync(`${path}${file}`, content)
}

function getProgressString(percent) {
  
  var value = parseInt((percent/100)*30)

  var progress = ''
  var filler = ''
  for (var i=0; i<value; i++) {
    progress += '-'
  }

  var filler = ''
  for (var i=0; i<30-value; i++) {
    filler += '.'
  }

  return `|${progress}${filler}| ${percent}`
}

function idToNums(id) {
  const split = id.split('.')
  const season = parseInt(split[0].replace('s', ''))
  const episode = parseInt(split[1].replace('e', ''))
  return [season, episode]
}
