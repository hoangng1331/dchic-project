import React from "react";
import {
  Table,
  Button,
  Card,
  Modal,
  Descriptions,
  Divider,
  Form,
  Space,
  message,
  Popconfirm,
  Select,
} from "antd";
import { axiosClient } from "../../../libraries/axiosClient";
import numeral from "numeral";
import {
  DeleteOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../../../hooks/useAuthStore";
import { OrderStatus } from "../../../meta/OrderStatus";
const { Option } = Select;
export default function SuburbanOrders() {
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [selectedOrderView, setSelectedOrderView] = React.useState(null);
  const [delectedOrder, setDelectedOrder] = React.useState(null);
  const [employeeName, setEmployeeName] = React.useState();
  const [verifierName, setVerifierName] = React.useState();
  const [maxQuantity, setMaxQuantity] = React.useState(0);
  const [selectEditRecord, setSelectEditRecord] = React.useState(null);
  const [sizeID, setSizeID] = React.useState([]);
  const [refresh, setRefresh] = React.useState(0);
  const [orderDetail, setOrderDetail] = React.useState([]);
  const [orders, setOrders] = React.useState([]);
  const [employees, setEmployees] = React.useState([]);
  const { auth, logout } = useAuthStore((state) => state);
  const [employeeLoginId, setEmployeeLoginId] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [searchForm] = Form.useForm();

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

  React.useEffect(
    (e) => {
      if (auth) {
        axiosClient
          .get("/login/" + auth?.loggedInUser?._id)
          .then((response) => {
            setEmployeeLoginId(response.data._id);
          });
      }
    },
    [refresh, auth, status]
  );
  // Products
  const [products, setProducts] = React.useState([]);
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
  // Orders
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
        const isDisabled =
          record.status === "Confirmed" ||
          record.status === "Shipping" ||
          record.status === "Canceled" ||
          record.status === "Completed";
        const isChanged =
          record.status === "Confirmed" || record.status === "Shipping";
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
                setRefresh((f) => f + 1);
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
            {record.status === "Canceled" ? (
              <Popconfirm
                disabled={record.importStatus === "Đã nhập kho"}
                style={{ width: 800 }}
                title="Hàng của đơn bị hủy đã được nhập kho?"
                onConfirm={() => {
                  setRefresh((f) => f + 1)
                  setDelectedOrder(record);
                  const id = record._id;
                  delectedOrder.orderDetails.forEach(async (orderDetail) => {
                    const remainQuantity = await axiosClient.get(
                      `/products/${orderDetail.productId}/variants/${orderDetail.colorId}/sizes/${orderDetail.sizeId}/order`
                    );
                    axiosClient.patch(
                      `/products/${orderDetail.productId}/variants/${orderDetail.colorId}/sizes/${orderDetail.sizeId}/order`,
                      {
                        quantity:
                          remainQuantity.data.quantity + orderDetail.quantity,
                      }
                    );
                    setRefresh((f) => f + 1);
                  });
                  axiosClient
                    .patch("/orders/" + id, { importStatus: "Đã nhập kho" })
                    .then((response) => {
                      message.success("Nhập kho thành công!");
                      setRefresh((f) => f + 1);
                    })
                    .catch((err) => {
                      message.error("Lỗi!");
                    });
                }}
                onCancel={() => {setRefresh((f) => f + 1)}}
                okText="Đồng ý"
                cancelText="Đóng"
              >
                <Button
                  disabled={record.importStatus === "Đã nhập kho"}
                  type="primary"
                  onClick={() => {
                    setDelectedOrder(record);
                    setRefresh((f) => f + 1);
                  }}
                >
                  Nhập kho
                </Button>
              </Popconfirm>
            ) : (
              <>
                {record.status === "Confirmed" || record.status === "Shipping" ? (
                  <>
                    {record.status === "Shipping" ? (
                      <Button
                        type="primary"
                        ghost
                        onClick={async (values) => {
                          setRefresh((f) => f + 1)
                          await axiosClient
                            .patch("/orders/" + record._id, {
                              status: "Completed",
                              shippedDate: new Date(),
                              paymentStatus: "Đã thanh toán"
                            })
                            .then((response) => {
                              message.success("Xác nhận đã giao thành công!");
                              setRefresh((f) => f + 1);
                            });
                        }}
                      >
                        Hoàn thành
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        ghost
                        onClick={async (values) => {
                          setRefresh((f) => f + 1)
                          await axiosClient
                            .patch("/orders/" + record._id, {
                              status: "Shipping",
                            })
                            .then((response) => {
                              message.success("Đã lấy hàng!");
                              setRefresh((f) => f + 1);
                            });
                        }}
                        disabled={record.status !== "Confirmed"}
                      >
                        Gửi hàng đi
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    type="primary"
                    ghost
                    onClick={async (values) => {
                      setRefresh((f) => f + 1)
                      if (record.shippingFee === 0 && !record.shipperId) {
                        message.error(
                          "Hãy chọn shipper trước khi xác nhận đơn hàng!"
                        );
                      } else {
                        await axiosClient
                          .patch("/orders/" + record._id, {
                            status: "Confirmed",
                            verifyId: employeeLoginId,
                          })
                          .then((response) => {
                            message.success("Đơn hàng đã được xác nhận!");
                            setRefresh((f) => f + 1);
                          });
                      }
                    }}
                    icon={<CheckOutlined />}
                    disabled={isDisabled}
                  />
                )}
                {isChanged ? (
                   <Popconfirm
                   style={{ width: 800 }}
                   title="Are you sure to cancel?"
                   onConfirm={() => {
                     setRefresh((f) => f + 1)
                     setDelectedOrder(record);
                     // Cancel
                     const id = record._id;
                     if (record.paymentStatus==="Đã thanh toán") {
                       axiosClient
                       .patch("/orders/" + id, { status: "Canceled", paymentStatus: "Hủy và chưa hoàn tiền", importStatus: "Chờ nhập kho" })
                       .then((response) => {
                         message.success("Đơn hàng đã bị hủy!");
                         setRefresh((f) => f + 1);
                       })
                       .catch((err) => {
                         message.error("Hủy bị lỗi!");
                       });
                     } else {
                       axiosClient
                       .patch("/orders/" + id, { status: "Canceled", paymentStatus: "Hủy", importStatus: "Chờ nhập kho" })
                       .then((response) => {
                         message.success("Đơn hàng đã bị hủy!");
                         setRefresh((f) => f + 1);
                       })
                       .catch((err) => {
                         message.error("Hủy bị lỗi!");
                       });
                     }                    
                    }}
                   onCancel={() => {setRefresh((f) => f + 1)}}
                   okText="Đồng ý"
                   cancelText="Đóng"
                 >
                   <Button
                     danger
                     type="dashed"
                     onClick={() => {
                       setDelectedOrder(record);
                       setRefresh((f) => f + 1);
                     }}
                     icon={<CloseOutlined />}
                   />
                 </Popconfirm>
                ) : (
                  <Popconfirm
                    disabled={isDisabled}
                    style={{ width: 800 }}
                    title="Are you sure to delete?"
                    onConfirm={() => {
                      setRefresh((f) => f + 1)
                      setDelectedOrder(record);
                      // DELETE
                      const id = record._id;
                      delectedOrder.orderDetails.forEach(
                        async (orderDetail) => {
                          const remainQuantity = await axiosClient.get(
                            `/products/${orderDetail.productId}/variants/${orderDetail.colorId}/sizes/${orderDetail.sizeId}/order`
                          );
                          axiosClient.patch(
                            `/products/${orderDetail.productId}/variants/${orderDetail.colorId}/sizes/${orderDetail.sizeId}/order`,
                            {
                              quantity:
                                remainQuantity.data.quantity +
                                orderDetail.quantity,
                            }
                          );
                          setRefresh((f) => f + 1);
                        }
                      );
                      axiosClient
                        .delete("/orders/" + id)
                        .then((response) => {
                          message.success("Xóa thành công!");
                          setRefresh((f) => f + 1);
                        })
                        .catch((err) => {
                          message.error("Xóa bị lỗi!");
                        });
                      console.log("DELETE", record);
                    }}
                    onCancel={() => {setRefresh((f) => f + 1)}}
                    okText="Đồng ý"
                    cancelText="Đóng"
                  >
                    <Button
                      danger
                      type="dashed"
                      onClick={() => {
                        setDelectedOrder(record);
                        setRefresh((f) => f + 1);
                      }}
                      icon={<DeleteOutlined />}
                      disabled={isDisabled}
                    />
                  </Popconfirm>
                )}{" "}
              </>
            )}
          </Space>
        );
      },
    },
  ];
  React.useEffect(() => {
    axiosClient
      .post("/orders/status", { shippingFee: "40000", status: status })
      .then((response) => {
        setOrders(response.data);
      });
    axiosClient
      .get(`/orders/${selectedOrderView?._id}/orderDetails`)
      .then((response) => {
        setOrderDetail(response.data);
      });
    axiosClient.get("/products").then((response) => {
      setProducts(response.data);
    });
    axiosClient
      .get(
        `/products/${selectEditRecord?.productId}/variants/${selectEditRecord?.colorId}/sizes/${selectEditRecord?.sizeId}/order`
      )
      .then((response) => {
        setMaxQuantity(response.data.quantity);
      });
    async function fetchEmployees() {
      try {
        const response = await axiosClient.get("/employees");
        const filteredEmployees = response.data.filter(
          (employee) => employee.role === "Giao hàng"
        );
        setEmployees(filteredEmployees);
      } catch (error) {
        console.log(error);
      }
    }

    fetchEmployees();
  }, [refresh, auth, status]);

  return (
    <div>
      <Form.Item label="Trạng thái đơn hàng" name="status">
        <Select
          defaultValue={""}
          options={OrderStatus}
          onChange={(value) => {
            setRefresh((f) => f + 1)
            setStatus(value);
          }}
        />
      </Form.Item>
      <Table rowKey="_id" dataSource={orders} columns={columns} />
      <Modal
        centered
        width={"90%"}
        title="Chi tiết đơn hàng"
        open={selectedOrderView}
        onOk={() => setSelectedOrderView(null)}
        onCancel={() => {
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
      </Modal>
    </div>
  );
}
