import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Thay bằng 3 key em vừa lấy trên web Cloudinary
cloudinary.config({
  cloud_name: 'dfijojl3a', 
  api_key: '479331588554243', 
  api_secret: 'Q6OVULv9_GLNFtTbc7pPuFXI2bw' 
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shopeefood/merchants',
    allowed_formats: ['jpeg', 'png', 'jpg'] 
  } as any // Ép kiểu any chỗ này vì Type của thư viện storage-cloudinary thỉnh thoảng bắt lỗi lặt vặt
});

const uploadCloud = multer({ storage });

export default uploadCloud;