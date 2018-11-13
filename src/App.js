import React, {Component} from 'react';

const os = window.require('os');
const child_process = window.require("child_process")

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
      <div>
        <header>
          <span>
            Текущий пользователь: {os.userInfo().username}
          </span>
        </header>
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
      </div>
    );
  }
}

export default App;
