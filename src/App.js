import React from 'react';
import styled from 'styled-components'
import Select from "react-select"
import lodash from "lodash"
import CssBaseline from '@material-ui/core/CssBaseline';
import 'typeface-roboto';
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField';

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
  display: grid;
  grid-gap: 0.5em;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: 1fr;
  width: 100vw;
  height: 100vh;
  
  &, .App-main, .App-username, .App-filters {
    padding: 0.5em;
  }
 
  aside {
    display: grid;
    grid-gap: 0.5em;
    grid-template-rows: 2em 1fr 250px 250px;
  }
  
  .App-username {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  
  .App-launchItemSearch {
    width: 100%;
  }
`

class App extends React.Component {
  state = {
    username: username.sync(),
    selectedGroup: null,
    textFilter: ""
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
      const remoteConfigResponse = await fetch(`${protocol}://${host}:${port}/config.json`)
      const parsedRemoteConfig = await remoteConfigResponse.json()

      this.setState({
        launchItems: parsedRemoteConfig.launchItems,
      })

    } catch (err) {
      console.error(err)
      this.setState({
        launchItems: localConfig.launchItems
      })
    }
  }

  componentDidMount = async () => {
    const localConfig = await this.readAndParseLocalConfigFile()
    if (!localConfig) return

    const {launchItems, remoteConfigServer} = localConfig
    this.setState({launchItems, remoteConfigServer})

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
    const {launchItems = [], remoteConfigServer = {}, username, selectedGroup, textFilter} = this.state
    const {fetchNews = true, fetchInfo} = remoteConfigServer
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
              }).filter(li => {
                if (textFilter.length && li.caption.trim().toLowerCase().includes(textFilter.toLowerCase())) return true
                else if (!textFilter.length) return true
                else return false
              }).map((launchItem, idx) => <LaunchItem key={idx} launchItem={launchItem}/>)
            }
          </main>
          <aside>
            <Paper className="App-username">
              Текущий пользователь:&nbsp;<strong>{username}</strong>
            </Paper>
            <Paper className="App-filters">
              <TextField
                id="standard-search"
                label="Поиск"
                type="search"
                className="App-launchItemSearch"
                margin="normal"
                variant="outlined"
                onChange={e => {
                  this.setState({textFilter: e.target.value})
                }}
              />
              <Select options={allGroups}
                      placeholder="Все группы"
                      noOptionsMessage={() => "Добавьте группы елементам запуска чтобы они отобразились здесь"}
                      onChange={(selectedGroup) => {
                        this.setState({selectedGroup})
                      }}
                      value={this.state.selectedGroup}
                      isSearchable={false}
                      isClearable/>
            </Paper>
            <Paper> {
              fetchNews && <RemoteInfo title="Новости" serverParams={{...remoteConfigServer, fileName: "news"}}/>
            }
            </Paper>
            <Paper> {
              fetchInfo &&
              <RemoteInfo title="Важная информация" serverParams={{...remoteConfigServer, fileName: "info"}}/>
            }
            </Paper>
          </aside>
        </StyledApp>
      </React.Fragment>
    );
  }
}

export default App;
