import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/app/src/constants/theme';
import { formatMoney } from '../utils/format';
import { Food } from '../types/merchant.types';
import { group } from 'node:console';

interface Props {
    visible: boolean;
    food: Food | null;
    onClose: () => void;
    onAddToCart: (food: Food, quantity: number,currentPrice: number, selectedOptions: any, optionsText: string) => void;
}

export default function FoodOptionModal({ visible, food, onClose, onAddToCart }: Props) {
    const [selectedOption, setSelectedOption] = useState<Record<number, number[]>>({});
    const [quantity, setQuantity] = useState(1);

    const toggleOption = (groupId: number, optionId: number, maxChoices: number) => {
        const currentSelectedInGroup = selectedOption[groupId] || [];

        if(maxChoices === 1){
            setSelectedOption({
                ...selectedOption,
                [groupId]: [optionId] // Ghi đè luôn lựa chọn cũ
            });
            return;
        }

        if(currentSelectedInGroup.includes(optionId)){
            setSelectedOption({
                ...selectedOption,
                [groupId]: currentSelectedInGroup.filter(id => id !== optionId)
            });
        }else{
            if(currentSelectedInGroup.length < maxChoices){
                setSelectedOption({
                    ...selectedOption,
                    [groupId]: [...currentSelectedInGroup, optionId]
                });
            }else{
                alert(`Nhóm này chỉ được chọn tối đa ${maxChoices} món!`);
            }
        }
    }

    let currentPrice = Number(food?.price);

    Object.keys(selectedOption).forEach(groupId => {
        const group = food?.option_groups.find(g => g.id === Number(groupId));
        const selectedIds = selectedOption[Number(groupId)];

        selectedIds.forEach(optId => {
            const optionDetail = group?.options.find(o => o.id === optId);
            if(optionDetail){
                currentPrice += Number(optionDetail.price_adjustment);
            }
        });
    });

    const totalPrice = currentPrice * quantity;


    const isDisabled = food?.option_groups.some(group => {
        if (!group.is_mandatory) return false;

        const selected = selectedOption[group.id] || [];

        return selected.length === 0;
    });

    useEffect(() => {
        if(visible){
            setSelectedOption({});
            setQuantity(1);
        }
    },[visible])

    if(!food) return null;

    return (
       <>
       <Modal
       animationType='slide'
       transparent={true}
       visible={visible}
       onRequestClose={onClose}
       >
        <View style={styles.overlay}>
            <View style={styles.bottomSheet}>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <Ionicons name='close' size={24} color={COLORS.text}/>
                </TouchableOpacity>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Image source={{uri: food.image}} style={styles.foodImage} />
                        <View style={styles.foodInfo}>
                            <Text style={styles.foodName}>{food.name}</Text>
                            <Text style={styles.foodDesc}>{food.description}</Text>
                            <Text style={styles.foodPrice}>{formatMoney(food.price)}</Text>
                        </View>
                    </View>

                    {food.option_groups.map(group => (
                        <View key={group.id} style={styles.groupContainer}>
                            <View style={styles.groupHeader}>
                                <Text style={styles.groupName}>{group.name}</Text>
                                <Text style={styles.groupRule}>
                                    {group.is_mandatory ? "Bắt buộc" : "Không bắt buộc"}, chọn tối đa {group.max_choices}
                                </Text>
                            </View>

                            {group.options.map(opt => {
                                const isSelected = (selectedOption[group.id] || []).includes(Number(opt.id));

                                const iconName = group.max_choices === 1
                                    ? (isSelected ? "radio-button-on" : "radio-button-off") // Radio
                                    : (isSelected ? "checkbox" : "square-outline")
                                return(
                                    <TouchableOpacity
                                        key={opt.id}
                                        style={styles.optRow}
                                        onPress={() => toggleOption(group.id, Number(opt.id), group.max_choices)}
                                    >
                                        <View style={styles.optionTextContainer}>
                                            <Text style={styles.optionName}>{opt.name}</Text>
                                            {Number(opt.price_adjustment) > 0 && (
                                                <Text style={styles.optionPrice}>+{formatMoney(opt.price_adjustment)}</Text>
                                            )}
                                        </View>
                                        <Ionicons name={iconName} size={24} color={isSelected ? COLORS.primary : "#ccc"}/>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    ))}
                    {/* Cục Spacer để không bị nút Add To Cart đè lên */}
                    <View style={{ height: 100 }} />

                </ScrollView>
                <View style={styles.footer}>
                    <View style={styles.quantityControl}>
                        <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                            <Ionicons name='remove-circle-outline' size={32} color={COLORS.primary}/>
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{quantity}</Text>
                        <TouchableOpacity onPress={() => setQuantity(quantity+1)}>
                            <Ionicons name='add-circle-outline' size={32} color={COLORS.primary}/>
                        </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity
                    style={[
                        styles.addToCartBtn,
                        isDisabled && { backgroundColor: '#ccc' }
                    ]}
                    disabled={isDisabled}
                    onPress={() => {
                        let optionsTextArray: string[] = [];
                        Object.keys(selectedOption).forEach(groupId => {
                            const group = food.option_groups.find(g => g.id === Number(groupId));
                            selectedOption[Number(groupId)].forEach(optId => {
                                const opt = group?.options.find(o => o.id === optId);
                                if (opt) return optionsTextArray.push(opt.name);
                            });
                        });
                        const optionsText = optionsTextArray.join(', ');

                        onAddToCart(food, quantity, currentPrice, selectedOption, optionsText);
                        onClose();
                    }}
                    >
                        <Text style={styles.addToCartText} >Thêm {formatMoney(totalPrice)}</Text>

                    </TouchableOpacity>

                </View>


            </View>
        </View>

       </Modal>
       </>
    );
}

const styles = StyleSheet.create({
    overlay:{
        flex:1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent:"flex-end"
    },
    bottomSheet:{
        backgroundColor:'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight:"90%",
        padding: 20
    },
    closeBtn:{
        alignSelf:"flex-end",
        marginBottom: 10        
    },
    header:{
        flexDirection:"row",
        marginBottom:20,
        paddingBottom:15,
        borderBottomWidth:1,
        borderColor:'#eee'
    },
    foodImage:{
        width:100,
        height:100,
        borderRadius:10
    },
    foodInfo:{
        flex:1,
        justifyContent:"space-between",
        marginLeft:15
    },
    foodName:{fontSize:18, fontWeight:"bold"},
    foodDesc: { color: '#666', fontSize: 13 },
    foodPrice: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
    groupContainer:{
        marginBottom:20
    },
    groupHeader:{
        backgroundColor:"#f5f5f5",
        padding:10,
        borderRadius:8,
        marginBottom:10
    },
    groupName:{fontSize:15, fontWeight:"bold"},
    groupRule:{fontSize:12, color: '#666', marginTop:2},
    optRow:{flexDirection: "row", justifyContent:"space-between", alignItems:"center", paddingVertical: 12, borderBottomWidth: 1, borderColor:"#f0f0f0"},
    optionTextContainer:{flex:1},
    optionName:{fontSize:15},
    optionPrice:{color:"#666"},
    footer:{
        flexDirection:"row", justifyContent:"space-between", alignItems: "center", borderTopWidth:1, borderColor: "#f0f0f0", paddingTop:15
    },
    quantityControl:{
        flexDirection: "row", alignItems:"center"
    },
    quantityText:{fontSize:18, fontWeight:"bold", marginHorizontal:15},
    addToCartBtn:{backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8},
    addToCartText: { color: 'white', fontWeight: 'bold', fontSize: 16 }



});