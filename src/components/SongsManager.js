import { Table } from 'antd'
import React from 'react'
import PropTypes from 'prop-types'

class SongsManager extends React.Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    player: PropTypes.object.isRequired,
  }

  state = {
    selectedRowKeys: [],
  }

  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys })
  }

  handleDelete = (e) => {
    const { player } = this.props
    player.delete(e.target.dataset.key)
  }

  handlePlay = (e) => {
    const { player } = this.props
    player.play(e.target.dataset.key)
  }

  render() {
    const { selectedRowKeys } = this.state
    const { data } = this.props

    const columns = [
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
          <span>
            <a data-key={key} onClick={this.handleDelete}>
              删除
            </a>&nbsp;&nbsp;&nbsp;<a data-key={key} onClick={this.handlePlay}>
              播放
            </a>
          </span>
        ),
      },
    ]
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    }
    const hasSelected = selectedRowKeys.length > 0
    return (
      <div>
        <div style={{ marginTop: 16 }}>
          <span style={{ marginLeft: 8 }}>
            {hasSelected ? `已选择 ${selectedRowKeys.length} 首` : ''}
          </span>
        </div>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={data}
          size="small"
        />
      </div>
    )
  }
}

export default SongsManager
