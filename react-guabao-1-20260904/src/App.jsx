import React, { useState, useEffect } from 'react';
import './App.css';

// const API_BASE = 'http://localhost:8080/api';
const API_BASE = '/api';

const ITEMS = [
  { name: '綜合割包', price: 70 },
  { name: '赤肉割包', price: 70 },
  { name: '焢肉割包', price: 70 },
  { name: '魚丸湯', price: 55 },
  { name: '貢丸湯', price: 55 },
  { name: '八寶湯', price: 80 }
];

export default function App() {
  const [currentCard, setCurrentCard] = useState('LOGIN_CARD');
  const [sysTime, setSysTime] = useState('');

  const [currentUser, setCurrentUser] = useState(null);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  const [empList, setEmpList] = useState([]);
  const [empId, setEmpId] = useState('');
  const [empPass, setEmpPass] = useState('');
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('一般權限');

  const [itemQuantities, setItemQuantities] = useState([0, 0, 0, 0, 0, 0]);
  const [memCardNo, setMemCardNo] = useState('');
  const [memPoints, setMemPoints] = useState('');
  const [currentMember, setCurrentMember] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const format = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + ' ' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0');
      setSysTime(format);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async () => {
    if (!loginUser || !loginPass) return alert('請輸入帳號與密碼！');
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: loginUser, password: loginPass })
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        alert(`登入成功！歡迎 ${user.name}`);
        loadEmployeeTable();
      } else {
        alert('帳號或密碼錯誤！');
      }
    } catch (err) {
      alert('資料庫連線錯誤！');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginUser('');
    setLoginPass('');
    setCurrentCard('LOGIN_CARD');
    alert('已登出系統！');
  };

  const loadEmployeeTable = async () => {
    try {
      const res = await fetch(`${API_BASE}/employees`);
      if (res.ok) {
        const data = await res.json();
        setEmpList(data);
      }
    } catch (e) {}
  };

  const handleEmpAdd = async () => {
    if (!empId || !empPass || !empName) return alert('所有欄位皆為必填！');
    const res = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: empId, password: empPass, name: empName, role: empRole })
    });
    if (res.ok) {
      alert('新增員工成功！');
      loadEmployeeTable();
    } else alert('新增失敗(帳號可能重複)');
  };

  const handleEmpUpdate = async () => {
    if (!empId) return alert('請指定員工帳號！');
    const res = await fetch(`${API_BASE}/employees/${empId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: empPass, name: empName, role: empRole })
    });
    if (res.ok) {
      alert('修改員工成功！');
      loadEmployeeTable();
    } else alert('找不到該員工帳號！');
  };

  const handleEmpDelete = async () => {
    if (!empId) return alert('請指定員工帳號！');
    if (!window.confirm('確定要刪除此員工？')) return;
    const res = await fetch(`${API_BASE}/employees/${empId}`, { method: 'DELETE' });
    if (res.ok) {
      alert('刪除員工成功！');
      loadEmployeeTable();
    } else alert('找不到該員工帳號！');
  };

  const changeQty = (idx, delta) => {
    const updated = [...itemQuantities];
    updated[idx] = Math.max(0, updated[idx] + delta);
    setItemQuantities(updated);
  };

  const calcTotal = () => itemQuantities.reduce((acc, q, i) => acc + q * ITEMS[i].price, 0);
  const calcCount = () => itemQuantities.reduce((acc, q) => acc + q, 0);

  const handleMemLogin = async () => {
    if (!memCardNo) return alert('請輸入會員卡號！');
    try {
      const res = await fetch(`${API_BASE}/members/${memCardNo}`);
      if (res.ok) {
        const mem = await res.json();
        setCurrentMember(mem);
        setMemPoints(mem.totalPoints !== undefined ? mem.totalPoints : mem.points);
      } else {
        alert('查無此會員！');
      }
    } catch (e) {
      alert('資料庫連線錯誤！');
    }
  };

  // 修正：新增會員功能
const handleMemAdd = async () => {
  if (!memCardNo) return alert('請輸入會員卡號！');
  try {
    const pts = parseInt(memPoints, 10) || 0;
    
    // 1. 建立會員 (預設 0 點)
    const res = await fetch(`${API_BASE}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: memCardNo })
    });

    if (res.ok) {
      // 2. 若輸入框有設定點數且大於 0，自動觸發更新點數
      if (pts > 0) {
        await fetch(`${API_BASE}/members/${memCardNo}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ total_points: pts })
        });
      }
      alert('新增會員成功！');
      handleMemLogin();
    } else {
      alert('新增失敗 (會員卡號可能已存在)！');
    }
  } catch (err) {
    alert('資料庫連線錯誤！');
  }
};


// 修正：修改點數功能 (完全對齊 GuaBao4Controller.java 規格)
const handleMemUpdatePoints = async () => {
  if (!memCardNo) return alert('請輸入會員卡號！');
  if (memPoints === '' || isNaN(memPoints)) return alert('請輸入有效的累積點數！');

  const newPoints = parseInt(memPoints, 10);

  try {
    const res = await fetch(`${API_BASE}/members/${memCardNo}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        total_points: newPoints 
      })
    });

    if (res.ok) {
      alert('修改點數成功！');
      if (currentMember) {
        setCurrentMember({ 
          ...currentMember, 
          memberId: memCardNo,
          totalPoints: newPoints,
          points: newPoints 
        });
      } else {
        handleMemLogin(); // 重新載入會員最新狀態
      }
    } else if (res.status === 404) {
      alert('修改失敗 (查無此會員)！');
    } else {
      alert('修改失敗，請確認輸入格式！');
    }
  } catch (err) {
    alert('資料庫連線或網路錯誤！');
  }
};

  // 修正：刪除會員功能
  const handleMemDelete = async () => {
    if (!memCardNo) return alert('請輸入要刪除的會員卡號！');
    if (!window.confirm(`確定要刪除會員 [${memCardNo}] 嗎？`)) return;

    try {
      const res = await fetch(`${API_BASE}/members/${memCardNo}`, { method: 'DELETE' });
      if (res.ok) {
        alert('刪除會員成功！');
        setCurrentMember(null);
        setMemCardNo('');
        setMemPoints('');
      } else {
        alert('刪除失敗 (查無此會員)！');
      }
    } catch (err) {
      alert('資料庫連線錯誤！');
    }
  };

  const handleCheckout = async () => {
    const total = calcTotal();
    if (total === 0) return alert('購物車內無商品，無法進行結帳！');
    if (!window.confirm(`應付總金額為 $${total} 元，確定要進行結帳嗎？`)) return;

    const items = ITEMS.map((item, idx) => ({
      itemName: item.name,
      unitPrice: item.price,
      quantity: itemQuantities[idx]
    })).filter(i => i.quantity > 0);

    const res = await fetch(`${API_BASE}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberId: currentMember ? currentMember.memberId : null,
        totalAmount: total,
        items: items
      })
    });

    if (res.ok) {
      const data = await res.json();
      let msg = `結帳成功！\n訂單編號: ${data.orderId}`;
      if (currentMember) {
        msg += `\n本次消費獲得新積點: ${data.earnedPoints} 點。`;
        if (data.giftCount > 0) {
          msg += `\n\n恭喜！會員總點數已達標！\n系統自動扣除 ${data.giftCount * 10} 點，【免費贈送綜合割包 ${data.giftCount} 個】！`;
        }
        handleMemLogin();
      }
      alert(msg);
      setItemQuantities([0, 0, 0, 0, 0, 0]);
    } else {
      alert('結帳失敗！');
    }
  };

  const handlePrintDetail = () => {
    const detailContent = renderDetailText();
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>好家割包總店 - 點餐明細列印</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace, "微軟正黑體";
              white-space: pre-wrap;
              font-size: 14px;
              padding: 20px;
              line-height: 1.4;
            }
          </style>
        </head>
        <body>${detailContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const renderDetailText = () => {
    const total = calcTotal();
    let text = `--- 好家割包總店 點餐明細 ---\n`;
    text += `購買時間: ${sysTime}\n`;
    text += currentMember 
      ? `會員卡號: ${currentMember.memberId} (現有積點: ${currentMember.totalPoints !== undefined ? currentMember.totalPoints : currentMember.points} 點)\n`
      : `會員卡號: 無(非會員消費)\n`;
    text += `==========================================\n`;
    text += `品項\t\t單價\t數量\t小計\n`;
    text += `------------------------------------------\n`;
    ITEMS.forEach((item, i) => {
      if (itemQuantities[i] > 0) {
        const sub = itemQuantities[i] * item.price;
        text += `${item.name}\t$${item.price}\t${itemQuantities[i]}\t$${sub}\n`;
      }
    });
    text += `------------------------------------------\n`;
    text += `商品總計數量: ${calcCount()} 件\n`;
    text += `本次消費預計可得新積點: ${Math.floor(total / 100)} 點\n`;
    text += `應付總金額: $${total} 元\n`;
    text += `==========================================\n`;
    return text;
  };

  return (
    <div className="swing-window">
      {/* 1. 登入視窗 */}
      {currentCard === 'LOGIN_CARD' && (
        <div>
          <div className="main-title">好家割包總店 點餐系統登入</div>
          <div className="time-label">時間: {sysTime}</div>

          <div className="login-box">
            <div className="login-row">
              <label>帳號:</label>
              <input value={loginUser} onChange={e => setLoginUser(e.target.value)} />
            </div>
            <div className="login-row">
              <label>密碼:</label>
              <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} />
            </div>
          </div>

          <div className={`login-status-center ${currentUser ? 'status-logged-in' : 'status-logged-out'}`}>
            {currentUser ? `登入員工: ${currentUser.name} [${currentUser.role}]` : '[ 員工未登入 ]'}
          </div>

          <div className="login-btn-group">
            <button className="btn-swing btn-green" onClick={handleLogin}>員工登入</button>
            <button className="btn-swing btn-red" onClick={handleLogout} disabled={!currentUser}>員工登出</button>
            <button className="btn-swing btn-yellow" onClick={() => setCurrentCard('ORDER_CARD')} disabled={!currentUser}>進入點餐</button>
            <button className="btn-swing btn-purple" onClick={() => setCurrentCard('MGMT_CARD')} disabled={!currentUser || currentUser.role !== '最高權限'}>員工管理</button>
          </div>
        </div>
      )}

      {/* 2. 後台員工管理 */}
      {currentCard === 'MGMT_CARD' && (
        <div>
          <div className="main-title">好家割包總店 員工管理</div>
          <div className="time-label">時間: {sysTime}</div>
          <div className="user-status-label status-logged-in">
            登入員工: {currentUser?.name || '頭家1'} [{currentUser?.role || '最高權限'}]
          </div>

          <div className="mgmt-container">
            <fieldset className="swing-fieldset mgmt-left-panel">
              <legend>員工資料維護</legend>
              <div className="form-row">
                <label>員工帳號:</label>
                <input value={empId} onChange={e => setEmpId(e.target.value)} />
              </div>
              <div className="form-row">
                <label>員工密碼:</label>
                <input type="password" value={empPass} onChange={e => setEmpPass(e.target.value)} />
              </div>
              <div className="form-row">
                <label>員工姓名:</label>
                <input value={empName} onChange={e => setEmpName(e.target.value)} />
              </div>
              <div className="form-row">
                <label>員工權限:</label>
                <select value={empRole} onChange={e => setEmpRole(e.target.value)}>
                  <option value="一般權限">一般權限</option>
                  <option value="最高權限">最高權限</option>
                </select>
              </div>

              <div className="mgmt-btn-grid">
                <button className="btn-swing btn-green" onClick={handleEmpAdd}>新增</button>
                <button className="btn-swing btn-orange" onClick={loadEmployeeTable}>查詢</button>
                <button className="btn-swing btn-skin" onClick={handleEmpUpdate}>修改</button>
                <button className="btn-swing btn-red" onClick={handleEmpDelete}>刪除</button>
              </div>
            </fieldset>

            <div className="mgmt-table-panel">
              <table className="swing-table">
                <thead>
                  <tr>
                    <th>員工帳號</th>
                    <th>員工姓名</th>
                    <th>員工權限</th>
                  </tr>
                </thead>
                <tbody>
                  {empList.map((emp) => (
                    <tr 
                      key={emp.employeeId} 
                      className={empId === emp.employeeId ? 'selected' : ''}
                      onClick={() => {
                        setEmpId(emp.employeeId);
                        setEmpName(emp.name);
                        setEmpRole(emp.role);
                        setEmpPass(emp.password || '');
                      }}
                    >
                      <td>{emp.employeeId}</td>
                      <td>{emp.name}</td>
                      <td>{emp.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mgmt-bottom-bar">
            <button className="btn-swing btn-yellow" onClick={() => setCurrentCard('ORDER_CARD')}>返回點餐系統</button>
          </div>
        </div>
      )}

      {/* 3. 前台點餐系統 */}
      {currentCard === 'ORDER_CARD' && (
        <div>
          <div className="main-title">★ 好家割包總店 點餐系統 ★</div>
          <div className="time-label">時間: {sysTime}</div>
          <div className="user-status-label status-logged-in">
            登入員工: {currentUser?.name || '頭家1'} [{currentUser?.role || '最高權限'}]
          </div>

          <div className="order-top-container">
            <fieldset className="swing-fieldset goods-panel">
              <legend>商品點購區</legend>
              {ITEMS.map((item, i) => (
                <div className="goods-row" key={i}>
                  <span className="goods-name">{item.name} ({item.price}元)</span>
                  <button 
                    className="btn-swing btn-red btn-qty" 
                    disabled={itemQuantities[i] === 0}
                    onClick={() => changeQty(i, -1)}
                  >-</button>
                  <span className="goods-qty-num">{itemQuantities[i]}</span>
                  <button 
                    className="btn-swing btn-yellow btn-qty"
                    onClick={() => changeQty(i, 1)}
                  >+</button>
                </div>
              ))}
            </fieldset>

            <fieldset className="swing-fieldset detail-panel">
              <legend>點餐明細框</legend>
              <textarea className="detail-textarea" value={renderDetailText()} readOnly />
            </fieldset>
          </div>

          <fieldset className="swing-fieldset member-panel">
            <legend>會員中心框</legend>
            <div className="member-rule-text">
              提示: 會員消費100元增加1點, 集滿10點贈送綜合割包1個
            </div>
            <div className="member-inputs">
              <label>會員卡號:</label>
              <input style={{ width: '120px' }} value={memCardNo} onChange={e => setMemCardNo(e.target.value)} />
              <label style={{ marginLeft: '15px' }}>累積點數:</label>
              {/* 移除 readOnly，允許直接在輸入框調整點數進行修改 */}
              <input style={{ width: '80px' }} value={memPoints} onChange={e => setMemPoints(e.target.value)} />
            </div>
            <div className="member-btn-group">
              <button className="btn-swing btn-green" onClick={handleMemLogin}>會員登入</button>
              <button className="btn-swing btn-red" onClick={() => { setCurrentMember(null); setMemCardNo(''); setMemPoints(''); }}>會員登出</button>
              <button className="btn-swing btn-yellow" onClick={handleMemAdd}>新增會員</button>
              <button className="btn-swing btn-skin" onClick={handleMemLogin}>查詢點數</button>
              <button className="btn-swing btn-purple" onClick={handleMemUpdatePoints}>修改點數</button>
              <button className="btn-swing btn-red" onClick={handleMemDelete}>刪除會員</button>
            </div>
          </fieldset>

          <div className="order-bottom-bar">
            <button className="btn-swing btn-red" style={{ width: '130px' }} onClick={handleLogout}>員工登出</button>
            <button className="btn-swing btn-skin" style={{ width: '130px' }} onClick={() => setItemQuantities([0, 0, 0, 0, 0, 0])}>清除明細</button>
            <button className="btn-swing btn-purple" style={{ width: '130px' }} onClick={handlePrintDetail}>列印 PDF</button>
            <button className="btn-swing btn-green" style={{ width: '150px' }} onClick={handleCheckout}>確認結帳</button>
          </div>
        </div>
      )}
    </div>
  );
}