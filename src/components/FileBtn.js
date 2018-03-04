import { Button } from 'antd'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

const inputStyle = { display: 'none' }

export default class FileBtn extends Component {
  state = {
    loading: false,
  }

  static propTypes = {
    refInput: PropTypes.func,
    onClick: PropTypes.func,
    onChange: PropTypes.func,
    children: PropTypes.any,
    btnProps: PropTypes.object,
    className: PropTypes.string,
    style: PropTypes.object,
  }

  saveFileRef = node => {
    const { refInput } = this.props
    if (typeof refInput === 'function') {
      refInput(node)
    }
    this.file = node
  }

  handleClick = e => {
    const { onClick } = this.props
    if (typeof onClick === 'function') {
      onClick(e)
    }
    this.file.click()
  }

  handleFile = async e => {
    const { onChange } = this.props
    const { target } = e
    this.setState({
      loading: true,
    })
    if (typeof onChange === 'function') {
      await onChange(target.files)
    }
    target.value = null
    this.setState({
      loading: false,
    })
  }

  render() {
    const { loading } = this.state
    const {
      children,
      className,
      style,
      onClick,
      onChange,
      btnProps,
      refInput,
      ...inputProps
    } = this.props

    return (
      <Button
        style={style}
        className={className}
        {...btnProps}
        loading={loading}
        onClick={this.handleClick}
      >
        {children}
        <input
          type="file"
          {...inputProps}
          style={inputStyle}
          onChange={this.handleFile}
          ref={this.saveFileRef}
        />
      </Button>
    )
  }
}
