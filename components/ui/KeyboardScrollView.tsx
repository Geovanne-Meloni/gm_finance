import React, { PropsWithChildren } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  ViewStyle,
} from "react-native";

type KeyboardScrollViewProps = PropsWithChildren<
  Omit<ScrollViewProps, "contentContainerStyle"> & {
    className?: string;
    contentContainerStyle?: StyleProp<ViewStyle>;
    keyboardVerticalOffset?: number;
  }
>;

const DEFAULT_KEYBOARD_OFFSET = Platform.OS === "ios" ? 96 : 0;
const DEFAULT_CONTENT_CONTAINER_STYLE: ViewStyle = {
  paddingBottom: 120,
};

export function KeyboardScrollView({
  children,
  className,
  contentContainerStyle,
  keyboardVerticalOffset = DEFAULT_KEYBOARD_OFFSET,
  keyboardShouldPersistTaps = "handled",
  keyboardDismissMode = "on-drag",
  ...props
}: KeyboardScrollViewProps) {
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <ScrollView
        className={className}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        keyboardDismissMode={keyboardDismissMode}
        contentContainerStyle={[
          DEFAULT_CONTENT_CONTAINER_STYLE,
          contentContainerStyle,
        ]}
        {...props}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
