import { ActivityIndicator, Alert, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import bg from "../assets/images/phở.jpg";
import { COLORS } from "./src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useAuth } from "./src/context/AuthContext";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "./src/types/api.types";
import { AuthService } from "./src/services/auth.service";

export default function LoginScreen() {
    const [loading, setLoading] = useState(false);
    const [phone, setPhone] = useState('');
    const [password, setPasswork] =useState('');

    const { login } = useAuth();

    const handleLogin = async () => {
        if(!phone.trim() || !password.trim()){
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ số điện thoại và mật khẩu!');
            return;
        }
        setLoading(true);
        try {
            const res = await AuthService.login(phone, password);
            const userData = res.data.user

            if(userData.role !== 2){
                Alert.alert(
                    'Sai ứng dụng', 
                    'Tài khoản này không phải là Khách hàng. Vui lòng dùng ứng dụng dành cho Chủ Quán/Tài Xế!'
                );
                return; // Dừng lại ngay, không lưu token
            }
            

            await login(res.data.user, res.data.token);

            if (router.canGoBack()) {
                router.back(); // Quay lại trang trước (vd: Giỏ hàng)
            } else {
                router.replace('/'); // Trở về trang chủ
            }

        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            Alert.alert(
                'Đăng nhập thất bại', 
                err.response?.data?.message || 'Lỗi kết nối đến máy chủ. Vui lòng thử lại!'
            );
        }finally{
            setLoading(false)
        }
    }


    return (
        <KeyboardAvoidingView
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ImageBackground
                source={bg}
                style={styles.bgcontainer}
                resizeMode="cover"
                blurRadius={4}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity style={styles.btnCLose} onPress={() => router.back()}>
                        <Ionicons name="close" size={28} color={COLORS.white}/>
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="restaurant" size={50} color={COLORS.primary}/>
                        </View>
                        <Text style={styles.title}>Chào mừng trở lại!</Text>
                        <Text style={styles.subTitle}>Đăng nhập để đặt những món ăn ngon nhất.</Text>
                    </View>
                    
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Ionicons name="call-outline" size={20} color={COLORS.textLight} style={styles.icon}/>
                            <TextInput 
                                style={styles.input}
                                placeholder="Số điện thoại"
                                keyboardType="phone-pad"
                                value={phone}
                                onChangeText={setPhone}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} style={styles.icon}/>
                            <TextInput 
                                style={styles.input}
                                placeholder="Mật khẩu"  
                                secureTextEntry={true}
                                value={password}
                                onChangeText={setPasswork}
                            />
                        </View>

                        <TouchableOpacity style={styles.forgotPassBtn}>
                            <Text style={styles.forgotPassText}>Quên mật khẩu?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                        style={[styles.loginBtn, loading && { opacity: 0.7 }]}
                        onPress={handleLogin}
                        disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.white}/>
                            ):(
                                <Text style={styles.loginBtnText}>Đăng nhập</Text>
                            )}
                        </TouchableOpacity>

                    </View>
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Bạn chưa có tài khoản? </Text>
                        <TouchableOpacity onPress={() => router.push('/register')}>
                            <Text style={styles.registerText}>Đăng ký ngay</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>

            </ImageBackground>

        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
    },
    bgcontainer:{
        flex:1,
    },
    scrollContainer:{
        flexGrow: 1, padding: 20, justifyContent: 'center'
    },
    btnCLose:{
        position: "absolute", top:50, left:20, zIndex:10
    },
    header:{alignItems:"center", marginTop: 40, marginBottom:40},
    logoContainer:{width:70, height:70, backgroundColor:"white", justifyContent:"center", alignItems:"center", borderRadius:12},
    title:{fontSize: 28, fontWeight:"bold", color:COLORS.white, marginBottom:10},
    subTitle:{fontSize:16, color:COLORS.white, alignItems:"center"},
    form:{width:"100%",},
    inputContainer:{
        flexDirection:"row", alignItems:"center",
        paddingHorizontal:15, paddingVertical:8, backgroundColor:"#F5F5F8", marginBottom:10, borderRadius:24
    },
    icon:{
        marginRight: 10
    },
    input: { flex: 1, fontSize: 16, color: COLORS.text },
    forgotPassBtn:{alignItems:"flex-end", marginBottom:30},
    forgotPassText:{color:COLORS.white, fontSize:14, fontWeight:"600"},
    loginBtn:{alignItems:"center", backgroundColor: COLORS.primary, height: 55, justifyContent:"center", borderRadius:12,
        shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5
    },
    loginBtnText:{color:COLORS.white, fontSize:18, fontWeight:"bold"},
    footer:{alignItems:"center", marginTop:20},
    footerText:{fontSize:15, color:COLORS.white},
    registerText: { color: COLORS.white, fontSize: 15, fontWeight: 'bold' }
});