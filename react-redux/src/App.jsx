import React, { useRef, useEffect, useState } from "react";
import "./app.css";
import QRCode from "qrcode.react";
import html2canvas from "html2canvas";

function App() {
  const [imgUrl, setImgUrl] = useState("");
  const imageUrl = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      html2canvas(imageUrl.current, {
        useCORS: true,
        allowTaint: true,
      }).then((canvas) => {
        // // imgUrl 是图片的 base64格式 代码 png 格式
        let imgUrl = canvas.toDataURL("image/png");
        setImgUrl(imgUrl);
      });
    }, 1000);
  }, []);

  return (
    <div id="app">
      {/* 分享图 */}
      <div className="share" ref={imageUrl}>
        <img
          src="https://pic1.zhimg.com/v2-78232759d369f0b6c6296ee668b7fe5a_r.jpg"
          alt=""
          className="bg"
        />
        <div className="share_head">
          <img
            src="http://5b0988e595225.cdn.sohucs.com/images/20200507/611083a06f4b486186df0558bb7a5925.jpeg"
            alt=""
          />
        </div>
        {/* 描述 */}
        <div className="share_info">
          <h2>姓名:宋站鹏</h2>
          <h3>年龄:21</h3>
          <h3>婚配:无</h3>
          <p>这是一个平平无奇的人</p>
        </div>
        {/* 二维码 */}
        <QRCode className="share_qr" value=" http://47.103.71.80:10000" />
      </div>

      {/* 生成的图片 */}
      <img className="show_img" src={imgUrl} alt="" />
    </div>
  );
}

export default App;
