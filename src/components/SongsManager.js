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
  defaultList = this.player.listOfAll.title

  constructor(...args) {
    super(...args)
    this.state = {
      selectedRowKeys: [],
      selectPlayListVisible: false,
      selectedListID: this.player.selectedListID,
      selectedList: this.player.getSelectedList(),
      metaDatas: this.player.getMetaDatas(),
      listsKeys: this.player.getListsKeys(),
      confirmLoading: false,
      deleteBtnLoading: false,
    }

    this.state.listOptions = this.getListOptions(this.state.listsKeys)
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
      fixed: 'right',
      width: 100,
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

  componentWillMount() {
    this.player.on('update', this.updatePlayerState)
  }

  componentWillUnmount() {
    this.player.removeListener('update', this.updatePlayerState)
  }

  handleTableSelectedChange = selectedRowKeys => {
    this.setState({ selectedRowKeys })
  }

  handleItemClick = async e => {
    const { player } = this
    const { target } = e
    const { op } = target.dataset
    const { key } = target.parentNode.dataset
    if (key) {
      if (op === 'delete') {
        await player.delete(key, this.state.selectedListID)
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

  handleDeleteClick = async () => {
    const { selectedRowKeys, selectedListID } = this.state
    this.setState({
      deleteBtnLoading: true,
    })
    await this.player.delete(selectedRowKeys, selectedListID)
    this.setState({
      selectedRowKeys: [],
      deleteBtnLoading: false,
    })
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

  handleModalConfirm = async () => {
    const { selectedRowKeys, playlistInputed } = this.state
    this.setState({
      confirmLoading: true,
    })
    await this.player.add(selectedRowKeys, playlistInputed)
    this.setState({
      selectPlayListVisible: false,
      confirmLoading: false,
      selectedRowKeys: [],
    })
  }

  handleModalInputChange = playlistInputed => {
    this.setState({
      playlistInputed,
    })
  }

  updatePlayerState = (key, value) => {
    if (key === 'selectedList') {
      this.setState({
        [key]: value,
        selectedListID: value.title,
        metaDatas: this.player.getMetaDatas(),
      })
    } else if (key === 'listsKeys') {
      this.setState({
        [key]: value,
        listOptions: this.getListOptions(value),
      })
    }
  }

  getCompleteSrc(listsKeys) {
    const { playlistInputed, selectedListID } = this.state
    const { defaultList } = this
    return listsKeys.filter(
      l => ![defaultList, playlistInputed, selectedListID].includes(l)
    )
  }

  getListOptions(listsKeys) {
    return listsKeys.map(l => <Option key={l}>{l}</Option>)
  }

  handlePlayListSelect = selectedListID => {
    if (this.player.selectedListID !== selectedListID) {
      this.player.selectedListID = selectedListID
    }
  }

  handlePlayListDelete = () => {
    this.player.deletePlayList()
  }

  render() {
    const {
      selectedRowKeys,
      selectPlayListVisible,
      playlistInputed,
      metaDatas,
      selectedListID,
      confirmLoading,
      deleteBtnLoading,
      listOptions,
      listsKeys,
    } = this.state
    const { columns } = this

    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleTableSelectedChange,
    }

    const hasSelected = selectedRowKeys.length > 0

    return (
      <div>
        <div style={{ margin: '16px 0px 5px' }}>
          <span style={{ marginLeft: 8 }}>
            {hasSelected ? `已选择 ${selectedRowKeys.length} 首` : ''}
          </span>
        </div>
        <div className="player__listActions">
          <Select
            style={{ width: 100 }}
            value={selectedListID}
            placeholder="切换歌单"
            onChange={this.handlePlayListSelect}
            children={listOptions}
          />{' '}
          <Button
            type="danger"
            onClick={this.handlePlayListDelete}
            disabled={selectedListID === this.defaultList}
          >
            删除当前歌单
          </Button>{' '}
          <Button
            type="danger"
            loading={deleteBtnLoading}
            onClick={this.handleDeleteClick}
            disabled={!hasSelected}
          >
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
                loading={confirmLoading}
              >
                确定
              </Button>,
            ]}
          >
            <AutoComplete
              style={{ width: 200 }}
              dataSource={this.getCompleteSrc(listsKeys)}
              placeholder="输入歌单名称"
              onChange={this.handleModalInputChange}
              value={playlistInputed}
              disabled={!hasSelected}
              allowClear
              filterOption={autoCompleteFilter}
            />
          </Modal>
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={metaDatas}
          size="small"
          scroll={{ x: 450 }}
        />
      </div>
    )
  }
}

export default SongsManager
