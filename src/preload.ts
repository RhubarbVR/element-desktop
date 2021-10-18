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

function BuildDiv(attachTo:HTMLElement,id:string):HTMLDivElement{
    var e = document.createElement('div');
    e.id = id;
    attachTo.appendChild(e);
    return e;
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
    //document.
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
