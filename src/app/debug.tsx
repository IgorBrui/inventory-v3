import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Card } from '@/components/Card';
import { Row } from '@/components/Row';
import { db } from '@/data/database';
import { colors } from '@/theme';

const tables = ['rooms', 'containers', 'items', 'deleted_remote'] as const;

// Служебный экран: показывает содержимое таблиц SQLite и позволяет выгрузить файл БД
function readTables() {
  return tables.map((name) => ({
    name,
    rows: db.getAllSync<Record<string, unknown>>(`SELECT * FROM ${name}`),
  }));
}

export default function DebugScreen() {
  const [data, setData] = useState(readTables);

  const exportDb = async () => {
    // serializeSync возвращает весь файл базы данных целиком
    const file = new File(Paths.cache, 'inventory.db');
    file.create({ overwrite: true });
    file.write(db.serializeSync());
    await Sharing.shareAsync(file.uri, { mimeType: 'application/x-sqlite3', UTI: 'public.database' });
  };

  return (
    <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="automatic">
      <Card title="Файл базы данных">
        <Text style={styles.path} selectable>
          {db.databasePath}
        </Text>
        <Row icon="📤" title="Выгрузить inventory.db" onPress={exportDb} />
        <Row icon="🔄" title="Обновить" onPress={() => setData(readTables())} />
      </Card>
      {data.map(({ name, rows }) => (
        <Card key={name} title={`${name} (${rows.length})`}>
          {rows.length === 0 ? <Text style={styles.row}>пусто</Text> : null}
          {rows.map((row, i) => (
            <Text key={i} style={styles.row} selectable>
              {JSON.stringify(row)}
            </Text>
          ))}
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: 12 },
  path: { color: colors.secondaryText, fontSize: 12, padding: 12, fontFamily: 'Menlo' },
  row: { color: colors.text, fontSize: 12, paddingHorizontal: 12, paddingVertical: 6, fontFamily: 'Menlo' },
});
