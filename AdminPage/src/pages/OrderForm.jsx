import React from "react";
import {
  Form,
  Input,
  Button,
  Select,
  message,
  Table,
  Space,
  Modal,
  InputNumber,
} from "antd";
import axios from "axios";
import numeral from "numeral";
import {
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../hooks/useAuthStore";
import { axiosClient } from "../libraries/axiosClient";

const { Option } = Select;

const OrderForm = () => {
  const { auth, logout } = useAuthStore((state) => state);
  const [form] = Form.useForm();
  const [products, setProducts] = React.useState([]);
  const [colors, setColors] = React.useState([]);
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [selectedColor, setSelectedColor] = React.useState(null);
  const [selectedSize, setSelectedSize] = React.useState(null);
  const [quantity, setQuantity] = React.useState(1);
  const [orderItems, setOrderItems] = React.useState([]);
  const [sizeID, setSizeID] = React.useState([]);
  const [index2, setIndex2] = React.useState(0);
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [selectedRecord, setSelectedRecord] = React.useState(null);
  const [editFormVisible, setEditFormVisible] = React.useState(false);
  const [indexNumber, setIndexNumber] = React.useState();
  const [refresh, setRefresh] = React.useState(0);
  const [shippingFee, setShippingFee] = React.useState(0);
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
    [refresh, auth]
  );

  const columns = [
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
      align: "left",
      render: (text, record) => {
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
      render: (text, record) => {
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
    {
      title: "Hành động",
      key: "action",
      render: (_, record, index) => {
        return (
          <Space>
            <Button
              onClick={() => {
                setRefresh((f) => f + 1);
                setIndexNumber(index);
                setSelectedRecord(record);
                console.log("Selected Record", record);
                updateForm.setFieldsValue(record);
                setEditFormVisible(true);
              }}
              icon={<EditOutlined />}
            />
            <Button
              onClick={() => {
                setRefresh((f) => f + 1);
                const updatedOrderItems = [...orderItems];
                updatedOrderItems.splice(index, 1); // Xóa sản phẩm khỏi danh sách
                setOrderItems(updatedOrderItems);
              }}
              icon={<DeleteOutlined />}
            />
          </Space>
        );
      },
    },
  ];
  React.useEffect(() => {
    // Lấy dữ liệu sản phẩm từ localhost:5000/products
    axiosClient
      .get("/products")
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy dữ liệu sản phẩm:", err);
      });
    axiosClient
      .get("/colors")
      .then((res) => {
        setColors(res.data);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy dữ liệu màu:", err);
      });
  }, [refresh]);
  const handleShippingChange = (value) => {
    setShippingFee(value === "inCity" ? 0 : 40000);
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
          record.children[1] +
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
    if (record.children[3] === 0) {
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

  const onUpdateFinish = (values) => {
    const updatedOrderItems = [...orderItems];
    const item = updatedOrderItems[indexNumber];
    item.quantity = values.quantity;
    item.totalPrice =
      (selectedRecord.price -
        (selectedRecord.price * selectedRecord.discount) / 100) *
      values.quantity;
    updatedOrderItems.splice(indexNumber, 1, item);
    console.log(item);
    setOrderItems(updatedOrderItems);
    setEditFormVisible(false);
    setSelectedRecord(null);
  };

  const handleAddToOrder = () => {
    setRefresh((f) => f + 1);
    if (!selectedProduct || !selectedColor || !selectedSize) {
      message.error("Vui lòng chọn sản phẩm, màu sắc và kích cỡ");
      return;
    }

    if (quantity > selectedSize.quantity) {
      message.error("Số lượng đặt hàng vượt quá số lượng hàng có sẵn");
      return;
    }
    if (quantity === 0) {
      message.error("Hãy nhập số lượng");
      return;
    }

    const existingOrderItem = orderItems.find(
      (item) =>
        item.productId === selectedProduct._id &&
        item.colorId === selectedColor.colorId &&
        item.sizeId === selectedSize.sizeId
    );
    if (existingOrderItem) {
      message.warning("Sản phẩm đã có trong đơn hàng");
      return;
    } else {
      const orderItem = {
        productId: selectedProduct._id,
        colorId: selectedColor.colorId,
        sizeId: selectedSize.sizeId,
        quantity: quantity,
        price: selectedColor.price,
        discount: selectedColor.discount,
        totalPrice:
          ((100 - selectedColor.discount) / 100) *
          selectedColor.price *
          quantity,
      };

      setRefresh((f) => f + 1);
      setOrderItems([...orderItems, orderItem]);
    }
  };

  async function handleFormSubmit(values) {
    try {
      if (orderItems.length === 0) {
        message.error("Chưa có sản phẩm nào trong đơn hàng");
      } else {
        axios
          .post("http://localhost:5000/orders", {
            receiverName: values.receiverName,
            phoneNumber: values.phoneNumber,
            email: values.email,
            address: values.address,
            paymentType: values.paymentType,
            note: values.note,
            deliveryArea: values.deliveryArea
              ? values.deliveryArea
              : "Ngoại thành",
            orderDetails: orderItems,
            shippingFee: shippingFee,
            employeeLoginId: employeeLoginId,
          })
          .then((response) => {
            orderItems.forEach(async (orderItem) => {
              const remainQuantity = await axiosClient.get(
                `/products/${orderItem.productId}/variants/${orderItem.colorId}/sizes/${orderItem.sizeId}/order`
              );
              axiosClient.patch(
                `/products/${orderItem.productId}/variants/${orderItem.colorId}/sizes/${orderItem.sizeId}/order`,
                {
                  quantity: remainQuantity.data.quantity - orderItem.quantity,
                }
              );
              setRefresh((f) => f + 1);
            });
          })
          .catch((err) => {
            console.log(err);
            message.error("Vui lòng kiểm tra lại thông tin!");
          });

        message.success("Đã tạo đơn hàng thành công!");
        // Xóa toàn bộ record trong bảng
        setOrderItems([]);
        setSelectedProduct(null);
        setSelectedColor(null);
        setSelectedSize(null);
        setQuantity(1);
        // Reset lại các trường trong form
        form.resetFields();
        createForm.resetFields();
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <h2>Thông tin người mua hàng:</h2>
      <Form
        form={createForm}
        name="create-form"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        onFinish={handleFormSubmit}
        autoComplete="on"
      >
        <Form.Item
          name="receiverName"
          label="Tên người nhận"
          rules={[{ required: true, message: "Chưa nhập tên khách hàng" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="phoneNumber"
          label="Số điện thoại"
          rules={[
            { required: true, message: "Hãy nhập số điện thoại!" },
            {
              pattern:
                /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/,
              message: "Số điện thoại không hợp lệ!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Chưa nhập Thư điện tử" },
            { type: "email", message: "Thư điện tử không hợp lệ" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="paymentType"
          label="Phương thức thanh toán"
          rules={[{ required: true }]}
        >
          <Select showSearch optionFilterProp="children">
            <Option value="Cash">Tiền mặt</Option>
            <Option value="Credit Card">Thẻ tín dụng</Option>
            <Option value="Bank Transfer">Chuyển khoản qua ngân hàng</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="address"
          label="Địa chỉ giao hàng"
          rules={[{ required: true, message: "Chưa nhập địa chỉ" }]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="note" label="Ghi chú">
          <Input />
        </Form.Item>
        <Form.Item label="Phí ship">
          <Select
            defaultValue="inCity"
            onChange={handleShippingChange}
            showSearch
            optionFilterProp="children"
          >
            <Select.Option value="inCity">Nội thành</Select.Option>
            <Select.Option value="outCity">
              Ngoại thành (+40,000đ)
            </Select.Option>
          </Select>
        </Form.Item>
        {shippingFee === 0 && (
          <Form.Item
            name="deliveryArea"
            label="Khu vực giao hàng"
            rules={[{ required: true, message: "Chưa chọn khu vực giao hàng" }]}
          >
            <Select showSearch optionFilterProp="children">
              <Option value="Hòa Vang">Hòa Vang</Option>
              <Option value="Hải Châu">Hải Châu</Option>
              <Option value="Thanh Khê">Thanh Khê</Option>
              <Option value="Liên Chiểu">Liên Chiểu</Option>
              <Option value="Ngũ Hành Sơn">Ngũ Hành Sơn</Option>
              <Option value="Cẩm Lệ">Cẩm Lệ</Option>
              <Option value="Sơn Trà">Sơn Trà</Option>
            </Select>
          </Form.Item>
        )}
        <h2>Chọn sản phẩm để thêm vào đơn hàng:</h2>
        <Form.Item label="Sản phẩm">
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
            <Form.Item label="Màu sắc">
              <Select
                value={selectedColor ? selectedColor.colorId : undefined}
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
                <Form.Item label="Kích cỡ">
                  <Select
                    value={selectedSize ? selectedSize.sizeId : undefined}
                    onChange={handleSizeChange}
                  >
                    {selectedProduct?.size[index2].map((size, index) => {
                      return (
                        <Option key={size._id} value={size._id}>
                          {size.size} - Tồn kho:{" "}
                          {selectedColor?.sizes[index]?.quantity}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
                {selectedSize && (
                  <>
                    <Form.Item label="Số lượng">
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
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={handleAddToOrder}>Thêm vào đơn hàng</Button>
        </div>
        <h1>Danh sách sản phẩm trong đơn hàng:</h1>
        {orderItems.length > 0 ? (
          <Table
            columns={columns}
            dataSource={orderItems}
            rowKey={(_, record, index) => index}
            pagination={false}
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
                  <Table.Summary.Row align="right">
                    <Table.Summary.Cell index={0}></Table.Summary.Cell>
                    <Table.Summary.Cell index={1}></Table.Summary.Cell>
                    <Table.Summary.Cell index={2}></Table.Summary.Cell>
                    <Table.Summary.Cell index={3}></Table.Summary.Cell>
                    <Table.Summary.Cell index={4}></Table.Summary.Cell>
                    <Table.Summary.Cell index={5}>
                      <strong>Phí vận chuyển:</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6}>
                      <strong>{numeral(shippingFee).format("0,0$")}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={7}></Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row align="right">
                    <Table.Summary.Cell index={0}></Table.Summary.Cell>
                    <Table.Summary.Cell index={1}></Table.Summary.Cell>
                    <Table.Summary.Cell index={2}></Table.Summary.Cell>
                    <Table.Summary.Cell index={3}></Table.Summary.Cell>
                    <Table.Summary.Cell index={4}></Table.Summary.Cell>
                    <Table.Summary.Cell index={5}>
                      <strong>Tổng cộng:</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6}>
                      <strong>
                        {numeral(totalValue + shippingFee).format("0,0$")}
                      </strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={7}></Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        ) : (
          <p>Chưa có sản phẩm trong đơn hàng</p>
        )}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Tạo đơn đặt hàng
          </Button>
        </Form.Item>
      </Form>
      <Modal
        centered
        open={editFormVisible}
        title="Cập nhật thông tin"
        onOk={() => {
          updateForm.submit();
        }}
        onCancel={() => {
          setEditFormVisible(false);
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
          onFinish={onUpdateFinish}
          autoComplete="on"
        >
          <Form.Item label="Sản phẩm" name="productId">
            <Select
              value={selectedProduct ? selectedProduct._id : undefined}
              onChange={handleProductChange}
              showSearch
              optionFilterProp="children"
              disabled
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
                  value={selectedColor ? selectedColor.colorId : undefined}
                  onChange={handleColorChange}
                  showSearch
                  optionFilterProp="children"
                  disabled
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
                      value={selectedSize ? selectedSize.sizeId : undefined}
                      onChange={handleSizeChange}
                      disabled
                    >
                      {selectedProduct?.size[index2].map((size, index) => {
                        return (
                          <Option key={size._id} value={size._id}>
                            {size.size} - Tồn kho:{" "}
                            {selectedColor?.sizes[index]?.quantity}
                          </Option>
                        );
                      })}
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
    </div>
  );
};
export default OrderForm;
