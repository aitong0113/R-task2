import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'


// 換成你自己的 API_PATH(在 .env 檔案裡設定)
const API_BASE = import.meta.env.VITE_API_BASE
const API_PATH = import.meta.env.VITE_API_PATH

const App = () => {
  // 登入表單資料
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  // 確認是否登入
  const [isAuth, setIsAuth] = useState(false)
  // 從API拿回產品資料
  const [products, setProducts] = useState([])
  // 使用者目前點選的那一筆產品
  const [tempProduct, setTempProduct] = useState(null)

  // 先宣告工具 抓取產品資料 getProducts
  const getProducts = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products`
      )
      setProducts(res.data.products)
    } catch {
      alert('登入失敗，請確認帳密')
    }
  }



// 確認登入是否成功 checkLogin
const checkLogin = async () => {
  try {
    //從 cookie 裡「把 token 拿出來」
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('hexToken='))
      ?.split('=')[1]

    if (!token) return
    // 帶著 token 去跟 API 要驗證
    axios.defaults.headers.common.Authorization = token
    await axios.post(`${API_BASE}/api/user/check`)
    setIsAuth(true)
    getProducts()
  } catch {
    alert('登入失敗，請確認帳密')
  }
}



//  useEffect：做「畫面以外的事」｜ [] ：只在元件第一次出現時執行
useEffect(() => {
  checkLogin()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])



/* ========= 表單處理 ========= */
const handleInputChange = (e) => {
  const { id, value } = e.target
  setFormData({
    ...formData,
    [id]: value,
  })
}

/* ========= 登入送出：取得 token ========= */
const handleSubmit = async (e) => {
  e.preventDefault()
  // 確保畫面能跑後，註解掉下面的 模擬登入
  // setIsAuth(true) 

  try {
    const res = await axios.post(
      `${API_BASE}/admin/signin`,
      {
        username: formData.username,
        password: formData.password,
      }
    )

    const { token, expired } = res.data

    // 存 token 到 cookie
    document.cookie = `hexToken=${token}; expires=${new Date(expired)}`

    // 登入成功後，立刻驗證登入狀態
    checkLogin()
  } catch {
    alert('登入失敗，請確認帳密')
  }
}


/* ========= 登出功能 ========= */
const handleLogout = () => {
  document.cookie = 'hexToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT;'
  delete axios.defaults.headers.common.Authorization

  setIsAuth(false)
  setProducts([])
  setTempProduct(null)
}

return (
  <>
    {isAuth ? (
      /* ================= 登入後：產品頁 ================= */
      <div className="container">

        {/*  登出按鈕：全域操作，放最上層 */}
        <div className="d-flex justify-content-end mt-3">
          <button
            className="btn btn-outline-secondary"
            onClick={handleLogout}
          >
            登出
          </button>
        </div>

        <div className="row mt-5">
          {/* 產品列表 */}
          <div className="col-md-6">
            <h2>產品列表</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>產品名稱</th>
                  <th>原價</th>
                  <th>售價</th>
                  <th>是否啟用</th>
                  <th>查看細節</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.origin_price}</td>
                      <td>{item.price}</td>
                      <td>{item.is_enabled ? '啟用' : '未啟用'}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setTempProduct(item)}
                        >
                          查看細節
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      尚無產品資料
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 單一產品細節 */}
          <div className="col-md-6">
            <h2>單一產品細節</h2>
            {tempProduct ? (
              <div className="card mb-3">
                <img
                  src={tempProduct.imageUrl}
                  className="card-img-top"
                  alt="主圖"
                />
                <div className="card-body">
                  <h5 className="card-title">
                    {tempProduct.title}
                    <span className="badge bg-primary ms-2">
                      {tempProduct.category}
                    </span>
                  </h5>
                  <p>商品描述：{tempProduct.description}</p>
                  <p>商品內容：{tempProduct.content}</p>
                  <p>
                    <del>{tempProduct.origin_price}</del> 元 /{' '}
                    {tempProduct.price} 元
                  </p>

                  <h6 className="mt-3">更多圖片：</h6>
                  <div className="d-flex flex-wrap">
                    {tempProduct.imagesUrl?.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt="副圖"
                        className="me-2 mb-2"
                        style={{ width: '100px' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-secondary">請選擇一個商品查看</p>
            )}
          </div>
        </div>
      </div>
    ) : (
      /* ================= 未登入：登入頁 ================= */
      <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center">
        <div
          className="card shadow p-5 w-100"
          style={{ maxWidth: '960px' }}
        >
          <h1 className="h4 mb-4 text-center">請先登入</h1>

          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                id="username"
                placeholder="name@example.com"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="username">Email address</label>
            </div>

            <div className="form-floating mb-4">
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="password">Password</label>
            </div>

            <button className="btn btn-primary w-100" type="submit">
              登入
            </button>
          </form>

          <p className="mt-4 mb-0 text-muted text-center small">
            &copy; 六角學院 React Week2
          </p>
        </div>
      </div>
    )}
  </>
)
}

export default App