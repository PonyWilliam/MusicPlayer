const{ipcRenderer} = require('electron')
const { $,Confirm } = require('./helper')
$('add').addEventListener('click',()=>{//它与在元素中直接添加click不一样
    ipcRenderer.send('addMusic')
})
let musicAudio = new Audio()
let allTracks
let currentTrack
let playnow = null
let haslist = null
ipcRenderer.on('get_paths',(event,arg)=>{
    //渲染列表
    let list = ""
    for(item in arg){
        list+=`
        <li class="list-group-item">
            <div class="row">
            <div class="col-2 music">
                <img src="./images/music.png" id="music">
            </div>
            <div class="col-8">
                ${arg[item].fileName}
            </div>
            <div class="col-1">
                <img class="play" src="./images/play.png" id="${arg[item].id}" data-id="${arg[item].id}" data-name="play">
            </div>
            <div class="col-1">
                <img class="trash" src="./images/trash.png" id="trash" data-id="${arg[item].id}" data-name="trash">
            </div>
            </div>
        </li>`
    }
    rawHtml = `<ul class="list-group">`+list+`</ul>`
    if(rawHtml){
        $('musiclist').innerHTML = rawHtml
        haslist = true
    }else{
        rawHtml = 
        `
        <ul class="list-group">
            <li class="list-group-item">
                您暂时没有添加音乐呢
            </li>
        </ul>
        `
        $('musiclist').innerHTML = rawHtml
        haslist = false
    }
})
ipcRenderer.on('get_paths',(event,tracks)=>{
    allTracks = tracks
})
$('musiclist').addEventListener('click',(event)=>{
    event.preventDefault() //不进行其他操作
    const {dataset,id} = event.target
    const ids = dataset && dataset.id
    const name = dataset.name
    if(ids && name=="play"){
        playnow=id
        if(currentTrack && currentTrack.id==ids){

            //继续播放
            musicAudio.play()
        }else{
            //新播放
            currentTrack = allTracks.find(track=>track.id==ids)
            musicAudio.src = currentTrack.path
            musicAudio.play()
        }
        dataset.name="pause"
        $(id).setAttribute("src","./images/pause.png")
        $('musicplay').setAttribute("src","./images/pause.png")
        $('musicplay').setAttribute("now",id)
        //更改其他的图标
        allTracks.forEach(track => {
            console.log("处理重复ing")
            if(track!=currentTrack){
                $(track.id).setAttribute("src","./images/play.png")
                $(track.id).setAttribute("data-name","play")
                console.log(tarck)
            }
        });


        //更改名字，还要更改图标
    }else if(ids && name=="pause"){
        dataset.name = "play"
        musicAudio.pause()
        //更改后还要更改图标
        $(id).setAttribute("src","./images/play.png")
        $('musicplay').setAttribute("src","./images/play.png")
        $('musicplay').setAttribute("now",id)
    }else if(ids && name=="trash"){
        if(Confirm("你确定删除这首歌吗")){
            musicAudio.pause()
            musicAudio.remove()
            ipcRenderer.send('delmusic',ids)
            $('musicplay').setAttribute("src","./images/play.png")
            $('musicplay').setAttribute("now",null)
        }
    }
})
const renderPlayerHTML = (name,duration)=>{
    const player = $('status')
    const html = 
    `
        <div class="row">
            <div class="col-8 musicName">
                正在播放:${name}
            </div>
            <div class="col-4 musictime">
                <span id="now">
                    00:00 /
                </span>
                <span id="alltime">
                    ${duration}
                </span>
            </div>
        </div>
    `
    player.innerHTML = html
}
musicAudio.addEventListener('loadedmetadata',()=>{
    //渲染播放器状态
    let durations = musicAudio.duration
    let min,seconds
    min = Math.floor(durations/60)
    seconds = Math.round(durations % 60)
    if(min<10){
        min = "0" + String(min)
    }
    if(seconds<10){
        seconds = "0" + String(seconds)
    }
    durations =  String(min) + ":" +String(seconds)
    renderPlayerHTML(currentTrack.fileName,durations)
})
musicAudio.addEventListener('timeupdate',()=>{
    //更改进度
    let now = musicAudio.currentTime
    let duration = musicAudio.duration
    let percent = now / duration *100
    min = Math.floor(now / 60)
    seconds = Math.round(now % 60)
    if(min<10){
        min = "0" + String(min)
    }
    if(seconds<10){
        seconds = "0" + String(seconds)
    }
    now = String(min) + ":" + String(seconds) + " /"
    $('now').innerHTML = now
    $('musicprogress').setAttribute("style","width:"+percent+"%")
    $('musicprogress').setAttribute('aria-valuenow',percent)
})

$('musicplay').addEventListener('click',()=>{
    console.log($('musicplay').hasAttribute('now'))
    if($('musicplay').hasAttribute('now')){
        if($('musicplay').getAttribute('now')!=null){
            let id = $('musicplay').getAttribute('now')
        if($('musicplay').getAttribute('src')=="./images/play.png"){
            //播放音乐
            musicAudio.play()//继续播放
            $('musicplay').setAttribute('src','./images/pause.png')
            $(id).setAttribute('src','./images/pause.png')
            $(id).setAttribute('data-name','pause')
        }else{
            musicAudio.pause()//暂停播放
            $('musicplay').setAttribute('src','./images/play.png')
            $(id).setAttribute('src','./images/play.png')
            $(id).setAttribute('data-name','play')
        }
        }else{
            alert('您暂时没有在播放音乐')
        }
    }else{
        if(haslist == true){
            //currentTrack = allTracks.find(track=>track.id==ids)
            currentTrack = allTracks[0]
            musicAudio.src = currentTrack.path
            musicAudio.play()
            $('musicplay').setAttribute('src','./images/pause.png')
            $('musicplay').setAttribute('now',currentTrack.id)
            $(currentTrack.id).setAttribute('src','./images/pause.png')
            $(currentTrack.id).setAttribute('data-name','play')
        }else{
            alert('劳烦您老人家先添加一首音乐再准备播放吧')
        }
    }
})
$('previewplay').addEventListener('click',()=>{
    if(haslist){
        if($('musicplay').hasAttribute('now')){
            if(allTracks.length<=1){
                alert('兄dei，你只有一首歌，我怎么帮你播放下一首')
            }else{
                let y
                for(let x in allTracks){
                    if(allTracks[x]==currentTrack){
                        y = x
                        break
                    }
                }
                if(y!=0){//不等于第一首
                    $(allTracks[y].id).setAttribute('src','./images/play.png')
                    $(allTracks[y].id).setAttribute('data-name','play')
                    y--;
                    currentTrack = allTracks[y]
                    console.log(allTracks)
                }else{
                    $(allTracks[y].id).setAttribute('src','./images/play.png')
                    $(allTracks[y].id).setAttribute('data-name','play')
                    //倒退到最后一首
                    length = allTracks.length-1
                    currentTrack = allTracks[length]
                }
                    musicAudio.src = currentTrack.path
                    musicAudio.play()
                    $('musicplay').setAttribute('src','./images/pause.png')
                    $('musicplay').setAttribute('now',currentTrack.id)
                    $(currentTrack.id).setAttribute('src','./images/pause.png')
                    $(currentTrack.id).setAttribute('data-name','play')
            }
        }else{
            currentTrack = allTracks[0]
            musicAudio.src = currentTrack.path
            musicAudio.play()
            $('musicplay').setAttribute('src','./images/pause.png')
            $('musicplay').setAttribute('now',currentTrack.id)
            $(currentTrack.id).setAttribute('src','./images/pause.png')
            $(currentTrack.id).setAttribute('data-name','play')
        }
    }
})
$('nextplay').addEventListener('click',()=>{
    if(haslist){
        if($('musicplay').hasAttribute('now')){
            if(allTracks.length<=1){
                alert('兄dei，你只有一首歌，我怎么帮你播放下一首')
            }else{
                let y
                for(let x in allTracks){
                    if(allTracks[x]==currentTrack){
                        y = x
                        break
                    }
                }
                if(y!=allTracks.length-1){//不等于最后一首
                    $(allTracks[y].id).setAttribute('src','./images/play.png')
                    $(allTracks[y].id).setAttribute('data-name','play')
                    y++;
                    currentTrack = allTracks[y]
                    console.log(allTracks)
                }else{
                    //回到第一首
                    $(allTracks[y].id).setAttribute('src','./images/play.png')
                    $(allTracks[y].id).setAttribute('data-name','play')
                    currentTrack = allTracks[0]
                }
                    musicAudio.src = currentTrack.path
                    musicAudio.play()
                    $('musicplay').setAttribute('src','./images/pause.png')
                    $('musicplay').setAttribute('now',currentTrack.id)
                    $(currentTrack.id).setAttribute('src','./images/pause.png')
                    $(currentTrack.id).setAttribute('data-name','play')
            }
        }else{
            currentTrack = allTracks[0]
            musicAudio.src = currentTrack.path
            musicAudio.play()
            $('musicplay').setAttribute('src','./images/pause.png')
            $('musicplay').setAttribute('now',currentTrack.id)
            $(currentTrack.id).setAttribute('src','./images/pause.png')
            $(currentTrack.id).setAttribute('data-name','play')
        }
    }
}
)