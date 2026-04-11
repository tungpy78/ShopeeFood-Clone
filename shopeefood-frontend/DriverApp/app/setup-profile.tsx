import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS } from "./src/constants/theme";
import { useAuth } from "./src/context/AuthContext";
import { useState } from "react";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "./src/types/api.types";
import { driverService } from "./src/services/driver.service";
import { router } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import { uploadService } from "./src/services/upload.service";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SetupProfileScreen() {
    const { checkAuth } = useAuth(); // Gọi lại hàm này để load lại thông tin user có status mới
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [fullName, setFullName] = useState('');
    const [vehiclePlate, setVehiclePlate] = useState('');
    const [idCard, setIdCard] = useState('');
    const [dob, setDob] = useState(''); // Tạm thời nhập chuỗi YYYY-MM-DD
    const [avatarUri, setAvatarUri] = useState<string | null>(null);

    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const onChangeDate = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }

        if (selectedDate) {
            setDate(selectedDate);
            // Format ngày sang chuẩn YYYY-MM-DD để gửi xuống Backend
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setDob(formattedDate);
        }
    }

    const pickImage = async () =>{
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1,1], // Bắt buộc cắt ảnh hình vuông
            quality: 0.5, //Nén ảnh lại 50% cho nhẹ
        })

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setAvatarUri(result.assets[0].uri);
        }
    }

    const handleSubmit = async () => {
        if(!fullName || !vehiclePlate || !idCard || !dob){
            Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ các trường!');
            return;
        }

        setLoading(true);

        try {
            const cloudinaryUrl = await uploadService.uploadImage(avatarUri);

            await driverService.setupProfile({
                full_name: fullName,
                vehicle_plate: vehiclePlate,
                id_card: idCard,
                date_of_birth: dob,
                avatar: cloudinaryUrl
            });

            Alert.alert('Thành công', 'Hồ sơ đã được gửi để xét duyệt!', [
                {
                    text: 'OK', 
                    onPress: async () => {
                        // Load lại Auth Context để cập nhật status mới và chuyển trang
                        await checkAuth();
                        router.replace('/(tabs)'); 
                    }
                }
            ]);
            
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>
            console.log("Error", err)
            Alert.alert('Lỗi', err.response?.data.message || 'Không thể cập nhật hồ sơ!');
        }finally {
            setLoading(false);
        }
    }
    

    return (
        // 1. Thẻ View gốc bọc ngoài cùng (Fix lỗi màu nền)
        <View style={styles.container}>
            <KeyboardAvoidingView 
                style={styles.keyboardView} 
                // 🔥 BÍ QUYẾT: Chỉ dùng 'padding' cho iOS, Android để undefined
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView 
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled" // 🔥 Chạm ra ngoài để ẩn bàn phím
                >
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                            {avatarUri ? (
                                <Image source={{uri: avatarUri}} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Ionicons name="camera" size={40} color={COLORS.textLight} />
                                    <Text style={styles.avatarText}>Chọn ảnh</Text>
                                </View>
                            )}
                            <View style={styles.editIcon}>
                                <Ionicons name="pencil" size={16} color="white" />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.title}>Hoàn thiện hồ sơ</Text>
                        <Text style={styles.subtitle}>Vui lòng cung cấp thông tin để bắt đầu nhận đơn</Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.label}>Họ và tên tài xế</Text>
                        <TextInput style={styles.input} placeholder="VD: Nguyễn Văn A" value={fullName} onChangeText={setFullName} />

                        <Text style={styles.label}>Biển số xe</Text>
                        <TextInput style={styles.input} placeholder="VD: 59X1-12345" value={vehiclePlate} onChangeText={setVehiclePlate} />

                        <Text style={styles.label}>Số CCCD</Text>
                        <TextInput style={styles.input} placeholder="Nhập 12 số CCCD" keyboardType="numeric" value={idCard} onChangeText={setIdCard} />

                        <Text style={styles.label}>Ngày sinh (YYYY-MM-DD)</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                            <View pointerEvents="none">
                                <TextInput 
                                    style={styles.input} 
                                    placeholder="Chọn ngày sinh của bạn" 
                                    value={dob} 
                                    editable={false} // Chặn không cho gõ phím
                                />
                            </View>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker 
                                value={date}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onChangeDate}
                                maximumDate={new Date()}// Chặn không cho chọn ngày ở tương lai
                            />
                        )}

                        {/* (Chỉ dành cho iOS) Nút "Xong" để đóng popup vì iOS không tự đóng */}
                        {showDatePicker && Platform.OS === 'ios' && (
                            <TouchableOpacity 
                                style={{alignItems: 'flex-end', marginBottom: 10}} 
                                onPress={() => setShowDatePicker(false)}
                            >
                                <Text style={{color: COLORS.primary, fontWeight: 'bold'}}>Xong</Text>
                            </TouchableOpacity>
                        )}
                        

                        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
                            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Gửi hồ sơ xét duyệt</Text>}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    keyboardView: { flex: 1 }, // Thêm class này
    scroll: { padding: 20, flexGrow: 1, justifyContent: 'center' },
    header:{alignItems: "center", marginBottom: 30},
    avatarContainer:{
        width:120, height:120, borderRadius:60,
        backgroundColor:"f0f0f0", justifyContent:"center", alignItems:"center",
        marginBottom: 15, position: 'relative',
        borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed'
    },
    editIcon:{
        position:"absolute", bottom: 0, right: 0,
        backgroundColor: COLORS.primary, width: 32, height: 32,
        borderRadius:16, justifyContent:"center", alignItems:"center",
        borderWidth: 2, borderColor: 'white'
    },
    avatarPlaceholder: { alignItems: 'center' },
    avatarText:{fontSize: 12, color: COLORS.textLight, marginTop: 5},
    avatarImage:{width: 116, height: 116, borderRadius: 58},
    title:{fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginTop: 10},
    subtitle:{fontSize:14, color:COLORS.textLight, textAlign: 'center', marginTop: 5},
    form:{width:"100%"},
    label:{fontSize:14, fontWeight:"600", marginBottom:5, color: COLORS.text},
    input:{padding:15, backgroundColor:"#f5f5f5", borderRadius:12, marginBottom:10},
    submitBtn:{padding: 15, backgroundColor:COLORS.primary, alignItems:"center", borderRadius:24, marginTop:20},
    btnText:{fontSize:16, fontWeight:"bold", color:"white"}
});