/**
 * Component wrapping function panels
 * @author Marián Hlaváč
 */

import React from 'react'
import FunctionSettings from './FunctionSettings.component'
import FunctionSearch from './FunctionSearch.component'
import FunctionFilter from './FunctionFilter.component'

import Toggleable from './Toggleable.component'

export default class FunctionsSidebar {
  constructor (props) {
    super.constructor(props)
  }

  /**
   * Renders the component
   */
  render () {

    let functionToRender

    if (this.props.opened == 'settings') {
      functionToRender = (
        <FunctionSettings
          ref="functionSettings"
          onSettingChange={this.props.onSettingChange}
          onLanguageChange={this.props.onRefreshNeed}
          options={this.props.options}
        />
      )
    }
    if (this.props.opened == 'search') {
      functionToRender = (
        <FunctionSearch
          ref="functionSearch"
          onSearch={this.props.onSearch}
          searchResults={this.props.searchResults}
          onViewChange={this.props.onViewChange}
        />
      )
    }
    if (this.props.opened == 'filter') {
      functionToRender = (
        <FunctionFilter
          ref="functionFilter"
          displayFilter={this.props.displayFilter}
          onFilterChange={this.props.onFilterChange}
        />
      )
    }

    const className = `functions-sidebar ${this.props.opened !== null ? '' : 'hide'}`

    return (
      <div className={className}>
        <div className="wrap">
          {functionToRender}
        </div>
      </div>
    )
  }
}
