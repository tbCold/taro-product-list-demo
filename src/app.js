import { Component } from 'react'
import { Provider } from 'react-redux'
import configStore from './store'
import './app.scss'

const store = configStore()

class App extends Component {

  componentDidMount () {}

  componentDidShow () {}

  componentDidHide () {}

  componentDidCatchError () {}

  // this.props.children 是将要会渲染的页面
  render () {
    return (<Provider store={store} style={{height: '100%'}}>
      {this.props.children}
    </Provider>)
  }
}

export default App
