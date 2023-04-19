import formidable from "formidable";
import {copyFile, unlink} from "fs/promises";
import { isAuthenticated, isAuthenticatedFacility,isAuthenticatedDoctors } from '../utils/jwt-authenticate.js';
import {
  generateAccessToken,
  generateRefreshToken,
  decodeRefreshToken,
} from "../utils/jwt-authenticate.js";



const handleUploadFile = async (req, file) => {
  const uploadFolder = "uploads";

  try {
    // Copy file from temp folder to uploads folder (not rename to allow cross-device link)
    await copyFile(file.filepath, `./public/${uploadFolder}/${file.originalFilename}`);

    // Remove temp file
    await unlink(file.filepath);

    // Return new path of uploaded file
    file.filepath = `${req.protocol}://${req.get("host")}/${uploadFolder}/${file.name}`;

    return file;
  } catch (err) {
    throw err;
  }
};

export const testHandler = (db, req, res) => {
  res.jsonp("Hello world!");
};

export const medicalFacilityHandler = (db, req, res) => {
  const {ma_lien_thong_co_so_kham_chua_benh, password:pwd} = req.body;

  const medicalFacilitys = db.data.medicalFacility.find(
    (u) => u.ma_lien_thong_co_so_kham_chua_benh === ma_lien_thong_co_so_kham_chua_benh && u.password === pwd
  );

  const findIndex = db.data.medicalFacility.findIndex(
    (u) => u.ma_lien_thong_co_so_kham_chua_benh === ma_lien_thong_co_so_kham_chua_benh && u.password === pwd
  );

  if (medicalFacilitys && medicalFacilitys.password === pwd) {
    const accessToken = generateAccessToken(medicalFacilitys.id);
    const refreshToken = generateRefreshToken(medicalFacilitys.id);
    const {password, ...userWithoutPassword} = medicalFacilitys;

    res.jsonp({
      ...userWithoutPassword,
      accessToken,
      refreshToken,
    });

    db.data.medicalFacility[findIndex].accessToken=accessToken;
    const exp = Date.now()+7;
    db.data.medicalFacility[findIndex].accessToken=accessToken;
    db.data.medicalFacility[findIndex].expDate=exp;
    db.write();

  } else {
    console.log("nvp: req::: Username or password is incorrect!");
    res.status(400).jsonp({message: "Username or password is incorrect!"});
  }
};

export const doctorLoginHandler = (db, req, res) => {
  const {ma_lien_thong_co_so_kham_chua_benh, ma_lien_thong_bac_si, password:pwd} = req.body;

  const doctor = db.data.doctors.find(
    (u) => u.ma_lien_thong_bac_si === ma_lien_thong_bac_si && u.password === pwd
  );

  if (!doctor) {
    console.log("nvp: req::: Doctor Code or password is incorrect!");
    res.status(400).jsonp({message: "Doctor Code or password is incorrect!"});
    return
  }
  const findIndex = db.data.doctors.findIndex(
    (u) => u.ma_lien_thong_bac_si === ma_lien_thong_bac_si && u.password === pwd
  );

  const checkFound = db.data.medicalFacility_doctors.find(
    (u) => u.ma_lien_thong_co_so_kham_chua_benh === ma_lien_thong_co_so_kham_chua_benh && u.ma_lien_thong_bac_si === ma_lien_thong_bac_si
  );

  if (!checkFound) {
    console.log("nvp: req::: Doctor not found in medical facility, complete step add doctor before login, please!");
    res.status(400).jsonp({message: "Doctor not found in medical facility, complete step add doctor before login, please!"});
    return
  }

  
    const accessToken = generateAccessToken(doctor.id);
    const refreshToken = generateRefreshToken(doctor.id);
    const {password, ...userWithoutPassword} = doctor;

    res.jsonp({
      ...userWithoutPassword,
      accessToken,
      refreshToken,
    });

    db.data.doctors[findIndex].accessToken=accessToken;
    const exp = Date.now()+7;
    db.data.doctors[findIndex].accessToken=accessToken;
    db.data.doctors[findIndex].expDate=exp;
    db.write();
};


export const loginHandler = (db, req, res) => {
  // console.log("nvp: req:::", req.body);
  // console.log("nvp: req:::", req.body.ma_lien_thong_co_so_kham_chua_benh);
  
  const {username, email, password: pwd} = req.body;

  const user = db.data.users.find(
    (u) => (u.username === username || u.email === email) && u.password === pwd
  );

  if (user && user.password === pwd) {
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    const {password, ...userWithoutPassword} = user;

    res.jsonp({
      ...userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } else {
    res.status(400).jsonp({message: "Username or password is incorrect!"});
  }
};
export const addDoctorHandler = (db, req, res) => {
  console.log("nvp: req > body:::", req.body);
  console.log("nvp: req > headers:::", req.headers);
  let tokenAuth = isAuthenticatedFacility(req);

  if (tokenAuth != false && tokenAuth != "") {
    const {ma_lien_thong_bac_si : doctorCode} = req.body;
    const {facilutyAccessToken} = req.headers;
    const medicalFacility_doctors = db.data.medicalFacility_doctors;
  
    const medical = db.data.medicalFacility.find(
      (u) => u.id === tokenAuth.sub
    );
  
    if (!medical) {
      res.status(400).jsonp({
        message: "Medical Facility not found!",
      });
      return;
    }
  
    // if (auth.expDate <= Date.now()){
    //   res.status(400).jsonp({
    //     message: "Token expired!",
    //   });
    //   return;
     
    // }  
  
    if (!doctorCode) {
      res.status(400).jsonp({message: "ma_lien_thong_bac_si null!"});
      return;
    }
  
    const existDoctor = medicalFacility_doctors.find((doctor) => doctor.ma_lien_thong_bac_si === doctorCode && doctor.ma_lien_thong_co_so_kham_chua_benh === medical.ma_lien_thong_co_so_kham_chua_benh);
  
    if (existDoctor) {
      res.status(400).jsonp({
        message: "The doctor already exists. Please use a different doctor!",
      });
      return;
    }
  
    let maxId = 0;
    for (let u of medicalFacility_doctors) {
      if (u.id > maxId) {
        maxId = u.id;
      }
    }
    const newDoctors = {id: maxId + 1, ma_lien_thong_bac_si: doctorCode, ma_lien_thong_co_so_kham_chua_benh: medical.ma_lien_thong_co_so_kham_chua_benh};
  
    medicalFacility_doctors.push(newDoctors);
    db.write();
  
    res.jsonp(newDoctors);
  } else {
    res.sendStatus(401);
  }
};

export const sendPrescriptionHandler = (db, req, res) => {
  // console.log("sendPrescriptionHandler > body :: ", req.body);
  // console.log("nvp: sendPrescriptionHandler > headers:::", req.headers);
  let tokenAuth = isAuthenticatedDoctors(req);
// console.log("nvp: tokenAuth:: ",tokenAuth);
  if (tokenAuth != false && tokenAuth != "") {
    const {
      loai_don_thuoc
      ,ma_don_thuoc
      ,ho_ten_benh_nhan
      ,ma_dinh_danh_y_te
      ,ma_dinh_danh_cong_dan
      ,ngay_sinh_benh_nhan
      ,can_nang
      ,gioi_tinh
      ,ma_so_the_bao_hiem_y_te
      ,thong_tin_nguoi_giam_ho
      ,dia_chi
      ,chan_doan
      ,luu_y
      ,hinh_thuc_dieu_tri
      ,dot_dung_thuoc
      ,thong_tin_don_thuoc
      ,loi_dan
      ,so_dien_thoai_nguoi_kham_benh
      ,ngay_tai_kham
      ,ngay_gio_ke_don
      ,signature
    } = req.body;
    const prescriptionDB = db.data.prescription;
  
    const index = prescriptionDB.findIndex(
      (u) => u.ma_don_thuoc === ma_don_thuoc
    );
  
    if (index !== -1) {
      res.status(400).jsonp({
        message: "The prescription already exists, please choose another code or select the edit prescription function if you want to update the data for PrescriptionCode: "+ma_don_thuoc+" !",
      });
      return;
    }
  
    
    const newPrescription = {
      loai_don_thuoc:loai_don_thuoc
      ,ma_don_thuoc:ma_don_thuoc
      ,ho_ten_benh_nhan:ho_ten_benh_nhan
      ,ma_dinh_danh_y_te:ma_dinh_danh_y_te
      ,ma_dinh_danh_cong_dan:ma_dinh_danh_cong_dan
      ,ngay_sinh_benh_nhan:ngay_sinh_benh_nhan
      ,can_nang:can_nang
      ,gioi_tinh:gioi_tinh
      ,ma_so_the_bao_hiem_y_te:ma_so_the_bao_hiem_y_te
      ,thong_tin_nguoi_giam_ho:thong_tin_nguoi_giam_ho
      ,dia_chi:dia_chi
      ,chan_doan:chan_doan
      ,luu_y:luu_y
      ,hinh_thuc_dieu_tri:hinh_thuc_dieu_tri
      ,dot_dung_thuoc:dot_dung_thuoc
      ,thong_tin_don_thuoc:thong_tin_don_thuoc
      ,loi_dan:loi_dan
      ,so_dien_thoai_nguoi_kham_benh:so_dien_thoai_nguoi_kham_benh
      ,ngay_tai_kham:ngay_tai_kham
      ,ngay_gio_ke_don:ngay_gio_ke_don
      ,signature:signature
    };
  
    prescriptionDB.push(newPrescription);
    db.write();
  
    res.jsonp({"success":"Gửi đơn thuốc thành công"});
  } else {
    res.status(401).jsonp({
      message: "Authorization is incorrect or has expired!",
    });
  }
};

export const renewTokenHandler = (req, res) => {
  const {refreshToken} = req.body;

  if (refreshToken) {
    try {
      const payload = decodeRefreshToken(refreshToken);
      const accessToken = generateAccessToken(payload.sub);

      res.jsonp({
        accessToken,
      });
    } catch (error) {
      res.status(400).jsonp({error});
    }
  } else {
    res.status(400).jsonp({message: "Refresh Token is invalid!"});
  }
};

export const registerHandler = (db, req, res) => {
  const {username, email, password} = req.body;
  const users = db.data.users;

  if (!password && (!email || !username)) {
    res.status(400).jsonp({message: "Please input all required fields!"});
    return;
  }

  const existUsername = users.find((user) => username && user.username === username);

  if (existUsername) {
    res.status(400).jsonp({
      message: "The username already exists. Please use a different username!",
    });
    return;
  }

  const existEmail = users.find((user) => email && user.email === email);

  if (existEmail) {
    res.status(400).jsonp({
      message: "The email address is already being used! Please use a different email!",
    });
    return;
  }

  let maxId = 0;
  for (let u of users) {
    if (u.id > maxId) {
      maxId = u.id;
    }
  }
  const newUser = {id: maxId + 1, ...req.body};

  users.push(newUser);
  db.write();

  res.jsonp(newUser);
};

export const uploadFileHandler = (req, res) => {
  if (req.headers["content-type"] === "application/json") {
    res.status(400).jsonp({message: 'Content-Type "application/json" is not allowed.'});
    return;
  }

  const form = formidable();

  form.parse(req, async (error, fields, files) => {
    let file = files.file;

    if (error || !file) {
      res.status(400).jsonp({message: 'Missing "file" field.'});
      return;
    }

    try {
      file = await handleUploadFile(req, file);
      res.jsonp(file);
    } catch (err) {
      console.log(err);
      res.status(500).jsonp({message: "Cannot upload file."});
    }
  });
};

export const uploadFilesHandler = (req, res) => {
  if (req.headers["content-type"] === "application/json") {
    res.status(400).jsonp({message: 'Content-Type "application/json" is not allowed.'});
    return;
  }

  const form = formidable({multiples: true});

  form.parse(req, async (error, fields, files) => {
    let filesUploaded = files.files;

    if (error || !filesUploaded) {
      res.status(400).jsonp({message: 'Missing "files" field.'});
      return;
    }

    // If user upload 1 file, transform data to array
    if (!Array.isArray(filesUploaded)) {
      filesUploaded = [filesUploaded];
    }

    try {
      // Handle all uploaded files
      filesUploaded = await Promise.all(
        filesUploaded.map(async (file) => {
          try {
            file = await handleUploadFile(req, file);
            return file;
          } catch (err) {
            throw err;
          }
        })
      );

      res.jsonp(filesUploaded);
    } catch (err) {
      console.log(err);
      res.status(500).jsonp({message: "Cannot upload files."});
    }
  });
};

export const socketEmit = (io, req, res) => {
  io.emit("socket-emit", req.body);
  res.jsonp({msg: "Message sent over websocket connection"});
};
