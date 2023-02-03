let globalValues = {
    bookmarks: {
        tree: [],
        leftSelect: {
            previousNode: null,
            currentNode: null,
            setCurrent: function (newNode, childrenBool) {
                if (childrenBool) this.currentNode.children = newNode
                else this.currentNode = newNode
            },
            setPrevious: function (newNode, childrenBool) {
                if (childrenBool) this.previousNode.children = newNode
                else this.previousNode = newNode
            }
        },

        rightSelect: {
            previousNode: null,
            currentNode: null,
            setCurrent: function (newNode, childrenBool) {
                if (childrenBool) this.currentNode.children = newNode
                else this.currentNode = newNode
            },
            setPrevious: function (newNode, childrenBool) {
                if (childrenBool) this.previousNode.children = newNode
                else this.previousNode = newNode
            }
        },
        leftSelectSearch: {
            previousNode: null,
            currentNode: null,
            setCurrent: function (newNode, childrenBool) {
                if (childrenBool) this.currentNode.children = newNode
                else this.currentNode = newNode
            },
            setPrevious: function (newNode, childrenBool) {
                if (childrenBool) this.previousNode.children = newNode
                else this.previousNode = newNode
            }
        },
        rightSelectSearch: {
            previousNode: null,
            currentNode: null,
            setCurrent: function (newNode, childrenBool) {
                if (childrenBool) this.currentNode.children = newNode
                else this.previousNode = newNode
            },
            setPrevious: function (newNode, childrenBool) {
                if (childrenBool) this.currentNode.children = newNode
                else this.previousNode = newNode
            }
        }
        , options: {
            searchLeft: false,
            searchRight: false,
            cur: null,
        }

    }
};


function getSubTree(id) {
    chrome.bookmarks.getSubTree(id).then((tree) => {
        globalValues.bookmarks.tree = tree;
        globalValues.bookmarks.leftSelect.currentNode = tree[0];
        globalValues.bookmarks.leftSelect.previousNode = tree[0];

        globalValues.bookmarks.tree = tree;
        globalValues.bookmarks.rightSelect.currentNode = tree[0];
        globalValues.bookmarks.rightSelect.previousNode = tree[0];
    });
}

function reloadCurrent(lParentId, lPreviosId, selected) {

    chrome.bookmarks.getSubTree("0").then((tree) => {
        if (selected == "leftSelect") {
            globalValues.bookmarks.tree = tree;
            findById(lParentId, tree[0])
            globalValues.bookmarks.leftSelect.currentNode = globalValues.bookmarks.options.cur;
            findById(lPreviosId, tree[0]);
            globalValues.bookmarks.leftSelect.previousNode = globalValues.bookmarks.options.cur;
        } else {
            globalValues.bookmarks.tree = tree;
            findById(lParentId, tree[0])
            globalValues.bookmarks.rightSelect.currentNode = globalValues.bookmarks.options.cur;
            findById(lPreviosId, tree[0])
            globalValues.bookmarks.rightSelect.previousNode = globalValues.bookmarks.options.cur;
        }
    });


}


function compare(a, b) {

    let arr = [];
    if (a.children && b.children) {
        arr = [a.title, b.title];
        arr.sort();
    } else if (a.children && !b.children) {
        return -1;
    } else if (!a.children && b.children) {
        return 1;
    } else if (!a.children && !b.children) {
        arr = [a.title, b.title];
        arr.sort();
    }

    if (arr[0] === a.title) {
        return -1;
    } else {
        return 1;
    }
}

function sort(items, recursive = false) {

    items.sort(compare);
    let len = items.length;

    for (let i = 0; i < len; i++) {

        if (len > 1 && items[i].parentId) {
            let bookmark = {
                index: i,
                parentId: items[i].parentId,
            };
            chrome.bookmarks.move(items[i].id, bookmark);
        }

        if (recursive && items[i].children) {
            items[i].children = sort(items[i].children, recursive)
        }
    }
    return items;
}
function findById(id, node, prev = node, newNode) {

    if (node.id != id) {
        if (node.children != undefined) {
            for (let i = 0; i < node.children.length; i++) {
                const element = node.children[i];
                element.parentNode = node
                if (element.id == id) {
                    element.parentNode = node
                    globalValues.bookmarks.options.cur = element
                }
                else {
                    findById(id, element, node)
                }
            }

        }
    }
    else {
        node.parentNode = prev
        if (node.children != undefined) {
            for (let i = 0; i < node.children.length; i++) {
                let element = node.children[i];
                element.parentNode = node
            }
        }
        globalValues.bookmarks.options.cur = node
        return node
    }

}
function reloadFunc(selected) {
    let idCurrent = getCurrentID(selected), prevCurrent = getPrevID(selected)
    if (selected != undefined) {

        reloadCurrent(
            idCurrent,
            prevCurrent,
            selected
        )
        addForBoolSeach(selected)
        setTimeout(function () {
            addAllFromCurrent(`#${selected}`, getCurrentNode(selected))
        }, 40)
    } else {
        addForBoolSeach()
        reloadCurrent(
            getCurrentID("leftSelect"),
            getPrevID("leftSelect"),
            "leftSelect"
        )
        reloadCurrent(
            getCurrentID("rightSelect"),
            getPrevID("rightSelect"),
            "rightSelect"
        )
        setTimeout(function () {
            addAllFromCurrent(`#leftSelect`, getCurrentNode("leftSelect"))
            addAllFromCurrent(`#rightSelect`, getCurrentNode("rightSelect"))
        }, 40)
    }
}
function hideOrShowHints() {
    let optionBoolean = false, element = Array.from(document.querySelectorAll('.options-instuction'))

    if (undefined != localStorage.getItem("settingsCheck")) optionBoolean = localStorage.getItem("settingsCheck")
    element.forEach(function (e) {
        e.dataset.options = optionBoolean
    })
}
document.addEventListener('DOMContentLoaded', function () {
    const isPopup = document.querySelector("#isPopup").dataset.ispopup
    hideOrShowHints()
    getSubTree("0");
    setTimeout(function () {
        addAllFromCurrent('#leftSelect', globalValues.bookmarks.leftSelect.currentNode)
        addAllFromCurrent('#rightSelect', globalValues.bookmarks.rightSelect.currentNode)
    }, 100)
    const elem = [...document.querySelectorAll(`[data-only="false"]`)]
    console.log(elem)
    if (!localStorage.getItem("onlyAllBookmark")) {
        localStorage.setItem("onlyAllBookmark", "false")
    }


    if (!localStorage.getItem("onlyOneColumn")) {
        localStorage.setItem("onlyOneColumn", "false")
    } else {
        const isOnlyColumnt = localStorage.getItem("onlyOneColumn")
        if (isOnlyColumnt == "true") {
            const elem = [...document.querySelectorAll(`[data-only="false"]`)]
            elem.forEach(el => {
                el.setAttribute("data-only", "true")
            })

            console.log(elem)
        }
        if (localStorage.getItem("onlyAllBookmark") == "true" && isPopup == "true") {
            console.log("True")
            setTimeout(function () {
                let currentLeft = globalValues.bookmarks.leftSelect.currentNode.children
                let newNode = globalValues.bookmarks.leftSelectSearch.currentNode = {
                    parentId: 0,
                    index: 0,
                    id: "0",
                    title: "",
                    children: [],
                    parentNode: null
                };
                for (let i = 0; currentLeft.length > i; i++) {
                    newNode.children.push(currentLeft[i])
                    if (undefined != currentLeft[i].children) {
                        addAllBookmark(currentLeft[i].children, "#leftSelect", newNode.children);
                    }
                }
                globalValues.bookmarks.options["searchLeft"] = true
                addAllFromCurrent('#leftSelect', newNode, true)
                addInputCurrentId("#leftSelect", newNode)
            }, 300)
        }

    }

    $('.reloadButton').click(function () {
        reloadFunc(this.dataset.select)
    })

    $('.reloadButton').dblclick(function () {
        reloadFunc()
    })
    $('.folder-click').click(function (event) {
        let textTitle = "New bookmarks"
        if (event.currentTarget.dataset.folderclick == 0) textTitle = "New folder"
        Swal.fire({
            title: textTitle,
            text: "You won't be able to revert this!",
            icon: 'warning',
            html: `<input type="number" hidden class="swal2-inpu hide width-100" id="add_index" value="0">
            <input placeholder="title" type="text" class="swal2-input width-100" id="add_title">
            <input placeholder="url" type="text" id="add_url" class="swal2-input width-100 mb-16px">
            <input type="text" id="parent_id" value="" class="hide">`,
            willOpen: function () {
                try {
                    let currentId = getCurrentID(event.currentTarget.dataset.select)

                    if (currentId == "0") checkRootFolder(currentId)
                    $("#parent_id").val(currentId)
                    if (event.currentTarget.dataset.folderclick == 0) $("#add_url").hide()
                    else $("#add_url").show()


                    $('#swal-input1').focus()
                    let udpateURL = $("#swal-input2")
                    if (ContextMenuGlobal.folder == true) udpateURL.hide()
                    else udpateURL.show()

                    $("#swal-input1").val(ContextMenuGlobal.text);
                    udpateURL.val(ContextMenuGlobal.link);
                }
                catch (e) {
                    errorALERTERSwal(e)
                }

            },
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes!'
        }).then((result) => {
            if (result.isConfirmed) {

                let index = $("#add_index").val();
                let title = $("#add_title").val();
                let url = $("#add_url").val();
                let parentId = $("#parent_id").val();
                try {
                    createBookmark(parseInt(index), url, title, parentId)
                    ifCurrentReload(this.dataset.select)

                    Toast.fire({
                        icon: 'success',
                        title: `Add new boochmark: ${title}`,
                    })
                }
                catch (e) {
                    Toast.fire({
                        icon: 'error',
                        title: e,
                    })
                }
            }
        })


    })
    $('#goToRootLeftBtn').click(function () {
        console.info("onClick: #leftSelect");
        addAllFromCurrent('#leftSelect', globalValues.bookmarks.tree[0])
        globalValues.bookmarks.options["searchLeft"] = false


        globalValues.bookmarks.leftSelect.currentNode = globalValues.bookmarks.tree[0];
        globalValues.bookmarks.leftSelect.previousNode = globalValues.bookmarks.tree[0];



        $('#leftSelectbreadCrumbs').text('Home')

    })
    $('#goToRootRightBtn').click(function () {
        globalValues.bookmarks.options["searchRight"] = false
        console.info("onClick: #rightSelect");
        addAllFromCurrent('#rightSelect', globalValues.bookmarks.tree[0])



        globalValues.bookmarks.rightSelect.currentNode = globalValues.bookmarks.tree[0];
        globalValues.bookmarks.rightSelect.previousNode = globalValues.bookmarks.tree[0];

        $('#rightSelectbreadCrumbs').text('Home')

    });
    $('#moveToRightSelectBtn').click(function () {
        moveBookmark()
    });

    $("#addAllBookmark").click(function () {
        let currentLeft = globalValues.bookmarks.leftSelect.currentNode.children
        let newNode = globalValues.bookmarks.leftSelectSearch.currentNode = {
            parentId: 0,
            index: 0,
            id: "0",
            title: "",
            children: [],
            parentNode: null
        };
        for (let i = 0; currentLeft.length > i; i++) {
            newNode.children.push(currentLeft[i])
            if (undefined != currentLeft[i].children) {
                addAllBookmark(currentLeft[i].children, "#leftSelect", newNode.children);
            }
        }
        globalValues.bookmarks.options["searchLeft"] = true
        addAllFromCurrent('#leftSelect', newNode, true)
        addInputCurrentId("#leftSelect", newNode)
    })
    $("#addAllBookmarkRight").click(function () {
        let currentLeft = globalValues.bookmarks.rightSelect.currentNode.children
        let newNode = globalValues.bookmarks.rightSelectSearch.currentNode = {
            parentId: 0,
            index: 0,
            id: "0",
            title: "",
            children: [],
            parentNode: null
        };
        for (let i = 0; currentLeft.length > i; i++) {
            newNode.children.push(currentLeft[i])
            if (undefined != currentLeft[i].children) {
                addAllBookmark(currentLeft[i].children, "#rightSelect", newNode.children);
            }
        }
        globalValues.bookmarks.options["searchRight"] = true
        addAllFromCurrent("#rightSelect", newNode, true)
        addInputCurrentId("#rightSelect", newNode)
    })


    function addAllBookmark(current, selectedId, nodeValues) {

        for (let i = 0; current.length > i; i++) {
            nodeValues.push(current[i])

            if ('children' in current[i]) {
                addAllBookmark(current[i].children, selectedId, nodeValues);
            }

        }


    }
    // -------------------------------------------------------
    $('#searhBookmarkLeft').on('input', function () {
        let val = $('#searhBookmarkLeft').val().trim().toLowerCase()
        let leftSelect = document.getElementById('leftSelect')
        let itemsOption = leftSelect.querySelectorAll('option')
        if (val != '') {
            for (let i = 0; itemsOption.length > i; i++) {

                if (itemsOption[i].querySelector('.title-option').innerText.toLowerCase().search(val) == -1) {
                    itemsOption[i].classList.add("hide");
                }
                else {
                    itemsOption[i].classList.remove("hide");
                }
            }
        } else {
            for (let i = 0; itemsOption.length > i; i++) {
                itemsOption[i].classList.remove('hide')
            }
        }
    });
    $('#searhBookmarkRight').on('input', function () {
        let val = $('#searhBookmarkRight').val().trim().toLowerCase()
        let rightSelect = document.getElementById('rightSelect')
        let itemsOption = rightSelect.querySelectorAll('option')
        if (val != '') {
            for (let i = 0; itemsOption.length > i; i++) {
                if (itemsOption[i].querySelector('.title-option').innerText.toLowerCase().search(val) == -1) {
                    itemsOption[i].classList.add("hide");
                }
                else {
                    itemsOption[i].classList.remove("hide");
                }
            }
        } else {
            for (let i = 0; itemsOption.length > i; i++) {
                itemsOption[i].classList.remove('hide')
            }
        }

    });

    $('#moveToLeftSelectBtn').click(function () {
        moveBookmark(false)
    });

    $('#sortAll').click(function () {
        sort(globalValues.bookmarks.tree, true);
    });

    $('.sort-click').click(function () {
        try {
            let currentNode = getCurrentNode(this.dataset.select)
            let newChildren = sort(currentNode.children)
            checkRootFolder(currentNode.id)
            setCurrentNode(this.dataset.select, newChildren, true)
            ifCurrentReload(this.dataset.select)
            alertSuccessSwal(`successful sorting ${newChildren.length} items`)
        }
        catch (e) {
            errorALERTERSwal(e)
        }
    });

    $('.trash-click').click(function () {
        try {
            let element, filterValue, selectedElement, allFolder, currentId = getCurrentID(this.dataset.select)
            if (this.dataset.select == "leftSelect") element = Array.from(document.querySelectorAll('#leftSelect option'))
            else if (this.dataset.select == "rightSelect") element = Array.from(document.querySelectorAll('#rightSelect option'))
            else element = ContextMenuGlobal.allElementVal
            checkRootFolder(currentId)

            filterValue = element.filter(option => option.selected).map(option => option.value);
            selectedElement = element.filter(option => option.selected)
            allFolder = element.filter(option => option.selected).map(option => option.dataset.folder);
            if (selectedElement.length == 0) throw new Error("No selected item")
            let text = `Delete - ${selectedElement[0].innerText} ?`
            if (filterValue.length > 1) text = `${filterValue.length} - delete object?`
            Delete.fire({
                text: text
            }).then((result) => {
                if (result.isConfirmed) {

                    if (filterValue.length > 0) {
                        filterValue.forEach(function (e, i) {
                            if (allFolder[i] != true) {
                                removeBookmark(e)
                            } else {
                                removeBookmarkTree(e)
                            };

                            selectedElement[i].remove();
                        })
                    }


                    ifCurrentReload(this.dataset.select)
                    Swal.fire(
                        'Deleted!',
                        'Your object deleted!',
                        'success',
                    )
                }
            })
        }
        catch (e) {
            errorALERTERSwal(e)
        }
    })

    let leftSelect = $('#leftSelect');

    leftSelect.dblclick(function () {
        exmenationSearch(globalValues.bookmarks.options.searchLeft, "#leftSelect", globalValues.bookmarks.leftSelect);
    })

    let rightSelect = $('#rightSelect');
    rightSelect.dblclick(function () {
        exmenationSearch(globalValues.bookmarks.options.searchRight, '#rightSelect', globalValues.bookmarks.rightSelect, globalValues.bookmarks.rightSelectSearch);
    });

});

function exmenationSearch(boolean, selectedID, node, newNode = globalValues.bookmarks.leftSelectSearch) {
    if (boolean == false) selectDoubleClick(selectedID, node)
    else selectDoubleClick(selectedID, newNode);
}

function createBookmark(index, url, title, parentId, func) {
    chrome.bookmarks.create(
        {
            index: index,
            parentId: parentId,
            title: title,
            url: url
        },
        function (e) {
            if (func == undefined) errorALERTER(e)
            else func(e)
        }
    )
}
function checkRootFolder(id, boolean) {
    if (boolean == undefined) {
        if (id == "0") throw new Error("ROOT FOLDER")
        else true
    }
    else {
        if (id == "0") return true
        else return false
    }
}
function checkURL(url) {
    var regURL = /^(?:(?:https?|ftp|telnet):\/\/(?:[a-z0-9_-]{1,32}(?::[a-z0-9_-]{1,32})?@)?)?(?:(?:[a-z0-9-]{1,128}\.)+(?:com|net|org|mil|edu|arpa|ru|gov|biz|info|aero|inc|name|[a-z]{2})|(?!0)(?:(?!0[^.]|255)[0-9]{1,3}\.){3}(?!0|255)[0-9]{1,3})(?:\/[a-z0-9.,_@%&?+=\~\/-]*)?(?:#[^ \'\"&<>]*)?$/i;
    return regURL.test(url);
}

function moveBookmark(leftToRight = true) {
    let sourceSelectId = leftToRight ? '#leftSelect' : '#rightSelect';
    let destinationSelectId = leftToRight ? '#rightSelect' : '#leftSelect';
    let arroText = leftToRight ? '>' : '<';
    let destinationSelectGlobal = getCurrentID(destinationSelectId.replace(/#/, ""))

    let destinationId = null;
    let selectedText = null;

    let selectSource = $(sourceSelectId);
    let selectedItemsIds = selectSource.val()

    if (selectedItemsIds && selectedItemsIds.length > 0) {
        for (let i = 0; i < selectedItemsIds.length; i++) {
            let selectedId = selectedItemsIds[i];
            selectedText = $(sourceSelectId + " option[value=" + selectedId + "]").text();
            selectedFolder = $(sourceSelectId + " option[value=" + selectedId + "]").data("folder");
            selectedUrl = $(sourceSelectId + " option[value=" + selectedId + "]").data("href");


            destinationId = destinationSelectGlobal

            chrome.bookmarks.move(selectedId, { parentId: destinationId }, function (e) {
                errorALERTER(e)
            });

            addOption(destinationSelectId, selectedText, selectedId, "", selectedUrl, selectedFolder);
            alertSuccessSwal("Move " + arroText + " " + selectedItemsIds.length + " items")
            removeOption(sourceSelectId, selectedId);
        }
    }
}

function errorALERTER(e) {
    try {
        if (e == undefined) {
            throw new Error("Unknown error")
        }
        return true
    }
    catch (e) {

        Toast.fire({
            icon: 'error',
            title: e,

        })
        return true
    }

}
function selectDoubleClick(selectId, nodeValues) {
    let val = $(selectId).find(":selected").val()
    console.log(nodeValues)
    if (val === "-1") {
        let previousChildId = nodeValues.currentNode.id;
        nodeValues.currentNode = nodeValues.previousNode;
        nodeValues.previousNode = nodeValues.currentNode.parentNode;
        if (checkRootFolder(nodeValues.currentNode.id, true) && !checkSearch(selectId)) {
            addAllFromCurrent(selectId, nodeValues.currentNode, true)
        }
        else addAllFromCurrent(selectId, nodeValues.currentNode)

        addInputCurrentId(selectId, nodeValues.currentNode)
        $(selectId + " option[value=" + previousChildId + "]").attr('selected', 'selected');
    } else {
        let current = nodeValues.currentNode.children.find(x => x.id === val);

        if (current.children) {
            nodeValues.previousNode = nodeValues.currentNode;
            nodeValues.currentNode = current;

            addAllFromCurrent(selectId, nodeValues.currentNode)

            addInputCurrentId(selectId, nodeValues.currentNode)
        }
    }

    $(selectId + 'breadCrumbs').text("Home" + buildBreadCrumbs(nodeValues.currentNode))
}

function findNodeById(nodes, id) {

    let ret = null;
    if (nodes && nodes.length > 0) {
        ret = nodes.find(node => {
            let ret = null;
            if (node.id === id) {
                ret = node;
            } else {
                if (node.children && node.children.length > 0) {
                    ret = findNodeById(node.children, id)
                }
            }

            return ret;
        })
    }

    return ret;
}

function addAllFromCurrent(selectId, current, boolean) {

    removeAllOptionsFromSelect(selectId);
    if (current.id !== "0") {
        addOption(selectId, "[..]", "-1", "", "", "3");
    }

    if (current.children) {
        for (let i = 0; i < current.children.length; i++) {

            let current0 = current.children[i];
            current0.parentNode = current;
            let title = current0.title;
            let url = current0.url
            let folder = 0
            if (current0.children) {
                title = "[" + title + "]";
                url = "#"
                folder = 1
            }
            if (boolean == true) {
                addOption(selectId, title, current0.id, i, url, folder, current0.parentId, "Home" + constructorTitle(current0.id));
            } else {
                addOption(selectId, title, current0.id, i, url, folder, current0.parentId);
            }

        }
    }
}
function addOption(selectId, text, value, id, url, folder, parentId, breadCrumbs) {
    let classCrumbs = ""
    let title = `<span class="title-option">${text}</span>`
    if (undefined == breadCrumbs) breadCrumbs = ""
    else {
        title = title.replace(/class="title-option"/g, `class="title-option d-none"`)
        console.log(title)

        classCrumbs = "option-search"

    }

    $(selectId).append($('<option>', {
        value: value,
        class: `option-main ${classCrumbs}`,
        html: title,
        "data-href": url,
        "data-folder": folder,
        "data-index": id,
        "data-parent": parentId,
        "data-bread": breadCrumbs
    }));

}

function removeOption(selectId, value) {
    $(selectId + " option[value=" + value + "]").remove();
}

function removeAllOptionsFromSelect(selectId) {
    $(selectId)
        .find('option')
        .remove()
        .end();
}

function buildBreadCrumbs(item) {
    let ret = item.title
    if (item.id != "0") {
        if (item.parentNode) {
            ret = buildBreadCrumbs(item.parentNode) + " >> " + ret;
        }
    }

    return ret;
}
$('.setting-click').click(function (e) {
    Swal.fire({
        title: `Setting`,
        text: "Here you can customize your application.",
        icon: 'info',
        html: `
        <div class="adas">
        <div><input type="checkbox" class="checkbox-settings" id="scales" name="scales"> 
        <label class="label-settings" for="scales"></label> </div>
        <div> <input type="checkbox"  id="onlyOneColumn" name="onlyOneColumn"> 
        <label class="label-settings1" for="onlyOneColumn">Only one Column in the popup?</label></div>
        <div>
        <input type="checkbox"  id="onlyAllBookmark" name="onlyAllBookmark"> 
        <label class="label-settings1" for="onlyAllBookmark">Always have all the elements in the pop?</label>
        </div>
        </div>
        `,
        willOpen: function () {
            const isonlyOneColumn = localStorage.getItem("onlyOneColumn")
            const isonlyAllBookmark = localStorage.getItem("onlyAllBookmark")
            if (isonlyAllBookmark == "true")
                $('#onlyAllBookmark').attr('checked', true)
            else {
                $('#onlyAllBookmark').attr('checked', false)
            }
            if (isonlyOneColumn == "true")
                $('#onlyOneColumn').attr('checked', true)
            else {
                $('#onlyOneColumn').attr('checked', false)
            }
            let settingsCheckEl, booleanCheck, labelElement
            settingsCheckEl = $('.checkbox-settings')
            $("#onlyOneColumn").click(function () {
                // $("#onlyOneColumn").attr('checked', false)
            })
            labelElement = $(".label-settings")
            booleanCheck = settingsCheckEl.is(':checked')
            console.log(localStorage.getItem('settingsCheck'))
            if (undefined != localStorage.getItem('settingsCheck')) booleanCheck = localStorage.getItem('settingsCheck')

            if ('true' == booleanCheck) labelElement.text('Show hints'), settingsCheckEl.attr('checked', true)
            else labelElement.text('Hide hints'), settingsCheckEl.attr('checked', false)

            $('.checkbox-settings').click(function () {
                booleanCheck = settingsCheckEl.is(':checked')
                if (booleanCheck) labelElement.text('Show hints')
                else labelElement.text('Hide hints')

            })

        },
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Save'
    }).then((result) => {
        if (result.isConfirmed) {
            let booleanCheck
            booleanCheck = $('.checkbox-settings').is(':checked')
            const bool = $('#onlyOneColumn').is(':checked')

            const boollyAllBookmark = $('#onlyAllBookmark').is(':checked')
            if (boollyAllBookmark)
                localStorage.setItem('onlyAllBookmark', true);
            else {
                localStorage.setItem('onlyAllBookmark', false);
            }
            console.log(bool)
            if (bool) {
                console.log(bool)
                localStorage.setItem('onlyOneColumn', true);


                const elem = [...document.querySelectorAll(`[data-only="false"]`)]
                console.log(elem)
                elem.forEach(el => {
                    el.setAttribute("data-only", "true")
                })

            }
            else {

                const elem = [...document.querySelectorAll(`[data-only="true"]`)]

                localStorage.setItem('onlyOneColumn', false);
                elem.forEach(el => {
                    el.setAttribute("data-only", "false")
                })

            }

            if (booleanCheck) localStorage.setItem('settingsCheck', true);
            else localStorage.setItem('settingsCheck', false);
            hideOrShowHints()
            Swal.fire(
                'Saved!',
                'Saved your settings!.',
                'success',
            )
        }
    })

})




function getCurrentID(select) {
    if (/#/.test(select)) select = select.replace(/#/, "")
    return $("." + select + " .inputIDCurrent").val()
}
function getPrevID(select) {
    if (/#/.test(select)) select = select.replace(/#/, "")
    return $("." + select + " .inputIDPrev").val()
}
function addInputCurrentId(selectID, node) {
    $(selectID.replace(/#/, ".") + " .inputIDCurrent").val(node.id)
    if (node.parentNode != undefined) {
        $(selectID.replace(/#/, ".") + " .inputIDPrev").val(node.parentNode.id)
    }

}

function getCurrentNode(selected) {
    if (selected == "leftSelect") {
        if (checkSearch(selected)) {
            return globalValues.bookmarks.leftSelect.currentNode
        }
        return globalValues.bookmarks.leftSelectSearch.currentNode
    } else {
        if (checkSearch(selected)) {
            return globalValues.bookmarks.rightSelect.currentNode
        }
        return globalValues.bookmarks.rightSelectSearch.currentNode
    }
}
function setCurrentNode(selected, newNode, childrenBool) {
    if (selected == "leftSelect") {
        if (checkSearch(selected)) {
            globalValues.bookmarks.leftSelect.setCurrent(newNode, childrenBool)
        } else globalValues.bookmarks.leftSelectSearch.setCurrent(newNode, childrenBool)

    } else {
        if (checkSearch(selected)) {
            globalValues.bookmarks.rightSelect.setCurrent(newNode, childrenBool)
        } else globalValues.bookmarks.rightSelectSearch.setCurrent(newNode, childrenBool)

    }
}
function addForBoolSeach(selected) {
    if (selected == undefined) {
        globalValues.bookmarks.options["searchLeft"] = false
        globalValues.bookmarks.options["searchRight"] = false
    }
    if (selected == "leftSelect") globalValues.bookmarks.options["searchLeft"] = false
    if (selected == "rightSelect") globalValues.bookmarks.options["searchRight"] = false
}

function constructorTitle(id) {
    findById(id, globalValues.bookmarks.tree[0])
    return buildBreadCrumbs(globalValues.bookmarks.options.cur)
}

function checkSearch(option) {
    if (option == undefined) {
        return globalValues.bookmarks.options.searchLeft == false && globalValues.bookmarks.options.searchRight == false
    }
    option = option.replace(/#/, "")
    if (option == "leftSelect") return globalValues.bookmarks.options.searchLeft == false
    if (option == "rightSelect") return globalValues.bookmarks.options.searchRight == false

}