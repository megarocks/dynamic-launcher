import React, {Component} from 'react';
import styled from 'styled-components'

import {version} from '../package.json';
import logoTesla from './logo/logo-tesla.png'

const username = window.require('username');
const child_process = window.require("child_process")

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

  onLaunchItemClick = (launchItem) => () => {
    child_process.exec(launchItem.command, (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        alert(err.message)
        return;
      }
      console.log(stdout);
    });
  }

  render() {

    const buttons = [
      {
        label: "Запустить калькулятор на маке",
        command: "/Applications/Calculator.app/Contents/MacOS/Calculator",
        enabled: true
      },
      {
        label: "Запустить калькулятор на винде",
        command: "calc.exe",
        enabled: true
      },
      {
        label: "Запустить калькулятор на маке",
        command: "/Applications/Calculator.app/Contents/MacOS/Calculator",
        enabled: true
      },
      {
        label: "Запустить калькулятор на винде",
        command: "calc.exe",
        enabled: true
      },
      {
        label: "Запустить калькулятор на маке",
        command: "/Applications/Calculator.app/Contents/MacOS/Calculator",
        enabled: true
      },
      {
        label: "Запустить калькулятор на винде",
        command: "calc.exe",
        enabled: true
      },
      {
        label: "Запустить калькулятор на маке",
        command: "/Applications/Calculator.app/Contents/MacOS/Calculator",
        enabled: true
      },
      {
        label: "Запустить калькулятор на винде",
        command: "calc.exe",
        enabled: true
      },
      {
        label: "Запустить калькулятор на маке",
        command: "/Applications/Calculator.app/Contents/MacOS/Calculator",
        enabled: true
      },
      {
        label: "Запустить калькулятор на винде",
        command: "calc.exe",
        enabled: true
      },
      {
        label: "Запустить калькулятор на маке",
        command: "/Applications/Calculator.app/Contents/MacOS/Calculator",
        enabled: true
      },
      {
        label: "Запустить калькулятор на винде",
        command: "calc.exe",
        enabled: true
      },
      {
        label: "Запустить калькулятор на маке",
        command: "/Applications/Calculator.app/Contents/MacOS/Calculator",
        enabled: true
      },
      {
        label: "Запустить калькулятор на винде",
        command: "calc.exe",
        enabled: true
      },
      {
        label: "Запустить калькулятор на маке",
        command: "/Applications/Calculator.app/Contents/MacOS/Calculator",
        enabled: true
      },
      {
        label: "Запустить калькулятор на винде",
        command: "calc.exe",
        enabled: true
      },
      {
        label: "Запустить калькулятор на маке",
        command: "/Applications/Calculator.app/Contents/MacOS/Calculator",
        enabled: true
      },
      {
        label: "Запустить калькулятор на винде",
        command: "calc.exe",
        enabled: true
      },
      {
        label: "Запустить калькулятор на маке",
        command: "/Applications/Calculator.app/Contents/MacOS/Calculator",
        enabled: true
      },
      {
        label: "Запустить калькулятор на винде",
        command: "calc.exe",
        enabled: true
      },
    ]

    return (
      <StyledApp>
        <header>
          Текущий пользователь: {username.sync()}
        </header>
        <main>
          {
            buttons.map((button, idx) => (
              <StyledLaunchItem key={idx} onClick={this.onLaunchItemClick(button)}>
                <img src={logoTesla} alt=""/>
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
