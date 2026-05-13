import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type ConfirmTone = 'danger' | 'default';

type DiagConfirmProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  /** When true, the confirm button is styled as a destructive action. */
  tone?: ConfirmTone;
  /** Disables both actions while an async confirm runs. */
  busy?: boolean;
};

export const DiagConfirm = ({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Tühista',
  onCancel,
  onConfirm,
  tone = 'default',
  busy = false,
}: DiagConfirmProps) => {
  const handleConfirm = () => {
    if (busy) return;
    void Promise.resolve(onConfirm());
  };

  const confirmBg = tone === 'danger' ? '#DC2626' : '#7C4DFF';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={busy ? undefined : onCancel}
    >
      <Pressable style={styles.backdrop} onPress={busy ? undefined : onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={busy}
              activeOpacity={0.85}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton, { backgroundColor: confirmBg }]}
              onPress={handleConfirm}
              disabled={busy}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmText}>
                {busy ? 'Palun oota…' : confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  confirmButton: {},
  confirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
