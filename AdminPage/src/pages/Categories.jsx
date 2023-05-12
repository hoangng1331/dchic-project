import { Button, Input, Form, Table, Modal, Space  } from 'antd';
import React from 'react';
import { Navigate } from 'react-router-dom';
import { axiosClient } from '../libraries/axiosClient';
import { useAuthStore } from "../hooks/useAuthStore";
export default function Categories() {
  const [refresh, setRefresh] = React.useState(0)
  const [products, setProducts] = React.useState([]);
  const [changeModal, setChangeModal] = React.useState(false);
  const [saveChange, setSaveChange] = React.useState(null);
  const { auth, logout } = useAuthStore((state) => state);

  React.useEffect(
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
  const columns = [
    {
      title: 'STT', 
      width: '1%',
      render: (text, record, index) => {
        return (
          <div style = {{textAlign: 'right'}}>
            <span>{index+1}</span>
          </div>
        )
      },
      key: 'number',
    },
    {
      title: 'Danh mục',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Tùy chọn',
      key: 'action',
      render: (text, record, index)=>{
          return (<Space>
            <Button onClick={() => {
              setRefresh((f)=> f + 1)
              changeData(record)}}>Sửa</Button>              
            </Space>)
      }
    },  
  ]
    React.useEffect(() => {
        axiosClient.get('/categories').then((response)=>
        setProducts(response.data));
    }, [refresh]);
    const onFinish = (values) => {
      console.log('Success:', values);
      axiosClient.post('/categories', values).then((response)=>{
        
      setRefresh((f)=> f + 1)
      createForm.resetFields();
      console.log(response.data)
      })
    };
    const onChange = (values) => {
      console.log('Success:', values);
      axiosClient.patch('/categories/'+saveChange._id, values).then((response)=>{
      setRefresh((f)=> f + 1)
      updateForm.resetFields();
      setChangeModal(false)
      console.log(response.data)
      })
    };
    const [createForm] = Form.useForm();
    const [updateForm] = Form.useForm();
    const onFinishFailed = (errorInfo) => {
      console.log('Failed:', errorInfo);
    };
    const changeData =(data)=>{
      setChangeModal(true);
      setSaveChange(data)
      updateForm.setFieldsValue(data)
    }
    return <div>
        <Form
    form={createForm}
    name="Create-product"
    labelCol={{ span: 8 }}
    wrapperCol={{ span: 16 }}
    style={{ maxWidth: 600 }}
    onFinish={onFinish}
    onFinishFailed={onFinishFailed}
    autoComplete="off"
    >
      <Form.Item
      label="Danh mục"
      name="name"
      rules={[{ required: true, message: 'Vui lòng nhập tên danh mục sản phẩm!' }]}
    >
      <Input />
    </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
      <Button type="primary" htmlType="submit">
        Thêm
      </Button>
    </Form.Item>
      </Form>
       <Table rowKey='_id' dataSource={products} columns = {columns} pagination={false}/>
       <Modal open={changeModal}
       title='Cập nhật thông tin sản phẩm'
       onCancel={()=> setChangeModal(false)}
       cancelText='Hủy bỏ'
       okText='Cập nhật'
       onOk={()=>{
        updateForm.submit();
       }}>
       <Form
    form={updateForm}
    name="Update-product"
    labelCol={{ span: 8 }}
    wrapperCol={{ span: 16 }}
    style={{ maxWidth: 600 }}
    onFinish={onChange}
    onFinishFailed={onFinishFailed}
    autoComplete="off"
    >
       <Form.Item
      label="Loại sản phẩm"
      name="name"
      rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
    >
      <Input />
    </Form.Item>
      </Form>
         </Modal>
    </div>
}
