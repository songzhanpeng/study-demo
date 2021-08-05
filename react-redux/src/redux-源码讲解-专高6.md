##### 从零开始的 redux 之路，应用 redux 解决微信原生小程序中的通信问题

redux 是状态管理器，提供可预测化的状态管理。我不会把 redux 的各种概念，名词讲解一遍，我会带着大家一起从零完整实现 redux 核心功能。

##### 状态管理器核心

1.创建一个状态 2.使用创建的状态 3.修改创建的状态

```javascript
let state = {
  name: "曲尘",
};
console.log(state.name);
state.name = "张三";
```

上面就是 redux 核心。很简单，接下来我来一步步进行扩展

##### 增加 发布-订阅模式

实现状态在被修改后，使用状态的地方收到通知

```javascript
let state = {
  name: "曲尘",
};
// 订阅者
let listeners = [];
// 订阅
function subscribe(listener) {
  listeners.push(listener);
}
// 修改
function dispatch(name) {
  state.name = name;
  // 当 name，要去通知所有的订阅者
  for (let i in listeners) {
    const listener = listeners[i];
    listener();
  }
}
// 来订阅一下，当name改变的时候，我要输出所有的新值
subscribe(() => {
  console.log(state.name);
});
// 来修改下 name,当然不能直接去改name，要通过dispatch来修改
dispatch("张三");
```

现在可以看到 name 被修改后，会输出修改的值
当然支持订阅同时也要支持退订，修改 subscribe 方法来实现

```javascript
function subscribe(listener) {
  listeners.push(listener);
  return function unsubscribe() {
    const index = listeners.indexOf(listener);
    listeners.splice(index, 1);
  };
}
// 订阅
let unsubscribe = subscribe(() => {
  console.log(state.name);
});
// 退订
unsubscribe();
```

状态应该是全局的，把上面的方法封装起来

```javascript
function createStore(initState) {
  // 状态
  let state = initState;
  // 订阅者
  let listeners = [];
  // 订阅
  function subscribe(listener) {
    listeners.push(listener);
    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }
  // 修改
  function dispatch(action) {
    state = action;
    for (let i in listeners) {
      const listener = listeners[i];
      listener();
    }
  }
  // 获取状态
  function getState() {
    return state;
  }
  return {
    subscribe,
    dispatch,
    getState,
  };
}
```

##### 增加 修改计划

上面代码，在修改状态时会有一个问题，我可以任意修改 name 值，改变类型，没有任何规则
redux 是通过 reducer 来实现有计划的修改

那我分两步实现

1. 添加一个 reducer 计划
2. dispatch 修改时按照计划修改

```javascript
// state当前的状态。action={type:'',name:''}
function reducer(state, action) {
  switch (action.type) {
    case "SET_NAME":
      return {
        ...state,
        name: action.name,
      };
    default:
      return state;
  }
}
// 接收修改的计划
function createStore(reducer, initState) {
  // 状态
  let state = initState;
  // 订阅者
  let listeners = [];
  // 订阅
  function subscribe(listener) {
    listeners.push(listener);
    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }
  // 修改
  function dispatch(action) {
    // 使用计划
    state = reducer(state, action);
    for (let i in listeners) {
      const listener = listeners[i];
      listener();
    }
  }
  // 获取状态
  function getState() {
    return state;
  }
  return {
    subscribe,
    dispatch,
    getState,
  };
}
```

使用下有计划的修改

```javascript
let initState = {
  name: "曲尘",
};
let store = createStore(reducer, initState);
store.subscribe(() => {
  let state = store.getState();
  console.log(state);
});
store.dispatch({
  type: "SET_NAME",
  name: "张三",
});
store.dispatch({
  name: "贾科斯",
});
```

现在 reducer 我是接收一个 state，在实际项目中会有很多 state，都放在同一个 reducer 是不合适的，会导致 reducer 函数及其庞大复杂。
redux 是这样做的，每个 state 都有自己对应的 reducer，拆分出来的 reducer，在通过 combineReducer 函数合并起来,我来尝试实现下

创建两个状态

```javascript
let initState = {
  info: {
    name: "曲尘",
  },
  wallet: {
    money: 100,
  },
};
```

他们各自的 reducer

```javascript
//state接收的是initState.info
function infoReducer(state, action) {
  switch (action.type) {
    case "SET_NAME":
      return {
        ...state,
        name: action.name,
      };
    default:
      return state;
  }
}
//state接收的是initState.wallet
function walletReducer(state, action) {
  switch (action.type) {
    case "ADD":
      return {
        ...state,
        money: state.money + 100,
      };
    default:
      return state;
  }
}
```

combineReducers 函数来把多个 reducer 函数合并成一个 reducer 函数。大概这样用

```javascript
let redcer = combineReducer({
  wallet: walletReducer,
  info: infoReducer,
});
function combineReducer(reducers) {
  //[wallet,info],把key取出来
  const reducersKey = Object.keys(reducers);
  return function (state = {}, action) {
    let newState = {};
    for (let i in reducersKey) {
      // 获取key
      let reducerKey = reducersKey[i];
      // 获取 key对应state
      let reducerState = state[reducerKey];
      // 获取对应 reducer
      let reducerFunction = reducers[reducerKey];
      newState[reducerKey] = reducerFunction(reducerState, action);
    }
    return newState;
  };
}
```

使用下，看看效果

```javascript
let initState = {
  info: {
    name: "曲尘",
  },
  wallet: {
    money: 100,
  },
};
let reducer = combineReducer({
  wallet: walletReducer,
  info: infoReducer,
});
let store = createStore(reducer, initState);
store.subscribe(() => {
  let state = store.getState();
  console.log(state);
});
store.dispatch({
  type: "SET_NAME",
  name: "张三",
});
store.dispatch({
  type: "ADD",
});
```

把 reducer 按组件拆分了，通过 combineReducers 合并了起来。但是还有个问题， state 还是写在一起的，这样会造成 state 树很庞大，不直观，很难维护。

简单修改下 infoReducer,提供一个初始值

```javascript
let initState = {
  name: "默认名字",
};
function infoReducer(state, action) {
  if (!state) {
    state = initState;
  }
  switch (action.type) {
    case "SET_NAME":
      return {
        ...state,
        name: action.name,
      };
    default:
      return state;
  }
}
```

再修改下 createStore 函数，允许 initState 为空，同时执行下 dispatch

```javascript
function createStore(reducer, initState = {}) {
  // 状态
  let state = initState;
  // 订阅者
  let listeners = [];
  // 订阅
  function subscribe(listener) {
    listeners.push(listener);
    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }
  // 修改
  function dispatch(action) {
    // 使用计划
    state = reducer(state, action);
    for (let i in listeners) {
      const listener = listeners[i];
      listener();
    }
  }
  // 获取状态
  function getState() {
    return state;
  }
  // 初始话state
  // type不会匹配任何action,每个子 reducer 都会进到 default 项，
  // 返回自己初始化的 state，这样就获得了初始化的 state
  dispatch({
    type: Symbol(),
  });
  return {
    subscribe,
    dispatch,
    getState,
  };
}
```

尝试下

```javascript
// 不传递 initState
let store = createStore(reducer);
// 打印初始化的值
console.log(store.getState());
```

最后再添加一个按需加载 reducer 的功能，reducer 也可以跟着组件在必要的时候再加载，然后用新的 reducer 替换老的 reducer。
修改 createStore 函数，添加 replaceReducer 方法

```javascript
function createStore(reducer,initState = {}) {
	...
	function replaceReducer(newReducer) {
		reducer = newReducer
		//刷新一遍 state 的值，新来的 reducer 把自己的默认状态放到state
		dispatch({ type: Symbol() })
	}
	return {
		subscribe,
		dispatch,
		getState,
		replaceReducer,
	}
}
```

##### 增加 中间件

根据官方的解释，Redux 中间件在发起一个 action 至 action 到达 reducer 的之间，提供了一个第三方的扩展。本质上通过插件的形式，将原本的 action->redux 的流程改变为 action->middleware1->middleware2-> … ->reducer，通过改变数据流，从而实现例如异步 Action、日志输入的功能。

按照 action->middleware1->reducer
可以先添加一个中间件 middleware，记录下修改前 state,修改的 action,修改后 state

```javascript
let store = createStore(reducer);
// 把最后需要执行的reducer保存下
let next = store.dispatch;
// 添加middleware，通过扩展store.dispatch 实现
store.dispatch = (action) => {
  console.log("修改前", store.getState());
  console.log("action", action);
  next(action);
  console.log("修改后", store.getState());
};
store.dispatch({
  type: "ADD",
});
```

按照 action->middleware1->middleware2->reducer
添加一个记录异常的功能

```javascript
store.dispatch = (action) => {
  try {
    console.log("修改前", store.getState());
    console.log("action", action);
    next(action);
    console.log("修改后", store.getState());
  } catch (err) {
    console.log(err);
  }
};
```

可以这样写，但是要有 20 个 middleware，维护起来很麻烦，按照经验，每个中间件都要拆分出来
按照 action->middleware1->middleware2->reducer,拆分中间件

1. logMiddleware

```javascript
let logMiddleware = (action) => {
  console.log("修改前", store.getState());
  console.log("action", action);
  next(action);
  console.log("修改后", store.getState());
};
```

2. execptionMiddleware

```javascript
let execptionMiddleware = (action) => {
  try {
    logMiddleware(action);
  } catch (err) {
    console.log(err);
  }
};
store.dispatch = execptionMiddleware;
```

现在我想把 execptionMiddleware 里面调用的中间件 logMiddleware 换掉，还需要修改代码，我需要改成动态的，随便那个都可以

```javascript
let execptionMiddleware = (next) => (action) => {
  try {
    //LogMiddleware(action)
    next(action);
  } catch (err) {
    console.log(err);
  }
};
```

同样的道理 logMiddleware 方法也修改下

```javascript
let logMiddleware = (next) => (action) => {
  console.log("修改前", store.getState());
  console.log("action", action);
  next(action);
  console.log("修改后", store.getState());
};
```

使用下

```javascript
let initState = {
  info: {
    name: "曲尘",
  },
  wallet: {
    money: 100,
  },
};
let reducer = combineReducer({
  wallet: walletReducer,
  info: infoReducer,
});
let next = store.dispatch;
store.dispatch = execptionMiddleware(logMiddleware(next));
```

按照 action->middleware1->middleware2->middleware3->reducer
添加打印时间的中间件

```javascript
let timeMiddleware = (next) => (action) => {
  console.log("时间" + new Date());
  next(action);
};
store.dispatch = execptionMiddleware(timeMiddleware(LogMiddleware(next)));
```

有没有注意到 logMiddleware 方法里面还有外部对象 store, 把 store 也作为一个参数传进去好了
修改后

```javascript
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
let logMiddleware = (store) => (next) => (action) => {
  console.log("修改前", store.getState());
  console.log("action", action);
  next(action);
  console.log("修改后", store.getState());
};
store.dispatch = execptionMiddleware(store)(
  timeMiddleware(store)(logMiddleware(store)(next))
);
```

已经完全实现中间件了，但是在使用方式上很不爽
redux 提供 applyMiddleware 方法,来让使用方式简单起来

实现 applyMiddleware

```javascript
function applyMiddleware(...middlewares) {
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
}
// 使用
let newCreateStore = applyMiddleware(
  execptionMiddleware,
  timeMiddleware,
  logMiddleware
)(createStore);
let store = newCreateStore(reducer, initState);
```

这样有两种 createStore 了,让两种使用方式一直，修改下 createStore

```javascript
let createStore = (reducer, initState, reStoreFunc) => {
//如果有 rewriteCreateStore，那就采用新的 createStore
if(reStoreFunc){
	let newCreateStore = reStoreFunc(createStore);
	return newCreateStore(reducer, initState);
}
//否则按照正常的流程走
...
}
let reStoreFunc = applyMiddleware(execptionMiddleware, timeMiddleware, logMiddleware);
let store = createStore(reducer, {}, reStoreFunc);
```

最后在添加一个 bindActionCreators 方法
他是做什么的？他通过闭包，把 dispatch 和 actionCreator 隐藏起来，让其他地方感知不到 redux 的存在。
bindActionCreators 的源码

```javascript
//核心的代码在这里，通过闭包隐藏了 actionCreator 和 dispatch
function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(this, arguments));
  };
}
// actionCreators 必须是 function 或者 object
export default function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === "function") {
    return bindActionCreator(actionCreators, dispatch);
  }
  if (typeof actionCreators !== "object" || actionCreators === null) {
    throw new Error();
  }
  const keys = Object.keys(actionCreators);
  const boundActionCreators = {};
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const actionCreator = actionCreators[key];
    if (typeof actionCreator === "function") {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }
  return boundActionCreators;
}
```

使用下

```javascript
function add() {
  return {
    type: "ADD",
  };
}
function setName(name) {
  return {
    type: "SET_NAME",
    name: name,
  };
}
const actions = bindActionCreators({ add, setName }, store.dispatch);
actions.add();
```

##### 完成，以上就是 redux 所有的功能了

##### 到了最后，我想把 redux 中关键的名词列出来，你每个都知道是干啥的吗？

## createStore

- 创建 store 对象，包含 getState, dispatch, subscribe, replaceReducer

## reducer

- reducer 是一个计划函数，接收旧的 state 和 action，生成新的 state

## action

- action 是一个对象，必须包含 type 字段

## dispatch

- dispatch( action ) 触发 action，生成新的 state

## subscribe

- 实现订阅功能，每次触发 dispatch 的时候，会执行订阅函数

## combineReducers

- 多 reducer 合并成一个 reducer

## replaceReducer

- 替换 reducer 函数

## middleware

- 扩展 dispatch 函数！

##### 你再看 redux 流程图，是不是大彻大悟了？

##### redux 流程图

![](https://parrot-youke.oss-cn-beijing.aliyuncs.com/liucheng.png)

##### 别急还有，如何在原生小程序中，使用 redux

我来仿照一下 react-redux 的 connect 的方式，在小程序中简单实现下

1. 要对小程序的四个生命周期做修改 onLoad，onShow，onHide，onUnload
2. 同时保留原有生命周期中的函数
3. 在 onLoad，onShow 添加订阅，更新/初始话小程序 data
4. onHide,onUnloadd 的时候取消订阅

```javascript
let _store = null;
let setStore = function (store) {
  _store = store;
};
let connect = function (mapStatetoPage) {
  return function (pageConfig) {
    let mapState = mapStatetoPage;
    // 区分onload onshow
    let ready = false;
    // 退订
    let unsubscribe = null;
    function sunscribe() {
      var mappedState = mapState(_store.getState());
      this.setData(mappedState);
    }

    function onLoad(options) {
      // 订阅
      unsubscribe = _store.subscribe(sunscribe.bind(this));
      // 初始话data
      sunscribe.call(this);
      ready = true;
      if (pageConfig.onLoad) {
        pageConfig.onLoad.call(this);
      }
    }

    function onShow() {
      if (!ready) {
        // 订阅
        unsubscribe = _store.subscribe(sunscribe.bind(this));
        // 初始话data
        sunscribe.call(this);
      }
      if (pageConfig.onShow) {
        pageConfig.onShow.call(this);
      }
    }

    function onHide() {
      ready = false;
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      if (pageConfig.onHide) {
        pageConfig.onHide.call(this);
      }
    }

    function onUnload() {
      ready = false;
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      if (pageConfig.onUnload) {
        pageConfig.onUnload.call(this);
      }
    }

    return _extends({}, pageConfig, {
      onLoad: onLoad,
      onUnload: onUnload,
      onShow: onShow,
      onHide: onHide,
    });
  };
};

function _extends() {
  _extends = Object.assign;
  return _extends.apply(this, arguments);
}
```
