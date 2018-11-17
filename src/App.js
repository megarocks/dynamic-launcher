import React from 'react';
import styled from 'styled-components'

import Select from "react-select"
import lodash from "lodash"

import LaunchItem from "./LaunchItem"

const {remote} = window.require("electron")

remote.globalShortcut.register('CommandOrControl+Shift+K', () => {
  remote.BrowserWindow.getFocusedWindow().webContents.openDevTools()
})

window.addEventListener('beforeunload', () => {
  remote.globalShortcut.unregisterAll()
})


const fs = window.require('fs')
const util = window.require('util')


const readFile = util.promisify(fs.readFile)

const username = window.require('username');

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
    grid-template-columns: repeat(auto-fill, 100px);
    grid-auto-rows: 140px;
    grid-gap: 1em;
    overflow-y: scroll;
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

  fetchAndApplyRemoteConfiguration = async (localConfig) => {
    if (this.state.remoteConfigRequestInProgress) return

    try {
      this.setState({
        remoteConfigRequestInProgress: true,
      })

      const {protocol, host, port} = localConfig.remoteConfigServer
      const remoteConfigConnectionString = `${protocol}://${host}:${port}/config.json`
      const remoteConfigResponse = await fetch(remoteConfigConnectionString)
      const parsedRemoteConfig = await remoteConfigResponse.json()

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

              if ("enabled" in li && !li.enabled) return false

              if (selectedGroup && li.groups && li.groups.includes(selectedGroup.value)) {
                return true
              } else if (!selectedGroup) {
                return true
              }
              else {
                return false
              }
            }).map((launchItem, idx) => <LaunchItem idx={idx} launchItem={launchItem} />)
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
