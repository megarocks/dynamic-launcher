const fs = require('fs')


const configJson = {
  "remoteConfigServer": {
    "protocol": "http",
    "host": "192.168.1.137",
    "port": 80,
    "enabled": false,
    "updateInterval": 5000,
    "fetchNews": false,
    "fetchInfo": false
  },
  "launchItems": [
    {
      "caption": "Открыть какое-нибудь приложение",
      "icon": "default.png",
      "List": [
        {
          "caption": "Блокнот",
          "FileName": "notepad.exe"
        },
        {
          "caption": "Калькулятор",
          "FileName": "calc.exe"
        },
        {
          "caption": "WinRar",
          "FileName": "C:\\Program Files\\WinRAR\\WinRAR.exe"
        }
      ],
      "groups": ["легковые"]
    },
    {
      "caption": "Открыть документ",
      "icon": "default.png",
      "List": [
        {
          "caption": "Google.com",
          "FileName": "https://google.com"
        },
        {
          "caption": "PDF файл",
          "FileName": "http://www.africau.edu/images/default/sample.pdf"
        }
      ],
      "groups": ["грузовые", "спец-техника"]
    },
    {
      "caption": "BMW",
      "icon": "BMW.png",
      "List": [
        {
          "caption": "BMW ETK Online Vin",
          "FileName": "BMW ETK Online Vin.exe"
        },
        {
          "caption": "BMW ETK Accessories Online",
          "FileName": "ETKStartAccessories.exe"
        },
        {
          "caption": "BMW ASAP Online",
          "FileName": "BMW ASAP Online.exe"
        }
      ],
      "groups": ["легковые"]
    },
    {
      "enabled": true,
      "caption": "Явно открытая программа",
      "icon": "Alfa.png",
      "FileName": "C:\\Windows\\write.exe"
    },
    {
      "enabled": false,
      "caption": "Явно скрытая программа",
      "FileName": "C:\\Windows\\write.exe"
    }
  ]
}
fs.readdir('./logo', (err, files) => {
  files.forEach(fileName => {
    configJson.launchItems.push({
      caption: fileName,
      icon: fileName
    })
  })

  fs.writeFileSync('config_test.json', JSON.stringify(configJson))
})

