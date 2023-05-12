import React from "react";
import { Form, DatePicker, Select, Button, Table } from "antd";
import moment from "moment";
import numeral from 'numeral';
import { axiosClient } from '../libraries/axiosClient';
import { useAuthStore } from "../hooks/useAuthStore";

const { RangePicker } = DatePicker;
const { Option } = Select;

const OrderList = () => {
  const { auth, logout } = useAuthStore((state) => state);
  const [refresh, setRefresh] = React.useState(0);

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
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [employeeName, setEmployeeName] = React.useState();
  const [shippers, setShippers] = React.useState();
  React.useEffect(() => {
    async function fetchEmployees() {
      try {
        const response = await axiosClient.get("/employees");
        const filteredEmployees = response.data.filter(
          (employee) => employee.role === "Giao hàng"
        );
        setShippers(filteredEmployees);
      } catch (error) {
        console.log(error);
      }
    }

    fetchEmployees();
  }, []);

  const onFinish = async (values) => {
    
    try {
      setRefresh((f) => f + 1);
      setLoading(true);
      const response = await axiosClient.post("/orders/status&date&shipper", {
          shipperId: values.shipperId,
          status: "Completed",
          shippedDateFrom: values.shippedDate[0].format("YYYY-MM-DD"),
          shippedDateTo: values.shippedDate[1].format("YYYY-MM-DD"),
        
      });
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Tên khách hàng",
      dataIndex: "customer",
      key: "customer",
      render: (text, record) => {
        return (
          <strong>
            {record.customer ? record.customer.fullName : record.customerName}
          </strong>
        );
      },
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      align: "center",
    },
    {
      title: "Ngày giao",
      dataIndex: "shippedDate",
      align: "center",
      key: "shippedDate",
      render: (text) => {
        return <span>{moment(text).format("DD/MM/yyyy")}</span>
      }
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      key: "status",
    },
    {
      title: "Khách hàng",
      dataIndex: "customerId",
      align: "center",
      key: "customerId",
      render: (text, record) => {
        return <p>{record.customerId ? "Thành viên" : "Vãng lai"}</p>;
      },
    },
    {
      title: "Người tạo đơn",
      dataIndex: "employee",
      align: "center",
      key: "employee",
      render: (text, record) => {
        axiosClient
          .get("/employees/" + record?.employeeLogin?.employeeId)
          .then((response) => {
            setEmployeeName(response.data.fullName);
          });
        return (
          <strong>
            {record?.employeeLogin?.fullName
              ? record.employeeLogin.fullName
              : employeeName}
          </strong>
        );
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalProductValue",
      align: "right",
      key: "totalProductValue",
      render: (text, record) => {
        return (
          <strong>{numeral(text + record.shippingFee).format("0,0$")}</strong>
        );
      },
    },
  ];

  return (
    <div>
      <Form onFinish={onFinish}>
        <Form.Item name="shippedDate" label="Thời gian giao hàng">
          <RangePicker />
        </Form.Item>
        <Form.Item name="shipperId" label="Nhân viên giao hàng">
          <Select showSearch optionFilterProp="children">
          {shippers?.map((shipper) => (
              <Option key={shipper._id} value={shipper._id}>
                {shipper.fullName}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Lọc đơn hàng
          </Button>
        </Form.Item>
      </Form>
      <Table dataSource={orders} columns={columns} />
    </div>
  );
};

export default OrderList;
