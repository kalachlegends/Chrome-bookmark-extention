let leftSelectDocument = document.querySelector("#leftSelect");
let rightSelectDocument = document.querySelector("#rightSelect");
document.onclick = hideMenu;
leftSelectDocument.oncontextmenu = rightClick;
rightSelectDocument.oncontextmenu = rightClick;

document.onkeydown = hideMenu;
let copySelector = document.querySelector(".copy");
function hideMenu(e) {
  document.getElementById("contextMenu").style.display = "none";
}
let ContextMenuGlobal = {
  text: "",
  id: "",
  link: "",
  element: "",
  allElementVal: [],
  folder: false,
  selected: true,
  selectedLorR: "",
};

function replaceFolderString(string) {
  return string.replace("[", "").replace("]", "");
}
function rightClick(e) {
  e.preventDefault();

  ContextMenuGlobal.allElementVal = [...e.composedPath()[1].options];
  ContextMenuGlobal.id = e.composedPath()[0].value;
  ContextMenuGlobal.link = e.composedPath()[0].dataset.href;
  ContextMenuGlobal.element = e.composedPath()[0];
  ContextMenuGlobal.selectedLorR = e.composedPath()[1].id;
  ContextMenuGlobal.folder = parseInt(e.composedPath()[0].dataset.folder);
  ContextMenuGlobal.selected = e.composedPath()[1].id;
  ContextMenuGlobal.text = replaceFolderString(e.composedPath()[0].text);
  if (true == ContextMenuGlobal.folder)
    ContextMenuGlobal.text = replaceFolderString(e.composedPath()[0].text);
  else ContextMenuGlobal.text = e.composedPath()[0].text;
  let linkElementDrop = $(".link-drop");
  let linkElement = $(".link");
  let moveToLeftSelectBtn = $("#moveToLeftSelectBtn");
  let moveToRightSelectBtn = $("#moveToRightSelectBtn");

  let optionSelected = ContextMenuGlobal.allElementVal.filter(
    (option) => option.selected
  );
  linkElementDrop.attr("href", ContextMenuGlobal.link);
  if (document.getElementById("contextMenu").style.display == "block") {
    hideMenu();
  } else {
    var menu = document.getElementById("contextMenu");
    menu.style.display = "block";
    menu.style.left = e.pageX + "px";
    menu.style.top = e.pageY + "px";
  }
  optionSelected = ContextMenuGlobal.allElementVal.filter(
    (option) => option.selected
  );
  if (optionSelected.length == 0) {
    console.log("---as");
    addSelectOptionByValue(e.composedPath()[1].id, ContextMenuGlobal.id);
  }
  if (e.composedPath()[1].id == "rightSelect") {
    moveToLeftSelectBtn.show();
    moveToRightSelectBtn.hide();
  }
  if (e.composedPath()[1].id == "leftSelect") {
    moveToLeftSelectBtn.hide();
    moveToRightSelectBtn.show();
  }
  if (ContextMenuGlobal.folder != 0) {
    linkElementDrop.hide();
    linkElement.hide();
  } else {
    linkElementDrop.show();
    linkElement.show();
  }
}
function copyTextClipBoard(text) {
  navigator.clipboard.writeText(text);
}
function removeBookmark(id) {
  chrome.bookmarks.remove(id);
}
function removeBookmarkTree(id) {
  chrome.bookmarks.removeTree(id);
}
function updateBookmark(id, title, url) {
  if (true != ContextMenuGlobal.folder) {
    chrome.bookmarks.update(
      id,
      {
        title: title,
        url: url,
      },
      function (e) {
        errorALERTER(e);
      }
    );
  } else {
    chrome.bookmarks.update(
      id,
      {
        title: title,
      },
      function (e) {
        errorALERTER(e);
      }
    );
  }
}
$(".trash").click(function () {
  try {
    let filterValue = ContextMenuGlobal.allElementVal
      .filter((option) => option.selected)
      .map((option) => option.value);
    if (filterValue == 0) throw new Error("No selected items!");
    let allFolder = ContextMenuGlobal.allElementVal
      .filter((option) => option.selected)
      .map((option) => option.dataset.folder);
    let selectedElement = ContextMenuGlobal.allElementVal.filter(
      (option) => option.selected
    );
    let text = `Delete - ${selectedElement[0].textContent} ?`;
    if (filterValue.length > 1) text = `${filterValue.length} - delete object?`;
    Delete.fire({
      text: text,
    }).then((result) => {
      if (result.isConfirmed) {
        if (filterValue.length >= 1) {
          filterValue.forEach(function (e, i) {
            if (allFolder[i] != true) {
              removeBookmark(e);
            } else {
              removeBookmarkTree(e);
            }

            selectedElement[i].remove();
          });
        } else {
          text = filterValue.length;
          let booleanFolder = selectedElement[0].dataset.folder;
          if (booleanFolder != true) {
            removeBookmark(selectedElement[0].value);
          } else {
            removeBookmarkTree(selectedElement[0].value);
          }
        }

        ifCurrentReload(this.dataset.select);
        Swal.fire("Deleted!", "Your file has been deleted.", "success");
      }
    });
  } catch (e) {
    errorALERTERSwal(e);
  }
});

$(".moveUp").click(function () {
  try {
    let element,
      filterValue,
      selectedElement,
      select = this.dataset.select,
      currentId;
    if (select == undefined) select = ContextMenuGlobal.selected;
    currentId = getCurrentID(select);
    if (select == "leftSelect") {
      element = Array.from(document.querySelectorAll("#leftSelect option"));
    } else if (select == "rightSelect") {
      element = Array.from(document.querySelectorAll("#rightSelect option"));
    } else element = ContextMenuGlobal.allElementVal;
    checkRootFolder(currentId);

    selectedElement = element.filter((option) => option.selected);
    if (selectedElement.length == 0) throw new Error("No selected items");
    filterValue = element
      .filter((option) => option.selected)
      .map((option) => option.value);
    globalValues.bookmarks.options.prevElement = filterValue;
    moveUpOrFall(true, selectedElement);
    ifCurrentReload(select);
    alertSuccessSwal("Top move " + selectedElement.length + " items");
    addSetAtributHtmlArray(select, filterValue);
  } catch (e) {
    errorALERTERSwal(e);
  }
});
$(".moveBottom").click(function () {
  try {
    let element,
      filterValue,
      selectedElement,
      select = this.dataset.select,
      currentId;
    if (select == undefined) select = ContextMenuGlobal.selected;
    currentId = getCurrentID(select);

    if (select == "leftSelect") {
      element = Array.from(document.querySelectorAll("#leftSelect option"));
    } else if (select == "rightSelect") {
      element = Array.from(document.querySelectorAll("#rightSelect option"));
    } else element = ContextMenuGlobal.allElementVal;
    checkRootFolder(currentId);

    selectedElement = element.filter((option) => option.selected);
    if (selectedElement.length == 0) throw new Error("No selected items");
    filterValue = element
      .filter((option) => option.selected)
      .map((option) => option.value);
    moveUpOrFall(false, selectedElement);
    ifCurrentReload(select);
    alertSuccessSwal("Bottom move " + selectedElement.length + " items");
    addSetAtributHtmlArray(select, filterValue);
  } catch (e) {
    errorALERTERSwal(e);
  }
});
function addSetAtributHtmlArray(arrayLeft, idArray) {
  setTimeout(function () {
    idArray.forEach(function (e) {
      console.log(
        document.querySelector("#" + arrayLeft + ` option[value="${e}"]`)
      );
      document
        .querySelector("#" + arrayLeft + ` option[value="${e}"]`)
        .setAttribute("selected", true);
    });
  }, 55);
}
function addSelectOptionByValue(selected, id) {
  document
    .querySelector("#" + selected + ` option[value="${id}"]`)
    .setAttribute("selected", true);
}
function removeelectOptionByValue(selected, id) {
  $("#" + selected + ` option[value="${id}"]`).removeAttr("selected");
}
function moveUpOrFall(boolean, array) {
  if (boolean == true) {
    for (let i = 0; i < array.length; i++) {
      const e = array[i];
      let id = e.value,
        index = e.dataset.index,
        parentId = e.dataset.parent;
      if (e.dataset.index == "0") {
        throw new Error("no further");
      }
      moveDir(id, index - 1, parentId);
    }
  } else {
    let i = array.length - 1;
    for (i; i >= 0; i--) {
      const e = array[i];
      let id = e.value,
        index = parseInt(e.dataset.index),
        parentId = e.dataset.parent;

      index = index + 2;

      moveDir(id, index, parentId);
    }
  }
}

function moveDir(id, index, parentId) {
  chrome.bookmarks.move(
    id,
    {
      index: index,
      parentId: parentId,
    },
    function (e) {
      errorALERTER(e);
    }
  );
}
function errorALERTERSwal(mesage) {
  Toast.fire({
    icon: "error",
    title: mesage,
  });
}
function alertSuccessSwal(mesage) {
  Toast.fire({
    icon: "success",
    title: mesage,
  });
}
$(".copy").click(function () {
  copyTextClipBoard(ContextMenuGlobal.text);
});
$(".link").click(function () {
  copyTextClipBoard(ContextMenuGlobal.link);
});

$(".udpate").click(function () {
  Swal.fire({
    title: `Update `,
    text: "You won't be able to revert this!",
    icon: "warning",
    html:
      '<input id="swal-input1" class="swal2-input">' +
      '<input id="swal-input2" class="swal2-input">',
    willOpen: function () {
      $("#swal-input1").focus();
      let udpateURL = $("#swal-input2");
      if (ContextMenuGlobal.folder == true) udpateURL.hide();
      else udpateURL.show();

      $("#swal-input1").val(ContextMenuGlobal.text);
      udpateURL.val(ContextMenuGlobal.link);
    },
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes!",
  }).then((result) => {
    if (result.isConfirmed) {
      let title = $("#swal-input1").val();
      let url = $("#swal-input2").val();

      updateBookmark(ContextMenuGlobal.id, title, url);
      if (ContextMenuGlobal.folder == true) title = "[" + title + "]";
      ContextMenuGlobal.element.innerHTML = title;

      ifCurrentReload(this.dataset.select);
      Toast.fire({
        icon: "success",
        title: `Title: ${title}`,
        text: `Url: ${url}`,
      });
    }
  });
});

const Delete = Swal.mixin({
  title: "Are you sure?",
  text: "You won't be able to revert this!",
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  confirmButtonText: "Yes, delete it!",
});

function ifCurrentReload(select) {
  if (!checkSearch()) {
    if (select == "leftSelect") {
      if (checkSearch(select)) {
        reloadFunc(select);
      }
    }
    if (select == "rightSelect") {
      if (checkSearch(select)) {
        reloadFunc(select);
      }
    }
  } else {
    reloadFunc();
  }
}
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

let input = document.querySelector(".input-file");
input.onchange = readFile;
function readFile(input) {
  let file = input.target.files[0];
  console.log(input.target.files[0]);
  let reader = new FileReader();

  reader.readAsText(file);

  reader.onload = function () {
    console.log(reader.result);
    let resultLebgth = parserIni(reader.result);
    ifCurrentReload("leftSelect");
    console.log(resultLebgth);
  };

  reader.onerror = function () {
    console.log(reader.error);
  };
}
function parserIni(text) {
  let mathTitleAndLink = text.match(/[^\]]#\s+[^&]+\s+&\s+(.+)/g);

  let mathTitle = text.match(
      /\[0\]\$\s+[^&]+(\s>+(\[\d+\])?(#|\$)\s+[^&]+(&|%)(\s+[^&|%]+?)?\n)+/g
    ),
    currentId = getCurrentID("leftSelect"),
    resultFolder = [],
    resultUrl = [];
  console.log(mathTitle);
  if (mathTitleAndLink != null) {
    mathTitleAndLink.reverse().forEach((element) => {
      let title = element.match(/#\s+[^&]+/)[0].replace(/#\s+/, ""),
        url = element.match(/&\s+.+/g)[0].replace(/& /, "");
      createBookmark(0, url, title, currentId, function (e) {
        if (e != null) resultUrl.push(e);
      });
    });
  }
  if (mathTitle != null) {
    mathTitle.forEach((element) => {
      let arrayArrow = element.match(/\[\d+\]/g),
        lengthArray = parseInt(
          arrayArrow[arrayArrow.length - 1].replace(/(\[|\])/g, "")
        );
      console.log(lengthArray);

      console.log(insertForTxt(element, 0, lengthArray, currentId));
    });
  }
  return { resultFolder: resultFolder, resultUrl: resultUrl };
}

function insertForTxt(
  element,
  iteration,
  lastIteration,
  idParent,
  resultFolder = [],
  booleanParent = true
) {
  let stringArrow = "",
    folderRegex,
    regexLinks,
    mathLiks,
    mathFoldersAndID,
    matchFolfders;
  for (let i = 0; i < iteration; i++) stringArrow = stringArrow + ">";
  if (iteration == 0) stringArrow = stringArrow + ">";
  folderRegex = new RegExp(`\\[${iteration}\\]\\$\\s+\[^&#\n]+`, "g");
  let titleFolder = element.match(folderRegex)[0];

  if (booleanParent) {
    createBookmark(
      0,
      "",
      titleFolder.replace(/\[0\]\$/g, "").trim(),
      idParent,
      function (e) {
        console.log(e);
        resultFolder.push({
          i: iteration,
          folder: e,
          stringArrow: stringArrow,
        });
      }
    );
  } else {
    matchFolfders = findByIteration(resultFolder, iteration - 1);
    console.log(matchFolfders, stringArrow);
    folderRegex = new RegExp(`\\s>+\\[${iteration}\\]\\$\\s+\[^&#\n]+`, "g");

    if (titleFolder != undefined) {
      titleFolder.forEach((e) => {
        let iteration = parseInt(
            e.match(/\[\d+\]/g)[0].replace(/(\[|\])/g, "")
          ),
          stringArrows = e.match(/>+/g)[0];
        (matchFolfders = findByIterationAndArrow(resultFolder, stringArrows)),
          (titile = e.replace(/\[0\]\$/g, ""));

        createBookmark(0, "", titile, matchFolfders.folder.id, function (e) {
          resultFolder.push({
            i: iteration,
            folder: e,
            stringArrow: stringArrows + ">",
          });
        });
      });
    }

    // console.log(resultFolder, iteration)
    // let findIteration = findByIteration(resultFolder, iteration)
    // console.log(findIteration)
    // regexLinks = new RegExp(`\\s+${findIteration.stringArrow}\\[\\${findIteration.i}\\]\\#\\s+[^&]+\\s+&\\s+(.+)`, "g")

    // mathLiks = element.match(regexLinks)

    // mathLiks.reverse().forEach(((e) => {
    //     let title = e.match(/#\s+[^&]+/g)[0].replace(/#\s+/, ""), url = e.match(/&\s+.+/g)[0].replace(/& /, "")
    //     createBookmark(0, url, title, findIteration.folder.id,
    //         function (e) {
    //             console.log(e)
    //         })
    // }))
  }

  setTimeout(function () {
    let findIteration = findByIteration(resultFolder, iteration);
    console.log(findIteration);
    regexLinks = new RegExp(
      `\\s+${findIteration.stringArrow}\\[${findIteration.i}\\]\\#\\s+[^&]+\\s+&\\s+(.+)`,
      "g"
    );

    mathLiks = element.match(regexLinks);
    if (undefined != mathLiks) {
      mathLiks.forEach((e) => {
        let title = e.match(/#\s+[^&]+/g)[0].replace(/#\s+/, ""),
          url = e.match(/&\s+.+/g)[0].replace(/& /, "");
        createBookmark(0, url, title, findIteration.folder.id, function (e) {
          console.log(e);
        });
      });
    }
    if (iteration > lastIteration) return resultFolder;
    else
      insertForTxt(
        element,
        iteration + 1,
        lastIteration,
        idParent,
        resultFolder,
        false
      );
  }, 50);
}
function findByArrow(array, stringArrow) {
  return array.filter((element) => element.stringArrow == stringArrow)[0];
}
function findByIteration(array, iteration) {
  return array.filter((element) => element.i == iteration)[0];
}
function findByArrow(array, stringArrow) {
  return array.filter((element) => element.stringArrow == stringArrow)[0];
}
function findByIterationAndArrow(array, iteration, stringArrow) {
  return array.filter(
    (element) => element.i == iteration && element.stringArrow == stringArrow
  )[0];
}
