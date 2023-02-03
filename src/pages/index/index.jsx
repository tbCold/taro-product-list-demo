import React, { Component, useState, useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { View, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { initData } from './data'
import { CHANGE_TAG_STATUS } from '../../store/actions/index'
import './index.scss'


function throttle (fn, wait = 0) {
  let timerId;
  let lastInvoke = Number.MIN_SAFE_INTEGER; // 上次调用时间
  return function(...args) {
    // 当前时间
    const currTime = new Date().getTime();
    // 距离下次执行的剩余时间
    const remain = Math.max(lastInvoke + wait - currTime, 0);
    // 更新定时器，确保同一时间只有一个定时器在运行
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      lastInvoke = new Date().getTime();
      fn(...args);
    }, remain);
  }
}

export default class Index extends Component {

  state = {
    categoryList: [],
    activeId: '',
    height: 0
  }

  componentWillMount () { }

  componentDidMount () {
    const data = initData()
    console.log('categoryList--->', data)
    this.setState({categoryList: data, activeId: data[0].id})
    // const topHeight = this.topRef.current.clientHeight
    // const bottomHeight = this.bottomRef.current.clientHeight
    setTimeout(() => {
      let topHeight = 0
      let bottomHeight = 0
      Taro.createSelectorQuery().select('#topPart').boundingClientRect((res) => {
        console.log('topPart--->', res)
        topHeight = res.height
      }).exec()
      const bottomQuery = Taro.createSelectorQuery()
      bottomQuery.select('#bottomPart').fields({
        id: true,
        size: true,
      }, function (res) {
        console.log('bottomPart--->', res)
        bottomHeight = res.height
      }).exec()
      const timer = setInterval(() => {
        if (topHeight > 0 && bottomHeight > 0) {
          clearInterval(timer)
          try {
            const res = Taro.getSystemInfoSync()
            const screenHeight = res.windowHeight
            console.log('screenHeight--->', screenHeight, topHeight, bottomHeight)
            this.setState({height: screenHeight - topHeight - bottomHeight})
          } catch (error) {
            
          }
        }
      }, 200)
      
    }, 200)
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  topRef = React.createRef()
  bottomRef = React.createRef()

  handleActiveId = (id) => {
    this.setState({activeId: id})
  }

  render () {
    return (
      <View className='index'>
        <View className='topPart' id='topPart' ref={this.topRef}>1</View>
        <View className='centerPart'>
          <CategoryList list={this.state.categoryList} activeId={this.state.activeId} changeActiveId={this.handleActiveId} />
          <ProductList height={this.state.height} list={this.state.categoryList} activeId={this.state.activeId} changeActiveId={this.handleActiveId} />
        </View>
        <View className='bottomPart' id='bottomPart' ref={this.bottomRef}>2</View>
      </View>
    )
  }
}

const CategoryList = props => {
  const { list, activeId, changeActiveId } = props
  const dispatch = useDispatch()
  const handleClick = id => {
    changeActiveId(id)
    dispatch({
      type: CHANGE_TAG_STATUS,
      payload: {
        tag: true
      }
    })
  }
  return (
    <ScrollView className='categoryList' scrollY>
      {
        list.map(item => {
          return (
            <View
              key={item.id}
              className={`categoryItem ${activeId === item.id ? 'activeCategoryItem' : ''}`}
              onClick={() => handleClick(item.id)}
            >{item.name}</View>
          )
        })
      }
    </ScrollView>
  )
}

const ProductList = props => {
  const { list, activeId, changeActiveId, height } = props
  const [data, setData] = useState([])
  const [offsetArr, setOffsetArr] = useState([])
  const [scrollTop, setScrollTop] = useState(0)
  const ref = useRef(null)
  const tag = useSelector(state => {
    return state.tagReducer.tag
  })
  const dispatch = useDispatch()
  // console.log('tag--->', tag)
  const handleScroll = useCallback(throttle(e => {
    // console.log('scroll--->', e.detail.scrollTop)
    const offsetTop = e.detail.scrollTop
    if (tag) {
      return dispatch({
        type: CHANGE_TAG_STATUS,
        payload: {
          tag: false
        }
      })
    }
    for (let i = 0; i < offsetArr.length; i++) {
      if (i === offsetArr.length - 1) {
        if (offsetTop >= offsetArr[i]) {
          // if (Math.abs(scrollTop - offsetTop) < 10 && scrollTop > 0) {
            // setScrollTop(0)
            changeActiveId(list[i].id)
            // console.log('scroll--->', offsetTop, offsetArr)
            break
          // }
          // if (scrollTop === 0) {
          //   changeActiveId(list[i].id)
          //   break
          // }
        }
      }
      if (offsetTop >= offsetArr[i] && offsetTop <= offsetArr[i + 1]) {
        // if (Math.abs(scrollTop - offsetTop) < 10 && scrollTop > 0) {
          // setScrollTop(0)
          changeActiveId(list[i].id)
          // console.log('scroll--->', offsetTop, offsetArr)
          break
        // }
        // if (scrollTop === 0) {
        //   changeActiveId(list[i].id)
        //   break
        // }
      }
    }
  }, 200), [scrollTop, offsetArr, tag, list])
  useEffect(() => {
    let temp = []
    list.forEach(item => {
      temp.push({
        id: item.id,
        name: item.name,
        tag: 1
      })
      temp = temp.concat(item.productList)
    })
    console.log('temp--->', temp)
    setData(temp)
  }, [list, list.length])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (data.length > 0) {
        const temp = []
        const dataTemp = data.filter(item => item.tag === 1)
        const firstQuery = Taro.createSelectorQuery()
        firstQuery.select('#' + dataTemp[0].id).fields({
          id: true,
          rect: true,
        }, function (res1) {
          let top = 0
          top = res1.top
          for (let i = 0; i < dataTemp.length; i++) {
            const item = dataTemp[i];
            // temp.push(document.getElementById(item.id).offsetTop);
            (function (obj, index) {
              const query = Taro.createSelectorQuery()
              query.select('#' + obj.id).fields({
                id: true,
                rect: true,
              }, function (res) {
                console.log('queryNode--->', res, top)
                temp.push(res.top - top)
                if (index === dataTemp.length - 1) {
                  setOffsetArr(temp)
                  console.log('layouteffect--->', temp)
                }
              }).exec()
            })(item, i);
          }
        }).exec()
      }
    }, 200)
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [data, data.length])

  useEffect(() => {
    if (tag === false) return null
    const index = list.findIndex(item => item.id === activeId)
    if (offsetArr.length > 0) {
      console.log('index--->', offsetArr[index])
      if (Taro.ENV_TYPE.WEAPP === Taro.getEnv()) {
        setScrollTop(offsetArr[index])
      }
      if (ref.current) {
        ref.current.scrollTop = offsetArr[index]
      }
    }
  }, [activeId, offsetArr, list, tag])

  return (
    <ScrollView ref={ref} id='productList' scrollWithAnimation scrollTop={scrollTop} className='productList' scrollY onScroll={handleScroll} style={{height}}>
      {
        data.map(item => {
          return (
            <View key={'product-key-' + item.id} id={item.id} className={`productItem ${item.tag ? 'tagItem' : ''}`}>{item.name}</View>
          )
        })
      }
    </ScrollView>
  )
}
