import React from "react";
import { TouchableOpacity, View, Text } from "react-native";

export default function MenuCard({
  Icon,
  iconColor = "#8F9392",
  title,
  description,
  onPress,
  titleColor = "#000",
}) {
  const IconComponent = Icon?.component;
  const iconName = Icon?.name;
  const iconSize = Icon?.size || 24;
  const iconColorFinal = Icon?.color || iconColor;

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
        {IconComponent && (
          <IconComponent name={iconName} size={iconSize} color={iconColorFinal} />
        )}
      </View>
      <Text style={{ fontSize: 20, fontWeight: "700", color: titleColor }}>
        {title}
      </Text>
      <Text style={{ color: "#8F9392", textAlign: "start" }}>{description}</Text>
    </TouchableOpacity>
  );
}
