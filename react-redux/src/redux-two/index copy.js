/*
 * @Author: your name
 * @Date: 2021-07-27 08:42:24
 * @LastEditTime: 2021-07-27 10:05:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-redux\src\redux-two\index.js
 */

// 实现目标
// const state = {
//   name: "宋站鹏",
// };

// console.log(state.name);

// state.name = 12;

const createStore = (reducer, initState = { name: "宋站鹏" }, reStoreFunc) => {
  // 初始化
  let state = initState;

  // 重置 createStore
  if (reStoreFunc) {
    let newCreateStore = reStoreFunc(createStore);
    return newCreateStore(reducer, initState);
  }

  // 监听器
  const listeners = [];

  // 订阅者
  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  };

  // 修改state的唯一方式
  const dispatch = (action) => {
    // console.log("🚀 ~ file: index.js ~ line 42 ~ dispatch ~ action", action);
    // console.log(reducer);
    console.log(state, 44);
    // 更改值
    state = reducer(state, action);
    // 执行订阅
    listeners.forEach((item) => item());
  };

  // 获取state
  const getState = () => state;

  // 按需加载reducer
  const replaceReducer = (newReducer) => {
    reducer = newReducer;
    //刷新一遍 state 的值，新来的 reducer 把自己的默认状态放到state
    dispatch({ type: Symbol() });
  };

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

// 中间件
const applyMiddleware = (...middlewares) => {
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

// state
const initState = {
  person: {
    name: "宋站鹏",
  },
  like: {
    eat: "甜食",
  },
};

const personReducer = (state, action) => {
  //   console.log("🚀 ~ file: index.js ~ line 83 ~ personReducer ~ state", state);
  const { type } = action;
  switch (type) {
    case "SET_NAME": {
      state.name = action.name;
      return { ...state };
    }
    default:
      return state;
  }
};

const likeReducer = (state, action) => {
  const { type } = action;
  switch (type) {
    case "SET_LIKE": {
      state.eat = action.eat;
      return { ...state };
    }
    default:
      return state;
  }
};

// 合并函数
const combineReducer = (reducers) => {
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
      //   console.log("🚀 ~ file: index.js ~ line 119 ~ reducerKey", reducerKey);
      // 获取 key对应state
      let reducerState = state[reducerKey];
      //   console.log(
      //     "🚀 ~ file: index.js ~ line 122 ~ reducerState",
      //     reducerState
      //   );
      // 获取对应 reducer
      let reducerFunction = reducers[reducerKey];
      //   console.log(
      //     "🚀 ~ file: index.js ~ line 128 ~ reducerFunction",
      //     reducerFunction
      //   );
      newState[reducerKey] = reducerFunction(reducerState, action);
    }
    // console.log(newState, 135);
    return newState;
  };
};

// 合并函数
let reducer = combineReducer({
  person: personReducer,
  like: likeReducer,
});

let logMiddleware = (store) => (next) => (action) => {
  console.log("修改前", getState());
  console.log("action", action);
  next(action);
  console.log("修改后", getState());
};

let execptionMiddleware = (store) => (next) => (action) => {
  try {
    //LogMiddleware(action)
    next(action);
  } catch (err) {
    console.log(err);
  }
};

let timeMiddleware = (store) => (next) => (action) => {
  console.log("时间" + new Date());
  next(action);
};

// 创建
let newCreateStore = applyMiddleware(
  execptionMiddleware,
  timeMiddleware,
  logMiddleware
)(createStore);

let store = createStore(reducer, {}, newCreateStore);

// console.log(newCreateStore);
//   let store = newCreateStore(reducer, initState);
let { dispatch, getState, subscribe } = store;

// 订阅者
// subscribe(() => {
//   console.log(new Date().toLocaleString(), getState());
// });

// 声明 一个函数代替dispatch
let next = dispatch;

// 添加中间件
// dispatch = (action) => {
//   // 修改前
//   console.log("\n修改前");
//   console.log(new Date().toLocaleString(), getState());
//   next(action);
//   // 修改后
//   console.log("修改后");
//   console.log(new Date().toLocaleString(), getState());
// };

// 捕获异常
// dispatch = (action) => {
//   try {
//     console.log("修改前", getState());
//     console.log("action", action);
//     next(action);
//     console.log("修改后", getState());
//   } catch (err) {
//     console.log(err);
//   }
// };

// let logMiddleware = (action) => {
//   console.log("修改前", getState());
//   console.log("action", action);
//   next(action);
//   console.log("修改后", getState());
// };

// let execptionMiddleware = (action) => {
//   try {
//     logMiddleware(action);
//   } catch (err) {
//     console.log(err);
//   }
// };

// 重写dispatch 这种写法要一直嵌套很不友好
// dispatch = execptionMiddleware(timeMiddleware(logMiddleware(next)));

// dispatch({
//   type: "SET_NAME",
//   name: "张三",
// });

// // 对应不上的 走默认
// dispatch({
//   type: "SET_LIKE",
//   eat: "apple",
// });
