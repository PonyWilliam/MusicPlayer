const {$} = require('./helper')
const {ipcRenderer} = require('electron')
const path = require('path')
let paths;
$('selectMusic').addEventListener('click',()=>{
    ipcRenderer.send('openMusicFile')
})
let musicFilePath = []
const renderList = (pathes)=>{
    const musicList = $('musicList')
    const musicItemsHtml = pathes.reduce((html,music)=>{
        html += `<li class="list-group-item">${path.basename(music)}</li>`
        return html
    },'')
    musicList.innerHTML = '<ul class="list-group">' + musicItemsHtml + '</ul>'
}
ipcRenderer.on('selected-file',(event,path)=>{
    paths = path
    if(Array.isArray(path)){
        renderList(path)
    }
})
$('submit').addEventListener('click',()=>{
    if(Array.isArray(paths)){
        ipcRenderer.send('paths',paths)
    }else{
        alert("请先选择要导入的文件")
    }
})