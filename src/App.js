import React from 'react';
import styled from 'styled-components'
import Select from "react-select"
import lodash from "lodash"
import CssBaseline from '@material-ui/core/CssBaseline';
import 'typeface-roboto';
import Paper from '@material-ui/core/Paper'

import LaunchItem from "./LaunchItem"
import RemoteInfo from "./RemoteInfo"

const {remote} = window.require("electron")
const fs = window.require('fs')
const util = window.require('util')
const readFile = util.promisify(fs.readFile)
const username = window.require('username');


// https://material-ui.com/style/typography/#migration-to-typography-v2
window.__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true;

//enable developer tools in compiled version
remote.globalShortcut.register('CommandOrControl+Shift+K', () => {
  remote.BrowserWindow.getFocusedWindow().webContents.openDevTools()
})
window.addEventListener('beforeunload', () => {
  remote.globalShortcut.unregisterAll()
})

const StyledApp = styled.div`
  margin: 0.5em;
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: 2em calc(100vh - 6em) 2em;
  grid-gap: 0.5em;
  
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
    
  header, main, footer {
    border: 1px solid #2c2e39;
  }
  
  aside {
    display: grid;
    
    grid-template-rows: 6fr minmax(200px, 1fr) minmax(200px, 1fr);
    grid-gap: 0.5em;
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

    const {launchItems, fetchInfo, fetchNews, remoteConfigServer} = localConfig
    this.setState({launchItems, fetchInfo, fetchNews, remoteConfigServer})

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
    const {launchItems, appVersion, username, remoteConfigConnectionString, remoteConfigFetchSuccess, selectedGroup, fetchNews, fetchInfo, remoteConfigServer} = this.state
    const allGroups = lodash.union(...launchItems.map(li => li.groups)).map(g => ({label: g, value: g}))
    return (
      <React.Fragment>
        <CssBaseline/>
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
              }).map((launchItem, idx) => <LaunchItem idx={idx} launchItem={launchItem}/>)
            }
          </main>
          <aside>
            <Paper>
              <Select options={allGroups}
                      placeholder="Все группы"
                      noOptionsMessage={() => "Добавьте группы елементам запуска чтобы они отобразились здесь"}
                      onChange={(selectedGroup) => {
                        this.setState({selectedGroup})
                      }}
                      value={this.state.selectedGroup}
                      isClearable/>
            </Paper>
            <Paper> {
              fetchNews &&
              <RemoteInfo title="Новости" serverParams={{...remoteConfigServer, fileName: "news"}}/>
            }
            </Paper>
            <Paper> {
              fetchInfo &&
              <RemoteInfo title="Важная информация" serverParams={{...remoteConfigServer, fileName: "info"}}/>
            }
            </Paper>
          </aside>
          <footer>
            Версия: {appVersion}.
            Используется: {remoteConfigFetchSuccess ? remoteConfigConnectionString : "локальная конфигурация"}
          </footer>
        </StyledApp>
      </React.Fragment>

    );
  }
}

export default App;
