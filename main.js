const{app,BrowserWindow,ipcMain,dialog} = require('electron')
const Store = require('electron-store')
const store = new Store()
const DataStore = require('./renderer/music')
const myStore = new DataStore({'name':'Data'})

var PlayWindow,AddWindow
class CreateWindow extends BrowserWindow{
  constructor(config,file){
    const baseConfig = {
      width:800,
      height:600,
      webPreferences:{
        nodeIntegration:true
      },
      show:false
    }
    const finalConfig = {...baseConfig,...config}
    super(finalConfig)
    this.loadFile(file)
    this.once('ready-to-show',()=>{
      this.show()
    })
  }
}
app.on('ready',()=>{
  PlayWindow = new CreateWindow({},"./renderer/play.html")
  PlayWindow.once('ready-to-show',()=>{
    PlayWindow.show()
    let data = myStore.getTracks()
    PlayWindow.send('get_paths',data)
  })
  })
  ipcMain.on('delmusic',(event,arg)=>{
    let temp = myStore.deleTrack(arg).getTracks()
    PlayWindow.send('get_paths',temp)
  })
  ipcMain.on('addMusic',()=>{
      console.log('create windows')
      AddWindow = new CreateWindow({
      width:500,
      height:320
    },"./renderer/add.html")
  ipcMain.on('openMusicFile',(event)=>{
      dialog.showOpenDialog({
        title:"选择本地音乐文件",
        properties:["openFile",'multiSelections'],
        filters:[{name:'Music',extensions:['mp3']}]
      },(files)=>{
        if(files){
          event.sender.send('selected-file',files)
        }
      })
  })
  ipcMain.on('paths',(event,arg)=>{
    const updata = myStore.addTracks(arg).getTracks()
    //渲染到首页
    PlayWindow.send('get_paths',updata)
  })
  })