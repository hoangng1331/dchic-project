import { useEffect, useState } from "react";
import { useAuthStore } from "../../../hooks/useAuthStore";
import { axiosClient } from "../../../libraries/axiosClient";
import { Form, Input, message, Select, Space, Button, Modal } from "antd";
import moment from "moment";
import { ReloadOutlined} from "@ant-design/icons";
export default function Account() {
  const [employeeLogin, setEmployeeLogin] = useState("");
  const { auth, logout } = useAuthStore((state) => state);
  const [employee, setEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [viewModal, setViewModal] = useState(false);
  const [newPassword, setNewPassword] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [userRole, setUserRole] = useState();

  const [updateForm] = Form.useForm();

  useEffect(
    (e) => {
      if (auth) {
        const refreshToken = window.localStorage.getItem("refreshToken");
        if (refreshToken) {
          axiosClient.post("/auth/refresh-token", {
            refreshToken: refreshToken,
          });
        }
      }
    },
    [auth, logout, refresh]
  );

  useEffect(() => {
    async function fetchData() {
      if (auth) {
        try {
          const response = await axiosClient.get(
            "/login/" + auth.loggedInUser._id
          );
          setEmployeeLogin(response.data.employeeId)
          setUserRole(response.data.role);
          setRefresh((f) => f + 1);
        } catch (error) {
          console.log(error);
        }
      }
      if (employeeLogin) {
        try {
          const response = await axiosClient.get("/employees/" + employeeLogin);
          setEmployee(response.data);
          setRefresh((f) => f + 1);
        } catch (error) {
          console.log(error);
        }
      } else if (userRole==="Admin"){
        try {
          const response = await axiosClient.get("/login/" + auth.loggedInUser._id);
          setEmployee(response.data);
          setRefresh((f) => f + 1);
        } catch (error) {
          console.log(error);
        }
      }
    }
    fetchData();
  }, [auth, employeeLogin, refresh]);

  useEffect(() => {
    updateForm.setFieldsValue({
      fullName: employee?.fullName,
      phoneNumber: employee?.phoneNumber,
      email: employee?.email,
      address: employee?.address,
      birthday: employee ? moment(employee.birthday).format("YYYY-MM-DD") : undefined,
      role: employee?.role,
      deliveryArea: employee?.deliveryArea,
      username: employee?.username,
    });
  }, [employee, updateForm]);

  const onValuesChange = (changedValues) => {
    setNewEmployee((prevEmployee) => ({
      ...prevEmployee,
      ...changedValues,
    }));
  };

  return (
    <div>
    {userRole === "Admin" ?(
      <Form
      form={updateForm}
      name="update-form"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      autoComplete="on"
      onValuesChange={onValuesChange}
    >
      <Form.Item label="Họ và tên" name="fullName" required hasFeedback>
        <Input readOnly/>
      </Form.Item>
      <Form.Item
          label="Vị trí công việc"
          name="role"
          rules={[{ required: true, message: "Chưa chọn vị trí công việc" }]}
          hasFeedback
        >
          <Select disabled placeholder="Chọn vị trí công việc">
            <Select.Option value="Chăm sóc khách hàng">
              Chăm sóc khách hàng
            </Select.Option>
            <Select.Option value="Giao hàng">Giao hàng</Select.Option>
            <Select.Option value="Quản lý">Quản lý</Select.Option>
          </Select>
        </Form.Item>
        {employee?.role === "Giao hàng" && (
          <Form.Item
            label="Khu vực giao hàng"
            name="deliveryArea"
            rules={[{ required: true, message: "Chưa chọn khu vực giao hàng" }]}
            hasFeedback
          >
            <Select disabled placeholder="Chọn khu vực giao hàng">
              <Select.Option value="Hòa Vang">Hòa Vang</Select.Option>
              <Select.Option value="Hải Châu">Hải Châu</Select.Option>
              <Select.Option value="Thanh Khê">Thanh Khê</Select.Option>
              <Select.Option value="Liên Chiểu">Liên Chiểu</Select.Option>
              <Select.Option value="Cẩm Lệ">Cẩm Lệ</Select.Option>
              <Select.Option value="Ngũ Hành Sơn">Ngũ Hành Sơn</Select.Option>
              <Select.Option value="Sơn Trà">Sơn Trà</Select.Option>
            </Select>
          </Form.Item>
        )}
      <Form.Item label="Tên đăng nhập" name="username" required>
        <Input readOnly />
      </Form.Item>
      <Form.Item label="Mật khẩu mới" name="password">
        <Input.Password onChange={(e)=> setNewPassword(e.target.value)}/>
      </Form.Item>
      <Form.Item label="Xác nhận mật khẩu mới" name="confirmPassword">
        <Input.Password onChange={(e)=> setConfirmPassword(e.target.value)}/>
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Space>
          <Button type="primary" onClick={()=>{
            setRefresh((f) => f + 1)
            if (newPassword || confirmPassword){
                if (newPassword === confirmPassword)
                {setViewModal(true)} else {message.error("Mật khẩu mới và mật khẩu xác nhận không trùng nhau!")}
               
            } else {setViewModal(true)}
          }}>
            Lưu
          </Button>
          <Button type="default" onClick={updateForm.resetFields}>
            Hủy
          </Button>
        </Space>
      </Form.Item>
    </Form>):( <Form
      form={updateForm}
      name="update-form"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      autoComplete="on"
      onValuesChange={onValuesChange}
    >
      <Form.Item label="Họ và tên" name="fullName" required hasFeedback>
        <Input readOnly/>
      </Form.Item>
      <Form.Item label="Số điện thoại" name="phoneNumber"  rules={[{ required: true, message: 'Hãy nhập số điện thoại!' },
          {
            pattern: /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/,
            message: 'Số điện thoại không hợp lệ!',
          }]}>
        <Input />
      </Form.Item>

      <Form.Item hasFeedback label="Thư điện tử" name="email" rules={[
              { required: true, message: "Chưa nhập Thư điện tử" },
              { type: "email", message: "Thư điện tử không hợp lệ" },
            ]}>
        <Input />
      </Form.Item>

      <Form.Item label="Địa chỉ" name="address" rules={[{ required: true, message: "Chưa nhập Địa chỉ" }]}>
        <Input />
      </Form.Item>

      <Form.Item label="Ngày sinh" name="birthday">
      <input
                type="date"
                className="form-control"
                name="birthday"
                required
              />
      </Form.Item>
      <Form.Item
          label="Vị trí công việc"
          name="role"
          rules={[{ required: true, message: "Chưa chọn vị trí công việc" }]}
          hasFeedback
        >
          <Select disabled placeholder="Chọn vị trí công việc">
            <Select.Option value="Chăm sóc khách hàng">
              Chăm sóc khách hàng
            </Select.Option>
            <Select.Option value="Giao hàng">Giao hàng</Select.Option>
            <Select.Option value="Quản lý">Quản lý</Select.Option>
          </Select>
        </Form.Item>
        {employee?.role === "Giao hàng" && (
          <Form.Item
            label="Khu vực giao hàng"
            name="deliveryArea"
            rules={[{ required: true, message: "Chưa chọn khu vực giao hàng" }]}
            hasFeedback
          >
            <Select disabled placeholder="Chọn khu vực giao hàng">
              <Select.Option value="Hòa Vang">Hòa Vang</Select.Option>
              <Select.Option value="Hải Châu">Hải Châu</Select.Option>
              <Select.Option value="Thanh Khê">Thanh Khê</Select.Option>
              <Select.Option value="Liên Chiểu">Liên Chiểu</Select.Option>
              <Select.Option value="Cẩm Lệ">Cẩm Lệ</Select.Option>
              <Select.Option value="Ngũ Hành Sơn">Ngũ Hành Sơn</Select.Option>
              <Select.Option value="Sơn Trà">Sơn Trà</Select.Option>
            </Select>
          </Form.Item>
        )}
      <Form.Item label="Tên đăng nhập" name="username" required>
        <Input readOnly />
      </Form.Item>
      <Form.Item label="Mật khẩu mới" name="password">
        <Input.Password onChange={(e)=> setNewPassword(e.target.value)}/>
      </Form.Item>
      <Form.Item label="Xác nhận mật khẩu mới" name="confirmPassword">
        <Input.Password onChange={(e)=> setConfirmPassword(e.target.value)}/>
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Space>
          <Button type="primary" onClick={()=>{
            setRefresh((f) => f + 1)
            if (newPassword || confirmPassword){
                if (newPassword === confirmPassword)
                {setViewModal(true)} else {message.error("Mật khẩu mới và mật khẩu xác nhận không trùng nhau!")}
               
            } else {setViewModal(true)}
          }}>
            Lưu
          </Button>
          <Button type="default" onClick={updateForm.resetFields}>
            Hủy
          </Button>
        </Space>
      </Form.Item>
    </Form>)}    
   
    <Modal
        centered
        open={viewModal}
        title="Xác nhận"
        onCancel={() => {
          setViewModal(false);
        }}
        okText="Lưu thông tin"
        cancelText="Đóng"
        onOk={async () => {
          if (userRole==="Admin"){
            await axiosClient.patch(
              `/login/${auth.loggedInUser._id}`,
              {
              password: newPassword,
              }
            )
            setRefresh((f) => f + 1)
            message.success("Cập nhật thông tin thành công");
            setRefresh((f) => f + 1)
            setPassword(null);
          setNewPassword(null);
          setConfirmPassword(null);
          setViewModal(false);
          window.location.reload();
          } else if (password === employee?.password) {
            try {
              await axiosClient.patch(
                `/employees/${employeeLogin}`,
                newEmployee
              ).then( async (response) => {
                await axiosClient.patch(
                    `/login/${auth.loggedInUser._id}`,
                    {
                    password: newPassword,
                    }
                  )
                setRefresh((f) => f + 1)
              });
              message.success("Cập nhật thông tin cá nhân thành công");
                setRefresh((f) => f + 1)
                setPassword(null);
              setNewPassword(null);
              setConfirmPassword(null);
              setViewModal(false);
              window.location.reload();
            } catch (error) {
              message.error("Cập nhật thông tin cá nhân thất bại");
            }
          } else {
            message.error("Mật khẩu không chính xác");
          }
        }}
      >
        {newPassword ? (
          <Form.Item label="Nhập mật khẩu cũ:">
            <Input.Password onChange={(e) => setPassword(e.target.value)} />
          </Form.Item>
        ) : (
          <Form.Item label="Nhập mật khẩu:">
            <Input.Password onChange={(e) => setPassword(e.target.value)} />
          </Form.Item>
        )}
      </Modal>
    </div>
  );
}
