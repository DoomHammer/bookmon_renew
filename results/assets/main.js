function hang(fun, time) {
  let handle = null

  return function () {
    handle && clearTimeout(handle)
    handle = setTimeout(fun, time)
  }
}

function swapIframe(filename) {
  document.getElementById("preview").src = `/${filename}`
}

function renderListItem(fileInfo) {

  //setup name
  const d = fileInfo.date
  const dateStr = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
  const timeStr = `${d.getHours()}:${d.getMinutes()}`
  const dateTimeStr = `${dateStr} ${timeStr}`
  const name = `${fileInfo.name} ${dateTimeStr}`


  let rank = []
  if (fileInfo.type == "position") {
    //setup rank
    rank = Object.values(fileInfo.rank)
    rank = rank.sort((a, b) => a.category.localeCompare(b.category))
    rank = rank.map(r => {
      const elem = document.createElement("span")
      elem.innerText = `#${r.rank}`
      elem.title = `#${r.rank} in ${r.category}`
      elem.className = "category-rank"
      return elem
    })
  }

  //glue together
  const elem = document.createElement("li")
  const nodesToAppend = []
  elem.addEventListener("click", () => { swapIframe(fileInfo.filename) })

  nodesToAppend.push(document.createTextNode(name))

  if (fileInfo.type == "position") {
    nodesToAppend.push(document.createTextNode(' ('))
    for (let i = 0; i < rank.length; i++) {
      nodesToAppend.push(rank[i])
      if (i != rank.length - 1)
        nodesToAppend.push(document.createTextNode(' '))
    }
    nodesToAppend.push(document.createTextNode(')'))
  }

  nodesToAppend.forEach(node => elem.append(node))

  return elem
}

function getDisplayname(fileInfo) {
  const d = fileInfo.date
  const dateStr = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
  const timeStr = `${d.getHours()}:${d.getMinutes()}`
  const dateTimeStr = `${dateStr} ${timeStr}`

  return `${fileInfo.name} ${dateTimeStr}`
}

function printList(files, target) {
  const nodeList = files.map(renderListItem)

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

function renderSelectElement(name, id, values, texts = []) {
  const label = document.createElement("label")
  label.innerText = name

  const select = document.createElement("select")
  select.id = id

  const optionList = values.map((val, i) => {
    const option = document.createElement("option")
    option.value = val
    option.innerText = texts[i] || val
    return option
  })

  optionList.forEach(option => select.appendChild(option))
  label.appendChild(select)
  return label
}

function notNullKeys(obj) {
  let keys = Object.keys(obj)
  return keys.filter(key => obj[key] != null)
}

function renderControlsYear() {
  const yearKeys = notNullKeys(filesByDate)

  const yearSelect = renderSelectElement("Year", "year", yearKeys)
  yearSelect.addEventListener("change", () => { renderControlsMonth() })

  const target = document.getElementById("yearc")
  target.innerHTML = ""
  target.appendChild(yearSelect)

  renderControlsMonth()
}

function renderControlsMonth() {
  const allMonthsNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  const year = document.getElementById("year").value
  const monthKeys = notNullKeys(filesByDate[year])
  const monthNames = monthKeys.map(n => allMonthsNames[n])

  const monthSelect = renderSelectElement("Month", "month", monthKeys, monthNames)
  monthSelect.addEventListener("change", () => { renderControlsDay() })

  const target = document.getElementById("monthc")
  target.innerHTML = ""
  target.appendChild(monthSelect)

  renderControlsDay()
}

function renderControlsDay() {
  const delayedPrint = hang(printFilteredList, 500)

  const year = document.getElementById("year").value
  const month = document.getElementById("month").value
  const dayKeys = notNullKeys(filesByDate[year][month])

  const daySelect = renderSelectElement("Day", "day", dayKeys)
  daySelect.addEventListener("change", () => { delayedPrint() })

  const target = document.getElementById("dayc")
  target.innerHTML = ""
  target.appendChild(daySelect)
  delayedPrint()
}

renderControlsYear()


