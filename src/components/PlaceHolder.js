/* copy from
   https://github.com/facebook/react/blob/master/packages/simple-cache-provider
   https://zhuanlan.zhihu.com/p/34210780?group_id=953621750831964160
*/
import { Component } from 'react'

export default class Placeholder extends Component {
  state = {
    isLoading: false,
    error: null,
  }

  static defaultProps = {
    fallback: 'Loading...',
  }

  componentDidCatch(error) {
    const isSuspender = typeof error.then === 'function'
    const hasRenderError = typeof this.props.renderError === 'function'
    if (!isSuspender && !hasRenderError) {
      throw error
    }

    if (isSuspender) {
      this.setState({ isLoading: true })
      error.then(() => {
        if (this.mounted) {
          this.setState({ isLoading: false })
        } else {
          throw Error('umounted?!')
        }
      })
      if (hasRenderError) {
        error.catch(err => {
          if (this.mounted) {
            this.setState({
              error: err,
            })
          } else {
            throw Error('umounted?!')
          }
        })
      }
    } else {
      this.setState({
        error,
      })
    }
  }

  componentDidMount() {
    this.mounted = true
  }

  componentWillUnmount() {
    this.mounted = false
  }

  render() {
    const { children, fallback, renderError } = this.props
    const { isLoading, error } = this.state

    if (typeof renderError === 'function' && error) {
      return renderError({ error })
    }
    return isLoading ? fallback : children
  }
}

const noop = () => {}

const getRecord = (caches, createTask, hashedKey) => {
  let record = caches.get(hashedKey)

  if (record === undefined) {
    const suspender = createTask(hashedKey)
    suspender.then(
      value => {
        caches.set(hashedKey, {
          rejected: false,
          resolved: true,
          value,
        })
      },
      error => {
        caches.set(hashedKey, {
          resolved: false,
          rejected: true,
          error,
        })
      }
    )
    record = {
      resolved: false,
      rejected: false,
      suspender,
    }
    caches.set(hashedKey, record)
  }

  return record
}

export const createLoader = (createTask, hash = noop) => {
  const caches = new Map()
  return key => {
    const hashedKey = hash(key)
    if (
      (typeof hashedKey === 'object' && hashedKey !== null) ||
      typeof hashedKey === 'function'
    ) {
      throw Error('hashedKey should not be function or object')
    }
    const record = getRecord(caches, createTask, hashedKey)
    if (record.resolved) {
      return record.value
    }
    if (!record.rejected) {
      throw record.suspender
    }
    throw record.error
  }
}
