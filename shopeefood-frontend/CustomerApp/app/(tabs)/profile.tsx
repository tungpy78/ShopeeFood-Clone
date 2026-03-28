import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/constants/theme';
import { router } from 'expo-router';
export default function ProfileScreen() {
  const { isAuthenticated, isLoading, user, logout } = useAuth(); // Lấy biến ra xài

  const handleLogout = async () => {
    await logout();
  }

  if(!isAuthenticated){
    return (
      <View style={styles.guestContainer}>
       <Ionicons name="person-outline" size={100} color={COLORS.primary} />
       <Text style={styles.guestTitle}>Bạn chưa đăng nhập</Text>
        <Text style={styles.guestDesc}>Đăng nhập ngay để xem thông tin cá nhân và nhận nhiều ưu đãi hấp dẫn nhé!</Text>

        <TouchableOpacity 
            style={styles.loginBtn}
            onPress={() => router.push('/login')} // Bấm vào thì nhảy sang Login
        >
            <Text style={styles.loginBtnText}>Đăng nhập / Đăng ký</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return(
    <View style={styles.container}>
        <Text>Xin chào</Text>
        {/* Gọi API  ở đây */}
        <TouchableOpacity onPress={handleLogout}>
          <Text>Đăng Xuất</Text>
        </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  guestContainer:{
    flex:1,
    justifyContent:"center",
    alignItems:"center"
  },
  guestTitle:{
    fontSize:18,
    fontWeight:"bold",
    marginBottom:10
  },
  guestDesc:{fontSize:12, maxWidth:300,textAlign:"center", color:COLORS.textLight},
  loginBtn:{paddingHorizontal:20, paddingVertical:15, backgroundColor:COLORS.primary, borderRadius:12, marginTop:30},
  loginBtnText:{fontSize:16, color:COLORS.white, fontWeight:"bold"},
  container:{flex:1, justifyContent:"center", alignItems:"center"}
})