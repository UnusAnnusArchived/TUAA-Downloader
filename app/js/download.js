const Downloader = remote.require('nodejs-file-downloader')
const ProgressBar = remote.require('electron-progressbar')
const fs = remote.require('fs')

var queue = []

document.getElementById('download').onclick = () => {
  startDownload()
}

async function startDownload() {
  const getVideo = document.getElementById('videos').checked
  const getThumbnail = document.getElementById('thumbnails').checked
  const getDescription = document.getElementById('description').checked
  const getMetadata = document.getElementById('metadata').checked
  const getSubs = document.getElementById('subs').checked
  const useIDs = document.getElementById('useids').checked
  
  if (queue.length == 0) {
    return alert('Please select at least one video!')
  }

  if (!getVideo && !getThumbnail && !getDescription && !getMetadata && !getSubs) {
    return alert('Please select at least one option!')
  }

  for (var i = 0; i < queue.length; i++) {
    const id = queue[i]

    const metadata = (await axios.get(`${apiURL}/v2/metadata/video/episode/${id}`)).data

    var filename = metadata.title
    if (useIDs) {
      filename = id
    }

    if (getVideo) {
      const videoProgress = new ProgressBar({
        indeterminate: false,
        text: '0%',
        detail: `Working on "${metadata.title}"<br />Video`,
        maxValue: 100
      })
      const videoDownload = new Downloader({
        url: 'https:' + metadata.sources[0].src,
        directory: `${dir}/Videos/${metadata.season == 0 ? 'Specials' : `Season ${metadata.season}`}/`,
        filename: `${filename}.mp4`,
        onProgress: (percent) => {
          videoProgress.value = parseFloat(percent)
          videoProgress.text = `${percent}%`
        }
      })
      try {
        await videoDownload.download()
      } catch (err) {
        console.log(err)
        alert(err)
      }
    }
    if (getThumbnail) {
      const thumbnailProgress = new ProgressBar({
        indeterminate: false,
        text: '0%',
        detail: `Working on "${metadata.title}"<br />Thumbnail`,
        maxValue: 100
      })
      const thumbnailDownload = new Downloader({
        url: 'https:' + metadata.posters[1].src,
        directory: `${dir}/Thumbnails/${metadata.season == 0 ? 'Specials' : `Season ${metadata.season}`}/`,
        filename: `${filename}.jpg`,
        onProgress: (percent) => {
          thumbnailProgress.value = parseFloat(percent)
          thumbnailProgress.text = `${percent}%`
        }
      })
      try {
        await thumbnailDownload.download()
      } catch (err) {
        console.log(err)
        alert(err)
      }
    }
    if (getDescription) {
      const descriptionProgress = new ProgressBar({
        indeterminate: false,
        text: '0%',
        detail: `Working on "${metadata.title}"<br />Description`,
        maxValue: 100
      })
      if (!fs.existsSync(`${dir}/Descriptions/${metadata.season == 0 ? 'Specials': `Season ${metadata.season}`}/`)) {
        fs.mkdirSync(`${dir}/Descriptions/${metadata.season == 0 ? 'Specials': `Season ${metadata.season}`}/`, { recursive: true })
      }
      fs.writeFileSync(`${dir}/Descriptions/${metadata.season == 0 ? 'Specials': `Season ${metadata.season}`}/${filename}.txt`, metadata.description)
      descriptionProgress.value = 100
      descriptionProgress.text = '100%'
    }
    if (getMetadata) {
      const metadataProgress = new ProgressBar({
        indeterminate: false,
        text: '0%',
        detail: `Working on "${metadata.title}"<br />Metadata`,
        maxValue: 100
      })
      if (!fs.existsSync(`${dir}/Metadata/${metadata.season == 0 ? 'Specials': `Season ${metadata.season}`}/`)) {
        fs.mkdirSync(`${dir}/Metadata/${metadata.season == 0 ? 'Specials': `Season ${metadata.season}`}/`, { recursive: true })
      }
      fs.writeFileSync(`${dir}/Metadata/${metadata.season == 0 ? 'Specials': `Season ${metadata.season}`}/${filename}.json`, JSON.stringify(metadata, null, 2))
      metadataProgress.value = 100
      metadataProgress.text = '100%'
    }
    if (getSubs) {
      for (var s = 0; s < metadata.tracks.length; s++) {
        if (metadata.tracks[s].kind == 'captions') {
          const subProgress = new ProgressBar({
            indeterminate: false,
            text: '0%',
            detail: `Working on "${metadata.title}"<br />Subtitles`,
            maxValue: 100
          })
          const subDownload = new Downloader({
            url: 'https:' + metadata.tracks[s].src,
            directory: `${dir}/Subtitles/${metadata.season == 0 ? 'Specials': `Season ${metadata.season}`}/`,
            filename: `${filename}.vtt`,
            onProgress: (percent) => {
              subProgress.value = parseFloat(percent)
              subProgress.text = `${percent}%`
            }
          })
          try {
            await subDownload.download()
          } catch (err) {
            console.log(err)
            alert(err)
          }
        }
      }
    }
  }
}

function idToNums(id) {
  const split = id.split('.')
  const season = parseInt(split[0].replace('s', ''))
  const episode = parseInt(split[1].replace('e', ''))
  return [season, episode]
}