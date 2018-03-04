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
    if (this.mounted) {
      if (typeof error.then === 'function') {
        this.setState({ isLoading: true })
        error.then(() => {
          if (this.mounted) {
            this.setState({ isLoading: false })
          }
        })
        if (typeof this.props.renderError === 'function') {
          error.catch(err => {
            if (this.mounted) {
              this.setState({
                error: err,
              })
            }
          })
        }
      }
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

const cached = {}
export const createFetcher = (createTask, onError) => {
  let ref = cached
  let task
  return () => {
    if (!task) {
      task = createTask()
      task.then(res => {
        ref = res
      })
      if (typeof onError === 'function') {
        task.catch(onError)
      }
    }
    if (ref === cached) {
      throw task
    }
    return ref
  }
}
