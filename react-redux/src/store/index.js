/*
 * @Author: your name
 * @Date: 2021-07-20 20:07:17
 * @LastEditTime: 2021-07-27 10:47:43
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-redux\src\store\index.js
 */
// 引入创建store 的方法
import { createStore, applyMiddleware, combineReducer } from "../redux";

// const initState = {
//   name: "宋站鹏",
//   age: 20,
//   sex: "男",
// };

function reducer(state, action) {
  // console.log(action);
  switch (action.type) {
    case "SET_NAME":
      return {
        ...state,
        name: action.name,
      };
    case "ADD_AGE":
      return {
        ...state,
        age: action.age,
      };
    default:
      return state;
  }
}

//  创建store
const store = createStore(reducer);

export default store;
