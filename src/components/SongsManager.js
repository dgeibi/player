import { Button, Table, Modal, AutoComplete, Select } from 'antd'
import React from 'react'
import PropTypes from 'prop-types'

const { Option } = Select

const autoCompleteFilter = (inputValue, option) =>
  option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
class SongsManager extends React.Component {
  static contextTypes = {
    player: PropTypes.object.isRequired,
  }

  player = this.context.player

  state = {
    selectedRowKeys: [],
    selectPlayListVisible: false,
    selectedListID: this.player.selectedListID,
    metaDatas: this.getMetaDatas(),
    lists: this.getLists(),
  }

  columns = [
    {
      title: '歌曲标题',
      dataIndex: 'title',
    },
    {
      title: '歌手',
      dataIndex: 'artist',
    },
    {
      title: '操作',
      dataIndex: '',
      key: 'x',
      render: ({ key }) => (
        <span data-key={key} onClick={this.handleItemClick}>
          <a href="#op" data-op="delete">
            删除
          </a>&nbsp;&nbsp;&nbsp;
          <a href="#op" data-op="play">
            播放
          </a>
        </span>
      ),
    },
  ]

  getMetaDatas() {
    const { metaDatas, selectedListID, playlists } = this.player
    const playlist = playlists.get(selectedListID)
    return [...playlist.keys].map(k => metaDatas.get(k))
  }

  getLists() {
    const { playlists, listOfAll } = this.player

    const ret = [listOfAll.title]
    // eslint-disable-next-line no-restricted-syntax
    for (const { title, keys } of playlists.values()) {
      if (listOfAll.title !== title && keys.size > 0) {
        ret.push(title)
      }
    }
    return ret
  }

  componentWillMount() {
    this.player.on('songs-update', this.updateMetaData)
    this.player.on('update', this.updatePlayerState)
  }

  componentWillUnmount() {
    this.player.removeListener('songs-update', this.updateMetaData)
    this.player.removeListener('update', this.updatePlayerState)
  }

  handleTableSelectedChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys })
  }

  handleItemClick = (e) => {
    const { player } = this
    const { target } = e
    const { op } = target.dataset
    const { key } = target.parentNode.dataset
    if (key) {
      if (op === 'delete') {
        player.delete(key, this.state.selectedListID)
        if (this.state.selectedRowKeys.includes(key)) {
          this.setState({
            selectedRowKeys: this.state.selectedRowKeys.filter(k => k !== key),
          })
        }
      } else if (op === 'play') {
        player.play(key, this.state.selectedListID)
      }
    }
  }

  handleDeleteClick = () => {
    const { selectedRowKeys, selectedListID } = this.state
    this.setState(
      {
        selectedRowKeys: [],
      },
      () => {
        this.player.delete(selectedRowKeys, selectedListID)
      }
    )
  }

  showSelectPlayListModal = () => {
    this.setState({
      selectPlayListVisible: true,
      playlistInputed: '',
    })
  }

  handleModalCancel = () => {
    this.setState({
      selectPlayListVisible: false,
    })
  }

  handleModalConfirm = () => {
    const { selectedRowKeys, playlistInputed } = this.state
    this.setState(
      {
        selectPlayListVisible: false,
        selectedRowKeys: [],
      },
      () => {
        this.player.add(selectedRowKeys, playlistInputed)
      }
    )
  }

  handleModalInputChange = (playlistInputed) => {
    this.setState({
      playlistInputed,
    })
  }

  updateMetaData = () => {
    this.setState({
      metaDatas: this.getMetaDatas(),
      lists: this.getLists(),
    })
  }

  updatePlayerState = (key, value) => {
    if (key === 'selectedListID') {
      this.setState({
        [key]: value,
        metaDatas: this.getMetaDatas(),
      })
    }
  }

  handlePlayListSelect = (selectedListID) => {
    if (this.state.selectedListID !== selectedListID) {
      this.player.selectedListID = selectedListID
    }
  }

  render() {
    const {
      selectedRowKeys,
      selectPlayListVisible,
      playlistInputed,
      metaDatas,
      selectedListID,
      lists,
    } = this.state
    const { columns } = this

    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleTableSelectedChange,
    }

    const hasSelected = selectedRowKeys.length > 0
    return (
      <div>
        <div style={{ margin: '16px 0px' }}>
          <span style={{ marginLeft: 8 }}>
            {hasSelected ? `已选择 ${selectedRowKeys.length} 首` : ''}
          </span>
        </div>
        <div style={{ marginBottom: 16 }}>
          <Select
            style={{ width: 100 }}
            value={selectedListID}
            placeholder="切换歌单"
            onChange={this.handlePlayListSelect}
            children={lists.map(l => <Option key={l}>{l}</Option>)}
          />{' '}
          <Button type="danger" onClick={this.handleDeleteClick} disabled={!hasSelected}>
            删除
          </Button>{' '}
          <Button onClick={this.showSelectPlayListModal} disabled={!hasSelected}>
            收藏到歌单
          </Button>
          <Modal
            visible={selectPlayListVisible}
            title="收藏到歌单"
            onOk={this.handleModalConfirm}
            onCancel={this.handleModalCancel}
            footer={[
              <Button key="back" size="large" onClick={this.handleModalCancel}>
                取消
              </Button>,
              <Button
                key="submit"
                type="primary"
                size="large"
                onClick={this.handleModalConfirm}
              >
                确定
              </Button>,
            ]}
          >
            <AutoComplete
              style={{ width: 200 }}
              dataSource={lists.filter(l => l !== this.player.listOfAll.title)}
              placeholder="输入歌单名称"
              onChange={this.handleModalInputChange}
              value={playlistInputed}
              filterOption={autoCompleteFilter}
            />
          </Modal>
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={metaDatas}
          size="small"
        />
      </div>
    )
  }
}

export default SongsManager
