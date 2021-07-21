function hang(fun, time) {
  let handle = null

  return function () {
    handle && clearTimeout(handle)
    handle = setTimeout(fun, time)
  }
}

function swapIframe(filename) {
  document.getElementById("preview").src = `results/${filename}`
}

function getDisplayname(fileInfo) {
  const d = fileInfo.date
  const dateStr = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
  const timeStr = `${d.getHours()}:${d.getMinutes()}`
  const dateTimeStr = `${dateStr} ${timeStr}`

  return `${fileInfo.name} ${dateTimeStr}`
}

function printList(files, target) {
  console.log(files)
  const nodeList = files.map(
    file => {
      const elem = document.createElement("li")
      elem.innerText = getDisplayname(file)
      elem.addEventListener("click", () => { swapIframe(file.filename) })
      return elem
    }
  )

  const list = document.getElementById(target)
  list.innerHTML = ""

  nodeList.forEach(node => list.append(node))
}

function printFilteredList() {

  const month = document.getElementById("month").value
  const day = document.getElementById("day").value

  const filteredFiles = files.filter(
    file => file.date.getMonth() == month
      && file.date.getDate() == day
  )

  printList(filteredFiles.filter(file => file.type == "index"), "index")
  printList(filteredFiles.filter(file => file.type == "position"), "position")
}

function hookupListeners() {
  const ids = ["month", "day"]

  const delayedPrint = hang(printFilteredList, 500)

  ids.forEach(id => {
    document.getElementById(id).addEventListener("change", delayedPrint)
  })
}

hookupListeners()


