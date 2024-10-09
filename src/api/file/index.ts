import multer from 'multer';

const upload = multer();

export default app => {
  app.post(`/file/upload`, upload.single('file'), require('./upload').default);
  app.get(`/file/download`, require('./download').default);
};
