import React from 'react';
import styled from 'styled-components'
import Popover from 'react-simple-popover';
import lodash from "lodash";

const {remote} = window.require("electron")
const opn = window.require("opn")
const path = window.require("path")

const StyledLaunchItem = styled.button`
  height: 140px;
  border: 1px solid #2c2e39;
  overflow: hidden;
  text-overflow: ellipsis;
  
  display: flex;
  flex-direction: column;
  align-items: stretch;
  
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

  handleLaunchItemClick = (launchItem) => async () => {
    try {
      await opn(launchItem.FileName)
    } catch (e) {
      console.error(e.message)
      remote.dialog.showErrorBox(`Ошибка при запуске приложения: ${launchItem.FileName}`, e.message)
    }
  }

  createImageSourcePath = (launchItem) => {
    let appPath;
    if (remote.process.platform === 'darwin') {
      appPath = remote.app.getAppPath()
    } else {
      appPath = path.parse(remote.process.execPath).dir
    }

    let logoPath = path.join('/', 'logo', '/')
    if (launchItem.icon) { logoPath += launchItem.icon } else { logoPath += "default.png" }
    return appPath + logoPath
  }

  render = () => {
    const { idx, launchItem } = this.props

    return (
      <StyledLaunchItem key={idx} onClick={lodash.debounce(this.handleLaunchItemClick(launchItem), 500)}>
        <div className="imageContainer">
          <img
            src={`file://${this.createImageSourcePath(launchItem)}`}
            alt=""/>
        </div>
        <div className="labelContainer"> {launchItem.caption}</div>
      </StyledLaunchItem>
    )
  }
}

export default LaunchItem