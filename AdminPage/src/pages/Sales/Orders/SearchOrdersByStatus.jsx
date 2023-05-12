import React from "react";
import {
  Table,
  Button,
  Form,
  message,
  Select,
  Descriptions,
  Divider,
  Switch,
  Drawer,
  Space
} from "antd";
import {
  DeliveryArea,
  OrderPayment,
  OrderStatus,
  PaymentStatus,
} from "../../../meta/OrderStatus";
import { axiosClient } from "../../../libraries/axiosClient";
import numeral from "numeral";
import { useAuthStore } from "../../../hooks/useAuthStore";
import { EyeOutlined } from "@ant-design/icons";
const { Option } = Select;
export default function SearchOrdersByStatus() {
  const [selectedOrderView, setSelectedOrderView] = React.useState(null);
  const [orderDetail, setOrderDetail] = React.useState([]);
  const [verifierName, setVerifierName] = React.useState();
  const [isMultipleSelect, setIsMultipleSelect] = React.useState(false);

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

  const productColumnsView = [
    {
      title: "Sản phẩm",
      dataIndex: "productId",
      key: "productId",
      align: "left",
      width: "auto",
      render: (text, record) => {
        const product = products.find((p) => p._id === text);
        return product ? product.name : "";
      },
    },
    {
      title: "Màu sắc",
      dataIndex: "colorId",
      key: "colorId",
      width: "auto",
      align: "center",
      render: (text, record, index) => {
        const product = products.find(
          (product) => product._id === record.productId
        );
        const color = product?.color.find((color) => color._id === text);
        const hexcode = product?.color.find(
          (color) => color._id === record.colorId
        )?.hexcode[0].hex;
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                backgroundColor: hexcode,
                display: "inline-block",
                width: "20px",
                height: "20px",
              }}
            ></span>
            <span style={{ marginLeft: "8px" }}>{color?.name || ""}</span>
          </div>
        );
      },
    },
    {
      title: "Kích cỡ",
      dataIndex: "sizeId",
      key: "sizeId",
      width: "auto",
      align: "center",
      render: (text, record, index) => {
        const product = products.find(
          (product) => product._id === record.productId
        );
        const variant = product?.variants.findIndex(
          (variant) => variant.colorId === record.colorId
        );
        const size = product.size[variant]?.find((s) => s._id === text)?.size;
        return size || "";
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: "10%",
      align: "right",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (text, record) => {
        return <p>{numeral(text).format("0,0$")}</p>;
      },
    },
    {
      title: "Giảm giá",
      dataIndex: "discount",
      key: "discount",
      align: "center",
    },
    {
      title: "Tổng giá",
      dataIndex: "totalPrice",
      align: "right",
      key: "totalPrice",
      render: (text, record) => {
        return <strong>{numeral(text).format("0,0$")}</strong>;
      },
    },
  ];
  const columns = [
    {
      title: "Tên người nhận",
      dataIndex: "customer",
      key: "customer",
      render: (text, record) => {
        return (
          <strong>
            {record.receiverName}
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
      title: "Hình thức thanh toán",
      dataIndex: "paymentType",
      align: "center",
      key: "paymentType",
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
              : employeeName ? employeeName: record.customer.fullName }
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
    {
      title: "",
      key: "actions",
      render: (text, record) => {
        return (
          <Space>
             <Button
            onClick={() => {
              setRefresh((f) => f + 1)
              setSelectedOrderView(record);
              axiosClient
                .get("/employees/" + record?.verifier?.employeeId)
                .then((response) => {
                  setVerifierName(response.data.fullName);
                });
            }}
            icon={<EyeOutlined />}
          />
            {record.paymentStatus === "Hủy và chưa hoàn tiền" &&
              record.status === "Canceled" &&
              auth.loggedInUser.role === "Admin" && (
                <Button
                  onClick={() => {
                    axiosClient
                      .patch("/orders/" + record._id, {
                        paymentStatus: "Hủy và đã hoàn tiền",
                      })
                      .then((response) => {
                        message.success("Đã hoàn tiền cho khách hàng!");
                        setRefresh((f) => f + 1);
                      });
                  }}
                >
                  Hoàn tiền
                </Button>
              )}
          </Space>
         
        );
      },
    },
  ];
  const [loading, setLoading] = React.useState(false);
  const [orders, setOrders] = React.useState([]);
  const [searchForm] = Form.useForm();
  const [products, setProducts] = React.useState([]);
  const [employeeName, setEmployeeName] = React.useState();
  React.useEffect(() => {
    axiosClient
      .get(`/orders/${selectedOrderView?._id}/orderDetails`)
      .then((response) => {
        setOrderDetail(response.data);
      });
    axiosClient.get("/products").then((response) => {
      setProducts(response.data);
    });
  }, [selectedOrderView]);

  const onFinish = (values) => {
    setLoading(true);
    axiosClient
      .post("/orders/status", values)
      .then((response) => {
        // console.log(response.data);
        setOrders(response.data);
        setLoading(false);
      })
      .catch((err) => {
        message.error("Lỗi!");
        setLoading(false);
      });
  };

  const onFinishFailed = (errors) => {
    console.log("🐣", errors);
  };

  return (
    <div>
      <Form
        form={searchForm}
        name="search-form"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="on"
      >
        <Switch checked={isMultipleSelect} onChange={() => setIsMultipleSelect(!isMultipleSelect)}
        checkedChildren="Chọn nhiều"
        unCheckedChildren="Chọn một" />
        <Form.Item
          label="Trạng thái đơn hàng"
          name="status"
          rules={[
            {
              required: isMultipleSelect,
              message: "Phải có ít nhất 1 lựa chọn, chọn nhiều không hỗ trợ lựa chọn tất cả",
            },
          ]}
        >
          <Select
            showSearch
            mode={isMultipleSelect ? "multiple" : undefined}
            optionFilterProp="children"
            placeholder="Chọn trạng thái đơn hàng"
          >
            {isMultipleSelect ? (
              <>
            {OrderStatus.filter(status => status.value !== "").map((status) => (
              <Option key={status.value} value={status.value}>
                {status.label}
              </Option>
            ))}
            </>):(
              <>{OrderStatus.map((status) => (
              <Option key={status.value} value={status.value}>
                {status.label}
              </Option>
            ))}
            </>)}
          </Select>
        </Form.Item>
        <Form.Item
          label="Phương thức thanh toán"
          name="paymentType"
          rules={[
            {
              required: isMultipleSelect,
              message: "Phải có ít nhất 1 lựa chọn, chọn nhiều không hỗ trợ lựa chọn tất cả",
            },
          ]}
        >
          <Select
            showSearch
            optionFilterProp="children"
            placeholder="Chọn phương thức thanh toán"
            mode={isMultipleSelect ? "multiple" : undefined}
          >
           {isMultipleSelect ? (
              <>
            {OrderPayment.filter(payment => payment.value !== "").map((payment) => (
              <Option key={payment.value} value={payment.value}>
                {payment.label}
              </Option>
            ))}
            </>):(
              <>{OrderPayment.map((payment) => (
              <Option key={payment.value} value={payment.value}>
                {payment.label}
              </Option>
            ))}
            </>)}
          </Select>
        </Form.Item>
        <Form.Item
          label="Trạng thái thanh toán"
          name="paymentStatus"
          rules={[
            {
              required: isMultipleSelect,
              message: "Phải có ít nhất 1 lựa chọn, chọn nhiều không hỗ trợ lựa chọn tất cả",
            },
          ]}
        >
          <Select
            showSearch
            optionFilterProp="children"
            placeholder="Chọn trạng thái thanh toán"
            mode={isMultipleSelect ? "multiple" : undefined}
          >
            {isMultipleSelect ? (
              <>
            {PaymentStatus.filter(paymentStatus => paymentStatus.value !== "").map((paymentStatus) => (
              <Option key={paymentStatus.value} value={paymentStatus.value}>
                {paymentStatus.label}
              </Option>
            ))}
            </>):(
              <>{PaymentStatus.map((paymentStatus) => (
              <Option key={paymentStatus.value} value={paymentStatus.value}>
                {paymentStatus.label}
              </Option>
            ))}
            </>)}
          </Select>
        </Form.Item>
        <Form.Item
          label="Khu vực giao hàng"
          name="deliveryArea"
          rules={[
            {
              required: isMultipleSelect,
              message: "Phải có ít nhất 1 lựa chọn, chọn nhiều không hỗ trợ lựa chọn tất cả",
            },
          ]}
        >
          <Select
            showSearch
            optionFilterProp="children"
            placeholder="Chọn khu vực giao hàng"
            mode={isMultipleSelect ? "multiple" : undefined}
          >
            {isMultipleSelect ? (
              <>
            {DeliveryArea.filter(area => area.value !== "").map((area) => (
              <Option key={area.value} value={area.value}>
                {area.label}
              </Option>
            ))}
            </>):(
              <>{DeliveryArea.map((area) => (
              <Option key={area.value} value={area.value}>
                {area.label}
              </Option>
            ))}
            </>)}
          </Select>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            {loading ? "Đang xử lý ..." : "Lọc thông tin"}
          </Button>
        </Form.Item>
      </Form>
      <Table rowKey="_id" dataSource={orders} columns={columns} />
      <Drawer
         placement="bottom"
         height={"90%"}
         title="Chi tiết đơn hàng"
         open={selectedOrderView}
         onClose={() => {
           setRefresh((f) => f + 1)
           setSelectedOrderView(null);
         }}
      >
        {selectedOrderView && (
          <div>
            <Descriptions
              bordered
              column={2}
              labelStyle={{ fontWeight: "700" }}
            >
              <Descriptions.Item label="Trạng thái">
                {selectedOrderView.status}
              </Descriptions.Item>
              <Descriptions.Item label="Người nhận">
                {selectedOrderView.receiverName}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng">
                {selectedOrderView.address}
              </Descriptions.Item>
              <Descriptions.Item label="Khu vực giao hàng">
                {selectedOrderView.deliveryArea}
              </Descriptions.Item>
              {selectedOrderView.shippingFee === 0 ? (
                <Descriptions.Item label="Nhân viên giao hàng">
                  {selectedOrderView.shipper.fullName}
                </Descriptions.Item>
              ) : (
                <Descriptions.Item label="Phí vận chuyển">
                  {numeral(selectedOrderView.shippingFee).format("0,0$")}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Trạng thái thanh toán">
                {selectedOrderView.paymentStatus}
              </Descriptions.Item>
              {selectedOrderView.note ? (
                <Descriptions.Item label="Ghi chú">
                  {selectedOrderView.note}
                </Descriptions.Item>
              ) : (
                <></>
              )}
              <Descriptions.Item label="Người xác nhận đơn">
                {selectedOrderView.verifier.fullName ?? verifierName}
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <Table
              rowKey="_id"
              dataSource={orderDetail}
              columns={productColumnsView}
              scroll={{
                y: 300,
              }}
              summary={(pageData) => {
                let totalQuantity = 0;
                let totalValue = 0;
                pageData.forEach(({ quantity, totalPrice }) => {
                  totalQuantity += quantity;
                  totalValue += totalPrice;
                });
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row align="right">
                      <Table.Summary.Cell index={0}></Table.Summary.Cell>
                      <Table.Summary.Cell index={1}></Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>
                        <strong>Tổng sản phẩm:</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3}>
                        <strong>{totalQuantity}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}></Table.Summary.Cell>
                      <Table.Summary.Cell index={5}>
                        <strong>Tổng giá trị:</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6}>
                        <strong>{numeral(totalValue).format("0,0$")}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7}></Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
              pagination={false}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
