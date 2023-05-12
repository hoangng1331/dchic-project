import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { message } from "antd";
import axios from "axios";
import { useAuthStore } from "../hooks/useAuthStore";
import { API_URL } from "../constants/URLS";
function ChangePass() {
  const { auth, login } = useAuthStore((state: any) => state);
  const [passWord, setpassWord] = useState<string>();
  const [newPassword, setNewPassword] = useState<string>();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    switch (event.target.name) {
      case "password":
        setpassWord(event.target.value);
        break;
      case "newPassword":
        setNewPassword(event.target.value);
        break; 

      default:
        break;
    }
  };

  const handelChange = (event: any) => {
    event.preventDefault();
    const data = {
      password: passWord,
    };
    if (passWord===newPassword){
        axios
      .patch(API_URL+"/customers/"+auth.loggedInUser._id, data)
      .then((res) => {
        const { username, password } = res.data;
        message.success("Thay đổi thông tin thành công");
        login({ username, password })
        setNewPassword("")
        setpassWord("")
      })
      .catch(() => {
        message.error("Vui lòng kiểm tra lại thông tin");
      });
    } else {
      message.error("Mật khẩu xác nhận không đúng")
    }
    
  };
  return (
    <div>
      <div className="wrapper rounded bg-white">
        <div className="h3">Đổi mật khẩu</div>

        <div className="form">
          <div className="row">
            <div className="col-md-6 mt-md-0 mt-3">
              <label>Mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                onChange={handleChange}
                value={passWord ? passWord : ""}
                name="password"
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mt-md-0 mt-3">
              <label>Nhập lại mật khẩu mới</label>
              <input 
              value={newPassword ? newPassword : ""}
              onChange={handleChange}
              type="password" className="form-control" name="newPassword" required />
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              className="btn btn-dark btn-lg btn-block mt-3"
              style={{ textAlign: "center" }}
              onClick={handelChange}
            >
              Lưu thông tin
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePass;
