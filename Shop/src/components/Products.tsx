import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Form,
  InputNumber,
  Menu,
  Radio,
  Row,
  message,
} from "antd";
import { AiOutlineCheck } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { BsCartPlus } from "react-icons/bs";
import axios from "axios";
import numeral from "numeral";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { API_URL } from "../constants/URLS";
interface Variant {
  colorId: any;
  price: number;
  discount: number;
  sizes: Size[];
  imageUrl: string[];
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
}

function Products(): JSX.Element {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState<Details | null>({
    _id: "",
    name: "",
    variants: [],
    color: [],
    size: [],
    stockByColor: {},
    stock: 0,
  });
  const [categoryId, setCategoryId] = useState([]);
  const [category, setCategory] = useState("");
  const dispatch = useDispatch();
  const [selectedColor, setSelectedColor] = useState<Variant | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [index2, setIndex2] = useState<number | null>();
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const cart = useSelector((state: any) => state.cart);
  let navigate = useNavigate();

  useEffect(() => {
    axios.get(API_URL+"/products/").then((response) => {
      setProducts(response.data);
    });
  }, []);

  useEffect(() => {
    axios
      .post(API_URL+"/products/category", { categoryId: category })
      .then((response) => {
        setProducts(response.data);
      });
    axios.get(API_URL+"/categories/").then((response) => {
      setCategoryId(response.data);
    });
  }, [category]);
  const handleColorChange = (colorId: any) => {
    const color = product?.variants.find((v: any) => v.colorId === colorId);
    product?.variants.find((v: any, index: any) => {
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

  const handleMouseOver = (itemId: any) => {
    setHoveredItemId(itemId);
  };

  const AddToCart = async () => {
    const data = {
      productId: product?._id,
      name: product?.name,
      imageUrl: product?.variants[index2 ?? 0].imageUrl[0],
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
  const handleDetail = (itemId: any) => {
    navigate("/products/" + itemId);
  };


  return (
    <div>
      <Row
        gutter={[16, 16]}
        style={{
          display: "flex",
          justifyContent: "space-center",
        }}
      >
        <Col span={4} style={{ height: "100vh", overflowY: "auto" }}>
          <Menu
          className="ant-select-selection"
            style={{
              width: "100%",
              height: "100%",
            }}
            placeholder="Danh mục sản phẩm"
            selectedKeys={[category]}
            onSelect={(value: any) => {
              setCategory(value.key);
            }}
          ><Menu.Item key={""}>
              Tất cả
          </Menu.Item>
          <hr style={{marginTop: -5, marginBottom: -5}} />
            {categoryId &&
              categoryId.map((c: any) => {
                return (
                  <>
                  <Menu.Item key={c._id}>
                    {c.name}
                  </Menu.Item>
                  <hr style={{marginTop: -5, marginBottom: -5}} />
                  </>
                );
              })}
          </Menu>
        </Col>
        <Col span={20}>
          <Row
            gutter={[20, 20]}
            style={{ display: "flex", flexWrap: "wrap", marginLeft: 10 }}
          >
            {products &&
              products.map((p: any) => (
                <Col
                  key={p._id}
                  span={8}
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Card
                    className="ant-select-selection"
                    style={{ width: 350, border: "none" }}
                    hoverable
                    onMouseOver={(e: any) => {
                      setProduct(p);
                    }}
                    onMouseLeave={(e: any) => {
                      setProduct(null);
                      setSelectedColor(null);
                      setSelectedSize(null);
                    }}
                    cover={
                      <div style={{ position: "relative" }} key={p._id}>
                        <img
                          onClick={() => handleDetail(p._id)}
                          alt={p.name}
                          src={
                            API_URL +
                            p.variants[index2 ?? 0]?.imageUrl[0]
                          }
                          style={{
                            objectFit: "cover",
                            height: "100%",
                            width: "100%",
                          }}
                        />
                        <div
                          style={{ opacity: hoveredItemId === p._id ? 1 : 0 }}
                          className="view-add-to-cart"
                          onMouseOver={(e: any) => {
                            e.currentTarget.style.opacity = 1;
                          }}
                          onMouseLeave={(e: any) => {
                            e.currentTarget.style.opacity = 0;
                            setSelectedColor(null)
                            setIndex2(null);
                          }}
                        >
                          <div style={{ textAlign: "center" }}>
                            {p && (
                              <>
                                {selectedColor && (
                                  <>
                                    <div
                                      style={{
                                        padding: "0px 0px",
                                        marginTop: -1,
                                      }}
                                    >
                                      {p?.variants[index2 ?? 0]?.discount !==
                                        0 && (
                                        <span
                                          className="mr-3 origin"
                                          style={{
                                            textDecoration: "line-through",
                                            fontSize: "10px",
                                          }}
                                        >
                                          {numeral(
                                            p?.variants[index2 ?? 0]?.price
                                          ).format("0,0$")}
                                        </span>
                                      )}
                                      <span
                                        className="sale"
                                        style={{
                                          color: "red",
                                          fontSize: "13px",
                                        }}
                                      >
                                        {" "}
                                        {numeral(
                                          (p.variants[index2 ?? 0]?.price *
                                            (100 -
                                              p.variants[index2 ?? 0]
                                                ?.discount)) /
                                            100
                                        ).format("0,0$")}
                                      </span>
                                    </div>
                                  </>
                                )}
                                <Form.Item
                                  // label="Màu sắc"
                                  style={{
                                    marginLeft: 5,
                                    marginTop: 0,
                                    marginBottom: 5,
                                  }}
                                >
                                  <Radio.Group
                                    style={{ marginLeft: -30 }}
                                    size="small"
                                    value={
                                      selectedColor
                                        ? selectedColor.colorId
                                        : undefined
                                    }
                                    onChange={(e) =>
                                      handleColorChange(e.target.value)
                                    }
                                  >
                                    {p.variants.map(
                                      (variant: any, index: any) => (
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
                                          disabled={
                                            p.stockByColor[variant.colorId] ===
                                            0
                                          }
                                        >
                                          <span
                                            style={{
                                              backgroundColor:
                                                p.color[index].hexcode[0].hex,
                                              display: "inline-block",
                                              width: "25px",
                                              height: "25px",
                                              borderRadius: "50%",
                                            }}
                                          >
                                            <AiOutlineCheck
                                              style={
                                                index2 === index
                                                  ? {}
                                                  : {
                                                      color:
                                                        p.color[index]
                                                          .hexcode[0].hex,
                                                    }
                                              }
                                            />
                                          </span>
                                        </Radio.Button>
                                      )
                                    )}
                                  </Radio.Group>
                                </Form.Item>
                                {
                                  <>
                                    <Form.Item
                                      // label="Kích cỡ"
                                      style={{
                                        marginLeft: 5,
                                        marginTop: -5,
                                        marginBottom: 0,
                                      }}
                                    >
                                      <Radio.Group
                                        style={{ marginLeft: -3 }}
                                        size="small"
                                        value={
                                          selectedSize
                                            ? selectedSize.sizeId
                                            : undefined
                                        }
                                        onChange={(e) =>
                                          handleSizeChange(e.target.value)
                                        }
                                      >
                                        {p?.size[index2 ?? 0]?.map(
                                          (size: any, index: any) => {
                                            return (
                                              <Radio.Button
                                                style={{
                                                  width: "30px",
                                                  height: "25px",
                                                  marginInline: 10,
                                                  backgroundColor:
                                                    p.color[index2 ?? 0]
                                                      .hexcode[0].hex,
                                                  borderRadius: "10%",
                                                  textAlign: "center",
                                                }}
                                                key={size._id}
                                                value={size._id}
                                                disabled={
                                                  p.variants[index2 ?? 0].sizes[
                                                    index
                                                  ].quantity === 0 ||
                                                  !selectedColor
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
                                        <Form.Item
                                          // label="Số lượng"
                                          style={{
                                            marginLeft: 5,
                                            marginTop: 5,
                                            marginBottom: -20,
                                          }}
                                        >
                                          <InputNumber
                                            disabled={!selectedSize}
                                            type="number"
                                            min={1}
                                            max={selectedSize?.quantity}
                                            value={quantity}
                                            onChange={(value: any) =>
                                              value &&
                                              setQuantity(parseInt(value))
                                            }
                                          />
                                        </Form.Item>
                                        <button
                                          onClick={() => AddToCart()}
                                          disabled={!selectedSize}
                                          id="btn-order"
                                          type="button"
                                          className="btn btn-dark btn-checkout-general w-100 rounded-0 mt-4"
                                        >
                                          {" "}
                                          <BsCartPlus
                                            style={{
                                              alignItems: "center",
                                              marginRight: 8,
                                            }}
                                          />
                                          Thêm vào giỏ hàng
                                        </button>
                                      </>
                                    }
                                  </>
                                }
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    }
                  >
                    <div>
                      <div
                        className="d-flex  justify-content-between gap-5"
                        style={{ marginBottom: 10 }}
                      >
                        <span
                          onClick={() => handleDetail(p._id)}
                          onMouseOver={(e: any) =>
                            (e.target.style.color = "orange")
                          }
                          onMouseLeave={(e: any) =>
                            (e.target.style.color = "black")
                          }
                        >
                          <strong>{p.name}</strong>
                        </span>
                        <span>
                          Kho: <strong>{p.stock}</strong>{" "}
                        </span>
                      </div>
                      {(() => {
                        const priceRange = p.variants.reduce(
                          (result: any, variant: any) => {
                            const price = variant.price;
                            if (!result) {
                              result = { min: price, max: price };
                            } else {
                              result.min = Math.min(result.min, price);
                              result.max = Math.max(result.max, price);
                            }
                            return result;
                          },
                          null
                        );
                        if (priceRange.max !== priceRange.min) {
                          return (
                            <div>
                              <p>
                                Giá: {numeral(priceRange.min).format("0,0$")} -{" "}
                                {numeral(priceRange.max).format("0,0$")}
                              </p>
                            </div>
                          );
                        } else {
                          return (
                            <div>
                              <p>
                                Giá: {numeral(priceRange.max).format("0,0$")}
                              </p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                    <div
                      onMouseOver={() => handleMouseOver(p._id)}
                      onMouseLeave={() => handleMouseOver(null)}
                    >
                      <span>+ {p.variants.length} màu sắc</span>
                    </div>
                  </Card>
                </Col>
              ))}
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default Products;
