import { ActionSheetIOS, Alert } from 'react-native';

export function confirmDelete(title: string, message: string): Promise<boolean> {
  return new Promise((resolve) =>
    Alert.alert(title, message, [
      { text: 'Отмена', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Удалить', style: 'destructive', onPress: () => resolve(true) },
    ]),
  );
}

export function promptText(title: string, initial = ''): Promise<string | null> {
  return new Promise((resolve) =>
    Alert.prompt(
      title,
      undefined,
      [
        { text: 'Отмена', style: 'cancel', onPress: () => resolve(null) },
        { text: 'Сохранить', onPress: (value?: string) => resolve(value ?? '') },
      ],
      'plain-text',
      initial,
    ),
  );
}

type Action = { title: string; destructive?: boolean; run: () => void };

export function showActions(title: string, actions: Action[]) {
  const destructiveIndex = actions.findIndex((a) => a.destructive);
  ActionSheetIOS.showActionSheetWithOptions(
    {
      title,
      options: [...actions.map((a) => a.title), 'Отмена'],
      cancelButtonIndex: actions.length,
      destructiveButtonIndex: destructiveIndex >= 0 ? destructiveIndex : undefined,
    },
    (index) => actions[index]?.run(),
  );
}
