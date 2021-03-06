const ejs = require("ejs")
const fs = require("fs")
const cheerio = require("cheerio")
const { promisify } = require("util")

const readdirAs = promisify(fs.readdir)
const readFileAs = promisify(fs.readFile)
const writeFileAs = promisify(fs.writeFile)

const source_path = "results"
const template_path = "templates"
const output_filename = "results/index.html"

function structurizeByDate(files) {
  const filesWithDates = files.map(file => {
    file.date = new Date(Date.parse(file.stamp))
    return file
  })

  //years
  const dates = filesWithDates.reduce((acc, file) => {
    const key = file.date.getFullYear()

    if (acc[key] === undefined) acc[key] = []
    acc[key].push(file)

    return acc
  }, {})


  //months
  for (const year in dates) {
    dates[year] = dates[year].reduce((acc, file) => {
      const key = file.date.getMonth()

      if (acc[key] === undefined) acc[key] = []
      acc[key].push(file)

      return acc
    }, [])
  }

  //days
  for (const year in dates) {
    for (const month in dates[year]) {
      dates[year][month] = dates[year][month].reduce((acc, file) => {
        const key = file.date.getDate()

        if (acc[key] === undefined) acc[key] = []
        acc[key].push(file)

        return acc
      }, {})
    }
  }

  return dates
}

async function readRanksFromFile(filename) {
  const content = await readFileAs(filename)
  const $ = cheerio.load(content)

  return $('li').map( (i,li) => {
    
    const parts = $(li).text().trim().split(" in " )
    const numStr = parts[0].substr(1)
    const category = parts[1]
    
    return {
      rank: parseInt(numStr),
      category
    }
  }).toArray()
}

async function fillRankData(files) {
  return Promise.all(
    files.map(async file => {
      if (file.type != "position") return
      file.rank = await readRanksFromFile(`${source_path}/${file.filename}`)
    })
  )
}

async function run() {
  let files = await readdirAs(source_path)

  files = files.filter(fileName => fileName.endsWith(".html") && fileName !== "index.html")

  const filesInfo = files.map(filename => {
    const parts = filename.split("-")
    const stampStr = `${parts[2]}-${parts[3]}-${parts[4]}`.replace('.html', '')
    return {
      filename,
      type: parts[0],
      name: parts[1],
      stamp: stampStr
    }
  })

  await fillRankData(filesInfo)

  const html = await ejs.renderFile(`${template_path}/index.ejs`, {
    files: filesInfo,
    filesByDate: structurizeByDate(filesInfo)
  })

  const filename = process.argv[2] || output_filename
  await writeFileAs(filename, html)
}

run()
