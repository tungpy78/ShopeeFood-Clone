import axiosClient from "./axiosClient";

export const uploadService = {
    uploadImage: async (imageUri: string) => {
        const formData = new FormData();

        formData.append('image', {
            uri: imageUri,
            name: 'avatar.jpg',
            type: 'image/jpeg',
        } as any);

        const res = await axiosClient.post('/upload', formData, {
            headers:{
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data.imageUrl;
    }
}