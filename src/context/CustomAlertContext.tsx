import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Modal, View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/Text';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react-native';

type AlertType = 'success' | 'error' | 'info';

interface AlertOptions {
  title: string;
  message: string;
  type?: AlertType;
  onConfirm?: () => void;
}

interface CustomAlertContextData {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const CustomAlertContext = createContext<CustomAlertContextData>({} as CustomAlertContextData);

export function CustomAlertProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AlertOptions>({ title: '', message: '', type: 'info' });

  const showAlert = (opts: AlertOptions) => {
    setOptions({ type: 'info', ...opts });
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
    if (options.onConfirm) {
      options.onConfirm();
    }
  };

  return (
    <CustomAlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={hideAlert}
      >
        <View className="flex-1 bg-black/70 justify-center items-center px-6">
          <View className="bg-surface w-full rounded-[34px] p-6 border border-surfaceHighlight items-center"
            style={{
              shadowColor: options.type === 'error' ? '#ff4d4d' : options.type === 'success' ? '#00e57a' : '#F9D16B',
              shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 4 }
            }}>

            <View className="mb-4 bg-background p-4 rounded-full">
              {options.type === 'error' && <AlertCircle size={40} color="#ff4d4d" />}
              {options.type === 'success' && <CheckCircle2 size={40} color="#00e57a" />}
              {options.type === 'info' && <Info size={40} color="#F9D16B" />}
            </View>

            <Text className="text-white text-2xl font-sansBold mb-2 text-center">
              {options.title}
            </Text>

            <Text className="text-muted text-base font-sans text-center mb-8">
              {options.message}
            </Text>

            <TouchableOpacity
              onPress={hideAlert}
              className="w-full rounded-[24px] py-4 items-center"
              style={{
                backgroundColor: options.type === 'error' ? '#ff4d4d' : options.type === 'success' ? '#00e57a' : '#F9D16B'
              }}
            >
              <Text className="text-[#080808] font-sansBold text-lg uppercase tracking-wider">
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </CustomAlertContext.Provider>
  );
}

export const useCustomAlert = () => useContext(CustomAlertContext);
