# ★ 好家割包總店 POS 點餐與會員管理系統 ★

一個基於 **React** 前端與 **Spring Boot** 後端架構開發的擬真 Java Swing 風格 POS 點餐系統。系統提供員工權限管理、前台商品點購、結帳自動計算積點與滿點贈餐，以及完整的會員資料維護功能。

---

## 🚀 系統功能特色

### 1. 員工登入與權限管理
* **安全驗證**：支援員工帳號密碼登入驗證。
* **權限控管**：
  * **一般權限**：可使用前台點餐與會員中心功能。
  * **最高權限**：可存取後台「員工管理」介面，進行員工帳號的 **新增、查詢、修改、刪除 (CRUD)** 運作。

### 2. 前台商品點購與結帳
* **商品數量調整**：即時點選 `+` / `-` 增減點購數量。
* **明細實時預覽**：動態計算商品數量、消費總金額及預計可得點數。
* **自動扣點贈餐**：結帳時消費每滿 100 元可得 1 點；累積滿 10 點系統自動扣除點數並贈送「綜合割包」1 個。
* **獨立明細列印**：支援點擊「列印 PDF」開啟純文字點餐單列印視窗。

### 3. 會員中心管理
* **會員查詢/登入**：輸入卡號查詢現有累積點數。
* **新增會員**：快速建立新會員資料。
* **修改點數**：提供管理人員靈活調整指定會員之累積點數。
* **刪除會員**：支援註銷會員資格。

---

## 🛠️ 技術架構

### 前端 (Frontend)
* **Framework**: React (Vite / JSX)
* **Styling**: Pure CSS (`App.css` 復刻擬真 Java Swing GUI 介面與馬卡龍配色)
* **API Communication**: Fetch API

### 後端 (Backend)
* **Framework**: Java / Spring Boot
* **Database Access**: Spring Data JPA (`EmployeeRepository`, `MemberRepository`, `OrderRepository`, `OrderDetailRepository`)
* **Transaction Control**: `@Transactional` 確保結帳與點數扣減之資料一致性
* **CORS Handling**: 開放 `@CrossOrigin` 支援前端跨域請求

---

## 📡 API 介面規範

核心 RESTful API 路由說明：

### 🔓 認證 API
| HTTP Method | API Path | 描述 | Request Body / Param |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/login` | 員工登入驗證 | `{ "employee_id": "...", "password": "..." }` |

### 👥 員工管理 API (GuaBao4Controller)
| HTTP Method | API Path | 描述 | Request Body / Param |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/employees` | 取得所有員工列表 | - |
| `POST` | `/api/employees` | 新增員工 | `{ "employeeId": "...", "password": "...", "name": "...", "role": "..." }` |
| `PUT` | `/api/employees/{id}` | 修改員工資料 | `{ "password": "...", "name": "...", "role": "..." }` |
| `DELETE` | `/api/employees/{id}` | 刪除指定員工 | - |

### 💳 會員中心 API
| HTTP Method | API Path | 描述 | Request Body / Param |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/members/{id}` | 查詢指定會員資料 | - |
| `POST` | `/api/members` | 新增會員卡號 | `{ "memberId": "..." }` |
| `PUT` | `/api/members/{id}` | 修改會員累積點數 | `{ "total_points": 6 }` |
| `DELETE` | `/api/members/{id}` | 刪除指定會員卡號 | - |

### 🛒 結帳 API
| HTTP Method | API Path | 描述 | Request Body / Param |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/checkout` | 訂單結帳與點數計算 | `{ "memberId": "...", "totalAmount": 470, "items": [...] }` |

---

## 💻 專案安裝與執行

### 1. 後端 (Spring Boot)
1. 確定已安裝 JDK 17+ 及 Maven。
2. 配置資料庫連線設定 (`application.properties` 或 `application.yml`)。
3. 執行主程式啟動服務（預設埠號：`8080`）：
   ```bash
   mvn spring-boot:run
   ```

### 2. 前端 (React + Vite)
進入前端專案目錄：
cd frontend

安裝依賴套件：
npm install

啟動開發伺服器（預設埠號：5173）：
npm run dev

開啟瀏覽器存取 http://localhost:5173。

📝 專案目錄結構
```text
├── src/
│   ├── main/
│   │   ├── java/com/example/demo/
│   │   │   ├── controller/
│   │   │   │   └── GuaBao4Controller.java   # REST Controller
│   │   │   ├── entity/                      # JPA Entities (Employee, Member, Order...)
│   │   │   └── repository/                  # JPA Repositories
│   └── frontend/
│       ├── src/
│       │   ├── App.jsx                      # 主介面與 React 邏輯
│       │   ├── App.css                      # Swing 復刻樣式表
│       │   └── main.jsx                     # 應用程式入口
│       └── vite.config.js                   # Proxy 代理設定
└── README.md
