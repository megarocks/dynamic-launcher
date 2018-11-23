import React from 'react';
import styled from 'styled-components'
import {debounce} from "lodash";
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

const {remote} = window.require("electron")
const opn = window.require("opn")
const util = window.require("util")
const base64Img = window.require('base64-img')

const getBase64ImgFromFs = util.promisify(base64Img.base64)

const StyledLaunchItem = styled.button`
  height: 140px;
  width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  
  display: flex;
  flex-direction: column;
  align-items: stretch;
  cursor: pointer;
  
  .imageContainer {
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      max-width: 100%;
    }
  }
  
  .labelContainer {
    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`

class LaunchItem extends React.Component {

  constructor(props) {
    super(props)
    this.anchorElRef = React.createRef();
  }

  state = {
    menuOpen: false,
    imgData: null
  }

  componentDidMount = async () => {
    try {
      const { launchItem: { icon = 'default.png' } } = this.props
      const imgData = await getBase64ImgFromFs('./logo/' + icon)
      this.setState({imgData})
    } catch (err) {
      console.log(err)
    }
  }

  handleLaunchItemClick = (launchItem) => {
    return debounce(async () => {
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

  renderImage = () => {
    const { isVisible } = this.props
    const { imgData } = this.state
  
    if (!isVisible || !imgData) return null

    return <img src={imgData} />
  }

  render = () => {
    const {launchItem, key} = this.props

    return (
      <React.Fragment>
        <StyledLaunchItem
          ref={this.anchorElRef}
          aria-owns={this.anchorElRef.current ? `launch-items-list-${key}` : undefined}
          aria-haspopup="true"
          key={key}
          onClick={this.handleLaunchItemClick(launchItem)}
        >
          <div className="imageContainer">
            { this.renderImage() }
          </div>
          <div className="labelContainer">{launchItem.caption}</div>
        </StyledLaunchItem>
        {
          launchItem.List && launchItem.List.length &&
          <Menu
            id={`launch-items-list-${key}`}
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