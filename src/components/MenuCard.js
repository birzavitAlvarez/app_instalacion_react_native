// components/MenuCard.jsx
import React from "react";
import { TouchableOpacity, View, Text } from "react-native";

export default function MenuCard({ Icon, iconName, iconColor = "#8F9392", title, description, onPress, titleColor = "#000" }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 15,
        flex: 1,
        alignItems: "start",
      }}
    >
      <View style={{ paddingVertical: 10 }}>
        {Icon && <Icon name={iconName} size={24} color={iconColor} />}
      </View>
      <Text style={{ fontSize: 20, fontWeight: "700", color: titleColor }}>
        {title}
      </Text>
      <Text style={{ color: "#8F9392", textAlign: "start" }}>{description}</Text>
    </TouchableOpacity>
  );
}
