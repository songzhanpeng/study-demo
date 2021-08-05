import React, { Component } from "react";

export default class App extends Component {
  /* 
  
      // 用于初始化 state
      constructor() {}
      // 用于替换 `componentWillReceiveProps` ，该函数会在初始化和 `update` 时被调用
      // 因为该函数是静态函数，所以取不到 `this`
      // 如果需要对比 `prevProps` 需要单独在 `state` 中维护
      static getDerivedStateFromProps(nextProps, prevState) {}
      // 判断是否需要更新组件，多用于组件性能优化
      shouldComponentUpdate(nextProps, nextState) {}
      // 组件挂载后调用
      // 可以在该函数中进行请求或者订阅
      componentDidMount() {}
      // 用于获得最新的 DOM 数据
      getSnapshotBeforeUpdate() {}
      // 组件即将销毁
      // 可以在此处移除订阅，定时器等等
      componentWillUnmount() {}
      // 组件销毁后调用
      componentDidUnMount() {}
      // 组件更新后调用
      componentDidUpdate() {}
      // 渲染组件函数
      render() {}
  */

  state = {
    age: 20,
  };

  // render 之后
  getSnapshotBeforeUpdate(nextProps, prevState) {
    console.log("getSnapshotBeforeUpdate", nextProps, prevState);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    console.log(
      "🚀 ~ file: App.jsx ~ line 14 ~ App ~ getDerivedStateFromProps ~ prevState",
      prevState
    );
    const { type } = nextProps;

    // 当传入的type发生变化的时候，更新state
    if (type !== prevState.type) {
      return {
        type,
      };
    }

    // 否则，对于state不进行任何操作
    return null;
  }

  componentDidUpdate() {
    console.log("componentDidUpdate");
  }

  componentDidMount() {
    console.log("componentDidMount");
  }

  add() {
    const { age } = this.state;
    this.setState({
      age: age + 1,
    });
  }

  render() {
    const { age } = this.state;
    return (
      <div>
        <h1>韩琴</h1>
        <h2>年龄:{age}</h2>
        <button onClick={() => this.add()}>+++</button>
      </div>
    );
  }
}
