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

- The server will run on `http://localhost:8000`. You can test with public endpoint: `http://localhost:8000/products` (GET method).

## Modify your data

All the data was placed in `database.json`. Edit it to suit your purpose but keep object `users` to use authentication feature.

You can use [https://mockaroo.com/](https://mockaroo.com/) to mock data, and publish your code to [https://heroku.com/](https://heroku.com/) or similar hosting to get a Public API.

**Note**:

- To protect resources, decleare resources and protected methods in `database.json`:

http://localhost:8000/api/auth/dang-nhap-co-so-kham-chua-benh
http://localhost:8000/api/v1/them-bac-si