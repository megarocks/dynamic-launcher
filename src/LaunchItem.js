import React from 'react';
import styled from 'styled-components'
import lodash from "lodash";
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper'

const {remote} = window.require("electron")
const opn = window.require("opn")
const path = window.require("path")

const StyledLaunchItem = styled.button`
  height: 140px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  
  display: flex;
  flex-direction: column;
  align-items: stretch;
  cursor: pointer;
  
  .imageContainer {
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      max-width: 100%;
    }
  }
  
  .labelContainer {
    width: 100%;
  }
`

class LaunchItem extends React.Component {

  constructor(props) {
    super(props)
    this.anchorElRef = React.createRef();
  }

  state = {
    menuOpen: false
  }

  handleLaunchItemClick = (launchItem) => {
    return lodash.debounce(async () => {
      try {
        if (launchItem.List) {
          this.setState({menuOpen: true})
        } else if (launchItem.FileName) {
          this.setState({menuOpen: false})
          await opn(launchItem.FileName)
        } else {
          remote.dialog.showErrorBox('Проверьте конфигурацию елемента запуска', 'Не указано ассоциированное приложение')
        }
      } catch (e) {
        console.error(e.message)
        remote.dialog.showErrorBox(`Ошибка при запуске приложения: ${launchItem.FileName}`, e.message)
      }
    }, 150)
  }

  createImageSourcePath = (launchItem) => {
    let appPath;
    if (remote.process.platform === 'darwin') {
      appPath = remote.app.getAppPath()
    } else {
      appPath = path.parse(remote.process.execPath).dir
    }

    let logoPath = path.join('/', 'logo', '/')
    if (launchItem.icon) {
      logoPath += launchItem.icon
    } else {
      logoPath += "default.png"
    }
    return appPath + logoPath
  }

  render = () => {
    const {idx, launchItem} = this.props
    return (
      <React.Fragment>
        <Paper>
        <StyledLaunchItem
          ref={this.anchorElRef}
          aria-owns={this.anchorElRef.current ? `launch-items-list-${idx}` : undefined}
          aria-haspopup="true"
          key={idx}
          onClick={this.handleLaunchItemClick(launchItem)}
        >
          <div className="imageContainer">
            <img
              src={`file://${this.createImageSourcePath(launchItem)}`}
              alt=""/>
          </div>
          <div className="labelContainer">{launchItem.caption}</div>
        </StyledLaunchItem>
        </Paper>
        {
          launchItem.List && launchItem.List.length &&
          <Menu
            id={`launch-items-list-${idx}`}
            anchorEl={this.anchorElRef.current}
            open={this.state.menuOpen}
            onClose={() => {
              this.setState({menuOpen: false})
            }}
          >
            {
              launchItem.List.map((subListItem, i) => {
                return <MenuItem key={i}
                                 onClick={this.handleLaunchItemClick(subListItem)}>{subListItem.caption}</MenuItem>
              })
            }
          </Menu>
        }
      </React.Fragment>

    )
  }
}

export default LaunchItem