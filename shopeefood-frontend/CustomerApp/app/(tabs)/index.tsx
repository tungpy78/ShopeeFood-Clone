
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Merchant } from '../src/types/merchant.types';
import { AxiosError } from 'axios';
import { customerService } from '../src/services/customer.service';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/constants/theme';
import { router } from 'expo-router';
import { ApiErrorResponse } from '../src/types/api.types';
export default function HomeScreen() {
  const [merchant, setMerchant] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  

  const fetchMerchant = async () => {
    try {
      const res = await customerService.getMerchants();
      setMerchant(res.data)
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      // Bóc tách câu báo lỗi từ Backend giống hệt Web
      const errorMessage = err.response?.data?.message ?? "Kết nối máy chủ thất bại";
      
      // Hiển thị Popup lỗi của hệ điều hành iOS/Android
      Alert.alert("Thông báo Lỗi", errorMessage);
    }finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMerchant();
  },[]);


  const renderMerchantItem = ({item} : {item: Merchant }) => (
    <TouchableOpacity
    style={styles.card}
    onPress={() => router.push(`/merchant/${item.account_id}`)}
    >
      <Image 
        source={{uri: item.cover_image}}
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <Text numberOfLines={1} style={styles.name}>{item.name}</Text>

        <View style = {styles.addressRow}>
          <Ionicons name='location-outline' size={14} color={COLORS.primary} />
          <Text numberOfLines={1} style={styles.address}>{item.address}</Text>
        </View>

        <View style={styles.timeRow}>
          <Ionicons name='time-outline' size={14} color={COLORS.primary} />
          <Text style= {styles.time}>{item.open_time.slice(0,5)} - {item.close_time.slice(0,5)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  if(loading){
    return(
      <>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </>
    )
  }

  return(
    <>
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Hôm nay ăn gì?</Text>
      </View>

      <FlatList 
      data={merchant}
      keyExtractor={(item) => item.account_id.toString()}
      renderItem={renderMerchantItem}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      />
    </View>
    </>
  )
}

const styles = StyleSheet.create({
  center:{
    flex: 1,
    justifyContent:"center",
    alignItems:"center"
  },
  container:{
    flex: 1,
    backgroundColor: COLORS.background
  },
  header:{
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white
  },
  headerText:{
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text
  },
  listContainer:{
    padding: 15,
  },
  card:{
    backgroundColor: COLORS.white,
    borderRadius:12,
    marginBottom:5,
    flexDirection:"row",
    overflow: 'hidden',
    // Đổ bóng cho đẹp
    elevation: 3, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image:{
    width: 100,
    height: 100,
  },
  infoContainer:{
    flex: 1,
    padding:10,
    justifyContent:"space-between"
  },
  name:{
    color:COLORS.text,
    fontSize:16,
    fontWeight:"bold"
  },
  addressRow:{
    flexDirection:"row",
    alignItems:"center",
  },
  address:{
    fontSize:13,
    color:COLORS.textLight,
    flex:1,
    marginLeft: 5
  },
  timeRow:{
    flexDirection:"row",
    alignItems:"center"
  },
  time:{
    marginLeft:5,
    color:COLORS.textLight,
    flex:1,
    fontSize:13
  }
})