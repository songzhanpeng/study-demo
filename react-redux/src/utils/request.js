/*
 * @Author: your name
 * @Date: 2021-08-02 15:12:09
 * @LastEditTime: 2021-08-05 08:57:06
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-redux\src\utils\request.js
 */

function Fetch(url, options) {
  let init = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", //包含Cookie
  };

  // 合并请求
  Object.assign(init, options);

  //GET方法：查询字符附在url后面;

  if ((init.method == "GET" && options.data) || init.method == "HEAD") {
    let searchStr = "";
    if (options.data instanceof Object) {
      for (let i in options.data) {
        searchStr += i + "=" + options.data[i];
      }
    }
    url = url + "?" + searchStr;
  }

  return fetch(url, init).then((res) => {
    //   console.log(res);
    if (res.status === 200) {
      // console.log(res);
      return res.json();
    } else {
      console.log("错误信息" + res.msg);
    }
    return res.json();
  });
}

// 
export const getSwiper = () => {
  return Fetch("/api/commons/address/findByLetter", {});
};
