import React from 'react';
import {useState, useEffect} from 'react';
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

async function fetchRemoteData(props) {
  const {serverParams: {protocol, host, port, fileName} = {}} = props;
  const connectionString = `${protocol}://${host}:${port}/${fileName}.json`
  const response = await fetch(connectionString)
  return response.json()
}

const RemoteInfo = (props) => {
  const [list, setList] = useState([])

  useEffect(() => {
    const {serverParams: {refreshInterval = 10000} = {}} = props;
    const refreshTicker = setInterval(async () => {
      try {
        const remoteData = await fetchRemoteData(props)
        setList(remoteData)
      } catch (e) {
        console.error(e)
        setList([{text: 'Сервер информации не доступен'}])
      }
    }, refreshInterval)

    return function cleanUp() {
      clearInterval(refreshTicker)
    }
  })

  return (
    <StyledRemoteInfo>
      <div><strong>{props.title}</strong></div>
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