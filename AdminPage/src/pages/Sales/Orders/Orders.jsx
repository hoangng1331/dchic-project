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
  InputNumber,
  Input,
  Checkbox,
  Drawer,
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
const { Option } = Select;
export default function Orders() {
  const [addProductsModalVisible, setAddProductsModalVisible] =
    React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [selectedOrderView, setSelectedOrderView] = React.useState(null);
  const [delectedOrder, setDelectedOrder] = React.useState(null);
  const [employeeName, setEmployeeName] = React.useState();
  const [verifierName, setVerifierName] = React.useState();
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [selectedColor, setSelectedColor] = React.useState(null);
  const [selectedSize, setSelectedSize] = React.useState(null);
  const [appeared, setAppeared] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);
  const [maxQuantity, setMaxQuantity] = React.useState(0);
  const [index2, setIndex2] = React.useState(0);
  const [selectEditRecord, setSelectEditRecord] = React.useState(null);
  const [sizeID, setSizeID] = React.useState([]);
  const [refresh, setRefresh] = React.useState(0);
  const [orderDetail, setOrderDetail] = React.useState([]);
  const [orders, setOrders] = React.useState([]);
  const [employees, setEmployees] = React.useState([]);
  const { auth, logout } = useAuthStore((state) => state);
  const [payStatus, setPayStatus] = React.useState("");
  const [employeeLoginId, setEmployeeLoginId] = React.useState("");

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
    [refresh]
  );
  // Products
  const [products, setProducts] = React.useState([]);
  const productColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "productId",
      key: "productId",
      align: "left",
      width: "15%",
      render: (text, record) => {
        const product = products.find((p) => p._id === text);
        return product ? product.name : "";
      },
    },
    {
      title: "Màu sắc",
      dataIndex: "colorId",
      key: "colorId",
      width: "15%",
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
      width: "12%",
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
      width: "15%",
      align: "right",
      key: "totalPrice",
      render: (text, record) => {
        return <strong>{numeral(text).format("0,0$")}</strong>;
      },
    },
    {
      width: "5%",
      key: "action",
      render: (_, record, index) => {
        return (
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={async () => {
                setRefresh((f) => f + 1);
                setSelectEditRecord(record);
                axiosClient
                  .get(
                    `/products/${selectEditRecord?.productId}/variants/${selectEditRecord?.colorId}/sizes/${selectEditRecord?.sizeId}/order`
                  )
                  .then((response) => {
                    setMaxQuantity(response.data);
                    setRefresh((f) => f + 1);
                  });
                updateForm.setFieldsValue(record);
                setRefresh((f) => f + 1);
              }}
            />
            <Button
              onClick={async () => {
                setRefresh((f) => f + 1);
                const remainQuantity = await axiosClient.get(
                  `/products/${record.productId}/variants/${record.colorId}/sizes/${record.sizeId}/order`
                );
                axiosClient.patch(
                  `/products/${record.productId}/variants/${record.colorId}/sizes/${record.sizeId}/order`,
                  {
                    quantity: remainQuantity.data.quantity + record.quantity,
                  }
                );
                setRefresh((f) => f + 1);
                await axiosClient
                  .delete(
                    `/orders/${selectedOrder._id}/orderDetails/${record._id}`
                  )
                  .then((response) => {
                    message.success("Cập nhật thành công!");
                    setRefresh((f) => f + 1);
                  });

                setAddProductsModalVisible(false);
              }}
              icon={<DeleteOutlined />}
            />
          </Space>
        );
      },
    },
  ];
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
      title: "Tên khách hàng",
      dataIndex: "customer",
      key: "customer",
      render: (text, record) => {
        return <strong>{record.receiverName}</strong>;
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
            {isDisabled ? (
              <Button
                onClick={() => {
                  setRefresh((f) => f + 1);
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
            ) : (
              <Button
                onClick={() => {
                  setSelectedOrder(record);
                  setRefresh((f) => f + 1);
                }}
                icon={<EditOutlined />}
                disabled={isDisabled}
              />
            )}
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
            {record.paymentStatus === "Chưa thanh toán" &&
              record.status === "Completed" && (
                <Button
                  onClick={() => {
                    axiosClient
                      .patch("/orders/" + record._id, {
                        paymentStatus: "Đã thanh toán",
                        receiveMoneyConfirmId: employeeLoginId,
                      })
                      .then((response) => {
                        message.success("Đã hoàn tiền cho khách hàng!");
                        setRefresh((f) => f + 1);
                      });
                  }}
                >
                  Đã nhận tiền
                </Button>
              )}
            {record.status === "Canceled" ? (
              <Popconfirm
                disabled={record.importStatus === "Đã nhập kho"}
                style={{ width: 800 }}
                title="Hàng của đơn bị hủy đã được nhập kho?"
                onConfirm={() => {
                  setRefresh((f) => f + 1);
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
                onCancel={() => {
                  setRefresh((f) => f + 1);
                }}
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
                <Button
                  type="primary"
                  ghost
                  onClick={async (values) => {
                    setRefresh((f) => f + 1);
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
                {isChanged | record.customerId ? (
                  <Popconfirm
                    style={{ width: 800 }}
                    title="Are you sure to cancel?"
                    onConfirm={() => {
                      setRefresh((f) => f + 1);
                      setDelectedOrder(record);
                      // Cancel
                      const id = record._id;
                      if (record.paymentStatus === "Đã thanh toán") {
                        axiosClient
                          .patch("/orders/" + id, {
                            status: "Canceled",
                            paymentStatus: "Hủy và chưa hoàn tiền",
                            importStatus: "Chờ nhập kho",
                          })
                          .then((response) => {
                            message.success("Đơn hàng đã bị hủy!");
                            setRefresh((f) => f + 1);
                          })
                          .catch((err) => {
                            message.error("Hủy bị lỗi!");
                          });
                      } else {
                        axiosClient
                          .patch("/orders/" + id, {
                            status: "Canceled",
                            paymentStatus: "Hủy",
                            importStatus: "Chờ nhập kho",
                          })
                          .then((response) => {
                            message.success("Đơn hàng đã bị hủy!");
                            setRefresh((f) => f + 1);
                          })
                          .catch((err) => {
                            message.error("Hủy bị lỗi!");
                          });
                      }
                    }}
                    onCancel={() => {
                      setRefresh((f) => f + 1);
                    }}
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
                      setRefresh((f) => f + 1);
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
                    onCancel={() => {
                      setRefresh((f) => f + 1);
                    }}
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
    axiosClient.get("/orders").then((response) => {
      setOrders(response.data);
    });
    axiosClient
      .get(`/orders/${selectedOrder?._id}/orderDetails`)
      .then((response) => {
        setOrderDetail(response.data);
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
  }, [refresh]);
  const updateQuantity = (value) => {
    const quanDiff = value.quantity - selectEditRecord?.quantity;
    if (maxQuantity - quanDiff < 0) {
      message.error("Tồn kho không đủ");
    } else {
      axiosClient
        .patch(
          `/orders/${selectedOrder._id}/orderDetails/${selectEditRecord?._id}`,
          {
            quantity: value.quantity,
          }
        )
        .then((response) => {
          setRefresh((f) => f + 1);
          axiosClient
            .patch(
              `/products/${selectEditRecord?.productId}/variants/${selectEditRecord?.colorId}/sizes/${selectEditRecord?.sizeId}/order`,
              {
                quantity: maxQuantity - quanDiff,
              }
            )
            .then((response) => {
              setRefresh((f) => f + 1);
              setSelectEditRecord(null);
            });
        })
        .catch((error) => {
          console.log(error);
        });
    }
    setRefresh((f) => f + 1);
  };
  const handleProductChange = (productId) => {
    const product = products.find((p) => p._id === productId);
    // Kiểm tra số lượng sản phẩm có sẵn
    if (product.stock === 0) {
      message.error("Sản phẩm " + product.name + " đã hết hàng");
      // Reset
      setSelectedProduct(null);
      return;
    } else {
      setSelectedProduct(product);
      setSelectedColor(null);
      setSelectedSize(null);
      setQuantity(1);
    }
  };
  const handleColorChange = (colorId, record) => {
    const color = selectedProduct.variants.find((v) => v.colorId === colorId);
    if (selectedProduct.stockByColor[colorId] === 0) {
      message.error(
        "Màu " +
          record.children[0] +
          " của " +
          selectedProduct.name +
          " đã hết hàng"
      );
      // Reset
      setSelectedColor(null);
      return null;
    } else {
      selectedProduct.variants.find((v, index) => {
        if (v.colorId === colorId) {
          setIndex2(index);
        }
      });
      setSizeID(color.sizes.map((i) => i.sizeId));
      setSelectedColor(color);
      setSelectedSize(null);
      setQuantity(1);
    }
  };
  const handleSizeChange = (sizeId, record) => {
    const size = selectedColor.sizes.find((s) => s.sizeId === sizeId);
    if (record.children[2] === 0) {
      message.error(
        "Màu " +
          selectedProduct.color[index2].name +
          " cỡ " +
          record.children[0] +
          " của " +
          selectedProduct.name +
          " đã hết hàng"
      );
      // Reset
      setSelectedSize(null);
      return;
    }
    setSelectedSize(size);
    setQuantity(1);
  };
  const handleFormSubmit = async (values) => {
    const existingOrderItem = selectedOrder.orderDetails.find(
      (item) =>
        item.productId === selectedProduct._id &&
        item.colorId === selectedColor.colorId &&
        item.sizeId === selectedSize.sizeId
    );
    if (existingOrderItem) {
      message.warning("Sản phẩm đã có trong đơn hàng");
      setAppeared(0);
      return;
    } else {
      axiosClient
        .post("/orders/" + selectedOrder._id + "/orderDetails/", {
          productId: selectedProduct._id,
          colorId: selectedColor.colorId,
          sizeId: selectedSize.sizeId,
          quantity: quantity,
          price: selectedColor.price,
          discount: selectedColor.discount,
        })
        .then(async (response) => {
          const remainQuantity = await axiosClient.get(
            "/products/" +
              values.productId +
              "/variants/" +
              values.colorId +
              "/sizes/" +
              values.sizeId +
              "/order"
          );
          axiosClient
            .patch(
              "/products/" +
                values.productId +
                "/variants/" +
                values.colorId +
                "/sizes/" +
                values.sizeId +
                "/order",
              { quantity: remainQuantity.data.quantity - values.quantity }
            )
            .then((response) => {
              setRefresh((f) => f + 1);
              message.success("Thêm mới thành công!");
              setSelectedProduct(null);
              setSelectedColor(null);
              setSelectedSize(null);
              setQuantity(1);
              createForm.resetFields();
              setAddProductsModalVisible(false);
            });
        })
        .catch((err) => {
          message.error("Thêm mới bị lỗi!");
        });
    }
  };
  const onChangeShipper = async (value) => {
    await axiosClient
      .patch("/orders/" + selectedOrder._id, { shipperId: value })
      .then((response) => {
        message.success("Đã thêm nhân viên giao hàng");
        setRefresh((f) => f + 1);
      });
  };
  const paymentStatus = async (value) => {
    await axiosClient
      .patch("/orders/" + selectedOrder._id, {
        paymentStatus: value.target.checked
          ? value.target.name
          : "Chưa thanh toán",
      })
      .then((response) => {
        message.success("Đã cập nhật trạng thái thanh toán");
        setRefresh((f) => f + 1);
      });
  };
  return (
    <div>
      <Modal
        centered
        width={"90%"}
        title="Chi tiết đơn hàng"
        open={selectedOrder}
        onOk={() => setSelectedOrder(null)}
        onCancel={() => {
          setRefresh((f) => f + 1);
          setSelectedOrder(null);
        }}
      >
        {selectedOrder && (
          <div>
            <Descriptions
              bordered
              column={2}
              labelStyle={{ fontWeight: "700" }}
            >
              <Descriptions.Item label="Trạng thái">
                {selectedOrder.status}
              </Descriptions.Item>
              <Descriptions.Item label="Người nhận">
                {selectedOrder.receiverName}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng">
                {selectedOrder?.address}
              </Descriptions.Item>
              <Descriptions.Item label="Khu vực giao hàng">
                {selectedOrder.deliveryArea}
              </Descriptions.Item>
              {selectedOrder?.shippingFee === 0 ? (
                <Descriptions.Item label="Chọn nhân viên giao hàng">
                  <Form.Item name="shipperId">
                    <Select
                      onChange={onChangeShipper}
                      defaultValue={selectedOrder.shipperId ?? null}
                      showSearch
                      optionFilterProp="children"
                    >
                      {employees
                        .filter(
                          (employee) =>
                            employee.deliveryArea === selectedOrder.deliveryArea
                        )
                        .map((employee) => (
                          <Select.Option
                            key={employee._id}
                            value={employee._id}
                          >
                            {employee.fullName} - {employee.deliveryArea}
                          </Select.Option>
                        ))}
                    </Select>
                  </Form.Item>
                </Descriptions.Item>
              ) : (
                <Descriptions.Item label="Phí vận chuyển">
                  {numeral(selectedOrder.shippingFee).format("0,0$")}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Trạng thái thanh toán">
                <Form.Item name="paymentStatus">
                  <Checkbox
                    defaultChecked={
                      selectedOrder.paymentStatus === "Đã thanh toán"
                        ? true
                        : false
                    }
                    onChange={paymentStatus}
                    name="Đã thanh toán"
                  >
                    Đã thanh toán
                  </Checkbox>
                </Form.Item>
              </Descriptions.Item>
              {selectedOrder.note ? (
                <Descriptions.Item label="Ghi chú">
                  {selectedOrder.note}
                </Descriptions.Item>
              ) : (
                <></>
              )}
            </Descriptions>
            <Divider />
            <Table
              rowKey="_id"
              dataSource={orderDetail}
              columns={productColumns}
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
            <div style={{ marginTop: "10px" }}>
              <Button
                onClick={() => {
                  setRefresh((f) => f + 1);
                  setAddProductsModalVisible(true);
                }}
              >
                Thêm sản phẩm
              </Button>
            </div>

            <Modal
              centered
              width={"80%"}
              title="Thêm sản phẩm vào đơn hàng"
              open={addProductsModalVisible}
              onOk={() => {
                createForm.submit();
              }}
              onCancel={() => {
                setRefresh((f) => f + 1);
                setAddProductsModalVisible(false);
              }}
            >
              <Form
                form={createForm}
                name="create-form"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                initialValues={{ remember: true }}
                onFinish={handleFormSubmit}
                autoComplete="on"
              >
                <Form.Item label="Sản phẩm" name="productId">
                  <Select
                    value={selectedProduct ? selectedProduct._id : undefined}
                    onChange={handleProductChange}
                    showSearch
                    optionFilterProp="children"
                  >
                    {products.map((product) => (
                      <Option key={product._id} value={product._id}>
                        {product.name} - Tồn kho: {product.stock}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                {selectedProduct && (
                  <>
                    <Form.Item label="Màu sắc" name="colorId">
                      <Select
                        value={
                          selectedColor ? selectedColor.colorId : undefined
                        }
                        onChange={handleColorChange}
                        showSearch
                        optionFilterProp="children"
                      >
                        {selectedProduct.variants.map((variant, index) => (
                          <Option key={variant.colorId} value={variant.colorId}>
                            <span
                              style={{
                                backgroundColor:
                                  selectedProduct.color[index].hexcode[0].hex,
                                display: "inline-block",
                                width: "10px",
                                height: "10px",
                                marginRight: "3px",
                              }}
                            />
                            {selectedProduct.color[index].name} - Tồn kho:{" "}
                            {selectedProduct.stockByColor[variant.colorId]}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    {selectedColor && (
                      <>
                        <Form.Item label="Kích cỡ" name="sizeId">
                          <Select
                            value={
                              selectedSize ? selectedSize.sizeId : undefined
                            }
                            onChange={handleSizeChange}
                          >
                            {selectedProduct?.size[index2].map(
                              (size, index) => {
                                return (
                                  <Option key={size._id} value={size._id}>
                                    {size.size} - Tồn kho:{" "}
                                    {selectedColor?.sizes[index]?.quantity}
                                  </Option>
                                );
                              }
                            )}
                          </Select>
                        </Form.Item>
                        {selectedSize && (
                          <>
                            <Form.Item label="Số lượng" name="quantity">
                              <InputNumber
                                type="number"
                                min={1}
                                max={selectedSize.quantity}
                                value={quantity}
                                onChange={(value) =>
                                  value && setQuantity(parseInt(value))
                                }
                              />
                            </Form.Item>
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </Form>
            </Modal>
            <Modal
              centered
              open={selectEditRecord}
              title="Cập nhật số lượng"
              onOk={() => {
                updateForm.submit();
              }}
              onCancel={() => {
                setRefresh((f) => f + 1);
                setSelectEditRecord(null);
              }}
              okText="Lưu thông tin"
              cancelText="Đóng"
            >
              <Form
                form={updateForm}
                name="update-form"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                initialValues={{ remember: true }}
                onFinish={updateQuantity}
                autoComplete="on"
              >
                {" "}
                <Form.Item label="Số lượng" name="quantity">
                  <InputNumber
                    type="number"
                    min={1}
                    max={maxQuantity + selectEditRecord?.quantity}
                    value={selectEditRecord?.quantity}
                    onChange={(value) => value && setQuantity(parseInt(value))}
                  />
                </Form.Item>
              </Form>
            </Modal>
          </div>
        )}
      </Modal>

      <Table rowKey="_id" dataSource={orders} columns={columns} />

      <Drawer
        placement="bottom"
        height={"90%"}
        title="Chi tiết đơn hàng"
        open={selectedOrderView}
        onClose={() => {
          setRefresh((f) => f + 1);
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
