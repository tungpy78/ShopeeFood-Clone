import type { ApiResponse } from "../types/api.type";
import type { OptionGroup } from "../types/option.type";
import axiosClient from "./axiosClient";

export const optionGroupService = {
    deleteOptionGroup:(id: number) => axiosClient.delete<any, ApiResponse<null>>(`/option-groups/${id}`),
    updateOptionGroup:(group_id: number, data:OptionGroup) => axiosClient.put<any, ApiResponse<OptionGroup>>(`/option-groups/${group_id}`,data)
}   