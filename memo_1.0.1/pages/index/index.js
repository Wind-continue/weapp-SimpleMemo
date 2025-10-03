Page({
  data: {
    memos: [],
    newContent: '',
    showInput: false
  },

  onLoad() {
    // 加载备忘录并确保时间戳正确
    const storedMemos = wx.getStorageSync('memos') || [];
    this.setData({ memos: storedMemos });
  },

  toggleInput() {
    this.setData({ 
      showInput: !this.data.showInput,
      newContent: ''
    });
  },

  onInputChange(e) {
    this.setData({ newContent: e.detail.value });
  },

  // 添加备忘录 - 确保生成正确的时间戳
  addMemo() {
    const content = this.data.newContent.trim();
    if (!content) {
      wx.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    // 生成当前时间戳（毫秒）- 这是正确的时间戳格式
    const timestamp = Date.now();
    
    const newMemo = {
      id: timestamp.toString(),
      content: content,
      createTime: timestamp, // 存储正确的时间戳
    };

    const updatedMemos = [newMemo, ...this.data.memos];
    this.setData({ 
      memos: updatedMemos,
      newContent: '',
      showInput: false
    });

    wx.setStorageSync('memos', updatedMemos);
    wx.showToast({ title: '添加成功', icon: 'success' });
  },

  deleteMemo(e) {
    const id = e.currentTarget.dataset.id;
    const updatedMemos = this.data.memos.filter(memo => memo.id !== id);
    this.setData({ memos: updatedMemos });
    wx.setStorageSync('memos', updatedMemos);
  },

})
    