import { Router } from 'express';
import authRouter from './auth.routes';
import merchantRouter from './merchant.routes';
import orderRouter from './order.routes';
import driverRouter from './driver.routes';
import adminRouter from './admin.routes';
import statisticRouter from './statistic.routes';
import uploadRouter from './upload.routes';
import customerRouter from './customers.routes';
import optionGroup from './optiongroups.routes';

const rootRouter = Router();

// Khai báo các nhánh chính
rootRouter.use('/auth', authRouter); 
rootRouter.use('/merchants', merchantRouter); // <--- Thêm dòng này
rootRouter.use('/option-groups',optionGroup);
rootRouter.use('/customers', customerRouter)
rootRouter.use('/orders', orderRouter); // Thêm dòng này
rootRouter.use('/drivers', driverRouter);
rootRouter.use('/admin', adminRouter);
rootRouter.use('/stats', statisticRouter);
rootRouter.use('/upload', uploadRouter);

export default rootRouter;