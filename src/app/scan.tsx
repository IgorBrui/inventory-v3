import { Alert, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Stack, router } from 'expo-router';
import { FormButton } from '@/components/Form';
import { HeaderButton } from '@/components/HeaderButton';
import { colors } from '@/theme';
import { useScannerViewModel } from '@/viewmodels/useScannerViewModel';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const vm = useScannerViewModel();

  const onScanned = (data: string) => {
    const result = vm.handleScan(data);
    if (!result) return;
    if (result.kind === 'found') {
      router.dismiss();
      router.push(`/container/${result.containerId}`);
      return;
    }
    const message =
      result.kind === 'missing' ? 'Контейнер с этой маркировкой удалён или ещё не создан.' : 'Это не QR-код маркировки контейнера.';
    Alert.alert('Код не распознан', message, [{ text: 'Сканировать снова', onPress: vm.resume }]);
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{ title: 'Сканер', headerLeft: () => <HeaderButton title="Закрыть" onPress={router.back} /> }}
      />
      {!permission ? null : permission.granted ? (
        <>
          <CameraView
            style={StyleSheet.absoluteFill}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={vm.paused ? undefined : (result) => onScanned(result.data)}
          />
          <View style={styles.frame} pointerEvents="none" />
          <Text style={styles.hint}>Наведите камеру на QR-код на коробке</Text>
        </>
      ) : (
        <View style={styles.permission}>
          <Text style={styles.permissionText}>Для сканирования маркировки нужен доступ к камере.</Text>
          <FormButton title="Разрешить доступ" onPress={requestPermission} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
  frame: { width: 240, height: 240, borderWidth: 3, borderColor: 'white', borderRadius: 24 },
  hint: { position: 'absolute', bottom: 80, color: 'white', fontSize: 17, textAlign: 'center' },
  permission: { alignSelf: 'stretch', backgroundColor: colors.background, flex: 1, justifyContent: 'center' },
  permissionText: { color: colors.text, fontSize: 17, textAlign: 'center', margin: 24 },
});
