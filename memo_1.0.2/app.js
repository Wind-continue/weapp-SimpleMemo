App({
  onLaunch() {
    // 初始化本地存储
    if (!wx.getStorageSync('memos')) {
      wx.setStorageSync('memos', []);
    }
  },
  
  // 获取所有备忘录
  getMemos() {
    return wx.getStorageSync('memos') || [];
  },
  
  // 添加新备忘录
  addMemo(content) {
    const memos = this.getMemos();
    const newMemo = {
      id: Date.now().toString(), // 使用时间戳作为唯一ID
      content: content,
      createTime: Date.now()
    };
    
    memos.unshift(newMemo); // 添加到数组开头
    wx.setStorageSync('memos', memos);
    return newMemo;
  },
  
  // 删除备忘录
  deleteMemo(id) {
    let memos = this.getMemos();
    memos = memos.filter(memo => memo.id !== id);
    wx.setStorageSync('memos', memos);
    return memos;
  }
})
