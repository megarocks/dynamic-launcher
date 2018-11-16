import React from 'react';
import styled from 'styled-components'

import Select from "react-select"

import lodash from "lodash"

const {remote} = window.require("electron")

remote.globalShortcut.register('CommandOrControl+Shift+K', () => {
  remote.BrowserWindow.getFocusedWindow().webContents.openDevTools()
})

window.addEventListener('beforeunload', () => {
  remote.globalShortcut.unregisterAll()
})


const fs = window.require('fs')
const util = window.require('util')
const path = window.require("path")


const readFile = util.promisify(fs.readFile)

const username = window.require('username');
const opn = window.require("opn")

const StyledApp = styled.div`
  margin: 1em;
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: 2em calc(100vh - 8em) 2em;
  grid-gap: 1em;
  
  header,
  footer {
    grid-column: 1 / span 2;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  header {
    justify-content: flex-end;
    padding: 0 1em;
  }
    
  header, main, aside, footer {
    border: 1px solid #2c2e39;
  }
  
  aside {
    padding: 1em;
  }
  
  main {
    padding: 1em;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
    grid-auto-rows: 207px;
    grid-gap: 1em;
    overflow-y: scroll;
  }
`
const StyledLaunchItem = styled.button`
  height: 207px;
  border: 1px solid #2c2e39;
  overflow: hidden;
  text-overflow: ellipsis;
  
  display: flex;
  flex-direction: column;
  
  .imageContainer {
    height: 150px;
    display: flex;
    align-items: center;
    img {
      max-width: 100%;
    }
  }
  
  .labelContainer {
    width: 100%;
  }
`

class App extends React.Component {

  state = {
    appVersion: remote.app.getVersion(),
    username: username.sync(),
    "remoteConfigServer": {
      "host": null,
      "port": null,
      "enabled": true,
      "updateInterval": 5000
    },
    "launchItems": [],
    selectedGroup: null
  }

  handleLaunchItemClick = (launchItem) => async () => {
    try {
      await opn(launchItem.command)
    } catch (e) {
      console.error(e.message)
      remote.dialog.showErrorBox(`Ошибка при запуске приложения: ${launchItem.command}`, e.message)
    }
  }

  readAndParseLocalConfigFile = async () => {
    try {
      const configFileContent = await readFile('config.json', 'utf8')
      const configWithoutBOM = configFileContent.replace(/^\uFEFF/, '')
      return JSON.parse(configWithoutBOM)
    } catch (err) {
      console.error(err)
      alert('Ошибка при чтении файла конфигурации')
    }
  }

  fetchAndApplyRemoteConfiguration = async (localConfig, remoteConfigServer) => {
    if (this.state.remoteConfigRequestInProgress) return

    try {
      this.setState({
        remoteConfigRequestInProgress: true,
      })

      const {protocol, host, port} = localConfig.remoteConfigServer
      const remoteConfigConnectionString = `${protocol}://${host}:${port}/config.json`
      const remoteConfigResponse = await fetch(remoteConfigConnectionString)
      const parsedRemoteConfig = await remoteConfigResponse.json()

      console.log('config update received')

      this.setState({
        remoteConfigRequestInProgress: false,
        remoteConfigFetchSuccess: true,
        remoteConfigConnectionString,
        launchItems: parsedRemoteConfig.launchItems,
      })

    } catch (err) {
      console.error(err)
      this.setState({
        remoteConfigRequestInProgress: false,
        remoteConfigFetchSuccess: false,
        launchItems: localConfig.launchItems
      })
    }
  }

  componentDidMount = async () => {
    const localConfig = await this.readAndParseLocalConfigFile()
    if (!localConfig) return

    this.setState({
      launchItems: localConfig.launchItems
    })

    if (localConfig.remoteConfigServer.enabled) {
      this.configUpdateTimer = setInterval(async () => {
        if (this.state.remoteConfigRequestInProgress) return

        await this.fetchAndApplyRemoteConfiguration(localConfig)
      }, localConfig.remoteConfigServer.updateInterval)
    }
  }

  componentWillUnmount = () => {
    clearInterval(this.configUpdateTimer)
  }

  createImageSourcePath = (launchItem) => {
    let appPath;
    if (remote.process.platform === 'darwin') {
      appPath = remote.app.getAppPath()
    } else {
      appPath = path.parse(remote.process.execPath).dir
    }

    let logoPath = path.join('/', 'logo', '/')
    if (launchItem.logo) { logoPath += launchItem.logo } else { logoPath += "default.png" }
    return appPath + logoPath
  }

  render() {
    const {launchItems, appVersion, username, remoteConfigConnectionString, remoteConfigFetchSuccess, selectedGroup} = this.state
    const allGroups = lodash.union(...launchItems.map(li => li.groups)).map(g => ({label: g, value: g}))
    return (
      <StyledApp>
        <header>
          Текущий пользователь: <strong>{username}</strong>
        </header>
        <main>
          {
            launchItems.filter(li => {
              if (selectedGroup && li.groups && li.groups.includes(selectedGroup.value) && li.enabled) {
                return true
              } else if (!selectedGroup && li.enabled) {
                return true
              } else {
                return false
              }
            }).map((launchItem, idx) => {
                return (
                  <StyledLaunchItem key={idx} onClick={lodash.debounce(this.handleLaunchItemClick(launchItem), 500)}>
                    <div className="imageContainer">
                      <img
                        src={`file://${this.createImageSourcePath(launchItem)}`}
                        alt=""/>
                    </div>
                    <div className="labelContainer"> {launchItem.label}</div>
                  </StyledLaunchItem>)
              }
            )
          }
        </main>
        <aside>
          <Select options={allGroups}
                  placeholder="Все группы"
                  noOptionsMessage={() => "Добавьте группы елементам запуска чтобы они отобразились здесь"}
                  onChange={(selectedGroup) => {
                    this.setState({selectedGroup})
                  }}
                  value={this.state.selectedGroup}
                  isClearable/>
        </aside>
        <footer>
          Версия: {appVersion}.
          Используется: {remoteConfigFetchSuccess ? remoteConfigConnectionString : "локальная конфигурация"}
        </footer>
      </StyledApp>
    );
  }
}

export default App;
