import React, {Component} from 'react';
import styled from 'styled-components'

import {version} from '../package.json';

const os = window.require('os');
const child_process = window.require("child_process")


const StyledApp = styled.div`
  margin: 0 1em;
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: 2em calc(100vh - 6em) 2em;
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
  }
    
  header, main, aside, footer {
    border: 1px solid midnightblue;
  }
`

class App extends Component {
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
    ]

    return (
      <StyledApp>
        <header>
          Текущий пользователь: {os.userInfo().username}
        </header>
        <main>
          <ul>
            {buttons.map((button, idx) => (<li key={idx}>
              <button onClick={() => {
                child_process.exec(button.command, (err, stdout, stderr) => {
                  if (err) {
                    console.error(err);
                    alert(err.message)
                    return;
                  }
                  console.log(stdout);
                });
              }}>{button.label}</button>
            </li>))}
          </ul>
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
