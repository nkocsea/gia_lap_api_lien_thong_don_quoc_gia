clone from https://github.com/robinhuy/fake-api-nodejs.git
## Getting started

### 1. Clone this repository

```bash
git clone https://github.com/nkocsea/gia_lap_api_lien_thong_don_quoc_gia.git
```

or fork to your account and clone the forked repo

### 2. Install dependencies

```bash
cd gia_lap_api_lien_thong_don_quoc_gia
npm install
```

or if you using yarn

```bash
cd gia_lap_api_lien_thong_don_quoc_gia
yarn install
```

### 3. Run server

- Production mode:

  ```bash
  npm start
  ```

  or

  ```bash
  yarn start
  ```

- The server will run on `http://localhost:8000`.

## Modify your data

All the data was placed in `database.json`. Edit it to suit your purpose but keep object `users` to use authentication feature.

### Test with Postman

install and import file: GiaLapToaThuocQuocGia.postman_collection.json
## URL test with Postman

### 1. Login 
Request methods: post

http://localhost:8000/api/auth/dang-nhap-co-so-kham-chua-benh


Body : x-www-form-urlendcoded

key = ma_lien_thong_co_so_kham_chua_benh

value = MF0001

key = password

value = 12345

Data Response : => warning :  accessToken Expires 60 Minutes

```{
    "id": 1,
    "name": "Mã cơ sở khám chửa bệnh số 1",
    "ma_lien_thong_co_so_kham_chua_benh": "MF0001",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTY4MTI4OTYwNCwiZXhwIjoxNjgxMjkzMjA0fQ.dh1DdzTPHS9FisMJkKLC__da36NDELmyqtfxkU_97-k",
    "expDate": 1609483221000,
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTY4MTI4OTYwNCwiZXhwIjoxNjgxODk0NDA0fQ.eiuxGedn1Xxji4gn_uDgK7-KiN3OtDXBa-zufKokHsA"
}
```

### 2. add doctor
Request methods: post

http://localhost:8000/api/v1/them-bac-si

Body : x-www-form-urlendcoded

key = ma_lien_thong_bac_si

value = BS001

Authorization : 

Type = Bearer Token

Token = accessToken (get from /api/auth/dang-nhap-co-so-kham-chua-benh)

Data Response :

```{
    "id": 2,
    "ma_lien_thong_bac_si": "BS001",
    "ma_lien_thong_co_so_kham_chua_benh": "MF0001"
}
```

### 2. remove doctor
Request methods: post

http://localhost:8000/api/v1/xoa-bac-si

Body : row

{
   "doctorCode": "BS2000"
}

Authorization : 

Type = Bearer Token

Token = accessToken (get from /api/auth/dang-nhap-co-so-kham-chua-benh)

Data Response :

```{
     "success": "Bạn đã xóa bác sĩ khỏi cơ sở khám chữa bệnh thành công",
}
```