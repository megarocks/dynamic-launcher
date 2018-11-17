import React from 'react';
import styled from 'styled-components'
import PropTypes from 'prop-types';

const StyledRemoteInfo = styled.div`
  padding: 0.5em;
  height: 100%;
  
  display: grid;
  grid-template-rows: 15% 85%;
  
  .RemoteInfo-content {
    overflow-y: scroll;
    margin: 0;
  }
`

class RemoteInfo extends React.Component {

  state = {
    list: []
  }

  componentDidMount = () => {
    const {serverParams: { refreshInterval = 10000 } = {}} = this.props;
    this.refreshTicker = setInterval(this.fetchRemoteDataAndUpdateState, refreshInterval)
  }

  fetchRemoteDataAndUpdateState = async () => {
    try {
      const {serverParams: { protocol, host, port, fileName } = {}} = this.props;
      const connectionString =  `${protocol}://${host}:${port}/${fileName}.json`
      const response = await fetch(connectionString)
      const parsedResponse = await response.json()

      this.setState({
        list: parsedResponse,
      })
    } catch (err) {
      console.error(err)
      this.setState({
        list: [{text: 'Сервер информации не доступен'}],
      })
    }
  }

  componentWillUnmount = () => {
    clearInterval(this.refreshTicker)
  }

  render = () => {
    const {title = 'Важная информация'} = this.props
    const { list = [] } = this.state
    return (
      <StyledRemoteInfo>
        <div><strong>{title}</strong></div>
        {
          list.length
            ?
          <ul className="RemoteInfo-content">
            {list.map((li, idx) => <li key={idx}>{li.text}</li>)}
          </ul>
          : <p>Здесь пока ничего нет</p>
        }
      </StyledRemoteInfo>
    )
  }
}

RemoteInfo.propTypes = {
  serverParams: PropTypes.shape({
    refreshInterval: PropTypes.number,
    protocol: PropTypes.oneOf(['http', 'https']).isRequired,
    host: PropTypes.string.isRequired,
    port: PropTypes.number.isRequired,
    fileName: PropTypes.string.isRequired
  }).isRequired,
  title: PropTypes.string
}

export default RemoteInfo