import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "../hooks/useAuthStore";
import moment from "moment";
import { API_URL } from "../constants/URLS";
function Information() {
  const dateRef = useRef<HTMLInputElement>(null);
  const { auth, login } = useAuthStore((state: any) => state);
  const [userName, setUserName] = useState<string>();
  const [passWord, setpassWord] = useState<string>();
  const [firstName, setFirstName] = useState<string>();
  const [lastName, setLastName] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [birthDay, setBirthDay] = useState<string>();
  const [phoneNumber, setPhoneNumber] = useState<string>();
  const [gender, setGender] = useState<string>();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    switch (event.target.name) {
      case "username":
        setUserName(event.target.value);
        break;
      case "password":
        setpassWord(event.target.value);
        break;
      case "firstName":
        setFirstName(event.target.value);
        break;
      case "lastName":
        setLastName(event.target.value);
        break;
      case "email":
        setEmail(event.target.value);
        break;
      case "birthday":
        setBirthDay(dateRef.current?.value);
        break;
      case "phoneNumber":
        setPhoneNumber(event.target.value);
        break;
      case "gender":
        setGender(event.target.value);
        break;

      default:
        break;
    }
  };

  const handelChange = (event: any) => {
    event.preventDefault();
    const data = {
      username: userName,
      password: passWord,
      gender: gender,
      firstName: firstName,
      lastName: lastName,
      email: email,
      birthday: birthDay,
      phoneNumber: phoneNumber,
    };
    axios
      .patch(API_URL+"/customers/"+auth.loggedInUser._id, data)
      .then((res) => {
        const { username, password } = res.data;
        message.success("Thay đổi thông tin thành công");
        login({ username, password })
      })
      .catch((error) => {
        message.error("Vui lòng kiểm tra lại thông tin");
      });
  };
  return (
    <div>
      <div className="wrapper rounded bg-white">
        <div className="h3">Thông tin tài khoản</div>

        <div className="form">
          <div className="row">
            <div className="col-md-6 mt-md-0 mt-3">
              <label>Họ</label>
              <input
                type="text"
                className="form-control"
                onChange={handleChange}
                name="lastName"
                defaultValue={auth.loggedInUser.lastName}
                required
              />
            </div>
            <div className="col-md-6 mt-md-0 mt-3">
              <label>Tên</label>
              <input
                type="text"
                className="form-control"
                onChange={handleChange}
                name="firstName"
                defaultValue={auth.loggedInUser.firstName}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mt-md-0 mt-3">
              <label>Ngày sinh</label>
              <input
                type="date"
                className="form-control"
                onChange={handleChange}
                ref={dateRef}
                name="birthday"
                defaultValue={moment(auth.loggedInUser.birthday).format(
                  "YYYY-MM-DD"
                )}
                required
              />
            </div>
            <div className="col-md-6 mt-md-0 mt-3">
              <label>Giới tính</label>
              <div className="d-flex align-items-center mt-2">
                <label className="option">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    onChange={handleChange}
                    defaultChecked={auth.loggedInUser.gender === "Male"??false}
                  />
                  Male
                  <span className="checkmark"></span>
                </label>
                <label className="option ms-4">
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    onChange={handleChange}
                    defaultChecked={auth.loggedInUser.gender === "Female"??false}
                  />
                  Female
                  <span className="checkmark"></span>
                </label>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mt-md-0 mt-3">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                onChange={handleChange}
                name="email"
                defaultValue={auth.loggedInUser.email}
                required
              />
            </div>
            <div className="col-md-6 mt-md-0 mt-3">
              <label>Phone Number</label>
              <input
                type="tel"
                className="form-control"
                onChange={handleChange}
                name="phoneNumber"
                defaultValue={auth.loggedInUser.phoneNumber}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mt-md-0 mt-3">
              <label>Tài khoản</label>
              <input
                readOnly
                type="text"
                className="form-control"
                onChange={handleChange}
                name="username"
                defaultValue={auth.loggedInUser.username}
                required
              />
            </div>
          </div>
          {/* <div className="row">
            <div className="col-md-6 mt-md-0 mt-3">
              <label>Mật khẩu</label>
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
              <label>Nhập lại mật khẩu</label>
              <input type="password" className="form-control" required />
            </div>
          </div> */}
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

export default Information;
