import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@notes_app';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState(''); // اصلاح: inputs → input
  const [editingId, setEditingId] = useState(null); // اصلاح: Editting → Editing

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) setNotes(JSON.parse(data));
    } catch (error) {
      Alert.alert("خطا", "خواندن یادداشت‌ها با مشکل مواجه شد");
    }
  };

  const saveNotes = async (newNotes) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
      setNotes(newNotes);
    } catch (error) {
      Alert.alert("خطا", "خطا در ذخیره سازی یادداشت رخ داد");
    }
  };

  const addOrUpdateNote = () => {
    if (!input.trim()) return; // اصلاح: input

    if (editingId) { // اصلاح: edit → editingId
      const updated = notes.map(note =>
        note.id === editingId ? { ...note, text: input } : note
      );
      saveNotes(updated);
      setEditingId(null);
    } else {
      const newNote = {
        id: Date.now().toString(),
        text: input,
        date: new Date().toLocaleDateString('fa-IR'),
      };
      saveNotes([newNote, ...notes]);
    }
    setInput('');
    Keyboard.dismiss();
  };

  const deleteNote = (id) => {
    Alert.alert("حذف", "آیا مطمئن هستید؟", [
      { text: 'خیر' },
      {
        text: 'بله',
        onPress: async () => {
          const filtered = notes.filter(n => n.id !== id);
          saveNotes(filtered); // فقط یک خط!
        }
      }
    ]);
  };

  const startEdit = (note) => {
    setInput(note.text);
    setEditingId(note.id);
  };

  const cancelEdit = () => {
    setInput('');
    setEditingId(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>یادداشت‌های من</Text>

      {/* ورودی */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="یادداشت جدید..."
          value={input} // اصلاح: inputs → input
          onChangeText={setInput} // اصلاح
          multiline
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.addButton} onPress={addOrUpdateNote}>
            <Text style={styles.buttonText}>
              {editingId ? 'به‌روزرسانی' : 'افزودن'}
            </Text>
          </TouchableOpacity>
          {editingId && (
            <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
              <Text style={styles.buttonText}>لغو</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* لیست یادداشت‌ها */}
      <FlatList
        data={notes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.noteItem}>
            <View style={styles.noteContent}>
              <Text style={styles.noteText}>{item.text}</Text>
              <Text style={styles.noteDate}>{item.date}</Text>
            </View>
            <View style={styles.noteActions}>
              <TouchableOpacity onPress={() => startEdit(item)} style={styles.editBtn}>
                <Text style={styles.actionText}>ویرایش</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteNote(item.id)} style={styles.deleteBtn}>
                <Text style={styles.actionText}>حذف</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>هیچ یادداشتی وجود ندارد</Text>
        }
      />
    </SafeAreaView>
  );
}

// استایل‌ها (همان قبلی)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#2c3e50',
  },
  inputContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  addButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  noteItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  noteContent: { flex: 1 },
  noteText: { fontSize: 16, color: '#2c3e50', marginBottom: 5 },
  noteDate: { fontSize: 12, color: '#7f8c8d' },
  noteActions: { flexDirection: 'row', alignItems: 'center' },
  editBtn: { marginRight: 15 },
  deleteBtn: { marginRight: 5 },
  actionText: { color: '#3498db', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#95a5a6', fontSize: 16, marginTop: 50 },
});