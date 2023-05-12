import React from "react";
import {
  Image,
  Table,
  Button,
  message,
  Space,
  Upload,
  Descriptions,
} from "antd";
import {
  CloseCircleFilled,
  UploadOutlined,
} from "@ant-design/icons";
import {useAuthStore} from '../../../hooks/useAuthStore'
import { axiosClient } from "../../../libraries/axiosClient";
import numeral from "numeral";
import { API_URL } from "../../../constants/URLS";


export default function Promotion() {
  const [isPreview, setIsPreview] = React.useState(false);
  const [categories, setCategories] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [selectedRecord, setSelectedRecord] = React.useState(null);
  const [refresh, setRefresh] = React.useState(0);
  const [file, setFile] = React.useState(null);
  const [colors, setColors] = React.useState([]);
  const [sizes, setSizes] = React.useState([]);
  const { auth, logout } = useAuthStore((state) => state);
  const [useRole, setUseRole] = React.useState("");
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
  React.useEffect((e) => {
    if (auth){
    axiosClient.get("/login/" + auth?.loggedInUser?._id, e).then((response) => {
      setUseRole(response.data.role);
    });}
  }, []);
  const columns = [
    {
      title: "Hình ảnh",
      key: "imageUrl",
      dataIndex: "imageUrl",
      width: "1%",
      render: (text, record) => {
        return (
          <div>
            {text && (
              <React.Fragment>
                <Image
                  onClick={() => {
                    setRefresh((f) => f + 1)
                    setSelectedRecord(record);
                    setIsPreview(true);
                  }}
                  preview={{
                    visible: false,
                  }}
                  width={60}
                  src={`${API_URL}${text}`}
                />
                <div
                  style={{
                    display: "none",
                  }}
                >
                  <Image.PreviewGroup
                    preview={{
                      visible: isPreview && record._id === selectedRecord?._id,
                      onVisibleChange: (vis) => setIsPreview(vis),
                    }}
                  >
                    <Image src={`${API_URL}${text}`} />
                    {record &&
                      record.images &&
                      record.images.map((image) => {
                        return <Image key={image} src={`${API_URL}${image}`} />;
                      })}
                  </Image.PreviewGroup>
                </div>
              </React.Fragment>
            )}
          </div>
        );
      },
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      width: "1%",
      key: "category",
      render: (text, record) => {
        return <strong>{record?.category?.name}</strong>;
      },
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      width: "10%",
      key: "name",
      render: (text) => {
        return <strong>{text}</strong>;
      },
    },
    {
      title: "Chi tiết",
      dataIndex: "variants",
      key: "details",
      render: (variants, record) => (
        <ul>
          {variants.map((color, index) => (
            <li key={index}>
              <strong>
                {" "}
                Màu: {record?.color[index].name} - Giá bán:{" "}
                {numeral(color.price).format("0,0$")} - Giảm giá:{" "}
                {numeral(color.discount).format("0,0.0")}%
              </strong>
              <ul>
                {color.sizes.map((size, i) => (
                  <li key={i}>
                    Cỡ: {record?.size[index][i].size} - Số lượng:{" "}
                    {size.quantity}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ),
    },

    {
      title: "Tồn kho",
      dataIndex: "stock",
      key: "stock",
      width: "1%",
      render: (text) => {
        return <span>{numeral(text).format("0,0")}</span>;
      },
    },
    {
      title: "Hình chi tiết",
      dataIndex: "images",
      width: "3%",
      key: "images",
      render: (text, record) => {
          return (
            <Button
              onClick={() => {
                setRefresh((f) => f + 1)
                console.log("selectedRecord", record);
              }}
            >
              Xem
            </Button>
          );
        }
    },
    {
      title: "",
      key: "actions",
      width: "1%",
      render: (text, record) => {
        return (
            <Space>
           <Button
            disabled={record.promotion === "No"}
            type="dashed"
            icon={<CloseCircleFilled />}
            onClick={() => {
              setRefresh((f) => f + 1)
              axiosClient.patch("/products/"+record._id, {promotion: "No"}).then((response) => {
                message.success("Đã gỡ sản phẩm khỏi danh sách yêu thích")
                setRefresh((f) => f + 1);
              })
            }}
          />
            <Upload
              showUploadList={false}
              name="file"
              action={API_URL + "/upload/products/" + record._id}
              headers={{ authorization: "authorization-text" }}
              onChange={(info) => {
                setRefresh((f) => f + 1)
                if (info.file.status !== "uploading") {
                  console.log(info.file, info.fileList);
                }
                if (info.file.status === "done") {
                  message.success(
                    `${info.file.name} file uploaded successfully`
                  );

                  setRefresh((f) => f + 1);
                } else if (info.file.status === "error") {
                  message.error(`${info.file.name} file upload failed.`);
                }
              }}
            >
              <Button icon={<UploadOutlined />} />
            </Upload>
          </Space>    
        );
      },
    },
  ];

  const fetchColors = async () => {
    try {
      const response = await axiosClient.get("/colors"); // Thay đổi đường dẫn API tương ứng
      setColors(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  React.useEffect(() => {
    axiosClient.get("/sizes").then((response) => {
      setSizes(response.data);
    });
    axiosClient.get("/categories").then((response) => {
      setCategories(response.data);
    });
    fetchColors();
  }, [refresh]);

  React.useEffect(() => {
    axiosClient.post("/products/promotion", {promotion: "Yes"}).then((response) => {
      setProducts(response.data);
      console.log(response.data);
    });
  }, [refresh]);


  return (
      <Table
        rowKey="_id"
        dataSource={products}
        columns={columns}
        pagination={false}
        expandable={{
          expandedRowRender: (record) => (
            <Descriptions
              bordered
              column={3}
              labelStyle={{ fontWeight: "700" }}
            >
              <Descriptions.Item label="Mô tả sản phẩm">
                {record.description}
              </Descriptions.Item>
              <Descriptions.Item label="Hướng dẫn bảo quản">
                {record.preserveGuide}
              </Descriptions.Item>
            </Descriptions>
          ),
        }}
      />
  );
}
