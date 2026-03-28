import { ApiResponse } from '../types/api.types';
import { Merchant } from '../types/merchant.types';
import axiosClient from './axiosClient';

export const customerService = {
  // Hàm lấy danh sách Quán ăn đang mở cửa
  getMerchants: () => {
    return axiosClient.get<any, ApiResponse<Merchant[]>>('/customers/merchants'); 
  },

  getMerchantMenu: (merchantId: number ) => {
    return axiosClient.get<any, ApiResponse<Merchant>>(`/merchants/${merchantId}`);
  }
};