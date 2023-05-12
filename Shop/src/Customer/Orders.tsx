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
  Image,
} from "antd";
import { OrderStatus} from "../meta/OrderStatus";
import numeral from "numeral";

import { EyeOutlined } from "@ant-design/icons";
import { useAuthStore } from "../hooks/useAuthStore";
import axios from "axios";
import type { ColumnsType } from 'antd/es/table';
import { API_URL } from "../constants/URLS";
const { Option } = Select;
interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    color: {
      _id: string;
      name: string;
      hexcode: any[];
    }[];
    size: {
      _id: string;
      size: string;
    }[][];
    variants: {
      colorId: string;
      sizes: any[];
      price: number;
      discount: number;
      _id: string
    }[];
  };
  interface Order {
    productId: string;
    colorId: string;
    sizeId: string;
    quantity: number;
    price: number;
    discount?: number;
    imageUrl: string;
  }
interface Color {
    _id: string;
    name: string;
    hexcode: any[];
}
interface Variant {
    colorId: string;
    sizes: any[];
    price: number;
    discount: number;
    _id: string
  };
  interface ProductColumn {
    productId: any;
    colorId: any;
    sizeId: any;
    quantity: any;
    price: any;
    discount: any;
    imageUrl: any;
    totalQuantity: any;
  }
  interface SelectedOrderView {
    _id: string;
    status: string;
    receiverName: string;
    address: string;
    deliveryArea: string;
    shippingFee: number;
    shipper: {
      fullName: string;
    };
    paymentStatus: string;
    note?: string;
    verifier: {
      fullName: string;
    };
  }
  interface Columns{
    receiverName: string;
    phoneNumber: string;
    paymentType: string;
    status: string;
    customerId: string;
    employeeLoginId: string;
    totalProductValue: number;
  }
  
export default function SearchOrdersByStatus() {
  const [selectedOrderView, setSelectedOrderView] = React.useState<SelectedOrderView>({
    _id: "",
    status: "",
    receiverName: "",
    address: "",
    deliveryArea: "",
    shippingFee: 0,
    shipper: {
      fullName: "",
    },
    paymentStatus: "",
    note: "",
    verifier: {
      fullName: "",
    }
  });
  const [orderDetail, setOrderDetail] = React.useState([]);
  const [verifierName, setVerifierName] = React.useState();
  const [isMultipleSelect, setIsMultipleSelect] = React.useState(false);
  const [isViewOrder, setIsViewOrder] = React.useState(false);
  const { auth, logout } = useAuthStore((state: any) => state);
  const [refresh, setRefresh] = React.useState(0);
  


  const productColumnsView: ColumnsType<ProductColumn> = [
    {title: "Hình ảnh",
    dataIndex: "imageUrl",
    key: "imageUrl",
    render: (text: any, record: any) => {
        return (
            <Image
            width={60}
            src={`${API_URL}/${text}`}
            />
        )
      },
    },
    {
      title: "Sản phẩm",
      dataIndex: "productId",
      key: "productId",
      align: "left",
      width: "auto",
      render: (text: any, record: any) => {
        const product = products.find((p: Product) => p._id === text);
        return product ? product.name : "";
      },
    },
    {
      title: "Màu sắc",
      dataIndex: "colorId",
      key: "colorId",
      width: "auto",
      align: "center",
      render: (text: any, record: Order, index: any) => {
        const product = products.find(
          (product: Product) => product._id === record.productId
        );
        const color = product?.color.find((color: any) => color._id === text);
        const hexcode = product?.color.find(
          (color: any) => color._id === record.colorId
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
      render: (text: any, record: Order, index: any) => {
        const product = products.find(
          (product: Product) => product._id === record.productId
        );
        const variant = product?.variants.findIndex(
          (variant: Variant) => variant.colorId === record.colorId
        );
        const size = product?.size[variant??(-1)]?.find((s: any) => s._id === text)?.size;
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
      render: (text: any, record: any) => {
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
      render: (text: any, record: any) => {
        return <strong>{numeral(text).format("0,0$")}</strong>;
      },
    },
  ];
  
  const columns: ColumnsType<Columns> = [
    {
      title: "Tên người nhận",
      dataIndex: "receiverName",
      key: "receiverName",
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
      render: (text: any, record: any) => {
        return <p>{record.customerId ? "Thành viên" : "Vãng lai"}</p>;
      },
    },
    {
      title: "Người tạo đơn",
      dataIndex: "employeeLoginId",
      align: "center",
      key: "employeeLoginId",
      render: (text: any, record: any) => {
        axios.get(API_URL+"/employees/" + record?.employeeLogin?.employeeId)
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
      render: (text: number, record: any) => {
        return (
          <strong>{numeral(text + record.shippingFee).format("0,0$")}</strong>
        );
      },
    },
    {
      title: "",
      key: "actions",
      render: (text:any, record:any) => {
        return (
          <Button
            onClick={() => {
              setRefresh((f) => f + 1)
              setSelectedOrderView(record);
              setIsViewOrder(true)
              axios
                .get(API_URL+"/employees/" + record?.verifier?.employeeId)
                .then((response) => {
                  setVerifierName(response.data.fullName);
                });
            }}
            icon={<EyeOutlined />}
          />
        );
      },
    },
  ];
  const [loading, setLoading] = React.useState(false);
  const [orders, setOrders] = React.useState([]);
  const [searchForm] = Form.useForm();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [employeeName, setEmployeeName] = React.useState();
  React.useEffect(() => {
    axios
      .get(`${API_URL}/orders/${selectedOrderView?._id}/orderDetails`)
      .then((response) => {
        setOrderDetail(response.data);
      });
    axios.get(API_URL+"/products").then((response) => {
      setProducts(response.data);
    });
  }, [selectedOrderView]);

  React.useEffect(() => {
    axios
    .post(API_URL+"/orders/status&customerId", {customerId: auth.loggedInUser._id, status: ""},).then((res)=>{
        setOrders(res.data);  
    })
  }, [auth]);

  const onFinish = (values: any) => {
    console.log(values)
    setLoading(true);
    axios
      .post(API_URL+"/orders/status&customerId", {status: values.status, customerId: auth.loggedInUser._id})
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

  const onFinishFailed = (errors: any) => {
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
         open={isViewOrder}
         onClose={() => {
           setRefresh((f) => f + 1)
           setIsViewOrder(false);
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
                  {selectedOrderView.shipper?.fullName??""}
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
                {selectedOrderView.verifier?.fullName ?? verifierName}
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
                pageData.forEach(({ quantity, totalPrice }: any) => {
                  totalQuantity += quantity;
                  totalValue += totalPrice;
                });
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row style={{alignContent:"right"}}>
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
