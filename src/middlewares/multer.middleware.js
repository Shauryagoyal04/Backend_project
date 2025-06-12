import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    
    cb(null, file.originalname)//might be bad as if there are multiple files with same name but not very significant in this case as the file is going to be there for small time and then will get uploaded to cloudinary
  }
})

export const upload = multer({
     storage,
})