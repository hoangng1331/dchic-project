import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Form, Radio, InputNumber, Button, Image, message } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import numeral from "numeral";
import { AiOutlineCheck } from "react-icons/ai";
import Carousel from "react-bootstrap/Carousel";
import { API_URL } from "../constants/URLS";

interface Variant {
  colorId: any;
  price: number;
  discount: number;
  sizes: Size[];
  imageUrl: any[];
}

interface Size {
  sizeId: any;
  quantity: number;
}

interface Color {
  name: any;
  hexcode: any[];
}

interface Details {
  _id: any;
  name: string;
  variants: Variant[];
  color: Color[];
  size: Size[][];
  stockByColor: Record<string, number>;
  stock: number;
  description: string;
  preserveGuide: string;
}

function DetailProduct(): JSX.Element {
  const dispatch = useDispatch();
  const cart = useSelector((state: any) => state.cart);
  const { itemId } = useParams<{ itemId: string }>();
  const [detail, setDetail] = useState<Details>({
    _id: "",
    name: "",
    variants: [],
    color: [],
    size: [],
    stockByColor: {},
    stock: 0,
    description: "",
    preserveGuide: "",
  });
  const [variants, setVariants] = useState<any[]>([]);
  const [name, setName] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<Variant | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [index2, setIndex2] = useState<number | null>();
  const [isPreview, setIsPreview] = useState<boolean>(false);

  useEffect(() => {
    axios
      .get<Details>(API_URL+"/products/" + itemId)
      .then((response: any) => {
        setDetail(response.data);
        setVariants(response.data.variants);
        setName(response.data.name);
      });
  }, [itemId]);
  const handleColorChange = (colorId: any) => {
    const color = detail.variants.find((v: any) => v.colorId === colorId);
    detail.variants.find((v: any, index: any) => {
      if (v.colorId === colorId) {
        setIndex2(index);
      }
    });
    setSelectedColor(color ?? null);
    setSelectedSize(null);
    setQuantity(1);
  };

  const handleSizeChange = (sizeId: any) => {
    const size = selectedColor?.sizes.find((s) => s.sizeId === sizeId);
    setSelectedSize(size ?? null);
    setQuantity(1);
  };

  const AddToCart = async () => {
    const data = {
      productId: detail._id,
      name: detail.name,
      imageUrl: detail.variants[index2 ?? 0].imageUrl[0],
      quantity,
      colorId: selectedColor?.colorId,
      price: selectedColor?.price,
      discount: selectedColor?.discount,
      sizeId: selectedSize?.sizeId,
    };
    const exist = cart.find(
      (item: any) =>
        item.productId === data.productId &&
        item.colorId === data.colorId &&
        item.sizeId === data.sizeId
    );
    if (exist) {
      const total = exist.quantity + data.quantity;
      const requests = await axios.get(
        `${API_URL}/products/${exist.productId}/variants/${exist.colorId}/sizes/${exist.sizeId}/order`
      );
      if (total > requests.data.quantity) {
        message.error(
          "Tồn kho không đủ, chỉ còn " + requests.data.quantity + " sản phẩm!"
        );
        return;
      } else {
        dispatch(addToCart(data));
        message.success("Thêm vào giỏ hàng thành công!");
      }
    } else {
      dispatch(addToCart(data));
      message.success("Thêm vào giỏ hàng thành công!");
    }
  };
  return (
    <div className="contentDetail" id="begin-body">
      <div className="row">
        <div className="d-flex justify-content-between form group">
        <div className="col-4 form group" style={{ marginLeft: 30 }}>
          <div className="view-image">
            <Carousel>
              {(variants[index2 ?? 0]?.imageUrl || []).map((image: any) => (
                <Carousel.Item interval={2000}>
                  <Image
                    key={image}
                    onClick={() => {
                      setIsPreview(true);
                    }}
                    className="w-100"
                    style={{
                      cursor: "pointer",
                      padding: "20px",
                      paddingRight: "0px",
                    }}
                    preview={{
                      visible: false,
                    }}
                    src={`${API_URL}/${image}`}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
            <React.Fragment>
              <div style={{ display: "none" }}>
                <Image.PreviewGroup
                  preview={{
                    visible: isPreview,
                    onVisibleChange: (vis) => setIsPreview(vis),
                  }}
                >
                  {(variants[index2 ?? 0]?.imageUrl || []).map((img: any) => (
                    <Image key={img} src={`${API_URL}/${img}`} />
                  ))}
                </Image.PreviewGroup>
              </div>
            </React.Fragment>
          </div>
        </div>
        <div className="col-4 form group">
           <div  style={{ paddingTop: "100px" }}>
            <h6 style={{marginLeft: 20, marginRight: 20}}>Mô tả sản phẩm</h6>
            <hr style={{marginLeft: 10, marginRight: 10}} />
            <span style={{marginLeft: 20, marginRight: 20}}>{detail.description}</span>
           </div>
           <div  style={{ paddingTop: "20px" }}>
            <h6 style={{marginLeft: 20, marginRight: 20}}>Hướng dẫn bảo quản</h6>
            <hr style={{marginLeft: 10, marginRight: 10}} />
            <span style={{marginLeft: 20, marginRight: 20}}>{detail.preserveGuide}</span>
           </div>
        </div>
        <div
          className="col-4 col-md-5 d-flex justify-content-center"
          style={{ paddingTop: "100px", marginLeft: -45 }}
        >
          <div className="text-center">
            <div>
              <div
                className="text-uppercase product-name"
                style={{ padding: "5px 0px", marginRight: 12 }}
              >
                {name}
              </div>
            </div>
            <div
              className="form-check form-check-inline "
              style={{ padding: "5px 0px", textAlign: "center" }}
            >
              {detail && (
                <>
                  {selectedColor && (
                    <>
                      <div
                        className="form-group price-detail"
                        style={{ padding: "5px 0px" }}
                      >
                        {detail.variants[index2 ?? 0].discount !== 0 && (
                          <span
                            className="mr-3 origin"
                            style={{
                              textDecoration: "line-through",
                              margin: "10px",
                              fontSize: "18px",
                            }}
                          >
                            {numeral(detail.variants[index2 ?? 0].price).format(
                              "0,0$"
                            )}
                          </span>
                        )}
                        <span
                          className="sale"
                          style={{ color: "red", fontSize: "20px" }}
                        >
                          {numeral(
                            (detail.variants[index2 ?? 0].price *
                              (100 - detail.variants[index2 ?? 0].discount)) /
                              100
                          ).format("0,0$")}
                        </span>
                      </div>
                      <div>{detail.color[index2 ?? 0].name}</div>
                    </>
                  )}
                  <Form.Item label="Màu sắc" style={{ marginTop: 10 }}>
                    <Radio.Group
                      style={{ marginRight: 100 }}
                      value={selectedColor ? selectedColor.colorId : undefined}
                      onChange={(e) => handleColorChange(e.target.value)}
                    >
                      {detail.variants.map((variant: any, index: any) => (
                        <Radio.Button
                          className="clearBackground"
                          style={{
                            width: "0px",
                            height: "0px",
                            marginInline: 15,
                            border: "none",
                            borderRadius: "50%",
                          }}
                          key={variant.colorId}
                          value={variant.colorId}
                          disabled={detail.stockByColor[variant.colorId] === 0}
                        >
                          {" "}
                          <span
                            style={{
                              backgroundColor:
                                detail.color[index].hexcode[0].hex,
                              display: "inline-block",
                              width: "31px",
                              height: "31px",
                              borderRadius: "50%",
                              border: "1px solid black",
                              borderColor: "black",
                            }}
                          >
                            <AiOutlineCheck
                              style={
                                index2 === index
                                  ? {}
                                  : {
                                      color: detail.color[index].hexcode[0].hex,
                                    }
                              }
                            />
                          </span>
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                  </Form.Item>
                  {
                    <>
                      <Form.Item label="Kích cỡ">
                        <Radio.Group
                          style={{ marginRight: 60 }}
                          value={selectedSize ? selectedSize.sizeId : undefined}
                          onChange={(e) => handleSizeChange(e.target.value)}
                        >
                          {detail?.size[index2 ?? 0]?.map(
                            (size: any, index: any) => {
                              return (
                                <Radio.Button
                                  style={{
                                    width: "50px",
                                    height: "32px",
                                    marginInline: 10,
                                    backgroundColor:
                                      detail.color[index2 ?? 0].hexcode[0].hex,
                                    borderRadius: "0%",
                                  }}
                                  key={size._id}
                                  value={size._id}
                                  disabled={
                                    detail.variants[index2 ?? 0].sizes[index]
                                      .quantity === 0 || !selectedColor
                                  }
                                >
                                  {size.size}
                                </Radio.Button>
                              );
                            }
                          )}
                        </Radio.Group>
                      </Form.Item>
                      {
                        <>
                          <Form.Item label="Số lượng">
                            <InputNumber
                              style={{ marginRight: 70 }}
                              disabled={!selectedSize}
                              type="number"
                              min={1}
                              max={selectedSize?.quantity}
                              value={quantity}
                              onChange={(value: any) =>
                                value && setQuantity(parseInt(value))
                              }
                            />
                          </Form.Item>
                          <Button
                            disabled={!selectedSize}
                            onClick={() => AddToCart()}
                            icon={
                              detail.stock === 0 ? null : (
                                <ShoppingCartOutlined />
                              )
                            }
                          >
                            {detail.stock === 0
                              ? "Sản phẩm đã hết hàng"
                              : "Thêm vào giỏ hàng"}
                          </Button>
                        </>
                      }
                    </>
                  }
                </>
              )}
            </div>
          </div>
        </div>
        </div>        
      </div>
    </div>
  );
}

export default DetailProduct;
