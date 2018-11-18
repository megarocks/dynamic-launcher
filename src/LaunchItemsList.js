import React from 'react'
import styled from 'styled-components'
import {AutoSizer, List} from 'react-virtualized';

import LaunchItem from "./LaunchItem"

const StyledList = styled(List)`    
  .StyledList--row {
    display: grid;
    grid-template-columns: repeat(8, 100px);
    grid-template-rows: 140px;
    grid-gap: 1em;
    justify-content: center;
  }
`

function LaunchItemsList({launchItems}) {

  function rowRenderer({
                         key,         // Unique key within array of rows
                         index,       // Index of row within collection
                         isScrolling, // The List is currently being scrolled
                         isVisible,   // This row is visible within the List (eg it is not an overscanned row)
                         style        // Style object to be applied to row (to position it)
                       }) {
    const firstElementInRowIdx = index * 8
    const rowElements = launchItems.slice(firstElementInRowIdx, firstElementInRowIdx + 8)
    return (
      <div style={style} className="StyledList--row">
        {rowElements.map((el, idx) => <LaunchItem key={key + idx} launchItem={el}/>)}
      </div>
    )
  }

  return (
    <AutoSizer>
      {({height, width}) => (
        <StyledList
          width={width}
          height={height}
          rowHeight={156} //140px + 1em
          rowRenderer={rowRenderer}
          rowCount={launchItems.length > 8 ? Math.ceil(launchItems.length / 8) : launchItems.length}/>
      )}
    </AutoSizer>
  )
}

export default LaunchItemsList