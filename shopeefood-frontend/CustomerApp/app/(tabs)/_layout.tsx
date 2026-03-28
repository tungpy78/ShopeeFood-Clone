import { Tabs } from 'expo-router';
import React from 'react';
import { COLORS } from '../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <>
      <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        headerShown: false,
        tabBarStyle:{
          height:60,
          paddingBottom:10,
        }
      }}
      >
        {/* 1. Trang Chủ */}
        <Tabs.Screen 
          name='index'
          options={{
            title: "Trang Chủ",
            tabBarIcon: ({color,size}) => (
              <Ionicons name='home-outline' size={size} color={color}/>
            )
          }}
        />

        {/* 2. Đơn Hàng*/}
        <Tabs.Screen 
          name='orders'
          options={{
            title: "Đơn Hàng",
            tabBarIcon: ({color,size}) => (
              <Ionicons name='document-text-outline' color={color} size={size} />
            )
          }}
        />
        
        {/* 3. Cá Nhân*/}
        <Tabs.Screen 
          name='profile'
          options={{
            title: "Tôi",
            tabBarIcon: ({color,size}) => (
              <Ionicons name='person-outline' color={color} size={size} />
            )
          }}
        />

      </Tabs>
    </>
  );
}
