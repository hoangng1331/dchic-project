import React from "react";
import {
  Image,
  Table,
  Button,
  Popconfirm,
  Form,
  Input,
  message,
  Space,
  Modal,
  Select,
  Upload,
  Descriptions,
  Divider,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  LikeFilled,
  AppstoreAddOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../../../hooks/useAuthStore";
import { axiosClient } from "../../../libraries/axiosClient";
import numeral from "numeral";
import { API_URL } from "../../../constants/URLS";
import ColorForm from "../../Colors";
import axios from "axios";
export default function Products() {
  const [isPreview, setIsPreview] = React.useState(false);
  const [isChooseImage, setIsChooseImage] = React.useState(null);
  const [categories, setCategories] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [selectedRecord, setSelectedRecord] = React.useState(null);
  const [refresh, setRefresh] = React.useState(0);
  const [editFormVisible, setEditFormVisible] = React.useState(false);
  const [addVariant, setAddVariant] = React.useState(null);
  const [addSize, setAddSize] = React.useState(null);
  const [fileList, setFileList] = React.useState([]);
  const [colors, setColors] = React.useState([]);
  const [chosenSizes, setChosenSizes] = React.useState([]);
  const [sizes, setSizes] = React.useState([]);
  const [vaSizes, setVaSizes] = React.useState([]);
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const { auth, logout } = useAuthStore((state) => state);
  const [useRole, setUseRole] = React.useState("");
  const [viewCategory, setViewCategory] = React.useState(null);
  const [newCategory, setNewCategory] = React.useState();
  const [newSize, setNewSize] = React.useState();
  const [pVariants, setPVariants] = React.useState();
  const [selectVariant, setSelectVariant] = React.useState(null);
  const [selectSize, setSelectSize] = React.useState(null);
  const [imageUrls, setImageUrls] = React.useState([]);

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
    if (auth) {
      axiosClient
        .get("/login/" + auth?.loggedInUser?._id, e)
        .then((response) => {
          setUseRole(response.data.role);
        });
    }
  }, []);
  const columns = [
    {
      title: "Danh mục",
      width: "10%",
      dataIndex: "category",
      key: "category",
      render: (text, record) => {
        return <strong>{record?.category?.name}</strong>;
      },
    },
    {
      title: "Tên sản phẩm",
      width: "15%",
      dataIndex: "name",
      key: "name",
      render: (text) => {
        return <strong>{text}</strong>;
      },
    },
    {
      title: "Chi tiết",
      dataIndex: "variants",
      width: "45%",
      key: "details",
      render: (variants, record) => (
        <Space>
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

          <Button
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
            }}
            onClick={() => setAddVariant(record)}
            icon={<AppstoreAddOutlined />}
          />
        </Space>
      ),
    },

    {
      title: "Tồn kho",
      width: "10%",
      dataIndex: "stock",
      key: "stock",
      align: "right",
      render: (text) => {
        return <span>{numeral(text).format("0,0")}</span>;
      },
    },
    {
      title: "",
      key: "actions",
      render: (text, record) => {
        return (
          <>
            {(useRole === "Admin") | (useRole === "Quản lý") ? (
              <Space>
                {useRole === "Admin" && (
                  <Space>
                    <Popconfirm
                      style={{ width: 800 }}
                      title="Bạn có chắc chắn muốn xóa không?"
                      onConfirm={() => {
                        setRefresh((f) => f + 1);
                        // DELETE
                        const id = record._id;
                        axiosClient
                          .delete("/products/" + id)
                          .then((response) => {
                            message.success("Xóa thành công!");
                            setRefresh((f) => f + 1);
                          })
                          .catch((err) => {
                            message.error("Xóa bị lỗi!");
                          });
                      }}
                      onCancel={() => {}}
                      okText="Đồng ý"
                      cancelText="Đóng"
                    >
                      <Button danger type="dashed" icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                )}
                <Button
                  type="dashed"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setRefresh((f) => f + 1);
                    setSelectedRecord(record);
                    updateForm.setFieldsValue(record);
                    setEditFormVisible(true);
                  }}
                />
                <Button
                  disabled={record.promotion === "Yes"}
                  type="dashed"
                  icon={<LikeFilled />}
                  onClick={() => {
                    setRefresh((f) => f + 1);
                    axiosClient
                      .patch("/products/" + record._id, { promotion: "Yes" })
                      .then((response) => {
                        message.success("Đã thêm vào danh sách yêu thích");
                        setRefresh((f) => f + 1);
                      });
                    setRefresh((f) => f + 1);
                  }}
                />
              </Space>
            ) : (
              <></>
            )}
          </>
        );
      },
    },
  ];

  const variants = [
    {
      title: "Hình ảnh",
      key: "imageUrl",
      dataIndex: "imageUrl",
      render: (text, record) => {
        return (
          <div>
            {text && (
              <React.Fragment>
                <Image
                  onClick={() => {
                    setRefresh((f) => f + 1);
                    setIsChooseImage(record);
                    setIsPreview(true);
                  }}
                  preview={{
                    visible: false,
                  }}
                  width={60}
                  src={`${API_URL}${text[0]}`}
                />
                <div
                  style={{
                    display: "none",
                  }}
                >
                  <Image.PreviewGroup
                    preview={{
                      visible: isPreview && record._id === isChooseImage?._id,
                      onVisibleChange: (vis) => setIsPreview(vis),
                    }}
                  >
                    {record &&
                      record.imageUrl &&
                      record.imageUrl.map((image) => {
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
      title: "Màu",
      dataIndex: "colorId",
      key: "colorId",
      render: (text, record) => {
        const variantColor = colors.find((color) => color._id === text);
        return (
          <Space>
            <span
              style={{
                backgroundColor: variantColor.hexcode[0].hex,
                display: "inline-block",
                width: "10px",
                height: "10px",
              }}
            />
            {variantColor?.name}
          </Space>
        );
      },
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      align: "right",
      key: "price",
      render: (text, record) => {
        return <strong>{numeral(text).format("0,0$")}</strong>;
      },
    },
    {
      title: "Giảm giá",
      dataIndex: "discount",
      align: "right",
      key: "discount",
      render: (text, record) => {
        return <span>{numeral(text).format("0,0.0")}%</span>;
      },
    },

    {
      title: "Kích cỡ",
      dataIndex: "sizes",
      width: "25%",
      key: "sizes",
      render: (variantSizes, record) => {
        return (
        <Space>
          <ul>
            {variantSizes.map((size, index) => {
              const sizeName = sizes.find((s) => s._id === size.sizeId);
              return(
                <li key={index}>
                    Kích cỡ: {sizeName?.size} - Số lượng:{" "}
                    {numeral(size.quantity).format("0,0")}
                </li>
              )
            })}
          </ul>

          <Button
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
            }}
            onClick={() => setAddSize(record)}
            icon={<AppstoreAddOutlined />}
          />
        </Space>
      )}
    },

    {
      title: "Tồn kho",
      dataIndex: "sizes",
      key: "stock",
      align: "right",
      render: (sizesObject, record) => {
        let totalQuantity = 0;
        sizesObject.forEach(size => {
          totalQuantity += size.quantity;
        });
        return <span>{numeral(totalQuantity).format("0,0")}</span>;
      },
      
    },
    {
      title: "",
      key: "actions",
      render: (text, record) => {
        return (
          <>
            {(useRole === "Admin") | (useRole === "Quản lý") ? (
              <Space>
                {useRole === "Admin" && (
                  <Space>
                    <Popconfirm
                      style={{ width: 800 }}
                      title="Bạn có chắc chắn muốn xóa không?"
                      onConfirm={() => {
                        setRefresh((f) => f + 1);
                        // DELETE
                        const id = record._id;
                        axiosClient
                          .delete(`/products/${addVariant._id}/variants/${id}`)
                          .then((response) => {
                            message.success("Xóa thành công!");
                            setRefresh((f) => f + 1);
                          })
                          .catch((err) => {
                            message.error("Xóa bị lỗi!");
                          });
                      }}
                      onCancel={() => {}}
                      okText="Đồng ý"
                      cancelText="Đóng"
                    >
                      <Button danger type="dashed" icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                )}
                <Button
                  type="dashed"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setRefresh((f) => f + 1);
                    setSelectVariant(record);
                    updateForm2.setFieldsValue(record);
                  }}
                />
                <Upload
                  showUploadList={false}
                  name="files[]"
                  action={`${API_URL}/upload/products/${addVariant._id}/variants/${record._id}/images`}
                  headers={{ authorization: "authorization-text" }}
                  onChange={(info) => {
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
            ) : (
              <></>
            )}
          </>
        );
      },
    },
  ];
  const vSizes = [
    {
      title: "Kích cỡ",
      dataIndex: "sizeId",
      key: "sizeId",
      align: "center",
      render: (text, record) => {
        const variantSize = sizes.find((size) => size._id === text);
        return variantSize?.size
      },

    },

    {
      title: "Tồn kho",
      dataIndex: "quantity",
      key: "quantity",
      align: "right",
      render: (text) => {
        return <span>{numeral(text).format("0,0")}</span>;
      },
    },
    {
      title: "",
      key: "actions",
      render: (text, record) => {
        return (
          <>
            {(useRole === "Admin") | (useRole === "Quản lý") ? (
              <Space>
                {useRole === "Admin" && (
                  <Space>
                    <Popconfirm
                      style={{ width: 800 }}
                      title="Bạn có chắc chắn muốn xóa không?"
                      onConfirm={() => {
                        setRefresh((f) => f + 1);
                        // DELETE
                        const id = record._id;
                        axiosClient
                          .delete(
                            `/products/${addVariant._id}/variants/${addSize._id}/sizes/${id}`
                          )
                          .then((response) => {
                            message.success("Xóa thành công!");
                            setRefresh((f) => f + 1);
                          })
                          .catch((err) => {
                            message.error("Xóa bị lỗi!");
                            setRefresh((f) => f + 1);
                          });
                      }}
                      onCancel={() => {}}
                      okText="Đồng ý"
                      cancelText="Đóng"
                    >
                      <Button danger type="dashed" icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                )}
                <Button
                  type="dashed"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setRefresh((f) => f + 1);
                    setSelectSize(record);
                    updateForm3.setFieldsValue(record);
                  }}
                />
              </Space>
            ) : (
              <></>
            )}
          </>
        );
      },
    },
  ];
  const props = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  const fetchColors = async () => {
    try {
      const response = await axiosClient.get("/colors"); // Thay đổi đường dẫn API tương ứng
      setColors(response.data);
    } catch (error) {}
  };
  React.useEffect(() => {
    axiosClient
      .get(`/products/${addVariant?._id}/variants`)
      .then((response) => {
        setPVariants(response.data);
      });
    axiosClient
      .get(`/products/${addVariant?._id}/variants/${addSize?._id}/sizes`)
      .then((response) => {
        setVaSizes(response.data);
      });
    axiosClient.get("/sizes").then((response) => {
      setSizes(response.data);
    });
    axiosClient.get("/categories").then((response) => {
      setCategories(response.data);
    });
    fetchColors();
  }, [refresh, addVariant, addSize]);
  const onNewCategory = (event) => {
    setNewCategory(event.target.value);
  };
  const onNewSize = (event) => {
    setNewSize(event.target.value);
  };
  React.useEffect(() => {
    axiosClient
      .post("/products/category", { categoryId: viewCategory })
      .then((response) => {
        setProducts(response.data);
      });
  }, [viewCategory, refresh]);

  const onFinish = (values) => {
    axiosClient
      .post("/products", values)
      .then((response) => {
        message.success("Thêm mới thành công!");
        createForm.resetFields();
        setFileList([]);
        setRefresh((f) => f + 1);
      })
      .catch((err) => {
        message.error("Thêm mới bị lỗi!");
      });
  };

  const onFinishFailed = (errors, response, values) => {
    console.log("🐣", errors.values);
  };
  const showModal = () => {
    setRefresh((f) => f + 1);
    setIsModalVisible(true);
  };
  const onUpdateFinish = (values) => {
    axiosClient
      .patch("/products/" + selectedRecord._id, values)
      .then((response) => {
        message.success("Cập nhật thành công!");
        updateForm.resetFields();
        setRefresh((f) => f + 1);
        setEditFormVisible(false);
      })
      .catch((err) => {
        message.error("Cập nhật bị lỗi!");
      });
  };

  const onUpdateFinishFailed = (errors) => {
    console.log("🐣", errors);
  };

  const [createForm] = Form.useForm();
  const [createForm2] = Form.useForm();
  const [createForm3] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [updateForm2] = Form.useForm();
  const [updateForm3] = Form.useForm();
  const onComplete = (values) => {
    axiosClient
      .get(`/products/${addVariant._id}/variants`)
      .then((response) => {
        const variant = response.data.find((v) => v.colorId === values.colorId);
        if (variant) {
          message.error("Màu này đã tồn tại!");
          return;
        }
        axiosClient
          .post(`/products/${addVariant._id}/variants`, values)
          .then((response) => {
            console.log({ response });
            // UPLOAD FILES
            const { _id } = response.data;
            const formData = new FormData();
            fileList.forEach((file) => {
              formData.append("files[]", file);
            });
            axios
              .post(
                `${API_URL}/upload/products/${addVariant._id}/variants/${_id}`,
                formData
              )
              .then((response) => {
                message.success("Thêm mới thành công!");
                createForm2.resetFields();
                setFileList([]);
                setRefresh((f) => f + 1);
              })
              .catch((err) => {
                message.error("Upload file bị lỗi!");
              });
          })
          .catch((err) => {
            console.log(err);
            message.error("Thêm mới bị lỗi!");
          });
      })
      .catch((err) => {
        console.log(err);
        message.error("Lỗi khi tìm kiếm variant!");
      });
  };

  const onUpdateVariant = (values) => {
    console.log({ values }, "jsdkdjsjdk");
    axiosClient
      .get(`/products/${addVariant._id}/variants`)
      .then((response) => {
        const variant = response.data.find(
          (v) => v.colorId === values.colorId && v._id !== selectVariant._id
        );
        if (variant) {
          message.error("Màu này đã tồn tại!");
          return;
        }
        axiosClient
          .patch(`/products/${addVariant._id}/variants/${selectVariant._id}`, {
            colorId: values.colorId,
            discount: values.discount,
            price: values.price,
            imageUrl: imageUrls,
          })
          .then((response) => {
            message.success("Cập nhật thành công!");
            updateForm2.resetFields();
            setChosenSizes([]);
            setRefresh((f) => f + 1);
            setSelectVariant(null);
          })
          .catch((err) => {
            message.error("Cập nhật bị lỗi!");
          });
      })
      .catch((err) => {
        message.error("Lỗi khi tìm kiếm variant!");
      });
  };
  const onAddSize = (values) => {
    axiosClient
      .get(`/products/${addVariant._id}/variants/${addSize._id}/sizes`)
      .then((response) => {
        const sizes = response.data.find((v) => v.sizeId === values.sizeId);
        if (sizes) {
          message.error("Size này đã tồn tại!");
          return;
        }
        axiosClient
          .post(
            `/products/${addVariant._id}/variants/${addSize._id}/sizes`,
            values
          )
          .then((response) => {
            console.log({ response });
            createForm3.resetFields();
            setRefresh((f) => f + 1);
          })
          .catch((err) => {
            console.log(err);
            message.error("Lỗi khi tìm kiếm variant!");
          });
      });
  };

  const onUpdateSize = (values) => {
    axiosClient
      .get(`/products/${addVariant._id}/variants/${addSize._id}/sizes`)
      .then((response) => {
        const variant = response.data.find(
          (v) => v.sizeId === values.sizeId && v._id !== selectSize._id
        );
        if (variant) {
          message.error("Size này đã tồn tại!");
          return;
        }
        axiosClient
          .patch(
            `/products/${addVariant._id}/variants/${addSize._id}/sizes/${selectSize._id}`,
            values
          )
          .then((response) => {
            message.success("Cập nhật thành công!");
            updateForm3.resetFields();
            setChosenSizes([]);
            setRefresh((f) => f + 1);
            setSelectSize(null);
          })
          .catch((err) => {
            message.error("Cập nhật bị lỗi!");
          });
      })
      .catch((err) => {
        message.error("Lỗi khi tìm kiếm variant!");
      });
  };
  React.useEffect(() => {
    if (selectVariant) {
      setImageUrls(selectVariant.imageUrl);
    }
  }, [selectVariant]);

  return (
    <div>
      {useRole === "Admin" && (
        <Form
          form={createForm}
          name="create-form"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="on"
        >
          <Form.Item
            label="Danh mục sản phẩm"
            name="categoryId"
            rules={[{ required: true, message: "Hãy chọn loại sản phẩm!" }]}
            hasFeedback
          >
            <Select
              showSearch
              optionFilterProp="children"
              value={colors}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider
                    style={{
                      margin: "4px 0",
                    }}
                  />
                  <Space
                    style={{
                      padding: "0 4px 2px",
                    }}
                  >
                    <Input
                      placeholder="Nhập tên danh mục mới"
                      value={newCategory}
                      onChange={onNewCategory}
                    />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setRefresh((f) => f + 1);
                        axiosClient
                          .post("/categories", { name: newCategory })
                          .then((response) => {
                            message.success(
                              "Đã thêm " +
                                newCategory +
                                " vào danh mục sản phẩm"
                            );
                            setRefresh((f) => f + 1);
                            setNewCategory(null);
                          })
                          .catch((err) => {
                            message.error(
                              "Thêm thất bại, danh mục này đã tồn tại!"
                            );
                          });
                        setRefresh((f) => f + 1);
                      }}
                    >
                      Thêm mới
                    </Button>
                  </Space>
                </>
              )}
              virtual
              optionHeight={20}
            >
              {categories.map((category, index) => (
                <Select.Option key={category._id} value={category._id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[{ required: true, message: "Hãy nhập tên sản phẩm!" }]}
            hasFeedback
          >
            <Input />
          </Form.Item>
          <Form.Item label="Mô tả sản phẩm" name="description" hasFeedback>
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            label="Hướng dẫn bảo quản"
            name="preserveGuide"
            hasFeedback
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit" block>
              Lưu thông tin
            </Button>
          </Form.Item>
        </Form>
      )}
      <Form.Item
        label="Danh mục sản phẩm"
        rules={[{ required: true, message: "Hãy chọn loại sản phẩm!" }]}
        hasFeedback
      >
        <Select
          style={{
            width: 300,
          }}
          onChange={(value) => {
            setViewCategory(value);
          }}
          options={
            categories &&
            categories.map((c) => {
              return {
                value: c._id,
                label: c.name,
              };
            })
          }
        />
      </Form.Item>
      <Button
        onClick={() => {
          setRefresh((f) => f + 1);
          setViewCategory(null);
        }}
      >
        Xóa lọc
      </Button>
      <Table
        rowKey="_id"
        dataSource={products}
        columns={columns}
        scroll={{ y: 500 }}
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
      <Modal
        centered
        open={editFormVisible}
        title="Cập nhật thông tin"
        onOk={() => {
          updateForm.submit();
        }}
        onCancel={() => {
          setEditFormVisible(false);
          message.warning("Các thay đổi chưa được lưu");
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
          onFinishFailed={onUpdateFinishFailed}
          autoComplete="on"
        >
          <Form.Item
            label="Danh mục sản phẩm"
            name="categoryId"
            rules={[{ required: true, message: "Hãy chọn loại sản phẩm!" }]}
            hasFeedback
          >
            <Select
              showSearch
              optionFilterProp="children"
              value={colors}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider
                    style={{
                      margin: "4px 0",
                    }}
                  />
                  <Space
                    style={{
                      padding: "0 4px 2px",
                    }}
                  >
                    <Input
                      placeholder="Nhập tên danh mục mới"
                      value={newCategory}
                      onChange={onNewCategory}
                    />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setRefresh((f) => f + 1);
                        axiosClient
                          .post("/categories", { name: newCategory })
                          .then((response) => {
                            message.success(
                              "Đã thêm " +
                                newCategory +
                                " vào danh mục sản phẩm"
                            );
                            setRefresh((f) => f + 1);
                            setNewCategory(null);
                          })
                          .catch((err) => {
                            message.error(
                              "Thêm thất bại, danh mục này đã tồn tại!"
                            );
                          });
                        setRefresh((f) => f + 1);
                      }}
                    >
                      Thêm mới
                    </Button>
                  </Space>
                </>
              )}
              virtual
              optionHeight={20}
            >
              {categories.map((category, index) => (
                <Select.Option key={category._id} value={category._id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[{ required: true, message: "Hãy nhập tên sản phẩm!" }]}
            hasFeedback
          >
            <Input readOnly={useRole !== "Admin"} />
          </Form.Item>

          <Form.Item label="Mô tả sản phẩm" name="description" hasFeedback>
            <Input.TextArea readOnly={useRole !== "Admin"} />
          </Form.Item>
          <Form.Item
            label="Hướng dẫn bảo quản"
            name="preserveGuide"
            hasFeedback
          >
            <Input.TextArea readOnly={useRole !== "Admin"} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        centered
        width={"90%"}
        open={addVariant}
        title={"Thêm thông tin sản phẩm: " + addVariant?.name}
        onOk={() => {
          setAddVariant(null);
        }}
        onCancel={() => {
          setAddVariant(null);
        }}
        okText="Xong"
        cancelText="Đóng"
      >
        <div>
          {useRole === "Admin" && (
            <Form
              form={createForm2}
              name="create-form2"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              initialValues={{ remember: true }}
              onFinish={onComplete}
              onFinishFailed={onFinishFailed}
              autoComplete="on"
            >
              <>
                <Form.Item
                  label="Màu"
                  name="colorId"
                  rules={[{ required: true, message: "Hãy chọn một màu!" }]}
                >
                  <Select
                    showSearch
                    optionFilterProp="children"
                    value={colors}
                    style={{
                      width: 300,
                    }}
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Divider
                          style={{
                            margin: "4px 0",
                          }}
                        />
                        <Space
                          style={{
                            padding: "0 4px 2px",
                          }}
                        >
                          <Button
                            type="text"
                            icon={<PlusOutlined />}
                            onClick={showModal}
                          >
                            Thêm màu mới
                          </Button>
                        </Space>
                      </>
                    )}
                    virtual
                    optionHeight={20}
                  >
                    {colors.map((color, index) => (
                      <Select.Option key={color._id} value={color._id}>
                        <span
                          style={{
                            backgroundColor: color.hexcode[0].hex,
                            display: "inline-block",
                            width: "10px",
                            height: "10px",
                            marginRight: "3px",
                          }}
                        />
                        {color.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Modal
                  open={isModalVisible}
                  onCancel={() => {
                    setRefresh((f) => f + 1);
                    setIsModalVisible(false);
                  }}
                  onOk={() => {
                    setRefresh((f) => f + 1);
                    setIsModalVisible(false);
                  }}
                >
                  <ColorForm />
                </Modal>
                <Form.Item
                  label="Giá"
                  name="price"
                  rules={[
                    {
                      required: true,
                      message: "Hãy nhập giá bán!",
                    },
                  ]}
                >
                  <Input type="number" min={0} style={{ width: 150 }} />
                </Form.Item>
                <Form.Item label="Giảm giá" name="discount">
                  <Input
                    type="number"
                    step={0.01}
                    min={0}
                    max={100}
                    style={{ width: 100 }}
                  />
                </Form.Item>
              </>

              <Form.Item label="Hình minh họa" name="files">
                <Upload {...props}>
                  <Button icon={<PlusOutlined />}>Tải lên</Button>
                </Upload>
              </Form.Item>
              <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit" block>
                  Thêm
                </Button>
              </Form.Item>
            </Form>
          )}

          <Table
            rowKey="_id"
            dataSource={pVariants}
            columns={variants}
            scroll={{ y: 500 }}
          />
          <Modal
            centered
            open={selectVariant}
            title="Cập nhật thông tin"
            onOk={() => {
              updateForm2.submit();
            }}
            onCancel={() => {
              setSelectVariant(null);
              message.warning("Các thay đổi chưa được lưu");
            }}
            okText="Lưu thông tin"
            cancelText="Đóng"
          >
            <Form
              form={updateForm2}
              name="update-form2"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              initialValues={{ remember: true }}
              onFinish={onUpdateVariant}
              onFinishFailed={onUpdateFinishFailed}
              autoComplete="on"
            >
              <>
                <Form.Item
                  label="Màu"
                  name="colorId"
                  rules={[{ required: true, message: "Hãy chọn một màu!" }]}
                >
                  <Select
                    showSearch
                    optionFilterProp="children"
                    value={colors}
                    style={{
                      width: 300,
                    }}
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Divider
                          style={{
                            margin: "4px 0",
                          }}
                        />
                        <Space
                          style={{
                            padding: "0 4px 2px",
                          }}
                        >
                          <Button
                            type="text"
                            icon={<PlusOutlined />}
                            onClick={showModal}
                          >
                            Thêm màu mới
                          </Button>
                        </Space>
                      </>
                    )}
                    virtual
                    optionHeight={20}
                  >
                    {colors.map((color, index) => (
                      <Select.Option key={color._id} value={color._id}>
                        <span
                          style={{
                            backgroundColor: color.hexcode[0].hex,
                            display: "inline-block",
                            width: "10px",
                            height: "10px",
                            marginRight: "3px",
                          }}
                        />
                        {color.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Modal
                  open={isModalVisible}
                  onCancel={() => {
                    setRefresh((f) => f + 1);
                    setIsModalVisible(false);
                  }}
                  onOk={() => {
                    setRefresh((f) => f + 1);
                    setIsModalVisible(false);
                  }}
                >
                  <ColorForm />
                </Modal>
                <Form.Item
                  label="Giá"
                  name="price"
                  rules={[
                    {
                      required: true,
                      message: "Hãy nhập giá bán!",
                    },
                  ]}
                >
                  <Input type="number" min={0} style={{ width: 150 }} />
                </Form.Item>
                <Form.Item label="Giảm giá" name="discount">
                  <Input
                    type="number"
                    step={0.01}
                    min={0}
                    max={100}
                    style={{ width: 100 }}
                  />
                </Form.Item>
                <Form.Item label="Hình ảnh" name="imageUrl">
                  {selectVariant &&
                    imageUrls.map((image, index) => {
                      return (
                        <Space>
                          <Image
                            preview
                            width={60}
                            style={{ marginLeft: 5 }}
                            key={image}
                            src={`${API_URL}${image}`}
                          />
                          <Popconfirm
                            style={{ width: 800 }}
                            title="Bạn có chắc chắn muốn xóa không?"
                            onConfirm={() => {
                              setRefresh((f) => f + 1);
                              // DELETE
                              const updatedOrderItems = [...imageUrls];
                              updatedOrderItems.splice(index, 1); // Xóa sản phẩm khỏi danh sách
                              setImageUrls(updatedOrderItems);
                            }}
                            onCancel={() => {}}
                            okText="Đồng ý"
                            cancelText="Đóng"
                          >
                            <Button
                              danger
                              type="dashed"
                              icon={<DeleteOutlined />}
                            />
                          </Popconfirm>
                        </Space>
                      );
                    })}
                </Form.Item>
              </>
            </Form>
          </Modal>
        </div>
      </Modal>
      <Modal
        centered
        width={"50%"}
        open={addSize}
        title="Thêm kích cỡ và số lượng"
        onOk={() => {
          setAddSize(null);
        }}
        onCancel={() => {
          setAddSize(null);
        }}
        okText="Xong"
        cancelText="Đóng"
      >
        <div>
          {useRole === "Admin" && (
            <Form
              form={createForm3}
              name="create-form3"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              initialValues={{ remember: true }}
              onFinish={onAddSize}
              onFinishFailed={onFinishFailed}
              autoComplete="on"
            >
              <Form.Item
                label="Size"
                name="sizeId"
                rules={[
                  {
                    required: true,
                    message: "Hãy chọn một kích cỡ!",
                  },
                ]}
              >
                <Select
              showSearch
              optionFilterProp="children"
              value={sizes}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider
                    style={{
                      margin: "4px 0",
                    }}
                  />
                  <Space
                    style={{
                      padding: "0 4px 2px",
                    }}
                  >
                    <Input
                      placeholder="Nhập kích cỡ mới"
                      value={newSize}
                      onChange={onNewSize}
                    />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setRefresh((f) => f + 1);
                        axiosClient
                          .post("/sizes", { size: newSize })
                          .then((response) => {
                            message.success(
                              "Đã thêm " +
                                newSize +
                                " vào danh mục kích cỡ"
                            );
                            setRefresh((f) => f + 1);
                            setNewSize(null);
                          })
                          .catch((err) => {
                            message.error(
                              "Thêm thất bại, kích cỡ này đã tồn tại!"
                            );
                          });
                        setRefresh((f) => f + 1);
                      }}
                    >
                      Thêm mới
                    </Button>
                  </Space>
                </>
              )}
              virtual
              optionHeight={20}
            >
              {sizes.map((size, index) => (
                <Select.Option key={size._id} value={size._id}>
                  {size.size}
                </Select.Option>
              ))}
            </Select>
              </Form.Item>
              <Form.Item
                label="Số lượng"
                name="quantity"
                rules={[
                  {
                    required: true,
                    message: "Hãy nhập số lượng!",
                  },
                ]}
              >
                <Input type="number" min={0} style={{ width: 100 }} />
              </Form.Item>

              <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit" block>
                  Thêm
                </Button>
              </Form.Item>
            </Form>
          )}

          <Table
            rowKey="_id"
            dataSource={vaSizes}
            columns={vSizes}
            scroll={{ y: 500 }}
          />
          <Modal
            centered
            open={selectSize}
            title="Cập nhật thông tin"
            onOk={() => {
              updateForm3.submit();
            }}
            onCancel={() => {
              setSelectSize(null);
              message.warning("Các thay đổi chưa được lưu");
            }}
            okText="Lưu thông tin"
            cancelText="Đóng"
          >
            <Form
              form={updateForm3}
              name="update-form3"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              initialValues={{ remember: true }}
              onFinish={onUpdateSize}
              onFinishFailed={onUpdateFinishFailed}
              autoComplete="on"
            >
              <Form.Item
                label="Size"
                name="sizeId"
                rules={[
                  {
                    required: true,
                    message: "Hãy chọn một kích cỡ!",
                  },
                ]}
              >
                <Select
              showSearch
              optionFilterProp="children"
              value={sizes}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider
                    style={{
                      margin: "4px 0",
                    }}
                  />
                  <Space
                    style={{
                      padding: "0 4px 2px",
                    }}
                  >
                    <Input
                      placeholder="Nhập kích cỡ mới"
                      value={newSize}
                      onChange={onNewSize}
                    />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setRefresh((f) => f + 1);
                        axiosClient
                          .post("/sizes", { size: newSize })
                          .then((response) => {
                            message.success(
                              "Đã thêm " +
                                newSize +
                                " vào danh mục kích cỡ"
                            );
                            setRefresh((f) => f + 1);
                            setNewSize(null);
                          })
                          .catch((err) => {
                            message.error(
                              "Thêm thất bại, kích cỡ này đã tồn tại!"
                            );
                          });
                        setRefresh((f) => f + 1);
                      }}
                    >
                      Thêm mới
                    </Button>
                  </Space>
                </>
              )}
              virtual
              optionHeight={20}
            >
              {sizes.map((size, index) => (
                <Select.Option key={size._id} value={size._id}>
                  {size.size}
                </Select.Option>
              ))}
            </Select>
              </Form.Item>
              <Form.Item
                label="Số lượng"
                name="quantity"
                rules={[
                  {
                    required: true,
                    message: "Hãy nhập số lượng!",
                  },
                ]}
              >
                <Input type="number" min={0} style={{ width: 100 }} />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </Modal>
    </div>
  );
}
