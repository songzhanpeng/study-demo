/*
 * @Author: your name
 * @Date: 2021-07-20 20:26:16
 * @LastEditTime: 2021-07-27 10:32:00
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-redux\src\redux\index.js
 */
export const createStore = (reducer, initState = { name: "张三" }) => {
  // console.log(reducer);
  // 状态
  let state = initState;
  // 订阅者
  const listeners = [];

  // 订阅
  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  };

  // 修改
  const dispatch = (action) => {
    state = reducer(state, action);
    // 执行
    listeners.forEach((item) => item());
  };

  // 按需加载reducer
  const replaceReducer = (newReducer) => {
    reducer = newReducer;
    //刷新一遍 state 的值，新来的 reducer 把自己的默认状态放到state
    dispatch({ type: Symbol() });
  };

  // 获取状态
  const getState = () => state;

  // 初始化
  dispatch({
    type: Symbol(),
  });

  return {
    subscribe,
    dispatch,
    getState,
    replaceReducer,
  };
};

// 中间件 函数
export const applyMiddleware = (...middlewares) => {
  // 返回以一个重新的createStore
  return function (oldStore) {
    // 返回重写后新的createStore
    return function (reducer, initState) {
      // 生成store
      const store = oldStore(reducer, initState);
      // 只允许使用 getState 方法
      const simpleStore = {
        getState: store.getState,
      };
      // 给每一个middleware 传递store参数
      const chain = middlewares.map((item) => item(simpleStore));
      let dispatch = store.dispatch;
      // 实现time(exception(logger(next)))
      chain.reverse().map((item) => {
        dispatch = item(dispatch);
      });
      // 重写dispatch
      store.dispatch = dispatch;
      return store;
    };
  };
};

// 合并函数
export const combineReducer = (reducers) => {
  // 取到键名
  const reducersKey = Object.keys(reducers);
  // 返回一个函数
  return function (state = {}, action) {
    // 默认为空
    let newState = {};
    // 循环
    for (let i in reducersKey) {
      // 获取key
      let reducerKey = reducersKey[i];
      // 获取 key对应state
      let reducerState = state[reducerKey];
      // 获取对应 reducer
      let reducerFunction = reducers[reducerKey];
      newState[reducerKey] = reducerFunction(reducerState, action);
    }
    // console.log(newState, 135);
    return newState;
  };
};
