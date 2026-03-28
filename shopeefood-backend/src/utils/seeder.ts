import { Role } from '../models';

export const seedRoles = async () => {
  try {
    // 1. Đếm xem bảng Role có dữ liệu chưa
    const count = await Role.count();

    // 2. Nếu chưa có gì (count == 0) thì tạo mới
    if (count === 0) {
      await Role.bulkCreate([
        { id: 1, name: 'Admin' },
        { id: 2, name: 'Customer' },
        { id: 3, name: 'Driver' },
        { id: 4, name: 'Merchant' }
      ]);
      console.log('🌱 Seeded Roles successfully!');
    } else {
      console.log('🌱 Roles already exist, skipping seed.');
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
};