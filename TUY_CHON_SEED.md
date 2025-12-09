 CÁC CÁCH CHẠY SEED DATA

## LỆNH CHẠY SEED

### Cách 1: Dùng npm script (KHUYÊN DÙNG)

```bash
cd backend
npm run seed
```

---

###  Cách 2: Dùng file .bat (Windows)

**Windows:**
```bash
cd backend
seed.bat
```
Hoặc double-click vào file `backend/seed.bat`

---

### Cách 3: Dùng file .sh (Mac/Linux)

```bash
cd backend
chmod +x seed.sh
./seed.sh
```

---

### Cách 4: Chạy trực tiếp bằng Node

```bash
cd backend
node src/utils/seed.js
```

---

## TRƯỚC KHI CHẠY SEED

1. ✅ **Đã tạo file `.env`** trong thư mục `backend/`
2. ✅ **Đã điền `MONGO_URI`** trong file `.env`
3. ✅ **Đã cài đặt dependencies:** `npm install`

---

## SAU KHI CHẠY SEED

Sẽ tạo:
- ✅ 2 tài khoản: `admin/admin123` và `staff/staff123`
- ✅ 6 danh mục sản phẩm
- ✅ 14 sản phẩm mẫu

Bạn có thể đăng nhập ngay! 🎉

---



