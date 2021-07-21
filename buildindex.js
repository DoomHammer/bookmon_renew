const ejs = require("ejs")
const fs = require("fs")
const { promisify } = require("util")

const readdirAs = promisify(fs.readdir)
const writeFileAs = promisify(fs.writeFile)

const source_path = "results"
const template_path = "templates"
const output_filename = "results/index.html"

async function run() {
  const files = await readdirAs(source_path)

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

  const html = await ejs.renderFile(`${template_path}/index.ejs`, {
    files: filesInfo,
  })

  const filename = process.argv[2] || output_filename
  await writeFileAs(filename, html)
}

run()
