import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationAPI } from '../../api/services';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () => {
  const { data } = await notificationAPI.getAll();
  return data;
});

export const markAllRead = createAsyncThunk('notifications/markAll', async () => {
  await notificationAPI.markAllRead();
});

const notifSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0, loading: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchNotifications.fulfilled, (s, a) => {
      s.items = a.payload.notifications;
      s.unreadCount = a.payload.unreadCount;
    })
    .addCase(markAllRead.fulfilled, (s) => {
      s.unreadCount = 0;
      s.items = s.items.map((n) => ({ ...n, isRead: true }));
    });
  },
});

export default notifSlice.reducer;
