import React, {Component} from 'react';
import styled from 'styled-components'

import {version} from '../package.json';

const {remote} = window.require("electron")
console.log(remote.app.getAppPath())

const fs = window.require('fs')
const path = window.require('path')

const defaultLaunchItems = JSON.parse(fs.readFileSync( path.join('.', 'public', 'default-launch-items.json'), 'utf8'))

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
    border: 1px solid midnightblue;
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
  border: 1px solid midnightblue;
  overflow: hidden;
  text-overflow: ellipsis;
  
  img {
    max-width: 100%;
  }
`

class App extends Component {

  onLaunchItemClick = (launchItem) => async () => {
    try {
      const openResult =  await opn(launchItem.command)
      console.log(openResult)
    } catch (e) {
      console.error(e.message)
      alert(e.message)
    }
  }

  render() {
    return (
      <StyledApp>
        <header>
          Текущий пользователь: {username.sync()}
        </header>
        <main>
          {
            defaultLaunchItems.map((button, idx) => (
              <StyledLaunchItem key={idx} onClick={this.onLaunchItemClick(button)}>
                <img src={process.env.PUBLIC_URL + '/assets/logo-tesla.png'} alt=""/>
                {button.label}
              </StyledLaunchItem>)
            )
          }
        </main>
        <aside>
          Sidebar
        </aside>
        <footer>
          Версия: {version}
        </footer>
      </StyledApp>
    );
  }
}

export default App;
