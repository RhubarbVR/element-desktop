/*
Copyright 2018, 2019, 2021 New Vector Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { ipcRenderer, desktopCapturer, contextBridge, IpcRendererEvent, SourcesOptions } from 'electron';

// CSS as thing
var styles = `

.arrowe {
  cursor: pointer;
  position: absolute;
  bottom: 90px;
  left: 20px;
  width: 1vmin;
  height: 1vmin;
  background: transparent;
  border-top: 1vmin solid #A9B2BC;
  border-right: 1vmin solid #A9B2BC;
  box-shadow: 0 0 0 lightgray;
  transition: all 200ms ease;
}
.arrowe.left {
  left: 0;
  transform: translate3d(0, 10px, 0) rotate(-135deg);
}
.arrowe.right {
  right: 0;
  transform: translate3d(0, 10px, 0) rotate(45deg);
}
.arrowe:hover {
  border-color: #11FF00;
  box-shadow: 0.5vmin -0.5vmin 0 #A9B2BC;
}
.arrowe:before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-40%, 5px) rotate(45deg);
  width: 200%;
  height: 200%;
}


  #etitlebar {
    -webkit-app-region: drag;
    display: block;
    position: fixed;
    height: 30px;
    width: calc(100% - 2px);
  }
  #etitlebar {
    padding: 4px;
  }
  #etitlebar #drag-region {
    width: 100%;
    height: 100%;
    -webkit-app-region: drag;
  }
  #etitlebar {
    color: #FFF;
  }
  #etitlebar #edrag-region {
    display: grid;
    grid-template-columns: auto 138px;
  }
  #ewindow-title {
    grid-column: 1;
    display: flex;
    align-items: center;
    margin-left: 8px;
    overflow: hidden;
    font-family: "Segoe UI", sans-serif;
    font-size: 12px;
  }
`;

var tooltip:HTMLDivElement;

function BuildToolTip(text:string,x:number,y:number):HTMLDivElement
{
  var re = document.createElement('div');
  document.body.appendChild(re);
  re.className = "mx_Tooltip_wrapper";
  var e = document.createElement('div');
  e.className = "mx_Tooltip mx_AccessibleTooltipButton_tooltip mx_Tooltip_visible";
  e.style.display = "block";
  e.style.left = x + "px";
  e.style.bottom = y + "px";
  re.appendChild(e);
  var le = document.createElement('div');
  le.className = "mx_Tooltip_chevron";
  e.appendChild(le);
  e.insertAdjacentText('beforeend',text);
  return re;
}

function BuildDiv(attachTo:HTMLElement,id:string):HTMLDivElement{
    var e = document.createElement('div');
    e.id = id;
    attachTo.appendChild(e);
    return e;
}

function buildRhubarbUI(div:HTMLDivElement)
{
  div = BuildDiv(div,"eggplaybutton");
  div.className = "arrowe right";
  div.addEventListener('mouseenter',()=>{
    if(tooltip){
      tooltip.remove();
      tooltip = null;
    }
    tooltip = BuildToolTip("Play RhubarbVR",60,70);
  });
  div.addEventListener('mouseleave',()=>{
    if(tooltip){
      tooltip.remove();
      tooltip = null;
    }
  });
  div.addEventListener('click',()=>{
   console.log("clicked");
  });
}

async function loop() {
  try {
    var elementes = document.getElementsByClassName('mx_DesktopBuildsNotice');
    for (let index = 0; index < elementes.length; index++) {
     var e:HTMLElement = <HTMLScriptElement>elementes.item(index);
     e.style.visibility = 'hidden';
    }
  } catch (error) {
    
  }
  if(!document.getElementById('rhuAdded'))
  {
    console.log("NOt added");
    var addto = document.getElementsByClassName("mx_SpacePanel").item(0);
    if(addto)
    {
      var rhuAdded = document.createElement('div');
      rhuAdded.id = 'rhuAdded';
      var addbefore = addto.lastChild;
      addto.insertBefore(rhuAdded,addbefore);
      buildRhubarbUI(rhuAdded);
    }
  }
  setTimeout(loop,10);
}

window.addEventListener('load',()=>{
    
var styleSheet = document.createElement("style")
styleSheet.type = "text/css"
styleSheet.innerText = styles
document.head.appendChild(styleSheet);

    var e = document.createElement('header');
    e.id = 'etitlebar';
    document.body.insertAdjacentElement('afterbegin',e);
    var dr = BuildDiv(e,"edrag-region");
    var title = BuildDiv(dr,"ewindow-title")
    var e = document.createElement('span');
    title.appendChild(e);
    e.innerHTML = "Rhubarb VR";
    document.getElementById('matrixchat').style.height = "calc(100% - 30px)";
    document.getElementById('matrixchat').style.paddingTop = "30px";
    loop();
});

const CHANNELS = [
    "app_onAction",
    "before-quit",
    "check_updates",
    "install_update",
    "ipcCall",
    "ipcReply",
    "loudNotification",
    "preferences",
    "seshat",
    "seshatReply",
    "setBadgeCount",
    "update-downloaded",
    "userDownloadCompleted",
    "userDownloadOpen",
];

interface ISource {
    id: string;
    name: string;
    thumbnailURL: string;
}

contextBridge.exposeInMainWorld(
    "electron",
    {
        on(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): void {
            if (!CHANNELS.includes(channel)) {
                console.error(`Unknown IPC channel ${channel} ignored`);
                return;
            }
            ipcRenderer.on(channel, listener);
        },
        send(channel: string, ...args: any[]): void {
            if (!CHANNELS.includes(channel)) {
                console.error(`Unknown IPC channel ${channel} ignored`);
                return;
            }
            ipcRenderer.send(channel, ...args);
        },
        async getDesktopCapturerSources(options: SourcesOptions): Promise<ISource[]> {
            const sources = await desktopCapturer.getSources(options);
            const desktopCapturerSources: ISource[] = [];

            for (const source of sources) {
                desktopCapturerSources.push({
                    id: source.id,
                    name: source.name,
                    thumbnailURL: source.thumbnail.toDataURL(),
                });
            }

            return desktopCapturerSources;
        },
    },
);
